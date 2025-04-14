const assert = require('assert')
const getBalance = require('../../src/internal/get-balance')
const { Terminal } = require('ethernaut-common/src/test/terminal')
const path = require('path')

describe('contract', function () {
  const terminal = new Terminal()

  describe('when interacting with a sample contract', function () {
    let sample

    before('deploy sample contract', async function () {
      const Sample = await hre.ethers.getContractFactory('Sample')
      sample = await Sample.deploy()
    })

    describe('via ethers', function () {
      describe('when incrementing the counter', function () {
        before('increment the counter', async function () {
          const tx = await sample.incrementCounter(42)
          await tx.wait()
        })

        it('incremented the counter', async function () {
          assert.equal(await sample.counter(), 42)
        })

        describe('and then decrementing it', function () {
          before('decrement the counter', async function () {
            const tx = await sample.decrementCounter(42)
            await tx.wait()
          })

          it('decremented the counter', async function () {
            assert.equal(await sample.counter(), 0)
          })
        })
      })
    })

    describe('via the cli', function () {
      let abiPath
      let signer
      let balance

      before('find the abi', async function () {
        abiPath = path.resolve(
          process.cwd(),
          'artifacts/contracts/Sample.sol/Sample.json',
        )
      })

      before('get signer', async function () {
        const signers = await hre.ethers.getSigners()
        signer = signers[0]
      })

      const itPrintsPreliminaryInfo = () => {
        it('shows that the signer is connected and prints the correct initial balance', async function () {
          terminal.has(`Connected signer ${signer.address} (${balance} ETH)`)
        })

        it('printed a tx summary', async function () {
          terminal.has('Pending Tx')
          terminal.has('Sample.incrementCounter(')
          terminal.has(`Signer: ${signer.address}`)
          terminal.has(`Balance: ${balance} ETH`)
          terminal.has(`To: ${await sample.getAddress()}`)
          terminal.has('Value: 0 ETH')
        })
      }

      const itPrintsPostTxInfo = () => {
        it('shows tx statuses', async function () {
          terminal.has('Transaction sent')
          terminal.has('Transaction mined successfully')
        })

        it('shows tx receipt', async function () {
          terminal.has('Transaction Receipt')
          terminal.has('Tx hash:')
          terminal.has('Gas price:')
          terminal.has('Gas used:')
          terminal.has('Block number:')
        })

        it('shows emitted events', async function () {
          terminal.has('Emitted no events')
        })

        it('shows shows final sender balance', async function () {
          const newBalance = await getBalance(signer.address)
          terminal.has(`i Resulting balance: ${newBalance}`)
        })
      }

      describe('when incrementing the counter', function () {
        describe('without prompting', function () {
          before('get initial balances', async function () {
            balance = await getBalance(signer.address)
          })

          before('run contract', async function () {
            await terminal.run(
              `hardhat interact contract --address ${await sample.getAddress()} --no-confirm --abi ${abiPath} --fn incrementCounter --params 42`,
            )
          })

          itPrintsPreliminaryInfo()
          itPrintsPostTxInfo()

          it('incremented the counter', async function () {
            await terminal.run(
              `hardhat interact contract --address ${await sample.getAddress()} --abi ${abiPath} --fn counter --params ''`,
            )
            terminal.has('counter() => 42')
          })

          describe('and then decrementing it', function () {
            before('run contract', async function () {
              await terminal.run(
                `hardhat interact contract --address ${await sample.getAddress()} --no-confirm --abi ${abiPath} --fn decrementCounter --params 42`,
              )
            })

            it('decremented the counter', async function () {
              assert.equal(await sample.counter(), 0)
            })
          })
        })

        describe('with prompting', function () {
          before('get initial balances', async function () {
            balance = await getBalance(signer.address)
          })

          before('run contract', async function () {
            await terminal.run(
              `hardhat interact contract --address ${await sample.getAddress()} --abi ${abiPath} --fn incrementCounter --params 42`,
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

            it('incremented the counter', async function () {
              assert.equal(await sample.counter(), 42)
            })

            itPrintsPostTxInfo()
          })
        })
      })
    })
  })
})
