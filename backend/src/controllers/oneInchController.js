const oneInchService = require('../services/oneInchService')

const oneInchController = {
  // Get swap quote from 1inch
  async getSwapQuote(req, res) {
    try {
      const { chainId, fromToken, toToken, amount, fromAddress, slippage } = req.query
      
      console.log('Getting 1inch quote:', { chainId, fromToken, toToken, amount })

      const quote = await oneInchService.getSwapQuote(
        chainId,
        fromToken,
        toToken,
        amount,
        fromAddress,
        parseFloat(slippage) || 1
      )

      res.json(quote)
    } catch (error) {
      console.error('1inch quote controller error:', error)
      res.status(500).json({ error: 'Failed to get swap quote' })
    }
  },

  // Build swap transaction
  async buildSwapTransaction(req, res) {
    try {
      const { chainId, fromToken, toToken, amount, fromAddress, slippage } = req.body
      
      const swapTx = await oneInchService.buildSwapTransaction(
        chainId,
        fromToken,
        toToken,
        amount,
        fromAddress,
        parseFloat(slippage) || 1
      )

      res.json(swapTx)
    } catch (error) {
      console.error('1inch swap build controller error:', error)
      res.status(500).json({ error: 'Failed to build swap transaction' })
    }
  },

  // Get token list
  async getTokenList(req, res) {
    try {
      const { chainId } = req.params
      
      const tokens = await oneInchService.getTokenList(chainId)
      res.json({ tokens })
    } catch (error) {
      console.error('1inch tokens controller error:', error)
      res.status(500).json({ error: 'Failed to get token list' })
    }
  },

  // Get token prices
  async getTokenPrices(req, res) {
    try {
      const { chainId } = req.params
      const { tokens } = req.query
      
      const tokenArray = tokens ? tokens.split(',') : ['ETH', 'USDC', 'USDT']
      const prices = await oneInchService.getTokenPrices(chainId, tokenArray)
      
      res.json(prices)
    } catch (error) {
      console.error('1inch prices controller error:', error)
      res.status(500).json({ error: 'Failed to get token prices' })
    }
  },

  // Get Fusion+ quote for cross-chain
  async getFusionPlusQuote(req, res) {
    try {
      const { fromChainId, toChainId, fromToken, toToken, amount, walletAddress } = req.body
      
      console.log('Getting Fusion+ quote:', { fromChainId, toChainId, fromToken, toToken, amount })

      const quote = await oneInchService.getFusionPlusQuote(
        fromChainId,
        toChainId,
        fromToken,
        toToken,
        amount,
        walletAddress
      )

      res.json(quote)
    } catch (error) {
      console.error('Fusion+ quote controller error:', error)
      res.status(500).json({ error: 'Failed to get Fusion+ quote' })
    }
  }
}

module.exports = oneInchController