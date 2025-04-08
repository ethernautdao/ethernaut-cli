const assert = require('assert')
const Ballots = require('../../src/internal/agora/Ballots')
const hre = require('hardhat')
const output = require('ethernaut-common/src/ui/output')

describe('ballots task', function () {
  let originalGetBallot,
    originalSubmitBallot,
    originalOutputResultBox,
    originalOutputErrorBox

  beforeEach(function () {
    // Mock Ballots prototype methods
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
      roundId,
      addressOrEnsName,
      payload,
    ) {
      return { success: true, payload }
    }

    // Mock output methods for predictable string outputs
    originalOutputResultBox = output.resultBox
    originalOutputErrorBox = output.errorBox

    output.resultBox = (content, title) => `${title}: ${content}`
    output.errorBox = (error) => `Error: ${error.message}`
  })

  afterEach(function () {
    Ballots.prototype.getBallot = originalGetBallot
    Ballots.prototype.submitBallot = originalSubmitBallot

    output.resultBox = originalOutputResultBox
    output.errorBox = originalOutputErrorBox
  })

  it('should return formatted ballot for action get', async function () {
    const result = await hre.run(
      { scope: 'optigov', task: 'ballots' },
      { action: 'get', roundId: '1', addressOrEnsName: '0xabc' },
    )
    // Verify that the result output contains a formatted ballot (e.g. its address)
    assert(result.includes('Address: 0xabc'))
    assert(result.includes('Round ID: 1'))
  })

  it('should return submission result for action submit', async function () {
    const result = await hre.run(
      { scope: 'optigov', task: 'ballots' },
      { action: 'submit', roundId: '1', addressOrEnsName: '0xabc' },
    )
    assert(result.includes('Submit Ballot for Round 1 & 0xabc'))
    assert(result.includes('"success":true')) // the JSON-stringified response
  })

  it('should handle errors on action get', async function () {
    Ballots.prototype.getBallot = async function () {
      throw new Error('get error')
    }
    const result = await hre.run(
      { scope: 'optigov', task: 'ballots' },
      { action: 'get', roundId: '1', addressOrEnsName: '0xabc' },
    )
    assert(result.includes('Error: get error'))
  })

  it('should handle errors on action submit', async function () {
    Ballots.prototype.submitBallot = async function () {
      throw new Error('submit error')
    }
    const result = await hre.run(
      { scope: 'optigov', task: 'ballots' },
      { action: 'submit', roundId: '1', addressOrEnsName: '0xabc' },
    )
    assert(result.includes('Error: submit error'))
  })
})
