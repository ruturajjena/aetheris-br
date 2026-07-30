import { useEffect } from 'react'
import SplitType from 'split-type'
import { gsap, ScrollTrigger, prefersReducedMotion } from './gsap'

/* ------------------------------------------------------------------ */
/*  Line-mask splitting                                                */
/* ------------------------------------------------------------------ */

/**
 * Splits an element into lines and wraps each in an overflow-hidden mask so
 * the line can slide up from behind its own baseline.
 */
function buildLines(el: HTMLElement): HTMLElement[] {
  const split = new SplitType(el, { types: 'lines', tagName: 'span' })
  const lines = (split.lines ?? []) as HTMLElement[]

  lines.forEach((line) => {
    const mask = document.createElement('span')
    mask.className = 'line-mask'
    line.parentNode?.insertBefore(mask, line)
    mask.appendChild(line)
    line.style.display = 'block'
    line.style.willChange = 'transform'
  })

  return lines
}

function revertLines(el: HTMLElement) {
  el.querySelectorAll('.line-mask').forEach((mask) => {
    const line = mask.firstElementChild
    if (line) while (line.firstChild) mask.parentNode?.insertBefore(line.firstChild, mask)
    mask.remove()
  })
  el.normalize()
}

interface TextRevealOptions {
  start?: string
  stagger?: number
  duration?: number
  delay?: number
  /** Skip the ScrollTrigger and expose a timeline the caller drives instead. */
  paused?: boolean
  enabled?: boolean
}

/**
 * Masked line-by-line reveal. Re-splits on width change (font reflow would
 * otherwise leave the lines broken at the old measurements).
 */
export function useTextReveal(
  ref: React.RefObject<HTMLElement | null>,
  {
    start = 'top 82%',
    stagger = 0.09,
    duration = 1.15,
    delay = 0,
    enabled = true,
  }: TextRevealOptions = {},
) {
  useEffect(() => {
    const el = ref.current
    if (!el || !enabled) return

    if (prefersReducedMotion()) {
      gsap.set(el, { opacity: 1 })
      return
    }

    let width = window.innerWidth
    let ctx: gsap.Context

    const build = () => {
      const lines = buildLines(el)
      el.style.opacity = '1'

      ctx = gsap.context(() => {
        gsap.fromTo(
          lines,
          { yPercent: 115 },
          {
            yPercent: 0,
            duration,
            delay,
            stagger,
            ease: 'expo.out',
            scrollTrigger: { trigger: el, start, once: true },
          },
        )
      }, el)
    }

    // Fonts must be settled or the line boxes are measured against a fallback.
    const ready = document.fonts?.ready ?? Promise.resolve()
    let alive = true
    ready.then(() => alive && build())

    const onResize = () => {
      if (Math.abs(window.innerWidth - width) < 60) return
      width = window.innerWidth
      ctx?.revert()
      revertLines(el)
      build()
      ScrollTrigger.refresh()
    }
    const debounced = debounce(onResize, 250)
    window.addEventListener('resize', debounced)

    return () => {
      alive = false
      window.removeEventListener('resize', debounced)
      ctx?.revert()
      revertLines(el)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled])
}

/* ------------------------------------------------------------------ */
/*  Character-level kinetic reveal (hero headline)                     */
/* ------------------------------------------------------------------ */

export function splitChars(el: HTMLElement) {
  const split = new SplitType(el, { types: 'words,chars', tagName: 'span' })
  ;(split.words ?? []).forEach((w) => {
    ;(w as HTMLElement).style.overflow = 'hidden'
    ;(w as HTMLElement).style.display = 'inline-block'
    ;(w as HTMLElement).style.paddingBottom = '0.12em'
    ;(w as HTMLElement).style.marginBottom = '-0.12em'
  })
  ;(split.chars ?? []).forEach((c) => {
    ;(c as HTMLElement).style.display = 'inline-block'
    ;(c as HTMLElement).style.willChange = 'transform'
  })
  return (split.chars ?? []) as HTMLElement[]
}

/* ------------------------------------------------------------------ */
/*  Generic batched reveal for [data-reveal] descendants               */
/* ------------------------------------------------------------------ */

interface BatchOptions {
  start?: string
  y?: number
  stagger?: number
  blur?: boolean
  scope?: React.RefObject<HTMLElement | null>
}

export function useRevealBatch({
  start = 'top 86%',
  y = 44,
  stagger = 0.1,
  blur = true,
  scope,
}: BatchOptions = {}) {
  useEffect(() => {
    const root = scope?.current ?? document.body
    const items = gsap.utils.toArray<HTMLElement>('[data-reveal]', root)
    if (!items.length) return

    if (prefersReducedMotion()) {
      gsap.set(items, { opacity: 1, y: 0, filter: 'none' })
      return
    }

    const ctx = gsap.context(() => {
      gsap.set(items, { opacity: 0, y, filter: blur ? 'blur(8px)' : 'none' })
      ScrollTrigger.batch(items, {
        start,
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, {
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            duration: 1.25,
            ease: 'expo.out',
            stagger,
            overwrite: true,
            onComplete: () => gsap.set(batch, { clearProps: 'filter,willChange' }),
          }),
      })
    }, root)

    return () => ctx.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}

/* ------------------------------------------------------------------ */

export function debounce<T extends (...a: never[]) => void>(fn: T, wait: number) {
  let t: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(t)
    t = setTimeout(() => fn(...args), wait)
  }
}
