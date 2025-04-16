const assert = require('assert')
const hre = require('hardhat')

describe('search task', function () {
  let originalFetch

  beforeEach(function () {
    // Save original fetch
    originalFetch = global.fetch
  })

  afterEach(function () {
    // Restore original fetch
    global.fetch = originalFetch
  })

  it('should construct the correct search URL with all parameters', async function () {
    // Mock fetch to return a simple response
    global.fetch = async (_url) => {
      return {
        json: async () => ({ posts: [] }),
      }
    }

    const searchParams = {
      searchTerm: 'test',
      user: 'testuser',
      category: 'general',
      before: '2024-03-20',
      after: '2024-03-01',
      order: 'latest',
    }

    await hre.run({ scope: 'optiforum', task: 'search' }, searchParams)

    // The URL should be constructed correctly with all parameters
    const expectedUrl =
      'https://gov.optimism.io/search.json?q=test%20%40testuser%20%23general%20before%3A2024-03-20%20after%3A2024-03-01%20order%3Alatest'
    assert.strictEqual(global.fetch.mock.calls[0][0], expectedUrl)
  })

  it('should handle search with minimal parameters', async function () {
    // Mock fetch to return a simple response
    global.fetch = async (_url) => {
      return {
        json: async () => ({ posts: [] }),
      }
    }

    const searchParams = {
      searchTerm: 'test',
    }

    await hre.run({ scope: 'optiforum', task: 'search' }, searchParams)

    // The URL should be constructed with just the search term
    const expectedUrl = 'https://gov.optimism.io/search.json?q=test'
    assert.strictEqual(global.fetch.mock.calls[0][0], expectedUrl)
  })

  it('should handle API errors gracefully', async function () {
    // Mock fetch to throw an error
    global.fetch = async () => {
      throw new Error('API Error')
    }

    const searchParams = {
      searchTerm: 'test',
    }

    const result = await hre.run(
      { scope: 'optiforum', task: 'search' },
      searchParams,
    )

    // Should return an error message
    assert(result.includes('Error'))
  })
})
