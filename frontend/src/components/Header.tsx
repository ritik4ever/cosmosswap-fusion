"use client"

import React from "react"
import { Wallet, BarChart3, History, Settings, Menu, X, ChevronDown, ExternalLink, Copy, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

interface HeaderProps {
  ethAccount?: string
  cosmosAccount?: string
  isConnected: boolean
  onDisconnect: () => void
  currentView: "swap" | "analytics" | "history"
  onViewChange: (view: "swap" | "analytics" | "history") => void
  chainId?: number
  onSwitchNetwork: (chainId: number) => void
}

export function Header({
  ethAccount,
  cosmosAccount,
  isConnected,
  onDisconnect,
  currentView,
  onViewChange,
  chainId,
  onSwitchNetwork,
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

  const getNetworkName = (chainId?: number) => {
    switch (chainId) {
      case 1:
        return "Ethereum"
      case 11155111:
        return "Sepolia"
      case 137:
        return "Polygon"
      default:
        return "Unknown"
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const navigationItems = [
    { id: "swap", label: "Swap", icon: Wallet },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "history", label: "History", icon: History },
  ]

  return (
    <header className="sticky top-0 z-50 border-b border-slate-700 bg-slate-900/95 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">1</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-white">1inch Fusion+</h1>
                <p className="text-xs text-slate-400">× Cosmos Bridge</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-orange-500/20 text-orange-400 border-orange-500/30">
              Testnet
            </Badge>
          </div>

          {/* Navigation - Desktop */}
          {isConnected && (
            <nav className="hidden md:flex items-center space-x-1">
              {navigationItems.map((item) => (
                <Button
                  key={item.id}
                  variant={currentView === item.id ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onViewChange(item.id as any)}
                  className={`flex items-center space-x-2 ${
                    currentView === item.id
                      ? "bg-blue-600 text-white"
                      : "text-slate-300 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Button>
              ))}
            </nav>
          )}

          {/* Account Info & Settings */}
          <div className="flex items-center space-x-3">
            {/* Network Status */}
            {isConnected && (
              <div className="hidden sm:flex items-center space-x-2 text-sm">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-slate-300">{getNetworkName(chainId)}</span>
                </div>
                <span className="text-slate-500">|</span>
                <span className="text-green-400">12 gwei</span>
              </div>
            )}

            {/* Account Dropdown */}
            {isConnected && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="border-slate-600 bg-slate-800 hover:bg-slate-700">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
                      <span className="hidden sm:block text-white">
                        {ethAccount ? formatAddress(ethAccount) : "Connected"}
                      </span>
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 bg-slate-800 border-slate-700">
                  <div className="p-4 space-y-4">
                    {/* Ethereum Account */}
                    {ethAccount && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-slate-300">Ethereum</span>
                          <Badge variant="outline" className="border-blue-500/30 text-blue-400">
                            {getNetworkName(chainId)}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between bg-slate-700 rounded-lg p-2">
                          <span className="text-sm font-mono text-white">{formatAddress(ethAccount)}</span>
                          <div className="flex space-x-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard(ethAccount)}
                              className="h-6 w-6 p-0 hover:bg-slate-600"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => window.open(`https://etherscan.io/address/${ethAccount}`, "_blank")}
                              className="h-6 w-6 p-0 hover:bg-slate-600"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Cosmos Account */}
                    {cosmosAccount && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-slate-300">Cosmos</span>
                          <Badge variant="outline" className="border-purple-500/30 text-purple-400">
                            Testnet
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between bg-slate-700 rounded-lg p-2">
                          <span className="text-sm font-mono text-white">{formatAddress(cosmosAccount)}</span>
                          <div className="flex space-x-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard(cosmosAccount)}
                              className="h-6 w-6 p-0 hover:bg-slate-600"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <DropdownMenuSeparator className="bg-slate-700" />

                  <DropdownMenuItem
                    onClick={onDisconnect}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Disconnect All
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Settings */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-slate-300 hover:text-white">
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                <DropdownMenuItem className="text-slate-300 hover:text-white">Network Settings</DropdownMenuItem>
                <DropdownMenuItem className="text-slate-300 hover:text-white">Slippage Tolerance</DropdownMenuItem>
                <DropdownMenuItem className="text-slate-300 hover:text-white">Transaction Deadline</DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-700" />
                <DropdownMenuItem className="text-slate-300 hover:text-white">Help & Support</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-slate-300"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && isConnected && (
          <div className="md:hidden py-4 border-t border-slate-700">
            <nav className="space-y-2">
              {navigationItems.map((item) => (
                <Button
                  key={item.id}
                  variant={currentView === item.id ? "default" : "ghost"}
                  size="sm"
                  onClick={() => {
                    onViewChange(item.id as any)
                    setMobileMenuOpen(false)
                  }}
                  className={`w-full justify-start ${
                    currentView === item.id
                      ? "bg-blue-600 text-white"
                      : "text-slate-300 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <item.icon className="h-4 w-4 mr-2" />
                  {item.label}
                </Button>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
