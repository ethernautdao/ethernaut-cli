const OpenAI = require('openai')

let _openai

module.exports = function openai() {
  if (!_openai) {
    _openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      requestOptions: {
        headers: {
          'OpenAI-Beta': 'assistants=v2',
        },
      },
    })
  }
  return _openai
}
