const fs = require('fs')
const path = require('path')
const openai = require('../../openai')

const USE_VECTOR_STORE = false // my flag to test both solutions

// Keywords associated with each document
const documentKeywords = { 'extract from local docs': [] } // FIXME - remove

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
function buildHubDocsWithKeywords(query) {
  const docs = []
  const docsDir = path.join(__dirname, '../docs/op-community-hub')

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

// New vector store implementation
async function buildHubDocsWithVector(query) {
  try {
    // Get or create vector store
    let vectorStore
    const vectorStores = await openai().beta.vectorStores.list()
    const existingStore = vectorStores.data.find(
      (store) => store.name === 'Optimism Documentation',
    )

    if (existingStore) {
      vectorStore = existingStore
    } else {
      // Create new vector store with all documentation files
      const docsDir = path.join(__dirname, '../docs/op-community-hub')
      const files = Object.keys(documentKeywords)

      // Upload files to OpenAI
      const fileIds = await Promise.all(
        files.map(async (file) => {
          const content = fs.readFileSync(path.join(docsDir, file), 'utf8')
          const response = await openai().files.create({
            file: Buffer.from(content),
            purpose: 'vector-store',
          })
          return response.id
        }),
      )

      vectorStore = await openai().beta.vectorStores.create({
        name: 'Optimism Documentation',
        file_ids: fileIds,
      })
    }

    const results = await openai().beta.vectorStores.search({
      vector_store_id: vectorStore.id,
      query: query,
      limit: 5,
    })

    return results.documents.map((doc) => doc.content)
  } catch (error) {
    console.error('Error using vector store:', error)
    // Fallback to keyword-based approach if vector store fails
    return buildHubDocsWithKeywords(query)
  }
}

// Main function that chooses between implementations
async function buildHubDocs(query) {
  if (USE_VECTOR_STORE) {
    return await buildHubDocsWithVector(query)
  } else {
    return buildHubDocsWithKeywords(query)
  }
}

module.exports = buildHubDocs
