const assert = require('assert')
const Delegates = require('../../src/internal/agora/Delegates')
const hre = require('hardhat')
const output = require('ethernaut-common/src/ui/output')

describe('delegates task', function () {
  let originalGetDelegates,
    originalGetDelegateById,
    originalGetDelegateVotes,
    originalGetDelegateDelegators,
    originalOutputResultBox,
    originalOutputErrorBox

  beforeEach(function () {
    // Mock Delegates class methods
    originalGetDelegates = Delegates.prototype.getDelegates
    originalGetDelegateById = Delegates.prototype.getDelegateById
    originalGetDelegateVotes = Delegates.prototype.getDelegateVotes
    originalGetDelegateDelegators = Delegates.prototype.getDelegateDelegators

    Delegates.prototype.getDelegates = async function ({
      limit: _limit,
      offset: _offset,
    }) {
      return [
        {
          address: '0xabc123',
          votingPower: 1000,
          twitter: '@delegate1',
          discord: 'delegate1#1234',
          delegateStatement: 'This is a delegate statement...',
        },
        {
          address: '0xdef456',
          votingPower: 2000,
          twitter: '@delegate2',
          discord: 'delegate2#5678',
          delegateStatement: 'Another delegate statement...',
        },
      ]
    }

    Delegates.prototype.getDelegateById = async function (address) {
      return {
        address: address,
        votingPower: { advanced: 500, direct: 300, total: 800 },
        votingPowerRelativeToVotableSupply: 0.1,
        votingPowerRelativeToQuorum: 0.05,
        proposalsCreated: 5,
        proposalsVotedOn: 10,
        votedFor: 7,
        votedAgainst: 2,
        votedAbstain: 1,
        votingParticipation: 90,
        lastTenProps: 10,
        numOfDelegators: 15,
      }
    }

    Delegates.prototype.getDelegateVotes = async function ({
      address,
      limit: _limit,
      offset: _offset,
    }) {
      return [
        {
          transactionHash: '0x123',
          proposalId: '1',
          address: address,
          support: 'FOR',
          reason: 'Supportive vote',
          weight: '100',
          proposalValue: '500',
          proposalTitle: 'Proposal Title',
          proposalType: 'STANDARD',
          timestamp: '2024-10-28T10:57:57.005Z',
        },
      ]
    }

    Delegates.prototype.getDelegateDelegators = async function ({
      address: _address,
      limit: _limit,
      offset: _offset,
    }) {
      return [
        {
          from: '0xaaa111',
          allowance: '100000000000000000000000',
          timestamp: '2024-01-17T19:37:15.983Z',
          type: 'DIRECT',
          amount: 'FULL',
        },
      ]
    }

    // Mock the output methods
    originalOutputResultBox = output.resultBox
    originalOutputErrorBox = output.errorBox

    output.resultBox = (content, title) => `${title}: ${content}`
    output.errorBox = (error) => `Error: ${error.message}`
  })

  afterEach(function () {
    // Restore the original methods after each test
    Delegates.prototype.getDelegates = originalGetDelegates
    Delegates.prototype.getDelegateById = originalGetDelegateById
    Delegates.prototype.getDelegateVotes = originalGetDelegateVotes
    Delegates.prototype.getDelegateDelegators = originalGetDelegateDelegators

    output.resultBox = originalOutputResultBox
    output.errorBox = originalOutputErrorBox
  })

  it('fetches a list of delegates with limit and offset', async function () {
    const result = await hre.run(
      { scope: 'optigov', task: 'delegates' },
      { limit: 2, offset: 0 },
    )
    assert.equal(
      result,
      'Delegates: Address: 0xabc123\n        Voting Power: 1000\n        Twitter: @delegate1\n        Discord: delegate1#1234\n        Statement: This is a delegate statement...\n\nAddress: 0xdef456\n        Voting Power: 2000\n        Twitter: @delegate2\n        Discord: delegate2#5678\n        Statement: Another delegate statement...',
    )
  })

  it('fetches a specific delegate by address or ENS name', async function () {
    const address = '0xabc123'
    const result = await hre.run(
      { scope: 'optigov', task: 'delegates' },
      { address },
    )
    assert.equal(
      result,
      `Delegate ${address}: Address: 0xabc123\n   Voting Power (Advanced): 500\n   Voting Power (Direct): 300\n   Voting Power (Total): 800\n   Voting Power Relative to Votable Supply: 0.1\n   Voting Power Relative to Quorum: 0.05\n   Proposals Created: 5\n   Proposals Voted On: 10\n   Voted For: 7\n   Voted Against: 2\n   Voted Abstain: 1\n   Voting Participation: 90\n   Last Ten Proposals: 10\n   Number of Delegators: 15`,
    )
  })

  it('fetches votes for a specific delegate when relatedData is set to votes', async function () {
    const address = '0xabc123'
    const result = await hre.run(
      { scope: 'optigov', task: 'delegates' },
      { address, relatedData: 'votes' },
    )
    assert.equal(
      result,
      'Votes for Delegate 0xabc123:  - Support: FOR, Weight: 100, Proposal: Proposal Title (ID: 1), Timestamp: 2024-10-28T10:57:57.005Z',
    )
  })

  it('fetches delegators for a specific delegate when relatedData is set to delegators', async function () {
    const address = '0xabc123'
    const result = await hre.run(
      { scope: 'optigov', task: 'delegates' },
      { address, relatedData: 'delegators' },
    )
    assert.equal(
      result,
      'Delegators for Delegate 0xabc123:  - From: 0xaaa111, Allowance: 100000000000000000000000, Type: DIRECT, Amount: FULL, Timestamp: 2024-01-17T19:37:15.983Z',
    )
  })

  it('handles errors gracefully when fetching delegates fails', async function () {
    Delegates.prototype.getDelegates = async function () {
      throw new Error('Failed to fetch delegates')
    }

    const result = await hre.run(
      { scope: 'optigov', task: 'delegates' },
      { limit: 2, offset: 0 },
    )

    assert.equal(result, 'Error: Failed to fetch delegates')
  })
})
