const assert = require('assert')
const Delegates = require('../../../src/internal/agora/Delegates')

describe('Delegates Module', function () {
  let delegates, mockAgora, axiosInstance

  beforeEach(function () {
    // Setup a mock agora with a fake axios instance
    axiosInstance = {
      get: async (url) => {
        // Response for getDelegates
        if (url === '/delegates') {
          return {
            data: {
              data: [
                {
                  address: '0x123',
                  votingPower: { total: 100 },
                  statement: {
                    payload: {
                      twitter: '@delegate',
                      discord: 'delegate#0001',
                      delegateStatement: 'x'.repeat(150),
                    },
                  },
                },
              ],
            },
          }
        }
        // Response for getDelegateById (e.g. '/delegates/0xabc')
        if (/^\/delegates\/[^/]+$/.test(url)) {
          // Return a detailed delegate object
          return {
            data: {
              address: '0xabc',
              votingPower: { advanced: 'adv', direct: 'dir', total: 200 },
              votingPowerRelativeToVotableSupply: 0.5,
              votingPowerRelativeToQuorum: 0.6,
              proposalsCreated: ['prop1'],
              proposalsVotedOn: ['prop2'],
              votedFor: ['vote1'],
              votedAgainst: ['vote2'],
              votedAbstain: ['vote3'],
              votingParticipation: 0.7,
              lastTenProps: ['p1', 'p2'],
              numOfDelegators: 3,
            },
          }
        }
        // Response for getDelegateVotes (e.g. '/delegates/0xabc/votes')
        if (url.endsWith('/votes')) {
          return {
            data: {
              data: [
                {
                  transactionHash: '0xhash',
                  proposalId: 42,
                  address: '0xdelegate',
                  support: true,
                  reason: 'reason',
                  weight: 50,
                  proposalValue: 'value',
                  proposalTitle: 'Title',
                  proposalType: 'type',
                  timestamp: 123456789,
                },
              ],
            },
          }
        }
        // Response for getDelegateDelegators (e.g. '/delegates/0xabc/delegators')
        if (url.endsWith('/delegators')) {
          return {
            data: {
              data: [
                {
                  from: '0xfrom',
                  allowance: 1000,
                  timestamp: 123456789,
                  type: 'type1',
                  amount: 10,
                },
              ],
            },
          }
        }
      },
    }
    mockAgora = {
      createAxiosInstance: () => axiosInstance,
      // For failure tests: handleError simply rethrows the error.
      handleError: (error) => {
        throw error
      },
    }
    delegates = new Delegates(mockAgora)
  })

  describe('getDelegates', function () {
    it('should return a mapped list of delegates', async function () {
      const result = await delegates.getDelegates({
        limit: 5,
        offset: 0,
        sort: 'asc',
      })

      assert.deepEqual(result, [
        {
          address: '0x123',
          votingPower: 100,
          twitter: '@delegate',
          discord: 'delegate#0001',
          delegateStatement: 'x'.repeat(100),
        },
      ])
    })

    it('should propagate error when getDelegates fails', async function () {
      axiosInstance.get = async () => {
        throw { message: 'delegates error' }
      }
      mockAgora.createAxiosInstance = () => axiosInstance

      try {
        await delegates.getDelegates({ limit: 5, offset: 0 })
        assert.fail('Expected error was not thrown')
      } catch (err) {
        assert.strictEqual(err.message, 'delegates error')
      }
    })
  })

  describe('getDelegateById', function () {
    it('should return delegate details for a given id', async function () {
      const result = await delegates.getDelegateById('0xabc')
      assert.deepEqual(result, {
        address: '0xabc',
        votingPower: {
          advanced: 'adv',
          direct: 'dir',
          total: 200,
        },
        votingPowerRelativeToVotableSupply: 0.5,
        votingPowerRelativeToQuorum: 0.6,
        proposalsCreated: ['prop1'],
        proposalsVotedOn: ['prop2'],
        votedFor: ['vote1'],
        votedAgainst: ['vote2'],
        votedAbstain: ['vote3'],
        votingParticipation: 0.7,
        lastTenProps: ['p1', 'p2'],
        numOfDelegators: 3,
      })
    })

    it('should propagate error when getDelegateById fails', async function () {
      axiosInstance.get = async () => {
        throw { message: 'delegate error' }
      }
      mockAgora.createAxiosInstance = () => axiosInstance

      try {
        await delegates.getDelegateById('0xabc')
        assert.fail('Expected error was not thrown')
      } catch (err) {
        assert.strictEqual(err.message, 'delegate error')
      }
    })
  })

  describe('getDelegateVotes', function () {
    it('should return votes for a given delegate', async function () {
      const result = await delegates.getDelegateVotes({
        addressOrEnsName: '0xabc',
        limit: 5,
        offset: 0,
        sort: 'desc',
      })
      assert.deepEqual(result, [
        {
          transactionHash: '0xhash',
          proposalId: 42,
          address: '0xdelegate',
          support: true,
          reason: 'reason',
          weight: 50,
          proposalValue: 'value',
          proposalTitle: 'Title',
          proposalType: 'type',
          timestamp: 123456789,
        },
      ])
    })

    it('should propagate error when getDelegateVotes fails', async function () {
      axiosInstance.get = async () => {
        throw { message: 'votes error' }
      }
      mockAgora.createAxiosInstance = () => axiosInstance

      try {
        await delegates.getDelegateVotes({
          addressOrEnsName: '0xabc',
          limit: 5,
          offset: 0,
        })
        assert.fail('Expected error was not thrown')
      } catch (err) {
        assert.strictEqual(err.message, 'votes error')
      }
    })
  })

  describe('getDelegateDelegators', function () {
    it('should return delegators for a given delegate', async function () {
      const result = await delegates.getDelegateDelegators({
        addressOrEnsName: '0xabc',
        limit: 5,
        offset: 0,
        sort: 'asc',
      })
      assert.deepEqual(result, [
        {
          from: '0xfrom',
          allowance: 1000,
          timestamp: 123456789,
          type: 'type1',
          amount: 10,
        },
      ])
    })

    it('should propagate error when getDelegateDelegators fails', async function () {
      axiosInstance.get = async () => {
        throw { message: 'delegators error' }
      }
      mockAgora.createAxiosInstance = () => axiosInstance

      try {
        await delegates.getDelegateDelegators({
          addressOrEnsName: '0xabc',
          limit: 5,
          offset: 0,
        })
        assert.fail('Expected error was not thrown')
      } catch (err) {
        assert.strictEqual(err.message, 'delegators error')
      }
    })
  })
})
