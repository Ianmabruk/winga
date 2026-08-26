import { lazy, Suspense } from 'react'
import RatesSection from '../components/landing/RatesSection'
import HeroSection from '../components/landing/HeroSection'
import Seo from '../components/Seo'

const CalculatorSection = lazy(() => import('../components/landing/CalculatorSection'))
const WhyChooseUsSection = lazy(() => import('../components/landing/WhyChooseUsSection'))
const ContactSection = lazy(() => import('../components/landing/ContactSection'))

const SectionFallback = () => null

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
      <Suspense fallback={<SectionFallback />}>
        <CalculatorSection compact />
      </Suspense>
      <Suspense fallback={<SectionFallback />}>
        <WhyChooseUsSection compact />
      </Suspense>
      <Suspense fallback={<SectionFallback />}>
        <ContactSection compact />
      </Suspense>
    </div>
  )
}
