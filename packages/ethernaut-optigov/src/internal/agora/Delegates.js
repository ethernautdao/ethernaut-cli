const debug = require('ethernaut-common/src/ui/debug')

class Delegates {
  constructor(agora) {
    this.agora = agora
  }

  // Get a list of delegates with pagination
  async getDelegates({ limit = 10, offset = 0, sort } = {}) {
    try {
      const axiosInstance = this.agora.createAxiosInstance()
      const response = await axiosInstance.get('/delegates', {
        params: { limit, offset, sort },
      })

      debug.log(`Delegates: ${response.data.data}`, 'ethernaut-optigov')
      return response.data.data.map((delegate) => ({
        address: delegate.address,
        votingPower: delegate.votingPower?.total,
        twitter: delegate.statement?.payload?.twitter,
        discord: delegate.statement?.payload?.discord,
        delegateStatement:
          delegate.statement?.payload?.delegateStatement?.substring(0, 100),
      }))
    } catch (error) {
      this.agora.handleError(error)
    }
  }

  // Get a specific delegate by address or ENS name
  async getDelegateById(addressOrEnsName) {
    try {
      const axiosInstance = this.agora.createAxiosInstance()
      const response = await axiosInstance.get(`/delegates/${addressOrEnsName}`)

      debug.log(`Delegate: ${response.data}`, 'ethernaut-optigov')
      const data = response.data
      return {
        address: data.address,
        votingPower: {
          advanced: data.votingPower.advanced,
          direct: data.votingPower.direct,
          total: data.votingPower.total,
        },
        votingPowerRelativeToVotableSupply:
          data.votingPowerRelativeToVotableSupply,
        votingPowerRelativeToQuorum: data.votingPowerRelativeToQuorum,
        proposalsCreated: data.proposalsCreated,
        proposalsVotedOn: data.proposalsVotedOn,
        votedFor: data.votedFor,
        votedAgainst: data.votedAgainst,
        votedAbstain: data.votedAbstain,
        votingParticipation: data.votingParticipation,
        lastTenProps: data.lastTenProps,
        numOfDelegators: data.numOfDelegators,
      }
    } catch (error) {
      this.agora.handleError(error)
    }
  }

  // Get a paginated list of votes for a specific delegate
  async getDelegateVotes({
    addressOrEnsName,
    limit = 10,
    offset = 0,
    sort,
  } = {}) {
    try {
      const axiosInstance = this.agora.createAxiosInstance()
      const response = await axiosInstance.get(
        `/delegates/${addressOrEnsName}/votes`,
        {
          params: { limit, offset, sort },
        },
      )

      debug.log(
        `Votes for Delegate ${addressOrEnsName}: ${response.data.data}`,
        'ethernaut-optigov',
      )
      return response.data.data.map((vote) => ({
        transactionHash: vote.transactionHash,
        proposalId: vote.proposalId,
        address: vote.address,
        support: vote.support,
        reason: vote.reason,
        weight: vote.weight,
        proposalValue: vote.proposalValue,
        proposalTitle: vote.proposalTitle,
        proposalType: vote.proposalType,
        timestamp: vote.timestamp,
      }))
    } catch (error) {
      this.agora.handleError(error)
    }
  }

  // Get a paginated list of delegators for a specific delegate
  async getDelegateDelegators({
    addressOrEnsName,
    limit = 10,
    offset = 0,
    sort,
  } = {}) {
    try {
      const axiosInstance = this.agora.createAxiosInstance()
      const response = await axiosInstance.get(
        `/delegates/${addressOrEnsName}/delegators`,
        {
          params: { limit, offset, sort },
        },
      )

      debug.log(
        `Delegators for Delegate ${addressOrEnsName}: ${response.data.data}`,
        'ethernaut-optigov',
      )
      return response.data.data.map((delegator) => ({
        from: delegator.from,
        allowance: delegator.allowance,
        timestamp: delegator.timestamp,
        type: delegator.type,
        amount: delegator.amount,
      }))
    } catch (error) {
      this.agora.handleError(error)
    }
  }
}

module.exports = Delegates
