import { useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Play, Bookmark, Share2, ChevronLeft, ChevronRight } from 'lucide-react'
import { useStore } from '../store'
import { Poster, useToast } from './ui'
import { fmtViews, badgesFor, isInteractive, ratingOf, RATINGS, type Show, type Rating } from '../data'

/** Poster tile with a Netflix-style hover panel (desktop) and a progress bar for continue-watching. */
export function Card({ s, className = '', rank, progress }: { s: Show; className?: string; rank?: number; progress?: number }) {
  const fav = useStore((x) => x.favs.includes(s.id))
  const toggle = useStore((x) => x.toggleFav)
  const nav = useNavigate()
  const toast = useToast((t) => t.show)
  const share = async () => {
    const url = `${location.origin}${location.pathname}#/show/${s.id}`
    try { await navigator.clipboard.writeText(url); toast('Link copied') } catch { toast(url) }
  }
  const total = s.episodes.length
  return (
    <div className={`group relative ${className}`}>
      {rank != null && <span aria-hidden="true" className="rank absolute z-0 right-[calc(100%-14px)] bottom-[30px] text-[118px] @3xl:text-[176px] pointer-events-none select-none">{rank}</span>}
      <Link to={`/show/${s.id}`} aria-label={s.title} className="block relative z-10 ">
        <Poster show={s} views={s.views} badges={[...(isInteractive(s) ? ['Interactive'] : []), ...badgesFor(s)]} className="aspect-[9/14] shadow-lg shadow-black/40 ring-1 ring-white/5 transition-[box-shadow,transform] duration-300 group-hover:ring-accent/60" />
        {progress != null && <div className="absolute inset-x-0 bottom-0 h-1 bg-white/25 rounded-b"><div className="h-full bg-accent" style={{ width: `${(progress / total) * 100}%` }} /></div>}
      </Link>
      {/* Expanded hover card (desktop). Opens after a short delay so scrolling past doesn't flicker; closes instantly. */}
      <div
        onClick={() => nav(`/show/${s.id}`)}
        className="hidden @3xl:block absolute z-30 -left-4 -top-4 w-[calc(100%+32px)] cursor-pointer rounded-[22px] p-3.5 pb-4 ring-1 ring-white/15 bg-gradient-to-b from-[#5b1d7a] via-[#341852] to-[#6b1d44] shadow-[0_24px_60px_-12px_rgba(0,0,0,.9),0_0_40px_-8px_rgba(255,46,99,.45)] opacity-0 pointer-events-none scale-[.9] translate-y-2 origin-top transition-[opacity,transform] duration-150 ease-out group-hover:opacity-100 group-hover:pointer-events-auto group-hover:scale-100 group-hover:translate-y-0 group-hover:duration-300 group-hover:delay-[140ms] group-hover:ease-[cubic-bezier(.2,.9,.25,1.1)] [&_.pop-in]:opacity-0 [&_.pop-in]:translate-y-2 [&_.pop-in]:transition-all [&_.pop-in]:duration-300 group-hover:[&_.pop-in]:opacity-100 group-hover:[&_.pop-in]:translate-y-0 group-hover:[&_.pop-in]:delay-[240ms]"
      >
        <div className="relative rounded-2xl overflow-hidden shadow-lg ring-1 ring-black/30">
          <div className="[&_img]:transition-transform [&_img]:duration-[1200ms] [&_img]:ease-out group-hover:[&_img]:scale-[1.08]">
            <Poster show={s} className="aspect-[9/14] !rounded-none" />
          </div>
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
          {s.type === 'AI' && <span className="absolute top-2.5 right-2.5 text-[9px] font-bold leading-none border border-white/70 rounded px-1.5 py-1 bg-black/40 backdrop-blur">AI</span>}
          <span className="absolute bottom-2.5 right-3 flex items-center gap-1 text-xs font-semibold [text-shadow:0_1px_4px_rgba(0,0,0,.8)]"><Play size={12} fill="#fff" />{fmtViews(s.views)}</span>
        </div>
        <div className="pop-in mt-3 text-[16px] font-semibold leading-tight tracking-tight line-clamp-1">{s.title}</div>
        <div className="pop-in mt-1 text-[11.5px] text-ink/70 line-clamp-1 [transition-delay:280ms]">{[s.genre, ...(s.tags ?? [])].join('  |  ')}</div>
        <div className="pop-in mt-1.5 flex flex-wrap gap-1 [transition-delay:310ms]">
          {[ratingOf(s), ...(isInteractive(s) ? ['Interactive'] : []), ...(s.original ? ['Original'] : [])].map((t) => <span key={t} className="text-[10px] font-medium text-ink/75 bg-white/10 rounded-full px-2 py-0.5">{t}</span>)}
        </div>
        <p className="pop-in mt-2 text-[11.5px] leading-snug text-ink/60 line-clamp-2 [transition-delay:340ms]">{s.synopsis}</p>
        <div className="pop-in mt-3.5 flex items-center gap-2.5 [transition-delay:380ms]">
          <button onClick={(e) => { e.stopPropagation(); nav(`/watch/${s.id}/${progress ?? 1}`) }} aria-label={`Play ${s.title}`} className="w-11 h-11 rounded-full bg-white text-[#111] flex items-center justify-center shadow-[0_6px_18px_rgba(0,0,0,.45)] hover:scale-110 active:scale-95 transition-transform"><Play size={18} fill="#17081f" className="ml-0.5" /></button>
          <button onClick={(e) => { e.stopPropagation(); toggle(s.id) }} aria-label={fav ? 'Remove from my list' : 'Add to my list'} aria-pressed={fav} className="w-11 h-11 rounded-full bg-white/15 hover:bg-white/30 hover:scale-110 active:scale-95 transition flex items-center justify-center backdrop-blur"><Bookmark size={17} className={fav ? 'text-[#FF2E63]' : ''} fill={fav ? '#FF2E63' : 'none'} /></button>
          <button onClick={(e) => { e.stopPropagation(); share() }} aria-label="Share" className="w-11 h-11 rounded-full bg-white/15 hover:bg-white/30 hover:scale-110 active:scale-95 transition flex items-center justify-center backdrop-blur"><Share2 size={17} /></button>
        </div>
      </div>
      {progress != null
        ? <div className="mt-2 text-xs text-ink/60">Episode {progress} of {total}</div>
        : <div className="mt-2 text-xs text-ink/55 truncate">{s.genre} · {s.episodes.length} eps</div>}
    </div>
  )
}

