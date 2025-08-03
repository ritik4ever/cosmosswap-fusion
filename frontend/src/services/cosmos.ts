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
    try {
      this.client = await SigningCosmWasmClient.connectWithSigner(COSMOS_RPC_URL, signer, {
        gasPrice: GasPrice.fromString("0.025uatom"),
      })

      const accounts = await signer.getAccounts()
      if (accounts.length === 0) {
        throw new Error("No accounts found")
      }

      const address = accounts[0].address
      const balance = await this.getBalance(address)

      return {
        address,
        balance,
      }
    } catch (error) {
      console.error("Failed to connect to Cosmos:", error)
      throw error
    }
  }

  async getBalance(address: string): Promise<CosmosBalance[]> {
    if (!this.client) {
      throw new Error("Client not connected")
    }

    try {
      const balances = await this.client.getAllBalances(address)
      return balances.map((balance) => ({
        denom: balance.denom,
        amount: balance.amount,
      }))
    } catch (error) {
      console.error("Failed to get balance:", error)
      return []
    }
  }

  async simulateSwap(params: {
    fromDenom: string
    toDenom: string
    amount: string
    address: string
  }) {
    if (!this.client) {
      throw new Error("Client not connected")
    }

    try {
      // Mock simulation for now
      const accounts = await this.client.getAccount(params.address)
      if (!accounts) {
        throw new Error("Account not found")
      }

      return {
        estimatedOutput: (Number.parseFloat(params.amount) * 0.98).toString(),
        fee: "5000",
        gasUsed: "200000",
      }
    } catch (error) {
      console.error("Failed to simulate swap:", error)
      throw error
    }
  }

  async executeSwap(params: {
    fromDenom: string
    toDenom: string
    amount: string
    address: string
    memo?: string
  }) {
    if (!this.client) {
      throw new Error("Client not connected")
    }

    try {
      // Mock swap execution for now
      const accounts = await this.client.getAccount(params.address)
      if (!accounts) {
        throw new Error("Account not found")
      }

      return {
        transactionHash: "mock_tx_hash_" + Date.now(),
        success: true,
      }
    } catch (error) {
      console.error("Failed to execute swap:", error)
      throw error
    }
  }

  async getTokenInfo(denom: string) {
    // Mock token info
    const tokenMap: Record<string, any> = {
      [COSMOS_DENOMS.ATOM]: {
        denom: COSMOS_DENOMS.ATOM,
        symbol: "ATOM",
        name: "Cosmos",
        decimals: 6,
      },
      [COSMOS_DENOMS.OSMO]: {
        denom: COSMOS_DENOMS.OSMO,
        symbol: "OSMO",
        name: "Osmosis",
        decimals: 6,
      },
      [COSMOS_DENOMS.JUNO]: {
        denom: COSMOS_DENOMS.JUNO,
        symbol: "JUNO",
        name: "Juno",
        decimals: 6,
      },
    }

    return tokenMap[denom] || null
  }

  disconnect() {
    this.client = null
  }
}

export const cosmosService = new CosmosService()
