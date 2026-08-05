import { Header } from './Header'
import { WorkshopHero } from './WorkshopHero'
import { Manifesto } from './Manifesto'
import { WorkSection } from './WorkSection'
import { AboutSection } from './AboutSection'
import { ContactSection } from './ContactSection'
import { Footer } from './Footer'
import './workshop.css'

/** Idea 1 — The Workshop: a digital bench where skills assemble into a living product. */
export function WorkshopIdea() {
  return (
    <div className="workshop-idea app-shell">
      <div className="ambient" aria-hidden>
        <div className="ambient__grain" />
      </div>
      <div className="app-content">
        <Header />
        <main>
          <WorkshopHero />
          <Manifesto />
          <WorkSection />
          <AboutSection />
          <ContactSection />
        </main>
        <Footer />
      </div>
    </div>
  )
}
