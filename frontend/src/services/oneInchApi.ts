const ONEINCH_API_KEY = import.meta.env.VITE_ONEINCH_API_KEY
const ONEINCH_BASE_URL = "https://api.1inch.dev"

export interface QuoteParams {
  fromTokenAddress: string
  toTokenAddress: string
  amount: string
  fromAddress: string
  slippage: number
}

export interface SwapParams extends QuoteParams {
  destReceiver?: string
  referrerAddress?: string
  fee?: number
}

export class OneInchApi {
  private chainId: number

  constructor(chainId = 1) {
    this.chainId = chainId
  }

  private async makeDirectRequest(endpoint: string, params: any = {}) {
    if (!ONEINCH_API_KEY) {
      console.warn("1inch API key not found, using mock data")
      return this.getMockData(endpoint, params)
    }

    try {
      const url = new URL(`${ONEINCH_BASE_URL}/swap/v6.0/${this.chainId}${endpoint}`)
      Object.keys(params).forEach((key) => {
        if (params[key] !== undefined) {
          url.searchParams.append(key, params[key])
        }
      })

      console.log("🔗 1inch Direct API Call:", endpoint)
      
      const response = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${ONEINCH_API_KEY}`,
          Accept: "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`1inch API error: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error("1inch API call failed, using mock data:", error)
      return this.getMockData(endpoint, params)
    }
  }

  private getMockData(endpoint: string, params: any) {
    if (endpoint === "/quote") {
      return {
        dstAmount: (Number.parseFloat(params.amount || "1") * 245.8).toString(),
        estimatedGas: "150000",
      }
    }
    if (endpoint === "/tokens") {
      return {
        "0xA0b86a33E6441b8435b662f0E2d0B8A0E4B2B8B0": {
          symbol: "ETH",
          name: "Ethereum",
          decimals: 18,
        }
      }
    }
    return { mock: true }
  }

  async getQuote(params: QuoteParams) {
    // Direct API call to 1inch (bypass backend)
    return this.makeDirectRequest("/quote", {
      src: params.fromTokenAddress,
      dst: params.toTokenAddress,
      amount: params.amount,
      from: params.fromAddress,
      slippage: params.slippage,
    })
  }

  async getSwapTransaction(params: SwapParams) {
    // Direct API call to 1inch (bypass backend)
    return this.makeDirectRequest("/swap", {
      src: params.fromTokenAddress,
      dst: params.toTokenAddress,
      amount: params.amount,
      from: params.fromAddress,
      slippage: params.slippage,
      destReceiver: params.destReceiver,
    })
  }

  async getTokens() {
    // Direct API call to 1inch (bypass backend)
    return this.makeDirectRequest("/tokens")
  }
}

export const oneInchApi = new OneInchApi()