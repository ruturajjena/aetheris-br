import { useEffect, useRef } from 'react'
import { Mic, Home, Lightbulb, Thermometer } from 'lucide-react'
import { gsap, ScrollTrigger, prefersReducedMotion } from '../lib/gsap'
import { useVideoScrubber } from '../lib/useVideoScrubber'
import { useTextReveal } from '../lib/anim'
import { asset } from '../lib/paths'

const SMART = [
  { icon: Mic, name: 'Alexa', detail: 'Voice-native across every room' },
  { icon: Home, name: 'Google Home', detail: 'One tap for the whole residence' },
  { icon: Lightbulb, name: 'Smart Lighting', detail: 'Circadian scenes, dusk to dawn' },
  { icon: Thermometer, name: 'Climate Control', detail: 'Room-by-room, learned over time' },
]

export default function Interiors() {
  const section = useRef<HTMLElement>(null)
  const video = useRef<HTMLVideoElement>(null)
  const heading = useRef<HTMLHeadingElement>(null)
  const scrubber = useVideoScrubber(video, { lerp: 0.12 })

  useTextReveal(heading, { start: 'top 78%', stagger: 0.1 })

  useEffect(() => {
    const ctx = gsap.context(() => {
      const reduced = prefersReducedMotion()

      // The walkthrough advances with the reader, not on its own clock.
      ScrollTrigger.create({
        trigger: section.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        onUpdate: (self) => scrubber.current.seek(self.progress),
      })

      if (reduced) {
        gsap.set('[data-float], .smart-card, .int-block', { opacity: 1, y: 0 })
        return
      }

      // Floating plates drift at their own rate — depth without a 3D scene.
      gsap.utils.toArray<HTMLElement>('[data-float]').forEach((el) => {
        const depth = Number(el.dataset.float)
        gsap.fromTo(
          el,
          { yPercent: depth * 8 },
          {
            yPercent: depth * -8,
            ease: 'none',
            scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
          },
        )
        gsap.fromTo(
          el,
          { opacity: 0, scale: 0.94, filter: 'blur(14px)' },
          {
            opacity: 1,
            scale: 1,
            filter: 'blur(0px)',
            duration: 1.5,
            ease: 'expo.out',
            scrollTrigger: { trigger: el, start: 'top 85%', once: true },
          },
        )
      })

      gsap.utils.toArray<HTMLElement>('.int-block').forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 60 },
          {
            opacity: 1,
            y: 0,
            duration: 1.3,
            ease: 'expo.out',
            scrollTrigger: { trigger: el, start: 'top 82%', once: true },
          },
        )
      })

      gsap.fromTo(
        '.smart-card',
        { opacity: 0, y: 70, rotateX: -12 },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          duration: 1.2,
          stagger: 0.11,
          ease: 'expo.out',
          scrollTrigger: { trigger: '.smart-grid', start: 'top 84%', once: true },
        },
      )
    }, section)

    return () => ctx.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <section id="interiors" ref={section} className="relative bg-canvas">
      <div className="mx-auto grid max-w-[1600px] grid-cols-1 gap-0 px-6 md:grid-cols-2 md:px-12">
        {/* ---------------- sticky media ---------------- */}
        <div className="relative md:h-full">
          <div className="sticky top-0 flex h-[100svh] items-center py-[8vh] md:pr-14">
            <div className="relative w-full overflow-hidden rounded-[2px] shadow-luxe">
              <video
                ref={video}
                src={asset('/media/interiors.mp4')}
                poster={asset('/media/interiors-poster.jpg')}
                muted
                playsInline
                preload="metadata"
                aria-hidden
                className="aspect-[3/4] w-full object-cover md:aspect-[4/5]"
              />
              <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/25" />

              <div className="pointer-events-none absolute bottom-5 left-5 right-5 flex items-end justify-between">
                <span className="glass rounded-full px-4 py-2 text-[9px] uppercase tracking-[.26em] text-ink">
                  Residence 3402 · Walkthrough
                </span>
                <span className="num glass rounded-full px-3 py-2 text-[10px] text-ink">
                  4 BHK
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ---------------- scrolling narrative ---------------- */}
        <div className="relative pb-[14vh] pt-[16vh] md:pl-14 md:pt-[24vh]">
          <div className="int-block">
            <div className="eyebrow mb-6 flex items-center gap-3">
              <span className="h-px w-8 bg-gold" />
              02 — The Residences
            </div>
            <h2 ref={heading} className="t-h1 opacity-0">
              Crafted Around Modern Living.
            </h2>
            <p className="t-body mt-8 max-w-md">
              Every plan begins with light. Floor-to-ceiling glazing, honed Italian marble and a
              north-facing terrace on every level — drawn so the city arrives quietly, and stays
              where you want it.
            </p>
          </div>

          {/* floating plate — living room */}
          <div className="relative mt-[18vh]" data-float="1">
            <figure className="overflow-hidden rounded-[2px] shadow-luxe md:-ml-[18%] md:w-[118%]">
              <img
                src={asset('/img/living-room.jpg')}
                alt="Living room finished in white marble with full-height glazing"
                loading="lazy"
                decoding="async"
                className="aspect-[16/10] w-full object-cover"
              />
            </figure>
            <figcaption className="mt-4 flex items-baseline justify-between md:-ml-[18%]">
              <span className="text-[10px] uppercase tracking-[.26em] text-muted">
                The Living Room
              </span>
              <span className="num text-[10px] text-muted">01 / 04</span>
            </figcaption>
          </div>

          <div className="int-block mt-[16vh] max-w-md">
            <h3 className="t-h3">Bedroom Detail</h3>
            <p className="t-body mt-5">
              Acoustic separation between every bedroom wall. Blackout drapery recessed into the
              ceiling plane. Warm-dimming light that follows the hour rather than the switch.
            </p>
            <dl className="mt-8 grid grid-cols-2 gap-x-8 gap-y-6">
              {[
                ['Ceiling', '3.2 m'],
                ['Glazing', 'Low-E triple'],
                ['Flooring', 'Statuario'],
                ['Orientation', 'North-east'],
              ].map(([k, v]) => (
                <div key={k} className="border-t border-hairline-soft pt-3">
                  <dt className="text-[9px] uppercase tracking-[.24em] text-muted">{k}</dt>
                  <dd className="num mt-1.5 text-lg text-ink">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* smart home */}
          <div className="smart-grid mt-[16vh]">
            <div className="int-block mb-9">
              <div className="eyebrow mb-4">The residence, listening</div>
              <h3 className="t-h3 max-w-sm">A home that already knows the hour.</h3>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2" style={{ perspective: 1200 }}>
              {SMART.map(({ icon: Icon, name, detail }) => (
                <div
                  key={name}
                  data-cursor="link"
                  className="smart-card group glass relative overflow-hidden rounded-[2px] p-6 transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)] hover:-translate-y-1.5"
                >
                  <span className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gold/0 blur-2xl transition-colors duration-700 group-hover:bg-gold/25" />
                  <Icon
                    size={20}
                    strokeWidth={1.1}
                    className="text-ink transition-colors duration-500 group-hover:text-gold"
                  />
                  <div className="mt-8 text-[13px] font-medium tracking-wide text-ink">{name}</div>
                  <div className="mt-1.5 text-[11px] leading-relaxed text-muted">{detail}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
