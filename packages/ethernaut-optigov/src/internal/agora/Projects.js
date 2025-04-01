const debug = require('ethernaut-common/src/ui/debug')

class Projects {
  constructor(agora) {
    this.agora = agora
  }

  async getLatestRound() {
    return 5 // Placeholder, you can implement this logic
  }

  async getProjects({ limit = 10, offset = 0 } = {}) {
    try {
      const axiosInstance = this.agora.createAxiosInstance()
      const response = await axiosInstance.get('/projects', {
        params: { limit, offset },
      })

      debug.log(`Projects: ${response.data}`, 'ethernaut-optigov')
      return response.data.data
    } catch (error) {
      this.agora.handleError(error)
    }
  }

  async getRoundProjects({ roundId, limit = 10, offset = 0 }) {
    try {
      const axiosInstance = this.agora.createAxiosInstance()
      const response = await axiosInstance.get(
        `/retrofunding/rounds/${roundId}/projects`,
        {
          params: { limit, offset },
        },
      )

      debug.log(`Round Projects: ${response.data}`, 'ethernaut-optigov')
      return response.data.data
    } catch (error) {
      this.agora.handleError(error)
    }
  }
}

module.exports = Projects
