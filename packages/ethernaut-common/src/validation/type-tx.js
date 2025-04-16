const { types } = require('hardhat/config')
const output = require('../ui/output')
const EthernautCliError = require('ethernaut-common/src/error/error')

module.exports = {
  name: 'tx',
  parse: types.string.parse,
  validate: (argName, argValue) => {
    try {
      types.string.validate(argName, argValue)

      // Transaction hash format: 0x followed by 64 hexadecimal characters
      const txHashRegex = /^0x[a-fA-F0-9]{64}$/
      if (!txHashRegex.test(argValue)) {
        throw new EthernautCliError(
          'ethernaut-common',
          `Invalid transaction hash ${argValue}. Must be a 66-character hexadecimal string starting with 0x`,
          false,
        )
      }
    } catch (err) {
      output.errorBox(err)

      if (typeof describe === 'function') {
        throw err
      }

      return false
    }

    return true
  },
}
