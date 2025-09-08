import { Card, CardContent } from "@/components/ui/card"
import { Shield, Users, Code } from "lucide-react"

export default function SecuritySection() {
  return (
    <section id="security" className="py-20 bg-neutral-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">
            Security by <span className="text-orange-500">Design</span>
          </h2>
          <p className="text-xl text-neutral-400 max-w-3xl mx-auto">
            Multi-signature architecture, audited smart contracts, and decentralized governance 
            ensure your funds are protected by multiple layers of security.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="bg-neutral-900 border-neutral-700">
            <CardContent className="p-6 text-center space-y-4">
              <Shield className="w-12 h-12 text-orange-500 mx-auto" />
              <h3 className="text-xl font-bold">Multi-Signature Protection</h3>
              <p className="text-neutral-400">
                Requires multiple signatures for transaction approval, eliminating single points of failure and unauthorized access.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-neutral-900 border-neutral-700">
            <CardContent className="p-6 text-center space-y-4">
              <Code className="w-12 h-12 text-orange-500 mx-auto" />
              <h3 className="text-xl font-bold">Audited Clarity Contracts</h3>
              <p className="text-neutral-400">
                Smart contracts built in Clarity are decidable and auditable, with transparent execution on Stacks blockchain.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-neutral-900 border-neutral-700">
            <CardContent className="p-6 text-center space-y-4">
              <Users className="w-12 h-12 text-orange-500 mx-auto" />
              <h3 className="text-xl font-bold">Distributed Governance</h3>
              <p className="text-neutral-400">
                Decentralized ownership model where no single party can control funds or modify critical parameters.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}