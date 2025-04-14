const assert = require('assert')
const { almostEqual } = require('ethernaut-common/src/util/math')
const getBalance = require('../../src/internal/get-balance')
const { Terminal } = require('ethernaut-common/src/test/terminal')

describe('send', function () {
  const terminal = new Terminal()

  describe('when sending ETH between EOAs', function () {
    let signer1, signer2
    let balance1, balance2

    before('get signers', async function () {
      const signers = await hre.ethers.getSigners()
      signer1 = signers[0]
      signer2 = signers[1]
    })

    const itPrintsPreliminaryInfo = () => {
      it('shows that the signer is connected and prints the correct initial balance', async function () {
        terminal.has(`Connected signer ${signer1.address} (${balance1} ETH)`)
      })

      it('printed a tx summary', async function () {
        terminal.has('Pending Tx')
        terminal.has('Sending 1 ETH (1000000000000000000 wei) to')
        terminal.has(`Signer: ${signer1.address}`)
        terminal.has(`Balance: ${balance1} ETH`)
        terminal.has(`To: ${signer2.address}`)
        terminal.has('Value: 1 ETH')
      })
    }

    const itPrintsPostTxInfo = () => {
      it('shows tx receipt', async function () {
        terminal.has('Transaction Receipt')
        terminal.has('Tx hash:')
        terminal.has('Gas price:')
        terminal.has('Gas used: 21000')
        terminal.has('Block number:')
      })

      it('shows shows final sender balance', async function () {
        const newBalance1 = await getBalance(signer1.address)
        terminal.has(`i Resulting balance: ${newBalance1}`)
      })
    }

    const itModifiesBalances = () => {
      it('reduced signer 1 balance', async function () {
        const newBalance1 = await getBalance(signer1.address)
        assert.strictEqual(almostEqual(newBalance1, balance1 - 1), true)
      })

      it('increased signer 2 balance', async function () {
        const newBalance2 = await getBalance(signer2.address)
        assert.equal(newBalance2 - balance2, 1, 'balance2')
      })
    }

    describe('when signer 1 sends ETH to signer 2 with no prompting', function () {
      before('get initial balances', async function () {
        balance1 = await getBalance(signer1.address)
        balance2 = await getBalance(signer2.address)
      })

      before('run send', async function () {
        await terminal.run(
          `hardhat interact send --address ${signer2.address} --value 1 --no-confirm`,
        )
      })

      itPrintsPreliminaryInfo()
      itModifiesBalances()
      itPrintsPostTxInfo()
    })

    describe('when signer 1 sends ETH to signer 2 with prompting', function () {
      before('get initial balances', async function () {
        balance1 = await getBalance(signer1.address)
        balance2 = await getBalance(signer2.address)
      })

      before('run send', async function () {
        await terminal.run(
          `hardhat interact send --address ${signer2.address} --value 1`,
          2000,
        )
      })

      itPrintsPreliminaryInfo()

      it('prompts the user for confirmation', async function () {
        terminal.has('Do you want to proceed with the call?')
      })

      describe('when the user confirms', function () {
        before('type y', async function () {
          await terminal.input('y', 200)
        })

        itModifiesBalances()
        itPrintsPostTxInfo()
      })
    })
  })
})
