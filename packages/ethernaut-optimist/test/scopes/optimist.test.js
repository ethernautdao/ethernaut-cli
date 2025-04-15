const assert = require('assert')

describe('optimist', function () {
  it('has a "optimist" scope', async function () {
    assert.notEqual(hre.scopes['optimist'], undefined)
  })
})
