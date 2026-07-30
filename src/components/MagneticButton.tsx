import { useEffect, useRef } from 'react'
import { gsap } from '../lib/gsap'

interface Props {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'gold' | 'outline' | 'ghost'
  className?: string
  strength?: number
  ariaLabel?: string
}

/**
 * Button that leans toward the pointer. The label counter-moves at a lower
 * amplitude, which reads as depth rather than a sliding block.
 */
export default function MagneticButton({
  children,
  onClick,
  variant = 'gold',
  className = '',
  strength = 0.35,
  ariaLabel,
}: Props) {
  const wrap = useRef<HTMLButtonElement>(null)
  const label = useRef<HTMLSpanElement>(null)
  const glow = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = wrap.current
    if (!el || !window.matchMedia('(pointer: fine)').matches) return

    const xTo = gsap.quickTo(el, 'x', { duration: 0.7, ease: 'elastic.out(1, 0.4)' })
    const yTo = gsap.quickTo(el, 'y', { duration: 0.7, ease: 'elastic.out(1, 0.4)' })
    const lxTo = gsap.quickTo(label.current, 'x', { duration: 0.8, ease: 'elastic.out(1, 0.4)' })
    const lyTo = gsap.quickTo(label.current, 'y', { duration: 0.8, ease: 'elastic.out(1, 0.4)' })

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      const dx = e.clientX - (r.left + r.width / 2)
      const dy = e.clientY - (r.top + r.height / 2)
      xTo(dx * strength)
      yTo(dy * strength * 1.1)
      lxTo(dx * strength * 0.32)
      lyTo(dy * strength * 0.32)
      if (glow.current) {
        gsap.set(glow.current, {
          '--gx': `${((e.clientX - r.left) / r.width) * 100}%`,
          '--gy': `${((e.clientY - r.top) / r.height) * 100}%`,
        })
      }
    }
    const onLeave = () => {
      xTo(0)
      yTo(0)
      lxTo(0)
      lyTo(0)
    }

    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerleave', onLeave)
    return () => {
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
    }
  }, [strength])

  const base =
    'group relative inline-flex items-center justify-center overflow-hidden rounded-full px-8 py-4 text-[11px] font-medium uppercase tracking-[.22em] transition-colors duration-500 will-change-transform'

  const styles = {
    gold: 'bg-ink text-white hover:bg-gold',
    outline: 'border border-hairline text-ink hover:border-gold hover:text-gold bg-transparent',
    ghost: 'text-ink hover:text-gold',
  }[variant]

  return (
    <button
      ref={wrap}
      onClick={onClick}
      aria-label={ariaLabel}
      data-cursor="link"
      className={`${base} ${styles} ${className}`}
    >
      <span
        ref={glow}
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            'radial-gradient(120px circle at var(--gx,50%) var(--gy,50%), rgba(216,180,106,.55), transparent 65%)',
        }}
      />
      <span ref={label} className="relative z-10 flex items-center gap-2.5">
        {children}
      </span>
    </button>
  )
}
