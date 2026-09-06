import { Hero } from '@/components/Hero'
import { BuildSection } from '@/components/BuildSection'
import { ProjectsSection } from '@/components/ProjectsSection'
import { AboutSection } from '@/components/AboutSection'
import { SkillsSection } from '@/components/SkillsSection'
import { BuildingSection } from '@/components/BuildingSection'
import { ContactForm } from '@/components/ContactForm'

export default function Home() {
  return (
    <>
      <Hero />
      <BuildSection />
      <ProjectsSection />
      <AboutSection />
      <SkillsSection />
      <BuildingSection />
      <ContactForm />
    </>
  )
}
