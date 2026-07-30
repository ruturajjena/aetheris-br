import { useEffect, useRef } from 'react'

export interface Scrubber {
  /** Feed a 0..1 scroll progress. Cheap — safe to call every scroll event. */
  seek: (progress: number) => void
  /** Jump with no easing (e.g. when a section is first pinned). */
  snap: (progress: number) => void
}

interface Options {
  /** How hard the playhead chases the scroll position. 1 = instant, .12 = silky. */
  lerp?: number
  /** Sub-range of the clip to map onto 0..1, as [in, out] fractions. */
  range?: [number, number]
}

/**
 * Maps scroll progress onto a video's currentTime.
 *
 * Three things make this smooth rather than janky:
 *  1. The source videos are transcoded all-keyframe, so any seek is a decode
 *     of exactly one frame — no walking back to the previous I-frame.
 *  2. Scroll events only write a number. The playhead is moved on a single
 *     rAF loop that eases toward it, which decouples seek cost from input rate.
 *  3. We never issue a new seek while one is in flight, and we skip writes
 *     smaller than half a frame — both are pure wasted decodes.
 */
export function useVideoScrubber(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  { lerp = 0.14, range = [0, 1] }: Options = {},
): React.MutableRefObject<Scrubber> {
  const target = useRef(0)
  const current = useRef(0)
  const seeking = useRef(false)
  const forced = useRef(false)

  const api = useRef<Scrubber>({
    seek: (p) => {
      target.current = p < 0 ? 0 : p > 1 ? 1 : p
    },
    snap: (p) => {
      target.current = current.current = p < 0 ? 0 : p > 1 ? 1 : p
      forced.current = true
    },
  })

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    video.pause()

    // A scrubbed clip is never played, so nothing else will ever ask the
    // browser to fetch it. Without this nudge it would stay on its poster.
    if (video.readyState === 0) video.load()

    // Safari/iOS will not paint a frame until the element has played once.
    const prime = () => {
      const p = video.play()
      if (p && typeof p.then === 'function') {
        p.then(() => video.pause()).catch(() => {
          /* autoplay blocked — poster stays until the first seek lands */
        })
      }
    }
    if (video.readyState >= 2) prime()
    else video.addEventListener('loadeddata', prime, { once: true })

    const onSeeked = () => {
      seeking.current = false
    }
    video.addEventListener('seeked', onSeeked)

    const [inPoint, outPoint] = range
    let frame = 0

    const tick = () => {
      frame = requestAnimationFrame(tick)

      const duration = video.duration
      if (!duration || !isFinite(duration)) return

      // Ease the playhead toward the scroll target.
      const diff = target.current - current.current
      if (forced.current) {
        current.current = target.current
        forced.current = false
      } else if (Math.abs(diff) < 0.0002) {
        current.current = target.current
      } else {
        current.current += diff * lerp
      }

      if (seeking.current) return

      const span = duration * (outPoint - inPoint)
      // Clamp just shy of the end: seeking to exactly duration can blank the frame.
      const time = Math.min(
        duration * inPoint + current.current * span,
        duration - 0.04,
      )

      if (Math.abs(video.currentTime - time) > 1 / 48) {
        seeking.current = true
        video.currentTime = time
      }
    }
    frame = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(frame)
      video.removeEventListener('seeked', onSeeked)
      video.removeEventListener('loadeddata', prime)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return api
}
