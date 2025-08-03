import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate"
import { GasPrice } from "@cosmjs/stargate"
import { COSMOS_RPC_URL, COSMOS_DENOMS } from "../utils/constants"

export interface CosmosBalance {
  denom: string
  amount: string
}

export interface CosmosAccount {
  address: string
  balance: CosmosBalance[]
}

export class CosmosService {
  private client: SigningCosmWasmClient | null = null

  async connect(signer: any): Promise<CosmosAccount> {
    this.client = await SigningCosmWasmClient.connectWithSigner(COSMOS_RPC_URL, signer, {
      gasPrice: GasPrice.fromString("0.025uatom"),
    })

    const accounts = await signer.getAccounts()
    if (accounts.length === 0) throw new Error("No accounts found")

    const address = accounts[0].address
    const balance = await this.getBalance(address)

    return { address, balance }
  }

  async getBalance(address: string): Promise<CosmosBalance[]> {
    if (!this.client) throw new Error("Client not connected")
    try {
      // Fetch ATOM balance only
      const atom = await this.client.getBalance(address, COSMOS_DENOMS.ATOM)
      return [{ denom: atom.denom, amount: atom.amount }]
    } catch (error) {
      console.error("Failed to get balance:", error)
      return []
    }
  }

  // Mock swap simulation
  async simulateSwap(params: { fromDenom: string; toDenom: string; amount: string; address: string }) {
    return {
      estimatedOutput: (parseFloat(params.amount) * 0.98).toString(),
      fee: "5000",
      gasUsed: "200000"
    }
  }

  // Mock swap execution
  async executeSwap(_params: { fromDenom: string; toDenom: string; amount: string; address: string; memo?: string }) {
    return {
      transactionHash: "mock_tx_hash_" + Date.now(),
      success: true
    }
  }

  async getTokenInfo(denom: string) {
    const tokenMap: Record<string, any> = {
      [COSMOS_DENOMS.ATOM]: { denom: COSMOS_DENOMS.ATOM, symbol: "ATOM", name: "Cosmos", decimals: 6 },
      [COSMOS_DENOMS.OSMO]: { denom: COSMOS_DENOMS.OSMO, symbol: "OSMO", name: "Osmosis", decimals: 6 },
      [COSMOS_DENOMS.JUNO]: { denom: COSMOS_DENOMS.JUNO, symbol: "JUNO", name: "Juno", decimals: 6 },
    }
    return tokenMap[denom] || null
  }

  disconnect() {
    this.client = null
  }
}

export const cosmosService = new CosmosService()