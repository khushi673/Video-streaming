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
          <p className="mt-3 text-sm text-ink/60 max-w-xs leading-relaxed">Short vertical series, made to watch in minutes. Available on the web, with iOS and Android apps planned.</p>
        </div>
        <Group title="Browse" items={genres.slice(0, 5).map((g) => [g, '/'] as [string, string])} />
        <Group title="Help" items={[['Help centre', '/'], ['Contact us', '/'], ['Restore purchases', '/account']]} />
        <Group title="Company" items={[['About', '/'], ['Careers', '/'], ['For creators', '/']]} />
      </div>
      <div className="border-t border-line">
        <div className="max-w-6xl mx-auto px-10 py-5 flex flex-wrap items-center justify-between gap-3 text-xs text-ink/50">
          <span>© 2026 Reelo. Prototype, not a live service. Sample footage: Blender Foundation open movies (CC BY) and Mathieu Stanić, Paris Hypernight (CC BY).</span>
          <div className="flex gap-5"><Link to="/">Privacy</Link><Link to="/">Terms</Link><Link to="/">Cookies</Link><Link to="/">DMCA</Link></div>
        </div>
      </div>
    </footer>
  )
}
