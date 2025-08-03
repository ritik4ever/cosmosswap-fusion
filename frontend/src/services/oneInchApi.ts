const ONEINCH_API_KEY = import.meta.env.VITE_ONEINCH_API_KEY || ""
const ONEINCH_BASE_URL = "https://api.1inch.dev"

export interface SwapQuote {
  dstAmount: string
  estimatedGas: string
}

export interface TokenInfo {
  symbol: string
  name: string
  decimals: number
  address: string
}

export class OneInchApi {
  constructor(private chainId = 1) {}

  private async request(endpoint: string, params: Record<string, any> = {}): Promise<any> {
    if (!ONEINCH_API_KEY) {
      console.warn("1inch API key missing — returning mock data")
      return this.mockData(endpoint, params)
    }

    const url = new URL(`${ONEINCH_BASE_URL}/swap/v6.0/${this.chainId}${endpoint}`)
    Object.keys(params).forEach(key => params[key] && url.searchParams.append(key, params[key]))

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${ONEINCH_API_KEY}`, Accept: "application/json" },
    })
    if (!res.ok) throw new Error(`1inch API error: ${res.status}`)
    return res.json()
  }

  private mockData(endpoint: string, params: any) {
    if (endpoint === "/quote") {
      return { dstAmount: (parseFloat(params.amount || "1") * 245.8).toString(), estimatedGas: "150000" }
    }
    if (endpoint === "/tokens") {
      return { "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE": { symbol: "ETH", name: "Ethereum", decimals: 18 } }
    }
    return {}
  }

  async getQuote(params: any): Promise<SwapQuote> {
    return this.request("/quote", {
      src: params.fromTokenAddress,
      dst: params.toTokenAddress,
      amount: params.amount,
      from: params.fromAddress,
      slippage: params.slippage,
    })
  }

  async getSwapTransaction(params: any) {
    return this.request("/swap", {
      src: params.fromTokenAddress,
      dst: params.toTokenAddress,
      amount: params.amount,
      from: params.fromAddress,
      slippage: params.slippage,
      destReceiver: params.destReceiver,
    })
  }

  async getTokens(): Promise<Record<string, TokenInfo>> {
    return this.request("/tokens")
  }
}

export const oneInchService = new OneInchApi()
