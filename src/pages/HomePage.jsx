import HeroSection from '../components/landing/HeroSection'
import RatesSection from '../components/landing/RatesSection'
import CalculatorSection from '../components/landing/CalculatorSection'
import WhyChooseUsSection from '../components/landing/WhyChooseUsSection'
import ContactSection from '../components/landing/ContactSection'
import Seo from '../components/Seo'

export default function HomePage() {
  return (
    <div className="w-full">
      <Seo
        title="Winga Forex Bureau – Best Rates Best Services"
        description="Winga Forex Bureau offers competitive forex exchange rates in Tanzania. Buy and sell USD, EUR, GBP, KES, UGX, RWF and more with fast, secure service."
        path="/"
      />
      <HeroSection />
      <RatesSection />
      <CalculatorSection compact />
      <WhyChooseUsSection compact />
      <ContactSection compact />
    </div>
  )
}
