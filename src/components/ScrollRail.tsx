import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '../lib/gsap'

const MARKS = [
  { label: 'Tower', href: '#hero' },
  { label: 'Residences', href: '#interiors' },
  { label: 'Lifestyle', href: '#amenities' },
  { label: 'Community', href: '#community' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'Plans', href: '#plans' },
  { label: 'Location', href: '#location' },
  { label: 'Enquire', href: '#book' },
]

/** Hairline reading position, right edge. Purely ambient — never in the way. */
export default function ScrollRail() {
  const fill = useRef<HTMLDivElement>(null)
  const label = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const setScale = gsap.quickSetter(fill.current, 'scaleY')
    let last = ''

    const st = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => {
        setScale(self.progress)

        // Name the chapter the reader is standing in.
        const y = window.scrollY + window.innerHeight * 0.45
        let current = MARKS[0].label
        for (const m of MARKS) {
          const el = document.querySelector(m.href) as HTMLElement | null
          if (el && el.offsetTop <= y) current = m.label
        }
        if (current !== last && label.current) {
          last = current
          label.current.textContent = current
        }
      },
    })

    return () => st.kill()
  }, [])

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed right-6 top-1/2 z-[400] hidden -translate-y-1/2 flex-col items-center gap-4 xl:flex"
    >
      <span
        ref={label}
        className="text-[9px] uppercase tracking-[.28em] text-muted"
        style={{ writingMode: 'vertical-rl' }}
      >
        Tower
      </span>
      <span className="relative block h-40 w-px bg-hairline">
        <span
          ref={fill}
          className="absolute inset-0 origin-top bg-gold"
          style={{ transform: 'scaleY(0)' }}
        />
      </span>
    </div>
  )
}
