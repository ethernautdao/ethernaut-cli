const assert = require('assert')
const Rounds = require('../../src/internal/agora/Rounds')
const hre = require('hardhat')
const output = require('ethernaut-common/src/ui/output')

describe('rounds task', function () {
  let originalGetRounds,
    originalGetRoundById,
    originalGetLatestRound,
    originalOutputResultBox,
    originalOutputErrorBox

  beforeEach(function () {
    // Mock Rounds class methods
    originalGetRounds = Rounds.prototype.getRounds
    originalGetRoundById = Rounds.prototype.getRoundById
    originalGetLatestRound = Rounds.prototype.getLatestRound

    Rounds.prototype.getRounds = async function ({
      limit: _limit,
      offset: _offset,
    }) {
      return [
        {
          roundId: 1,
          name: 'RetroPGF Round One',
          description: 'The first retroactive funding round',
          externalLink: 'https://vote.optimism.io/retropgf/1/summary',
          events: [{ status: 'PLANNED', timestamp: '2023-01-01T00:00:00Z' }],
        },
        {
          roundId: 2,
          name: 'RetroPGF Round Two',
          description: 'The second retroactive funding round',
          externalLink: 'https://vote.optimism.io/retropgf/2/summary',
          events: [{ status: 'DONE', timestamp: '2023-02-01T00:00:00Z' }],
        },
      ]
    }

    Rounds.prototype.getRoundById = async function (roundId) {
      return {
        roundId: roundId,
        name: `RetroPGF Round ${roundId}`,
        description: `Description of round ${roundId}`,
        externalLink: `https://vote.optimism.io/retropgf/${roundId}/summary`,
        events: [
          { status: 'SCHEDULED', timestamp: '2024-02-01T00:00:00Z' },
          { status: 'DONE', timestamp: '2024-03-01T00:00:00Z' },
        ],
      }
    }

    Rounds.prototype.getLatestRound = async function () {
      return {
        roundId: 3,
        name: 'RetroPGF Round Three',
        description: 'The third retroactive funding round',
        externalLink: 'https://vote.optimism.io/retropgf/3/summary',
        events: [
          { status: 'PLANNED', timestamp: '2024-01-01T00:00:00Z' },
          { status: 'DONE', timestamp: '2024-03-01T00:00:00Z' },
        ],
      }
    }

    // Mock the output methods
    originalOutputResultBox = output.resultBox
    originalOutputErrorBox = output.errorBox

    output.resultBox = (content, title) => `${title}: ${content}`
    output.errorBox = (error) => `Error: ${error.message}`
  })

  afterEach(function () {
    // Restore the original methods after each test
    Rounds.prototype.getRounds = originalGetRounds
    Rounds.prototype.getRoundById = originalGetRoundById
    Rounds.prototype.getLatestRound = originalGetLatestRound

    output.resultBox = originalOutputResultBox
    output.errorBox = originalOutputErrorBox
  })

  it('fetches a list of rounds with limit and offset', async function () {
    const result = await hre.run(
      { scope: 'optigov', task: 'rounds' },
      { limit: 2, offset: 0 },
    )
    assert.equal(
      result,
      'Rounds: Round ID: 1\n      Name: RetroPGF Round One\n      Description: The first retroactive funding round\n      Link: https://vote.optimism.io/retropgf/1/summary\n\nRound ID: 2\n      Name: RetroPGF Round Two\n      Description: The second retroactive funding round\n      Link: https://vote.optimism.io/retropgf/2/summary',
    )
  })

  it('fetches a specific round by roundId', async function () {
    const roundId = 2
    const result = await hre.run(
      { scope: 'optigov', task: 'rounds' },
      { roundId },
    )
    assert.equal(
      result,
      'Round 2: Round ID: 2\nName: RetroPGF Round 2\nDescription: Description of round 2\nLink: https://vote.optimism.io/retropgf/2/summary\nEvents:\n   - Status: SCHEDULED, Timestamp: 2024-02-01T00:00:00Z\n   - Status: DONE, Timestamp: 2024-03-01T00:00:00Z',
    )
  })

  it('fetches the latest round when latest is set to "yes"', async function () {
    const result = await hre.run(
      { scope: 'optigov', task: 'rounds' },
      { latest: 'yes' },
    )
    assert.equal(
      result,
      'Latest Round: Round ID: 3\nName: RetroPGF Round Three\nDescription: The third retroactive funding round\nLink: https://vote.optimism.io/retropgf/3/summary\nEvents:\n   - Status: PLANNED, Timestamp: 2024-01-01T00:00:00Z\n   - Status: DONE, Timestamp: 2024-03-01T00:00:00Z',
    )
  })

  it('handles errors gracefully when fetching rounds fails', async function () {
    Rounds.prototype.getRounds = async function () {
      throw new Error('Failed to fetch rounds')
    }

    const result = await hre.run(
      { scope: 'optigov', task: 'rounds' },
      { limit: 2, offset: 0 },
    )

    assert.equal(result, 'Error: Failed to fetch rounds')
  })
})
