const types = require('ethernaut-common/src/validation/types')
const output = require('ethernaut-common/src/ui/output')
const axios = require('axios')

const FORUM_URL = 'https://gov.optimism.io'

// Function to build search URL
const buildSearchUrl = (searchTerm, user, category, before, after, order) => {
  if (!searchTerm) return null

  // weird querystring accepted by discourse
  const params = []
  if (user) params.push(`%40${user}`)
  if (category) params.push(`%23${category}`)
  if (before) params.push(`before%3A${before}`)
  if (after) params.push(`after%3A${after}`)
  if (order) params.push(`order%3A${order}`)

  const queryString = params.length > 0 ? `%20${params.join('%20')}` : ''
  return `${FORUM_URL}/search.json?q=${searchTerm}${queryString}`
}

const fetchWithRetries = async (url, retries = 3, timeout = 60000) => {
  try {
    const response = await axios.get(url, {
      timeout,
      headers: {
        // just in case of weird errors, as we are not a browser
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        Accept: 'application/json',
      },
    })
    return response.data
  } catch (error) {
    if (
      retries > 0 &&
      (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT')
    ) {
      await new Promise((resolve) => setTimeout(resolve, 2000))
      return fetchWithRetries(url, retries - 1, timeout * 1.5)
    }
    throw error
  }
}

const wrapText = (text, width) => {
  const words = text.split(' ')
  let lines = []
  let currentLine = ''

  words.forEach((word) => {
    if ((currentLine + word).length <= width) {
      currentLine += (currentLine ? ' ' : '') + word
    } else {
      lines.push(currentLine)
      currentLine = word
    }
  })
  if (currentLine) lines.push(currentLine)
  return lines
}

const displayPost = (post) => {
  const master = {
    id: post.id,
    name: post.name,
    username: post.username,
    created_at: post.created_at,
    likes: post.like_count,
    post_number: post.post_number,
    topic_id: post.topic_id,
  }

  console.table(master)

  const terminalWidth = process.stdout.columns || 80
  console.log('─'.repeat(terminalWidth))
  wrapText(post.blurb, terminalWidth - 4).forEach((line) => {
    console.log('  ' + line)
  })
  console.log('─'.repeat(terminalWidth))
  console.log('')
}

const searchForum = async (
  searchTerm,
  user,
  category,
  before,
  after,
  order,
) => {
  try {
    const urlSearch = buildSearchUrl(
      searchTerm,
      user,
      category,
      before,
      after,
      order,
    )
    if (!urlSearch) return

    const data = await fetchWithRetries(urlSearch)

    if (!data.posts || data.posts.length === 0) {
      console.log('No results found')
      return
    }

    const maxResults = 100
    const postsToShow = data.posts.slice(0, maxResults)

    if (data.posts.length > maxResults) {
      console.log(`Showing ${maxResults} of ${data.posts.length} results`)
    }

    postsToShow.forEach(displayPost)
  } catch (err) {
    console.error(err.message)
    return output.errorBox(err)
  }
}

require('../scopes/optiforum')
  .task('search', 'Searches for posts on Optimism Governance Forum')
  .addParam(
    'searchTerm',
    'This is just a string. Usually it would be the first item in the query.',
    undefined,
    types.string,
    false,
  )
  .addParam(
    'user',
    'Use the @ followed by the username to specify posts by this user.',
    undefined,
    types.string,
    false,
  )
  .addParam(
    'category',
    'Use the # followed by the category slug to search within this category.',
    undefined,
    types.string,
    false,
  )
  .addParam('before', 'use format yyyy-mm-dd', undefined, types.string, false)
  .addParam('after', 'use format yyyy-mm-dd', undefined, types.string, false)
  .addParam(
    'order',
    'options:latest, likes, views, latest_topic',
    undefined,
    types.string,
    false,
  )
  .setAction(async (params) => {
    try {
      await searchForum(
        params.searchTerm,
        params.user,
        params.category,
        params.before,
        params.after,
        params.order,
      )
    } catch (err) {
      console.error(err.message)
      return output.errorBox(err)
    }
  })
