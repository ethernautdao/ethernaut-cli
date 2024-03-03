const { extendEnvironment } = require('hardhat/config')

require('ethernaut-ui/src/index')
require('ethernaut-interact/src/index')

extendEnvironment((hre) => {
  const contract = hre.scopes.interact.tasks.contract
  contract.paramDefinitions.abi.suggest = require('./suggest/abi')
  contract.paramDefinitions.abi.prompt = require('./prompts/abi')
  contract.paramDefinitions.address.prompt = require('./prompts/address')
  contract.paramDefinitions.fn.prompt = require('./prompts/fn')
  contract.paramDefinitions.params.prompt = require('./prompts/params')
  contract.paramDefinitions.value.prompt = require('./prompts/value')
})
