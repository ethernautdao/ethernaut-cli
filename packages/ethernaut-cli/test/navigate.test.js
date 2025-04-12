const { Terminal } = require('ethernaut-common/src/test/terminal')

describe('navigation', function () {
  const terminal = new Terminal()

  describe('when navigating the root scope', function () {
    before('nav', async function () {
      await terminal.run('hardhat', 9000)
    })

    it('shows the expected scopes', async function () {
      terminal.has('[ai]')
      terminal.has('[util]')
      terminal.has('[interact]')
      terminal.has('[network]')
      terminal.has('[wallet]')
      terminal.has('[challenges]')
      terminal.has('[metrics]')
      terminal.has('[optigov]')
    })

    it('does not show unwanted scopes', async function () {
      terminal.notHas('[vars]')
    })

    it('does not show unwanted tasks', async function () {
      terminal.notHas('check')
      terminal.notHas('compile')
      terminal.notHas('clean')
      terminal.notHas('flatten')
      terminal.notHas('test')
      terminal.notHas('navigate')
      terminal.notHas('run Runs a user-defined')
      terminal.notHas('node Starts')
      terminal.notHas('help')
      terminal.notHas('console')
    })
  })

  describe('when navigating the network scope', function () {
    before('nav', async function () {
      await terminal.run('hardhat network', 5000)
    })

    it('displays all tasks', async function () {
      terminal.has('set')
      terminal.has('add')
      terminal.has('current')
      terminal.has('edit')
      terminal.has('info')
      terminal.has('list')
      terminal.has('node')
      terminal.has('remove')
    })
  })
})
