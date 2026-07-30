import Lenis from 'lenis'
import { useEffect } from 'react'
import { gsap, ScrollTrigger, prefersReducedMotion } from './gsap'

let lenis: Lenis | null = null

/** Programmatic scrolling that stays in sync with the smooth-scroll engine. */
export const scrollTo = (target: string | number | HTMLElement, offset = 0) => {
  if (lenis) lenis.scrollTo(target, { offset, duration: 1.6 })
  else if (typeof target === 'string') {
    document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' })
  }
}

export const stopScroll = () => lenis?.stop()
export const startScroll = () => lenis?.start()

/**
 * Lenis <-> ScrollTrigger, driven by a single rAF loop (gsap.ticker).
 * Two independent rAF loops is the classic source of scroll jitter — this
 * keeps smoothing, ScrollTrigger updates and tweens on the same frame.
 */
export function useLenis() {
  useEffect(() => {
    const reduced = prefersReducedMotion()

    lenis = new Lenis({
      duration: reduced ? 0 : 1.15,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: !reduced,
      wheelMultiplier: 1,
      touchMultiplier: 1.6,
      syncTouch: false,
      autoRaf: false,
    })

    const onScroll = () => ScrollTrigger.update()
    lenis.on('scroll', onScroll)

    const raf = (time: number) => lenis?.raf(time * 1000)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)

    ScrollTrigger.refresh()

    return () => {
      gsap.ticker.remove(raf)
      lenis?.destroy()
      lenis = null
    }
  }, [])
}
