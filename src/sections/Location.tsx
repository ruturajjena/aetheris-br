import { useEffect, useRef, useState } from 'react'
import {
  GraduationCap,
  TrainFront,
  HeartPulse,
  Plane,
  Building2,
  ShoppingBag,
} from 'lucide-react'
import { gsap, prefersReducedMotion } from '../lib/gsap'
import { useTextReveal } from '../lib/anim'

const POIS = [
  { icon: TrainFront, name: 'Metro — Line 3', dist: '600 m', time: '2 min', x: 430, y: 250 },
  { icon: ShoppingBag, name: 'Retail Galleria', dist: '900 m', time: '3 min', x: 300, y: 175 },
  { icon: GraduationCap, name: 'International School', dist: '1.2 km', time: '4 min', x: 205, y: 300 },
  { icon: HeartPulse, name: 'Multispecialty Hospital', dist: '2.4 km', time: '7 min', x: 495, y: 130 },
  { icon: Building2, name: 'Business District', dist: '5.1 km', time: '12 min', x: 155, y: 130 },
  { icon: Plane, name: 'International Airport', dist: '18 km', time: '24 min', x: 545, y: 355 },
]

export default function Location() {
  const section = useRef<HTMLElement>(null)
  const heading = useRef<HTMLHeadingElement>(null)
  const [hover, setHover] = useState<number | null>(null)

  useTextReveal(heading, { start: 'top 84%' })

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (prefersReducedMotion()) return

      const roads = gsap.utils.toArray<SVGPathElement>('.map-road')
      roads.forEach((p) => {
        const len = p.getTotalLength()
        gsap.set(p, { strokeDasharray: len, strokeDashoffset: len })
      })

      gsap
        .timeline({ scrollTrigger: { trigger: '.map-wrap', start: 'top 76%', once: true } })
        .to(roads, { strokeDashoffset: 0, duration: 1.8, stagger: 0.08, ease: 'power2.inOut' })
        .fromTo(
          '.map-pin',
          { opacity: 0, y: -14, scale: 0.6 },
          { opacity: 1, y: 0, scale: 1, duration: 0.9, stagger: 0.07, ease: 'back.out(2)' },
          0.7,
        )
        .fromTo('.map-site', { scale: 0 }, { scale: 1, duration: 1, ease: 'expo.out' }, 0.5)

      gsap.fromTo(
        '.poi-row',
        { opacity: 0, x: 30 },
        {
          opacity: 1,
          x: 0,
          duration: 1,
          stagger: 0.08,
          ease: 'expo.out',
          scrollTrigger: { trigger: '.poi-list', start: 'top 82%', once: true },
        },
      )

      // Site rings breathe continuously — the one loop on the page.
      gsap.to('.ring', {
        scale: 2.6,
        opacity: 0,
        duration: 3.4,
        repeat: -1,
        stagger: 1.15,
        ease: 'power1.out',
        transformOrigin: 'center',
      })
    }, section)

    return () => ctx.revert()
  }, [])

  return (
    <section id="location" ref={section} className="relative bg-canvas py-[14vh] md:py-[18vh]">
      <div className="mx-auto max-w-[1600px] px-6 md:px-12">
        <div className="eyebrow mb-5 flex items-center gap-3">
          <span className="h-px w-8 bg-gold" />
          08 — Location
        </div>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2 ref={heading} className="t-h1 max-w-[13ch] opacity-0">
            Central, without the centre.
          </h2>
          <p className="t-body max-w-xs pb-3">
            Set back from the arterial road, three minutes from the line, and far enough from all
            of it to hear the garden.
          </p>
        </div>

        <div className="mt-[9vh] grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16">
          {/* ---------------- map ---------------- */}
          <div className="map-wrap relative lg:col-span-7">
            <div className="relative overflow-hidden rounded-[3px] border border-hairline bg-card">
              <svg viewBox="0 0 700 460" className="w-full">
                {/* water */}
                <path
                  d="M0 400 C 120 380, 190 430, 300 415 C 430 398, 520 445, 700 425 L700 460 L0 460 Z"
                  fill="#F1F4F5"
                />
                {/* parkland */}
                <circle cx="120" cy="230" r="62" fill="#F2F4F0" />
                <circle cx="600" cy="200" r="48" fill="#F2F4F0" />

                <g stroke="#111" fill="none" strokeLinecap="round">
                  <path className="map-road" d="M0 250 H700" strokeWidth="2.2" opacity="0.22" />
                  <path className="map-road" d="M350 0 V460" strokeWidth="2.2" opacity="0.22" />
                  <path className="map-road" d="M0 120 H700" strokeWidth="1.2" opacity="0.14" />
                  <path className="map-road" d="M0 355 H700" strokeWidth="1.2" opacity="0.14" />
                  <path className="map-road" d="M180 0 V460" strokeWidth="1.2" opacity="0.14" />
                  <path className="map-road" d="M520 0 V460" strokeWidth="1.2" opacity="0.14" />
                  <path
                    className="map-road"
                    d="M350 250 L520 120"
                    strokeWidth="1.6"
                    opacity="0.18"
                  />
                </g>

                {/* the site */}
                <g transform="translate(350 250)">
                  {[0, 1, 2].map((i) => (
                    <circle
                      key={i}
                      className="ring"
                      r="26"
                      fill="none"
                      stroke="#D8B46A"
                      strokeWidth="1"
                      opacity="0.7"
                    />
                  ))}
                  <g className="map-site">
                    <circle r="9" fill="#D8B46A" />
                    <circle r="17" fill="none" stroke="#D8B46A" strokeWidth="1" opacity="0.5" />
                  </g>
                </g>

                {/* pins */}
                {POIS.map((p, i) => (
                  <g
                    key={p.name}
                    className="map-pin"
                    transform={`translate(${p.x} ${p.y})`}
                    style={{ transition: 'opacity .4s' }}
                  >
                    <circle
                      r="16"
                      fill="#D8B46A"
                      opacity={hover === i ? 0.16 : 0}
                      style={{ transition: 'opacity .4s' }}
                    />
                    <circle
                      r="4"
                      fill={hover === i ? '#D8B46A' : '#FFFFFF'}
                      stroke={hover === i ? '#D8B46A' : '#111111'}
                      strokeWidth="1.4"
                      style={{ transition: 'fill .4s, stroke .4s' }}
                    />
                  </g>
                ))}
              </svg>

              <div className="pointer-events-none absolute left-5 top-5 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                <span className="text-[9px] uppercase tracking-[.28em] text-ink">
                  Aetheris Residences
                </span>
              </div>
              <div className="num pointer-events-none absolute bottom-5 right-5 text-[9px] tracking-widest text-muted">
                12°58′N · 77°35′E
              </div>
            </div>
          </div>

          {/* ---------------- list ---------------- */}
          <div className="poi-list lg:col-span-5">
            {POIS.map(({ icon: Icon, name, dist, time }, i) => (
              <div
                key={name}
                data-cursor="link"
                onPointerEnter={() => setHover(i)}
                onPointerLeave={() => setHover(null)}
                className="poi-row group flex items-center gap-5 border-b border-hairline-soft py-5 transition-colors duration-500 first:border-t"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-hairline transition-colors duration-500 group-hover:border-gold/60">
                  <Icon
                    size={15}
                    strokeWidth={1.2}
                    className="text-ink transition-colors duration-500 group-hover:text-gold"
                  />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] text-ink transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] group-hover:translate-x-1">
                    {name}
                  </div>
                </div>
                <div className="num shrink-0 text-right">
                  <div className="text-[13px] text-ink">{dist}</div>
                  <div className="text-[10px] text-muted">{time} drive</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
