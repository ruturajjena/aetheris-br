import { useEffect, useRef } from 'react'
import { gsap } from '../lib/gsap'

/**
 * Golden dot + trailing ring. The ring interpolates toward the pointer on the
 * shared rAF loop; the dot tracks 1:1 so clicks still feel precise.
 *
 * Hover states are read off `data-cursor` attributes anywhere in the tree, so
 * sections opt in declaratively without this component knowing about them.
 */
export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null)
  const ring = useRef<HTMLDivElement>(null)
  const label = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return
    document.body.classList.add('has-cursor')

    const d = dot.current!
    const r = ring.current!
    const l = label.current!

    const pos = { x: innerWidth / 2, y: innerHeight / 2 }
    const ringPos = { ...pos }
    const state = { scale: 1, opacity: 1 }

    const setDX = gsap.quickSetter(d, 'x', 'px')
    const setDY = gsap.quickSetter(d, 'y', 'px')
    const setRX = gsap.quickSetter(r, 'x', 'px')
    const setRY = gsap.quickSetter(r, 'y', 'px')

    let visible = false
    const onMove = (e: PointerEvent) => {
      pos.x = e.clientX
      pos.y = e.clientY
      if (!visible) {
        visible = true
        ringPos.x = pos.x
        ringPos.y = pos.y
        gsap.to([d, r], { autoAlpha: 1, duration: 0.4 })
      }
    }

    const tick = () => {
      setDX(pos.x)
      setDY(pos.y)
      ringPos.x += (pos.x - ringPos.x) * 0.16
      ringPos.y += (pos.y - ringPos.y) * 0.16
      setRX(ringPos.x)
      setRY(ringPos.y)
    }
    gsap.ticker.add(tick)

    /* ---- hover intelligence -------------------------------------- */
    const enter = (e: Event) => {
      const el = (e.target as HTMLElement)?.closest?.('[data-cursor]') as HTMLElement | null
      if (!el) return
      const mode = el.dataset.cursor
      const text = el.dataset.cursorText

      if (text) {
        l.textContent = text
        gsap.to(l, { autoAlpha: 1, duration: 0.3 })
      }

      if (mode === 'link') {
        gsap.to(r, { scale: 2.4, borderColor: 'rgba(216,180,106,.9)', duration: 0.5, ease: 'expo.out' })
        gsap.to(d, { scale: 0, duration: 0.35 })
      } else if (mode === 'view') {
        gsap.to(r, {
          scale: 5.2,
          backgroundColor: 'rgba(216,180,106,.16)',
          borderColor: 'rgba(216,180,106,.5)',
          duration: 0.55,
          ease: 'expo.out',
        })
        gsap.to(d, { scale: 0, duration: 0.35 })
      } else {
        gsap.to(r, { scale: 1.7, duration: 0.5, ease: 'expo.out' })
      }
      state.scale = 1
    }

    const leave = () => {
      gsap.to(r, {
        scale: 1,
        backgroundColor: 'rgba(216,180,106,0)',
        borderColor: 'rgba(17,17,17,.28)',
        duration: 0.5,
        ease: 'expo.out',
      })
      gsap.to(d, { scale: 1, duration: 0.35 })
      gsap.to(l, { autoAlpha: 0, duration: 0.2 })
    }

    const onDown = () => gsap.to(r, { scale: 0.8, duration: 0.2 })
    const onUp = () => gsap.to(r, { scale: 1, duration: 0.3 })

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onDown)
    window.addEventListener('pointerup', onUp)
    document.addEventListener('pointerover', enter, true)
    document.addEventListener('pointerout', leave, true)

    return () => {
      gsap.ticker.remove(tick)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      document.removeEventListener('pointerover', enter, true)
      document.removeEventListener('pointerout', leave, true)
      document.body.classList.remove('has-cursor')
    }
  }, [])

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[9999] hidden md:block">
      <div
        ref={ring}
        className="absolute -left-5 -top-5 h-10 w-10 rounded-full border opacity-0"
        style={{ borderColor: 'rgba(17,17,17,.28)', backgroundColor: 'rgba(216,180,106,0)' }}
      >
        <span
          ref={label}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-[7px] font-medium uppercase tracking-[.2em] text-ink opacity-0"
        />
      </div>
      <div className="absolute -left-[3px] -top-[3px] h-1.5 w-1.5 rounded-full bg-gold opacity-0" ref={dot} />
    </div>
  )
}
