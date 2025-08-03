import { ethers } from 'ethers'
import { ETHEREUM_TOKENS, COSMOS_TOKENS, EXPLORER_URLS } from './constants'
import type { ValidationResult, EthereumToken, CosmosToken } from './types'

/**
 * Format address for display (truncate middle)
 */
export const formatAddress = (address: string, startLength = 6, endLength = 4): string => {
  if (!address) return ''
  if (address.length <= startLength + endLength) return address
  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`
}

/**
 * Format amount with proper decimals
 */
export const formatAmount = (amount: string | number, decimals = 6): string => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  if (isNaN(num)) return '0'
  
  // Format with appropriate decimal places
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(2)}M`
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(2)}K`
  } else if (num >= 1) {
    return num.toFixed(Math.min(decimals, 6))
  } else {
    return num.toFixed(Math.min(decimals, 8))
  }
}

/**
 * Format time duration
 */
export const formatDuration = (seconds: number): string => {
  if (seconds < 60) return `${seconds}s`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`
  return `${Math.floor(seconds / 86400)}d`
}

/**
 * Format timestamp to readable date
 */
export const formatDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleString()
}

/**
 * Generate random hex string
 */
export const generateRandomHex = (length = 32): string => {
  const bytes = new Uint8Array(length)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * Hash string using SHA-256
 */
export const sha256 = async (message: string): Promise<string> => {
  const msgBuffer = new TextEncoder().encode(message)
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Validate Ethereum address
 */
export const validateEthereumAddress = (address: string): ValidationResult => {
  if (!address) {
    return { isValid: false, error: 'Address is required' }
  }
  
  if (!ethers.isAddress(address)) {
    return { isValid: false, error: 'Invalid Ethereum address' }
  }
  
  return { isValid: true }
}

/**
 * Validate Cosmos address
 */
export const validateCosmosAddress = (address: string): ValidationResult => {
  if (!address) {
    return { isValid: false, error: 'Address is required' }
  }
  
  // Basic Cosmos address validation (bech32 format)
  const cosmosAddressRegex = /^[a-z]+1[a-z0-9]{38,58}$/
  if (!cosmosAddressRegex.test(address)) {
    return { isValid: false, error: 'Invalid Cosmos address' }
  }
  
  return { isValid: true }
}

/**
 * Validate amount
 */
export const validateAmount = (amount: string, maxAmount?: string): ValidationResult => {
  if (!amount) {
    return { isValid: false, error: 'Amount is required' }
  }
  
  const num = parseFloat(amount)
  if (isNaN(num) || num <= 0) {
    return { isValid: false, error: 'Amount must be a positive number' }
  }
  
  if (maxAmount && num > parseFloat(maxAmount)) {
    return { isValid: false, error: 'Amount exceeds available balance' }
  }
  
  return { isValid: true }
}

/**
 * Get token info by symbol
 */
export const getEthereumToken = (symbol: string): EthereumToken | undefined => {
  return ETHEREUM_TOKENS.find(token => token.symbol === symbol)
}

export const getCosmosToken = (symbol: string): CosmosToken | undefined => {
  return COSMOS_TOKENS.find(token => token.symbol === symbol)
}

/**
 * Convert amount to base units
 */
export const toBaseUnits = (amount: string, decimals: number): string => {
  const num = parseFloat(amount)
  if (isNaN(num)) return '0'
  return (num * Math.pow(10, decimals)).toString()
}

/**
 * Convert from base units to display units
 */
export const fromBaseUnits = (amount: string, decimals: number): string => {
  const num = parseFloat(amount)
  if (isNaN(num)) return '0'
  return (num / Math.pow(10, decimals)).toString()
}

/**
 * Get explorer URL for transaction
 */
export const getExplorerUrl = (chain: 'ethereum' | 'cosmos', txHash: string): string => {
  const baseUrl = EXPLORER_URLS[chain.toUpperCase() as keyof typeof EXPLORER_URLS]
  return `${baseUrl}/tx/${txHash}`
}

/**
 * Get explorer URL for address
 */
export const getAddressExplorerUrl = (chain: 'ethereum' | 'cosmos', address: string): string => {
  const baseUrl = EXPLORER_URLS[chain.toUpperCase() as keyof typeof EXPLORER_URLS]
  return `${baseUrl}/address/${address}`
}

/**
 * Calculate time remaining
 */
export const getTimeRemaining = (timelock: number): number => {
  return Math.max(0, timelock - Math.floor(Date.now() / 1000))
}

/**
 * Check if swap is expired
 */
export const isSwapExpired = (timelock: number): boolean => {
  return Date.now() / 1000 >= timelock
}

/**
 * Generate swap ID
 */
export const generateSwapId = (params: {
  sender: string
  receiver: string
  token: string
  amount: string
  hashlock: string
  timelock: number
}): string => {
  const data = `${params.sender}:${params.receiver}:${params.token}:${params.amount}:${params.hashlock}:${params.timelock}:${Date.now()}`
  return ethers.keccak256(ethers.toUtf8Bytes(data))
}

/**
 * Retry function with exponential backoff
 */
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  initialDelay = 1000
): Promise<T> => {
  let lastError: Error
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      if (i === maxRetries - 1) break
      
      const delay = initialDelay * Math.pow(2, i)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  throw lastError!
}

/**
 * Debounce function
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void => {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * Throttle function
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void => {
  let inThrottle: boolean = false
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

/**
 * Format gas price
 */
export const formatGasPrice = (gasPrice: string, unit = 'gwei'): string => {
  const num = parseFloat(gasPrice)
  if (isNaN(num)) return '0'
  
  if (unit === 'gwei') {
    return `${(num / 1e9).toFixed(2)} Gwei`
  }
  return `${num} Wei`
}

/**
 * Calculate transaction fee
 */
export const calculateTransactionFee = (gasLimit: string, gasPrice: string): string => {
  const limit = parseFloat(gasLimit)
  const price = parseFloat(gasPrice)
  if (isNaN(limit) || isNaN(price)) return '0'
  
  return (limit * price).toString()
}

/**
 * Format percentage
 */
export const formatPercentage = (value: number, decimals = 2): string => {
  return `${(value * 100).toFixed(decimals)}%`
}

/**
 * Copy to clipboard
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (error) {
    console.error('Failed to copy to clipboard:', error)
    return false
  }
}

/**
 * Get chain name
 */
export const getChainName = (chain: 'ethereum' | 'cosmos'): string => {
  return chain === 'ethereum' ? 'Ethereum' : 'Cosmos'
}

/**
 * Get status color
 */
export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'pending':
      return 'text-yellow-600'
    case 'completed':
      return 'text-green-600'
    case 'failed':
      return 'text-red-600'
    case 'expired':
      return 'text-gray-600'
    default:
      return 'text-gray-600'
  }
}

/**
 * Sleep function
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Check if value is empty
 */
export const isEmpty = (value: any): boolean => {
  if (value === null || value === undefined) return true
  if (typeof value === 'string') return value.trim().length === 0
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object') return Object.keys(value).length === 0
  return false
}

/**
 * Generate unique ID
 */
export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9)
}

/**
 * Parse error message
 */
export const parseErrorMessage = (error: any): string => {
  if (typeof error === 'string') return error
  if (error?.message) return error.message
  if (error?.reason) return error.reason
  if (error?.data?.message) return error.data.message
  return 'An unexpected error occurred'
}