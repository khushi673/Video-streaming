import { Fragment, useEffect, useRef, useState } from 'react'
import { NavLink, Link, Outlet, useLocation, useNavigate, Navigate } from 'react-router-dom'
import { Home, Crown, User, Search, Bell, ChevronDown, LogOut, Coins as CoinsIcon, ShieldCheck, Monitor, Smartphone, Gift } from 'lucide-react'
import { useStore } from '../store'
import { themeShelves, THEME_EMOJI } from '../data'
import { Toast, Coin, Frame, Sheet } from './ui'
import Footer from './Footer'
import Logo from './Logo'

const tabs = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/search', icon: Search, label: 'Search' },
  { to: '/plans', icon: Crown, label: 'Premium' },
  { to: '/account', icon: User, label: 'Account' },
]
const links = [
  { to: '/', label: 'Home' },
  { to: '/browse/new', label: 'New and popular' },
  { to: '/browse/list', label: 'My list' },
]
const formats = [
  { to: '/browse/live', label: 'Live action', d: 'Filmed with real actors' },
  { to: '/browse/ai', label: 'AI series', d: 'Created with AI' },
  { to: '/browse/originals', label: 'Reelo Originals', d: 'Made for Reelo' },
  { to: '/browse/interactive', label: 'Interactive', d: 'You choose what happens' },
]
const GENRE_EMOJI: Record<string, string> = { Romance: '💘', Thriller: '🔪', Comedy: '😂', Drama: '🎭', Fantasy: '🐉', 'Sci-Fi': '🚀', Horror: '👻', Action: '💥' }
const notes = [
  { t: 'New episodes of Neon Dynasty 2099', d: '2 days ago' },
  { t: 'Heiress in Disguise is now streaming', d: '4 days ago' },
  { t: 'Your coin balance is low. Top up to keep watching.', d: '1 week ago' },
]

/** Closes a dropdown when you click outside it or press Escape. */
function useDismiss(open: boolean, close: () => void) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const down = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) close() }
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    document.addEventListener('mousedown', down); document.addEventListener('keydown', key)
    return () => { document.removeEventListener('mousedown', down); document.removeEventListener('keydown', key) }
  }, [open, close])
  return ref
}

