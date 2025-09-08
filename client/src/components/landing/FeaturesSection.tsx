import { Card, CardContent } from "@/components/ui/card"
import { Shield, Zap, TrendingUp, Lock } from "lucide-react"

export default function FeaturesSection() {
  const features = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Non-Custodial",
      description: "Keep full control of your Bitcoin. No intermediaries, no custody risks.",
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Lightning Fast",
      description: "Built on Citrea for instant transactions and minimal fees.",
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Competitive Yields",
      description: "Earn up to 12% APY on your Bitcoin holdings through our optimized protocols.",
    },
    {
      icon: <Lock className="w-8 h-8" />,
      title: "Secure by Design",
      description: "Audited smart contracts and battle-tested security protocols.",
    },
  ]

  return (
    <section id="features" className="py-20 bg-neutral-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">
            Why Choose <span className="text-orange-500">Hogo</span>?
          </h2>
          <p className="text-xl text-neutral-400 max-w-3xl mx-auto">
            Experience the future of Bitcoin DeFi with our cutting-edge protocol built for security, efficiency, and
            maximum returns.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="bg-neutral-900 border-neutral-700 hover:border-orange-500/50 transition-colors"
            >
              <CardContent className="p-6 text-center space-y-4">
                <div className="text-orange-500 flex justify-center">{feature.icon}</div>
                <h3 className="text-xl font-bold">{feature.title}</h3>
                <p className="text-neutral-400">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}