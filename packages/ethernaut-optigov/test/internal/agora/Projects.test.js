// filepath: /Users/luisvidela/Development/EthernautCLI/ethernaut-cli/test/internal/agora/Projects.test.js
const assert = require('assert')
const Projects = require('../../../src/internal/agora/Projects')

describe('Projects Module', function () {
  let projects, mockAgora, axiosInstance

  beforeEach(function () {
    // Setup a mock agora with a fake axios instance
    axiosInstance = {
      get: async (url, { params } = {}) => {
        if (url === '/projects') {
          return { data: { data: { projects: ['project1'], params } } }
        }
        if (url.startsWith('/retrofunding/rounds/')) {
          return { data: { data: { projects: ['roundProject'] } } }
        }
      },
    }
    mockAgora = {
      createAxiosInstance: () => axiosInstance,
      handleError: (error) => {
        throw error
      },
    }
    projects = new Projects(mockAgora)
  })

  it('should return project details from getProjects', async function () {
    const result = await projects.getProjects({ limit: 5, offset: 0 })
    assert.deepEqual(result, {
      projects: ['project1'],
      params: { limit: 5, offset: 0 },
    })
  })

  it('should return round projects from getRoundProjects', async function () {
    const result = await projects.getRoundProjects({
      roundId: 1,
      limit: 5,
      offset: 0,
    })
    assert.deepEqual(result, { projects: ['roundProject'] })
  })

  it('should return the latest round as 5', async function () {
    const latestRound = await projects.getLatestRound()
    assert.equal(latestRound, 5)
  })
})