export default function Shell() {
  const { user, coins, sub, view, setView, signOut, shows } = useStore()
  const { pathname } = useLocation()
  const nav = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [menu, setMenu] = useState<'none' | 'profile' | 'bell' | 'cat'>('none')
  const [searching, setSearching] = useState(false)
  const [q, setQ] = useState('')
  const scroller = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const [catSheet, setCatSheet] = useState(false)
  const closeMenu = () => setMenu('none')
  const profileRef = useDismiss(menu === 'profile', closeMenu)
  const bellRef = useDismiss(menu === 'bell', closeMenu)
  const catRef = useDismiss(menu === 'cat', closeMenu)
  const genres = Array.from(new Set(shows.filter((x) => x.status === 'published').map((x) => x.genre)))
  const themes = themeShelves(shows).slice(0, 8)
  useEffect(() => { scroller.current?.scrollTo(0, 0); setScrolled(false); setMenu('none'); setCatSheet(false); if (pathname !== '/search') { setSearching(false); setQ('') } }, [pathname])
  useEffect(() => { if (searching) searchRef.current?.focus() }, [searching])
  if (!user) return <Navigate to="/auth" replace />
  const isWatch = pathname.startsWith('/watch')
  const hasHero = pathname === '/' || pathname.startsWith('/show/')
  const solid = scrolled || !hasHero
  const onSearch = (v: string) => { setQ(v); nav(v ? `/search?q=${encodeURIComponent(v)}` : '/search', { replace: true }) }
  const item = 'flex items-center gap-3 px-4 py-2.5 text-sm text-ink/85 hover:bg-white/10 w-full text-left'
  return (
    <Frame floatingToggle={false}>
      <div className="h-full relative app-bg flex flex-col">
        {!isWatch && (
          <header className={`hidden @3xl:flex absolute top-0 inset-x-0 h-[68px] items-center px-6 @5xl:px-12 z-30 transition-colors duration-300 ${solid ? 'bg-bg/95 backdrop-blur' : 'scrim-t'}`}>
            <Link to="/" className="text-accent mr-8 @5xl:mr-10 shrink-0" aria-label="Reelo home"><Logo size={28} /></Link>
            <nav className="flex items-center gap-4 @5xl:gap-5" aria-label="Main">
              {links.map((t, i) => (
                <Fragment key={t.to}>
                  <NavLink to={t.to} end className={({ isActive }) => `text-[14px] whitespace-nowrap transition-colors ${isActive ? 'text-ink font-extrabold border-b-2 border-accent pb-0.5' : 'text-ink/75 hover:text-ink/100'}`}>{t.label}</NavLink>
                  {i === 0 && (
                    <div className="relative" ref={catRef} onMouseEnter={() => setMenu('cat')} onMouseLeave={closeMenu}>
                      <button onClick={() => setMenu(menu === 'cat' ? 'none' : 'cat')} aria-expanded={menu === 'cat'} aria-haspopup="true" className={`flex items-center gap-1 text-[14px] whitespace-nowrap ${pathname.startsWith('/browse/genre') || pathname.startsWith('/browse/tag') || /\/browse\/(live|ai|originals|interactive)/.test(pathname) ? 'text-ink font-extrabold' : 'text-ink/75 hover:text-ink'}`}>Categories<ChevronDown size={15} className={`transition-transform ${menu === 'cat' ? 'rotate-180' : ''}`} /></button>
                      {menu === 'cat' && (
                        <div className="absolute left-0 top-full pt-3 anim-fade z-40">
                          <div className="w-[600px] grid grid-cols-3 gap-6 bg-bg/95 backdrop-blur border border-line rounded-2xl shadow-2xl p-5">
                            <div><p className="text-[11px] font-bold uppercase tracking-wider text-ink/45 mb-2">Genres</p>
                              <ul className="space-y-0.5">{genres.map((g) => <li key={g}><Link to={`/browse/genre/${encodeURIComponent(g)}`} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-ink/85 hover:bg-white/10"><span aria-hidden="true">{GENRE_EMOJI[g] ?? '🎬'}</span>{g}</Link></li>)}</ul></div>
                            <div><p className="text-[11px] font-bold uppercase tracking-wider text-ink/45 mb-2">Themes</p>
                              <ul className="space-y-0.5">{themes.map((t) => <li key={t}><Link to={`/browse/tag/${encodeURIComponent(t)}`} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-ink/85 hover:bg-white/10"><span aria-hidden="true">{THEME_EMOJI[t] ?? '✨'}</span>{t}</Link></li>)}</ul></div>
                            <div><p className="text-[11px] font-bold uppercase tracking-wider text-ink/45 mb-2">Format</p>
                              <ul className="space-y-0.5">{formats.map((f) => <li key={f.to}><Link to={f.to} className="block rounded-lg px-2 py-1.5 hover:bg-white/10"><span className="block text-sm font-semibold text-ink/90">{f.label}</span><span className="block text-xs text-ink/50">{f.d}</span></Link></li>)}</ul></div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </Fragment>
              ))}
            </nav>

            <div className="ml-auto flex items-center gap-4 @5xl:gap-5">
              {/* Search: icon expands into a field, like Netflix */}
              <div className={`flex items-center transition-all duration-200 ${searching ? 'border border-ink/80 bg-black/70 pl-2.5 pr-2' : ''}`}>
                <button onClick={() => setSearching(true)} aria-label="Search" className="text-ink p-1"><Search size={20} /></button>
                {searching && <input ref={searchRef} value={q} onChange={(e) => onSearch(e.target.value)} onBlur={() => { if (!q) setSearching(false) }} placeholder="Titles, genres, themes" aria-label="Search titles" className="bg-transparent outline-none focus-visible:outline-none text-sm w-48 @5xl:w-60 px-2.5 py-1.5 placeholder:text-ink/45" />}
              </div>
              <Link to="/coins" className="flex items-center gap-1.5 text-sm font-bold whitespace-nowrap bg-white/10 hover:bg-white/15 border border-white/10 rounded-full pl-1.5 pr-3 py-1" aria-label={`${coins} coins, add more`}><Coin size={20} />{coins}</Link>

              {/* Notifications */}
              <div className="relative" ref={bellRef}>
                <button onClick={() => setMenu(menu === 'bell' ? 'none' : 'bell')} aria-label="Notifications" aria-expanded={menu === 'bell'} className="relative p-1 text-ink"><Bell size={20} /><span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-accent" /></button>
                {menu === 'bell' && (
                  <div className="absolute right-0 top-full mt-3 w-80 bg-bg/95 border border-line shadow-2xl anim-fade">
                    {notes.map((n) => <div key={n.t} className="px-4 py-3 border-b border-line last:border-0 hover:bg-white/5"><p className="text-sm">{n.t}</p><p className="text-xs text-ink/45 mt-0.5">{n.d}</p></div>)}
                  </div>
                )}
              </div>

              {/* Profile menu */}
              <div className="relative" ref={profileRef}>
                <button onClick={() => setMenu(menu === 'profile' ? 'none' : 'profile')} aria-expanded={menu === 'profile'} aria-label="Account menu" className="flex items-center gap-1.5 group">
                  <span className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF2E63] to-[#FF7A1A] text-white flex items-center justify-center text-sm font-bold">{user.name[0]?.toUpperCase()}</span>
                  <ChevronDown size={16} className={`transition-transform ${menu === 'profile' ? 'rotate-180' : ''}`} />
                </button>
                {menu === 'profile' && (
                  <div className="absolute right-0 top-full mt-3 w-60 bg-bg/95 border border-line shadow-2xl anim-fade py-1">
                    <div className="px-4 py-3 border-b border-line"><p className="text-sm font-semibold truncate">{user.name}</p><p className="text-xs text-ink/50 truncate">{sub ? 'Premium member' : 'Free account'}</p></div>
                    <Link to="/account" className={item}><User size={17} />Account</Link>
                    <Link to="/coins" className={item}><CoinsIcon size={17} />Coins ({coins})</Link>
                    <Link to="/rewards" className={item}><Gift size={17} />Rewards</Link>
                    <Link to="/plans" className={item}><Crown size={17} />{sub ? 'Manage plan' : 'Go Premium'}</Link>
                    <Link to="/admin" className={item}><ShieldCheck size={17} />Admin panel</Link>
                    <div className="px-4 py-2.5 border-t border-line">
                      <p className="text-xs text-ink/50 mb-2">Preview as</p>
                      <div className="grid grid-cols-2 gap-1.5">
                        {([['web', Monitor, 'Web'], ['mobile', Smartphone, 'Mobile']] as const).map(([v, Icon, l]) => (
                          <button key={v} onClick={() => { setView(v); closeMenu() }} className={`flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded ${view === v ? 'chip-on' : 'bg-white/10 hover:bg-white/15'}`}><Icon size={13} />{l}</button>
                        ))}
                      </div>
                    </div>
                    <button onClick={() => { signOut(); nav('/auth') }} className={`${item} border-t border-line`}><LogOut size={17} />Sign out</button>
                  </div>
                )}
              </div>
            </div>
          </header>
        )}
        {!isWatch && (
          <header className="@3xl:hidden absolute top-0 inset-x-0 z-30 flex items-center justify-between px-4 pt-4 pb-2 pointer-events-none">
            {hasHero ? <Link to="/" className="text-accent pointer-events-auto"><Logo size={24} /></Link> : <span />}
<div className="pointer-events-auto flex items-center gap-2">
              <button onClick={() => setCatSheet(true)} aria-haspopup="dialog" className="flex items-center gap-1 text-sm font-semibold bg-black/45 backdrop-blur rounded-full pl-3 pr-2 py-1.5">Categories<ChevronDown size={15} /></button>
                          <Link to="/coins" className="flex items-center gap-1.5 text-sm font-semibold bg-black/45 backdrop-blur rounded-full pl-1.5 pr-3 py-1"><Coin size={20} />{coins}</Link>
            </div>
          </header>
        )}
        <div ref={scroller} onScroll={(e) => setScrolled(e.currentTarget.scrollTop > 40)} className={`flex-1 min-h-0 overflow-y-auto no-scrollbar relative ${hasHero || isWatch ? '' : 'pt-14 @3xl:pt-[68px]'}`}>
          <Outlet />
          {!isWatch && <Footer />}
        </div>
        {!isWatch && (
          <nav className="@3xl:hidden shrink-0 grid grid-cols-4 bg-bg border-t border-line pb-2 pt-1">
            {tabs.map((t) => (
              <NavLink key={t.to} to={t.to} end className={({ isActive }) => `flex flex-col items-center gap-1 py-2 text-[11px] font-semibold ${isActive ? 'text-accent' : 'text-ink/45'}`}>
                <t.icon size={22} strokeWidth={2} />{t.label}
              </NavLink>
            ))}
          </nav>
        )}
        {catSheet && (
          <Sheet title="Categories" onClose={() => setCatSheet(false)}>
            <div className="max-h-[65dvh] overflow-y-auto no-scrollbar space-y-5">
              {([['Genres', genres.map((g) => [`${GENRE_EMOJI[g] ?? '🎬'} ${g}`, `/browse/genre/${encodeURIComponent(g)}`])], ['Themes', themes.map((t) => [`${THEME_EMOJI[t] ?? '✨'} ${t}`, `/browse/tag/${encodeURIComponent(t)}`])], ['Format', formats.map((f) => [f.label, f.to])]] as [string, string[][]][]).map(([h, items]) => (
                <div key={h}><p className="text-[11px] font-bold uppercase tracking-wider text-ink/45 mb-2">{h}</p>
                  <div className="flex flex-wrap gap-2">{items.map(([l, to]) => <Link key={to} to={to} className="px-3.5 py-1.5 rounded-full text-[13px] font-semibold border border-line bg-surface hover:border-accent/60">{l}</Link>)}</div></div>
              ))}
            </div>
          </Sheet>
        )}
        <Toast />
      </div>
    </Frame>
  )
}
