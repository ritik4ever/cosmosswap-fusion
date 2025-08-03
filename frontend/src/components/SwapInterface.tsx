"use client"

import { useState, useEffect } from "react"
import { ArrowUpDown, Settings, RefreshCw, Info, TrendingUp, Shield, Zap } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Badge } from "./ui/badge"
import { Alert, AlertDescription } from "./ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"

interface SwapInterfaceProps {
  swapState: any
  onExecuteSwap: (params: any) => Promise<void>
  onGetQuote: (params: any) => Promise<void>
  ethAccount: string
  cosmosAccount: string
}

export function SwapInterface({ swapState, onExecuteSwap, onGetQuote, ethAccount, cosmosAccount }: SwapInterfaceProps) {
  const [fromAmount, setFromAmount] = useState("")
  const [toAmount, setToAmount] = useState("")
  const [fromToken, setFromToken] = useState("ETH")
  const [toToken, setToToken] = useState("ATOM")
  const [slippage, setSlippage] = useState(0.5)
  const [isSwapping, setIsSwapping] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [quoteLoading, setQuoteLoading] = useState(false)

  // Mock token balances - replace with actual balance hooks
  const [balances, setBalances] = useState({
    ETH: "2.5",
    USDC: "1000.0",
    USDT: "500.0",
    ATOM: "150.2",
    OSMO: "75.5",
    JUNO: "200.0",
  })

  const ethereumTokens = [
    { symbol: "ETH", name: "Ethereum", icon: "⟠" },
    { symbol: "USDC", name: "USD Coin", icon: "💵" },
    { symbol: "USDT", name: "Tether", icon: "₮" },
  ]

  const cosmosTokens = [
    { symbol: "ATOM", name: "Cosmos", icon: "⚛️" },
    { symbol: "OSMO", name: "Osmosis", icon: "🧪" },
    { symbol: "JUNO", name: "Juno", icon: "🪐" },
  ]

  const handleSwap = async () => {
    if (!fromAmount || !toAmount) return

    setIsSwapping(true)
    try {
      await onExecuteSwap({
        fromToken,
        toToken,
        fromAmount,
        toAmount,
        slippage,
        fromAccount: fromToken === "ETH" || fromToken === "USDC" || fromToken === "USDT" ? ethAccount : cosmosAccount,
        toAccount: toToken === "ETH" || toToken === "USDC" || toToken === "USDT" ? ethAccount : cosmosAccount,
      })
    } catch (error) {
      console.error("Swap failed:", error)
    } finally {
      setIsSwapping(false)
    }
  }

  const handleFlipTokens = () => {
    setFromToken(toToken)
    setToToken(fromToken)
    setFromAmount(toAmount)
    setToAmount(fromAmount)
  }

  const getQuote = async () => {
    if (!fromAmount) return

    setQuoteLoading(true)
    try {
      await onGetQuote({
        fromToken,
        toToken,
        amount: fromAmount,
      })
      // Mock quote response
      setToAmount((Number.parseFloat(fromAmount) * 245.8).toString())
    } catch (error) {
      console.error("Quote failed:", error)
    } finally {
      setQuoteLoading(false)
    }
  }

  useEffect(() => {
    if (fromAmount) {
      const timer = setTimeout(getQuote, 500)
      return () => clearTimeout(timer)
    }
  }, [fromAmount, fromToken, toToken])

  const isEthereumToken = (token: string) => ["ETH", "USDC", "USDT"].includes(token)
  const getNetworkBadge = (token: string) => (isEthereumToken(token) ? "Ethereum" : "Cosmos")
  const getNetworkColor = (token: string) => (isEthereumToken(token) ? "blue" : "purple")

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Main Swap Card */}
      <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white text-2xl">Cross-Chain Swap</CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-slate-400 hover:text-white"
              >
                <Settings className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={getQuote}
                disabled={quoteLoading}
                className="text-slate-400 hover:text-white"
              >
                <RefreshCw className={`h-4 w-4 ${quoteLoading ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Advanced Settings */}
          {showAdvanced && (
            <div className="space-y-4 p-4 bg-slate-700/30 rounded-lg border border-slate-600">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-300">Slippage Tolerance</span>
                  <span className="text-sm text-white">{slippage}%</span>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant={slippage === 0.1 ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSlippage(0.1)}
                    className="text-xs"
                  >
                    0.1%
                  </Button>
                  <Button
                    variant={slippage === 0.5 ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSlippage(0.5)}
                    className="text-xs"
                  >
                    0.5%
                  </Button>
                  <Button
                    variant={slippage === 1.0 ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSlippage(1.0)}
                    className="text-xs"
                  >
                    1.0%
                  </Button>
                  <Input
                    type="number"
                    value={slippage}
                    onChange={(e) => setSlippage(Number.parseFloat(e.target.value))}
                    className="w-20 h-8 text-xs"
                    step="0.1"
                    min="0.1"
                    max="50"
                  />
                </div>
              </div>
            </div>
          )}

          {/* From Token */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">From</span>
              <span className="text-sm text-slate-400">
                Balance: {balances[fromToken as keyof typeof balances]} {fromToken}
              </span>
            </div>
            <div className="flex space-x-3">
              <div className="flex-1">
                <Input
                  type="number"
                  placeholder="0.0"
                  value={fromAmount}
                  onChange={(e) => setFromAmount(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white text-xl h-14 text-right"
                />
              </div>
              <Select value={fromToken} onValueChange={setFromToken}>
                <SelectTrigger className="w-32 bg-slate-700 border-slate-600 text-white h-14">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <div className="p-2 text-xs text-slate-400 font-medium">Ethereum</div>
                  {ethereumTokens.map((token) => (
                    <SelectItem key={token.symbol} value={token.symbol} className="text-white">
                      <div className="flex items-center space-x-2">
                        <span>{token.icon}</span>
                        <span>{token.symbol}</span>
                      </div>
                    </SelectItem>
                  ))}
                  <div className="p-2 text-xs text-slate-400 font-medium">Cosmos</div>
                  {cosmosTokens.map((token) => (
                    <SelectItem key={token.symbol} value={token.symbol} className="text-white">
                      <div className="flex items-center space-x-2">
                        <span>{token.icon}</span>
                        <span>{token.symbol}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Badge
              variant="outline"
              className={`${
                isEthereumToken(fromToken) ? "border-blue-500/30 text-blue-400" : "border-purple-500/30 text-purple-400"
              } w-fit`}
            >
              {getNetworkBadge(fromToken)} Network
            </Badge>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleFlipTokens}
              className="rounded-full bg-slate-700 hover:bg-slate-600 text-white border-4 border-slate-800 h-12 w-12"
            >
              <ArrowUpDown className="h-5 w-5" />
            </Button>
          </div>

          {/* To Token */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">To</span>
              <span className="text-sm text-slate-400">
                Balance: {balances[toToken as keyof typeof balances]} {toToken}
              </span>
            </div>
            <div className="flex space-x-3">
              <div className="flex-1">
                <Input
                  type="number"
                  placeholder="0.0"
                  value={toAmount}
                  onChange={(e) => setToAmount(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white text-xl h-14 text-right"
                  readOnly
                />
              </div>
              <Select value={toToken} onValueChange={setToToken}>
                <SelectTrigger className="w-32 bg-slate-700 border-slate-600 text-white h-14">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <div className="p-2 text-xs text-slate-400 font-medium">Ethereum</div>
                  {ethereumTokens.map((token) => (
                    <SelectItem key={token.symbol} value={token.symbol} className="text-white">
                      <div className="flex items-center space-x-2">
                        <span>{token.icon}</span>
                        <span>{token.symbol}</span>
                      </div>
                    </SelectItem>
                  ))}
                  <div className="p-2 text-xs text-slate-400 font-medium">Cosmos</div>
                  {cosmosTokens.map((token) => (
                    <SelectItem key={token.symbol} value={token.symbol} className="text-white">
                      <div className="flex items-center space-x-2">
                        <span>{token.icon}</span>
                        <span>{token.symbol}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Badge
              variant="outline"
              className={`${
                isEthereumToken(toToken) ? "border-blue-500/30 text-blue-400" : "border-purple-500/30 text-purple-400"
              } w-fit`}
            >
              {getNetworkBadge(toToken)} Network
            </Badge>
          </div>

          {/* Swap Details */}
          {fromAmount && toAmount && (
            <div className="space-y-3 p-4 bg-slate-700/30 rounded-lg border border-slate-600">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-300">Exchange Rate</span>
                <span className="text-white">
                  1 {fromToken} = {(Number.parseFloat(toAmount) / Number.parseFloat(fromAmount)).toFixed(4)} {toToken}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-300">Network Fee</span>
                <span className="text-white">~$12.50</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-300">Bridge Fee</span>
                <span className="text-white">0.1%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-300">Slippage Tolerance</span>
                <span className="text-white">{slippage}%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-300">Estimated Time</span>
                <span className="text-white">~5-10 minutes</span>
              </div>
            </div>
          )}

          {/* Swap Button */}
          <Button
            onClick={handleSwap}
            disabled={!fromAmount || !toAmount || isSwapping}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 h-14 text-lg font-semibold"
          >
            {isSwapping ? (
              <div className="flex items-center space-x-2">
                <RefreshCw className="h-5 w-5 animate-spin" />
                <span>Swapping...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <ArrowUpDown className="h-5 w-5" />
                <span>Swap Tokens</span>
              </div>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Info Alert */}
      <Alert className="bg-blue-500/10 border-blue-500/30">
        <Info className="h-4 w-4 text-blue-400" />
        <AlertDescription className="text-blue-300">
          Cross-chain swaps are secured by HTLC atomic swaps and may take 5-10 minutes to complete. Your funds are safe
          throughout the entire process.
        </AlertDescription>
      </Alert>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-800/30 border-slate-700">
          <CardContent className="p-4 text-center space-y-2">
            <Shield className="h-6 w-6 text-green-400 mx-auto" />
            <h3 className="text-white font-medium">Secure</h3>
            <p className="text-slate-400 text-sm">HTLC atomic swaps</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/30 border-slate-700">
          <CardContent className="p-4 text-center space-y-2">
            <Zap className="h-6 w-6 text-yellow-400 mx-auto" />
            <h3 className="text-white font-medium">Fast</h3>
            <p className="text-slate-400 text-sm">1inch aggregation</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/30 border-slate-700">
          <CardContent className="p-4 text-center space-y-2">
            <TrendingUp className="h-6 w-6 text-blue-400 mx-auto" />
            <h3 className="text-white font-medium">Best Rates</h3>
            <p className="text-slate-400 text-sm">Optimized pricing</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
