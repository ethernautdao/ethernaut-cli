const types = require('ethernaut-common/src/validation/types')
const output = require('ethernaut-common/src/ui/output')
const Rounds = require('../internal/agora/Rounds')
const Agora = require('../internal/agora/Agora')

const LATEST = {
  yes: 'yes',
  no: 'no',
}

require('../scopes/optigov')
  .task(
    'rounds',
    'Prints a list of RetroFunding rounds or details about a specific round.',
  )
  .addOptionalParam(
    'limit',
    'The maximum number of rounds to fetch. Defaults to 10.',
    10,
    types.int,
  )
  .addOptionalParam(
    'offset',
    'The number of rounds to skip before starting to fetch. Defaults to 0.',
    0,
    types.int,
  )
  .addOptionalParam(
    'roundId',
    'The ID of a specific round to query.',
    undefined,
    types.int,
  )
  .addOptionalParam(
    'latest',
    'If set to "yes", fetches the latest round.',
    LATEST.no,
    types.string,
  )
  .setAction(async ({ limit, offset, roundId, latest }) => {
    try {
      const agora = new Agora()
      const rounds = new Rounds(agora)

      if (latest === LATEST.yes) {
        const latestRound = await rounds.getLatestRound()
        return output.resultBox(printRound(latestRound), 'Latest Round')
      }

      if (roundId !== undefined) {
        const round = await rounds.getRoundById(roundId)
        return output.resultBox(printRound(round), `Round ${roundId}`)
      }

      // If no specific roundId or latest flag, fetch a list of rounds
      const roundList = await rounds.getRounds({ limit, offset })
      return output.resultBox(printRounds(roundList), 'Rounds')
    } catch (err) {
      return output.errorBox(err)
    }
  })

function printRounds(rounds) {
  const strs = []

  for (const round of rounds) {
    strs.push(`Round ID: ${round.roundId}
      Name: ${round.name}
      Description: ${round.description}
      Link: ${round.externalLink}`)
  }

  return strs.join('\n\n')
}

function printRound(round) {
  const eventDetails = round.events
    .map(
      (event) => `   - Status: ${event.status}, Timestamp: ${event.timestamp}`,
    )
    .join('\n')

  return `Round ID: ${round.roundId}
Name: ${round.name}
Description: ${round.description}
Link: ${round.externalLink}
Events:
${eventDetails}`
}
