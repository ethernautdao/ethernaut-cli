const assert = require('assert')

describe('optiforum', function () {
  it('has a "optiforum" scope', async function () {
    assert.notEqual(hre.scopes['optiforum'], undefined)
  })
})
