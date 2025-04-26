const fs = require('fs')
const path = require('path')
const openai = require('../../openai')
const USE_VECTOR_STORE = true // my flag to test both solutions
const VECTOR_STORE_ID = 'OP_HUB_7'

function extractKeywords(query) {
  // TBD DEPRECATED
  // Convert query to lowercase and split into words
  const words = query.toLowerCase().split(/\s+/)

  // Remove common words and short words
  const commonWords = new Set([
    'the',
    'a',
    'an',
    'and',
    'or',
    'but',
    'in',
    'on',
    'at',
    'to',
    'for',
    'of',
    'with',
    'by',
  ])
  return words.filter((word) => word.length > 2 && !commonWords.has(word))
}

function calculateRelevance(query, keywords) {
  const queryKeywords = extractKeywords(query)
  let relevance = 0

  for (const keyword of queryKeywords) {
    if (keywords.some((k) => k.includes(keyword))) {
      relevance += 1
    }
  }

  return relevance
}

// Original keyword-based implementation
// DEPRECATED
// Keywords associated with each document
let documentKeywords = {}
try {
  documentKeywords = require('../docs/kb-files/output/optimism/community-hub/keywords.json')
} catch (err) {
  // expected exception on 1st run
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

function buildHubDocsWithKeywords(query) {
  const docs = []
  const docsDir = path.join(
    __dirname,
    '../docs/kb-files/output/optimism/community-hub/chapters',
  )

  // Si no hay keywords, devolver array vacío
  if (Object.keys(documentKeywords).length === 0) {
    return docs
  }

  // Calculate relevance for each document
  const relevanceScores = Object.entries(documentKeywords).map(
    ([file, keywords]) => ({
      file,
      relevance: calculateRelevance(query, keywords),
    }),
  )

  // Sort by relevance and take top 5 most relevant documents
  const topDocs = relevanceScores
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, 5)
    .map((item) => item.file)

  // Read only the most relevant documents
  topDocs.forEach((file) => {
    const content = fs.readFileSync(path.join(docsDir, file), 'utf8')
    docs.push(content)
  })

  return docs
}

// New vector store implementation 🔴
async function buildHubDocsWithVector(query) {
  try {
    let vectorStoreId

    try {
      const vectorStores = await openai().vectorStores.list()
      const matchingVectorStore = vectorStores.data.find(
        (store) => store.name === VECTOR_STORE_ID,
      )

      if (matchingVectorStore) {
        vectorStoreId = matchingVectorStore.id
      } else {
        throw new Error(
          'No knowledge base found, please wait while building...',
        )
      }
    } catch (error) {
      console.log('No knowledge base found, please wait while building...')

      const docsDir = path.join(
        __dirname,
        '../docs/kb-files/output/optimism/community-hub/chapters',
      )

      const files =
        Object.keys(documentKeywords).length > 0
          ? Object.keys(documentKeywords)
          : fs.readdirSync(docsDir).filter((file) => file.endsWith('.md'))
      const batchSize = 5 // Upload files in batches to avoid rate limits
      const allFileIds = []

      for (let i = 0; i < files.length; i += batchSize) {
        const batch = files.slice(i, i + batchSize)
        // console.log(
        //   `Processing batch ${i / batchSize + 1} of ${Math.ceil(files.length / batchSize)}`,
        // )

        const fileIds = await Promise.all(
          batch.map(async (file) => {
            const filePath = path.join(docsDir, file)
            try {
              const fileStream = fs.createReadStream(filePath)
              const response = await openai().files.create({
                file: fileStream,
                purpose: 'assistants',
              })
              return response.id
            } catch (error) {
              console.error(`Error uploading file ${file}:`, error)
              return null
            }
          }),
        )

        // Filter out any failed uploads and add to all file IDs
        const validFileIds = fileIds.filter((id) => id !== null)
        allFileIds.push(...validFileIds)
        // console.log(`Valid file IDs in this batch: ${validFileIds.length}`)
      }

      //  Create the vector store
      const vectorStore = await openai().vectorStores.create({
        name: VECTOR_STORE_ID,
      })
      vectorStoreId = vectorStore.id

      // Add file IDs
      if (allFileIds.length > 0) {
        await openai().vectorStores.fileBatches.createAndPoll(vectorStoreId, {
          file_ids: allFileIds,
        })
      }
    }

    // do the search
    const results = await openai().vectorStores.search(vectorStoreId, {
      query,
      max_num_results: 5,
    })
    const textSources = results.data.map((result) =>
      result.content.map((c) => c.text),
    )

    return textSources
  } catch (error) {
    console.error(
      'Error using vector store, falling back to keyword-based approach:',
      error,
    )
    // Fallback to keyword-based approach if vector store fails
    // return buildHubDocsWithKeywords(query) // FIXME
  }
}

async function buildHubDocs(query) {
  if (USE_VECTOR_STORE) {
    return await buildHubDocsWithVector(query)
  } else {
    return buildHubDocsWithKeywords(query)
  }
}

module.exports = buildHubDocs
