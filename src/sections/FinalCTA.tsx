import { useEffect, useRef } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { gsap, prefersReducedMotion } from '../lib/gsap'
import { splitChars } from '../lib/anim'
import MagneticButton from '../components/MagneticButton'

export default function FinalCTA() {
  const section = useRef<HTMLElement>(null)
  const title = useRef<HTMLHeadingElement>(null)
  const done = useRef(false)

  useEffect(() => {
    let ctx: gsap.Context | undefined
    let alive = true

    const build = () => {
      if (!alive || done.current || !title.current) return
      done.current = true

      ctx = gsap.context(() => {
        const chars = splitChars(title.current!)
        gsap.set(title.current, { opacity: 1 })

        if (prefersReducedMotion()) {
          gsap.set([...chars, '.cta-in'], { yPercent: 0, opacity: 1, y: 0 })
          return
        }

        gsap
          .timeline({ scrollTrigger: { trigger: section.current, start: 'top 62%', once: true } })
          .from(chars, {
            yPercent: 120,
            duration: 1.5,
            stagger: { each: 0.035, from: 'start' },
            ease: 'expo.out',
          })
          .fromTo(
            '.cta-in',
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 1.2, stagger: 0.12, ease: 'expo.out' },
            0.5,
          )
      }, section)
    }

    const fonts = document.fonts?.ready ?? Promise.resolve()
    fonts.then(build)

    return () => {
      alive = false
      ctx?.revert()
    }
  }, [])

  return (
    <section
      id="book"
      ref={section}
      className="relative overflow-hidden bg-canvas pb-[16vh] pt-[18vh] md:pb-[20vh] md:pt-[26vh]"
    >
      {/* a single warm breath of light behind the type */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[70vh] w-[70vh] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60"
        style={{
          background:
            'radial-gradient(circle, rgba(216,180,106,.16) 0%, rgba(216,180,106,.05) 40%, transparent 70%)',
        }}
      />

      <div className="relative mx-auto max-w-[1600px] px-6 text-center md:px-12">
        <div className="cta-in eyebrow mb-10 flex items-center justify-center gap-3 opacity-0">
          <span className="h-px w-8 bg-gold" />
          10 — Enquire
          <span className="h-px w-8 bg-gold" />
        </div>

        <h2 ref={title} className="t-display opacity-0">
          Own Tomorrow.
        </h2>

        <p className="cta-in t-body mx-auto mt-10 max-w-md opacity-0">
          Private tours run Thursday through Sunday, by appointment, with the architect present on
          the first Saturday of each month.
        </p>

        <div className="cta-in mt-12 flex flex-col items-center justify-center gap-4 opacity-0 sm:flex-row">
          <MagneticButton
            variant="gold"
            className="!bg-gold !px-10 !py-5 !text-ink hover:!bg-ink hover:!text-white"
            strength={0.4}
          >
            Book a Private Tour
            <ArrowUpRight size={14} strokeWidth={1.5} />
          </MagneticButton>
          <MagneticButton variant="outline" className="!px-10 !py-5" strength={0.3}>
            Download Brochure
          </MagneticButton>
        </div>

        <div className="cta-in mx-auto mt-16 flex max-w-2xl flex-wrap items-center justify-center gap-x-10 gap-y-4 opacity-0">
          {[
            ['Sales Gallery', 'Open 10:00 — 19:00'],
            ['Direct', '+91 80 4000 4200'],
            ['Email', 'residences@aetheris.co'],
          ].map(([k, v]) => (
            <div key={k} className="text-center">
              <div className="text-[9px] uppercase tracking-[.26em] text-muted">{k}</div>
              <div className="num mt-1.5 text-[13px] text-ink">{v}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
