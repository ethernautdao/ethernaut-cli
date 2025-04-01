const debug = require('ethernaut-common/src/ui/debug')

class Proposals {
  constructor(agora) {
    this.agora = agora
  }

  // Get a list of proposals with pagination
  async getProposals({ limit = 10, offset = 0 } = {}) {
    try {
      const axiosInstance = this.agora.createAxiosInstance()
      const response = await axiosInstance.get('/proposals', {
        params: { limit, offset },
      })

      debug.log(`Proposals: ${response.data.data}`, 'ethernaut-optigov')
      return response.data.data
    } catch (error) {
      this.agora.handleError(error)
    }
  }

  // Get a specific proposal by proposalId
  async getProposalById(proposalId) {
    try {
      const axiosInstance = this.agora.createAxiosInstance()
      const response = await axiosInstance.get(`/proposals/${proposalId}`)

      debug.log(`Proposal: ${response.data}`, 'ethernaut-optigov')
      return response.data
    } catch (error) {
      this.agora.handleError(error)
    }
  }

  // Get a paginated list of votes for a specific proposal
  async getProposalVotes({ proposalId, limit = 10, offset = 0 }) {
    try {
      const axiosInstance = this.agora.createAxiosInstance()
      const response = await axiosInstance.get(
        `/proposals/${proposalId}/votes`,
        {
          params: { limit, offset },
        },
      )
      debug.log(
        `Votes for Proposal ${proposalId}: ${response.data.data}`,
        'ethernaut-optigov',
      )
      return response.data.data
    } catch (error) {
      this.agora.handleError(error)
    }
  }
}

module.exports = Proposals
