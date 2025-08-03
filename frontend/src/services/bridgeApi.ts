import api from "./api"

export interface BridgeSwapParams {
  fromChain: "ethereum" | "cosmos"
  toChain: "ethereum" | "cosmos"
  fromToken: string
  toToken: string
  amount: string
  fromAddress: string
  toAddress: string
  slippage: number
}

export interface SwapStatus {
  id: string
  status: "pending" | "completed" | "failed"
  fromTxHash?: string
  toTxHash?: string
  error?: string
}

export class BridgeApi {
  async createSwap(params: BridgeSwapParams) {
    try {
      const response = await api.post("/api/bridge/swap", params)
      return response.data
    } catch (error) {
      console.error("Failed to create bridge swap:", error)
      throw error
    }
  }

  async getSwapStatus(swapId: string): Promise<SwapStatus> {
    try {
      const response = await api.get(`/api/bridge/swap/${swapId}`)
      return response.data
    } catch (error) {
      console.error("Failed to get swap status:", error)
      throw error
    }
  }

  async getUserSwaps(address: string) {
    try {
      const response = await api.get(`/api/bridge/swaps/${address}`)
      return response.data
    } catch (error) {
      console.error("Failed to get user swaps:", error)
      throw error
    }
  }

  async getQuote(params: Omit<BridgeSwapParams, "fromAddress" | "toAddress">) {
    try {
      const response = await api.post("/api/bridge/quote", params)
      return response.data
    } catch (error) {
      console.error("Failed to get bridge quote:", error)
      throw error
    }
  }
}

export const bridgeApi = new BridgeApi()
