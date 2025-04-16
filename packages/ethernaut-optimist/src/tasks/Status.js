const output = require('ethernaut-common/src/ui/output')
const getOptimismStatus = require('../internal/optimism-status')

require('../scopes/optimist')
  .task('status', 'Shows the status of the Optimism network')

  .setAction(async () => {
    try {
      const statusObj = await getOptimismStatus()
      const result = statusObj.components.components.map((x) => ({
        Group: x.group?.name || x.name,
        Name: x.name,
        Status: x.status || 'OPERATIONAL',
      }))
      console.table(result)
      return
    } catch (err) {
      return output.errorBox(err)
    }
  })
