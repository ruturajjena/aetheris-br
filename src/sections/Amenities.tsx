import { useEffect, useRef, useState } from 'react'
import { Waves, Dumbbell, Dices, Baby } from 'lucide-react'
import { gsap, ScrollTrigger, prefersReducedMotion } from '../lib/gsap'
import { useVideoScrubber } from '../lib/useVideoScrubber'
import { asset } from '../lib/paths'

/**
 * The source clip moves through pool → gym → games → kids in four even beats,
 * so card N maps onto quarter N of the footage and the two stay locked.
 */
const CARDS = [
  {
    icon: Waves,
    title: 'The Pool',
    kicker: 'Level 04 · Open Deck',
    body: '38-metre temperature-controlled infinity edge, cabana seating and a shaded lap lane.',
  },
  {
    icon: Dumbbell,
    title: 'The Gym',
    kicker: 'Level 03 · Wellness',
    body: 'Technogym floor, altitude studio and two coaches on residence retainer.',
  },
  {
    icon: Dices,
    title: 'Indoor Games',
    kicker: 'Level 02 · Social',
    body: 'Billiards, table tennis and a card lounge finished in walnut and brass.',
  },
  {
    icon: Baby,
    title: "Kids' Area",
    kicker: 'Level 01 · Family',
    body: 'Soft-fall play landscape, creche and a reading nook under the garden light.',
  },
]

export default function Amenities() {
  const section = useRef<HTMLElement>(null)
  const video = useRef<HTMLVideoElement>(null)
  const spot = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  const scrubber = useVideoScrubber(video, { lerp: 0.11 })

  useEffect(() => {
    const ctx = gsap.context(() => {
      const reduced = prefersReducedMotion()

      ScrollTrigger.create({
        trigger: section.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        onUpdate: (self) => {
          scrubber.current.seek(self.progress)
          // Bias slightly into each quarter so a card lights up once its
          // footage is actually on screen, not on the cut.
          const idx = Math.min(CARDS.length - 1, Math.floor(self.progress * CARDS.length + 0.12))
          setActive(idx)
        },
      })

      if (reduced) return

      gsap.fromTo(
        '.am-intro',
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1.3,
          stagger: 0.1,
          ease: 'expo.out',
          scrollTrigger: { trigger: section.current, start: 'top 60%', once: true },
        },
      )
    }, section)

    return () => ctx.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* Light follows the card that is currently speaking. */
  useEffect(() => {
    if (!spot.current || prefersReducedMotion()) return
    gsap.to(spot.current, {
      xPercent: active * 100,
      duration: 1.1,
      ease: 'expo.out',
    })
  }, [active])

  return (
    <section id="amenities" ref={section} className="relative h-[420vh] bg-canvas">
      <div className="sticky top-0 h-[100svh] overflow-hidden bg-[#0d0d0c]">
        <video
          ref={video}
          src={asset('/media/amenities.mp4')}
          poster={asset('/media/amenities-poster.jpg')}
          muted
          playsInline
          preload="metadata"
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover"
        />

        {/* Base grade, then a travelling light over the live quarter. */}
        <div className="pointer-events-none absolute inset-0 bg-[#0d0d0c]/45" />
        <div className="pointer-events-none absolute inset-0 flex">
          <div ref={spot} className="h-full w-1/4">
            <div
              className="h-full w-full"
              style={{
                background:
                  'radial-gradient(60% 55% at 50% 45%, rgba(255,255,255,.30), rgba(255,255,255,.10) 45%, transparent 72%)',
              }}
            />
          </div>
        </div>
        {/* Reaches past the headline — the clip opens on a bright sky. */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[62%] bg-gradient-to-b from-[#0d0d0c]/80 via-[#0d0d0c]/40 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[60%] bg-gradient-to-t from-[#0d0d0c]/85 via-[#0d0d0c]/35 to-transparent" />

        {/* ---------------- copy ---------------- */}
        <div className="relative flex h-full flex-col justify-between px-6 pb-8 pt-24 md:px-12 md:pb-12 md:pt-28">
          <div className="mx-auto w-full max-w-[1600px]">
            <div className="am-intro eyebrow mb-5 flex items-center gap-3 !text-white/75">
              <span className="h-px w-8 bg-gold" />
              03 — Lifestyle
            </div>
            <h2 className="am-intro t-h1 max-w-[16ch] text-white">Eighty ways to spend a Sunday.</h2>
          </div>

          <div className="mx-auto w-full max-w-[1600px]">
            {/* active headline */}
            <div className="mb-6 flex items-end gap-5 md:mb-10 md:gap-6">
              <span className="num text-[clamp(3rem,9vw,8rem)] leading-[0.8] text-white/15">
                0{active + 1}
              </span>
              <div className="pb-2">
                <div className="text-[9px] uppercase tracking-[.3em] text-gold">
                  {CARDS[active].kicker}
                </div>
                <div className="t-h2 mt-2 text-white">{CARDS[active].title}</div>
              </div>
            </div>

            {/* On phones the description lives here — the tiles below stay a
                compact index so the whole chapter fits one screen. */}
            <p className="mb-6 max-w-sm text-[13px] leading-relaxed text-white/70 md:hidden">
              {CARDS[active].body}
            </p>

            <div className="grid grid-cols-4 gap-2 md:gap-4">
              {CARDS.map(({ icon: Icon, title, body }, i) => {
                const on = i === active
                const seen = i <= active
                return (
                  <div
                    key={title}
                    data-cursor="link"
                    className="glass-dim relative overflow-hidden rounded-[2px] p-3 transition-all duration-[900ms] ease-[cubic-bezier(.16,1,.3,1)] md:p-6"
                    style={{
                      opacity: seen ? 1 : 0.18,
                      transform: `translateY(${seen ? (on ? -10 : 0) : 34}px)`,
                      borderColor: on ? 'rgba(216,180,106,.65)' : 'rgba(255,255,255,.18)',
                      background: on ? 'rgba(255,255,255,.20)' : 'rgba(255,255,255,.08)',
                    }}
                  >
                    <span
                      className="absolute left-0 top-0 h-px bg-gold transition-[width] duration-[900ms] ease-[cubic-bezier(.16,1,.3,1)]"
                      style={{ width: on ? '100%' : '0%' }}
                    />
                    <Icon
                      size={19}
                      strokeWidth={1.1}
                      className={on ? 'text-gold' : 'text-white/70'}
                    />
                    <div className="mt-4 text-[10px] font-medium leading-tight tracking-wide text-white md:mt-8 md:text-[13px]">
                      {title}
                    </div>
                    <p
                      className="mt-2 hidden text-[11px] leading-relaxed text-white/60 transition-opacity duration-700 md:block"
                      style={{ opacity: on ? 1 : 0 }}
                    >
                      {body}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
