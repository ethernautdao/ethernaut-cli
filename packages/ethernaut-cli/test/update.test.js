const fs = require('fs')
const storage = require('ethernaut-common/src/io/storage')
const { Terminal, keys } = require('ethernaut-common/src/test/terminal')
const assert = require('assert')
const update = require('../src/update')

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
    await terminal.run('hardhat', 2000)
    await terminal.run('hardhat', 3000)
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

  it('should skip update when autoUpdate matches update version', async function () {
    const pkg = { version: '0.0.0' }
    const config = { general: { autoUpdate: '1.0.0' } }
    storage.saveConfig(config)
    await update.checkAutoUpdate(pkg)
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

    describe('when auto update matches update version', function () {
      before('modify', async function () {
        const config = storage.readConfig()
        config.general = { autoUpdate: '1.0.0' } // Set to the version that will be available
        storage.saveConfig(config)
      })

      before('start cli', async function () {
        await triggerUpdate()
      })

      it('should not show update prompt', async function () {
        terminal.hasNot('A new version of the ethernaut-cli is available')
      })
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
        const config = storage.readConfig()
        config.general.autoUpdate = pkg.version
        storage.saveConfig(config)
      })

      before('start cli', async function () {
        await triggerUpdate()
      })

      it('displays navigation', async function () {
        terminal.has('Pick a task or scope')
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
            await terminal.input(keys.ENTER, 1000)
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
            await terminal.input(keys.ENTER, 2000)
          })

          it('displays installation', async function () {
            terminal.has('Installing update...')
          })

          it('hides prompts and calls install when installing update', async function () {
            // Mock the dependencies
            const originalHidePrompts =
              require('ethernaut-common/src/ui/prompt').hidePrompts
            const originalSpawn = require('child_process').spawn

            let hidePromptsCalled = false
            let spawnCalled = false

            require('ethernaut-common/src/ui/prompt').hidePrompts = (value) => {
              hidePromptsCalled = value === true
            }

            require('child_process').spawn = (cmd, args) => {
              spawnCalled =
                cmd === 'npm' &&
                args[0] === 'install' &&
                args[1] === '-g' &&
                args[2] === 'ethernaut-cli'
            }

            // Call the update function with a mock package
            await update.checkAutoUpdate({ version: '0.0.0' })

            // Restore original functions
            require('ethernaut-common/src/ui/prompt').hidePrompts =
              originalHidePrompts
            require('child_process').spawn = originalSpawn

            // Verify the behavior
            assert(
              hidePromptsCalled,
              'hidePrompts should have been called with true',
            )
            assert(
              spawnCalled,
              'spawn should have been called with npm install command',
            )
          })
        })
      })

      describe('when skipping', function () {
        itDisplaysTheUpdatePrompt()

        describe('when skip is selected', function () {
          before('interact', async function () {
            await terminal.input(keys.DOWN)
            await terminal.input(keys.DOWN)
            await terminal.input(keys.ENTER, 1000)
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
            await terminal.input(keys.ENTER, 1000)
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
