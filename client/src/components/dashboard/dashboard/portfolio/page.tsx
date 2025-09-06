import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bitcoin, TrendingUp, TrendingDown, Percent } from "lucide-react"

export default function PortfolioPage() {
  const portfolioData = {
    totalBalance: "12.5847",
    totalValueUSD: "754,218",
    totalEarned: "2.1234",
    totalEarnedUSD: "127,456",
    avgAPY: "8.7",
    positions: [
      {
        type: "Lending",
        amount: "8.2500",
        valueUSD: "495,000",
        apy: "8.5",
        earned: "1.2340",
        status: "active",
      },
      {
        type: "Staking",
        amount: "3.5000",
        valueUSD: "210,000",
        apy: "12.4",
        earned: "0.7894",
        status: "active",
      },
      {
        type: "Borrowing",
        amount: "-1.1653",
        valueUSD: "-69,918",
        apy: "3.2",
        earned: "0.1000",
        status: "active",
      },
    ],
  }

  const recentTransactions = [
    {
      type: "Lend",
      amount: "0.5000",
      pool: "BTC Lending Pool",
      timestamp: "2 hours ago",
      status: "confirmed",
    },
    {
      type: "Claim",
      amount: "0.0234",
      pool: "Staking Rewards",
      timestamp: "1 day ago",
      status: "confirmed",
    },
    {
      type: "Borrow",
      amount: "0.2500",
      pool: "USDC Borrow",
      timestamp: "3 days ago",
      status: "confirmed",
    },
    {
      type: "Repay",
      amount: "0.1000",
      pool: "USDC Borrow",
      timestamp: "5 days ago",
      status: "confirmed",
    },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-2 bg-neutral-900 border-neutral-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-neutral-300 tracking-wider">TOTAL PORTFOLIO</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Bitcoin className="w-12 h-12 text-orange-500" />
                <div>
                  <div className="text-3xl font-bold text-white font-mono">{portfolioData.totalBalance} BTC</div>
                  <div className="text-lg text-neutral-400">${portfolioData.totalValueUSD}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-neutral-700">
                <div>
                  <div className="text-xs text-neutral-400 mb-1">TOTAL EARNED</div>
                  <div className="text-lg font-bold text-white font-mono">{portfolioData.totalEarned} BTC</div>
                  <div className="text-sm text-neutral-400">${portfolioData.totalEarnedUSD}</div>
                </div>
                <div>
                  <div className="text-xs text-neutral-400 mb-1">AVERAGE APY</div>
                  <div className="text-lg font-bold text-orange-500 font-mono">{portfolioData.avgAPY}%</div>
                  <div className="flex items-center gap-1 text-sm text-white">
                    <TrendingUp className="w-3 h-3" />
                    <span>+2.3% this month</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border-neutral-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-neutral-300 tracking-wider">LENDING POSITIONS</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-white font-mono">8.25</div>
                <div className="text-xs text-neutral-500">BTC Lent</div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-400">Current APY</span>
                  <span className="text-orange-500 font-mono">8.5%</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-400">Monthly Earnings</span>
                  <span className="text-white font-mono">0.058 BTC</span>
                </div>
              </div>
              <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white text-xs">Manage Lending</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border-neutral-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-neutral-300 tracking-wider">STAKING REWARDS</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-white font-mono">3.50</div>
                <div className="text-xs text-neutral-500">BTC Staked</div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-400">Staking APY</span>
                  <span className="text-orange-500 font-mono">12.4%</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-400">Claimable</span>
                  <span className="text-white font-mono">0.045 BTC</span>
                </div>
              </div>
              <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white text-xs">Claim Rewards</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Positions */}
      <Card className="bg-neutral-900 border-neutral-700">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-neutral-300 tracking-wider">ACTIVE POSITIONS</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-700">
                  <th className="text-left py-3 px-4 text-xs font-medium text-neutral-400 tracking-wider">TYPE</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-neutral-400 tracking-wider">AMOUNT</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-neutral-400 tracking-wider">
                    VALUE (USD)
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-neutral-400 tracking-wider">APY</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-neutral-400 tracking-wider">EARNED</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-neutral-400 tracking-wider">STATUS</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-neutral-400 tracking-wider">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {portfolioData.positions.map((position, index) => (
                  <tr key={index} className="border-b border-neutral-800 hover:bg-neutral-800 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {position.type === "Lending" && <TrendingUp className="w-4 h-4 text-orange-500" />}
                        {position.type === "Staking" && <Percent className="w-4 h-4 text-orange-500" />}
                        {position.type === "Borrowing" && <TrendingDown className="w-4 h-4 text-red-500" />}
                        <span className="text-sm text-white">{position.type}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-white font-mono">{position.amount} BTC</td>
                    <td className="py-3 px-4 text-sm text-white">${position.valueUSD}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-sm font-mono ${position.type === "Borrowing" ? "text-red-500" : "text-orange-500"}`}
                      >
                        {position.apy}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-white font-mono">{position.earned} BTC</td>
                    <td className="py-3 px-4">
                      <Badge className="bg-white/20 text-white text-xs">{position.status.toUpperCase()}</Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Button variant="ghost" size="sm" className="text-neutral-400 hover:text-orange-500 text-xs">
                        Manage
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-neutral-900 border-neutral-700">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-neutral-300 tracking-wider">RECENT TRANSACTIONS</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentTransactions.map((tx, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-neutral-800 rounded hover:bg-neutral-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2 h-2 rounded-full ${tx.status === "confirmed" ? "bg-white" : "bg-orange-500"}`}
                    ></div>
                    <div>
                      <div className="text-sm text-white font-medium">{tx.type}</div>
                      <div className="text-xs text-neutral-400">{tx.pool}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-white font-mono">{tx.amount} BTC</div>
                    <div className="text-xs text-neutral-400">{tx.timestamp}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border-neutral-700">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-neutral-300 tracking-wider">PORTFOLIO PERFORMANCE</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 relative">
              {/* Simple chart representation */}
              <div className="absolute inset-0 grid grid-cols-8 grid-rows-6 opacity-20">
                {Array.from({ length: 48 }).map((_, i) => (
                  <div key={i} className="border border-neutral-700"></div>
                ))}
              </div>

              <svg className="absolute inset-0 w-full h-full">
                <polyline
                  points="0,140 50,120 100,110 150,100 200,95 250,85 300,80 350,70"
                  fill="none"
                  stroke="#f97316"
                  strokeWidth="2"
                />
              </svg>

              <div className="absolute bottom-0 left-0 w-full flex justify-between text-xs text-neutral-500 -mb-6 font-mono">
                <span>30d ago</span>
                <span>Today</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
