const assert = require('assert')

describe('ai', function () {
  it('has an "ai" scope', async function () {
    assert.notEqual(hre.scopes['ai'], undefined)
  })
})

describe('OpenAI Client', () => {
  let originalEnv

  beforeEach(() => {
    originalEnv = process.env.OPENAI_API_KEY
    process.env.OPENAI_API_KEY = 'test-key'
  })

  afterEach(() => {
    process.env.OPENAI_API_KEY = originalEnv
  })

  it('should create an OpenAI instance with the correct configuration', () => {
    const openaiClient = require('../../src/internal/openai')()

    assert.ok(openaiClient)
    assert.strictEqual(openaiClient._options.apiKey, 'test-key')
    assert.deepStrictEqual(openaiClient._options.requestOptions.headers, {
      'OpenAI-Beta': 'assistants=v2',
    })
  })

  it('should reuse the same instance in multiple calls', () => {
    const firstInstance = require('../../src/internal/openai')()
    const secondInstance = require('../../src/internal/openai')()

    assert.strictEqual(firstInstance, secondInstance)
  })
})
