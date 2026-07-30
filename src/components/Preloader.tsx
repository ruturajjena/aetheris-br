import { useEffect, useRef, useState } from 'react'
import { gsap } from '../lib/gsap'
import { asset } from '../lib/paths'

const FLOORS = 13
const TOP = 62
const BASE = 296
const PITCH = (BASE - TOP) / FLOORS

/** Tracks the real bytes of the hero clip so the counter isn't theatre. */
function useAssetProgress(onDone: () => void) {
  const [pct, setPct] = useState(0)

  useEffect(() => {
    let alive = true
    const fonts = document.fonts?.ready ?? Promise.resolve()

    const video = fetch(asset('/media/hero-tower.mp4'))
      .then(async (res) => {
        const total = Number(res.headers.get('content-length')) || 0
        if (!res.body || !total) return
        const reader = res.body.getReader()
        let loaded = 0
        for (;;) {
          const { done, value } = await reader.read()
          if (done) break
          loaded += value?.length ?? 0
          if (alive) setPct(Math.min(97, Math.round((loaded / total) * 97)))
        }
      })
      .catch(() => undefined)

    Promise.all([video, fonts]).then(() => {
      if (!alive) return
      setPct(100)
      // Let the drawing finish its last stroke before we pull the curtain.
      setTimeout(onDone, 620)
    })

    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return pct
}

export default function Preloader({ onComplete }: { onComplete: () => void }) {
  const root = useRef<HTMLDivElement>(null)
  const svg = useRef<SVGSVGElement>(null)
  const counter = useRef<HTMLSpanElement>(null)
  const bar = useRef<HTMLDivElement>(null)
  const drawn = useRef<gsap.core.Timeline | null>(null)
  const [done, setDone] = useState(false)

  const pct = useAssetProgress(() => setDone(true))

  /* Build the draw-on timeline once, then scrub it with load progress. */
  useEffect(() => {
    const ctx = gsap.context(() => {
      const paths = gsap.utils.toArray<SVGPathElement | SVGLineElement>('.draw')
      paths.forEach((p) => {
        const len = p.getTotalLength()
        gsap.set(p, { strokeDasharray: len, strokeDashoffset: len })
      })

      drawn.current = gsap
        .timeline({ paused: true })
        .to('.draw-ground', { strokeDashoffset: 0, duration: 0.6, ease: 'power2.inOut' })
        .to('.draw-edge', { strokeDashoffset: 0, duration: 1.4, ease: 'power2.inOut' }, 0.2)
        .to(
          '.draw-floor',
          { strokeDashoffset: 0, duration: 0.5, stagger: 0.12, ease: 'power2.out' },
          0.5,
        )
        .to('.draw-crown', { strokeDashoffset: 0, duration: 0.9, ease: 'power2.inOut' }, '-=0.5')
        .to('.glow', { opacity: 1, duration: 0.8, stagger: 0.05 }, '-=0.9')
    }, svg)

    return () => ctx.revert()
  }, [])

  /* Progress → drawing + counter, eased so bursty network doesn't stutter. */
  useEffect(() => {
    const p = pct / 100
    if (drawn.current) gsap.to(drawn.current, { progress: p, duration: 0.9, ease: 'power2.out' })
    if (bar.current) gsap.to(bar.current, { scaleX: p, duration: 0.9, ease: 'power2.out' })
    if (counter.current) {
      const obj = { v: Number(counter.current.textContent) || 0 }
      gsap.to(obj, {
        v: pct,
        duration: 0.9,
        ease: 'power2.out',
        onUpdate: () => {
          if (counter.current) counter.current.textContent = String(Math.round(obj.v))
        },
      })
    }
  }, [pct])

  /* Curtain. */
  useEffect(() => {
    if (!done) return
    const tl = gsap.timeline({ onComplete })
    tl.to('.pre-fade', { opacity: 0, y: -16, duration: 0.7, ease: 'power2.inOut', stagger: 0.04 })
      .to(svg.current, { scale: 1.14, opacity: 0, duration: 1.1, ease: 'expo.inOut' }, 0.1)
      .to(
        root.current,
        { yPercent: -100, duration: 1.2, ease: 'expo.inOut' },
        0.55,
      )
    return () => {
      tl.kill()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done])

  return (
    <div
      ref={root}
      className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-canvas"
    >
      <div className="pre-fade absolute left-1/2 top-10 -translate-x-1/2 text-center md:top-14">
        <div className="font-display text-[13px] tracking-[.55em] text-ink">AETHERIS</div>
        <div className="mt-2 text-[9px] tracking-[.3em] text-muted">RESIDENCES · EST. 2026</div>
      </div>

      <svg
        ref={svg}
        viewBox="0 0 200 330"
        className="h-[46vh] max-h-[420px] w-auto"
        fill="none"
        strokeLinecap="square"
      >
        <g stroke="#111" strokeWidth="0.6" opacity="0.85">
          <line className="draw draw-ground" x1="18" y1="296" x2="182" y2="296" />
          <path className="draw draw-edge" d="M62 296 L62 62" />
          <path className="draw draw-edge" d="M138 296 L138 62" />
          <path className="draw draw-edge" d="M100 296 L100 44" opacity="0.35" />

          {Array.from({ length: FLOORS }).map((_, i) => (
            <line
              key={i}
              className="draw draw-floor"
              x1="62"
              y1={BASE - i * PITCH}
              x2="138"
              y2={BASE - i * PITCH}
            />
          ))}

          <path className="draw draw-crown" d="M62 62 L100 44 L138 62" />
          <path className="draw draw-crown" d="M100 44 L100 26" strokeWidth="0.5" />
        </g>

        {/* Lit windows settle in once the frame is complete. */}
        <g fill="#D8B46A">
          {Array.from({ length: FLOORS - 1 }).map((_, i) =>
            [0, 1, 2].map((c) => (
              <rect
                key={`${i}-${c}`}
                className="glow"
                x={70 + c * 24}
                y={BASE - (i + 1) * PITCH + 4}
                width="10"
                height={PITCH - 8}
                opacity="0"
                rx="0.5"
              />
            )),
          )}
        </g>
      </svg>

      <div className="pre-fade absolute bottom-10 left-0 right-0 px-6 md:bottom-12 md:px-12">
        <div className="mx-auto flex max-w-[1400px] items-end justify-between">
          <div className="text-[9px] uppercase tracking-[.3em] text-muted">
            Constructing the experience
          </div>
          <div className="num flex items-baseline gap-1 text-ink">
            <span ref={counter} className="text-[clamp(2.5rem,7vw,5rem)] leading-none">
              0
            </span>
            <span className="text-xs text-muted">%</span>
          </div>
        </div>
        <div className="mx-auto mt-5 max-w-[1400px] overflow-hidden">
          <div className="rule relative">
            <div
              ref={bar}
              className="absolute inset-0 origin-left bg-gold"
              style={{ transform: 'scaleX(0)' }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
