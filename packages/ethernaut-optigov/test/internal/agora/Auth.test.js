const assert = require('assert')
const Auth = require('../../../src/internal/agora/Auth')

describe('Auth Module', function () {
  let auth, mockAgora, axiosInstance

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

    // Create a mock agora with required methods.
    // For failure cases, we rely on handleError to rethrow the error.
    mockAgora = {
      createAxiosInstance: () => axiosInstance,
      handleError: (error) => {
        throw error
      },
      setBearerToken: (_token) => {
        // Optionally store the token if needed.
      },
    }

    auth = new Auth(mockAgora)
  })

  describe('getNonce', function () {
    it('should return a valid nonce string', async function () {
      const nonce = await auth.getNonce()
      assert.equal(nonce, 'fake_nonce')
    })

    it('should propagate error when getNonce fails', async function () {
      // Simulate failure by overriding get to throw an error.
      axiosInstance.get = async () => {
        throw { message: 'nonce error' }
      }
      // Reassign the axios instance.
      mockAgora.createAxiosInstance = () => axiosInstance

      try {
        await auth.getNonce()
        assert.fail('Expected error was not thrown')
      } catch (err) {
        // Since handleError just rethrows, the error should propagate.
        assert.strictEqual(err.message, 'nonce error')
      }
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

    it('should propagate error when authenticateWithAgora fails', async function () {
      // Simulate failure by overriding post to throw an error.
      axiosInstance.post = async () => {
        throw { message: 'auth error' }
      }
      // Reassign the axios instance.
      mockAgora.createAxiosInstance = () => axiosInstance

      try {
        await auth.authenticateWithAgora('msg', 'sig', 'nonce')
        assert.fail('Expected error was not thrown')
      } catch (err) {
        // Since handleError just rethrows, the error should propagate.
        assert.strictEqual(err.message, 'auth error')
      }
    })
  })
})
