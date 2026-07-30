import { useEffect, useRef, useState } from 'react'
import { Maximize2, Compass, Sun } from 'lucide-react'
import { gsap, prefersReducedMotion } from '../lib/gsap'
import { useTextReveal } from '../lib/anim'

const ROOMS = [
  { id: 'living', name: 'Living & Dining', area: '48.2 m²', x: 220, y: 170 },
  { id: 'kitchen', name: 'Kitchen', area: '14.6 m²', x: 510, y: 110 },
  { id: 'utility', name: 'Utility', area: '6.1 m²', x: 690, y: 110 },
  { id: 'master', name: 'Master Suite', area: '31.4 m²', x: 580, y: 240 },
  { id: 'bed2', name: 'Bedroom Two', area: '19.8 m²', x: 145, y: 390 },
  { id: 'bed3', name: 'Bedroom Three', area: '22.5 m²', x: 385, y: 390 },
  { id: 'study', name: 'Study', area: '12.9 m²', x: 640, y: 390 },
]

export default function FloorPlan() {
  const section = useRef<HTMLElement>(null)
  const glow = useRef<HTMLDivElement>(null)
  const heading = useRef<HTMLHeadingElement>(null)
  const [hover, setHover] = useState<string | null>(null)

  useTextReveal(heading, { start: 'top 84%' })

  /* A light source that follows the pointer across the drawing. */
  useEffect(() => {
    const el = section.current
    const g = glow.current
    if (!el || !g || !window.matchMedia('(pointer: fine)').matches) return

    const xTo = gsap.quickTo(g, 'x', { duration: 0.9, ease: 'power3.out' })
    const yTo = gsap.quickTo(g, 'y', { duration: 0.9, ease: 'power3.out' })

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      xTo(e.clientX - r.left)
      yTo(e.clientY - r.top)
    }
    const onEnter = () => gsap.to(g, { opacity: 1, duration: 0.7 })
    const onLeave = () => gsap.to(g, { opacity: 0, duration: 0.7 })

    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerenter', onEnter)
    el.addEventListener('pointerleave', onLeave)
    return () => {
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerenter', onEnter)
      el.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  /* Draw the plan on as it enters. */
  useEffect(() => {
    const ctx = gsap.context(() => {
      if (prefersReducedMotion()) return

      const strokes = gsap.utils.toArray<SVGPathElement>('.fp-stroke')
      strokes.forEach((p) => {
        const len = p.getTotalLength()
        gsap.set(p, { strokeDasharray: len, strokeDashoffset: len })
      })

      gsap
        .timeline({ scrollTrigger: { trigger: '.fp-sheet', start: 'top 78%', once: true } })
        .fromTo('.fp-sheet', { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1.2, ease: 'expo.out' })
        .to(strokes, { strokeDashoffset: 0, duration: 1.6, stagger: 0.05, ease: 'power2.inOut' }, 0.2)
        .fromTo(
          '.fp-tag',
          { opacity: 0, scale: 0.9 },
          { opacity: 1, scale: 1, duration: 0.8, stagger: 0.06, ease: 'expo.out' },
          1.1,
        )
    }, section)

    return () => ctx.revert()
  }, [])

  return (
    <section
      id="plans"
      ref={section}
      className="relative overflow-hidden bg-canvas py-[14vh] md:py-[18vh]"
    >
      {/* blueprint grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.55]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(17,17,17,.045) 1px, transparent 1px), linear-gradient(90deg, rgba(17,17,17,.045) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(75% 65% at 50% 45%, #000 40%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(75% 65% at 50% 45%, #000 40%, transparent 100%)',
        }}
      />
      <div
        ref={glow}
        aria-hidden
        className="pointer-events-none absolute -left-64 -top-64 h-[520px] w-[520px] opacity-0"
        style={{
          background:
            'radial-gradient(circle, rgba(216,180,106,.20) 0%, rgba(216,180,106,.07) 38%, transparent 68%)',
        }}
      />

      <div className="relative mx-auto max-w-[1600px] px-6 md:px-12">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="eyebrow mb-5 flex items-center gap-3">
              <span className="h-px w-8 bg-gold" />
              07 — Plans
            </div>
            <h2 ref={heading} className="t-h1 max-w-[13ch] opacity-0">
              Drawn to be lived in.
            </h2>
          </div>
          <div className="grid w-full grid-cols-3 gap-4 pb-3 md:flex md:w-auto md:items-center md:gap-8">
            {[
              { icon: Maximize2, k: 'Carpet', v: '2,410 sq ft' },
              { icon: Compass, k: 'Facing', v: 'North-east' },
              { icon: Sun, k: 'Light', v: 'Dual aspect' },
            ].map(({ icon: Icon, k, v }) => (
              <div key={k} className="flex items-center gap-2.5 md:gap-3">
                <Icon size={15} strokeWidth={1.2} className="shrink-0 text-gold" />
                <div className="min-w-0">
                  <div className="text-[9px] uppercase tracking-[.24em] text-muted">{k}</div>
                  <div className="num whitespace-nowrap text-[12px] text-ink md:text-[13px]">
                    {v}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ---------------- the sheet ---------------- */}
        <div className="fp-sheet relative mt-[8vh] rounded-[3px] border border-hairline bg-card/70 p-5 backdrop-blur-sm md:p-10">
          <div className="mb-6 flex items-center justify-between border-b border-hairline-soft pb-5">
            <div className="text-[10px] uppercase tracking-[.28em] text-ink">
              Type D — Four bedroom · Level 32–38
            </div>
            <div className="num text-[10px] text-muted">DWG · AE-3402 · REV 04</div>
          </div>

          {/* Tags share this box with the drawing, so their percentage
              positions resolve against the exact same coordinate space. */}
          <div className="relative">
            <svg viewBox="0 0 800 520" className="block w-full" fill="none">
            <g stroke="#111" strokeWidth="1.6" strokeLinecap="square">
              <path className="fp-stroke" d="M40 40 H760 V480 H40 Z" />
              <path className="fp-stroke" d="M400 40 V300" />
              <path className="fp-stroke" d="M40 300 H760" />
              <path className="fp-stroke" d="M250 300 V480" />
              <path className="fp-stroke" d="M520 300 V480" />
              <path className="fp-stroke" d="M620 40 V180" />
              <path className="fp-stroke" d="M400 180 H760" />
            </g>

            {/* openings + swings */}
            <g stroke="#D8B46A" strokeWidth="1.2">
              <path className="fp-stroke" d="M400 120 A 40 40 0 0 1 360 160" />
              <path className="fp-stroke" d="M180 300 A 38 38 0 0 0 142 338" />
              <path className="fp-stroke" d="M330 300 A 38 38 0 0 0 292 338" />
              <path className="fp-stroke" d="M600 300 A 38 38 0 0 0 562 338" />
            </g>

            {/* glazing */}
            <g stroke="#111" strokeWidth="3" opacity="0.35">
              <path className="fp-stroke" d="M60 40 H360" />
              <path className="fp-stroke" d="M60 480 H230" />
              <path className="fp-stroke" d="M540 480 H740" />
            </g>

            {/* hover fills */}
            {ROOMS.map((r) => (
              <circle
                key={r.id}
                cx={r.x}
                cy={r.y}
                r="46"
                fill="#D8B46A"
                opacity={hover === r.id ? 0.14 : 0}
                style={{ transition: 'opacity .5s' }}
              />
            ))}
            </svg>

            {/* room tags */}
            <div className="pointer-events-none absolute inset-0">
              {ROOMS.map((r) => (
              <button
                key={r.id}
                data-cursor="link"
                onPointerEnter={() => setHover(r.id)}
                onPointerLeave={() => setHover(null)}
                style={{ left: `${(r.x / 800) * 100}%`, top: `${(r.y / 520) * 100}%` }}
                className="fp-tag pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap"
              >
                <span
                  className={`block h-1.5 w-1.5 rounded-full transition-colors duration-500 ${
                    hover === r.id ? 'bg-gold' : 'bg-ink/25'
                  } mx-auto`}
                />
                {/* Labels would collide at phone width — the legend below
                    carries them there instead. */}
                <span className="mt-2 hidden text-[9px] uppercase tracking-[.2em] text-ink md:block">
                  {r.name}
                </span>
                <span
                  className={`num mt-0.5 hidden text-[10px] transition-colors duration-500 md:block ${
                    hover === r.id ? 'text-gold' : 'text-muted'
                  }`}
                >
                  {r.area}
                </span>
              </button>
              ))}
            </div>
          </div>

          <dl className="mt-7 grid grid-cols-2 gap-x-6 gap-y-3 md:hidden">
            {ROOMS.map((r) => (
              <div key={r.id} className="flex items-baseline justify-between gap-3">
                <dt className="text-[10px] uppercase tracking-[.16em] text-ink">{r.name}</dt>
                <dd className="num shrink-0 text-[10px] text-muted">{r.area}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-hairline-soft pt-5">
            <p className="text-[11px] text-muted">
              Interactive unit selection — live availability, floor-by-floor views and orientation
              studies — opens with the sales gallery.
            </p>
            <span className="rounded-full border border-gold/40 px-4 py-2 text-[9px] uppercase tracking-[.24em] text-gold">
              Coming 2026
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
