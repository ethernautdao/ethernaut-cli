const output = require('ethernaut-common/src/ui/output')
const types = require('ethernaut-common/src/validation/types')
const messageTrace = require('../internal/message-trace')
require('../scopes/optimist')
  .task(
    'message-trace',
    'Traces the lifecycle of a message on from L1 to L2 and vice versa',
  )
  .addPositionalParam(
    'txId',
    'The txId of the message to trace',
    undefined,
    types.string,
  )
  .setAction(async (txId, hre) => {
    try {
      await messageTrace(hre, txId)

      return
    } catch (err) {
      return output.errorBox(err)
    }
  })
