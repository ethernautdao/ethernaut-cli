const assert = require('assert')
const Auth = require('../../../src/internal/agora/Auth')

describe('Auth Module', function () {
  let auth
  let mockAgora
  let axiosInstance

  beforeEach(function () {
    // Create a fake axios instance
    axiosInstance = {
      get: async (path) => {
        if (path === '/auth/nonce') {
          return { data: { nonce: 'fake_nonce' } }
        }
      },
      post: async (path, _payload) => {
        if (path === '/auth/verify') {
          return { status: 200, data: { access_token: 'fake_token' } }
        }
      },
    }

    // Create a mock agora with required methods
    mockAgora = {
      createAxiosInstance: () => axiosInstance,
      handleError: (error) => {
        throw error
      },
      setBearerToken: (_token) => {
        // Mock implementation (could store token if needed)
      },
    }

    auth = new Auth(mockAgora)
  })

  describe('getNonce', function () {
    it('should return a valid nonce string', async function () {
      const nonce = await auth.getNonce()
      assert.equal(nonce, 'fake_nonce')
    })
  })

  describe('authenticateWithAgora', function () {
    it('should return an access token for valid inputs', async function () {
      const token = await auth.authenticateWithAgora(
        'dummy_message',
        'dummy_signature',
        'dummy_nonce',
      )
      assert.equal(token, 'fake_token')
    })
  })
})
