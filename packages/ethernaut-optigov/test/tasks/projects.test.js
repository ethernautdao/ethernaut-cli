const assert = require('assert')
const Projects = require('../../src/internal/agora/Projects')
const hre = require('hardhat')
const output = require('ethernaut-common/src/ui/output')

describe('projects task', function () {
  let originalGetProjects,
    originalGetRoundProjects,
    originalGetLatestRound,
    originalOutputResultBox,
    originalOutputErrorBox

  beforeEach(function () {
    // Mock Projects class methods
    originalGetProjects = Projects.prototype.getProjects
    originalGetRoundProjects = Projects.prototype.getRoundProjects
    originalGetLatestRound = Projects.prototype.getLatestRound

    Projects.prototype.getProjects = async function ({
      limit: _limit,
      offset: _offset,
    }) {
      return [
        {
          name: 'Project 1',
          category: 'Category A',
          description: 'Description 1',
        },
        {
          name: 'Project 2',
          category: 'Category B',
          description: 'Description 2',
        },
      ]
    }

    Projects.prototype.getRoundProjects = async function ({
      roundId,
      limit: _limit,
      offset: _offset,
    }) {
      return [
        {
          name: `Project for Round ${roundId}`,
          category: 'Category A',
          description: 'Description for round project',
        },
      ]
    }

    Projects.prototype.getLatestRound = async function () {
      return 5
    }

    // Mock the output methods
    originalOutputResultBox = output.resultBox
    originalOutputErrorBox = output.errorBox

    output.resultBox = (content, title) => `${title}: ${content}`
    output.errorBox = (error) => `Error: ${error.message}`
  })

  afterEach(function () {
    // Restore the original methods after each test
    Projects.prototype.getProjects = originalGetProjects
    Projects.prototype.getRoundProjects = originalGetRoundProjects
    Projects.prototype.getLatestRound = originalGetLatestRound

    output.resultBox = originalOutputResultBox
    output.errorBox = originalOutputErrorBox
  })

  it('fetches a list of projects with limit and offset', async function () {
    const result = await hre.run(
      { scope: 'optigov', task: 'projects' },
      { limit: 2, offset: 0, round: 'any' },
    )
    assert.equal(
      result,
      'Projects:  - Project 1: Category A: Description 1\n\n - Project 2: Category B: Description 2',
    )
  })

  it('fetches projects filtered by name and category', async function () {
    const result = await hre.run(
      { scope: 'optigov', task: 'projects' },
      {
        round: 'any',
        limit: 2,
        offset: 0,
        name: 'Project 1',
        category: 'Category A',
      },
    )

    assert.equal(result, 'Projects:  - Project 1: Category A: Description 1')
  })

  it('handles errors gracefully when fetching projects fails', async function () {
    Projects.prototype.getProjects = async function () {
      throw new Error('Failed to fetch projects')
    }

    const result = await hre.run(
      { scope: 'optigov', task: 'projects' },
      { limit: 2, offset: 0, round: 'any' },
    )

    assert.equal(result, 'Error: Failed to fetch projects')
  })
})
