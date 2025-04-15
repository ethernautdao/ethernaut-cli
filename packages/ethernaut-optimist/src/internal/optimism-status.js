const fetch = require('node-fetch')

const OVERALL_STATUS_URL = 'https://status.optimism.io/summary.json'
const COMPONENT_STATUS_URL = 'https://status.optimism.io/v2/components.json'

async function getOptimismStatus() {
  try {
    const [overallResponse, componentResponse] = await Promise.all([
      fetch(OVERALL_STATUS_URL),
      fetch(COMPONENT_STATUS_URL),
    ])

    if (!overallResponse.ok) {
      throw new Error(`HTTP error! status: ${overallResponse.status}`)
    }
    if (!componentResponse.ok) {
      throw new Error(`HTTP error! status: ${componentResponse.status}`)
    }

    const [overallData, componentData] = await Promise.all([
      overallResponse.json(),
      componentResponse.json(),
    ])

    return {
      overall: {
        page: overallData.page,
        activeIncidents: overallData.activeIncidents,
        activeMaintenances: overallData.activeMaintenances,
      },
      components: {
        components: componentData.components,
      },
    }
  } catch (error) {
    console.error('Error fetching Optimism status:', error)
    throw error
  }
}

module.exports = getOptimismStatus
