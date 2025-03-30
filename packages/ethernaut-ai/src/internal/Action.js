const debug = require('ethernaut-common/src/ui/debug')
const chalk = require('chalk')
const toCliSyntax = require('ethernaut-common/src/ui/syntax')
const getTaskUsage = require('ethernaut-common/src/tasks/usage')
const { copy } = require('copy-paste')

class Action {
  /**
   * Incoming toolCall is an object with the following structure:
   * {
   *   id: '...',
   *   function: {
   *     name: '...',
   *     arguments: '{"value":"...", "fix":"..."}'
   *   }
   * }
   */
  constructor(toolCall, hre) {
    this.hre = hre
    this.id = toolCall.id
    this.function = toolCall.function
    this.parseTask()
    this.parseArgs()
  }

  parseTask() {
    const nameComponents = this.function.name.split('_')

    if (nameComponents.length === 1) {
      this.taskName = nameComponents[0]
    } else {
      this.scopeName = nameComponents[0]
      this.taskName = nameComponents[1]
    }

    if (this.scopeName) {
      this.scope = this.hre.scopes[this.scopeName]
      this.task = this.scope.tasks[this.taskName]
    } else {
      this.task = this.hre.tasks[this.taskName]
    }
  }

  parseArgs() {
    this.args = JSON.parse(this.function.arguments)
    Object.entries(this.args).forEach(([name, value]) => {
      value = value === 'true' ? true : value
      value = value === 'false' ? false : value
      this.args[name] = value
    })
  }

  async execute(hre, noConfirm = false) {
    let collectedOutput = ''

    // Disable global interactivity setting
    const prevNonInteractive = hre.ethernaut?.ui?.nonInteractive || false
    if (!hre.ethernaut) hre.ethernaut = {}
    if (!hre.ethernaut.ui) hre.ethernaut.ui = {}
    hre.ethernaut.ui.nonInteractive = true

    if (noConfirm) {
      this.args.noConfirm = true
    }

    if (this.scopeName) {
      debug.log(
        `Calling: ${this.scopeName} ${this.taskName} ${JSON.stringify(
          this.args,
          null,
          2,
        )}`,
        'ai',
      )
      collectedOutput += await hre.run(
        { scope: this.scopeName, task: this.taskName },
        this.args,
      )
    } else {
      debug.log(
        `Calling: ${this.taskName} ${JSON.stringify(this.args, null, 2)}`,
        'ai',
      )
      collectedOutput += await hre.run(this.taskName, this.args)
    }

    // Restore global interactivity setting
    if (prevNonInteractive !== undefined) {
      hre.ethernaut.ui.nonInteractive = prevNonInteractive
    }

    return {
      tool_call_id: this.id,
      output: collectedOutput,
    }
  }

  getShortDescription() {
    let description = ''
    description += `${toCliSyntax(this.task, this.args)}`
    return description
  }

  getDescription() {
    let description = ''

    const syntax = toCliSyntax(this.task, this.args)
    copy(syntax)

    description += chalk.bold(`${syntax}`)
    description += chalk.dim(' (copied to clipboard)\n')
    description += chalk.dim(`Usage: ${getTaskUsage(this.task)}\n`)
    description += chalk.dim(`Desc: ${this.task.description}`)
    return description
  }
}

module.exports = Action
