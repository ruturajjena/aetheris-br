import { useEffect, useRef } from 'react'
import { gsap, prefersReducedMotion } from '../lib/gsap'
import { useTextReveal } from '../lib/anim'
import { asset } from '../lib/paths'

const PLATES = [
  {
    src: asset('/img/tower.jpg'),
    alt: 'The tower seen from the north-east approach',
    caption: 'The Tower',
    meta: '42 floors · Elevation study',
    ratio: 'aspect-[3/4]',
    grid: 'md:col-span-5 md:col-start-1',
    depth: 1.1,
  },
  {
    src: asset('/img/pool.jpg'),
    alt: 'Infinity pool overlooking the valley at dusk',
    caption: 'The Infinity Edge',
    meta: 'Level 04 · Open deck',
    ratio: 'aspect-[16/10]',
    grid: 'md:col-span-6 md:col-start-7 md:mt-[18vh]',
    depth: 1.8,
  },
  {
    src: asset('/img/clubhouse.jpg'),
    alt: 'Clubhouse pavilion lit from within at blue hour',
    caption: 'The Clubhouse',
    meta: 'Blue hour · Garden elevation',
    ratio: 'aspect-[16/9]',
    grid: 'md:col-span-7 md:col-start-2 md:mt-[10vh]',
    depth: 0.7,
  },
  {
    src: asset('/img/living-room.jpg'),
    alt: 'Living room in white marble opening to the terrace',
    caption: 'The Living Room',
    meta: 'Residence 3402 · Interior',
    ratio: 'aspect-[4/3]',
    grid: 'md:col-span-4 md:col-start-9 md:mt-[6vh]',
    depth: 1.5,
  },
]

export default function Gallery() {
  const section = useRef<HTMLElement>(null)
  const heading = useRef<HTMLHeadingElement>(null)

  useTextReveal(heading, { start: 'top 84%' })

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (prefersReducedMotion()) return

      gsap.utils.toArray<HTMLElement>('.plate').forEach((el) => {
        const depth = Number(el.dataset.depth)
        const img = el.querySelector('img')!

        // Mask reveal: the frame opens, the image un-scales behind it.
        gsap
          .timeline({ scrollTrigger: { trigger: el, start: 'top 88%', once: true } })
          .fromTo(
            el,
            { clipPath: 'inset(14% 8% 14% 8%)', opacity: 0 },
            {
              clipPath: 'inset(0% 0% 0% 0%)',
              opacity: 1,
              duration: 1.6,
              ease: 'expo.out',
            },
          )
          .fromTo(img, { scale: 1.3 }, { scale: 1, duration: 1.9, ease: 'expo.out' }, 0)
          .fromTo(
            el.querySelector('.plate-cap'),
            { opacity: 0, y: 18 },
            { opacity: 1, y: 0, duration: 1, ease: 'expo.out' },
            0.5,
          )

        // Drift at its own rate.
        gsap.fromTo(
          el,
          { y: depth * 60 },
          {
            y: depth * -60,
            ease: 'none',
            scrollTrigger: {
              trigger: el,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          },
        )
      })
    }, section)

    return () => ctx.revert()
  }, [])

  return (
    <section id="gallery" ref={section} className="relative bg-canvas py-[14vh] md:py-[18vh]">
      <div className="mx-auto max-w-[1600px] px-6 md:px-12">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="eyebrow mb-5 flex items-center gap-3">
              <span className="h-px w-8 bg-gold" />
              06 — Gallery
            </div>
            <h2 ref={heading} className="t-h1 max-w-[12ch] opacity-0">
              Look closer.
            </h2>
          </div>
          <p className="t-body max-w-xs pb-3">
            Four frames from the drawing set — the tower, the water, the pavilion and the room
            you will actually live in.
          </p>
        </div>

        <div className="mt-[10vh] grid grid-cols-1 gap-6 md:grid-cols-12 md:gap-8">
          {PLATES.map(({ src, alt, caption, meta, ratio, grid, depth }, i) => (
            <figure
              key={src}
              data-depth={depth}
              data-cursor="view"
              data-cursor-text="View"
              className={`plate group relative will-change-transform ${grid}`}
            >
              <div className="overflow-hidden rounded-[3px] shadow-luxe">
                <img
                  src={src}
                  alt={alt}
                  loading="lazy"
                  decoding="async"
                  className={`w-full object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.06] ${ratio}`}
                />
                <div className="pointer-events-none absolute inset-0 rounded-[3px] ring-1 ring-inset ring-black/5 transition-colors duration-700 group-hover:ring-gold/40" />
              </div>
              <figcaption className="plate-cap mt-4 flex items-baseline justify-between gap-4">
                <span className="text-[11px] uppercase tracking-[.26em] text-ink">{caption}</span>
                <span className="num text-[10px] text-muted">
                  0{i + 1} — {meta}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
