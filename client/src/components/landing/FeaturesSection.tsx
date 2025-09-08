import { Card, CardContent } from "@/components/ui/card"
import { Shield, Bot, Receipt, Users } from "lucide-react"

export default function FeaturesSection() {
  const features = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Multi-Signature Security",
      description: "Pool STX with configurable thresholds. Owners propose transfers and collectively approve them for enhanced security.",
    },
    {
      icon: <Bot className="w-8 h-8" />,
      title: "AI Agent Automation",
      description: "Deploy intelligent agents as delegates to automate transactions under your defined laws and budget constraints.",
    },
    {
      icon: <Receipt className="w-8 h-8" />,
      title: "Expense Sharing",
      description: "Splitwise-style functionality for recording debts, tracking expenses, and automatic settlement through smart contracts.",
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Collaborative Management",
      description: "Multiple owners can participate in governance, with transparent proposal and approval workflows.",
    },
  ]

  return (
    <section id="features" className="py-20 bg-neutral-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">
            Beyond Basic <span className="text-orange-500">Multi-Sig</span>
          </h2>
          <p className="text-xl text-neutral-400 max-w-3xl mx-auto">
            A three-layer programmable wallet system that combines multi-signature security, AI automation, 
            and collaborative expense management on Stacks.
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