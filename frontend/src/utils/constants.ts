/// <reference types="vite/client" />

// Network configurations
export const ETHEREUM_MAINNET_CHAIN_ID = Number(import.meta.env.VITE_ETHEREUM_CHAIN_ID || 1)
export const ETHEREUM_RPC_URL = import.meta.env.VITE_ETHEREUM_RPC_URL || "https://mainnet.infura.io/v3/"

export const COSMOS_CHAIN_ID = import.meta.env.VITE_COSMOS_CHAIN_ID || "cosmoshub-4"
export const COSMOS_RPC_URL = import.meta.env.VITE_COSMOS_RPC_URL || "https://rpc-cosmoshub.keplr.app"

export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001"
export const ONEINCH_API_KEY = import.meta.env.VITE_ONEINCH_API_KEY || ""

export const ENABLE_TESTNET = import.meta.env.VITE_ENABLE_TESTNET === "true"
export const ENABLE_ANALYTICS = import.meta.env.VITE_ENABLE_ANALYTICS === "true"

// Ethereum contract details
export const ETHEREUM_CONTRACT_ADDRESS = import.meta.env.VITE_ETH_CONTRACT_ADDRESS || ""
export const ETHEREUM_CONTRACT_ABI = [
  // Paste your actual ABI here
]

// Token lists
export const ETHEREUM_TOKENS = [
  { symbol: "ETH", address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", decimals: 18 },
  { symbol: "USDC", address: "0xA0b86a33E6441b8435b662f0E2d0B8A0E4B2B8B0", decimals: 6 },
  { symbol: "USDT", address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", decimals: 6 },
  { symbol: "WETH", address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", decimals: 18 }
]

export const COSMOS_TOKENS = [
  { symbol: "ATOM", denom: "uatom", decimals: 6 },
  { symbol: "OSMO", denom: "uosmo", decimals: 6 },
  { symbol: "JUNO", denom: "ujuno", decimals: 6 }
]

export const COSMOS_DENOMS = {
  ATOM: "uatom",
  OSMO: "uosmo",
  JUNO: "ujuno",
} as const

export const EXPLORER_URLS = {
  ethereum: "https://sepolia.etherscan.io",
  cosmos: "https://www.mintscan.io/cosmos"
}

// Slippage / Gas Defaults
export const SLIPPAGE_OPTIONS = [0.1, 0.5, 1.0, 3.0] as const
export const DEFAULT_SLIPPAGE = 0.5
export const DEFAULT_GAS_LIMIT = 200000
export const DEFAULT_GAS_PRICE = "0.025"