"use client"

import { useState, useCallback } from "react"
import { oneInchService, type SwapQuote, type TokenInfo } from "../services/oneInchApi"

interface UseOneInchReturn {
  quote: SwapQuote | null
  tokens: Record<string, TokenInfo>
  isLoading: boolean
  error: string | null
  getQuote: (params: any) => Promise<void>
  getTokens: () => Promise<void>
  executeSwap: (params: any) => Promise<any>
}

export function useOneInch(): UseOneInchReturn {
  const [quote, setQuote] = useState<SwapQuote | null>(null)
  const [tokens, setTokens] = useState<Record<string, TokenInfo>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getQuote = useCallback(async (params: any) => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await oneInchService.getQuote(params)
      setQuote(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get quote")
    } finally {
      setIsLoading(false)
    }
  }, [])

  const getTokens = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await oneInchService.getTokens()
      setTokens(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get tokens")
    } finally {
      setIsLoading(false)
    }
  }, [])

  const executeSwap = useCallback(async (params: any) => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await oneInchService.getSwapTransaction(params)
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to execute swap")
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    quote,
    tokens,
    isLoading,
    error,
    getQuote,
    getTokens,
    executeSwap,
  }
}
