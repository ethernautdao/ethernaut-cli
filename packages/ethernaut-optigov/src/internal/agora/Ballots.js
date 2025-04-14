const debug = require('ethernaut-common/src/ui/debug')

class Ballots {
  constructor(agora) {
    this.agora = agora
  }

  // Retrieve a specific ballot for a RetroFunding round
  async getBallot(roundId, addressOrEnsName) {
    try {
      const axiosInstance = this.agora.createAxiosInstance()
      const response = await axiosInstance.get(
        `/retrofunding/rounds/${roundId}/ballots/${addressOrEnsName}`,
      )
      // Convert response.data to a string if it's not one
      const dataString =
        typeof response.data === 'string'
          ? response.data
          : JSON.stringify(response.data)
      debug.log(`Ballot: ${dataString}`, 'ethernaut-optigov')
      return response.data
    } catch (error) {
      this.agora.handleError(error)
    }
  }

  // Submit the ballot content as final for the round
  async submitBallot(roundId, addressOrEnsName, payload) {
    try {
      const axiosInstance = this.agora.createAxiosInstance()
      const response = await axiosInstance.post(
        `/retrofunding/rounds/${roundId}/ballots/${addressOrEnsName}/submit`,
        payload,
      )
      debug.log(`Submit Ballot Response: ${response.data}`, 'ethernaut-optigov')
      return response.data
    } catch (error) {
      this.agora.handleError(error)
    }
  }
}

module.exports = Ballots
