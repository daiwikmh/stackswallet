import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bitcoin, ArrowRight, Wallet, Users, TrendingUp } from "lucide-react"
import { Link } from "react-router"

export default function HeroSection() {
  const stats = [
    { label: "Total Value Locked", value: "$2.4B", icon: <Wallet className="w-6 h-6" /> },
    { label: "Active Users", value: "47K+", icon: <Users className="w-6 h-6" /> },
    { label: "Bitcoin Secured", value: "12,847 BTC", icon: <Bitcoin className="w-6 h-6" /> },
    { label: "Average APY", value: "8.7%", icon: <TrendingUp className="w-6 h-6" /> },
  ]

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-transparent"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <Badge className="bg-orange-500/20 text-orange-500">Powered by Citrea</Badge>
              <h1 className="text-4xl lg:text-6xl font-bold tracking-tight">
                Unlock Your <span className="text-orange-500">Bitcoin's</span> Potential
              </h1>
              <p className="text-xl text-neutral-400 leading-relaxed">
                The first decentralized lending protocol that lets you lend, borrow, and stake Bitcoin without giving
                up custody. Built on Citrea for maximum security and efficiency.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/dashboard">
                <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white">
                  Start Earning
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="border-neutral-700 text-neutral-300 hover:bg-neutral-800 bg-transparent"
              >
                Read Whitepaper
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
                  <Bitcoin className="w-24 h-24 text-orange-500 mx-auto animate-pulse" />
                  <div className="space-y-2">
                    <div className="text-2xl font-bold font-mono">12.5 BTC</div>
                    <div className="text-sm text-neutral-400">Your Portfolio</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-white font-mono">8.7%</div>
                      <div className="text-xs text-neutral-500">APY</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-white font-mono">2.1</div>
                      <div className="text-xs text-neutral-500">BTC Earned</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-white font-mono">247</div>
                      <div className="text-xs text-neutral-500">Days</div>
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