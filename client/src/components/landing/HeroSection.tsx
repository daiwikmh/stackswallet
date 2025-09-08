import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Shield, ArrowRight, Wallet, Users, Bot } from "lucide-react"
import { Link } from "react-router"

export default function HeroSection() {
  const stats = [
    { label: "Multi-Sig Wallets", value: "2.4K", icon: <Shield className="w-6 h-6" /> },
    { label: "Active Users", value: "47K+", icon: <Users className="w-6 h-6" /> },
    { label: "STX Secured", value: "12,847", icon: <Wallet className="w-6 h-6" /> },
    { label: "AI Agents", value: "347", icon: <Bot className="w-6 h-6" /> },
  ]

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-transparent"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <Badge className="bg-orange-500/20 text-orange-500">Powered by Stacks</Badge>
              <h1 className="text-4xl lg:text-6xl font-bold tracking-tight">
                Programmable <span className="text-orange-500">Multi-Sig</span> Wallets
              </h1>
              <p className="text-xl text-neutral-400 leading-relaxed">
                Beyond basic custody - pool STX, automate with AI agents, and split expenses seamlessly. 
                Built on Stacks with programmable Clarity smart contracts for ultimate flexibility.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/dashboard">
                <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white">
                  Create Multi-Sig
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="border-neutral-700 text-neutral-300 hover:bg-neutral-800 bg-transparent"
              >
                Learn More
              </Button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="flex justify-center mb-2 text-orange-500">{stat.icon}</div>
                  <div className="text-2xl font-bold font-mono">{stat.value}</div>
                  <div className="text-xs text-neutral-500">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="relative w-full max-w-md mx-auto">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-orange-600/20 rounded-full blur-3xl"></div>
              <div className="relative bg-neutral-900 border border-neutral-700 rounded-2xl p-8">
                <div className="text-center space-y-6">
                  <Shield className="w-24 h-24 text-orange-500 mx-auto animate-pulse" />
                  <div className="space-y-2">
                    <div className="text-2xl font-bold font-mono">2,500 STX</div>
                    <div className="text-sm text-neutral-400">Multi-Sig Pool</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-white font-mono">3/5</div>
                      <div className="text-xs text-neutral-500">Threshold</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-white font-mono">12</div>
                      <div className="text-xs text-neutral-500">AI Agents</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-white font-mono">$847</div>
                      <div className="text-xs text-neutral-500">Expenses</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}