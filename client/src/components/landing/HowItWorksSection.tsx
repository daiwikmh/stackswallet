import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"

export default function HowItWorksSection() {
  const [activeTab, setActiveTab] = useState("multisig")

  return (
    <section id="how-it-works" className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">
            How It <span className="text-orange-500">Works</span>
          </h2>
          <p className="text-xl text-neutral-400 max-w-3xl mx-auto">
            Three powerful layers that transform how you manage funds, automate transactions, and split expenses.
          </p>
        </div>

        <div className="flex justify-center mb-8">
          <div className="bg-neutral-900 border border-neutral-700 rounded-lg p-1 flex">
            {["multisig", "agents", "expenses"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab ? "bg-orange-500 text-white" : "text-neutral-400 hover:text-white"
                }`}
              >
                {tab === "multisig" ? "Multi-Sig" : tab === "agents" ? "AI Agents" : "Expenses"}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            {activeTab === "multisig" && (
              <>
                <h3 className="text-2xl font-bold">Multi-Signature Foundation</h3>
                <p className="text-neutral-400 text-lg">
                  Create secure multi-sig wallets where multiple owners can pool STX, propose transfers, and enforce 
                  customizable approval thresholds through Clarity smart contracts.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-orange-500" />
                    <span>Configurable thresholds (2/3, 3/5, etc.)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-orange-500" />
                    <span>Secure fund pooling</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-orange-500" />
                    <span>Transparent proposal system</span>
                  </div>
                </div>
              </>
            )}

            {activeTab === "agents" && (
              <>
                <h3 className="text-2xl font-bold">AI Agent Automation</h3>
                <p className="text-neutral-400 text-lg">
                  Deploy intelligent agents as delegates to automate transactions based on your predefined laws, 
                  budget caps, and recurring payment schedules.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-orange-500" />
                    <span>Budget-constrained automation</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-orange-500" />
                    <span>Recurring payment schedules</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-orange-500" />
                    <span>Custom law enforcement</span>
                  </div>
                </div>
              </>
            )}

            {activeTab === "expenses" && (
              <>
                <h3 className="text-2xl font-bold">Expense Sharing</h3>
                <p className="text-neutral-400 text-lg">
                  Splitwise-style expense management where users deposit into the multi-sig, record shared expenses, 
                  and automatically settle debts through smart contract execution.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-orange-500" />
                    <span>Track shared expenses</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-orange-500" />
                    <span>Automatic debt calculation</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-orange-500" />
                    <span>Smart contract settlements</span>
                  </div>
                </div>
              </>
            )}
          </div>

          <Card className="bg-neutral-900 border-neutral-700">
            <CardContent className="p-8">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">Wallet Balance</span>
                  <span className="font-mono">2,500 STX</span>
                </div>

                {activeTab === "multisig" && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-400">Threshold</span>
                      <span className="font-mono text-orange-500">3/5</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-400">Pending Proposals</span>
                      <span className="font-mono">2</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-400">Total Approvals</span>
                      <span className="font-mono text-white">47</span>
                    </div>
                  </>
                )}

                {activeTab === "agents" && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-400">Active Agents</span>
                      <span className="font-mono text-orange-500">12</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-400">Budget Allocated</span>
                      <span className="font-mono">1,200 STX</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-400">Auto Transactions</span>
                      <span className="font-mono text-white">234</span>
                    </div>
                  </>
                )}

                {activeTab === "expenses" && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-400">Shared Expenses</span>
                      <span className="font-mono text-orange-500">$1,247</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-400">Your Share</span>
                      <span className="font-mono">$312</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-400">Pending Settlements</span>
                      <span className="font-mono text-white">3</span>
                    </div>
                  </>
                )}

                <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white">
                  {activeTab === "multisig" && "Create Multi-Sig"}
                  {activeTab === "agents" && "Deploy Agent"}
                  {activeTab === "expenses" && "Add Expense"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}