const axios = require('axios')

class OneInchService {
  constructor() {
    this.apiKey = process.env.ONEINCH_API_KEY
    this.baseURL = process.env.ONEINCH_API_BASE || 'https://api.1inch.dev'
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'accept': 'application/json',
        'content-type': 'application/json'
      },
      timeout: 10000
    })
  }

  async getSwapQuote(chainId, fromToken, toToken, amount, fromAddress, slippage = 1) {
    try {
      const response = await this.client.get(`/swap/v5.2/${chainId}/quote`, {
        params: {
          src: fromToken,
          dst: toToken,
          amount,
          from: fromAddress,
          slippage,
          disableEstimate: false,
          allowPartialFill: true
        }
      })
      return response.data
    } catch (error) {
      console.error('1inch quote failed:', error.response?.data || error.message)
      // Return mock data for demo if API fails
      return {
        fromTokenAmount: amount,
        toTokenAmount: (parseFloat(amount) * 0.95).toString(),
        protocols: [{ name: 'Mock DEX' }],
        estimatedGas: 150000,
        mock: true
      }
    }
  }

  async buildSwapTransaction(chainId, fromToken, toToken, amount, fromAddress, slippage = 1) {
    try {
      const response = await this.client.get(`/swap/v5.2/${chainId}/swap`, {
        params: {
          src: fromToken,
          dst: toToken,
          amount,
          from: fromAddress,
          slippage,
          disableEstimate: false,
          allowPartialFill: true
        }
      })
      return response.data
    } catch (error) {
      console.error('1inch swap build failed:', error.response?.data || error.message)
      throw error
    }
  }

  async getTokenList(chainId) {
    try {
      const response = await this.client.get(`/swap/v5.2/${chainId}/tokens`)
      return response.data.tokens
    } catch (error) {
      console.error('1inch tokens failed:', error.response?.data || error.message)
      // Return mock tokens for demo
      return {
        'ETH': { symbol: 'ETH', name: 'Ethereum', decimals: 18, address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee' },
        'USDC': { symbol: 'USDC', name: 'USD Coin', decimals: 6, address: '0xa0b86a33e6ba89c01ddc3415f3f0bb9b5dc9fd50' },
        'USDT': { symbol: 'USDT', name: 'Tether', decimals: 6, address: '0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0' }
      }
    }
  }

  async getTokenPrices(chainId, tokens) {
    try {
      const response = await this.client.get(`/price/v1.1/${chainId}`, {
        params: {
          tokens: tokens.join(','),
          currency: 'USD'
        }
      })
      return response.data
    } catch (error) {
      console.error('1inch prices failed:', error.response?.data || error.message)
      // Return mock prices for demo
      return {
        'ETH': '2340.50',
        'USDC': '1.00',
        'USDT': '1.00',
        'ATOM': '12.45'
      }
    }
  }

  async getFusionPlusQuote(fromChainId, toChainId, fromToken, toToken, amount, walletAddress) {
    try {
      // This is the cross-chain Fusion+ functionality
      const response = await this.client.post(`/fusion-plus/v1.0/quote`, {
        fromChainId,
        toChainId,
        fromTokenAddress: fromToken,
        toTokenAddress: toToken,
        amount,
        walletAddress,
        enableEstimate: true
      })
      return response.data
    } catch (error) {
      console.error('1inch Fusion+ quote failed:', error.response?.data || error.message)
      // Return mock data for cross-chain demo
      return {
        fromChainId,
        toChainId,
        fromTokenAmount: amount,
        toTokenAmount: (parseFloat(amount) * 0.92).toString(), // Include cross-chain fees
        estimatedTime: 720, // 12 minutes
        protocols: ['1inch Fusion+', 'HTLC Bridge'],
        mock: true
      }
    }
  }
}

module.exports = new OneInchService()