"use client"

import { useState, useEffect, useCallback } from "react"

declare global {
  interface Window {
    keplr?: any
  }
}

export function useCosmos() {
  const [account, setAccount] = useState<string>("")
  const [isConnected, setIsConnected] = useState(false)
  const [balance, setBalance] = useState<string>("0")
  const [isLoading, setIsLoading] = useState(false)

  const getBalance = useCallback(async (_address: string) => {
    try {
      // Mock balance for now - replace with actual Cosmos API call
      const mockBalance = (Math.random() * 1000).toFixed(2)
      setBalance(mockBalance)
    } catch (error) {
      console.error("Failed to get Cosmos balance:", error)
      setBalance("0")
    }
  }, [])

  const connect = async () => {
    if (typeof window.keplr === "undefined") {
      throw new Error("Keplr wallet is not installed")
    }

    setIsLoading(true)
    try {
      // Enable Keplr for Cosmos Hub
      await window.keplr.enable("cosmoshub-4")

      // Get the offline signer
      const offlineSigner = window.keplr.getOfflineSigner("cosmoshub-4")
      const accounts = await offlineSigner.getAccounts()

      if (accounts.length > 0) {
        setAccount(accounts[0].address)
        setIsConnected(true)
        await getBalance(accounts[0].address)
      }
    } catch (error) {
      console.error("Failed to connect Keplr wallet:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const disconnect = () => {
    setAccount("")
    setIsConnected(false)
    setBalance("0")
  }

  // Check if already connected on mount (but don't auto-connect)
  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window.keplr !== "undefined") {
        try {
          // Check if already connected (without requesting connection)
          const key = await window.keplr.getKey("cosmoshub-4")
          if (key) {
            setAccount(key.bech32Address)
            setIsConnected(true)
            await getBalance(key.bech32Address)
          }
        } catch (error) {
          // Not connected yet, that's fine
        }
      }
    }

    // Wait a bit for Keplr to load
    const timer = setTimeout(checkConnection, 1000)
    return () => clearTimeout(timer)
  }, [getBalance])

  return {
    account,
    isConnected,
    balance,
    isLoading,
    connect,
    disconnect,
  }
}
