import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search as SearchIcon } from 'lucide-react'
import { useStore } from '../store'
import { Card } from '../components/Cards'

export default function SearchPage() {
  const shows = useStore((s) => s.shows).filter((x) => x.status === 'published')
  const [params, setParams] = useSearchParams()
  const q = params.get('q') ?? ''
  const setQ = (v: string) => setParams(v ? { q: v } : {}, { replace: true })
  const [g, setG] = useState('All')
  const genres = ['All', ...Array.from(new Set(shows.map((s) => s.genre)))]
  const list = shows.filter((s) => (g === 'All' || s.genre === g) && (s.title + ' ' + (s.tags ?? []).join(' ')).toLowerCase().includes(q.toLowerCase()))
  return (
    <div className="px-4 @3xl:px-12 pb-10 @3xl:pt-4">
      <div className="relative max-w-2xl @3xl:hidden">
        <SearchIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/50" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Titles, genres, themes" aria-label="Search" className="w-full bg-surface border border-line rounded-md pl-11 pr-4 py-3 text-[15px] outline-none focus:border-ink/60 placeholder:text-ink/40" />
      </div>
      <div className="flex gap-2 overflow-x-auto no-scrollbar mt-4">
        {genres.map((x) => <button key={x} onClick={() => setG(x)} className={`shrink-0 px-4 py-1.5 rounded-full text-[13px] font-semibold border ${g === x ? 'bg-white text-[#111] border-white' : 'border-line text-ink/70 hover:border-ink/60'}`}>{x}</button>)}
      </div>
      <h2 className="mt-8 mb-4 text-lg font-bold">{q || g !== 'All' ? `${list.length} result${list.length === 1 ? '' : 's'}` : 'Popular searches'}</h2>
      <div className="grid grid-cols-3 @3xl:grid-cols-6 @5xl:grid-cols-8 gap-3 @3xl:gap-5 pb-16">
        {list.map((s) => <Card key={s.id} s={s} />)}
      </div>
      {!list.length && <p className="text-ink/55 text-sm">Nothing matches that search. Try a different title or genre.</p>}
    </div>
  )
}
