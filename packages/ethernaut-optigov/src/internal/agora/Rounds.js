const debug = require('ethernaut-common/src/ui/debug')

class Rounds {
  constructor(agora) {
    this.agora = agora
  }

  async getRounds({ limit = 10, offset = 0 } = {}) {
    try {
      const axiosInstance = this.agora.createAxiosInstance()
      const response = await axiosInstance.get('/retrofunding/rounds', {
        params: { limit, offset },
      })

      debug.log(`Rounds: ${JSON.stringify(response.data)}`, 'ethernaut-optigov')
      return response.data
    } catch (error) {
      this.agora.handleError(error)
    }
  }

  async getRoundById(roundId) {
    try {
      const axiosInstance = this.agora.createAxiosInstance()
      const response = await axiosInstance.get(
        `/retrofunding/rounds/${roundId}`,
      )

      debug.log(
        `Round ${roundId}: ${JSON.stringify(response.data)}`,
        'ethernaut-optigov',
      )
      return response.data
    } catch (error) {
      this.agora.handleError(error)
    }
  }

  // Get the latest RetroFunding round by finding the max roundId
  async getLatestRound() {
    try {
      const rounds = await this.getRounds({ limit: 1000, offset: 0 })
      if (rounds && rounds.length > 0) {
        const latestRound = rounds.reduce((max, round) =>
          round.roundId > max.roundId ? round : max,
        )
        debug.log(
          `Latest Round: ${JSON.stringify(latestRound.roundId)}`,
          'ethernaut-optigov',
        )
        // Hardcoded to 6 until the Agora API is fixed
        // TODO: Remove this line and uncomment the next line
        return 6
        // return latestRound.roundId
      }
      return 0
    } catch (error) {
      this.agora.handleError(error)
    }
  }
}

module.exports = Rounds