/** Horizontally scrolling row with edge arrows on desktop. */
export function Row({ title, shows, ranked, continuing, viewAll }: { title: string; shows: Show[]; ranked?: boolean; continuing?: Record<string, number>; viewAll?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  if (!shows.length) return null
  const by = (d: number) => ref.current?.scrollBy({ left: d * ref.current.clientWidth * 0.85, behavior: 'smooth' })
  return (
    <section className="mt-8 @3xl:mt-11 relative group/row">
      <div className="px-4 @3xl:px-12 mb-2.5 flex items-baseline justify-between gap-3">
        <h2 className="text-lg @3xl:text-[22px] font-extrabold tracking-tight flex items-center gap-2.5"><span aria-hidden="true" className="w-1 h-[1em] rounded-full bg-gradient-to-b from-[#FF2E63] to-[#FF7A1A]" />{title}</h2>
        {viewAll && <Link to={viewAll} className="text-sm font-semibold text-ink/60 hover:text-ink whitespace-nowrap">View all ›</Link>}
      </div>
      <button onClick={() => by(-1)} aria-label="Scroll left" className="hidden @3xl:flex absolute left-0 top-9 bottom-24 w-12 z-30 items-center justify-center bg-black/55 opacity-0 group-hover/row:opacity-100 transition-opacity"><ChevronLeft size={30} /></button>
      <div ref={ref} className="flex gap-4 @3xl:gap-7 overflow-x-auto no-scrollbar @3xl:[&>.group]:transition-opacity @3xl:[&>.group]:duration-300 @3xl:[&:has(.group:hover)>.group:not(:hover)]:opacity-40 px-4 @3xl:px-12 @3xl:pb-52 @3xl:-mb-48 pb-6 pt-4 scroll-smooth">
        {shows.map((s, i) => <Card key={s.id} s={s} rank={ranked ? i + 1 : undefined} progress={continuing?.[s.id]} className={`shrink-0 w-[116px] @3xl:w-[172px] ${ranked ? (i === 9 ? 'ml-[96px] @3xl:ml-[146px]' : 'ml-[46px] @3xl:ml-[70px]') : ''}`} />)}
      </div>
      <button onClick={() => by(1)} aria-label="Scroll right" className="hidden @3xl:flex absolute right-0 top-9 bottom-24 w-12 z-30 items-center justify-center bg-black/55 opacity-0 group-hover/row:opacity-100 transition-opacity"><ChevronRight size={30} /></button>
    </section>
  )
}

/** Audience-rating filter chips (All Ages / Young Adult / Adults Only). */
export function RatingChips({ value, onChange }: { value: Rating | 'All'; onChange: (r: Rating | 'All') => void }) {
  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar" role="group" aria-label="Audience rating">
      {(['All', ...RATINGS] as const).map((r) => <button key={r} onClick={() => onChange(r)} aria-pressed={value === r} className={`shrink-0 px-3.5 py-1 rounded-full text-xs font-semibold border ${value === r ? 'chip-on' : 'border-line text-ink/70 hover:border-ink/60 bg-surface'}`}>{r === 'All' ? 'All ratings' : r}</button>)}
    </div>
  )
}
