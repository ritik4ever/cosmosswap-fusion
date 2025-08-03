import { ethers } from 'ethers'
import { ETHEREUM_TOKENS, COSMOS_TOKENS, EXPLORER_URLS } from './constants'
import type { ValidationResult } from './types'

export const formatAddress = (address: string, startLength = 6, endLength = 4): string => {
  if (!address) return ''
  if (address.length <= startLength + endLength) return address
  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`
}

export const formatAmount = (amount: string | number, decimals = 6): string => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  if (isNaN(num)) return '0'
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(2)}M`
  if (num >= 1_000) return `${(num / 1_000).toFixed(2)}K`
  return num.toFixed(Math.min(decimals, num < 1 ? 8 : 6))
}

export const formatDuration = (seconds: number): string => {
  if (seconds < 60) return `${seconds}s`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`
  return `${Math.floor(seconds / 86400)}d`
}

export const formatDate = (timestamp: number): string => new Date(timestamp).toLocaleString()

export const generateRandomHex = (length = 32): string => {
  const bytes = new Uint8Array(length)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('')
}

export const sha256 = async (message: string): Promise<string> => {
  const msgBuffer = new TextEncoder().encode(message)
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('')
}

export const validateEthereumAddress = (address: string): ValidationResult => {
  if (!address) return { isValid: false, error: 'Address is required' }
  if (!ethers.isAddress(address)) return { isValid: false, error: 'Invalid Ethereum address' }
  return { isValid: true }
}

export const validateCosmosAddress = (address: string): ValidationResult => {
  if (!address) return { isValid: false, error: 'Address is required' }
  const regex = /^[a-z]+1[a-z0-9]{38,58}$/
  if (!regex.test(address)) return { isValid: false, error: 'Invalid Cosmos address' }
  return { isValid: true }
}

export const validateAmount = (amount: string, maxAmount?: string): ValidationResult => {
  if (!amount) return { isValid: false, error: 'Amount is required' }
  const num = parseFloat(amount)
  if (isNaN(num) || num <= 0) return { isValid: false, error: 'Amount must be a positive number' }
  if (maxAmount && num > parseFloat(maxAmount)) return { isValid: false, error: 'Amount exceeds available balance' }
  return { isValid: true }
}

export const getEthereumToken = (symbol: string) => ETHEREUM_TOKENS.find(t => t.symbol === symbol)
export const getCosmosToken = (symbol: string) => COSMOS_TOKENS.find(t => t.symbol === symbol)

export const toBaseUnits = (amount: string, decimals: number): string => {
  const num = parseFloat(amount)
  if (isNaN(num)) return '0'
  return (num * Math.pow(10, decimals)).toString()
}

export const fromBaseUnits = (amount: string, decimals: number): string => {
  const num = parseFloat(amount)
  if (isNaN(num)) return '0'
  return (num / Math.pow(10, decimals)).toString()
}

export const getExplorerUrl = (chain: 'ethereum' | 'cosmos', txHash: string): string =>
  `${EXPLORER_URLS[chain]}/tx/${txHash}`

export const getAddressExplorerUrl = (chain: 'ethereum' | 'cosmos', address: string): string =>
  `${EXPLORER_URLS[chain]}/address/${address}`

export const getTimeRemaining = (timelock: number) => Math.max(0, timelock - Math.floor(Date.now() / 1000))
export const isSwapExpired = (timelock: number) => Date.now() / 1000 >= timelock

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

export const retryWithBackoff = async <T>(fn: () => Promise<T>, maxRetries = 3, initialDelay = 1000): Promise<T> => {
  let lastError: Error
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      if (i === maxRetries - 1) break
      await new Promise(res => setTimeout(res, initialDelay * Math.pow(2, i)))
    }
  }
  throw lastError!
}

export const debounce = <T extends (...args: any[]) => void>(func: T, wait: number) => {
  let timeout: NodeJS.Timeout | null = null
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export const throttle = <T extends (...args: any[]) => void>(func: T, limit: number) => {
  let inThrottle = false
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

export const formatGasPrice = (gasPrice: string, unit = 'gwei'): string => {
  const num = parseFloat(gasPrice)
  if (isNaN(num)) return '0'
  return unit === 'gwei' ? `${(num / 1e9).toFixed(2)} Gwei` : `${num} Wei`
}

export const calculateTransactionFee = (gasLimit: string, gasPrice: string): string => {
  const limit = parseFloat(gasLimit)
  const price = parseFloat(gasPrice)
  if (isNaN(limit) || isNaN(price)) return '0'
  return (limit * price).toString()
}

export const formatPercentage = (value: number, decimals = 2): string => `${(value * 100).toFixed(decimals)}%`

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

export const getChainName = (chain: 'ethereum' | 'cosmos') => chain === 'ethereum' ? 'Ethereum' : 'Cosmos'

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'pending': return 'text-yellow-600'
    case 'completed': return 'text-green-600'
    case 'failed': return 'text-red-600'
    case 'expired': return 'text-gray-600'
    default: return 'text-gray-600'
  }
}

export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const isEmpty = (value: any): boolean => {
  if (value === null || value === undefined) return true
  if (typeof value === 'string') return value.trim().length === 0
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object') return Object.keys(value).length === 0
  return false
}

export const generateId = () => Math.random().toString(36).substr(2, 9)

export const parseErrorMessage = (error: any): string => {
  if (typeof error === 'string') return error
  if (error?.message) return error.message
  if (error?.reason) return error.reason
  if (error?.data?.message) return error.data.message
  return 'An unexpected error occurred'
}
