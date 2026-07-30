import { useEffect, useRef, useState } from 'react'
import {
  Building2,
  Briefcase,
  Trees,
  Zap,
  Flower2,
  Clapperboard,
  PawPrint,
  ShieldCheck,
} from 'lucide-react'
import { gsap, prefersReducedMotion } from '../lib/gsap'
import { useVideoScrubber } from '../lib/useVideoScrubber'
import { useTextReveal } from '../lib/anim'
import { asset } from '../lib/paths'

const CARDS = [
  { icon: Building2, title: 'Clubhouse', body: '2,400 m² of shared living — library, bar, private dining.', tag: 'Central' },
  { icon: Briefcase, title: 'Business Lounge', body: 'Six bookable rooms, fibre throughout, concierge print.', tag: 'Work' },
  { icon: Trees, title: 'Walking Trails', body: '1.8 km of shaded loop through three acres of planting.', tag: 'Outdoor' },
  { icon: Zap, title: 'EV Charging', body: '64 bays, 22 kW, allocated by residence and billed monthly.', tag: 'Mobility' },
  { icon: Flower2, title: 'Yoga Deck', body: 'East-facing timber platform above the water garden.', tag: 'Wellness' },
  { icon: Clapperboard, title: 'Mini Theatre', body: '4K laser projection, Dolby Atmos, thirty reclining seats.', tag: 'Leisure' },
  { icon: PawPrint, title: 'Pet Park', body: 'Fenced run, wash station and a shaded agility lawn.', tag: 'Family' },
  { icon: ShieldCheck, title: 'Security', body: 'Triple-gate protocol, ANPR and 24×7 monitored perimeter.', tag: 'Assured' },
]

/**
 * The facilities clip flies over the estate in five even beats. Naming them
 * lets the panel caption say what is actually on screen at any scroll position.
 */
const PLACES = [
  { name: 'The Grounds', note: 'Three acres, kept.' },
  { name: 'Walking Trails', note: '1.8 km of shaded loop.' },
  { name: 'The Amphitheatre', note: 'Two hundred seats, open sky.' },
  { name: 'Mini Theatre', note: 'Atmos, thirty recliners.' },
  { name: 'The Gatehouse', note: 'Triple-gate, monitored.' },
]

