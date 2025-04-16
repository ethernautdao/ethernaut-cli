const types = require('ethernaut-common/src/validation/types')
const DocsAssistant = require('../internal/assistants/DocsAssistant')
const Thread = require('../internal/threads/Thread')
const output = require('ethernaut-common/src/ui/output')
const spinner = require('ethernaut-common/src/ui/spinner')
const { checkEnvVar } = require('ethernaut-common/src/io/env')
const wait = require('ethernaut-common/src/util/wait')
const EthernautCliError = require('ethernaut-common/src/error/error')

const TIMEOUT = 600000

require('../scopes/ai')
  .task('dev-docs', '🔴 Chat with the Optimism developer documentation')
  .addPositionalParam(
    'query',
    'The question to ask about Optimism dev docs',
    undefined,
    types.string,
  )
  .addOptionalParam('model', 'The model to use', undefined, types.string)
  .addFlag('newThread', 'Start a new thread')
  .setAction(async ({ query, newThread, model }, hre) => {
    try {
      await checkEnvVar(
        'OPENAI_API_KEY',
        'This is required by the ai package to interact with the openai assistants API.',
      )

      spinner.progress('Preparing thread...', 'ai')
      const thread = new Thread('default', newThread)
      await thread.stop()

      spinner.progress('Posting query...', 'ai')
      await thread.post(query)

      const statusUpdateListener = (status) =>
        spinner.progress(`Thinking... (${status})`, 'ai')
      const buildingAssistantLIstener = () =>
        spinner.progress('Building assistant...', 'ai')

      const docs = new DocsAssistant(hre)
      docs.on('status_update', statusUpdateListener)
      docs.on('building_assistant', buildingAssistantLIstener)

      spinner.progress('Thinking...', 'ai')
      const waitPromise = wait(TIMEOUT)
      const response = await Promise.race([
        docs.process(thread, model),
        waitPromise,
      ])

      spinner.success('Assistant done', 'ai')

      if (response) {
        return output.resultBox(response, 'Response', true)
      } else {
        throw new EthernautCliError(
          'ethernaut-ai',
          'Something went wrong with the query',
        )
      }
    } catch (err) {
      return output.errorBox(err)
    }
  })
