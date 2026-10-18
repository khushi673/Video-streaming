import { useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Play, Plus, Check, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { useStore } from '../store'
import { Poster } from './ui'
import { fmtViews, type Show } from '../data'

/** Poster tile with a Netflix-style hover panel (desktop) and a progress bar for continue-watching. */
export function Card({ s, className = '', rank, progress }: { s: Show; className?: string; rank?: number; progress?: number }) {
  const fav = useStore((x) => x.favs.includes(s.id))
  const toggle = useStore((x) => x.toggleFav)
  const nav = useNavigate()
  const total = s.episodes.length
  return (
    <div className={`group relative ${className}`}>
      {rank != null && <span aria-hidden="true" className="rank absolute z-0 right-[calc(100%-14px)] bottom-[30px] text-[118px] @3xl:text-[176px] pointer-events-none select-none">{rank}</span>}
      <Link to={`/show/${s.id}`} aria-label={s.title} className="block relative z-10 transition-transform duration-200 @3xl:group-hover:scale-[1.07] @3xl:group-hover:z-20 origin-bottom">
        <Poster show={s} gem className="aspect-[9/14]" />
        {progress != null && <div className="absolute inset-x-0 bottom-0 h-1 bg-white/25 rounded-b"><div className="h-full bg-accent" style={{ width: `${(progress / total) * 100}%` }} /></div>}
        <div className="hidden @3xl:flex absolute inset-x-0 -bottom-[58px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-surface rounded-b-md px-3 pt-2.5 pb-3 flex-col gap-1.5 shadow-2xl">
          <div className="flex items-center gap-1.5">
            <button onClick={(e) => { e.preventDefault(); nav(`/watch/${s.id}/${progress ?? 1}`) }} aria-label={`Play ${s.title}`} className="w-8 h-8 rounded-full bg-white text-[#111] flex items-center justify-center"><Play size={14} fill="#111" /></button>
            <button onClick={(e) => { e.preventDefault(); toggle(s.id) }} aria-label={fav ? 'Remove from my list' : 'Add to my list'} className="w-8 h-8 rounded-full border border-ink/50 hover:border-ink flex items-center justify-center">{fav ? <Check size={15} /> : <Plus size={15} />}</button>
            <span className="ml-auto w-8 h-8 rounded-full border border-ink/50 flex items-center justify-center"><ChevronDown size={16} /></span>
          </div>
          <div className="text-[11px] text-ink/70 line-clamp-1">{(s.tags ?? []).join(' • ')}</div>
        </div>
      </Link>
      {progress != null
        ? <div className="mt-2 text-xs text-ink/60">Episode {progress} of {total}</div>
        : <div className="mt-2 text-xs text-ink/50 @3xl:group-hover:opacity-0 transition-opacity">{fmtViews(s.views)} views</div>}
    </div>
  )
}

/** Horizontally scrolling row with edge arrows on desktop. */
export function Row({ title, shows, ranked, continuing }: { title: string; shows: Show[]; ranked?: boolean; continuing?: Record<string, number> }) {
  const ref = useRef<HTMLDivElement>(null)
  if (!shows.length) return null
  const by = (d: number) => ref.current?.scrollBy({ left: d * ref.current.clientWidth * 0.85, behavior: 'smooth' })
  return (
    <section className="mt-8 @3xl:mt-11 relative group/row">
      <h2 className="px-4 @3xl:px-12 mb-2.5 text-lg @3xl:text-[22px] font-bold tracking-tight">{title}</h2>
      <button onClick={() => by(-1)} aria-label="Scroll left" className="hidden @3xl:flex absolute left-0 top-9 bottom-24 w-12 z-30 items-center justify-center bg-black/55 opacity-0 group-hover/row:opacity-100 transition-opacity"><ChevronLeft size={30} /></button>
      <div ref={ref} className="flex gap-4 @3xl:gap-7 overflow-x-auto no-scrollbar px-4 @3xl:px-12 pb-20 -mb-14 pt-1 scroll-smooth">
        {shows.map((s, i) => <Card key={s.id} s={s} rank={ranked ? i + 1 : undefined} progress={continuing?.[s.id]} className={`shrink-0 w-[116px] @3xl:w-[172px] ${ranked ? (i === 9 ? 'ml-[96px] @3xl:ml-[146px]' : 'ml-[46px] @3xl:ml-[70px]') : ''}`} />)}
      </div>
      <button onClick={() => by(1)} aria-label="Scroll right" className="hidden @3xl:flex absolute right-0 top-9 bottom-24 w-12 z-30 items-center justify-center bg-black/55 opacity-0 group-hover/row:opacity-100 transition-opacity"><ChevronRight size={30} /></button>
    </section>
  )
}
