const buildHubDocs = require('./utils/build-hub-docs')
const Assistant = require('./Assistant')

class HubsAssistant extends Assistant {
  constructor(hre) {
    const config = require('./configs/hubs.json')
    config.tools = []
    super('hubs', config)
    this.injectAdditionalInstructions(
      hre.config.ethernaut.ai.hubs.additionalInstructions,
    )

    this.hre = hre
  }

  async process(thread, model) {
    const messages = await thread.getMessages()
    const lastMessage = messages.data[0]
    const query = lastMessage.content[0].text.value
    // Load and inject the OP Community Hub documentation based on the query
    const hubDocs = await buildHubDocs(query)
    this.config.instructions = this.config.instructions.replace(
      '[hub-docs]',
      hubDocs.join('\n\n'),
    )

    return await super.process(thread, model)
  }
}

module.exports = HubsAssistant
