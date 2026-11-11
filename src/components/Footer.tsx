import { Link } from 'react-router-dom'
import { useStore } from '../store'
import Logo from './Logo'

const Group = ({ title, items }: { title: string; items: [string, string][] }) => (
  <div>
    <h3 className="text-sm font-semibold mb-3">{title}</h3>
    <ul className="space-y-2 text-sm text-ink/60">{items.map(([l, to]) => <li key={l}><Link to={to} className="hover:text-ink">{l}</Link></li>)}</ul>
  </div>
)

export default function Footer() {
  const genres = Array.from(new Set(useStore((s) => s.shows).map((x) => x.genre)))
  return (
    <footer className="hidden @3xl:block mt-20 border-t border-line bg-surface">
      <div className="max-w-6xl mx-auto px-10 py-12 grid grid-cols-[1.4fr_1fr_1fr_1fr] gap-10">
        <div>
          <div className="text-accent"><Logo size={26} /></div>
          <p className="mt-3 text-sm text-ink/60 max-w-xs leading-relaxed">Short vertical series, made to watch in minutes.</p>
          <div className="mt-4 flex items-center gap-4 text-xs font-semibold text-ink/60" aria-label="Social">{[['Facebook','https://facebook.com'],['YouTube','https://youtube.com'],['Instagram','https://instagram.com'],['TikTok','https://tiktok.com']].map(([l, u]) => <a key={l} href={u} target="_blank" rel="noreferrer" className="hover:text-ink">{l}</a>)}</div>
        </div>
        <Group title="Browse" items={genres.slice(0, 5).map((g) => [g, '/'] as [string, string])} />
        <Group title="Help" items={[['Help centre', '/info/help'], ['Contact us', '/info/contact'], ['Send feedback', '/info/feedback'], ['Rewards', '/rewards'], ['Restore purchases', '/account']]} />
        <Group title="Company" items={[['About', '/info/about'], ['Media & PR', '/info/press'], ['Terms of Service', '/info/terms'], ['Privacy Policy', '/info/privacy']]} />
      </div>
      <div className="border-t border-line">
        <div className="max-w-6xl mx-auto px-10 py-5 flex flex-wrap items-center justify-between gap-3 text-xs text-ink/50">
          <span>© 2026 Reelo. Prototype, not a live service. Sample footage: Blender Foundation open movies (CC BY) and Mathieu Stanić, Paris Hypernight (CC BY).</span>
          <div className="flex gap-5"><Link to="/info/privacy">Privacy</Link><Link to="/info/terms">Terms</Link><Link to="/info/cookies">Cookies</Link><Link to="/info/dmca">DMCA</Link></div>
        </div>
      </div>
    </footer>
  )
}
