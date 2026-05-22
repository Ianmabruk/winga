import HeroSection from '../components/landing/HeroSection'
import RatesSection from '../components/landing/RatesSection'
import CalculatorSection from '../components/landing/CalculatorSection'
import WhyChooseUsSection from '../components/landing/WhyChooseUsSection'
import ContactSection from '../components/landing/ContactSection'

export default function HomePage() {
  return (
    <div className="w-full">
      <HeroSection />
      <RatesSection />
      <CalculatorSection compact />
      <WhyChooseUsSection compact />
      <ContactSection compact />
    </div>
  )
}
