import { useEffect, useRef } from 'react'
import { gsap, prefersReducedMotion } from '../lib/gsap'
import { useTextReveal } from '../lib/anim'

const STATS = [
  { value: 80, suffix: '+', label: 'Amenities', note: 'Across eight shared houses' },
  { value: 3, suffix: ' Acres', label: 'Landscaping', note: 'Planted, shaded, walkable' },
  { value: 24, suffix: '×7', label: 'Security', note: 'Triple-gate, monitored' },
  { value: 100, suffix: '%', label: 'Smart Homes', note: 'Every residence, day one' },
]

export default function Stats() {
  const section = useRef<HTMLElement>(null)
  const heading = useRef<HTMLHeadingElement>(null)

  useTextReveal(heading, { start: 'top 84%' })

  useEffect(() => {
    const ctx = gsap.context(() => {
      const reduced = prefersReducedMotion()

      gsap.utils.toArray<HTMLElement>('.stat').forEach((el, i) => {
        const num = el.querySelector<HTMLElement>('.stat-num')!
        const target = Number(num.dataset.value)

        if (reduced) {
          num.textContent = String(target)
          return
        }

        const proxy = { v: 0 }
        gsap
          .timeline({ scrollTrigger: { trigger: el, start: 'top 85%', once: true } })
          .fromTo(el, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1.2, ease: 'expo.out' })
          .to(
            proxy,
            {
              v: target,
              duration: 2.1,
              ease: 'power2.out',
              onUpdate: () => {
                num.textContent = String(Math.round(proxy.v))
              },
            },
            0.1 + i * 0.06,
          )
          .fromTo(
            el.querySelector('.stat-rule'),
            { scaleX: 0 },
            { scaleX: 1, duration: 1.6, ease: 'expo.out' },
            0.15,
          )
      })
    }, section)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={section} className="relative bg-canvas py-[16vh] md:py-[22vh]">
      <div className="mx-auto max-w-[1600px] px-6 md:px-12">
        <div className="eyebrow mb-5 flex items-center gap-3">
          <span className="h-px w-8 bg-gold" />
          05 — By the numbers
        </div>
        <h2 ref={heading} className="t-h2 max-w-[18ch] opacity-0">
          The measure of the place.
        </h2>

        <div className="mt-[10vh] grid grid-cols-1 gap-x-10 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map(({ value, suffix, label, note }) => (
            <div key={label} className="stat">
              <div className="stat-rule h-px w-full origin-left bg-hairline" />
              <div className="num mt-7 flex items-baseline text-ink">
                <span
                  className="stat-num text-[clamp(3.25rem,7vw,6.5rem)] leading-[0.85]"
                  data-value={value}
                >
                  0
                </span>
                <span className="text-[clamp(1.25rem,2.2vw,2rem)] leading-none text-gold">
                  {suffix}
                </span>
              </div>
              <div className="mt-6 text-[11px] uppercase tracking-[.28em] text-ink">{label}</div>
              <div className="mt-2 text-[12px] text-muted">{note}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
