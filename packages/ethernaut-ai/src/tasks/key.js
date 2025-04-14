const types = require('ethernaut-common/src/validation/types')
const output = require('ethernaut-common/src/ui/output')
const storage = require('ethernaut-common/src/io/storage')
const { setEnvVar } = require('ethernaut-common/src/io/env')

require('../scopes/ai')
  .task('key', 'Sets the openai api key')
  .addParam('apiKey', 'The openai api key to use', undefined, types.string)
  .setAction(async ({ apiKey }) => {
    try {
      if (!apiKey) {
        return output.resultBox('No changes')
      }

      const currentKey = process.env.OPENAI_API_KEY
      setEnvVar('OPENAI_API_KEY', apiKey)
      storage.saveConfig(storage.readConfig())

      return output.resultBox(`API Key set to ${apiKey} (was ${currentKey})`)
    } catch (err) {
      return output.errorBox(err)
    }
  })
