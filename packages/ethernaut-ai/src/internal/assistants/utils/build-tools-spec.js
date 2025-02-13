const getNodes = require('ethernaut-common/src/tasks/get-nodes')
const flattenTasks = require('ethernaut-common/src/tasks/flatten')

module.exports = function buildToolsSpec(hre) {
  const tasks = flattenTasks(getNodes(hre))

  const tools = []

  tasks.forEach((t) => {
    if (t.scope && t.scope === 'vars') return

    tools.push({
      type: 'function',
      function: {
        name: t.scope ? `${t.scope}_${t.name}` : t.name, // new regex does not allow periods
        description: t._description,
        parameters: collectParameterSpecs(t),
      },
    })
  })

  return tools
}

function collectParameterSpecs(task) {
  const properties = {}
  const required = []

  const paramDefinitions = task.positionalParamDefinitions.concat(
    Object.values(task.paramDefinitions),
  )

  for (const param of paramDefinitions) {
    const name = param.name

    properties[name] = {
      type: 'string',
      description: param.description,
    }

    // ethernaut-ui makes all parameters optional,
    // but injects an "originallyOptional" property.
    // So, prioritize the "originallyOptional" property.
    let isOptional = false
    if ('originallyOptional' in param) {
      isOptional = param.originallyOptional
    } else {
      isOptional = param.isOptional
    }

    if (!isOptional) {
      required.push(name)
    }
  }

  return {
    type: 'object',
    properties,
    required,
  }
}
