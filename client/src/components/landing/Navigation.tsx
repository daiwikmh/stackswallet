import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Link } from "react-router"

export default function Navigation() {
  return (
    <nav className="border-b border-neutral-800 bg-neutral-900/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <img src="/aegislogo.png" alt="Aegis Logo" className="w-8 h-8" />
            <span className="text-xl font-bold tracking-wider text-orange-500">BITLEND</span>
            <Badge className="bg-orange-500/20 text-orange-500 text-xs">BETA</Badge>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-neutral-400 hover:text-white transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-neutral-400 hover:text-white transition-colors">
              How it Works
            </a>
            <a href="#security" className="text-neutral-400 hover:text-white transition-colors">
              Security
            </a>
            <Link to="/dashboard">
              <Button className="bg-orange-500 hover:bg-orange-600 text-white">Launch App</Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}