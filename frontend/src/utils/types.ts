// Wallet Types
export interface EthereumWallet {
  address: string
  chainId: number
  isConnected: boolean
}

export interface CosmosWallet {
  address: string
  chainId: string
  isConnected: boolean
}

// Swap Types
export interface SwapParams {
  fromChain: 'ethereum' | 'cosmos'
  toChain: 'ethereum' | 'cosmos'
  fromToken: string
  toToken: string
  amount: string
  receiverAddress: string
}

export interface SwapDetails extends SwapParams {
  swapId: string
  hashlock: string
  timelock: number
  status: SwapStatus
  secret?: string
  initiateHash?: string
  withdrawHash?: string
  createdAt: number
  updatedAt: number
}

export type SwapStatus = 'pending' | 'initiated' | 'counter_initiated' | 'completed' | 'failed' | 'expired' | 'refunded'

// Token Types
export interface EthereumToken {
  symbol: string
  name: string
  address: string
  decimals: number
}

export interface CosmosToken {
  symbol: string
  name: string
  denom: string
  decimals: number
}

// Transaction Types
export interface Transaction {
  id: string
  fromChain: string
  toChain: string
  fromToken: string
  toToken: string
  amount: string
  status: SwapStatus
  timestamp: number
  hash?: string
  withdrawHash?: string
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface SwapResponse {
  swapId: string
  status: SwapStatus
  txHash?: string
}

export interface GasEstimate {
  gasLimit: string
  gasPrice: string
  totalCost: string
}

// Error Types
export interface SwapError {
  code: string
  message: string
  details?: any
}

// Hook Return Types
export interface UseSwapReturn {
  isLoading: boolean
  gasEstimate: string | null
  estimateGas: (params: SwapParams) => Promise<void>
  initiateSwap: (params: SwapParams) => Promise<string>
  withdraw: (swapId: string, secret: string) => Promise<void>
  refund: (swapId: string) => Promise<void>
}

export interface UseWeb3Return {
  provider: any
  signer: any
  account: string | null
  chainId: number | null
  isConnected: boolean
  isConnecting: boolean
  connect: () => Promise<void>
  disconnect: () => void
}

export interface UseCosmosReturn {
  client: any
  account: string | null
  isConnected: boolean
  isConnecting: boolean
  connect: () => Promise<void>
  disconnect: () => void
}

// Component Props Types
export interface HeaderProps {
  darkMode: boolean
  toggleTheme: () => void
}

export interface ThemeToggleProps {
  darkMode: boolean
  toggleTheme: () => void
}

export interface SwapInterfaceProps {
  onSwapComplete?: (swapId: string) => void
}

export interface TransactionHistoryProps {
  refreshInterval?: number
}

export interface WalletConnectProps {
  onConnect?: () => void
}

// Context Types
export interface ThemeContextType {
  theme: 'light' | 'dark'
  toggleTheme: () => void
}

export interface Web3ContextType extends UseWeb3Return {}

export interface CosmosContextType extends UseCosmosReturn {}

// Configuration Types
export interface NetworkConfig {
  chainId: number | string
  name: string
  rpcUrl: string
  explorerUrl: string
  nativeCurrency: {
    name: string
    symbol: string
    decimals: number
  }
}

export interface ContractConfig {
  address: string
  abi: any[]
}

// Validation Types
export interface ValidationResult {
  isValid: boolean
  error?: string
}

export interface FormValidation {
  amount: ValidationResult
  receiverAddress: ValidationResult
  fromChain: ValidationResult
  toChain: ValidationResult
}

// Chart/Analytics Types
export interface SwapAnalytics {
  totalSwaps: number
  totalVolume: string
  successRate: number
  averageTime: number
  topTokenPairs: Array<{
    fromToken: string
    toToken: string
    count: number
    volume: string
  }>
}

export interface ChartData {
  labels: string[]
  datasets: Array<{
    label: string
    data: number[]
    backgroundColor?: string
    borderColor?: string
  }>
}

// Event Types
export interface SwapEvent {
  type: 'initiated' | 'withdrawn' | 'refunded'
  swapId: string
  txHash: string
  timestamp: number
  blockNumber: number
}

// WebSocket Types
export interface WebSocketMessage {
  type: string
  data: any
  timestamp: number
}

// Storage Types
export interface LocalStorageData {
  theme: string
  walletPreference: string
  recentSwaps: string[]
  settings: {
    slippage: number
    gasPrice: string
    autoRefresh: boolean
  }
}