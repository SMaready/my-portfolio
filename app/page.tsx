import { RenderStage } from '@/components/RenderStage'
import { Hero } from '@/components/Hero'
import { PipelineSection } from '@/components/PipelineSection'
import { ProjectsSection } from '@/components/ProjectsSection'
import { AboutSection } from '@/components/AboutSection'
import { SkillsSection } from '@/components/SkillsSection'
import { BuildingSection } from '@/components/BuildingSection'
import { ContactForm } from '@/components/ContactForm'

export default function Home() {
  return (
    <>
      {/* Fixed canvas behind the hero and the pipeline. Everything after those
          two sections is opaque and simply scrolls over the top of it. */}
      <RenderStage />
      <Hero />
      <PipelineSection />
      <ProjectsSection />
      <AboutSection />
      <SkillsSection />
      <BuildingSection />
      <ContactForm />
    </>
  )
}
