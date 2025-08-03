const { ethers } = require('ethers')

const validation = {
  // Validate Ethereum address
  isValidEthereumAddress: (address) => {
    try {
      return ethers.utils.isAddress(address)
    } catch {
      return false
    }
  },

  // Validate Cosmos address  
  isValidCosmosAddress: (address) => {
    const cosmosRegex = /^[a-z]+1[a-z0-9]{38,58}$/
    return cosmosRegex.test(address)
  },

  // Validate amount
  isValidAmount: (amount) => {
    const num = parseFloat(amount)
    return !isNaN(num) && num > 0 && isFinite(num)
  },

  // Validate timelock
  isValidTimelock: (timelock) => {
    const now = Math.floor(Date.now() / 1000)
    const minTimelock = parseInt(process.env.MINIMUM_TIMELOCK_DURATION) || 3600
    const maxTimelock = parseInt(process.env.MAXIMUM_TIMELOCK_DURATION) || 86400
    
    return timelock > now + minTimelock && timelock <= now + maxTimelock
  },

  // Validate hashlock
  isValidHashlock: (hashlock) => {
    return typeof hashlock === 'string' && 
           hashlock.length === 64 && 
           /^[a-fA-F0-9]+$/.test(hashlock)
  },

  // Validate swap ID
  isValidSwapId: (swapId) => {
    return typeof swapId === 'string' && 
           swapId.length === 66 && 
           swapId.startsWith('0x') &&
           /^0x[a-fA-F0-9]+$/.test(swapId)
  },

  // Validate chain
  isValidChain: (chain) => {
    return ['ethereum', 'cosmos'].includes(chain)
  },

  // Validate token symbol
  isValidToken: (token, chain) => {
    const ethereumTokens = ['ETH', 'USDC', 'USDT', 'DAI']
    const cosmosTokens = ['ATOM', 'OSMO', 'JUNO', 'STARS']
    
    if (chain === 'ethereum') {
      return ethereumTokens.includes(token)
    } else if (chain === 'cosmos') {
      return cosmosTokens.includes(token)
    }
    
    return false
  }
}

module.exports = validation