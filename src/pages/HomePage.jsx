import HeroSection from '../components/landing/HeroSection'
import RatesSection from '../components/landing/RatesSection'
import CalculatorSection from '../components/landing/CalculatorSection'
import ServicesSection from '../components/landing/ServicesSection'
import WhyChooseUsSection from '../components/landing/WhyChooseUsSection'
import TestimonialsSection from '../components/landing/TestimonialsSection'
import FaqSection from '../components/landing/FaqSection'
import ContactSection from '../components/landing/ContactSection'
import DashboardPreview from '../components/landing/DashboardPreview'
import AnalyticsPreview from '../components/landing/AnalyticsPreview'

export default function HomePage() {
  return (
    <div className="w-full">
      <HeroSection />
      <RatesSection />
      <CalculatorSection />
      <ServicesSection />
      <WhyChooseUsSection />
      <TestimonialsSection />
      <FaqSection />
      <DashboardPreview />
      <AnalyticsPreview />
      <ContactSection />
    </div>
  )
}
