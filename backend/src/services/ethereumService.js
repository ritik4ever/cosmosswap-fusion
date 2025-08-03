const { ethers } = require('ethers')

// Configuration
const ETHEREUM_RPC_URL = process.env.ETHEREUM_RPC_URL || 'https://eth-sepolia.g.alchemy.com/v2/your-api-key'
const CONTRACT_ADDRESS = process.env.ETHEREUM_CONTRACT_ADDRESS || '0x...'
const PRIVATE_KEY = process.env.ETHEREUM_PRIVATE_KEY || ''

// Contract ABI (simplified)
const CONTRACT_ABI = [
  "function initiateSwap(bytes32 hashlock, uint256 timelock, address receiver, address token, uint256 amount) external payable returns (bytes32)",
  "function withdraw(bytes32 swapId, bytes32 preimage) external",
  "function refund(bytes32 swapId) external",
  "function getSwap(bytes32 swapId) external view returns (bytes32, uint256, address, address, address, uint256, bool, bool, bytes32)",
  "function isWithdrawable(bytes32 swapId) external view returns (bool)",
  "function isRefundable(bytes32 swapId) external view returns (bool)"
]

const ethereumService = {
  // Initialize provider and contract
  getContract: () => {
    const provider = new ethers.JsonRpcProvider(ETHEREUM_RPC_URL)
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider)
    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet)
  },

  // Get swap status from Ethereum
  getSwapStatus: async (swapId) => {
    try {
      const contract = ethereumService.getContract()
      const swapData = await contract.getSwap(swapId)
      
      return {
        exists: swapData[0] !== ethers.ZeroHash, // hashlock
        initiated: swapData[0] !== ethers.ZeroHash,
        withdrawn: swapData[6], // withdrawn boolean
        refunded: swapData[7], // refunded boolean
        timelock: Number(swapData[1]),
        amount: swapData[5].toString()
      }
    } catch (error) {
      console.error('Failed to get Ethereum swap status:', error)
      return { exists: false, initiated: false, withdrawn: false, refunded: false }
    }
  },

  // Initiate counter-swap on Ethereum
  initiateCounterSwap: async (swap) => {
    try {
      const contract = ethereumService.getContract()
      
      const tx = await contract.initiateSwap(
        swap.hashlock,
        swap.timelock,
        swap.receiverAddress,
        swap.toToken === 'ETH' ? ethers.ZeroAddress : swap.toToken,
        ethers.parseEther(swap.amount),
        swap.toToken === 'ETH' ? { value: ethers.parseEther(swap.amount) } : {}
      )

      await tx.wait()
      return tx.hash
    } catch (error) {
      console.error('Failed to initiate Ethereum counter-swap:', error)
      throw error
    }
  },

  // Withdraw from Ethereum swap
  withdraw: async (swapId, secret) => {
    try {
      const contract = ethereumService.getContract()
      
      const tx = await contract.withdraw(swapId, secret)
      await tx.wait()
      return tx.hash
    } catch (error) {
      console.error('Failed to withdraw from Ethereum swap:', error)
      throw error
    }
  },

  // Refund Ethereum swap
  refund: async (swapId) => {
    try {
      const contract = ethereumService.getContract()
      
      const tx = await contract.refund(swapId)
      await tx.wait()
      return tx.hash
    } catch (error) {
      console.error('Failed to refund Ethereum swap:', error)
      throw error
    }
  },

  // Check if swap is withdrawable
  isWithdrawable: async (swapId) => {
    try {
      const contract = ethereumService.getContract()
      return await contract.isWithdrawable(swapId)
    } catch (error) {
      console.error('Failed to check if Ethereum swap is withdrawable:', error)
      return false
    }
  },

  // Check if swap is refundable
  isRefundable: async (swapId) => {
    try {
      const contract = ethereumService.getContract()
      return await contract.isRefundable(swapId)
    } catch (error) {
      console.error('Failed to check if Ethereum swap is refundable:', error)
      return false
    }
  }
}

module.exports = ethereumService