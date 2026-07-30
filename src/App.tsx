import { useEffect, useState } from 'react'
import { ScrollTrigger } from './lib/gsap'
import { useLenis, stopScroll, startScroll } from './lib/useLenis'
import Preloader from './components/Preloader'
import Cursor from './components/Cursor'
import Navbar from './components/Navbar'
import ScrollRail from './components/ScrollRail'
import Hero from './sections/Hero'
import Interiors from './sections/Interiors'
import Amenities from './sections/Amenities'
import Community from './sections/Community'
import Stats from './sections/Stats'
import Gallery from './sections/Gallery'
import FloorPlan from './sections/FloorPlan'
import Location from './sections/Location'
import Testimonials from './sections/Testimonials'
import FinalCTA from './sections/FinalCTA'
import Footer from './sections/Footer'

export default function App() {
  const [ready, setReady] = useState(false)
  useLenis()

  /* Hold the page still while the preloader draws. */
  useEffect(() => {
    if (!ready) {
      stopScroll()
      window.scrollTo(0, 0)
      return
    }
    startScroll()
    // Pinned sections measure against a settled layout, not a mid-curtain one.
    const id = requestAnimationFrame(() => ScrollTrigger.refresh())
    return () => cancelAnimationFrame(id)
  }, [ready])

  /* Late-arriving media changes section heights; re-measure once it lands. */
  useEffect(() => {
    const onLoad = () => ScrollTrigger.refresh()
    window.addEventListener('load', onLoad)
    return () => window.removeEventListener('load', onLoad)
  }, [])

  return (
    <>
      <Cursor />
      {!ready && <Preloader onComplete={() => setReady(true)} />}
      <Navbar />
      <ScrollRail />

      <main>
        <Hero ready={ready} />
        <Interiors />
        <Amenities />
        <Community />
        <Stats />
        <Gallery />
        <FloorPlan />
        <Location />
        <Testimonials />
        <FinalCTA />
      </main>

      <Footer />
    </>
  )
}
