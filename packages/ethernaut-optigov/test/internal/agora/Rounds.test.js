const assert = require('assert')
const Rounds = require('../../../src/internal/agora/Rounds')

describe('Rounds Module', function () {
  let roundsModule, mockAgora, axiosInstance

  beforeEach(function () {
    // Setup a mock agora with a fake axios instance
    axiosInstance = {
      get: async (url) => {
        // Response for getRounds
        if (url === '/retrofunding/rounds') {
          return {
            data: [
              { roundId: 1, info: 'Round 1' },
              { roundId: 2, info: 'Round 2' },
              { roundId: 3, info: 'Round 3' },
            ],
          }
        }
        // Response for getRoundById (e.g. '/retrofunding/rounds/2')
        if (url.startsWith('/retrofunding/rounds/')) {
          const id = parseInt(url.split('/').pop(), 10)
          return { data: { roundId: id, info: `Round ${id}` } }
        }
      },
    }
    mockAgora = {
      createAxiosInstance: () => axiosInstance,
      // For failure tests, handleError rethrows the error.
      handleError: (error) => {
        throw error
      },
    }
    roundsModule = new Rounds(mockAgora)
  })

  describe('getRounds', function () {
    it('should return rounds data', async function () {
      const result = await roundsModule.getRounds({ limit: 5, offset: 0 })
      assert.deepEqual(result, [
        { roundId: 1, info: 'Round 1' },
        { roundId: 2, info: 'Round 2' },
        { roundId: 3, info: 'Round 3' },
      ])
    })

    it('should propagate error when getRounds fails', async function () {
      axiosInstance.get = async () => {
        throw { message: 'rounds error' }
      }
      mockAgora.createAxiosInstance = () => axiosInstance

      try {
        await roundsModule.getRounds({ limit: 5, offset: 0 })
        assert.fail('Expected error was not thrown')
      } catch (err) {
        assert.strictEqual(err.message, 'rounds error')
      }
    })
  })

  describe('getRoundById', function () {
    it('should return round details for a given roundId', async function () {
      const result = await roundsModule.getRoundById(2)
      assert.deepEqual(result, { roundId: 2, info: 'Round 2' })
    })

    it('should propagate error when getRoundById fails', async function () {
      axiosInstance.get = async () => {
        throw { message: 'round not found' }
      }
      mockAgora.createAxiosInstance = () => axiosInstance

      try {
        await roundsModule.getRoundById(2)
        assert.fail('Expected error was not thrown')
      } catch (err) {
        assert.strictEqual(err.message, 'round not found')
      }
    })
  })

  describe('getLatestRound', function () {
    it('should return the latest round (hardcoded to 6) when rounds exist', async function () {
      const result = await roundsModule.getLatestRound()
      // as per implementation, getLatestRound() is hardcoded to return 6
      assert.strictEqual(result, 6)
    })

    it('should return 0 if no rounds are returned', async function () {
      axiosInstance.get = async () => {
        return { data: [] }
      }
      mockAgora.createAxiosInstance = () => axiosInstance

      const result = await roundsModule.getLatestRound()
      assert.strictEqual(result, 0)
    })

    it('should propagate error when getLatestRound fails', async function () {
      // Simulate error in getRounds called by getLatestRound
      axiosInstance.get = async () => {
        throw { message: 'latest round error' }
      }
      mockAgora.createAxiosInstance = () => axiosInstance

      try {
        await roundsModule.getLatestRound()
        assert.fail('Expected error was not thrown')
      } catch (err) {
        assert.strictEqual(err.message, 'latest round error')
      }
    })
  })
})
