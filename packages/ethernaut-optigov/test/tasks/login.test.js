const assert = require('assert')
const Auth = require('../../src/internal/agora/Auth')
const { createSiweMessage } = require('../../src/internal/Siwe')
const hre = require('hardhat')

describe('login task', function () {
  let originalGetNonce,
    originalAuthenticateWithAgora,
    originalCreateSiweMessage,
    originalGetSigners

  beforeEach(function () {
    // Mock the Auth class methods
    originalGetNonce = Auth.prototype.getNonce
    originalAuthenticateWithAgora = Auth.prototype.authenticateWithAgora

    Auth.prototype.getNonce = async function () {
      return '1WNEWDYHLgV6qquy8'
    }

    Auth.prototype.authenticateWithAgora = async function (
      _message,
      _signature,
      _nonce,
    ) {
      return 'mocked_access_token'
    }

    // Mock the ethers signers
    originalGetSigners = hre.ethers.getSigners

    hre.ethers.getSigners = async function () {
      return [
        {
          address: '0x2bEB8D9eD2cE57E124D195e414d23681559577f7',
          signMessage: async function (_message) {
            return 'mocked_signature'
          },
        },
      ]
    }

    // Mock createSiweMessage
    originalCreateSiweMessage = createSiweMessage
    hre.ethers.utils = {
      createSiweMessage: function () {
        return 'mocked_message'
      },
    }
  })

  afterEach(function () {
    // Restore the original methods after each test
    Auth.prototype.getNonce = originalGetNonce
    Auth.prototype.authenticateWithAgora = originalAuthenticateWithAgora
    hre.ethers.getSigners = originalGetSigners
    hre.ethers.utils.createSiweMessage = originalCreateSiweMessage
  })

  it('logs in with valid signers and authenticates with the Agora API', async function () {
    const result = await hre.run({ scope: 'optigov', task: 'login' })

    assert.equal(
      result,
      'Logged in with address: 0x2bEB8D9eD2cE57E124D195e414d23681559577f7',
    )
  })

  it('throws an error if no signers are available', async function () {
    hre.ethers.getSigners = async function () {
      return []
    }

    const result = await hre.run({ scope: 'optigov', task: 'login' })

    assert.equal(
      result,
      'No signers available - If you are using the ethernaut-cli, please add one with `ethernaut wallet create`',
    )
  })
})
