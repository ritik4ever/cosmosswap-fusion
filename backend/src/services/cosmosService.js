const { SigningCosmWasmClient } = require('@cosmjs/cosmwasm-stargate')
const { GasPrice } = require('@cosmjs/stargate')
const { DirectSecp256k1HdWallet } = require('@cosmjs/proto-signing')

// Configuration
const COSMOS_RPC_URL = process.env.COSMOS_RPC_URL || 'https://rpc-cosmoshub.cosmos-apis.com'
const CONTRACT_ADDRESS = process.env.COSMOS_CONTRACT_ADDRESS || 'cosmos1...'
const MNEMONIC = process.env.COSMOS_MNEMONIC || ''

const cosmosService = {
  // Initialize client
  getClient: async () => {
    const wallet = await DirectSecp256k1HdWallet.fromMnemonic(MNEMONIC, {
      prefix: 'cosmos'
    })
    
    return await SigningCosmWasmClient.connectWithSigner(
      COSMOS_RPC_URL,
      wallet,
      {
        gasPrice: GasPrice.fromString('0.025uatom'),
      }
    )
  },

  // Get swap status from Cosmos
  getSwapStatus: async (swapId) => {
    try {
      const client = await cosmosService.getClient()
      
      const swapData = await client.queryContractSmart(CONTRACT_ADDRESS, {
        get_swap: { swap_id: swapId }
      })
      
      return {
        exists: !!swapData,
        initiated: !!swapData && !swapData.withdrawn && !swapData.refunded,
        withdrawn: swapData?.withdrawn || false,
        refunded: swapData?.refunded || false,
        timelock: swapData?.timelock || 0,
        amount: swapData?.amount || '0'
      }
    } catch (error) {
      console.error('Failed to get Cosmos swap status:', error)
      return { exists: false, initiated: false, withdrawn: false, refunded: false }
    }
  },

  // Initiate counter-swap on Cosmos
  initiateCounterSwap: async (swap) => {
    try {
      const client = await cosmosService.getClient()
      const [account] = await client.getAccounts()
      
      const msg = {
        initiate_swap: {
          hashlock: swap.hashlock,
          timelock: swap.timelock,
          receiver: swap.receiverAddress,
          denom: swap.toToken === 'ATOM' ? 'uatom' : swap.toToken,
          amount: (parseFloat(swap.amount) * 1_000_000).toString(),
        }
      }

      const result = await client.execute(
        account.address,
        CONTRACT_ADDRESS,
        msg,
        'auto',
        'Initiate counter-swap',
        [
          {
            denom: swap.toToken === 'ATOM' ? 'uatom' : swap.toToken,
            amount: (parseFloat(swap.amount) * 1_000_000).toString(),
          }
        ]
      )

      return result.transactionHash
    } catch (error) {
      console.error('Failed to initiate Cosmos counter-swap:', error)
      throw error
    }
  },

  // Withdraw from Cosmos swap
  withdraw: async (swapId, preimage) => {
    try {
      const client = await cosmosService.getClient()
      const [account] = await client.getAccounts()
      
      const msg = {
        withdraw: {
          swap_id: swapId,
          preimage: preimage,
        }
      }

      const result = await client.execute(
        account.address,
        CONTRACT_ADDRESS,
        msg,
        'auto',
        'Withdraw from swap'
      )

      return result.transactionHash
    } catch (error) {
      console.error('Failed to withdraw from Cosmos swap:', error)
      throw error
    }
  },

  // Refund Cosmos swap
  refund: async (swapId) => {
    try {
      const client = await cosmosService.getClient()
      const [account] = await client.getAccounts()
      
      const msg = {
        refund: {
          swap_id: swapId,
        }
      }

      const result = await client.execute(
        account.address,
        CONTRACT_ADDRESS,
        msg,
        'auto',
        'Refund swap'
      )

      return result.transactionHash
    } catch (error) {
      console.error('Failed to refund Cosmos swap:', error)
      throw error
    }
  },

  // Check if swap is withdrawable
  isWithdrawable: async (swapId) => {
    try {
      const client = await cosmosService.getClient()
      
      const result = await client.queryContractSmart(CONTRACT_ADDRESS, {
        is_withdrawable: { swap_id: swapId }
      })
      
      return result.withdrawable
    } catch (error) {
      console.error('Failed to check if Cosmos swap is withdrawable:', error)
      return false
    }
  },

  // Check if swap is refundable
  isRefundable: async (swapId) => {
    try {
      const client = await cosmosService.getClient()
      
      const result = await client.queryContractSmart(CONTRACT_ADDRESS, {
        is_refundable: { swap_id: swapId }
      })
      
      return result.refundable
    } catch (error) {
      console.error('Failed to check if Cosmos swap is refundable:', error)
      return false
    }
  }
}

module.exports = cosmosService