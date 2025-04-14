const assert = require('assert')
const Ballots = require('../../../src/internal/agora/Ballots')

describe('Ballots Module', function () {
  let ballots, mockAgora, axiosInstance

  beforeEach(function () {
    // Create a fake axios instance that returns a sample ballot or submission response.
    axiosInstance = {
      get: async (url) => {
        if (url === '/retrofunding/rounds/1/ballots/0xabc') {
          return {
            data: {
              address: '0xabc',
              round_id: 1,
              status: 'NOT STARTED',
              budget: 100,
              created_at: '2025-04-08T19:21:33.176Z',
              updated_at: '2025-04-08T19:21:33.176Z',
              published_at: '2025-04-08T19:21:33.176Z',
              category_allocations: [
                {
                  category_slug: 'ETHEREUM_CORE_CONTRIBUTIONS',
                  allocation: '50',
                  locked: true,
                },
              ],
              projects_allocations: [
                {
                  project_id: 'proj1',
                  name: 'Project 1',
                  image: 'image.png',
                  position: 0,
                  allocation: 20,
                  impact: 5,
                },
              ],
              projects_to_be_evaluated: ['proj1', 'proj2'],
              payload_for_signature: {
                budget: 100,
                category_allocation: [{ key: 'value' }],
                projects_allocation: [{ key: 'value' }],
              },
            },
          }
        }
      },
      post: async (url, payload) => {
        if (url === '/retrofunding/rounds/1/ballots/0xabc/submit') {
          return { data: { success: true, payload } }
        }
      },
    }

    // Create a minimal mock agora instance
    mockAgora = {
      createAxiosInstance: () => axiosInstance,
      handleError: (error) => {
        throw error
      },
    }
    ballots = new Ballots(mockAgora)
  })

  it('should return ballot data from getBallot', async function () {
    const result = await ballots.getBallot(1, '0xabc')
    assert.strictEqual(result.address, '0xabc')
    assert.strictEqual(result.round_id, 1)
    assert.strictEqual(result.status, 'NOT STARTED')
  })

  it('should return submission result from submitBallot', async function () {
    const payload = {
      address: '0xabc',
      ballot_content: {
        allocations: [{}],
        os_only: true,
        os_multiplier: 0,
      },
      signature: 'signedPayload',
    }
    const result = await ballots.submitBallot(1, '0xabc', payload)
    assert.deepEqual(result, { success: true, payload })
  })

  it('should propagate error on getBallot failure', async function () {
    axiosInstance.get = async () => {
      throw new Error('getBallot error')
    }
    try {
      await ballots.getBallot(1, '0xabc')
      assert.fail('Expected error was not thrown')
    } catch (err) {
      assert.strictEqual(err.message, 'getBallot error')
    }
  })

  it('should propagate error on submitBallot failure', async function () {
    axiosInstance.post = async () => {
      throw new Error('submitBallot error')
    }
    try {
      await ballots.submitBallot(1, '0xabc', {})
      assert.fail('Expected error was not thrown')
    } catch (err) {
      assert.strictEqual(err.message, 'submitBallot error')
    }
  })
})
