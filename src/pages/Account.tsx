import { Link, useNavigate } from 'react-router-dom'
import { LogOut, RotateCcw, Gift } from 'lucide-react'
import { useStore } from '../store'
import { Coin, Poster } from '../components/ui'
import { money, LANGS } from '../data'

export default function Account() {
  const s = useStore()
  const nav = useNavigate()
  const unlockedShows = Array.from(new Set(Object.keys(s.unlocked).map((k) => k.split(':')[0]))).map((id) => s.shows.find((x) => x.id === id)).filter(Boolean)
  const cont = s.shows.filter((x) => s.progress[x.id])
  const favs = s.shows.filter((x) => s.favs.includes(x.id))
  const dlShows = Array.from(new Set(s.downloads.map((k) => k.split(':')[0]))).map((id) => s.shows.find((x) => x.id === id)).filter(Boolean)
  const Toggle = ({ k, label }: { k: keyof typeof s.prefs; label: string }) => (
    <label className="flex items-center justify-between py-3 border-b border-line text-sm cursor-pointer"><span className="text-ink/75">{label}</span><input type="checkbox" checked={s.prefs[k]} onChange={(e) => s.setPref(k, e.target.checked)} className="w-4 h-4 accent-[#FF2E63]" /></label>
  )
  const plan = s.sub && s.plans.find((p) => p.id === s.sub!.plan)
  const Strip = ({ title, items, ep }: { title: string; items: typeof s.shows; ep?: boolean }) => items.length ? (
    <section className="mb-9"><h2 className="text-xl mb-3">{title}</h2>
      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">{items.map((x) => (
        <Link key={x.id} to={ep ? `/watch/${x.id}/${s.progress[x.id]}` : `/show/${x.id}`} className="shrink-0 w-[108px]"><Poster show={x} className="aspect-[9/14]" />{ep && <div className="text-xs text-ink/55 mt-1.5">Episode {s.progress[x.id]}</div>}</Link>
      ))}</div></section>
  ) : null
  return (
    <div className="px-5 pt-6 pb-12 @3xl:max-w-6xl @3xl:mx-auto @3xl:px-10 @3xl:pt-14 @3xl:grid @3xl:grid-cols-[320px_1fr] @3xl:gap-20 @3xl:items-start">
      <div>
        <div className="w-14 h-14 rounded-full bg-ink text-bg flex items-center justify-center text-xl font-semibold">{s.user?.name[0]?.toUpperCase()}</div>
        <h1 className="text-3xl mt-4">{s.user?.name}</h1>
        <p className="text-sm text-ink/50 mt-1">{s.user?.email}<br />Viewer ID {s.user?.uid}</p>
        <dl className="mt-7 border-t border-line">
          <div className="flex items-center justify-between py-4 border-b border-line"><dt className="text-sm text-ink/60">Coins</dt><dd className="flex items-center gap-2 font-bold text-lg"><Coin size={20} />{s.coins}<Link to="/coins" className="ml-2 text-sm font-semibold text-accent">Add</Link></dd></div>
          <div className="flex items-center justify-between py-4 border-b border-line"><dt className="text-sm text-ink/60">Plan</dt><dd className="text-right">{plan ? <><span className="font-bold text-lg">{plan.name}</span><span className="block text-xs text-ink/50">Renews {s.sub!.renews}</span></> : <><span className="font-bold text-lg text-ink/70">Free</span> <Link to="/plans" className="ml-2 text-sm font-semibold text-accent">Go Premium</Link></>}</dd></div>
        </dl>
        <h2 className="text-base mt-8 mb-1">Preferences</h2>
        <div className="border-t border-line">
          <label className="flex items-center justify-between py-3 border-b border-line text-sm"><span className="text-ink/75">Subtitles</span>
            <select value={s.lang} onChange={(e) => s.setLang(e.target.value)} aria-label="Subtitle language" className="bg-surface2 border border-line rounded px-2 py-1 text-sm">{LANGS.map((l) => <option key={l}>{l}</option>)}</select></label>
          <Toggle k="newEpisodes" label="New episode alerts" />
          <Toggle k="rewards" label="Reward reminders" />
          <Toggle k="promos" label="Offers and promotions" />
        </div>
        <div className="mt-6 space-y-1 text-sm">
          <Link to="/rewards" className="flex items-center gap-2 py-2 text-accent font-semibold"><Gift size={14} /> Rewards</Link>
          <Link to="/admin" className="block @3xl:hidden py-2 text-ink/60">Open admin panel</Link>
          <div className="@3xl:hidden flex flex-wrap gap-x-4 gap-y-1 py-2 text-ink/55">{[['Help','help'],['Contact','contact'],['Feedback','feedback'],['Terms','terms'],['Privacy','privacy'],['Get the app','apps']].map(([l, k]) => <Link key={k} to={`/info/${k}`}>{l}</Link>)}</div>
          <button onClick={() => { s.reset(); nav('/auth') }} className="flex items-center gap-2 py-2 text-ink/55 hover:text-ink"><RotateCcw size={14} /> Reset demo data</button>
          <button onClick={() => { s.signOut(); nav('/auth') }} className="flex items-center gap-2 py-2 text-ink/55 hover:text-ink"><LogOut size={14} /> Log out</button>
        </div>
      </div>
      <div className="mt-10 @3xl:mt-0">
        <Strip title="Continue watching" items={cont} ep />
        <Strip title="Unlocked content" items={unlockedShows as typeof s.shows} />
        <Strip title="My list" items={favs} />
        <Strip title="Downloads" items={dlShows as typeof s.shows} />
        <section><h2 className="text-xl mb-3">Purchase history</h2>
          {s.tx.length === 0 && <p className="text-sm text-ink/50">Nothing yet. Coin and subscription purchases appear here.</p>}
          <ul className="border-t border-line">{s.tx.map((t) => (
            <li key={t.id} className="flex items-center justify-between py-3.5 border-b border-line text-sm"><div><div className="font-semibold">{t.label}</div><div className="text-xs text-ink/45">{t.date} · {t.method}</div><div className="text-[11px] text-ink/35 font-mono">{t.txnId}</div></div>
              <div className="text-right">{t.money != null && <div className="font-semibold">{money(t.money)}</div>}{t.coins != null && <div className={`text-xs font-semibold ${t.coins < 0 ? 'text-ink/50' : 'text-ok'}`}>{t.coins > 0 ? '+' : ''}{t.coins} coins</div>}</div></li>
          ))}</ul>
        </section>
      </div>
    </div>
  )
}
