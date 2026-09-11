import { Hero } from '@/components/Hero'
import { WorkSequence } from '@/components/WorkSequence'
import { AboutSection } from '@/components/AboutSection'
import { SkillsSection } from '@/components/SkillsSection'
import { BuildingSection } from '@/components/BuildingSection'
import { ContactForm } from '@/components/ContactForm'

export default function Home() {
  return (
    <>
      <Hero />
      <WorkSequence />
      <AboutSection />
      <SkillsSection />
      <BuildingSection />
      <ContactForm />
    </>
  )
}
