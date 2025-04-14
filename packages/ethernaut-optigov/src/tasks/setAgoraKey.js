const types = require('ethernaut-common/src/validation/types')
const output = require('ethernaut-common/src/ui/output')
const storage = require('ethernaut-common/src/io/storage')
const { setEnvVar } = require('ethernaut-common/src/io/env')

require('../scopes/optigov')
  .task('agorakey', 'Sets the Agora API Key')
  .addParam('apiKey', 'The Agora API Key to use', undefined, types.string)
  .setAction(async ({ apiKey }, _hre) => {
    try {
      const config = storage.readConfig()

      let summary = []

      if (apiKey) {
        const currentKey = process.env.AGORA_API_KEY
        setEnvVar('AGORA_API_KEY', apiKey)
        summary.push(`- Agora API Key set to ${apiKey} (was ${currentKey})`)
        summary.push(
          'Please restart the tool for the new API key to take effect.',
        )
      }

      storage.saveConfig(config)

      if (summary.length === 0) {
        summary.push('No changes')
      }

      return output.resultBox(summary.join('\n'))
    } catch (err) {
      return output.errorBox(err)
    }
  })
