const types = require('ethernaut-common/src/validation/types')
const output = require('ethernaut-common/src/ui/output')
const Projects = require('../internal/agora/Projects')
const Rounds = require('../internal/agora/Rounds')
const Agora = require('../internal/agora/Agora')

require('../scopes/optigov')
  .task(
    'projects',
    'Prints a list of projects registered in RetroPGF, given specified filters',
  )
  .addParam(
    'round',
    'The round number to query. Defaults to "latest". Can also be "any" to query all rounds.',
    'latest',
    types.string,
  )
  .addOptionalParam(
    'name',
    'A filter to apply to the project names',
    undefined,
    types.string,
  )
  .addOptionalParam(
    'category',
    'A filter to apply to the project category',
    undefined,
    types.string,
  )
  .setAction(async ({ round, name, category }) => {
    try {
      const projects = await getProjects(round)

      const filteredProjects = filterProjects(projects, name, category)

      return output.resultBox(printProjects(filteredProjects), 'Projects')
    } catch (err) {
      return output.errorBox(err)
    }
  })

function filterProjects(projects, name, category) {
  const nameLower = name?.toLowerCase()
  const categoryLower = category?.toLowerCase()

  return projects.filter((p) => {
    // Filter by name if it's provided
    const matchesName = nameLower
      ? p.name.toLowerCase().includes(nameLower)
      : true

    // Filter by category if it's provided
    const matchesCategory = categoryLower
      ? p.category.toLowerCase() === categoryLower
      : true

    return matchesName && matchesCategory
  })
}

function printProjects(projects) {
  const strs = []

  for (const project of projects) {
    strs.push(` - ${project.name}: ${project.category}: ${project.description}`)
  }

  return strs.join('\n\n')
}

async function getProjects(round) {
  const agora = new Agora()
  const projects = new Projects(agora)
  const rounds = new Rounds(agora)

  let roundId

  if (round === 'latest') {
    roundId = await rounds.getLatestRound()
    console.log(`Latest round: ${roundId}`)
  }

  if (!roundId) {
    return await projects.getProjects()
  }

  return await projects.getRoundProjects({ roundId })
}
