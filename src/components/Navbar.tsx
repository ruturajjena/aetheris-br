import { useEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger } from '../lib/gsap'
import { scrollTo } from '../lib/useLenis'
import MagneticButton from './MagneticButton'

const LINKS = [
  { label: 'Residences', href: '#interiors' },
  { label: 'Amenities', href: '#amenities' },
  { label: 'Community', href: '#community' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'Location', href: '#location' },
]

export default function Navbar() {
  const bar = useRef<HTMLElement>(null)
  const sheet = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)

  /* Solid glass once the hero has handed off. */
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set('.nav-skin', { autoAlpha: 0 })
      // Queried outside the selector scope on purpose — the context is scoped
      // to the header, and #hero lives elsewhere in the document.
      ScrollTrigger.create({
        trigger: document.getElementById('hero') ?? undefined,
        start: 'bottom 90%',
        onEnter: () => gsap.to('.nav-skin', { autoAlpha: 1, duration: 0.6 }),
        onLeaveBack: () => gsap.to('.nav-skin', { autoAlpha: 0, duration: 0.4 }),
      })
    }, bar)
    return () => ctx.revert()
  }, [])

  /* Entrance after the preloader lifts. */
  useEffect(() => {
    gsap.fromTo(
      bar.current,
      { y: -40, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 1.4, delay: 0.35, ease: 'expo.out' },
    )
  }, [])

  useEffect(() => {
    if (!sheet.current) return
    if (open) {
      gsap.set(sheet.current, { display: 'flex' })
      gsap.fromTo(
        sheet.current,
        { clipPath: 'inset(0 0 100% 0)' },
        { clipPath: 'inset(0 0 0% 0)', duration: 0.8, ease: 'expo.inOut' },
      )
      gsap.fromTo(
        '.sheet-link',
        { y: 40, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.8, stagger: 0.06, delay: 0.2, ease: 'expo.out' },
      )
    } else {
      gsap.to(sheet.current, {
        clipPath: 'inset(0 0 100% 0)',
        duration: 0.6,
        ease: 'expo.inOut',
        onComplete: () => gsap.set(sheet.current, { display: 'none' }),
      })
    }
  }, [open])

  const go = (href: string) => {
    setOpen(false)
    setTimeout(() => scrollTo(href, -20), open ? 400 : 0)
  }

  return (
    <>
      <header
        ref={bar}
        className="fixed inset-x-0 top-0 z-[500] opacity-0"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="nav-skin pointer-events-none absolute inset-0 border-b border-hairline-soft bg-[rgba(250,250,248,.72)] backdrop-blur-xl" />

        <div className="relative mx-auto flex max-w-[1600px] items-center justify-between px-6 py-5 md:px-12 md:py-6">
          <button
            onClick={() => scrollTo(0)}
            data-cursor="link"
            className="group flex items-baseline gap-2.5"
            aria-label="AETHERIS — back to top"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-gold transition-transform duration-500 group-hover:scale-150" />
            <span className="font-display text-[13px] tracking-[.42em] text-ink">AETHERIS</span>
          </button>

          <nav className="hidden items-center gap-9 lg:flex">
            {LINKS.map((l) => (
              <button
                key={l.href}
                onClick={() => go(l.href)}
                data-cursor="link"
                className="group relative text-[10px] font-medium uppercase tracking-[.26em] text-muted transition-colors duration-400 hover:text-ink"
              >
                {l.label}
                <span className="absolute -bottom-1.5 left-0 h-px w-full origin-right scale-x-0 bg-gold transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] group-hover:origin-left group-hover:scale-x-100" />
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <MagneticButton
              variant="outline"
              className="!hidden !px-6 !py-3 sm:!inline-flex"
              strength={0.3}
              onClick={() => scrollTo('#book')}
            >
              Book Visit
            </MagneticButton>

            <button
              onClick={() => setOpen((v) => !v)}
              data-cursor="link"
              aria-label={open ? 'Close menu' : 'Open menu'}
              className="relative z-10 flex h-10 w-10 flex-col items-center justify-center gap-[5px] lg:hidden"
            >
              <span
                className="h-px w-5 bg-ink transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)]"
                style={{ transform: open ? 'translateY(3px) rotate(45deg)' : 'none' }}
              />
              <span
                className="h-px w-5 bg-ink transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)]"
                style={{ transform: open ? 'translateY(-3px) rotate(-45deg)' : 'none' }}
              />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile sheet */}
      <div
        ref={sheet}
        className="fixed inset-0 z-[499] hidden flex-col justify-center bg-canvas px-6"
        style={{ display: 'none' }}
      >
        <nav className="flex flex-col gap-1">
          {LINKS.map((l, i) => (
            <button
              key={l.href}
              onClick={() => go(l.href)}
              className="sheet-link group flex items-baseline gap-5 border-b border-hairline-soft py-5 text-left"
            >
              <span className="num text-[10px] text-gold">0{i + 1}</span>
              <span className="t-h3 transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] group-hover:translate-x-2">
                {l.label}
              </span>
            </button>
          ))}
        </nav>
        <button
          onClick={() => go('#book')}
          className="sheet-link mt-10 w-full rounded-full bg-ink py-5 text-[11px] uppercase tracking-[.24em] text-white"
        >
          Book a Private Tour
        </button>
      </div>
    </>
  )
}
