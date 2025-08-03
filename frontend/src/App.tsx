"use client"

import { useState, useEffect } from "react"
import { Header } from "./components/Header"
import { SwapInterface } from "./components/SwapInterface"
import { WalletConnect } from "./components/WalletConnect"
import { AnalyticsDashboard } from "./components/AnalyticsDashboard"
import { TransactionHistory } from "./components/TransactionHistory"
import { ThemeProvider } from "./components/ThemeProvider"
import { ThemeToggle } from "./components/ThemeToggle"
import { Footer } from "./components/Footer"
import { useWeb3 } from "./hooks/useWeb3"
import { useCosmos } from "./hooks/useCosmos"
import { useSwap } from "./hooks/useSwap"
import "./styles/globals.css"

function App() {
  const [currentView, setCurrentView] = useState<"swap" | "analytics" | "history">("swap")
  const [isWalletsConnected, setIsWalletsConnected] = useState(false)

  const {
    account: ethAccount,
    isConnected: ethConnected,
    balance: ethBalance,
    isLoading: ethLoading,
    connect: connectEth,
    disconnect: disconnectEth,
    chainId,
    switchNetwork,
  } = useWeb3()

  const {
    account: cosmosAccount,
    isConnected: cosmosConnected,
    balance: cosmosBalance,
    isLoading: cosmosLoading,
    connect: connectCosmos,
    disconnect: disconnectCosmos,
  } = useCosmos()

  const { swapState, executeSwap, getQuote, resetSwap } = useSwap()

  useEffect(() => {
    setIsWalletsConnected(ethConnected && cosmosConnected)
  }, [ethConnected, cosmosConnected])

  const handleDisconnectAll = () => {
    disconnectEth()
    disconnectCosmos()
    resetSwap()
  }

  return (
    <ThemeProvider defaultTheme="dark" storageKey="cosmosswap-theme">
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 transition-all duration-500">
        <Header
          ethAccount={ethAccount}
          cosmosAccount={cosmosAccount}
          isConnected={isWalletsConnected}
          onDisconnect={handleDisconnectAll}
          currentView={currentView}
          onViewChange={setCurrentView}
          chainId={chainId}
          onSwitchNetwork={switchNetwork}
        />

        <main className="container mx-auto px-4 py-8 min-h-[calc(100vh-200px)]">
          {!isWalletsConnected ? (
            <WalletConnect
              ethConnected={ethConnected}
              cosmosConnected={cosmosConnected}
              onConnectEth={connectEth}
              onConnectCosmos={connectCosmos}
              ethAccount={ethAccount}
              cosmosAccount={cosmosAccount}
              ethBalance={ethBalance}
              cosmosBalance={cosmosBalance}
              ethLoading={ethLoading}
              cosmosLoading={cosmosLoading}
            />
          ) : (
            <div className="max-w-6xl mx-auto">
              {currentView === "swap" && (
                <SwapInterface
                  swapState={swapState}
                  onExecuteSwap={executeSwap}
                  onGetQuote={getQuote}
                  ethAccount={ethAccount}
                  cosmosAccount={cosmosAccount}
                />
              )}

              {currentView === "analytics" && (
                <AnalyticsDashboard ethAccount={ethAccount} cosmosAccount={cosmosAccount} />
              )}

              {currentView === "history" && (
                <TransactionHistory ethAccount={ethAccount} cosmosAccount={cosmosAccount} />
              )}
            </div>
          )}
        </main>

        <Footer />
        <ThemeToggle />
      </div>
    </ThemeProvider>
  )
}

export default App
