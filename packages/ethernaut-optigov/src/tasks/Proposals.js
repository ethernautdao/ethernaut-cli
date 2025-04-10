const types = require('ethernaut-common/src/validation/types')
const output = require('ethernaut-common/src/ui/output')
const Proposals = require('../internal/agora/Proposals')
const agora = require('../internal/agora/agoraInstance')

const VOTES = {
  yes: 'yes',
  no: 'no',
}

require('../scopes/optigov')
  .task(
    'proposals',
    'Prints a list of proposals registered in RetroPGF, given specified filters',
  )
  .addOptionalParam(
    'limit',
    'The maximum number of proposals to fetch. Defaults to 10.',
    10,
    types.int,
  )
  .addOptionalParam(
    'offset',
    'The number of proposals to skip before starting to fetch. Defaults to 0.',
    0,
    types.int,
  )
  .addOptionalParam(
    'proposalId',
    'The ID of a specific proposal to query.',
    undefined,
    types.string,
  )
  .addOptionalParam(
    'votes',
    'If specified, fetch votes for the given proposalId.',
    VOTES.no,
    types.string,
  )
  .setAction(async ({ limit, offset, proposalId, votes }) => {
    try {
      // Instantiate Agora and Proposals
      const proposals = new Proposals(agora)

      // If proposalId is provided, fetch specific proposal or votes
      if (proposalId) {
        if (votes == VOTES.yes) {
          // Get votes for the specified proposal
          const proposalVotes = await proposals.getProposalVotes({
            proposalId,
            limit,
            offset,
          })
          return output.resultBox(
            printVotes(proposalVotes),
            `Votes for Proposal ${proposalId}`,
          )
        } else {
          // Get the specific proposal by ID
          const proposal = await proposals.getProposalById(proposalId)
          return output.resultBox(
            printProposal(proposal),
            `Proposal ${proposalId}`,
          )
        }
      }

      // If no specific proposalId is given, fetch the list of proposals
      const proposalList = await proposals.getProposals({ limit, offset })
      return output.resultBox(printProposals(proposalList), 'Proposals')
    } catch (err) {
      return output.errorBox(err)
    }
  })

// Utility function to print a list of proposals
function printProposals(proposals) {
  const strs = []

  for (const proposal of proposals) {
    strs.push(`- Id: ${proposal.id}\n  Title: ${proposal.markdowntitle}`)
  }

  return strs.join('\n\n')
}

// Utility function to print a specific proposal
function printProposal(proposal) {
  return `Id: ${proposal.id}\nTitle: ${proposal.markdowntitle}\nDescription: ${proposal.description}`
}

// Utility function to print votes for a proposal
function printVotes(votes) {
  const strs = []

  for (const vote of votes) {
    strs.push(
      ` - Voter: ${vote.address}, Support: ${vote.support}, Weight: ${vote.weight}, Reason: ${vote.reason}`,
    )
  }

  return strs.join('\n\n')
}
