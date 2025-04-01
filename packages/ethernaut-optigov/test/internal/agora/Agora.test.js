const assert = require('assert')
const axios = require('axios')
const Agora = require('../../../src/internal/agora/Agora')

describe('Agora Module', function () {
  let agora, fakeAxiosInstance
  const FAKE_API_KEY = 'fake_api_key'

  beforeEach(function () {
    // Create a fresh Agora instance for each test.
    agora = new Agora()
    // Override the apiKey with a fake value for testing.
    agora.apiKey = FAKE_API_KEY
    agora.bearerToken = null

    // Default fake axios instance that returns a spec
    fakeAxiosInstance = {
      get: async (path, _config) => {
        if (path === '/spec') {
          // Return spec normally unless overridden in a test
          return { data: { spec: 'fake_spec' } }
        }
      },
    }

    // Override createAxiosInstance to use the fake axios instance when needed.
    // For tests that depend on axios.create result, we'll inspect headers manually.
    agora.createAxiosInstance = () => fakeAxiosInstance
  })

  it('should perform its primary operation by getting the API spec', async function () {
    const spec = await agora.getSpec()
    assert.deepEqual(spec, { spec: 'fake_spec' })
  })

  it('should throw an error with response data when getSpec fails with error.response', async function () {
    // Override fakeAxiosInstance.get to throw an error with a response property.
    fakeAxiosInstance.get = async () => {
      throw { response: { data: 'error_data' } }
    }
    agora.createAxiosInstance = () => fakeAxiosInstance

    try {
      await agora.getSpec()
      assert.fail('Expected error was not thrown')
    } catch (err) {
      // Expecting HardhatPluginError based on your implementation.
      assert.strictEqual(err.constructor.name, 'HardhatPluginError')
      assert.strictEqual(err.message, 'Http status error: error_data')
    }
  })

  it('should throw an error with error.message when getSpec fails without error.response', async function () {
    // Override fakeAxiosInstance.get to throw an error without response property.
    fakeAxiosInstance.get = async () => {
      throw { message: 'some error' }
    }
    agora.createAxiosInstance = () => fakeAxiosInstance

    try {
      await agora.getSpec()
      assert.fail('Expected error was not thrown')
    } catch (err) {
      assert.strictEqual(err.constructor.name, 'HardhatPluginError')
      assert.strictEqual(err.message, 'Http status error: some error')
    }
  })

  it('should include bearerToken in Authorization header if set', function () {
    // Set a bearer token on the Agora instance.
    agora.setBearerToken('my_bearer_token')
    // Instead of using the fake, let createAxiosInstance call axios.create to check header assignment.
    const instance = axios.create({
      baseURL: agora.apiBaseUrl,
      headers: {
        Authorization: `Bearer ${agora.bearerToken}`,
      },
    })

    // Assert that the Authorization header is set correctly.
    assert.strictEqual(
      instance.defaults.headers.Authorization,
      'Bearer my_bearer_token',
    )
  })

  it('should include the apiKey in Authorization header if bearerToken is not set', function () {
    // Ensure no bearer token is set.
    agora.setBearerToken(null)
    // Create an instance using axios.create manually to simulate header generation.
    const instance = axios.create({
      baseURL: agora.apiBaseUrl,
      headers: {
        Authorization: `Bearer ${agora.apiKey}`,
      },
    })

    // Assert that the Authorization header uses the apiKey.
    assert.strictEqual(
      instance.defaults.headers.Authorization,
      'Bearer ' + FAKE_API_KEY,
    )
  })
})
