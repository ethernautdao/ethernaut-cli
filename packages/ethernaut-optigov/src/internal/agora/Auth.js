const debug = require('ethernaut-common/src/ui/debug')

class Auth {
  constructor(agora) {
    this.agora = agora
  }

  async getNonce() {
    try {
      const axiosInstance = this.agora.createAxiosInstance()
      const response = await axiosInstance.get('/auth/nonce')
      debug.log(`Nonce: ${response.data.nonce}`, 'ethernaut-optigov')
      return response.data.nonce
    } catch (error) {
      this.agora.handleError(error)
    }
  }

  async authenticateWithAgora(message, signature, nonce) {
    try {
      const axiosInstance = this.agora.createAxiosInstance()
      const response = await axiosInstance.post('/auth/verify', {
        message,
        signature,
        nonce,
      })

      debug.log('Auth Response Status:', response.status)

      // Set the Bearer token for future requests
      this.agora.setBearerToken(response.data.access_token)

      return response.data.access_token
    } catch (error) {
      this.agora.handleError(error)
    }
  }
}

module.exports = Auth
