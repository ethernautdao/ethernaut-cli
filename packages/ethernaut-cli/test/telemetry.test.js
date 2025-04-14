const storage = require('ethernaut-common/src/io/storage')
const { Terminal } = require('ethernaut-common/src/test/terminal')

describe('telemetry', function () {
  let terminal = new Terminal()
  let cachedTelemetryConsent

  before('allow telemetry in tests', async function () {
    process.env.ALLOW_TELEMETRY = 'true'
  })

  after('lock telemetry in tests', async function () {
    process.env.ALLOW_TELEMETRY = 'false'
  })

  before('cache telemetry consent', async function () {
    const config = storage.readConfig()
    cachedTelemetryConsent = config.general?.telemetryConsent
  })

  after('restore telemetry consent', async function () {
    const config = storage.readConfig()
    config.general.telemetryConsent = cachedTelemetryConsent
    storage.saveConfig(config)
  })

  describe('when consent is undefined', function () {
    before('modify', async function () {
      const config = storage.readConfig()
      config.general.telemetryConsent = undefined
      storage.saveConfig(config)
    })

    before('start cli', async function () {
      await terminal.run('hardhat', 9000)
    })

    it('displays the telemetry consent prompt', async function () {
      await terminal.has('Help us improve ethernaut-cli')
    })
  })

  describe('when consent is not undefined', function () {
    before('modify', async function () {
      const config = storage.readConfig()
      config.general.telemetryConsent = false
      storage.saveConfig(config)
    })

    before('start cli', async function () {
      await terminal.run('hardhat', 9000)
    })

    it('does not display the telemetry consent prompt', async function () {
      terminal.notHas('Help us improve ethernaut-cli')
    })
  })
})
