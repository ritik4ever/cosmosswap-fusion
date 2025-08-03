import { ethers } from 'ethers'
import { ETHEREUM_CONTRACT_ADDRESS, ETHEREUM_CONTRACT_ABI } from '../utils/constants'

interface SwapParams {
  hashlock: string
  timelock: number
  receiverAddress: string
  fromToken: string
  amount: string
}

export const ethereumService = {
  async estimateGas(signer: ethers.JsonRpcSigner, params: any): Promise<string> {
    try {
      const contract = new ethers.Contract(
        ETHEREUM_CONTRACT_ADDRESS,
        ETHEREUM_CONTRACT_ABI,
        signer
      )

      const gasEstimate = await contract.initiateSwap.estimateGas(
        params.hashlock,
        params.timelock,
        params.receiverAddress,
        params.fromToken === 'ETH' ? ethers.ZeroAddress : params.fromToken,
        ethers.parseEther(params.amount),
        params.fromToken === 'ETH' ? { value: ethers.parseEther(params.amount) } : {}
      )

      const gasPrice = await signer.provider.getFeeData()
      const totalGas = gasEstimate * gasPrice.gasPrice!
      
      return ethers.formatEther(totalGas)
    } catch (error) {
      console.error('Gas estimation failed:', error)
      throw error
    }
  },

  async initiateSwap(signer: ethers.JsonRpcSigner, params: SwapParams): Promise<string> {
    try {
      const contract = new ethers.Contract(
        ETHEREUM_CONTRACT_ADDRESS,
        ETHEREUM_CONTRACT_ABI,
        signer
      )

      const tx = await contract.initiateSwap(
        params.hashlock,
        params.timelock,
        params.receiverAddress,
        params.fromToken === 'ETH' ? ethers.ZeroAddress : params.fromToken,
        ethers.parseEther(params.amount),
        params.fromToken === 'ETH' ? { value: ethers.parseEther(params.amount) } : {}
      )

      const receipt = await tx.wait()
      
      // Extract swap ID from event
      const swapInitiatedEvent = receipt.logs.find((log: any) => 
        log.topics[0] === ethers.id('SwapInitiated(bytes32,bytes32,address,address,address,uint256,uint256)')
      )
      
      if (swapInitiatedEvent) {
        return swapInitiatedEvent.topics[1] // swapId
      }
      
      throw new Error('Swap ID not found in transaction receipt')
    } catch (error) {
      console.error('Swap initiation failed:', error)
      throw error
    }
  },

  async withdraw(signer: ethers.JsonRpcSigner, swapId: string, secret: string): Promise<void> {
    try {
      const contract = new ethers.Contract(
        ETHEREUM_CONTRACT_ADDRESS,
        ETHEREUM_CONTRACT_ABI,
        signer
      )

      const tx = await contract.withdraw(swapId, secret)
      await tx.wait()
    } catch (error) {
      console.error('Withdrawal failed:', error)
      throw error
    }
  },

  async refund(signer: ethers.JsonRpcSigner, swapId: string): Promise<void> {
    try {
      const contract = new ethers.Contract(
        ETHEREUM_CONTRACT_ADDRESS,
        ETHEREUM_CONTRACT_ABI,
        signer
      )

      const tx = await contract.refund(swapId)
      await tx.wait()
    } catch (error) {
      console.error('Refund failed:', error)
      throw error
    }
  },

  async getSwap(signer: ethers.JsonRpcSigner, swapId: string): Promise<any> {
    try {
      const contract = new ethers.Contract(
        ETHEREUM_CONTRACT_ADDRESS,
        ETHEREUM_CONTRACT_ABI,
        signer
      )

      return await contract.getSwap(swapId)
    } catch (error) {
      console.error('Get swap failed:', error)
      throw error
    }
  }
}