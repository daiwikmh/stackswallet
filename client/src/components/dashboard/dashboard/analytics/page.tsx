import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, BarChart3, DollarSign, Bitcoin, Users, Activity } from "lucide-react"

export default function AnalyticsPage() {
  const protocolStats = {
    tvl: "2.4B",
    tvlChange: "+12.5",
    totalUsers: "47,234",
    usersChange: "+8.2",
    totalBTC: "12,847",
    btcChange: "+15.3",
    avgAPY: "8.7",
    apyChange: "+0.4",
  }

  const marketData = [
    { pool: "BTC Lending Pool Alpha", tvl: "74.8M", apy: "8.5", utilization: "78", volume24h: "2.4M" },
    { pool: "BTC High Yield Pool", tvl: "53.5M", apy: "12.3", utilization: "92", volume24h: "1.8M" },
    { pool: "BTC Stable Pool", tvl: "129.4M", apy: "6.8", utilization: "65", volume24h: "3.2M" },
    { pool: "BTC Premium Pool", tvl: "27.4M", apy: "15.7", utilization: "95", volume24h: "0.9M" },
  ]

  const topBorrowers = [
    { address: "bc1q...7x8k", borrowed: "245.7", collateral: "327.6", healthFactor: "2.45" },
    { address: "bc1q...9m2n", borrowed: "189.3", collateral: "252.4", healthFactor: "1.87" },
    { address: "bc1q...4p5q", borrowed: "156.8", collateral: "209.1", healthFactor: "2.12" },
    { address: "bc1q...8r9s", borrowed: "134.2", collateral: "178.9", healthFactor: "1.95" },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wider">PROTOCOL ANALYTICS</h1>
          <p className="text-sm text-neutral-400">Real-time insights and performance metrics</p>
        </div>
      </div>

      {/* Protocol Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-neutral-900 border-neutral-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-neutral-400 tracking-wider">TOTAL VALUE LOCKED</p>
                <p className="text-2xl font-bold text-white font-mono">${protocolStats.tvl}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3 text-white" />
                  <span className="text-xs text-white">+{protocolStats.tvlChange}%</span>
                </div>
              </div>
              <DollarSign className="w-8 h-8 text-white" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border-neutral-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-neutral-400 tracking-wider">TOTAL USERS</p>
                <p className="text-2xl font-bold text-white font-mono">{protocolStats.totalUsers}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3 text-white" />
                  <span className="text-xs text-white">+{protocolStats.usersChange}%</span>
                </div>
              </div>
              <Users className="w-8 h-8 text-white" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border-neutral-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-neutral-400 tracking-wider">TOTAL BTC LOCKED</p>
                <p className="text-2xl font-bold text-white font-mono">{protocolStats.totalBTC}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3 text-orange-500" />
                  <span className="text-xs text-orange-500">+{protocolStats.btcChange}%</span>
                </div>
              </div>
              <Bitcoin className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border-neutral-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-neutral-400 tracking-wider">AVERAGE APY</p>
                <p className="text-2xl font-bold text-orange-500 font-mono">{protocolStats.avgAPY}%</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3 text-orange-500" />
                  <span className="text-xs text-orange-500">+{protocolStats.apyChange}%</span>
                </div>
              </div>
              <BarChart3 className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-neutral-900 border-neutral-700">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-neutral-300 tracking-wider">TVL GROWTH (30 DAYS)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 relative">
              {/* Chart Grid */}
              <div className="absolute inset-0 grid grid-cols-8 grid-rows-6 opacity-20">
                {Array.from({ length: 48 }).map((_, i) => (
                  <div key={i} className="border border-neutral-700"></div>
                ))}
              </div>

              {/* Chart Line */}
              <svg className="absolute inset-0 w-full h-full">
                <polyline
                  points="0,140 50,130 100,120 150,110 200,100 250,90 300,85 350,70"
                  fill="none"
                  stroke="#f97316"
                  strokeWidth="3"
                />
                <defs>
                  <linearGradient id="tvlGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#f97316" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <polygon
                  points="0,140 50,130 100,120 150,110 200,100 250,90 300,85 350,70 350,192 0,192"
                  fill="url(#tvlGradient)"
                />
              </svg>

              {/* Y-axis labels */}
              <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-neutral-500 -ml-8 font-mono">
                <span>$3.0B</span>
                <span>$2.5B</span>
                <span>$2.0B</span>
                <span>$1.5B</span>
              </div>

              {/* X-axis labels */}
              <div className="absolute bottom-0 left-0 w-full flex justify-between text-xs text-neutral-500 -mb-6 font-mono">
                <span>30d ago</span>
                <span>Today</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border-neutral-700">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-neutral-300 tracking-wider">USER GROWTH (30 DAYS)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 relative">
              {/* Chart Grid */}
              <div className="absolute inset-0 grid grid-cols-8 grid-rows-6 opacity-20">
                {Array.from({ length: 48 }).map((_, i) => (
                  <div key={i} className="border border-neutral-700"></div>
                ))}
              </div>

              {/* Chart Bars */}
              <div className="absolute inset-0 flex items-end justify-between px-4 pb-4">
                {[65, 72, 68, 78, 85, 82, 90, 95].map((height, index) => (
                  <div key={index} className="bg-orange-500 w-8 rounded-t" style={{ height: `${height}%` }}></div>
                ))}
              </div>

              {/* Y-axis labels */}
              <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-neutral-500 -ml-8 font-mono">
                <span>50K</span>
                <span>40K</span>
                <span>30K</span>
                <span>20K</span>
              </div>

              {/* X-axis labels */}
              <div className="absolute bottom-0 left-0 w-full flex justify-between text-xs text-neutral-500 -mb-6 font-mono">
                <span>30d ago</span>
                <span>Today</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Market Data */}
      <Card className="bg-neutral-900 border-neutral-700">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-neutral-300 tracking-wider">
            LENDING POOL PERFORMANCE
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-700">
                  <th className="text-left py-3 px-4 text-xs font-medium text-neutral-400 tracking-wider">POOL</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-neutral-400 tracking-wider">TVL</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-neutral-400 tracking-wider">APY</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-neutral-400 tracking-wider">
                    UTILIZATION
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-neutral-400 tracking-wider">
                    24H VOLUME
                  </th>
                </tr>
              </thead>
              <tbody>
                {marketData.map((pool, index) => (
                  <tr key={index} className="border-b border-neutral-800 hover:bg-neutral-800 transition-colors">
                    <td className="py-3 px-4 text-sm text-white">{pool.pool}</td>
                    <td className="py-3 px-4 text-sm text-white font-mono">${pool.tvl}</td>
                    <td className="py-3 px-4 text-sm text-orange-500 font-mono">{pool.apy}%</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-neutral-800 rounded-full h-2">
                          <div
                            className="bg-orange-500 h-2 rounded-full"
                            style={{ width: `${pool.utilization}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-white font-mono">{pool.utilization}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-white font-mono">${pool.volume24h}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Top Borrowers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-neutral-900 border-neutral-700">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-neutral-300 tracking-wider">TOP BORROWERS</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topBorrowers.map((borrower, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-neutral-800 rounded">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-neutral-700 rounded-full flex items-center justify-center text-xs font-mono">
                      #{index + 1}
                    </div>
                    <div>
                      <div className="text-sm text-white font-mono">{borrower.address}</div>
                      <div className="text-xs text-neutral-400">Health Factor: {borrower.healthFactor}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-white font-mono">${borrower.borrowed}K</div>
                    <div className="text-xs text-neutral-400">{borrower.collateral} BTC collateral</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border-neutral-700">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-neutral-300 tracking-wider">PROTOCOL ACTIVITY</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-neutral-800 rounded">
                <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-orange-500" />
                  <div>
                    <div className="text-sm text-white">Large lending position opened</div>
                    <div className="text-xs text-neutral-400">12.5 BTC deposited</div>
                  </div>
                </div>
                <div className="text-xs text-neutral-400 font-mono">2 min ago</div>
              </div>

              <div className="flex items-center justify-between p-3 bg-neutral-800 rounded">
                <div className="flex items-center gap-3">
                  <TrendingDown className="w-5 h-5 text-red-500" />
                  <div>
                    <div className="text-sm text-white">Borrowing position liquidated</div>
                    <div className="text-xs text-neutral-400">Health factor below 1.0</div>
                  </div>
                </div>
                <div className="text-xs text-neutral-400 font-mono">15 min ago</div>
              </div>

              <div className="flex items-center justify-between p-3 bg-neutral-800 rounded">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-white" />
                  <div>
                    <div className="text-sm text-white">Staking rewards distributed</div>
                    <div className="text-xs text-neutral-400">247.8 BTC in rewards</div>
                  </div>
                </div>
                <div className="text-xs text-neutral-400 font-mono">1 hour ago</div>
              </div>

              <div className="flex items-center justify-between p-3 bg-neutral-800 rounded">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-white" />
                  <div>
                    <div className="text-sm text-white">New governance proposal</div>
                    <div className="text-xs text-neutral-400">Protocol fee adjustment</div>
                  </div>
                </div>
                <div className="text-xs text-neutral-400 font-mono">3 hours ago</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
