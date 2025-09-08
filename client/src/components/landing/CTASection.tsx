import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { Link } from "react-router"

export default function CTASection() {
  return (
    <section className="py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="space-y-8">
          <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">Ready to Build Your Multi-Sig Wallet?</h2>
          <p className="text-xl text-neutral-400">
            Join the future of programmable wallets with multi-signature security, AI automation, and expense sharing.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/DelegationPage">
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
              Connect Stacks Wallet
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}