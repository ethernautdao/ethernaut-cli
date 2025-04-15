const { ethers } = require('ethers')
const output = require('ethernaut-common/src/ui/output')
const spinner = require('ethernaut-common/src/ui/spinner')
const debug = require('ethernaut-common/src/ui/debug')
const l2Abi = require('./abis/l2ToL1MessagePasserABI.json')
const l1Abi = require('./abis/l1CrossDomainMessengerABI.json')
const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') })

const L2_MESSAGE_PASSER_ADDRESS = '0x4200000000000000000000000000000000000016'
const L1_MESSENGER_ADDRESS = '0x25ace71c97b33cc4729cf772ae268934f7ab5fa1' // Optimism
const optimismProvider = new ethers.JsonRpcProvider(
  `https://optimism-mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
)
const ethereumProvider = new ethers.JsonRpcProvider(
  `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
)

module.exports = async function messageTrace(hre, txHash) {
  try {
    if (!txHash) {
      return output.warn('Transaction hash is required')
    }

    let formattedTxHash
    if (typeof txHash === 'string') {
      formattedTxHash = txHash
    } else {
      if (typeof txHash === 'object') {
        formattedTxHash = txHash.txId
      } else {
        return output.warn('Invalid transaction hash format')
      }
    }

    if (!formattedTxHash.startsWith('0x')) {
      formattedTxHash = '0x' + formattedTxHash
    }

    if (formattedTxHash.length !== 66) {
      return output.warn('Invalid transaction hash length')
    }

    debug.log(`Tracing tx: ${formattedTxHash}`, 'message-trace')

    spinner.progress('Fetching transaction receipt from L2', 'message-trace')
    const receipt =
      await optimismProvider.getTransactionReceipt(formattedTxHash)

    if (!receipt) {
      spinner.fail('Transaction not found', 'message-trace')
      return output.warn('Transaction not found in L2.')
    }
    spinner.success('Transaction found', 'message-trace')

    let l2Passer = new ethers.Contract(
      L2_MESSAGE_PASSER_ADDRESS,
      l2Abi,
      optimismProvider,
    )
    const l1Messenger = new ethers.Contract(
      L1_MESSENGER_ADDRESS,
      l1Abi,
      ethereumProvider,
    )

    let withdrawalHash
    for (const log of receipt.logs) {
      try {
        const parsed = l2Passer.interface.parseLog(log)
        if (parsed.name === 'MessagePassed') {
          withdrawalHash = parsed.args.withdrawalHash
          output.info(`Message found with withdrawalHash: ${withdrawalHash}`)
        }
      } catch {
        // Ignore event not generated by message passed
      }
    }

    if (!withdrawalHash) {
      return output.resultBox('No messages found in this tx.')
    }

    spinner.progress('Checking status on L1', 'message-trace')
    const relayed = await l1Messenger.queryFilter(
      l1Messenger.filters.RelayedMessage(withdrawalHash),
    )
    const failed = await l1Messenger.queryFilter(
      l1Messenger.filters.FailedRelayedMessage(withdrawalHash),
    )

    if (relayed.length > 0) {
      return output.resultBox(
        'Message processed in L1 successfully.',
        'message-trace',
      )
    } else if (failed.length > 0) {
      return output.resultBox('Failed processing message in L1.')
    } else {
      return output.resultBox('Message not yet processed in L1.')
    }
  } catch (err) {
    spinner.fail('Error tracing message', 'message-trace')
    return output.errorBox(err.message)
  }
}
