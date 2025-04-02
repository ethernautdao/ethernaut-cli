const output = require('ethernaut-common/src/ui/output')
const { createSiweMessage } = require('../internal/Siwe')
const EthernautCliError = require('ethernaut-common/src/error/error')
const Auth = require('../internal/agora/Auth')
const Agora = require('../internal/agora/Agora')

require('../scopes/optigov')
  .task(
    'login',
    'Logs in to the Agora RetroPGF API with SIWE (Sign in with Ethereum)',
  )
  .setAction(async (_, hre) => {
    try {
      const signers = await hre.ethers.getSigners()
      if (signers.length === 0) {
        throw new EthernautCliError(
          'ethernaut-optigov',
          'No signers available - If you are using the ethernaut-cli, please add one with `ethernaut wallet create`',
          false,
        )
      }
      const signer = signers[0]
      output.info(
        `Logging in with address: ${signer.address}`,
        'ethernaut-optigov',
      )

      const agora = new Agora()
      const auth = new Auth(agora)

      const statement = 'Log in to Agoras RetroPGF API with SIWE.'
      const nonce = await auth.getNonce()
      const preparedMessage = createSiweMessage(
        signer.address,
        statement,
        nonce,
      )
      const signature = await signer.signMessage(preparedMessage)

      await auth.authenticateWithAgora(preparedMessage, signature, nonce)

      return output.resultBox(`Logged in with address: ${signer.address})`)
    } catch (err) {
      return output.errorBox(err)
    }
  })
