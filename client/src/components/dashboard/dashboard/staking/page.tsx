"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Bitcoin, Percent, Gift, TrendingUp } from "lucide-react"

interface StakingPool {
  id: string
  name: string
  apy: string
  lockPeriod: string
  minStake: string
  totalStaked: string
  yourStake: string
  rewards: string
  status: string
  validatorCount: string
  commission: string
}

interface GovernanceTokens {
  balance: string
  value: string
  votingPower: string
  proposals: string
}

export default function StakingPage() {
  const [selectedPool, setSelectedPool] = useState<StakingPool | null>(null)
  const [stakeAmount, setStakeAmount] = useState("")

  const stakingPools: StakingPool[] = [
    {
      id: "validator-1",
      name: "Citrea Validator Pool Alpha",
      apy: "12.4",
      lockPeriod: "30",
      minStake: "0.1",
      totalStaked: "2,847.5",
      yourStake: "3.5000",
      rewards: "0.4321",
      status: "active",
      validatorCount: "24",
      commission: "5",
    },
    {
      id: "validator-2",
      name: "High Yield Validator Beta",
      apy: "15.7",
      lockPeriod: "90",
      minStake: "0.5",
      totalStaked: "1,234.8",
      yourStake: "0.0000",
      rewards: "0.0000",
      status: "active",
      validatorCount: "12",
      commission: "8",
    },
    {
      id: "validator-3",
      name: "Stable Validator Gamma",
      apy: "9.8",
      lockPeriod: "14",
      minStake: "0.01",
      totalStaked: "4,567.2",
      yourStake: "1.2500",
      rewards: "0.1234",
      status: "active",
      validatorCount: "36",
      commission: "3",
    },
    {
      id: "governance",
      name: "Governance Staking",
      apy: "8.5",
      lockPeriod: "0",
      minStake: "0.001",
      totalStaked: "892.3",
      yourStake: "0.5000",
      rewards: "0.0567",
      status: "active",
      validatorCount: "1",
      commission: "0",
    },
  ]

  const governanceTokens: GovernanceTokens = {
    balance: "1,247.89",
    value: "3,743.67",
    votingPower: "0.12",
    proposals: "3",
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wider">STAKING REWARDS</h1>
          <p className="text-sm text-neutral-400">Stake Bitcoin and earn rewards while securing the network</p>
        </div>
        <div className="flex gap-2">
          <Button className="bg-orange-500 hover:bg-orange-600 text-white">Claim All Rewards</Button>
        </div>
      </div>

      {/* Staking Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-neutral-900 border-neutral-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-neutral-400 tracking-wider">TOTAL STAKED</p>
                <p className="text-2xl font-bold text-white font-mono">5.25 BTC</p>
              </div>
              <Bitcoin className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border-neutral-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-neutral-400 tracking-wider">TOTAL REWARDS</p>
                <p className="text-2xl font-bold text-white font-mono">0.612 BTC</p>
              </div>
              <Gift className="w-8 h-8 text-white" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border-neutral-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-neutral-400 tracking-wider">AVG APY</p>
                <p className="text-2xl font-bold text-orange-500 font-mono">11.2%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border-neutral-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-neutral-400 tracking-wider">GOVERNANCE TOKENS</p>
                <p className="text-2xl font-bold text-white font-mono">1,248</p>
              </div>
              <Percent className="w-8 h-8 text-white" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Governance Section */}
      <Card className="bg-neutral-900 border-neutral-700">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-neutral-300 tracking-wider">
            GOVERNANCE PARTICIPATION
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-neutral-400 mb-1">BTLD Balance</div>
                  <div className="text-lg font-bold text-white font-mono">{governanceTokens.balance}</div>
                  <div className="text-xs text-neutral-400">${governanceTokens.value}</div>
                </div>
                <div>
                  <div className="text-xs text-neutral-400 mb-1">Voting Power</div>
                  <div className="text-lg font-bold text-orange-500 font-mono">{governanceTokens.votingPower}%</div>
                </div>
              </div>

              <div>
                <div className="text-xs text-neutral-400 mb-2">Active Proposals</div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-neutral-800 rounded">
                    <span className="text-sm text-white">Increase lending pool rewards</span>
                    <Badge className="bg-orange-500/20 text-orange-500 text-xs">ACTIVE</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-neutral-800 rounded">
                    <span className="text-sm text-white">Protocol fee adjustment</span>
                    <Badge className="bg-white/20 text-white text-xs">VOTING</Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="text-xs text-neutral-400 mb-2">Recent Governance Activity</div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Voted on Proposal #12</span>
                    <span className="text-white font-mono">2 days ago</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Claimed 45.67 BTLD</span>
                    <span className="text-white font-mono">5 days ago</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Delegated voting power</span>
                    <span className="text-white font-mono">1 week ago</span>
                  </div>
                </div>
              </div>

              <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white">View All Proposals</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Staking Pools */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {stakingPools.map((pool) => (
          <Card
            key={pool.id}
            className="bg-neutral-900 border-neutral-700 hover:border-orange-500/50 transition-colors cursor-pointer"
            onClick={() => setSelectedPool(pool)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-sm font-bold text-white tracking-wider">{pool.name}</CardTitle>
                  <p className="text-xs text-neutral-400 mt-1">
                    {pool.validatorCount} validators • {pool.commission}% commission
                  </p>
                </div>
                <Badge className="bg-white/20 text-white text-xs">{pool.status.toUpperCase()}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-neutral-400 mb-1">APY</div>
                  <div className="text-2xl font-bold text-orange-500 font-mono">{pool.apy}%</div>
                </div>
                <div>
                  <div className="text-xs text-neutral-400 mb-1">Lock Period</div>
                  <div className="text-lg font-bold text-white font-mono">
                    {pool.lockPeriod === "0" ? "Flexible" : `${pool.lockPeriod} days`}
                  </div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-neutral-400">Total Staked</span>
                  <span className="text-white font-mono">{pool.totalStaked} BTC</span>
                </div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-neutral-400">Min Stake</span>
                  <span className="text-white font-mono">{pool.minStake} BTC</span>
                </div>
              </div>

              {Number.parseFloat(pool.yourStake) > 0 && (
                <div className="pt-2 border-t border-neutral-700">
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <div className="text-neutral-400 mb-1">Your Stake</div>
                      <div className="text-white font-mono">{pool.yourStake} BTC</div>
                    </div>
                    <div>
                      <div className="text-neutral-400 mb-1">Claimable</div>
                      <div className="text-white font-mono">{pool.rewards} BTC</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button className="flex-1 bg-orange-500 hover:bg-orange-600 text-white text-xs">
                  {Number.parseFloat(pool.yourStake) > 0 ? "Add Stake" : "Stake"}
                </Button>
                {Number.parseFloat(pool.yourStake) > 0 && (
                  <>
                    <Button
                      variant="outline"
                      className="flex-1 border-neutral-700 text-neutral-400 hover:bg-neutral-800 text-xs bg-transparent"
                    >
                      Claim
                    </Button>
                    <Button
                      variant="outline"
                      className="border-neutral-700 text-neutral-400 hover:bg-neutral-800 text-xs bg-transparent"
                    >
                      Unstake
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Staking Pool Detail Modal */}
      {selectedPool && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="bg-neutral-900 border-neutral-700 w-full max-w-2xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold text-white tracking-wider">{selectedPool.name}</CardTitle>
                <p className="text-sm text-neutral-400">Stake Bitcoin and earn {selectedPool.apy}% APY</p>
              </div>
              <Button
                variant="ghost"
                onClick={() => setSelectedPool(null)}
                className="text-neutral-400 hover:text-white"
              >
                ✕
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-neutral-300 tracking-wider mb-2">POOL DETAILS</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Current APY:</span>
                        <span className="text-orange-500 font-mono">{selectedPool.apy}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Lock Period:</span>
                        <span className="text-white font-mono">
                          {selectedPool.lockPeriod === "0" ? "Flexible" : `${selectedPool.lockPeriod} days`}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Total Staked:</span>
                        <span className="text-white font-mono">{selectedPool.totalStaked} BTC</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Validators:</span>
                        <span className="text-white font-mono">{selectedPool.validatorCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Commission:</span>
                        <span className="text-white font-mono">{selectedPool.commission}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-neutral-300 tracking-wider mb-2">STAKE BITCOIN</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs text-neutral-400 mb-1 block">Amount (BTC)</label>
                        <Input
                          type="number"
                          placeholder="0.0000"
                          value={stakeAmount}
                          onChange={(e) => setStakeAmount(e.target.value)}
                          className="bg-neutral-800 border-neutral-600 text-white font-mono"
                        />
                      </div>

                      <div className="text-xs text-neutral-400 space-y-1">
                        <div className="flex justify-between">
                          <span>Estimated Annual Rewards:</span>
                          <span className="text-white font-mono">
                            {stakeAmount
                              ? ((Number.parseFloat(stakeAmount) * Number.parseFloat(selectedPool.apy)) / 100).toFixed(
                                  6,
                                )
                              : "0.000000"}{" "}
                            BTC
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Minimum Stake:</span>
                          <span className="text-white font-mono">{selectedPool.minStake} BTC</span>
                        </div>
                        {selectedPool.lockPeriod !== "0" && (
                          <div className="flex justify-between">
                            <span>Unlock Date:</span>
                            <span className="text-white font-mono">
                              {new Date(
                                Date.now() + Number.parseInt(selectedPool.lockPeriod) * 24 * 60 * 60 * 1000,
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-neutral-700">
                <Button className="flex-1 bg-orange-500 hover:bg-orange-600 text-white">Stake Bitcoin</Button>
                <Button
                  variant="outline"
                  className="border-neutral-700 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-300 bg-transparent"
                >
                  View Validator Details
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
