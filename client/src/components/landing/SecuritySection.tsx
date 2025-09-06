import { Card, CardContent } from "@/components/ui/card"
import { Shield, Lock, Globe } from "lucide-react"

export default function SecuritySection() {
  return (
    <section id="security" className="py-20 bg-neutral-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">
            Built for <span className="text-orange-500">Security</span>
          </h2>
          <p className="text-xl text-neutral-400 max-w-3xl mx-auto">
            Your Bitcoin's security is our top priority. We've implemented multiple layers of protection to keep your
            funds safe.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="bg-neutral-900 border-neutral-700">
            <CardContent className="p-6 text-center space-y-4">
              <Shield className="w-12 h-12 text-orange-500 mx-auto" />
              <h3 className="text-xl font-bold">Smart Contract Audits</h3>
              <p className="text-neutral-400">
                Audited by leading security firms including Trail of Bits and ConsenSys Diligence.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-neutral-900 border-neutral-700">
            <CardContent className="p-6 text-center space-y-4">
              <Lock className="w-12 h-12 text-orange-500 mx-auto" />
              <h3 className="text-xl font-bold">Non-Custodial</h3>
              <p className="text-neutral-400">
                You maintain full control of your private keys. We never have access to your funds.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-neutral-900 border-neutral-700">
            <CardContent className="p-6 text-center space-y-4">
              <Globe className="w-12 h-12 text-orange-500 mx-auto" />
              <h3 className="text-xl font-bold">Decentralized</h3>
              <p className="text-neutral-400">
                Built on Citrea's decentralized network with no single point of failure.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}