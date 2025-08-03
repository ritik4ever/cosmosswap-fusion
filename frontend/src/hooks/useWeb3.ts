"use client"

import { useState, useEffect, useCallback } from "react"

declare global {
  interface Window {
    ethereum?: any
  }
}

export function useWeb3() {
  const [account, setAccount] = useState<string>("")
  const [isConnected, setIsConnected] = useState(false)
  const [chainId, setChainId] = useState<number>()
  const [balance, setBalance] = useState<string>("0")
  const [isLoading, setIsLoading] = useState(false)

  const getBalance = useCallback(async (address: string) => {
    if (typeof window.ethereum !== "undefined" && address) {
      try {
        const balance = await window.ethereum.request({
          method: "eth_getBalance",
          params: [address, "latest"],
        })
        // Convert from wei to ETH
        const balanceInEth = (Number.parseInt(balance, 16) / Math.pow(10, 18)).toFixed(4)
        setBalance(balanceInEth)
      } catch (error) {
        console.error("Failed to get balance:", error)
        setBalance("0")
      }
    }
  }, [])

  const connect = async () => {
    if (typeof window.ethereum === "undefined") {
      throw new Error("MetaMask is not installed")
    }

    setIsLoading(true)
    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      })

      if (accounts.length > 0) {
        setAccount(accounts[0])
        setIsConnected(true)

        // Get chain ID
        const chainId = await window.ethereum.request({
          method: "eth_chainId",
        })
        setChainId(Number.parseInt(chainId, 16))

        // Get balance
        await getBalance(accounts[0])
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const disconnect = () => {
    setAccount("")
    setIsConnected(false)
    setChainId(undefined)
    setBalance("0")
  }

  const switchNetwork = async (targetChainId: number) => {
    if (typeof window.ethereum !== "undefined") {
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: `0x${targetChainId.toString(16)}` }],
        })
        setChainId(targetChainId)
      } catch (error) {
        console.error("Failed to switch network:", error)
        throw error
      }
    }
  }

  // Check if already connected on mount (but don't auto-connect)
  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window.ethereum !== "undefined") {
        try {
          // Check if already connected (without requesting connection)
          const accounts = await window.ethereum.request({
            method: "eth_accounts",
          })

          if (accounts.length > 0) {
            setAccount(accounts[0])
            setIsConnected(true)

            // Get current chain ID
            const chainId = await window.ethereum.request({
              method: "eth_chainId",
            })
            setChainId(Number.parseInt(chainId, 16))

            // Get balance
            await getBalance(accounts[0])
          }
        } catch (error) {
          console.error("Failed to check connection:", error)
        }
      }
    }

    checkConnection()
  }, [getBalance])

  // Listen for account and chain changes
  useEffect(() => {
    if (typeof window.ethereum !== "undefined") {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnect()
        } else {
          setAccount(accounts[0])
          setIsConnected(true)
          getBalance(accounts[0])
        }
      }

      const handleChainChanged = (chainId: string) => {
        setChainId(Number.parseInt(chainId, 16))
      }

      window.ethereum.on("accountsChanged", handleAccountsChanged)
      window.ethereum.on("chainChanged", handleChainChanged)

      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
          window.ethereum.removeListener("chainChanged", handleChainChanged)
        }
      }
    }
  }, [getBalance])

  return {
    account,
    isConnected,
    chainId,
    balance,
    isLoading,
    connect,
    disconnect,
    switchNetwork,
  }
}
