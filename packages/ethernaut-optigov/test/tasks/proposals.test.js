const assert = require('assert')
const Proposals = require('../../src/internal/agora/Proposals')
const hre = require('hardhat')
const output = require('ethernaut-common/src/ui/output')

describe('proposals task', function () {
  let originalGetProposals,
    originalGetProposalById,
    originalGetProposalVotes,
    originalOutputResultBox,
    originalOutputErrorBox

  beforeEach(function () {
    // Mock Proposals class methods
    originalGetProposals = Proposals.prototype.getProposals
    originalGetProposalById = Proposals.prototype.getProposalById
    originalGetProposalVotes = Proposals.prototype.getProposalVotes

    Proposals.prototype.getProposals = async function ({
      limit: _limit,
      offset: _offset,
    }) {
      return [
        { id: '1', markdowntitle: 'Proposal 1' },
        { id: '2', markdowntitle: 'Proposal 2' },
      ]
    }

    Proposals.prototype.getProposalById = async function (proposalId) {
      return {
        id: proposalId,
        markdowntitle: `Proposal ${proposalId}`,
        description: 'Detailed description of proposal',
      }
    }

    Proposals.prototype.getProposalVotes = async function ({
      proposalId: _proposalId,
      limit: _limit,
      offset: _offset,
    }) {
      return [
        {
          address: '0xabc123',
          support: 'Yes',
          weight: 100,
          reason: 'Important proposal',
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
    Proposals.prototype.getProposals = originalGetProposals
    Proposals.prototype.getProposalById = originalGetProposalById
    Proposals.prototype.getProposalVotes = originalGetProposalVotes

    output.resultBox = originalOutputResultBox
    output.errorBox = originalOutputErrorBox
  })

  it('fetches a list of proposals with limit and offset', async function () {
    const result = await hre.run(
      { scope: 'optigov', task: 'proposals' },
      {
        limit: 2,
        offset: 0,
      },
    )
    assert.equal(
      result,
      'Proposals: - Id: 1\n  Title: Proposal 1\n\n- Id: 2\n  Title: Proposal 2',
    )
  })

  it('fetches a specific proposal by proposalId', async function () {
    const proposalId = '1'
    const result = await hre.run(
      { scope: 'optigov', task: 'proposals' },
      {
        proposalId: proposalId,
      },
    )

    assert.equal(
      result,
      'Proposal 1: Id: 1\nTitle: Proposal 1\nDescription: Detailed description of proposal',
    )
  })

  it('fetches votes for a specific proposal when votes is set to yes', async function () {
    const proposalId = '1'
    const result = await hre.run(
      { scope: 'optigov', task: 'proposals' },
      {
        proposalId: proposalId,
        votes: 'yes',
      },
    )
    assert.equal(
      result,
      'Votes for Proposal 1:  - Voter: 0xabc123, Support: Yes, Weight: 100, Reason: Important proposal',
    )
  })

  it('handles errors gracefully when fetching proposals fails', async function () {
    Proposals.prototype.getProposals = async function () {
      throw new Error('Failed to fetch proposals')
    }

    const result = await hre.run(
      { scope: 'optigov', task: 'proposals' },
      {
        limit: 2,
        offset: 0,
      },
    )

    assert.equal(result, 'Error: Failed to fetch proposals')
  })
})
