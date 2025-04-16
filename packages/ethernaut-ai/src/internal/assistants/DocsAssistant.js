const buildDocsDocs = require('./utils/build-docs-docs')
const Assistant = require('./Assistant')

class DocsAssistant extends Assistant {
  constructor(hre) {
    const config = require('./configs/docs.json')
    config.tools = []
    super('docs', config)
    this.injectAdditionalInstructions(
      hre.config.ethernaut.ai.docs.additionalInstructions,
    )

    this.hre = hre
  }

  async process(thread, model) {
    const messages = await thread.getMessages()
    const lastMessage = messages.data[0]
    const query = lastMessage.content[0].text.value
    // Load and inject the OP Developer Docs based on the query
    const DocsDocs = await buildDocsDocs(query)
    this.config.instructions = this.config.instructions.replace(
      '[docs-docs]',
      DocsDocs.join('\n\n'),
    )

    return await super.process(thread, model)
  }
}

module.exports = DocsAssistant
