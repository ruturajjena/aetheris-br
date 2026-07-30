import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { gsap, prefersReducedMotion } from '../lib/gsap'

const QUOTES = [
  {
    quote:
      'We came to see a show flat and left having chosen a floor. The light at four in the afternoon decided it for us.',
    name: 'Ananya & Rohan Mehta',
    role: 'Residence 3402 · Moved in 2026',
  },
  {
    quote:
      'I have specified towers for twenty years. This is the first one where the shared floors are as considered as the private ones.',
    name: 'Dev Krishnan',
    role: 'Principal, Krishnan Associates',
  },
  {
    quote:
      'The children walk to the pool on their own. That sentence is the whole reason we moved here.',
    name: 'Sara Iyer',
    role: 'Residence 2811 · Moved in 2026',
  },
]

export default function Testimonials() {
  const section = useRef<HTMLElement>(null)
  const slide = useRef<HTMLDivElement>(null)
  const [i, setI] = useState(0)
  const busy = useRef(false)

  const go = useCallback(
    (next: number) => {
      if (busy.current || next === i) return
      const dir = next > i || (i === QUOTES.length - 1 && next === 0) ? 1 : -1
      busy.current = true

      if (prefersReducedMotion()) {
        setI(next)
        busy.current = false
        return
      }

      gsap
        .timeline({ onComplete: () => (busy.current = false) })
        .to(slide.current, {
          opacity: 0,
          y: -18 * dir,
          filter: 'blur(6px)',
          duration: 0.45,
          ease: 'power2.in',
        })
        .add(() => setI(next))
        .fromTo(
          slide.current,
          { opacity: 0, y: 22 * dir, filter: 'blur(6px)' },
          { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.9, ease: 'expo.out' },
        )
    },
    [i],
  )

  /* Advance on its own, but never while the reader is interacting. */
  useEffect(() => {
    if (prefersReducedMotion()) return
    const el = section.current
    let paused = false
    const enter = () => (paused = true)
    const leave = () => (paused = false)
    el?.addEventListener('pointerenter', enter)
    el?.addEventListener('pointerleave', leave)

    const id = setInterval(() => {
      if (!paused && !document.hidden) go((i + 1) % QUOTES.length)
    }, 7000)

    return () => {
      clearInterval(id)
      el?.removeEventListener('pointerenter', enter)
      el?.removeEventListener('pointerleave', leave)
    }
  }, [i, go])

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (prefersReducedMotion()) return
      gsap.fromTo(
        '.tm-in',
        { opacity: 0, y: 44 },
        {
          opacity: 1,
          y: 0,
          duration: 1.3,
          stagger: 0.12,
          ease: 'expo.out',
          scrollTrigger: { trigger: section.current, start: 'top 72%', once: true },
        },
      )
    }, section)
    return () => ctx.revert()
  }, [])

  const q = QUOTES[i]

  return (
    <section ref={section} className="relative overflow-hidden bg-canvas py-[14vh] md:py-[20vh]">
      <div className="mx-auto max-w-[1600px] px-6 md:px-12">
        <div className="tm-in eyebrow mb-12 flex items-center gap-3 md:mb-16">
          <span className="h-px w-8 bg-gold" />
          09 — In their words
        </div>

        <div className="tm-in glass relative rounded-[3px] px-7 py-12 md:px-16 md:py-20">
          <span
            aria-hidden
            className="pointer-events-none absolute -top-6 left-6 font-display text-[9rem] leading-none text-gold/25 md:-top-10 md:left-12 md:text-[14rem]"
          >
            “
          </span>

          <div ref={slide} className="relative min-h-[42vh] md:min-h-[34vh]">
            <blockquote className="font-display text-[clamp(1.5rem,3.4vw,3rem)] font-normal leading-[1.18] tracking-[-.02em] text-ink md:max-w-[22ch]">
              {q.quote}
            </blockquote>
            <figcaption className="mt-10 flex items-center gap-4">
              <span className="h-px w-10 bg-gold" />
              <div>
                <div className="text-[12px] tracking-wide text-ink">{q.name}</div>
                <div className="mt-1 text-[11px] text-muted">{q.role}</div>
              </div>
            </figcaption>
          </div>

          {/* controls */}
          <div className="mt-10 flex items-center justify-between border-t border-hairline-soft pt-7">
            <div className="flex items-center gap-3">
              {QUOTES.map((_, n) => (
                <button
                  key={n}
                  onClick={() => go(n)}
                  data-cursor="link"
                  aria-label={`Testimonial ${n + 1}`}
                  className="group py-2"
                >
                  <span
                    className="block h-px transition-all duration-700 ease-[cubic-bezier(.16,1,.3,1)]"
                    style={{
                      width: n === i ? 44 : 18,
                      background: n === i ? '#D8B46A' : 'rgba(17,17,17,.2)',
                    }}
                  />
                </button>
              ))}
              <span className="num ml-3 text-[10px] text-muted">
                0{i + 1} / 0{QUOTES.length}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => go((i - 1 + QUOTES.length) % QUOTES.length)}
                data-cursor="link"
                aria-label="Previous testimonial"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-hairline transition-colors duration-500 hover:border-gold hover:text-gold"
              >
                <ArrowLeft size={15} strokeWidth={1.3} />
              </button>
              <button
                onClick={() => go((i + 1) % QUOTES.length)}
                data-cursor="link"
                aria-label="Next testimonial"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-hairline transition-colors duration-500 hover:border-gold hover:text-gold"
              >
                <ArrowRight size={15} strokeWidth={1.3} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
