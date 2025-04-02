const axios = require('axios')
const EthernautCliError = require('ethernaut-common/src/error/error')
const debug = require('ethernaut-common/src/ui/debug')

const API_BASE_URL = 'https://vote.optimism.io/api/v1'
const AGORA_API_KEY = process.env.AGORA_API_KEY

class Agora {
  constructor() {
    this.apiKey = AGORA_API_KEY
    this.apiBaseUrl = API_BASE_URL
    this.bearerToken = null
  }

  // Axios instance setup
  createAxiosInstance() {
    const headers = {
      Authorization: this.bearerToken
        ? `Bearer ${this.bearerToken}`
        : `Bearer ${this.apiKey}`,
    }

    return axios.create({
      baseURL: this.apiBaseUrl,
      headers,
    })
  }

  // Handle common API errors
  handleError(error) {
    if (error.response) {
      throw new EthernautCliError(
        'ethernaut-optigov',
        `Http status error: ${error.response.data}`,
      )
    } else {
      throw new EthernautCliError(
        'ethernaut-optigov',
        `Http status error: ${error.message}`,
      )
    }
  }

  // common method for getting API spec
  async getSpec() {
    try {
      const axiosInstance = this.createAxiosInstance()
      const response = await axiosInstance.get('/spec')
      debug.log(`Spec: ${response.data}`, 'ethernaut-optigov')
      return response.data
    } catch (error) {
      this.handleError(error)
    }
  }

  // Set the bearer token after authentication
  setBearerToken(token) {
    this.bearerToken = token
  }
}

module.exports = Agora
