// Contract Addresses
export const ETHEREUM_CONTRACT_ADDRESS = import.meta.env.VITE_ETHEREUM_CONTRACT_ADDRESS || '0x...'
export const COSMOS_CONTRACT_ADDRESS = import.meta.env.VITE_COSMOS_CONTRACT_ADDRESS || 'cosmos1...'

// Network Configuration
export const ETHEREUM_CHAIN_ID = import.meta.env.VITE_ETHEREUM_CHAIN_ID || 11155111 // Sepolia
export const COSMOS_CHAIN_ID = import.meta.env.VITE_COSMOS_CHAIN_ID || 'cosmoshub-4'

// RPC URLs
export const ETHEREUM_RPC_URL = import.meta.env.VITE_ETHEREUM_RPC_URL || 'https://eth-sepolia.g.alchemy.com/v2/your-api-key'
export const COSMOS_RPC_URL = import.meta.env.VITE_COSMOS_RPC_URL || 'https://rpc-cosmoshub.cosmos-apis.com'

// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'

// Contract ABI for Ethereum
export const ETHEREUM_CONTRACT_ABI = [
  "function initiateSwap(bytes32 hashlock, uint256 timelock, address receiver, address token, uint256 amount) external payable returns (bytes32)",
  "function withdraw(bytes32 swapId, bytes32 preimage) external",
  "function refund(bytes32 swapId) external",
  "function getSwap(bytes32 swapId) external view returns (bytes32 hashlock, uint256 timelock, address sender, address receiver, address token, uint256 amount, bool withdrawn, bool refunded, bytes32 preimage)",
  "function getUserSwaps(address user) external view returns (bytes32[] memory)",
  "function isWithdrawable(bytes32 swapId) external view returns (bool)",
  "function isRefundable(bytes32 swapId) external view returns (bool)",
  "event SwapInitiated(bytes32 indexed swapId, bytes32 indexed hashlock, address indexed sender, address receiver, address token, uint256 amount, uint256 timelock)",
  "event SwapWithdrawn(bytes32 indexed swapId, bytes32 preimage, address indexed receiver)",
  "event SwapRefunded(bytes32 indexed swapId, address indexed sender)"
]

// Supported Tokens
export const ETHEREUM_TOKENS = [
  { symbol: 'ETH', name: 'Ethereum', address: '0x0000000000000000000000000000000000000000', decimals: 18 },
  { symbol: 'USDC', name: 'USD Coin', address: '0xA0b86a33E6417C14CfE8426b0F1fF15dE6B8E2d9', decimals: 6 },
  { symbol: 'USDT', name: 'Tether USD', address: '0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0', decimals: 6 },
]

export const COSMOS_TOKENS = [
  { symbol: 'ATOM', name: 'Cosmos Hub', denom: 'uatom', decimals: 6 },
  { symbol: 'OSMO', name: 'Osmosis', denom: 'uosmo', decimals: 6 },
  { symbol: 'JUNO', name: 'Juno', denom: 'ujuno', decimals: 6 },
]

// Time Constants
export const TIMELOCK_DURATION = {
  MINIMUM: 3600, // 1 hour
  MAXIMUM: 86400, // 24 hours
  DEFAULT: 43200, // 12 hours
}

// Gas Limits
export const GAS_LIMITS = {
  ETHEREUM: {
    INITIATE_SWAP: 200000,
    WITHDRAW: 100000,
    REFUND: 100000,
  },
  COSMOS: {
    INITIATE_SWAP: 300000,
    WITHDRAW: 150000,
    REFUND: 150000,
  }
}

// Status Types
export const SWAP_STATUS = {
  PENDING: 'pending',
  INITIATED: 'initiated',
  COUNTER_INITIATED: 'counter_initiated',
  COMPLETED: 'completed',
  FAILED: 'failed',
  EXPIRED: 'expired',
  REFUNDED: 'refunded',
} as const

// Error Messages
export const ERROR_MESSAGES = {
  WALLET_NOT_CONNECTED: 'Please connect your wallet',
  INSUFFICIENT_BALANCE: 'Insufficient balance',
  INVALID_AMOUNT: 'Please enter a valid amount',
  INVALID_ADDRESS: 'Please enter a valid address',
  NETWORK_ERROR: 'Network error, please try again',
  TRANSACTION_FAILED: 'Transaction failed',
  SWAP_EXPIRED: 'Swap has expired',
  SWAP_NOT_FOUND: 'Swap not found',
  UNAUTHORIZED: 'Unauthorized action',
} as const

// Success Messages
export const SUCCESS_MESSAGES = {
  SWAP_INITIATED: 'Cross-chain swap initiated successfully!',
  SWAP_COMPLETED: 'Swap completed successfully!',
  SWAP_REFUNDED: 'Swap refunded successfully!',
  WALLET_CONNECTED: 'Wallet connected successfully!',
} as const

// Explorer URLs
export const EXPLORER_URLS = {
  ETHEREUM: 'https://sepolia.etherscan.io',
  COSMOS: 'https://cosmos.bigdipper.live',
}

// Theme Configuration
export const THEME_CONFIG = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
} as const

// Animation Durations
export const ANIMATION_DURATION = {
  FAST: 200,
  NORMAL: 300,
  SLOW: 500,
} as const