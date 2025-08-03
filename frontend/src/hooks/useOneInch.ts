import { useState, useCallback } from "react"
import { oneInchService, type SwapQuote, type TokenInfo } from "../services/oneInchApi"

export function useOneInch() {
  const [quote, setQuote] = useState<SwapQuote | null>(null)
  const [tokens, setTokens] = useState<Record<string, TokenInfo>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getQuote = useCallback(async (params: any) => {
    setIsLoading(true)
    try {
      setQuote(await oneInchService.getQuote(params))
    } catch (err: any) {
      setError(err.message || "Failed to get quote")
    } finally {
      setIsLoading(false)
    }
  }, [])

  const getTokens = useCallback(async () => {
    setIsLoading(true)
    try {
      setTokens(await oneInchService.getTokens())
    } catch (err: any) {
      setError(err.message || "Failed to get tokens")
    } finally {
      setIsLoading(false)
    }
  }, [])

  const executeSwap = useCallback(async (params: any) => {
    setIsLoading(true)
    try {
      return await oneInchService.getSwapTransaction(params)
    } catch (err: any) {
      setError(err.message || "Failed to execute swap")
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { quote, tokens, isLoading, error, getQuote, getTokens, executeSwap }
}
