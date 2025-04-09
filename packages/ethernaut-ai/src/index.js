const { extendEnvironment, extendConfig } = require('hardhat/config')
const requireAll = require('ethernaut-common/src/io/require-all')
const spinner = require('ethernaut-common/src/ui/spinner')
const storage = require('./internal/storage')
const preParseAi = require('./internal/pre-parse-ai')
const output = require('ethernaut-common/src/ui/output')
const localStorage = require('ethernaut-common/src/io/storage')

requireAll(__dirname, 'tasks')

extendEnvironment((hre) => {
  spinner.enable(!hre.hardhatArguments.verbose)
  output.setErrorVerbose(hre.hardhatArguments.verbose)

  storage.init()

  preParseAi(hre)
})

extendConfig((config, userConfig) => {
  if (!config.ethernaut) config.ethernaut = {}

  const localConfig = localStorage.readConfig()

  config.ethernaut.ai = {
    model:
      localConfig.ai?.model || userConfig.ethernaut?.ai?.model || 'gpt-4o-mini',

    interpreter: {
      additionalInstructions:
        localConfig.ai?.interpreter?.additionalInstructions.concat() ||
        userConfig.ethernaut?.ai?.interpreter?.additionalInstructions?.concat() ||
        [],
    },
    hubs: {
      additionalInstructions:
        localConfig.ai?.hubs?.additionalInstructions.concat() ||
        userConfig.ethernaut?.ai?.hubs?.additionalInstructions?.concat() ||
        [],
    },

    explainer: {
      additionalInstructions:
        localConfig.ai?.explainer?.additionalInstructions?.concat() ||
        userConfig.ethernaut?.ai?.explainer?.additionalInstructions.concat() ||
        [],
    },
  }
})
