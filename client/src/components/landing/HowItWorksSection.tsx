import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"

export default function HowItWorksSection() {
  const [activeTab, setActiveTab] = useState("lend")

  return (
    <section id="how-it-works" className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">
            How <span className="text-orange-500">Bitlend</span> Works
          </h2>
          <p className="text-xl text-neutral-400 max-w-3xl mx-auto">
            Three simple ways to put your Bitcoin to work and earn passive income.
          </p>
        </div>

        <div className="flex justify-center mb-8">
          <div className="bg-neutral-900 border border-neutral-700 rounded-lg p-1 flex">
            {["lend", "borrow", "stake"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab ? "bg-orange-500 text-white" : "text-neutral-400 hover:text-white"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            {activeTab === "lend" && (
              <>
                <h3 className="text-2xl font-bold">Lend Your Bitcoin</h3>
                <p className="text-neutral-400 text-lg">
                  Supply your Bitcoin to lending pools and earn competitive interest rates. Your funds remain
                  non-custodial and can be withdrawn at any time.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-orange-500" />
                    <span>Earn up to 12% APY</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-orange-500" />
                    <span>Withdraw anytime</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-orange-500" />
                    <span>No minimum deposit</span>
                  </div>
                </div>
              </>
            )}

            {activeTab === "borrow" && (
              <>
                <h3 className="text-2xl font-bold">Borrow Against Bitcoin</h3>
                <p className="text-neutral-400 text-lg">
                  Use your Bitcoin as collateral to borrow stablecoins or other assets. Keep your Bitcoin exposure
                  while accessing liquidity.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-orange-500" />
                    <span>Up to 75% LTV ratio</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-orange-500" />
                    <span>Competitive rates from 3%</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-orange-500" />
                    <span>Flexible repayment</span>
                  </div>
                </div>
              </>
            )}

            {activeTab === "stake" && (
              <>
                <h3 className="text-2xl font-bold">Stake for Rewards</h3>
                <p className="text-neutral-400 text-lg">
                  Participate in protocol governance and earn additional rewards by staking your Bitcoin in our
                  validator network.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-orange-500" />
                    <span>Earn governance tokens</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-orange-500" />
                    <span>Participate in decisions</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-orange-500" />
                    <span>Additional yield boost</span>
                  </div>
                </div>
              </>
            )}
          </div>

          <Card className="bg-neutral-900 border-neutral-700">
            <CardContent className="p-8">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">Your Bitcoin</span>
                  <span className="font-mono">1.5 BTC</span>
                </div>

                {activeTab === "lend" && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-400">Current APY</span>
                      <span className="font-mono text-orange-500">8.7%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-400">Monthly Earnings</span>
                      <span className="font-mono">0.011 BTC</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-400">Annual Earnings</span>
                      <span className="font-mono text-white">0.131 BTC</span>
                    </div>
                  </>
                )}

                {activeTab === "borrow" && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-400">Max Borrow (75%)</span>
                      <span className="font-mono">$45,000</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-400">Interest Rate</span>
                      <span className="font-mono text-orange-500">3.2%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-400">Liquidation Price</span>
                      <span className="font-mono">$30,000</span>
                    </div>
                  </>
                )}

                {activeTab === "stake" && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-400">Staking APY</span>
                      <span className="font-mono text-orange-500">12.4%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-400">Governance Tokens</span>
                      <span className="font-mono">150 BTLD</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-400">Lock Period</span>
                      <span className="font-mono">30 days</span>
                    </div>
                  </>
                )}

                <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white">
                  {activeTab === "lend" && "Start Lending"}
                  {activeTab === "borrow" && "Borrow Now"}
                  {activeTab === "stake" && "Stake Bitcoin"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}