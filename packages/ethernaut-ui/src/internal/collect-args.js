const debug = require('common/src/debug')
const prompt = require('common/src/prompt')

let _hre

module.exports = async function collectArguments(providedArgs, task, hre) {
  debug.log(`Collecting parameters for task ${task.name}`, 'ui')

  _hre = hre

  // Merge all of the task's parameter definitions in the same array,
  // combining positional and named parameters.
  const paramDefinitions = task.positionalParamDefinitions.concat(
    Object.values(task.paramDefinitions),
  )

  const collectedArgs = {}
  for (let paramDef of paramDefinitions) {
    if (paramDef.name === 'nonInteractive') continue

    const providedArg = providedArgs[paramDef.name]
    const parsedArg = paramDef.parsedValue
    const argsSoFar = { ...providedArgs, ...collectedArgs }

    const collectedArg = await collectArg(
      paramDef,
      providedArg,
      parsedArg,
      argsSoFar,
    )
    if (collectedArg !== undefined) {
      debug.log(
        `Autocompletion for "${paramDef.name}" collected "${collectedArg}"`,
        'ui',
      )

      collectedArgs[paramDef.name] = collectedArg
    }
  }

  return collectedArgs
}

async function collectArg(paramDef, providedArg, parsedArg, argsSoFar) {
  debug.log(
    `Collecting "${paramDef.name}" - Provided: "${providedArg}", Parsed: "${parsedArg}"`,
    'ui',
  )

  let collectedArg

  // Is the parameter already provided,
  // but is not the default value injected by hardhat?
  // If so, skip autocompletion
  if (providedArg) {
    const isInjectedDefault =
      providedArg === paramDef.defaultValue && parsedArg === undefined
    if (!isInjectedDefault) {
      debug.log('Value was provided by the user, skipping autocompletion', 'ui')
      return providedArg
    }
  }

  // Does the parameter provide suggestions?
  let suggested
  if (paramDef.suggest) {
    suggested = await suggest(paramDef, argsSoFar)
  }

  // Does the parameter provide its own custom prompt function?
  if (!suggested && paramDef.prompt) {
    collectedArg = await customPrompt(paramDef, argsSoFar)
    if (collectedArg !== undefined) return collectedArg
  }

  // Mmnope, ok. Ask the user to input the parameter in raw text
  if (collectedArg === undefined)
    collectedArg = await rawPrompt(paramDef, suggested || paramDef.defaultValue)

  return collectedArg
}

async function suggest(paramDef, argsSoFar) {
  debug.log(`Running suggestions for "${paramDef.name}"`, 'ui')

  const suggestion = await paramDef.suggest({
    hre: _hre,
    ...argsSoFar,
  })
  debug.log(`Suggested value for "${paramDef.name}": "${suggestion}"`, 'ui')

  return suggestion
}

async function customPrompt(paramDef, argsSoFar) {
  debug.log(`Running custom prompt for "${paramDef.name}"`, 'ui')

  const collectedArg = await paramDef.prompt({
    hre: _hre,
    paramName: paramDef.name,
    paramDefault: paramDef.defaultValue,
    description: paramDef.description,
    ...argsSoFar,
  })

  return collectedArg
}

async function rawPrompt(paramDef, suggested) {
  debug.log(`Running raw prompt for "${paramDef.name}"`, 'ui')

  const description = paramDef.description
    ? ` (${paramDef.description.split('.')[0].substring(0, 150)})`
    : ''

  const result = await prompt({
    type: 'input',
    message: `Enter ${paramDef.name}${description}:`,
    initial: suggested,
  })

  if (result === 'false') return false
  if (result === 'true') return true

  return result
}
