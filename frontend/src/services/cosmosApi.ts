import api from "./api"

export interface CosmosSwapParams {
  fromToken: string
  toToken: string
  amount: string
  fromAddress: string
  toAddress: string
  memo?: string
}

export class CosmosApi {
  async getBalance(address: string, denom: string) {
    try {
      const response = await api.get(`/api/cosmos/balance/${address}/${denom}`)
      return response.data
    } catch (error) {
      console.error("Failed to get Cosmos balance:", error)
      throw error
    }
  }

  async getTokens() {
    try {
      const response = await api.get("/api/cosmos/tokens")
      return response.data
    } catch (error) {
      console.error("Failed to get Cosmos tokens:", error)
      throw error
    }
  }

  async simulateSwap(params: CosmosSwapParams) {
    try {
      const response = await api.post("/api/cosmos/simulate-swap", params)
      return response.data
    } catch (error) {
      console.error("Failed to simulate Cosmos swap:", error)
      throw error
    }
  }

  async executeSwap(params: CosmosSwapParams) {
    try {
      const response = await api.post("/api/cosmos/swap", params)
      return response.data
    } catch (error) {
      console.error("Failed to execute Cosmos swap:", error)
      throw error
    }
  }
}

export const cosmosApi = new CosmosApi()