export default function Community() {
  const section = useRef<HTMLDivElement>(null)
  const row = useRef<HTMLDivElement>(null)
  const panel = useRef<HTMLDivElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const heading = useRef<HTMLHeadingElement>(null)
  const video = useRef<HTMLVideoElement>(null)
  const caption = useRef<HTMLDivElement>(null)
  const [place, setPlace] = useState(0)

  const scrubber = useVideoScrubber(video, { lerp: 0.12 })

  useTextReveal(heading, { start: 'top 80%' })

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (prefersReducedMotion()) return

      const el = track.current!
      const rowEl = row.current!

      // The panel holds its ground, so the rail only has to travel far enough
      // to bring its own right edge to the viewport edge.
      const distance = () =>
        Math.max(0, el.scrollWidth + el.offsetLeft - rowEl.clientWidth + 48)

      const tween = gsap.to(el, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: section.current,
          start: 'top top',
          end: () => '+=' + distance(),
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            scrubber.current.seek(self.progress)
            setPlace(
              Math.min(PLACES.length - 1, Math.floor(self.progress * PLACES.length)),
            )
          },
        },
      })

      // Cards straighten and settle as they cross the middle of the frame.
      gsap.utils.toArray<HTMLElement>('.co-card').forEach((card, i) => {
        gsap.fromTo(
          card,
          { rotate: i % 2 ? 2.2 : -2.2, y: i % 2 ? 26 : -14, opacity: 0.55 },
          {
            rotate: 0,
            y: 0,
            opacity: 1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: card,
              containerAnimation: tween,
              start: 'left 92%',
              end: 'left 46%',
              scrub: true,
            },
          },
        )
      })
    }, section)

    return () => ctx.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* Each new place writes itself on, letter by letter. */
  useEffect(() => {
    if (!caption.current || prefersReducedMotion()) return
    const letters = caption.current.querySelectorAll('.cap-char')
    const note = caption.current.querySelector('.cap-note')

    const tl = gsap.timeline()
    tl.fromTo(
      letters,
      { yPercent: 110, opacity: 0 },
      { yPercent: 0, opacity: 1, duration: 0.75, stagger: 0.022, ease: 'expo.out' },
    ).fromTo(
      note,
      { opacity: 0, y: 8 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
      0.18,
    )
    return () => {
      tl.kill()
    }
  }, [place])

  const current = PLACES[place]

  return (
    <section id="community" className="relative bg-canvas">
      <div ref={section} className="relative h-[100svh] overflow-hidden">
        <div className="flex h-full flex-col justify-center">
          <div className="mx-auto w-full max-w-[1600px] shrink-0 px-6 pt-24 md:px-12 md:pt-28">
            <div className="eyebrow mb-5 flex items-center gap-3">
              <span className="h-px w-8 bg-gold" />
              04 — Community Living
            </div>
            <div className="flex flex-wrap items-end justify-between gap-6">
              <h2 ref={heading} className="t-h1 max-w-[14ch] opacity-0">
                A neighbourhood, vertically arranged.
              </h2>
              <p className="t-body max-w-xs pb-2">
                Eight shared houses across three acres — drawn so the community meets by
                accident, not by appointment.
              </p>
            </div>
          </div>

          {/* Panel + rail share one row; only the rail translates. */}
          <div
            ref={row}
            className="relative mt-8 flex h-[clamp(300px,42vh,460px)] shrink-0 items-stretch gap-4 px-6 md:mt-12 md:gap-6 md:px-12"
          >
            {/* ---------- the estate, flown through ---------- */}
            <div
              ref={panel}
              className="relative w-[76vw] shrink-0 overflow-hidden rounded-[2px] shadow-luxe sm:w-[340px] lg:w-[420px]"
            >
              <video
                ref={video}
                src={asset('/media/facilities.mp4')}
                poster={asset('/media/facilities-poster.jpg')}
                muted
                playsInline
                preload="metadata"
                aria-hidden
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-black/25" />

              <div className="absolute inset-x-5 top-5 flex items-center justify-between">
                <span className="text-[9px] uppercase tracking-[.3em] text-white/70">
                  The grounds
                </span>
                <span className="num text-[10px] text-white/70">
                  0{place + 1} / 0{PLACES.length}
                </span>
              </div>

              {/* caption — rewrites itself at every beat of the flyover */}
              <div ref={caption} key={place} className="absolute inset-x-5 bottom-5">
                <h3 className="font-display text-[clamp(1.5rem,2.4vw,2.1rem)] leading-tight text-white">
                  {current.name.split('').map((c, i) => (
                    <span key={i} className="inline-block overflow-hidden align-bottom">
                      <span className="cap-char inline-block">
                        {c === ' ' ? ' ' : c}
                      </span>
                    </span>
                  ))}
                </h3>
                <p className="cap-note mt-1.5 text-[11px] text-white/65">{current.note}</p>

                <div className="mt-4 flex gap-1.5">
                  {PLACES.map((_, i) => (
                    <span
                      key={i}
                      className="h-px flex-1 transition-colors duration-500"
                      style={{
                        background: i <= place ? '#D8B46A' : 'rgba(255,255,255,.3)',
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* ---------- the rail ---------- */}
            <div
              ref={track}
              className="flex shrink-0 items-stretch gap-4 will-change-transform md:gap-6"
            >
              {CARDS.map(({ icon: Icon, title, body, tag }, i) => (
                <article
                  key={title}
                  data-cursor="link"
                  className="co-card group relative flex h-full w-[68vw] shrink-0 flex-col justify-between overflow-hidden rounded-[2px] border border-hairline bg-card p-7 transition-[transform,box-shadow,border-color] duration-700 ease-[cubic-bezier(.16,1,.3,1)] hover:-translate-y-2 hover:border-gold/50 hover:shadow-luxe sm:w-[300px] lg:w-[330px] md:p-8"
                >
                  <span className="pointer-events-none absolute inset-x-0 -top-16 h-32 bg-gold/0 blur-3xl transition-colors duration-700 group-hover:bg-gold/20" />

                  <div className="relative flex items-start justify-between">
                    <Icon
                      size={22}
                      strokeWidth={1}
                      className="text-ink transition-colors duration-500 group-hover:text-gold"
                    />
                    <span className="num text-[10px] text-muted">0{i + 1}</span>
                  </div>

                  <div className="relative">
                    <div className="text-[9px] uppercase tracking-[.26em] text-gold">{tag}</div>
                    <h3 className="t-h3 mt-3">{title}</h3>
                    <p className="t-body mt-3 !text-[13px] !leading-relaxed">{body}</p>
                    <div className="mt-6 h-px w-full origin-left scale-x-0 bg-gold transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-x-100" />
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
