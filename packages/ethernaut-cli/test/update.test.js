const fs = require('fs')
const storage = require('ethernaut-common/src/io/storage')
const { Terminal, keys } = require('ethernaut-common/src/test/terminal')
const assert = require('assert')

describe('update', function () {
  let terminal = new Terminal()
  let cachedAutoUpdate
  let cachedPkg

  before('allow updates in tests', async function () {
    process.env.ALLOW_UPDATE = 'true'
  })

  after('lock updates in tests', async function () {
    process.env.ALLOW_UPDATE = 'false'
  })

  async function triggerUpdate() {
    // Twice because this is how update notifications work
    await terminal.run('hardhat', 5000)
    await terminal.run('hardhat', 5000)
  }

  before('cache', async function () {
    const config = storage.readConfig()
    cachedAutoUpdate = config.general?.autoUpdate
    cachedPkg = fs.readFileSync('package.json', 'utf8')
  })

  after('restore', async function () {
    const config = storage.readConfig()
    config.general.autoUpdate = cachedAutoUpdate
    storage.saveConfig(config)
    fs.writeFileSync('package.json', cachedPkg, 'utf8')
  })

  describe('when pkg version is old', function () {
    let newConfig

    before('modify and cache pkg version', async function () {
      newConfig = JSON.parse(cachedPkg)
      newConfig.version = '0.0.0'
      fs.writeFileSync(
        'package.json',
        JSON.stringify(newConfig, null, 2),
        'utf8',
      )
    })

    describe('when auto update is never', function () {
      before('modify', async function () {
        const config = storage.readConfig()
        config.general.autoUpdate = 'never'
        storage.saveConfig(config)
      })

      before('start cli', async function () {
        await triggerUpdate()
      })

      it('displays navigation', async function () {
        terminal.has('Pick a task or scope')
      })
    })

    describe('when auto update is the current version', function () {
      before('modify', async function () {
        const pkg = JSON.parse(cachedPkg)
        pkg.version = '0.0.0'
        const config = storage.readConfig()
        config.general.autoUpdate = pkg.version
        storage.saveConfig(config)
      })

      before('start cli', async function () {
        await triggerUpdate()
      })

      it('displays navigation', async function () {
        terminal.has('A new version of the ethernaut-cli is available')
      })
    })

    describe('when auto update is undefined', function () {
      const itDisplaysTheUpdatePrompt = () => {
        before('modify', async function () {
          const config = storage.readConfig()
          config.general.autoUpdate = undefined
          storage.saveConfig(config)
        })

        before('start cli', async function () {
          await triggerUpdate()
        })

        it('displays the update notice', async function () {
          terminal.has('is available, update with')
        })

        it('displays the update prompt', async function () {
          terminal.has('A new version of the ethernaut-cli is available')
        })
      }

      describe('when not installing', function () {
        itDisplaysTheUpdatePrompt()

        describe('when no thanks is selected', function () {
          before('interact', async function () {
            await terminal.input(keys.DOWN)
            await terminal.input(keys.ENTER, 5000)
          })

          it('displays navigation', async function () {
            terminal.has('Pick a task or scope')
          })
        })
      })

      describe('when installing', function () {
        itDisplaysTheUpdatePrompt()

        describe('when install is selected', function () {
          before('interact', async function () {
            await terminal.input(keys.ENTER, 5000)
          })

          it('displays installation message', async function () {
            terminal.has('Installing update...')
          })
        })
      })

      describe('when skipping', function () {
        itDisplaysTheUpdatePrompt()

        describe.skip('when skip is selected', function () {
          before('interact', async function () {
            await terminal.input(keys.DOWN)
            await terminal.input(keys.DOWN)
            await terminal.input(keys.ENTER, 5000)
          })

          it('displays navigation', async function () {
            terminal.has('Pick a task or scope')
          })

          it('wrote in config', async function () {
            const pkg = JSON.parse(cachedPkg)
            const config = storage.readConfig()
            assert.equal(config.general.autoUpdate, pkg.version)
          })
        })
      })

      describe('when skipping indefinitely', function () {
        itDisplaysTheUpdatePrompt()

        describe('when never is selected', function () {
          before('interact', async function () {
            await terminal.input(keys.DOWN)
            await terminal.input(keys.DOWN)
            await terminal.input(keys.DOWN)
            await terminal.input(keys.ENTER, 5000)
          })

          it('displays navigation', async function () {
            terminal.has('Pick a task or scope')
          })

          it('wrote in config', async function () {
            const config = storage.readConfig()
            assert.equal(config.general.autoUpdate, 'never')
          })
        })
      })
    })
  })
})
