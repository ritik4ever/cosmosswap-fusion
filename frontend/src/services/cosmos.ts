import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import { COSMOS_CONTRACT_ADDRESS } from '../utils/constants'

interface SwapParams {
  hashlock: string
  timelock: number
  receiverAddress: string
  fromToken: string
  amount: string
}

export const cosmosService = {
  async estimateGas(client: SigningCosmWasmClient, params: any): Promise<string> {
    try {
      const [account] = await client.getAccounts()
      
      const msg = {
        initiate_swap: {
          hashlock: params.hashlock,
          timelock: params.timelock,
          receiver: params.receiverAddress,
          denom: params.fromToken === 'ATOM' ? 'uatom' : params.fromToken,
          amount: (parseFloat(params.amount) * 1_000_000).toString(),
        }
      }

      const gasEstimate = await client.simulate(
        account.address,
        [
          {
            typeUrl: '/cosmwasm.wasm.v1.MsgExecuteContract',
            value: {
              sender: account.address,
              contract: COSMOS_CONTRACT_ADDRESS,
              msg: Buffer.from(JSON.stringify(msg)),
              funds: [
                {
                  denom: params.fromToken === 'ATOM' ? 'uatom' : params.fromToken,
                  amount: (parseFloat(params.amount) * 1_000_000).toString(),
                }
              ],
            },
          },
        ],
        'Estimate gas for swap initiation'
      )

      return (gasEstimate * 0.000001).toFixed(6) // Convert to ATOM
    } catch (error) {
      console.error('Gas estimation failed:', error)
      throw error
    }
  },

  async initiateSwap(client: SigningCosmWasmClient, params: SwapParams): Promise<string> {
    try {
      const [account] = await client.getAccounts()
      
      const msg = {
        initiate_swap: {
          hashlock: params.hashlock,
          timelock: params.timelock,
          receiver: params.receiverAddress,
          denom: params.fromToken === 'ATOM' ? 'uatom' : params.fromToken,
          amount: (parseFloat(params.amount) * 1_000_000).toString(),
        }
      }

      const result = await client.execute(
        account.address,
        COSMOS_CONTRACT_ADDRESS,
        msg,
        'auto',
        'Initiate cross-chain swap',
        [
          {
            denom: params.fromToken === 'ATOM' ? 'uatom' : params.fromToken,
            amount: (parseFloat(params.amount) * 1_000_000).toString(),
          }
        ]
      )

      // Extract swap ID from events
      const swapEvent = result.logs[0]?.events.find(event => event.type === 'wasm')
      const swapIdAttr = swapEvent?.attributes.find(attr => attr.key === 'swap_id')
      
      if (swapIdAttr) {
        return swapIdAttr.value
      }
      
      throw new Error('Swap ID not found in transaction result')
    } catch (error) {
      console.error('Swap initiation failed:', error)
      throw error
    }
  },

  async withdraw(client: SigningCosmWasmClient, swapId: string, preimage: string): Promise<void> {
    try {
      const [account] = await client.getAccounts()
      
      const msg = {
        withdraw: {
          swap_id: swapId,
          preimage: preimage,
        }
      }

      await client.execute(
        account.address,
        COSMOS_CONTRACT_ADDRESS,
        msg,
        'auto',
        'Withdraw from cross-chain swap'
      )
    } catch (error) {
      console.error('Withdrawal failed:', error)
      throw error
    }
  },

  async refund(client: SigningCosmWasmClient, swapId: string): Promise<void> {
    try {
      const [account] = await client.getAccounts()
      
      const msg = {
        refund: {
          swap_id: swapId,
        }
      }

      await client.execute(
        account.address,
        COSMOS_CONTRACT_ADDRESS,
        msg,
        'auto',
        'Refund cross-chain swap'
      )
    } catch (error) {
      console.error('Refund failed:', error)
      throw error
    }
  },

  async getSwap(client: SigningCosmWasmClient, swapId: string): Promise<any> {
    try {
      return await client.queryContractSmart(COSMOS_CONTRACT_ADDRESS, {
        get_swap: { swap_id: swapId }
      })
    } catch (error) {
      console.error('Get swap failed:', error)
      throw error
    }
  }
}