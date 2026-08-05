import { PuppeteerHero } from './PuppeteerHero'
import './puppeteer.css'

/** Idea 2 — Invisible Puppeteer: UI components hang; tools hide in the strings. */
export function PuppeteerIdea() {
  return (
    <div className="puppeteer-idea">
      <div className="puppeteer-ambient" aria-hidden>
        <div className="puppeteer-ambient__glow" />
        <div className="puppeteer-ambient__grain" />
        <div className="puppeteer-ambient__vignette" />
      </div>
      <div className="puppeteer-content">
        <main>
          <PuppeteerHero />
        </main>
      </div>
    </div>
  )
}
