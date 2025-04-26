const fs = require('fs')
const path = require('path')
const openai = require('../../openai')
const VECTOR_STORE_ID = 'OP_DOCS_7'

let documentKeywords = {}
try {
  documentKeywords = require('../docs/kb-files/output/optimism/docs/keywords.json')
} catch (err) {
  // expected exception on 1st run
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

// New vector store implementation 🔴
async function buildDocsDocsWithVector(query) {
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
        '../docs/kb-files/output/optimism/docs/chapters',
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
  }
}

async function buildDocsDocs(query) {
  return await buildDocsDocsWithVector(query)
}

module.exports = buildDocsDocs
