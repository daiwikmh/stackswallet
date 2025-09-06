import Navigation from "./Navigation"
import HeroSection from "./HeroSection"
import FeaturesSection from "./FeaturesSection"
import HowItWorksSection from "./HowItWorksSection"
import SecuritySection from "./SecuritySection"
import CTASection from "./CTASection"
import Footer from "./Footer"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <SecuritySection />
      <CTASection />
      <Footer />
    </div>
  )
}
