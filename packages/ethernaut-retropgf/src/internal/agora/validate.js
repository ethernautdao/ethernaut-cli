const EthernautCliError = require('ethernaut-common/src/error/error')

function validateSort(sort, types) {
  if (!types.includes(sort)) {
    throw new EthernautCliError(
      'retropgf',
      `Invalid sort type ${sort}. Should be one of ${types}`,
    )
  }
}

module.exports = {
  validateSort,
}
