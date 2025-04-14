const assert = require('assert')
const Ballots = require('../../src/internal/agora/Ballots')
const hre = require('hardhat')
const output = require('ethernaut-common/src/ui/output')

describe('ballots task', function () {
  let originalGetBallot,
    originalSubmitBallot,
    originalOutputResultBox,
    originalOutputErrorBox,
    originalGetSigners

  beforeEach(function () {
    // Save original Ballots methods
    originalGetBallot = Ballots.prototype.getBallot
    originalSubmitBallot = Ballots.prototype.submitBallot

    Ballots.prototype.getBallot = async function (roundId, addressOrEnsName) {
      return {
        address: addressOrEnsName,
        round_id: roundId,
        status: 'NOT STARTED',
        budget: 100,
        created_at: '2025-04-08T19:21:33.176Z',
        updated_at: '2025-04-08T19:21:33.176Z',
        published_at: '2025-04-08T19:21:33.176Z',
        category_allocations: [],
        projects_allocations: [],
        projects_to_be_evaluated: [],
        payload_for_signature: {},
      }
    }

    Ballots.prototype.submitBallot = async function (
      _roundId,
      _addressOrEnsName,
      payload,
    ) {
      return { success: true, payload }
    }

    // Save original output methods
    originalOutputResultBox = output.resultBox
    originalOutputErrorBox = output.errorBox

    output.resultBox = (content, title) => `${title}: ${content}`
    output.errorBox = (error) => `Error: ${error.message}`

    // Mock hre.ethers.getSigners to return a fake signer with address 0xabc
    originalGetSigners = hre.ethers.getSigners
    hre.ethers.getSigners = async function () {
      return [
        {
          address: '0xabc',
          signMessage: async (message) => 'signed:' + message,
        },
      ]
    }
  })

  afterEach(function () {
    Ballots.prototype.getBallot = originalGetBallot
    Ballots.prototype.submitBallot = originalSubmitBallot

    output.resultBox = originalOutputResultBox
    output.errorBox = originalOutputErrorBox

    hre.ethers.getSigners = originalGetSigners
  })

  it('should return formatted ballot for action get', async function () {
    const result = await hre.run(
      { scope: 'optigov', task: 'ballots' },
      { action: 'get', roundId: '1', ballotContent: '{}' },
    )
    // Verify that the result output contains a formatted ballot (e.g. its address and round id)
    assert(result.includes('Address: 0xabc'))
    assert(result.includes('Round ID: 1'))
  })

  it('should return submission result for action submit', async function () {
    const result = await hre.run(
      { scope: 'optigov', task: 'ballots' },
      { action: 'submit', roundId: '1', ballotContent: '{"data":123}' },
    )
    assert(result.includes('Submit Ballot for Round 1 & 0xabc'))
    assert(result.includes('"success":true'))
  })

  it('should handle errors on action get', async function () {
    Ballots.prototype.getBallot = async function () {
      throw new Error('get error')
    }
    const result = await hre.run(
      { scope: 'optigov', task: 'ballots' },
      { action: 'get', roundId: '1', ballotContent: '{}' },
    )
    assert(result.includes('Error: get error'))
  })

  it('should handle errors on action submit', async function () {
    Ballots.prototype.submitBallot = async function () {
      throw new Error('submit error')
    }
    const result = await hre.run(
      { scope: 'optigov', task: 'ballots' },
      { action: 'submit', roundId: '1', ballotContent: '{}' },
    )
    assert(result.includes('Error: submit error'))
  })

  it('should return raw string ballot if getBallot returns a string', async function () {
    Ballots.prototype.getBallot = async function (_roundId, _addressOrEnsName) {
      return 'raw ballot string'
    }
    const result = await hre.run(
      { scope: 'optigov', task: 'ballots' },
      { action: 'get', roundId: '2', ballotContent: '{}' },
    )
    assert(result.includes('raw ballot string'))
    assert(result.includes('Ballot for Round 2 & 0xabc'))
  })

  it('should return raw string result if submitBallot returns a string', async function () {
    Ballots.prototype.submitBallot = async function (
      _roundId,
      _addressOrEnsName,
      _payload,
    ) {
      return 'raw submit result'
    }
    const result = await hre.run(
      { scope: 'optigov', task: 'ballots' },
      { action: 'submit', roundId: '2', ballotContent: '{"data":123}' },
    )
    assert(result.includes('raw submit result'))
    assert(result.includes('Submit Ballot for Round 2 & 0xabc'))
  })

  it('should use default content when ballotContent is not provided for submit', async function () {
    const result = await hre.run(
      { scope: 'optigov', task: 'ballots' },
      { action: 'submit', roundId: '3', ballotContent: '{}' },
    )
    assert(result.includes('Submit Ballot for Round 3 & 0xabc'))
  })

  it('should error for an invalid action', async function () {
    const result = await hre.run(
      { scope: 'optigov', task: 'ballots' },
      { action: 'invalidAction', roundId: '1', ballotContent: '{}' },
    )
    assert(result.includes('Error: Invalid action. Use "get" or "submit".'))
  })

  it('should throw error when no signers available for get', async function () {
    hre.ethers.getSigners = async () => []
    const result = await hre.run(
      { scope: 'optigov', task: 'ballots' },
      { action: 'get', roundId: '1', ballotContent: '{}' },
    )
    assert(result.includes('Error: No signers available.'))
  })

  it('should throw error when no signers available for submit', async function () {
    hre.ethers.getSigners = async () => []
    const result = await hre.run(
      { scope: 'optigov', task: 'ballots' },
      { action: 'submit', roundId: '1', ballotContent: '{}' },
    )
    assert(result.includes('Error: No signers available.'))
  })
})
