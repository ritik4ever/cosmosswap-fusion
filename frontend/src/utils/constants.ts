// Network configurations
export const ETHEREUM_MAINNET_CHAIN_ID = Number(import.meta.env?.VITE_ETHEREUM_CHAIN_ID) || 1
export const ETHEREUM_RPC_URL = import.meta.env?.VITE_ETHEREUM_RPC_URL || "https://mainnet.infura.io/v3/"

// Cosmos configurations
export const COSMOS_CHAIN_ID = import.meta.env?.VITE_COSMOS_CHAIN_ID || "cosmoshub-4"
export const COSMOS_RPC_URL = import.meta.env?.VITE_COSMOS_RPC_URL || "https://rpc-cosmoshub.keplr.app"

// API configurations
export const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || "http://localhost:3001"
export const ONEINCH_API_KEY = import.meta.env?.VITE_ONEINCH_API_KEY || ""

// Feature flags
export const ENABLE_TESTNET = import.meta.env?.VITE_ENABLE_TESTNET === "true"
export const ENABLE_ANALYTICS = import.meta.env?.VITE_ENABLE_ANALYTICS === "true"

// Token addresses (Ethereum Mainnet)
export const TOKEN_ADDRESSES = {
  ETH: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
  USDC: "0xA0b86a33E6441b8435b662f0E2d0B8A0E4B2B8B0",
  USDT: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
  WETH: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
} as const

// Cosmos token denoms
export const COSMOS_DENOMS = {
  ATOM: "uatom",
  OSMO: "uosmo",
  JUNO: "ujuno",
} as const

// Slippage options
export const SLIPPAGE_OPTIONS = [0.1, 0.5, 1.0, 3.0] as const

// Default values
export const DEFAULT_SLIPPAGE = 0.5
export const DEFAULT_GAS_LIMIT = 200000
export const DEFAULT_GAS_PRICE = "0.025"
