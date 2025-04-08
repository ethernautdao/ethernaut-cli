const types = require('ethernaut-common/src/validation/types')
const output = require('ethernaut-common/src/ui/output')
const Ballots = require('../internal/agora/Ballots')
const agora = require('../internal/agora/agoraInstance')

require('../scopes/optigov')
  .task('ballots', 'Interacts with ballots on Agora: retrieve or submit')
  .addParam(
    'action',
    'Action to perform: "get" or "submit"',
    undefined,
    types.string,
  )
  .addParam('roundId', 'RetroFunding round ID', undefined, types.string)
  .addParam(
    'addressOrEnsName',
    'Voter address or ENS name',
    undefined,
    types.string,
  )
  // Additional parameters for submit action
  .addOptionalParam(
    'address',
    'Submitter address (required for submit)',
    undefined,
    types.string,
  )
  .addOptionalParam(
    'ballotContent',
    'Ballot content as a JSON string (required for submit)',
    undefined,
    types.string,
  )
  .addOptionalParam(
    'signature',
    'Signature for ballot submission (required for submit)',
    undefined,
    types.string,
  )
  .setAction(
    async ({
      action,
      roundId,
      addressOrEnsName,
      // address,
      // ballotContent,
      // signature,
    }) => {
      try {
        const ballots = new Ballots(agora)

        if (action === 'get') {
          const ballot = await ballots.getBallot(roundId, addressOrEnsName)
          // Format the ballot output if it's an object
          const ballotResult =
            typeof ballot === 'string' ? ballot : formatBallot(ballot)
          return output.resultBox(
            ballotResult,
            `Ballot for Round ${roundId} & ${addressOrEnsName}`,
          )
        } else if (action === 'submit') {
          // Use a mock payload for the submit action.
          const payload = {
            address: 'string',
            ballot_content: {
              allocations: [{}],
              os_only: true,
              os_multiplier: 0,
            },
            signature:
              '0x7D9dF5beCbccE7e155f6F7df6F8ECAb128F4bDDEF0E21Ac364e298178bfCC03481AB6dA7dFd5B299A9D1D3C35301A1481dDD8D8DeeEF0b8e0ee153d7BD4352Ce7f',
          }
          // Uncomment below to use provided values instead of the mock if needed:
          // const payload = {
          //   address,
          //   ballot_content: ballotContent ? JSON.parse(ballotContent) : { allocations: [{}], os_only: true, os_multiplier: 0 },
          //   signature: signature || "0x7D9dF5beCbccE7e155f6F7df6F8ECAb128F4bDDEF0E21Ac364e298178bfCC03481AB6dA7dFd5B299A9D1D3C35301A1481dDD8D8DeeEF0b8e0ee153d7BD4352Ce7f",
          // }
          const result = await ballots.submitBallot(
            roundId,
            addressOrEnsName,
            payload,
          )
          const resultString =
            typeof result === 'string' ? result : JSON.stringify(result)
          return output.resultBox(
            resultString,
            `Submit Ballot for Round ${roundId} & ${addressOrEnsName}`,
          )
        } else {
          throw new Error('Invalid action. Use "get" or "submit".')
        }
      } catch (err) {
        return output.errorBox(err)
      }
    },
  )

// Utility: formats the ballot object for display
function formatBallot(ballot) {
  let formatted = ''
  formatted += `Address: ${ballot.address}\n`
  formatted += `Round ID: ${ballot.round_id}\n`
  formatted += `Status: ${ballot.status}\n`
  formatted += `Budget: ${ballot.budget}\n`
  formatted += `Created At: ${ballot.created_at}\n`
  formatted += `Updated At: ${ballot.updated_at}\n`
  formatted += `Published At: ${ballot.published_at}\n\n`

  if (Array.isArray(ballot.category_allocations)) {
    formatted += 'Category Allocations:\n'
    ballot.category_allocations.forEach((cat) => {
      formatted += `  - Category Slug: ${cat.category_slug}, Allocation: ${cat.allocation}, Locked: ${cat.locked}\n`
    })
    formatted += '\n'
  }

  if (Array.isArray(ballot.projects_allocations)) {
    formatted += 'Projects Allocations:\n'
    ballot.projects_allocations.forEach((proj) => {
      formatted += `  - Project ID: ${proj.project_id}, Name: ${proj.name}, Image: ${proj.image}, Position: ${proj.position}, Allocation: ${proj.allocation}, Impact: ${proj.impact}\n`
    })
    formatted += '\n'
  }

  if (Array.isArray(ballot.projects_to_be_evaluated)) {
    formatted += 'Projects to be Evaluated:\n'
    ballot.projects_to_be_evaluated.forEach((project) => {
      formatted += `  - ${project}\n`
    })
    formatted += '\n'
  }

  if (ballot.payload_for_signature) {
    formatted += 'Payload for Signature:\n'
    formatted += `  Budget: ${ballot.payload_for_signature.budget}\n`
    formatted += `  Category Allocation: ${JSON.stringify(ballot.payload_for_signature.category_allocation, null, 2)}\n`
    formatted += `  Projects Allocation: ${JSON.stringify(ballot.payload_for_signature.projects_allocation, null, 2)}\n`
  }

  return formatted
}
