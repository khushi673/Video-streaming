import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft, Lock, Play, Check, Plus, Crown } from 'lucide-react'
import { useStore, hasAccess } from '../store'
import { Coin } from '../components/ui'
import { Row } from '../components/Cards'
import { bannerSrc, coverSrc, fmtTime, fmtViews, FREE_EPISODES } from '../data'

const PAGE = 20
const blurbs = [
  'A secret surfaces that nobody was ready for.',
  'An old promise is tested, and someone has to choose.',
  'What looked like help turns out to be a trap.',
  'Two people finally say what they have avoided for weeks.',
  'A late-night call changes the plan.',
  'The truth comes out, and not everyone is who they said they were.',
]

export default function ShowPage() {
  const { id } = useParams()
  const nav = useNavigate()
  const s = useStore()
  const [range, setRange] = useState(0)
  const [tab, setTab] = useState<'eps' | 'more'>('eps')
  const show = s.shows.find((x) => x.id === id)
  if (!show) return <div className="p-6 pt-20">Show not found</div>
  const eps = show.episodes.filter((e) => e.status === 'published')
  const cur = s.progress[show.id] ?? 1
  const fav = s.favs.includes(show.id)
  const ranges = Array.from({ length: Math.ceil(eps.length / PAGE) }, (_, i) => i)
  const visible = eps.slice(range * PAGE, range * PAGE + PAGE)
  const minutes = Math.round(eps.reduce((a, e) => a + e.secs, 0) / 60)
  const similar = s.shows.filter((x) => x.id !== show.id && x.status === 'published' && (x.genre === show.genre || x.type === show.type))
  return (
    <div className="pb-6">
      <section className="relative h-[60dvh] @3xl:h-[72dvh] min-h-[420px] overflow-hidden">
        <img src={coverSrc(show)} alt="" className="@3xl:hidden absolute inset-0 w-full h-full object-cover" />
        <img src={bannerSrc(show)} alt="" className="hidden @3xl:block absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 scrim-l hidden @3xl:block" />
        <div className="absolute inset-x-0 bottom-0 h-4/5 scrim-b" />
        <button onClick={() => nav(-1)} aria-label="Back" className="@3xl:hidden absolute top-4 left-4 w-9 h-9 rounded-full bg-black/45 backdrop-blur flex items-center justify-center z-20"><ChevronLeft size={20} /></button>
        <div className="absolute inset-x-0 bottom-0 px-5 @3xl:px-12 pb-6 @3xl:pb-14 @3xl:max-w-[760px]">
          <h1 className="text-[38px] @3xl:text-[64px] font-extrabold leading-[0.98] tracking-[-0.035em]">{show.title}</h1>
          <p className="mt-3 text-sm text-ink/80 flex flex-wrap gap-x-3 gap-y-1">
            <span className="text-accent font-bold">{fmtViews(show.views)} views</span><span>{show.type === 'AI' ? 'AI series' : 'Live action'}</span><span>{show.genre}</span><span>{eps.length} episodes</span><span>About {minutes} min</span>
          </p>
          <p className="mt-3 text-[15px] @3xl:text-[17px] text-ink/85 leading-snug max-w-xl">{show.synopsis}</p>
          <div className="mt-5 flex items-center gap-3">
            <Link to={`/watch/${show.id}/${cur}`} className="btn-play inline-flex items-center gap-2 px-6 @3xl:px-8 py-2.5 @3xl:py-3 text-[15px] @3xl:text-lg"><Play size={20} fill="#111" /> {s.progress[show.id] ? `Resume episode ${cur}` : 'Play episode 1'}</Link>
            <button onClick={() => s.toggleFav(show.id)} aria-pressed={fav} className="btn-ghost inline-flex items-center gap-2 px-5 py-2.5 @3xl:py-3 text-[15px] @3xl:text-lg">{fav ? <Check size={20} /> : <Plus size={20} />} My list</button>
          </div>
          {(show.tags ?? []).length > 0 && <p className="mt-4 text-[13px] text-ink/60">{show.tags.join('  •  ')}</p>}
        </div>
      </section>

      <div className="relative z-10 px-4 @3xl:px-12 @3xl:max-w-[1100px]">
        {!s.sub && (
          <Link to="/plans" className="mb-6 flex items-center gap-3 bg-surface border border-line rounded-md px-4 py-3.5 text-sm hover:border-ink/40">
            <Crown size={18} className="text-accent shrink-0" /><span className="flex-1"><b className="font-semibold">Watch every episode with Premium.</b> <span className="text-ink/60">Plans start at $4.99 a week.</span></span><span className="font-semibold text-accent">See plans</span>
          </Link>
        )}
        <div className="flex items-end justify-between border-b border-line">
          <div className="flex gap-6">
            {([['eps', 'Episodes'], ['more', 'More like this']] as const).map(([k, l]) => (
              <button key={k} onClick={() => setTab(k)} className={`pb-3 -mb-px text-[15px] font-bold border-b-[3px] ${tab === k ? 'border-accent text-ink' : 'border-transparent text-ink/50 hover:text-ink'}`}>{l}</button>
            ))}
          </div>
          {tab === 'eps' && (
            <div className="flex gap-4 pb-3">
              {ranges.map((r) => <button key={r} onClick={() => setRange(r)} className={`text-sm font-semibold ${range === r ? 'text-ink' : 'text-ink/45 hover:text-ink'}`}>{r * PAGE + 1}-{Math.min(eps.length, r * PAGE + PAGE)}</button>)}
            </div>
          )}
        </div>

        {tab === 'eps' ? (
          <>
            <ul>
              {visible.map((e) => {
                const open = hasAccess(s, show.id, e)
                const paid = !e.free && open
                return (
                  <li key={e.n} className="border-b border-line/70">
                    <Link to={`/watch/${show.id}/${e.n}`} className="group flex items-center gap-3 @3xl:gap-5 py-3.5 @3xl:py-4 hover:bg-surface -mx-2 px-2 rounded">
                      <span className={`w-6 text-center text-lg @3xl:text-2xl font-medium tabular-nums ${cur === e.n && s.progress[show.id] ? 'text-accent' : 'text-ink/45'}`}>{e.n}</span>
                      <span className="relative w-[112px] @3xl:w-[190px] aspect-video shrink-0 rounded overflow-hidden bg-surface2">
                        <img src={bannerSrc(show)} alt="" loading="lazy" className={`absolute inset-0 w-full h-full object-cover scale-[1.5] ${open ? '' : 'brightness-50'}`} style={{ objectPosition: `${(e.n * 37) % 100}% ${(e.n * 23) % 100}%` }} />
                        <span className="absolute inset-0 flex items-center justify-center">
                          {open ? <span className="w-9 h-9 rounded-full bg-black/55 border border-white/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Play size={14} fill="#fff" /></span> : <Lock size={20} />}
                        </span>
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="flex items-baseline justify-between gap-3"><span className="text-[15px] @3xl:text-base font-bold truncate">{e.title}</span><span className="text-xs @3xl:text-sm text-ink/60 shrink-0">{fmtTime(e.secs)}</span></span>
                        <span className="hidden @xl:block mt-1 text-sm text-ink/60 line-clamp-2">{blurbs[e.n % blurbs.length]}</span>
                        <span className="mt-1 block text-xs font-semibold">
                          {e.free && <span className="text-accent">Free</span>}
                          {paid && <span className="text-ink/60 inline-flex items-center gap-1"><Check size={13} />{s.sub ? 'Included with Premium' : 'Unlocked'}</span>}
                          {!e.free && !open && <span className="text-ink/80 inline-flex items-center gap-1.5">Unlock for {e.price} <Coin size={14} /></span>}
                        </span>
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
            <p className="text-xs text-ink/45 mt-4">Episodes 1 to {FREE_EPISODES} are free. Later episodes unlock with coins or Premium.</p>
          </>
        ) : (
          <div className="-mx-4 @3xl:-mx-12 pb-10"><Row title="" shows={similar} /></div>
        )}
      </div>
    </div>
  )
}
