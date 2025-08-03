"use client"
import { TrendingUp, DollarSign, Activity, Users, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"

interface AnalyticsDashboardProps {
  ethAccount: string
  cosmosAccount: string
}

export function AnalyticsDashboard({}: AnalyticsDashboardProps) {
  // Mock data - replace with actual API calls
  const stats = {
    totalVolume: "$2,456,789",
    totalSwaps: "1,234",
    avgSwapTime: "4.2 min",
    successRate: "99.8%",
  }

  const recentActivity = [
    {
      id: 1,
      type: "swap",
      from: "ETH",
      to: "ATOM",
      amount: "1.5",
      value: "$2,450",
      status: "completed",
      time: "2 hours ago",
    },
    {
      id: 2,
      type: "swap",
      from: "USDC",
      to: "OSMO",
      amount: "500",
      value: "$500",
      status: "pending",
      time: "5 hours ago",
    },
    {
      id: 3,
      type: "swap",
      from: "ATOM",
      to: "ETH",
      amount: "100",
      value: "$1,200",
      status: "completed",
      time: "1 day ago",
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Analytics Dashboard</h1>
        <p className="text-slate-400">Track your cross-chain swap performance and activity</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Total Volume</CardTitle>
            <DollarSign className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalVolume}</div>
            <p className="text-xs text-green-400 flex items-center">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              +12.5% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Total Swaps</CardTitle>
            <Activity className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalSwaps}</div>
            <p className="text-xs text-blue-400 flex items-center">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              +8.2% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Avg Swap Time</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.avgSwapTime}</div>
            <p className="text-xs text-purple-400 flex items-center">
              <ArrowDownRight className="h-3 w-3 mr-1" />
              -15% faster
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Success Rate</CardTitle>
            <Users className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.successRate}</div>
            <p className="text-xs text-yellow-400">Excellent performance</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Recent Activity</CardTitle>
          <CardDescription>Your latest cross-chain swaps</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Activity className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-white font-medium">
                        {activity.amount} {activity.from} → {activity.to}
                      </span>
                      <Badge
                        variant={activity.status === "completed" ? "default" : "secondary"}
                        className={
                          activity.status === "completed"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-yellow-500/20 text-yellow-400"
                        }
                      >
                        {activity.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-400">{activity.time}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white font-medium">{activity.value}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}