const { Terminal } = require('ethernaut-common/src/test/terminal')
const storage = require('../../src/internal/storage')

describe('node', function () {
  const terminal = new Terminal()

  before('add test network', async function () {
    const networks = storage.readNetworks()
    if (!('test__9' in networks)) networks.test__9 = { url: 'poop' }
    storage.storeNetworks(networks)
  })

  after('remove test network', async function () {
    const networks = storage.readNetworks()
    if ('test__9' in networks) delete networks.test__9
    storage.storeNetworks(networks)
  })

  describe('when parameters are provided', function () {
    describe('with none', function () {
      before('run', async function () {
        await terminal.run(
          'hardhat network node --fork none --port 8547',
          2000,
          true,
        )
      })

      it('starts a local chain', async function () {
        terminal.has('Available Accounts')
      })
    })

    describe('with a valid network', function () {
      const rpcUrl = 'https://ethereum-rpc.publicnode.com'

      before('add test network', async function () {
        const networks = storage.readNetworks()
        if (!('test__mainnet' in networks))
          networks.test__mainnet = { url: rpcUrl }
        storage.storeNetworks(networks)
      })

      after('remove test network', async function () {
        const networks = storage.readNetworks()
        if ('test__mainnet' in networks) delete networks.test__mainnet
        storage.storeNetworks(networks)
      })

      before('run', async function () {
        await terminal.run(
          'hardhat network node --fork test__mainnet --port 8547',
          2000,
          true,
        )
      })

      it('starts a local forked chain', async function () {
        terminal.has(`Starting local chain with fork ${rpcUrl}...`)
      })
    })
  })
})
