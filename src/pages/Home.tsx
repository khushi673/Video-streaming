import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Play, Info, Smartphone } from 'lucide-react'
import { useStore } from '../store'
import { Card, Row } from '../components/Cards'
import { bannerSrc, coverSrc, FREE_EPISODES, isInteractive, themeShelves } from '../data'

export default function HomePage() {
  const { shows, progress } = useStore()
  const nav = useNavigate()
  const live = shows.filter((s) => s.status === 'published')
  const featured = live.filter((s) => s.trending).slice(0, 4)
  const [idx, setIdx] = useState(0)
  useEffect(() => {
    if (featured.length < 2) return
    const t = setInterval(() => setIdx((i) => (i + 1) % featured.length), 8000)
    return () => clearInterval(t)
  }, [featured.length])
  const hero = featured[idx % Math.max(1, featured.length)] ?? live[0]
  const cont = live.filter((s) => progress[s.id])
  const genres = Array.from(new Set(live.map((s) => s.genre))).slice(0, 4)
  const themes = themeShelves(shows).slice(0, 4)
  return (
    <div className="pb-6">
      {hero && (
        <section className="relative h-[68dvh] @3xl:h-[82dvh] min-h-[440px] @3xl:min-h-[540px] overflow-hidden">
          {featured.map((f) => (
            <div key={f.id} className={`absolute inset-0 transition-opacity duration-700 ${f.id === hero.id ? 'opacity-100' : 'opacity-0'}`} aria-hidden={f.id !== hero.id}>
              <img src={coverSrc(f)} alt="" className="@3xl:hidden absolute inset-0 w-full h-full object-cover" />
              <img src={bannerSrc(f)} alt="" className="hidden @3xl:block absolute inset-0 w-full h-full object-cover" />
            </div>
          ))}
          <div className="absolute inset-0 scrim-l hidden @3xl:block" />
          <div className="absolute inset-x-0 bottom-0 h-3/4 scrim-b" />
          <div className="absolute inset-x-0 bottom-0 px-5 @3xl:px-12 pb-8 @3xl:pb-20 @3xl:max-w-[760px]">
            <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-ink/85"><span className="bg-gradient-to-r from-[#FF2E63] to-[#FF7A1A] text-white text-xs font-extrabold rounded-full px-2.5 py-1 shadow-lg">Trending</span>{hero.type === 'AI' ? 'AI series' : 'Live action'} · {hero.genre}</p>
            <h1 className="mt-2 text-[40px] @3xl:text-[72px] font-extrabold leading-[0.96] tracking-[-0.035em]">{hero.title}</h1>
            <p className="mt-3 text-[15px] @3xl:text-lg text-ink/85 leading-snug max-w-xl line-clamp-3">{hero.synopsis}</p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Link to={`/watch/${hero.id}/${progress[hero.id] ?? 1}`} className="btn-play inline-flex items-center gap-2 px-5 @3xl:px-8 py-2.5 @3xl:py-3 text-[15px] @3xl:text-lg"><Play size={20} fill="#111" /> {progress[hero.id] ? 'Resume' : 'Play episode 1'}</Link>
              <Link to={`/show/${hero.id}`} className="btn-ghost inline-flex items-center gap-2 px-5 @3xl:px-7 py-2.5 @3xl:py-3 text-[15px] @3xl:text-lg"><Info size={20} /> More info</Link>
            </div>
            <p className="mt-3 text-[13px] text-ink/60">The first {FREE_EPISODES} episodes are free.</p>
          </div>
          {featured.length > 1 && (
            <div className="absolute right-5 @3xl:right-12 bottom-8 @3xl:bottom-20 flex gap-1.5">
              {featured.map((f, i) => <button key={f.id} onClick={() => setIdx(i)} aria-label={`Show ${f.title}`} className={`h-1 rounded-full transition-all ${f.id === hero.id ? 'w-6 bg-gradient-to-r from-[#FF2E63] to-[#FF7A1A]' : 'w-3 bg-white/40'}`} />)}
            </div>
          )}
        </section>
      )}
      <div className="relative z-10 -mt-4 @3xl:-mt-10">
        <Row title="Continue watching" shows={cont} continuing={progress} />
        <Row ranked title="Top 10 this week" shows={live.filter((s) => s.trending)} viewAll="/browse/top" />
        <Row title="New releases" shows={live.filter((s) => s.isNew)} viewAll="/browse/new" />
        <Row title="Reelo Originals" shows={live.filter((s) => s.original)} viewAll="/browse/originals" />
        <Row title="Interactive stories" shows={live.filter(isInteractive)} viewAll="/browse/interactive" />
        {themes.map((t) => <Row key={t} title={t} shows={live.filter((s) => (s.tags ?? []).includes(t))} viewAll={`/browse/tag/${encodeURIComponent(t)}`} />)}
        <Row title="AI originals" shows={live.filter((s) => s.type === 'AI')} viewAll="/browse/ai" />
        <Row title="Live action" shows={live.filter((s) => s.type === 'Real')} viewAll="/browse/live" />
        {genres.map((g) => <Row key={g} title={g} shows={live.filter((s) => s.genre === g)} />)}
        <Link to="/info/apps" className="mx-4 @3xl:mx-12 mt-10 flex items-center gap-4 bg-gradient-to-r from-[#2a1545] to-[#3a1030] border border-line rounded-2xl px-5 py-5 hover:border-accent/60">
          <Smartphone size={28} className="text-accent shrink-0" /><span className="flex-1"><b className="block text-base">Watch anytime, anywhere</b><span className="text-sm text-ink/60">The Reelo iOS and Android apps are coming soon.</span></span><span className="font-semibold text-accent text-sm">Get the app</span>
        </Link>
        <section className="mt-12 px-4 @3xl:px-12 pb-6">
          <h2 className="text-lg @3xl:text-[22px] font-bold mb-3 tracking-tight">Browse all</h2>
          <div className="grid grid-cols-3 @3xl:grid-cols-6 @5xl:grid-cols-8 gap-3 @3xl:gap-5">{live.map((s) => <Card key={s.id} s={s} />)}</div>
          <button onClick={() => nav('/search')} className="btn-ghost mt-6 px-6 py-2.5 text-sm">Search the catalogue</button>
        </section>
      </div>
    </div>
  )
}
