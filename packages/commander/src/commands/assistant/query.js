const { Command } = require('commander');
const { ask } = require('../../internal/chatgpt');
const logger = require('../../internal/logger');

const command = new Command();

command
  .name('query')
  .description('Ask a question to the assistant')
  .argument('<query>', 'Query to ask')
  .action(async (args) => {
    const query = args;
    const response = await ask(query);
    logger.output(response);
  });

module.exports = command;
