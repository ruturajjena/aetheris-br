import { scrollTo } from '../lib/useLenis'

const COLS = [
  {
    title: 'Project',
    links: ['Residences', 'Amenities', 'Community', 'Gallery', 'Plans'],
  },
  {
    title: 'Enquire',
    links: ['Book a Tour', 'Brochure', 'Sales Gallery', 'Payment Plans'],
  },
  {
    title: 'Legal',
    links: ['RERA Registration', 'Disclaimer', 'Privacy', 'Terms'],
  },
]

export default function Footer() {
  return (
    <footer className="relative bg-canvas">
      <div className="mx-auto max-w-[1600px] px-6 md:px-12">
        <div className="rule" />

        <div className="grid grid-cols-2 gap-x-8 gap-y-12 py-16 md:grid-cols-12 md:py-20">
          <div className="col-span-2 md:col-span-4">
            <div className="flex items-baseline gap-2.5">
              <span className="h-1.5 w-1.5 rounded-full bg-gold" />
              <span className="font-display text-[15px] tracking-[.42em] text-ink">AETHERIS</span>
            </div>
            <p className="t-body mt-6 max-w-xs !text-[13px]">
              A vertical gated community of forty-two floors, eight shared houses and three acres
              of planting.
            </p>
            <div className="num mt-8 text-[11px] text-muted">
              RERA · PRM/KA/RERA/1251/446/PR/261104/004821
            </div>
          </div>

          {COLS.map((col) => (
            <div key={col.title} className="md:col-span-2">
              <div className="text-[9px] uppercase tracking-[.28em] text-muted">{col.title}</div>
              <ul className="mt-6 space-y-3.5">
                {col.links.map((l) => (
                  <li key={l}>
                    <button
                      data-cursor="link"
                      onClick={() => scrollTo('#book')}
                      className="group relative text-[12px] text-ink transition-colors duration-500 hover:text-gold"
                    >
                      {l}
                      <span className="absolute -bottom-0.5 left-0 h-px w-full origin-right scale-x-0 bg-gold transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] group-hover:origin-left group-hover:scale-x-100" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="col-span-2 md:text-right">
            <button
              data-cursor="link"
              onClick={() => scrollTo(0)}
              className="whitespace-nowrap text-[9px] uppercase tracking-[.26em] text-muted transition-colors duration-500 hover:text-gold"
            >
              Back to top ↑
            </button>
          </div>
        </div>

        <div className="rule" />

        <div className="flex flex-col items-start justify-between gap-4 py-8 sm:flex-row sm:items-center">
          <div className="text-[10px] tracking-wide text-muted">
            © 2026 Aetheris Residences. All rights reserved.
          </div>
          <div className="flex items-center gap-7">
            {['Instagram', 'LinkedIn', 'Journal'].map((s) => (
              <button
                key={s}
                data-cursor="link"
                className="text-[10px] uppercase tracking-[.22em] text-muted transition-colors duration-500 hover:text-ink"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
