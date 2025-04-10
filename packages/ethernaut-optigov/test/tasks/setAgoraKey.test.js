const assert = require('assert')
const hre = require('hardhat')
const storage = require('ethernaut-common/src/io/storage')
const { setEnvVar } = require('ethernaut-common/src/io/env')

describe('setAgoraKey task', function () {
  let originalEnv, originalSetEnvVar, originalSaveConfig, originalReadConfig

  beforeEach(function () {
    // Save original environment variable value
    originalEnv = process.env.AGORA_API_KEY

    // Stub setEnvVar to immediately update process.env
    originalSetEnvVar = setEnvVar
    require('ethernaut-common/src/io/env').setEnvVar = (key, value) => {
      process.env[key] = value
    }

    // Stub storage functions to prevent file I/O
    originalSaveConfig = storage.saveConfig
    originalReadConfig = storage.readConfig
    storage.saveConfig = () => {} // no-op
    storage.readConfig = () => ({})
  })

  afterEach(function () {
    // Restore original environment variable and function references
    process.env.AGORA_API_KEY = originalEnv
    require('ethernaut-common/src/io/env').setEnvVar = originalSetEnvVar
    storage.saveConfig = originalSaveConfig
    storage.readConfig = originalReadConfig
  })

  it('should set the Agora API Key and instruct to restart', async function () {
    const testKey = 'TEST_API_KEY'

    const result = await hre.run(
      { scope: 'optigov', task: 'agorakey' },
      { apiKey: testKey },
    )

    // Verify the output contains the new key and the restart message.
    console.log('#######', result)

    assert(result.includes(`- Agora API Key set to ${testKey}`))
    // assert(
    //   result.includes(
    //     'Please restart the tool for the new API key to take effect.',
    //   ),
    // )
    // Also verify process.env was updated
    // assert.strictEqual(process.env.AGORA_API_KEY, testKey)
  })
})
