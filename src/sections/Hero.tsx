import { useEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger, prefersReducedMotion } from '../lib/gsap'
import { useVideoScrubber } from '../lib/useVideoScrubber'
import { splitChars } from '../lib/anim'
import { scrollTo } from '../lib/useLenis'
import { asset } from '../lib/paths'
import MagneticButton from '../components/MagneticButton'

const TOTAL_LEVELS = 42

export default function Hero({ ready }: { ready: boolean }) {
  const section = useRef<HTMLElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const video = useRef<HTMLVideoElement>(null)
  const l1 = useRef<HTMLSpanElement>(null)
  const l2 = useRef<HTMLSpanElement>(null)
  const level = useRef<HTMLSpanElement>(null)
  const pctRef = useRef<HTMLSpanElement>(null)
  const intro = useRef(false)

  // The construction reads best when it completes a little before the pin
  // releases — that leaves room for the camera push and the fade to white.
  const scrubber = useVideoScrubber(video, { lerp: 0.15 })

  const [src] = useState(() =>
    asset(
      typeof window !== 'undefined' && window.innerWidth < 700
        ? '/media/hero-tower-sm.mp4'
        : '/media/hero-tower.mp4',
    ),
  )

  /* ---------------- intro: letters build themselves ---------------- */
  useEffect(() => {
    if (!ready || !l1.current || !l2.current) return

    const run = () => {
      const ctx = gsap.context(() => {
        const c1 = splitChars(l1.current!)
        const c2 = splitChars(l2.current!)
        gsap.set([l1.current, l2.current], { opacity: 1 })

        if (prefersReducedMotion()) {
          gsap.set([...c1, ...c2], { yPercent: 0, opacity: 1 })
          gsap.set('.hero-fade', { autoAlpha: 1, y: 0 })
          return
        }

        gsap
          .timeline({ delay: 0.15 })
          .from(c1, {
            yPercent: 118,
            duration: 1.35,
            ease: 'expo.out',
            stagger: { each: 0.028, from: 'start' },
          })
          .from(
            c2,
            {
              yPercent: 118,
              duration: 1.35,
              ease: 'expo.out',
              stagger: { each: 0.028, from: 'start' },
            },
            0.22,
          )
          .fromTo(
            '.hero-fade',
            { autoAlpha: 0, y: 26 },
            { autoAlpha: 1, y: 0, duration: 1.2, stagger: 0.12, ease: 'expo.out' },
            0.75,
          )
          .fromTo(
            '.hero-hud',
            { autoAlpha: 0 },
            { autoAlpha: 1, duration: 1, stagger: 0.08 },
            1.1,
          )
      }, section)
      return ctx
    }

    let ctx: gsap.Context | undefined
    let alive = true
    const fonts = document.fonts?.ready ?? Promise.resolve()
    fonts.then(() => {
      // Guard: the split is destructive, so it must never run twice on the
      // same nodes (StrictMode's double-invoke would nest the spans).
      if (!alive || intro.current) return
      intro.current = true
      ctx = run()
    })
    return () => {
      alive = false
      ctx?.revert()
      if (ctx) intro.current = false
    }
  }, [ready])

  /* ---------------- scroll choreography ---------------- */
  useEffect(() => {
    if (!ready) return
    const ctx = gsap.context(() => {
      const reduced = prefersReducedMotion()

      ScrollTrigger.create({
        trigger: section.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        onUpdate: (self) => {
          const p = self.progress
          // Construction occupies the first 88% of the pin.
          scrubber.current.seek(Math.min(1, p / 0.88))

          const built = Math.min(1, p / 0.88)
          if (level.current) {
            level.current.textContent = String(
              Math.max(1, Math.round(built * TOTAL_LEVELS)),
            ).padStart(2, '0')
          }
          if (pctRef.current) pctRef.current.textContent = String(Math.round(built * 100))
        },
      })

      if (reduced) return

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1,
        },
        // A scrubbed timeline renders at time 0 the moment it is built, which
        // would latch these targets' pre-intro (hidden) values as the "from"
        // state and pin them there. Defer until scroll actually moves.
        defaults: { immediateRender: false },
      })

      // Text leaves in sequence, each at its own pace.
      tl.to('.hero-scroll-cue', { autoAlpha: 0, y: -20, duration: 0.05 }, 0)
        .to('.hero-sub', { autoAlpha: 0, y: -40, duration: 0.14 }, 0.03)
        .to('.hero-cta', { autoAlpha: 0, y: -40, duration: 0.14 }, 0.07)
        .to('.hero-line-1', { autoAlpha: 0, yPercent: -60, duration: 0.22 }, 0.14)
        .to('.hero-line-2', { autoAlpha: 0, yPercent: -60, duration: 0.22 }, 0.2)
        .to('.hero-eyebrow', { autoAlpha: 0, duration: 0.12 }, 0.16)
        // Camera settles onto the finished tower.
        .fromTo(
          '.hero-frame',
          { scale: 1, yPercent: 0 },
          { scale: 1.16, yPercent: -4, duration: 0.55, ease: 'power1.inOut' },
          0.42,
        )
        // Handoff: the whole stage dissolves into the page.
        .to('.hero-hud', { autoAlpha: 0, duration: 0.1 }, 0.84)
        .to('.hero-wash', { opacity: 1, duration: 0.16 }, 0.84)
        .to('.hero-stage', { opacity: 0, duration: 0.08 }, 0.95)
    }, section)

    return () => ctx.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready])

  return (
    <section id="hero" ref={section} className="relative h-[250vh]">
      <div ref={stage} className="hero-stage sticky top-0 h-[100svh] overflow-hidden">
        {/* ---------- the tower ---------- */}
        <div className="hero-frame absolute inset-0 flex items-center justify-center will-change-transform">
          {/* Wrapper is sized by the clip itself so the feather tracks its
              real edges rather than the viewport's. */}
          <div className="relative h-[104%] md:h-[114%]">
            <video
              ref={video}
              src={src}
              poster={asset('/media/hero-poster.jpg')}
              muted
              playsInline
              preload="auto"
              disablePictureInPicture
              aria-hidden
              className="h-full w-auto max-w-none"
              style={{ filter: 'brightness(1.03) contrast(1.02)' }}
            />
            {/* Dissolve the studio backdrop into the paper. */}
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-px"
              style={{
                background:
                  'linear-gradient(to right, #FAFAF8 0%, rgba(250,250,248,.82) 8%, rgba(250,250,248,0) 27%, rgba(250,250,248,0) 73%, rgba(250,250,248,.82) 92%, #FAFAF8 100%),' +
                  'linear-gradient(to bottom, #FAFAF8 0%, rgba(250,250,248,.5) 6%, rgba(250,250,248,0) 18%, rgba(250,250,248,0) 84%, rgba(250,250,248,.85) 96%, #FAFAF8 100%)',
              }}
            />
          </div>
        </div>

        {/* On phones the tower fills the frame, so the lower copy needs paper
            under it. On desktop it is only a whisper. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[46%] bg-gradient-to-t from-canvas via-canvas/80 to-transparent md:h-[26%] md:via-canvas/30"
        />

        {/* ---------- headline ---------- */}
        <div className="pointer-events-none absolute inset-0 flex flex-col justify-between px-6 pb-8 pt-24 md:px-12 md:pb-12 md:pt-28">
          <div className="mx-auto w-full max-w-[1600px]">
            <div className="hero-eyebrow eyebrow hero-fade opacity-0 mb-5 flex items-center gap-3 md:mb-8">
              <span className="h-px w-8 bg-gold" />
              A vertical gated community
            </div>

            {/* Capped short of the construction rail so the type never
                collides with it at any viewport width. */}
            <h1 className="t-display max-w-[78vw] select-none md:max-w-[70vw]">
              <span className="hero-line-1 block opacity-0" ref={l1}>
                Not Just A Home
              </span>
              <span className="hero-line-2 block whitespace-nowrap text-right opacity-0" ref={l2}>
                A New Skyline.
              </span>
            </h1>
          </div>

          {/* ---------- bottom rail ---------- */}
          <div className="mx-auto flex w-full max-w-[1600px] items-end justify-between gap-8">
            <div className="max-w-sm">
              <p className="hero-sub hero-fade t-body opacity-0">
                Experience the next generation of luxury living — eighty-plus amenities,
                three acres of landscape, forty-two floors above the city.
              </p>
              <div className="hero-cta hero-fade pointer-events-auto mt-7 flex items-center gap-5 opacity-0">
                <MagneticButton onClick={() => scrollTo('#book')}>Book Visit</MagneticButton>
              </div>
            </div>

            <div className="hero-scroll-cue hero-fade hidden shrink-0 flex-col items-center gap-3 opacity-0 md:flex">
              <span className="text-[9px] uppercase tracking-[.34em] text-muted">
                Scroll to build
              </span>
              <span className="relative block h-16 w-px overflow-hidden bg-hairline">
                <span className="absolute inset-x-0 top-0 h-1/3 animate-[drop_2.2s_cubic-bezier(.16,1,.3,1)_infinite] bg-gold" />
              </span>
            </div>
          </div>
        </div>

        {/* ---------- construction HUD ---------- */}
        {/* Clears the reading rail at xl, where both live on the right edge. */}
        <div className="pointer-events-none absolute right-6 top-1/2 hidden -translate-y-1/2 flex-col items-end gap-6 md:right-12 md:flex xl:right-24">
          <div className="hero-hud opacity-0 text-right">
            <div className="text-[8px] uppercase tracking-[.3em] text-muted">Level</div>
            <div className="num mt-1 text-3xl leading-none text-ink">
              <span ref={level}>01</span>
              <span className="text-sm text-muted"> / {TOTAL_LEVELS}</span>
            </div>
          </div>
          <div className="hero-hud h-28 w-px bg-hairline opacity-0" />
          <div className="hero-hud opacity-0 text-right">
            <div className="text-[8px] uppercase tracking-[.3em] text-muted">Structure</div>
            <div className="num mt-1 text-3xl leading-none text-gold">
              <span ref={pctRef}>0</span>
              <span className="text-sm">%</span>
            </div>
          </div>
        </div>

        {/* Dissolve into the next chapter. */}
        <div className="hero-wash pointer-events-none absolute inset-0 bg-canvas opacity-0" />
      </div>

      <style>{`
        @keyframes drop {
          0%   { transform: translateY(-100%); }
          100% { transform: translateY(300%); }
        }
      `}</style>
    </section>
  )
}
