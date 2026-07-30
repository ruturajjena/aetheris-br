import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/* One global default so every reveal in the site shares the same "luxe" feel. */
gsap.defaults({ ease: 'power3.out', duration: 1.2 })

export { gsap, ScrollTrigger }

export const EASE = {
  luxe: 'power3.out',
  soft: 'power2.out',
  expo: 'expo.out',
} as const

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches
