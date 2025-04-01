const types = require('ethernaut-common/src/validation/types')
const output = require('ethernaut-common/src/ui/output')
const Delegates = require('../internal/agora/Delegates')
const Agora = require('../internal/agora/Agora')

const RELATED_DATA = {
  votes: 'votes',
  delegators: 'delegators',
  none: 'none',
}

require('../scopes/optigov')
  .task(
    'delegates',
    'Prints a list of delegates on Agora, or a specific delegate, with optional votes or delegator related data',
  )
  .addOptionalParam(
    'limit',
    'The maximum number of delegates to fetch. Defaults to 10.',
    10,
    types.int,
  )
  .addOptionalParam(
    'offset',
    'The number of delegates to skip before starting to fetch. Defaults to 0.',
    0,
    types.int,
  )
  .addOptionalParam(
    'address',
    'The address or ENS name of a specific delegate to query.',
    undefined,
    types.string,
  )
  .addOptionalParam(
    'relatedData',
    'If specified, fetch additional related data such as votes or delegators for the given address or ENS name.',
    RELATED_DATA.none,
    types.string,
  )
  .setAction(async ({ limit, offset, address, relatedData }) => {
    try {
      const agora = new Agora()
      const delegates = new Delegates(agora)

      if (address) {
        if (relatedData === RELATED_DATA.votes) {
          // Get votes
          const delegateVotes = await delegates.getDelegateVotes({
            addressOrEnsName: address,
            limit,
            offset,
          })
          return output.resultBox(
            printVotes(delegateVotes),
            `Votes for Delegate ${address}`,
          )
        } else if (relatedData === RELATED_DATA.delegators) {
          // Get delegators
          const delegateDelegators = await delegates.getDelegateDelegators({
            addressOrEnsName: address,
            limit,
            offset,
          })
          return output.resultBox(
            printDelegators(delegateDelegators),
            `Delegators for Delegate ${address}`,
          )
        } else {
          // Get the specific delegate
          const delegate = await delegates.getDelegateById(address)
          return output.resultBox(
            printDelegate(delegate),
            `Delegate ${address}`,
          )
        }
      }

      // If no specific address or ENS is given, fetch the list of delegates
      const delegateList = await delegates.getDelegates({ limit, offset })

      return output.resultBox(printDelegates(delegateList), 'Delegates')
    } catch (err) {
      return output.errorBox(err)
    }
  })

function printDelegates(delegates) {
  const strs = []

  for (const delegate of delegates) {
    strs.push(
      `Address: ${delegate.address}
        Voting Power: ${delegate.votingPower}
        Twitter: ${delegate.twitter}
        Discord: ${delegate.discord}
        Statement: ${delegate.delegateStatement}`,
    )
  }

  return strs.join('\n\n')
}

function printDelegate(delegate) {
  return `Address: ${delegate.address}
   Voting Power (Advanced): ${delegate.votingPower.advanced}
   Voting Power (Direct): ${delegate.votingPower.direct}
   Voting Power (Total): ${delegate.votingPower.total}
   Voting Power Relative to Votable Supply: ${delegate.votingPowerRelativeToVotableSupply}
   Voting Power Relative to Quorum: ${delegate.votingPowerRelativeToQuorum}
   Proposals Created: ${delegate.proposalsCreated}
   Proposals Voted On: ${delegate.proposalsVotedOn}
   Voted For: ${delegate.votedFor}
   Voted Against: ${delegate.votedAgainst}
   Voted Abstain: ${delegate.votedAbstain}
   Voting Participation: ${delegate.votingParticipation}
   Last Ten Proposals: ${delegate.lastTenProps}
   Number of Delegators: ${delegate.numOfDelegators}`
}

function printVotes(votes) {
  const strs = []

  for (const vote of votes) {
    strs.push(
      ` - Support: ${vote.support}, Weight: ${vote.weight}, Proposal: ${vote.proposalTitle} (ID: ${vote.proposalId}), Timestamp: ${vote.timestamp}`,
    )
  }

  return strs.join('\n\n')
}

function printDelegators(delegators) {
  const strs = []

  for (const delegator of delegators) {
    strs.push(
      ` - From: ${delegator.from}, Allowance: ${delegator.allowance}, Type: ${delegator.type}, Amount: ${delegator.amount}, Timestamp: ${delegator.timestamp}`,
    )
  }

  return strs.join('\n\n')
}
