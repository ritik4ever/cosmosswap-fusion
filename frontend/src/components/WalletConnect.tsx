"use client"

import { useState } from "react"
import { Wallet, Shield, CheckCircle, AlertCircle, ExternalLink, RefreshCw } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { Alert, AlertDescription } from "./ui/alert"

interface WalletConnectProps {
  ethConnected: boolean
  cosmosConnected: boolean
  onConnectEth: () => Promise<void>
  onConnectCosmos: () => Promise<void>
  ethAccount?: string
  cosmosAccount?: string
  ethBalance?: string
  cosmosBalance?: string
  ethLoading?: boolean
  cosmosLoading?: boolean
}

export function WalletConnect({
  ethConnected,
  cosmosConnected,
  onConnectEth,
  onConnectCosmos,
  ethAccount,
  cosmosAccount,
  ethBalance = "0",
  cosmosBalance = "0",
  ethLoading = false,
  cosmosLoading = false,
}: WalletConnectProps) {
  const [isConnecting, setIsConnecting] = useState<"ethereum" | "cosmos" | null>(null)

  const handleEthereumConnect = async () => {
    setIsConnecting("ethereum")
    try {
      await onConnectEth()
    } catch (error) {
      console.error("Failed to connect Ethereum wallet:", error)
    } finally {
      setIsConnecting(null)
    }
  }

  const handleCosmosConnect = async () => {
    setIsConnecting("cosmos")
    try {
      await onConnectCosmos()
    } catch (error) {
      console.error("Failed to connect Cosmos wallet:", error)
    } finally {
      setIsConnecting(null)
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto shadow-2xl">
          <Wallet className="h-10 w-10 text-white" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
          Connect Your Wallets
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Connect both Ethereum and Cosmos wallets to start seamless cross-chain swapping
        </p>
      </div>

      {/* Security Badge */}
      <Alert className="bg-blue-500/10 border-blue-500/30 max-w-2xl mx-auto backdrop-blur-sm">
        <Shield className="h-4 w-4 text-blue-400" />
        <AlertDescription className="text-blue-300">
          <strong>Secured by 1inch Protocol + Cosmos HTLC</strong> - Your funds are protected by atomic swaps and
          battle-tested protocols
        </AlertDescription>
      </Alert>

      {/* Wallet Connection Cards */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Ethereum Wallet */}
        <Card className="bg-card/50 border-border hover:border-blue-500/50 transition-all duration-500 hover:shadow-xl hover:shadow-blue-500/10 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Wallet className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-foreground text-xl">Ethereum Wallet</CardTitle>
                  <CardDescription>Connect MetaMask or WalletConnect</CardDescription>
                </div>
              </div>
              {ethConnected && <CheckCircle className="h-6 w-6 text-green-400" />}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {!ethConnected ? (
              <>
                <Alert className="bg-orange-500/10 border-orange-500/30">
                  <AlertCircle className="h-4 w-4 text-orange-400" />
                  <AlertDescription className="text-orange-300">
                    Please ensure you're on Sepolia Testnet for testing
                  </AlertDescription>
                </Alert>

                <div className="space-y-3">
                  <Button
                    onClick={handleEthereumConnect}
                    disabled={isConnecting === "ethereum" || ethLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-lg font-semibold transition-all duration-300 hover:scale-105"
                  >
                    {isConnecting === "ethereum" || ethLoading ? (
                      <div className="flex items-center space-x-2">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Connecting...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Wallet className="h-4 w-4" />
                        <span>Connect MetaMask</span>
                      </div>
                    )}
                  </Button>

                  <div className="text-center">
                    <Button
                      variant="link"
                      size="sm"
                      className="text-muted-foreground hover:text-foreground"
                      onClick={() => window.open("https://metamask.io/", "_blank")}
                    >
                      Don't have MetaMask? <ExternalLink className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-4 space-y-3 backdrop-blur-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Network</span>
                    <Badge variant="outline" className="border-green-500/30 text-green-400">
                      Sepolia Testnet
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Balance</span>
                    <span className="text-sm text-foreground font-mono font-semibold">{ethBalance} ETH</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Address</span>
                    <span className="text-sm text-foreground font-mono">
                      {ethAccount ? formatAddress(ethAccount) : "Connected"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-sm text-green-400">
                  <CheckCircle className="h-4 w-4" />
                  <span>Ethereum wallet connected successfully</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cosmos Wallet */}
        <Card className="bg-card/50 border-border hover:border-purple-500/50 transition-all duration-500 hover:shadow-xl hover:shadow-purple-500/10 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Wallet className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-foreground text-xl">Cosmos Wallet</CardTitle>
                  <CardDescription>Connect Keplr or Cosmostation</CardDescription>
                </div>
              </div>
              {cosmosConnected && <CheckCircle className="h-6 w-6 text-green-400" />}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {!cosmosConnected ? (
              <>
                <div className="space-y-3">
                  <div className="text-sm text-muted-foreground">
                    <div className="mb-2">Supported Networks:</div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="border-border text-muted-foreground">
                        Cosmos Hub
                      </Badge>
                      <Badge variant="outline" className="border-border text-muted-foreground">
                        Osmosis
                      </Badge>
                      <Badge variant="outline" className="border-border text-muted-foreground">
                        Juno
                      </Badge>
                    </div>
                  </div>

                  <Button
                    onClick={handleCosmosConnect}
                    disabled={isConnecting === "cosmos" || cosmosLoading}
                    className="w-full bg-purple-600 hover:bg-purple-700 h-12 text-lg font-semibold transition-all duration-300 hover:scale-105"
                  >
                    {isConnecting === "cosmos" || cosmosLoading ? (
                      <div className="flex items-center space-x-2">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Connecting...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Wallet className="h-4 w-4" />
                        <span>Connect Keplr</span>
                      </div>
                    )}
                  </Button>

                  <div className="text-center">
                    <Button
                      variant="link"
                      size="sm"
                      className="text-muted-foreground hover:text-foreground"
                      onClick={() => window.open("https://www.keplr.app/", "_blank")}
                    >
                      Don't have Keplr? <ExternalLink className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-4 space-y-3 backdrop-blur-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Network</span>
                    <Badge variant="outline" className="border-green-500/30 text-green-400">
                      Cosmos Testnet
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Balance</span>
                    <span className="text-sm text-foreground font-mono font-semibold">{cosmosBalance} ATOM</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Address</span>
                    <span className="text-sm text-foreground font-mono">
                      {cosmosAccount ? formatAddress(cosmosAccount) : "Connected"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-sm text-green-400">
                  <CheckCircle className="h-4 w-4" />
                  <span>Cosmos wallet connected successfully</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Connection Status */}
      <div className="text-center">
        {!ethConnected || !cosmosConnected ? (
          <Alert className="bg-card/50 border-border max-w-2xl mx-auto backdrop-blur-sm">
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
            <AlertDescription className="text-muted-foreground">
              <strong>Both wallets required:</strong> Connect both Ethereum and Cosmos wallets to enable cross-chain
              swapping functionality
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="bg-green-500/10 border-green-500/30 max-w-2xl mx-auto backdrop-blur-sm">
            <CheckCircle className="h-4 w-4 text-green-400" />
            <AlertDescription className="text-green-300">
              <strong>All wallets connected!</strong> You're ready to start cross-chain swapping. The interface will
              load automatically.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Feature Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
        <div className="text-center space-y-3 group">
          <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
            <Shield className="h-6 w-6 text-green-400" />
          </div>
          <h3 className="text-foreground font-semibold">Secure</h3>
          <p className="text-muted-foreground text-sm">Protected by HTLC atomic swaps</p>
        </div>

        <div className="text-center space-y-3 group">
          <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
            <RefreshCw className="h-6 w-6 text-yellow-400" />
          </div>
          <h3 className="text-foreground font-semibold">Fast</h3>
          <p className="text-muted-foreground text-sm">Powered by 1inch aggregation</p>
        </div>

        <div className="text-center space-y-3 group">
          <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
            <CheckCircle className="h-6 w-6 text-blue-400" />
          </div>
          <h3 className="text-foreground font-semibold">Best Rates</h3>
          <p className="text-muted-foreground text-sm">Optimized cross-chain pricing</p>
        </div>
      </div>
    </div>
  )
}
