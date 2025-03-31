const assert = require('assert')
const Proposals = require('../../../src/internal/agora/Proposals')

describe('Proposals Module', function () {
  let proposals, mockAgora, axiosInstance

  beforeEach(function () {
    // Setup a mock agora with a fake axios instance
    axiosInstance = {
      get: async (url, { params } = {}) => {
        if (url === '/proposals') {
          return { data: { data: { proposals: ['proposal1'], params } } }
        }
        if (url.startsWith('/proposals/') && !url.endsWith('/votes')) {
          // Simulate getProposalById, e.g. '/proposals/42'
          const proposalId = url.split('/')[2]
          return {
            data: {
              proposalId: Number(proposalId),
              title: `Proposal ${proposalId}`,
            },
          }
        }
        if (url.endsWith('/votes')) {
          return { data: { data: { votes: ['vote1'], params } } }
        }
      },
    }
    mockAgora = {
      createAxiosInstance: () => axiosInstance,
      // For failure tests, handleError just rethrows the error.
      handleError: (error) => {
        throw error
      },
    }
    proposals = new Proposals(mockAgora)
  })

  it('should return proposals list from getProposals', async function () {
    const result = await proposals.getProposals({ limit: 5, offset: 0 })
    assert.deepEqual(result, {
      proposals: ['proposal1'],
      params: { limit: 5, offset: 0 },
    })
  })

  it('should return proposal details from getProposalById', async function () {
    const result = await proposals.getProposalById(42)
    assert.deepEqual(result, { proposalId: 42, title: 'Proposal 42' })
  })

  it('should return proposal votes from getProposalVotes', async function () {
    const result = await proposals.getProposalVotes({
      proposalId: 42,
      limit: 5,
      offset: 0,
    })
    assert.deepEqual(result, {
      votes: ['vote1'],
      params: { limit: 5, offset: 0 },
    })
  })

  it('should propagate error when getProposals fails', async function () {
    // Override axiosInstance.get to throw an error.
    axiosInstance.get = async () => {
      throw { message: 'proposals error' }
    }
    mockAgora.createAxiosInstance = () => axiosInstance

    try {
      await proposals.getProposals({ limit: 5, offset: 0 })
      assert.fail('Expected error was not thrown')
    } catch (err) {
      assert.strictEqual(err.message, 'proposals error')
    }
  })

  it('should propagate error when getProposalById fails', async function () {
    // Override axiosInstance.get to throw an error.
    axiosInstance.get = async () => {
      throw { message: 'proposal error' }
    }
    mockAgora.createAxiosInstance = () => axiosInstance

    try {
      await proposals.getProposalById(42)
      assert.fail('Expected error was not thrown')
    } catch (err) {
      assert.strictEqual(err.message, 'proposal error')
    }
  })

  it('should propagate error when getProposalVotes fails', async function () {
    // Override axiosInstance.get to throw an error.
    axiosInstance.get = async () => {
      throw { message: 'votes error' }
    }
    mockAgora.createAxiosInstance = () => axiosInstance

    try {
      await proposals.getProposalVotes({ proposalId: 42, limit: 5, offset: 0 })
      assert.fail('Expected error was not thrown')
    } catch (err) {
      assert.strictEqual(err.message, 'votes error')
    }
  })
})
