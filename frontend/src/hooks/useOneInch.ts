import { useState, useCallback } from 'react'
import { oneInchService, SwapQuote, TokenInfo } from '../services/oneInchApi'

export function useOneInch() {
  const [isLoading, setIsLoading] = useState(false)
  const [swapQuote, setSwapQuote] = useState<SwapQuote | null>(null)
  const [fusionQuote, setFusionQuote] = useState<any>(null)
  const [tokenPrices, setTokenPrices] = useState<Record<string, string>>({})
  const [availableTokens, setAvailableTokens] = useState<Record<string, TokenInfo>>({})
  const [error, setError] = useState<string | null>(null)

  const getSwapQuote = useCallback(async (
    chainId: number,
    fromTokenAddress: string,
    toTokenAddress: string,
    amount: string,
    from: string,
    slippage: number = 1
  ) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const quote = await oneInchService.getSwapQuote(
        chainId,
        fromTokenAddress,
        toTokenAddress,
        amount,
        from,
        slippage
      )
      setSwapQuote(quote)
    } catch (error: any) {
      setError(error.message)
      console.error('1inch quote failed:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const getFusionPlusQuote = useCallback(async (
    fromChainId: number | string,
    toChainId: number | string,
    fromTokenAddress: string,
    toTokenAddress: string,
    amount: string,
    walletAddress: string
  ) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const quote = await oneInchService.getFusionPlusQuote(
        fromChainId as number,
        toChainId as number,
        fromTokenAddress,
        toTokenAddress,
        amount,
        walletAddress
      )
      setFusionQuote(quote)
    } catch (error: any) {
      setError(error.message)
      console.error('1inch Fusion+ quote failed:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const getTokenList = useCallback(async (chainId: number) => {
    try {
      const tokens = await oneInchService.getTokenList(chainId)
      setAvailableTokens(tokens)
    } catch (error: any) {
      setError(error.message)
      console.error('Token list fetch failed:', error)
    }
  }, [])

  const getTokenPrices = useCallback(async (chainId: number, tokenAddresses: string[]) => {
    try {
      const prices = await oneInchService.getTokenPrices(chainId, tokenAddresses)
      setTokenPrices(prices)
    } catch (error: any) {
      setError(error.message)
      console.error('Price fetch failed:', error)
    }
  }, [])

  const buildSwapTransaction = useCallback(async (
    chainId: number,
    fromTokenAddress: string,
    toTokenAddress: string,
    amount: string,
    from: string,
    slippage: number = 1
  ) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const swapTx = await oneInchService.buildSwapTransaction(
        chainId,
        fromTokenAddress,
        toTokenAddress,
        amount,
        from,
        slippage
      )
      return swapTx
    } catch (error: any) {
      setError(error.message)
      console.error('Swap transaction build failed:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    isLoading,
    swapQuote,
    fusionQuote,
    tokenPrices,
    availableTokens,
    error,
    getSwapQuote,
    getFusionPlusQuote,
    getTokenList,
    getTokenPrices,
    buildSwapTransaction
  }
}