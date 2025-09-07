import { Bitcoin } from "lucide-react"

export default function Footer() {
  return (
    <footer className="border-t border-neutral-800 bg-neutral-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Bitcoin className="w-6 h-6 text-orange-500" />
              <span className="text-lg font-bold tracking-wider text-orange-500">BITLEND</span>
            </div>
            <p className="text-neutral-400 text-sm">
              The first decentralized Bitcoin lending protocol built on Citrea.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Protocol</h3>
            <div className="space-y-2 text-sm text-neutral-400">
              <div>Staking</div>
              <div>Governance</div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <div className="space-y-2 text-sm text-neutral-400">
              <div>Documentation</div>
              <div>Whitepaper</div>
              <div>Security</div>
              <div>Bug Bounty</div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Community</h3>
            <div className="space-y-2 text-sm text-neutral-400">
              <div>Discord</div>
              <div>Twitter</div>
              <div>Telegram</div>
              <div>GitHub</div>
            </div>
          </div>
        </div>

        <div className="border-t border-neutral-800 mt-8 pt-8 text-center text-sm text-neutral-400">
          © 2025 Bitlend Protocol. All rights reserved.
        </div>
      </div>
    </footer>
  )
}