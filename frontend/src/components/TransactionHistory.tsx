"use client"

import { useState } from "react"
import { Search, ExternalLink, Clock, CheckCircle, XCircle, RefreshCw } from "lucide-react"
import { Card, CardContent } from "./ui/card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Badge } from "./ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"

interface TransactionHistoryProps {
  ethAccount: string
  cosmosAccount: string
}

export function TransactionHistory({ ethAccount, cosmosAccount }: TransactionHistoryProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")

  // Mock transaction data - replace with actual API calls
  const transactions = [
    {
      id: "0x1234...5678",
      type: "swap",
      from: { token: "ETH", amount: "1.5", network: "Ethereum" },
      to: { token: "ATOM", amount: "245.8", network: "Cosmos" },
      status: "completed",
      timestamp: "2024-01-15T10:30:00Z",
      txHash: "0x1234567890abcdef",
      value: "$2,450.00",
      fee: "$12.50",
    },
    {
      id: "0x2345...6789",
      type: "swap",
      from: { token: "USDC", amount: "500", network: "Ethereum" },
      to: { token: "OSMO", amount: "1250", network: "Cosmos" },
      status: "pending",
      timestamp: "2024-01-15T08:15:00Z",
      txHash: "0x2345678901bcdef0",
      value: "$500.00",
      fee: "$8.75",
    },
    {
      id: "0x3456...7890",
      type: "swap",
      from: { token: "ATOM", amount: "100", network: "Cosmos" },
      to: { token: "ETH", amount: "0.75", network: "Ethereum" },
      status: "failed",
      timestamp: "2024-01-14T16:45:00Z",
      txHash: "0x3456789012cdef01",
      value: "$1,200.00",
      fee: "$15.00",
    },
    {
      id: "0x4567...8901",
      type: "swap",
      from: { token: "ETH", amount: "2.0", network: "Ethereum" },
      to: { token: "JUNO", amount: "5000", network: "Cosmos" },
      status: "completed",
      timestamp: "2024-01-14T14:20:00Z",
      txHash: "0x4567890123def012",
      value: "$3,200.00",
      fee: "$18.25",
    },
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-400" />
      case "pending":
        return <RefreshCw className="h-4 w-4 text-yellow-400 animate-spin" />
      case "failed":
        return <XCircle className="h-4 w-4 text-red-400" />
      default:
        return <Clock className="h-4 w-4 text-slate-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/20 text-green-400"
      case "pending":
        return "bg-yellow-500/20 text-yellow-400"
      case "failed":
        return "bg-red-500/20 text-red-400"
      default:
        return "bg-slate-500/20 text-slate-400"
    }
  }

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      tx.from.token.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.to.token.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.id.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || tx.status === statusFilter
    const matchesType = typeFilter === "all" || tx.type === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Transaction History</h1>
        <p className="text-muted-foreground">View and track all your cross-chain swap transactions</p>
      </div>

      {/* Filters */}
      <Card className="bg-card/50 border-border backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-background border-border text-foreground"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40 bg-background border-border text-foreground">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="all" className="text-foreground">
                  All Status
                </SelectItem>
                <SelectItem value="completed" className="text-foreground">
                  Completed
                </SelectItem>
                <SelectItem value="pending" className="text-foreground">
                  Pending
                </SelectItem>
                <SelectItem value="failed" className="text-foreground">
                  Failed
                </SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-40 bg-background border-border text-foreground">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="all" className="text-foreground">
                  All Types
                </SelectItem>
                <SelectItem value="swap" className="text-foreground">
                  Swap
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Transactions List */}
      <div className="space-y-4">
        {filteredTransactions.map((tx) => (
          <Card
            key={tx.id}
            className="bg-card/50 border-border hover:border-primary/50 transition-colors backdrop-blur-sm"
          >
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(tx.status)}
                    <Badge className={getStatusColor(tx.status)}>{tx.status}</Badge>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 text-foreground font-medium">
                      <span>
                        {tx.from.amount} {tx.from.token}
                      </span>
                      <span className="text-muted-foreground">→</span>
                      <span>
                        {tx.to.amount} {tx.to.token}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                      <span>{formatDate(tx.timestamp)}</span>
                      <span>•</span>
                      <span>Fee: {tx.fee}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-foreground font-medium">{tx.value}</div>
                    <div className="text-sm text-muted-foreground">
                      {tx.from.network} → {tx.to.network}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => window.open(`https://etherscan.io/tx/${tx.txHash}`, "_blank")}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Transaction ID:</span>
                  <span className="text-foreground font-mono">{tx.id}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTransactions.length === 0 && (
        <Card className="bg-card/50 border-border backdrop-blur-sm">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-foreground font-medium mb-2">No transactions found</h3>
            <p className="text-muted-foreground">Try adjusting your search criteria or filters</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
