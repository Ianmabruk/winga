import HeroSection from '../components/landing/HeroSection'
import RatesSection from '../components/landing/RatesSection'
import CalculatorSection from '../components/landing/CalculatorSection'
import ServicesSection from '../components/landing/ServicesSection'
import WhyChooseUsSection from '../components/landing/WhyChooseUsSection'
import ContactSection from '../components/landing/ContactSection'

export default function HomePage() {
  return (
    <div className="w-full">
      <HeroSection />
      <RatesSection />
      <CalculatorSection />
      <WhyChooseUsSection />
      <ServicesSection />
      <ContactSection />
    </div>
  )
}
