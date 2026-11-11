import { useState } from 'react'
import { NavLink, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Film, Tag, Users, Receipt, ArrowLeft, Upload, Plus } from 'lucide-react'
import { useStore } from '../store'
import { Toast, Poster, useToast } from '../components/ui'
import Logo from '../components/Logo'
import { users, adminTx, spentBy } from './adminData'
import { DEFAULT_PRICE, FREE_EPISODES, fmtViews, money, coverSrc, RATINGS, ratingOf, type Show, type Rating } from '../data'

const nav = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/shows', icon: Film, label: 'Shows' },
  { to: '/admin/pricing', icon: Tag, label: 'Plans & coin packs' },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/purchases', icon: Receipt, label: 'Purchases' },
]
const card = 'bg-surface border border-line rounded-xl p-5'
const inp = 'bg-surface border border-line rounded-md px-3 py-2 text-sm text-ink outline-none focus:border-line'

function Dashboard() {
  const shows = useStore((s) => s.shows)
  const bars = [32, 41, 38, 55, 62, 58, 74, 81, 77, 92, 88, 103]
  const kpis = [['Registered users', '12,480', '+8.2%'], ['Active subscribers', '1,932', '+5.1%'], ['Coin revenue (30d)', '$18,240', '+12%'], ['Subscription revenue (30d)', '$21,870', '+6.4%']]
  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
      <p className="text-sm text-ink/50 mb-5">Sample data for demonstration.</p>
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">{kpis.map(([a, b, c]) => <div key={a} className={card}><div className="text-xs text-ink/50">{a}</div><div className="text-2xl font-bold mt-1">{b}</div><div className="text-xs text-ok mt-1">{c} vs last month</div></div>)}</div>
      <div className="grid xl:grid-cols-3 gap-4 mt-4">
        <div className={`${card} xl:col-span-2`}><div className="font-bold mb-4">Revenue (last 12 weeks, $k)</div>
          <div className="flex items-end gap-2 h-44">{bars.map((b, i) => <div key={i} className="flex-1 h-full flex flex-col justify-end items-center gap-1"><span className="text-[10px] text-ink/40">{b}</span><div className={`w-full rounded-t-md border border-line ${i === bars.length - 1 ? 'bg-gold' : 'bg-accent'}`} style={{ height: `${b * 0.82}%` }} /></div>)}</div></div>
        <div className={card}><div className="font-bold mb-3">Top shows</div>
          {[...shows].sort((a, b) => b.views - a.views).slice(0, 5).map((s, i) => <div key={s.id} className="flex items-center gap-3 py-2 text-sm"><span className="text-ink/40 w-4">{i + 1}</span><span className="flex-1 truncate">{s.title}</span><span className="text-ink/60">{fmtViews(s.views)}</span></div>)}</div>
      </div>
    </div>
  )
}

const GENRES = ['Romance', 'Thriller', 'Comedy', 'Drama', 'Fantasy', 'Sci-Fi', 'Horror', 'Action']
const label = 'block text-sm font-semibold mb-1.5'
const hint = 'text-xs text-ink/50 mt-1.5'

function Shows() {
  const shows = useStore((s) => s.shows)
  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Shows</h1>
          <p className="text-sm text-ink/55 mt-1">Every series on the platform. Open a show to edit its episodes, prices and videos.</p>
        </div>
        <Link to="/admin/shows/new" className="btn-primary font-bold text-sm px-5 py-3 flex items-center gap-2"><Plus size={16} />Add a show</Link>
      </div>
      <div className={`${card} p-0 overflow-hidden`}>
        <table className="w-full text-sm"><thead className="text-left text-ink/50 text-xs border-b border-line"><tr><th className="p-3">Show</th><th>Type</th><th>Episodes</th><th>Views</th><th>Status</th><th></th></tr></thead>
          <tbody>{shows.map((s) => (
            <tr key={s.id} className="border-b border-line hover:bg-surface2">
              <td className="p-3"><Link to={`/admin/shows/${s.id}`} className="flex items-center gap-3"><img src={coverSrc(s)} alt="" className="w-9 h-12 rounded object-cover shrink-0" /><span><b className="block">{s.title}</b><span className="text-xs text-ink/50">{s.genre}</span></span></Link></td>
              <td>{s.type === 'AI' ? 'AI-generated' : 'Live action'}</td>
              <td>{s.episodes.length}<span className="text-xs text-ink/45"> ({s.episodes.filter((e) => e.free).length} free)</span></td>
              <td>{fmtViews(s.views)}</td>
              <td><span className={`px-2 py-0.5 rounded text-xs font-semibold ${s.status === 'published' ? 'bg-ok/20 text-ok' : 'bg-white/10 text-ink/60'}`}>{s.status === 'published' ? 'Live' : 'Draft'}</span></td>
              <td className="pr-3 text-right"><Link to={`/admin/shows/${s.id}`} className="text-xs font-semibold text-accent">Edit</Link></td>
            </tr>))}</tbody></table>
      </div>
    </div>
  )
}

/** One simple page: fill the form top to bottom, preview on the right, then Create. */
function AddShow() {
  const { addShow } = useStore()
  const toast = useToast((t) => t.show)
  const go = useNavigate()
  const [previewId] = useState(() => 'new' + Date.now())
  const [hue] = useState(() => Math.floor(Math.random() * 360))
  const [f, setF] = useState({ title: '', synopsis: '', type: 'AI' as Show['type'], genre: 'Drama', tags: '', cover: '' as string, kind: 'Series' as NonNullable<Show['kind']>, rating: 'All Ages' as Rating, original: false, count: 50, free: FREE_EPISODES, price: DEFAULT_PRICE, publish: false })
  const [tried, setTried] = useState(false)
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((p) => ({ ...p, [k]: v }))
  const errs = {
    title: !f.title.trim() ? 'Enter the show title.' : '',
    synopsis: !f.synopsis.trim() ? 'Write a short description viewers will read.' : '',
    count: f.count < 1 || f.count > 100 ? 'Use a number from 1 to 100.' : '',
    free: f.free < 0 || f.free > f.count ? 'Free episodes cannot be more than the total.' : '',
  }
  const bad = Object.values(errs).some(Boolean)
  const tags = f.tags.split(',').map((t) => t.trim()).filter(Boolean).slice(0, 3)
  const draft: Show = { id: previewId, kind: f.kind, rating: f.rating, original: f.original, title: f.title || 'Show title', type: f.type, genre: f.genre, synopsis: f.synopsis, hue, tags, trending: false, isNew: true, status: 'draft', views: 0, coverUrl: f.cover || undefined, episodes: Array.from({ length: f.count || 0 }) as never }
  const pickCover = (file?: File) => {
    if (!file) return
    const r = new FileReader()
    r.onload = () => set('cover', String(r.result))
    r.readAsDataURL(file)
  }
  const create = () => {
    setTried(true)
    if (bad) return
    const id = 's' + Date.now()
    const episodes = Array.from({ length: f.count }, (_, i) => ({ n: i + 1, title: i === 0 ? 'Pilot' : `Episode ${i + 1}`, secs: 100, free: i < f.free, price: f.price, status: (f.publish ? 'published' : 'draft') as 'published' | 'draft' }))
    addShow({ ...draft, id, title: f.title.trim(), synopsis: f.synopsis.trim(), status: f.publish ? 'published' : 'draft', episodes })
    toast(f.publish ? 'Show is live' : 'Show saved as draft')
    go(`/admin/shows/${id}`)
  }
  const inp = `w-full bg-surface2 border rounded-md px-3.5 py-2.5 text-sm outline-none focus:border-ink/60 `
  const err = (k: keyof typeof errs) => tried && errs[k] ? <p className="text-xs text-red-400 mt-1.5">{errs[k]}</p> : null
  const sec = 'bg-surface border border-line rounded-xl p-6'
  const secTitle = (n: number, t: string, d: string) => <div className="mb-5"><h2 className="text-lg font-bold flex items-center gap-2.5"><span className="w-6 h-6 rounded-full bg-accent text-white text-xs flex items-center justify-center">{n}</span>{t}</h2><p className="text-sm text-ink/55 mt-1 ml-[34px]">{d}</p></div>
  return (
    <div className="max-w-5xl">
      <Link to="/admin/shows" className="text-sm text-ink/55 flex items-center gap-1 mb-3"><ArrowLeft size={14} />Back to shows</Link>
      <h1 className="text-2xl font-bold">Add a show</h1>
      <p className="text-sm text-ink/55 mt-1 mb-6">Fill in the four steps below. You can change everything later, and you will upload each episode's video after the show is created.</p>
      <div className="grid xl:grid-cols-[1fr_300px] gap-6 items-start">
        <div className="space-y-5">
          <section className={sec}>
            {secTitle(1, 'About the show', 'What viewers see on the show page.')}
            <div className="space-y-5">
              <div><label className={label} htmlFor="t">Title</label><input id="t" className={`${inp} ${tried && errs.title ? 'border-red-400' : 'border-line'}`} placeholder="e.g. Midnight Contract" value={f.title} onChange={(e) => set('title', e.target.value)} />{err('title')}</div>
              <div><label className={label} htmlFor="d">Description</label><textarea id="d" rows={3} className={`${inp} ${tried && errs.synopsis ? 'border-red-400' : 'border-line'}`} placeholder="Two or three sentences that make someone press play." value={f.synopsis} onChange={(e) => set('synopsis', e.target.value)} />{err('synopsis')}</div>
              <div>
                <span className={label}>Content type</span>
                <div className="grid grid-cols-2 gap-3">
                  {([['AI', 'AI-generated', 'Made with AI tools'], ['Real', 'Live action', 'Shot with real actors']] as const).map(([v, n, d]) => (
                    <button type="button" key={v} onClick={() => set('type', v)} className={`text-left p-3.5 rounded-md border ${f.type === v ? 'border-accent bg-accent/10' : 'border-line hover:border-ink/40'}`}><b className="block text-sm">{n}</b><span className="text-xs text-ink/55">{d}</span></button>
                  ))}
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-5">
                <div><label className={label} htmlFor="g">Genre</label><select id="g" className={`${inp} border-line`} value={f.genre} onChange={(e) => set('genre', e.target.value)}>{GENRES.map((g) => <option key={g}>{g}</option>)}</select></div>
                <div><label className={label} htmlFor="tg">Tags <span className="font-normal text-ink/45">(optional)</span></label><input id="tg" className={`${inp} border-line`} placeholder="Fated Lovers, Billionaire" value={f.tags} onChange={(e) => set('tags', e.target.value)} /><p className={hint}>Separate with commas. Up to 3.</p></div>
              </div>
              <div className="grid sm:grid-cols-3 gap-5 mt-5">
                <div><label className={label} htmlFor="kd">Format</label><select id="kd" className={`${inp} border-line`} value={f.kind} onChange={(e) => set('kind', e.target.value as typeof f.kind)}><option value="Series">Series</option><option value="Interactive">Interactive (viewers make choices)</option></select></div>
                <div><label className={label} htmlFor="rt">Audience rating</label><select id="rt" className={`${inp} border-line`} value={f.rating} onChange={(e) => set('rating', e.target.value as Rating)}>{RATINGS.map((r) => <option key={r}>{r}</option>)}</select></div>
                <label className="flex items-center gap-2.5 text-sm sm:mt-8"><input type="checkbox" checked={f.original} onChange={(e) => set('original', e.target.checked)} />Reelo Original</label>
              </div>
            </div>
          </section>

          <section className={sec}>
            {secTitle(2, 'Cover image', 'The poster shown on the home page. Portrait, ideally 9:16.')}
            <label className="flex items-center gap-4 border border-dashed border-line rounded-md p-4 cursor-pointer hover:border-ink/40">
              <span className="w-12 h-12 rounded bg-surface2 flex items-center justify-center shrink-0"><Upload size={20} /></span>
              <span className="flex-1 text-sm"><b className="block">{f.cover ? 'Image added. Click to replace.' : 'Choose an image'}</b><span className="text-xs text-ink/50">JPG or PNG. If you skip this, a sample frame is used.</span></span>
              <input type="file" accept="image/*" className="sr-only" onChange={(e) => pickCover(e.target.files?.[0])} />
            </label>
          </section>

          <section className={sec}>
            {secTitle(3, 'Episodes and pricing', 'We create the episode list for you. You can edit each one afterwards.')}
            <div className="grid sm:grid-cols-3 gap-5">
              <div><label className={label} htmlFor="c">Number of episodes</label><input id="c" type="number" min={1} max={100} className={`${inp} ${tried && errs.count ? 'border-red-400' : 'border-line'}`} value={f.count} onChange={(e) => set('count', +e.target.value)} />{err('count')}</div>
              <div><label className={label} htmlFor="f">Free episodes</label><input id="f" type="number" min={0} className={`${inp} ${tried && errs.free ? 'border-red-400' : 'border-line'}`} value={f.free} onChange={(e) => set('free', +e.target.value)} />{err('free')}<p className={hint}>The first {f.free || 0} play for free.</p></div>
              <div><label className={label} htmlFor="p">Price of other episodes</label><input id="p" type="number" min={0} className={`${inp} border-line`} value={f.price} onChange={(e) => set('price', +e.target.value)} /><p className={hint}>In coins, per episode.</p></div>
            </div>
          </section>

          <section className={sec}>
            {secTitle(4, 'Publish', 'Choose whether viewers can see it now.')}
            <div className="grid sm:grid-cols-2 gap-3">
              {([[false, 'Save as draft', 'Hidden from viewers. Finish setting up first.'], [true, 'Publish now', 'Visible in the app right away.']] as const).map(([v, n, d]) => (
                <button type="button" key={n} onClick={() => set('publish', v)} className={`text-left p-3.5 rounded-md border ${f.publish === v ? 'border-accent bg-accent/10' : 'border-line hover:border-ink/40'}`}><b className="block text-sm">{n}</b><span className="text-xs text-ink/55">{d}</span></button>
              ))}
            </div>
          </section>

          <div className="flex items-center gap-3">
            <button onClick={create} className="btn-primary font-bold px-7 py-3">Create show</button>
            <Link to="/admin/shows" className="text-sm font-semibold text-ink/60 px-3 py-3">Cancel</Link>
            {tried && bad && <span className="text-sm text-red-400">Fix the highlighted fields to continue.</span>}
          </div>
        </div>

        <aside className="xl:sticky xl:top-6">
          <p className="text-xs font-semibold text-ink/50 mb-2">Preview</p>
          <div className="w-[190px]"><Poster show={draft} className="aspect-[9/14]" /></div>
          <p className="text-xs text-ink/45 mt-3 max-w-[220px]">This is how the show will look on the home page.</p>
        </aside>
      </div>
    </div>
  )
}

function ShowEdit() {
  const { id } = useParams()
  const { shows, updateShow, updateEpisode, bulkEpisodes } = useStore()
  const toast = useToast((t) => t.show)
  const [free, setFree] = useState(FREE_EPISODES)
  const [price, setPrice] = useState(DEFAULT_PRICE)
  const show = shows.find((x) => x.id === id)
  if (!show) return <div>Show not found. <Link to="/admin/shows" className="underline">Back to shows</Link></div>
  const eps = show.episodes
  const withVideo = eps.filter((e) => e.video).length
  const live = show.status === 'published'
  const inp = 'w-full bg-surface2 border border-line rounded-md px-3 py-2 text-sm outline-none focus:border-ink/60'
  const upload = (n: number, file?: File) => {
    if (!file) return
    updateEpisode(show.id, n, { video: file.name })
    toast(`Video added to episode ${n} (processing is simulated)`)
  }
  const apply = () => {
    bulkEpisodes(show.id, (e) => (e.n <= free ? { free: true } : { free: false, price }))
    toast(`Updated: first ${free} free, the rest ${price} coins`)
  }
  const steps = [
    ['Show details added', true],
    [`${eps.length} episodes created`, eps.length > 0],
    [`Videos uploaded (${withVideo} of ${eps.length})`, eps.length > 0 && withVideo === eps.length],
    ['Published to viewers', live],
  ] as const
  return (
    <div className="max-w-6xl">
      <Link to="/admin/shows" className="text-sm text-ink/55 flex items-center gap-1 mb-3"><ArrowLeft size={14} />Back to shows</Link>
      <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <div className="flex items-center gap-4">
          <img src={coverSrc(show)} alt="" className="w-14 h-[78px] rounded object-cover" />
          <div><h1 className="text-2xl font-bold">{show.title}</h1><span className={`inline-block mt-1.5 px-2 py-0.5 rounded text-xs font-semibold ${live ? 'bg-ok/20 text-ok' : 'bg-white/10 text-ink/60'}`}>{live ? 'Live' : 'Draft, not visible to viewers'}</span></div>
        </div>
        <div className="flex gap-2">
          <Link to={`/show/${show.id}`} className="btn-ghost text-sm px-4 py-2.5">View in app</Link>
          <button onClick={() => { updateShow(show.id, { status: live ? 'draft' : 'published' }); toast(live ? 'Show unpublished' : 'Show is live') }} className={`${live ? 'btn-gold' : 'btn-primary'} text-sm px-5 py-2.5`}>{live ? 'Unpublish' : 'Publish show'}</button>
        </div>
      </div>

      <div className={`${card} mb-5`}>
        <h2 className="font-bold mb-3">Setup checklist</h2>
        <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-2 text-sm">{steps.map(([t, ok]) => <li key={t} className="flex items-center gap-2"><span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${ok ? 'bg-accent text-white' : 'border border-line text-ink/30'}`}>{ok ? '✓' : ''}</span><span className={ok ? '' : 'text-ink/60'}>{t}</span></li>)}</ul>
      </div>

      <div className="grid xl:grid-cols-[320px_1fr] gap-5 items-start">
        <div className={card}>
          <h2 className="font-bold mb-4">Show details</h2>
          <div className="space-y-4 text-sm">
            <div><label className={label} htmlFor="et">Title</label><input id="et" className={inp} value={show.title} onChange={(e) => updateShow(show.id, { title: e.target.value })} /></div>
            <div><label className={label} htmlFor="ed">Description</label><textarea id="ed" rows={4} className={inp} value={show.synopsis} onChange={(e) => updateShow(show.id, { synopsis: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={label} htmlFor="ey">Type</label><select id="ey" className={inp} value={show.type} onChange={(e) => updateShow(show.id, { type: e.target.value as Show['type'] })}><option value="AI">AI-generated</option><option value="Real">Live action</option></select></div>
              <div><label className={label} htmlFor="eg">Genre</label><select id="eg" className={inp} value={show.genre} onChange={(e) => updateShow(show.id, { genre: e.target.value })}>{[...new Set([...GENRES, show.genre])].map((g) => <option key={g}>{g}</option>)}</select></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={label} htmlFor="ek">Format</label><select id="ek" className={inp} value={show.kind ?? 'Series'} onChange={(e) => updateShow(show.id, { kind: e.target.value as NonNullable<Show['kind']> })}><option value="Series">Series</option><option value="Interactive">Interactive</option></select></div>
              <div><label className={label} htmlFor="er">Audience rating</label><select id="er" className={inp} value={ratingOf(show)} onChange={(e) => updateShow(show.id, { rating: e.target.value as Rating })}>{RATINGS.map((r) => <option key={r}>{r}</option>)}</select></div>
            </div>
            <label className="flex items-center gap-2.5"><input type="checkbox" checked={!!show.original} onChange={(e) => updateShow(show.id, { original: e.target.checked })} />Reelo Original</label>
            <label className="flex items-start gap-2.5"><input type="checkbox" className="mt-0.5" checked={show.trending} onChange={(e) => updateShow(show.id, { trending: e.target.checked })} /><span><b className="block font-semibold">Feature on the home page</b><span className="text-xs text-ink/50">Shows it in the big banner and Top 10.</span></span></label>
          </div>
        </div>

        <div className={card}>
          <h2 className="font-bold">Episodes ({eps.length})</h2>
          <p className="text-sm text-ink/55 mt-1 mb-4">Set what is free, set the price of the rest, then upload a video for each episode.</p>
          <div className="bg-bg border border-line rounded-md p-4 mb-5 flex flex-wrap items-end gap-4">
            <div><label className="text-xs font-semibold block mb-1" htmlFor="bf">Free episodes</label><input id="bf" type="number" min={0} max={eps.length} className={`${inp} w-24`} value={free} onChange={(e) => setFree(+e.target.value)} /></div>
            <div><label className="text-xs font-semibold block mb-1" htmlFor="bp">Price of the others (coins)</label><input id="bp" type="number" min={0} className={`${inp} w-28`} value={price} onChange={(e) => setPrice(+e.target.value)} /></div>
            <button onClick={apply} className="btn-primary text-sm px-5 py-2.5">Apply to all episodes</button>
          </div>
          <div className="max-h-[560px] overflow-auto">
            <table className="w-full text-sm"><thead className="text-left text-ink/50 text-xs sticky top-0 bg-surface"><tr><th className="py-2 w-8">#</th><th>Title</th><th>Video</th><th>Access</th><th>Price (coins)</th><th>Status</th></tr></thead>
              <tbody>{eps.map((e) => (
                <tr key={e.n} className="border-t border-line">
                  <td className="py-2 text-ink/50">{e.n}</td>
                  <td><input aria-label={`Episode ${e.n} title`} className={`${inp} w-40`} value={e.title} onChange={(ev) => updateEpisode(show.id, e.n, { title: ev.target.value })} /></td>
                  <td>
                    <label className="inline-flex items-center gap-1.5 text-xs font-semibold cursor-pointer text-accent hover:underline">
                      {e.video ? <><span className="text-ok">✓</span><span className="max-w-[90px] truncate text-ink/70" title={e.video}>{e.video}</span><span>Replace</span></> : <><Upload size={13} />Upload</>}
                      <input type="file" accept="video/*" className="sr-only" onChange={(ev) => upload(e.n, ev.target.files?.[0])} />
                    </label>
                  </td>
                  <td><button onClick={() => updateEpisode(show.id, e.n, { free: !e.free })} className={`px-2.5 py-1 rounded text-xs font-semibold ${e.free ? 'bg-ok/20 text-ok' : 'bg-white/10 text-ink/70'}`}>{e.free ? 'Free' : 'Paid'}</button></td>
                  <td><input type="number" aria-label={`Episode ${e.n} price`} disabled={e.free} className={`${inp} w-20 disabled:opacity-30`} value={e.price} onChange={(ev) => updateEpisode(show.id, e.n, { price: +ev.target.value })} /></td>
                  <td><select aria-label={`Episode ${e.n} status`} className={inp} value={e.status} onChange={(ev) => updateEpisode(show.id, e.n, { status: ev.target.value as typeof e.status })}><option value="published">Live</option><option value="draft">Draft</option><option value="scheduled">Scheduled</option></select></td>
                </tr>))}</tbody></table>
          </div>
        </div>
      </div>
    </div>
  )
}

function Pricing() {
  const { plans, packs, setPlans, setPacks } = useStore()
  return (
    <div>
      <h1 className="text-2xl font-bold mb-5">Plans & coin packages</h1>
      <div className="grid xl:grid-cols-2 gap-4">
        <div className={card}><h2 className="font-bold mb-3">Subscription plans</h2>
          {plans.map((p, i) => <div key={p.id} className="flex items-center gap-3 py-2 border-t border-line first:border-0"><span className="w-24 font-semibold">{p.name}</span><span className="text-ink/40 text-xs">$</span><input type="number" step="0.01" className={`${inp} w-24`} value={p.price} onChange={(e) => setPlans(plans.map((x, j) => (j === i ? { ...x, price: +e.target.value } : x)))} /><span className="text-xs text-ink/50">/ {p.per}</span></div>)}</div>
        <div className={card}><h2 className="font-bold mb-3">Coin packages</h2>
          <div className="grid grid-cols-4 gap-2 text-xs text-ink/50 mb-1"><span>Coins</span><span>Bonus</span><span>Price $</span></div>
          {packs.map((p, i) => <div key={p.id} className="grid grid-cols-4 gap-2 py-1.5">{(['coins', 'bonus', 'price'] as const).map((k) => <input key={k} type="number" step="0.01" className={inp} value={p[k]} onChange={(e) => setPacks(packs.map((x, j) => (j === i ? { ...x, [k]: +e.target.value } : x)))} />)}</div>)}</div>
      </div>
      <p className="text-xs text-ink/40 mt-4">Changes apply immediately to the user app (open it in another tab to see).</p>
    </div>
  )
}

const statusPill = (st: string) => `px-2 py-0.5 rounded text-xs font-semibold ${st === 'Paid' ? 'bg-ok/20 text-ok' : st === 'Refunded' ? 'bg-white/10 text-ink/70' : 'bg-red-500/20 text-red-300'}`
const mono = 'font-mono text-xs text-ink/70'

function Users_() {
  const [q, setQ] = useState('')
  const me = useStore((s) => s.user)
  const list = users.filter((u) => (u.name + u.email + u.country).toLowerCase().includes(q.toLowerCase()))
  return (
    <div>
      <h1 className="text-2xl font-bold">Users</h1>
      <p className="text-sm text-ink/55 mt-1 mb-5">Everyone who has signed up. Open a user to see their payments and transaction IDs.</p>
      <input value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search users" placeholder="Search by name, email or country" className="w-full max-w-sm bg-surface border border-line rounded-md px-3.5 py-2.5 text-sm mb-4 outline-none focus:border-ink/60" />
      <div className={`${card} p-0 overflow-x-auto`}>
        <table className="w-full text-sm whitespace-nowrap"><thead className="text-left text-ink/50 text-xs border-b border-line"><tr><th className="p-3">User</th><th>Country</th><th>Plan</th><th>Coins</th><th>Total paid</th><th>Last payment</th><th>Joined</th><th></th></tr></thead>
          <tbody>{list.map((u) => {
            const last = adminTx.find((t) => t.userId === u.id && t.status === 'Paid')
            return (
              <tr key={u.id} className="border-b border-line hover:bg-surface2">
                <td className="p-3"><Link to={`/admin/users/${u.id}`}><b className="block">{u.name}</b><span className="text-xs text-ink/50">{u.email}</span></Link></td>
                <td>{u.country}</td><td>{u.plan}</td><td>{u.coins}</td><td>{money(spentBy(u.id))}</td>
                <td className="text-ink/70">{last ? <>{last.method}<span className="block text-xs text-ink/40">{last.date}</span></> : '–'}</td>
                <td className="text-ink/55">{u.joined}</td>
                <td className="pr-3 text-right"><Link to={`/admin/users/${u.id}`} className="text-xs font-semibold text-accent">View</Link></td>
              </tr>)
          })}</tbody></table>
      </div>
      {me && <p className="text-xs text-ink/40 mt-3">Your own demo account ({me.email}) is shown under Purchases as "You (demo)".</p>}
    </div>
  )
}

function UserDetail() {
  const { id } = useParams()
  const { refunds, refund } = useStore()
  const toast = useToast((t) => t.show)
  const u = users.find((x) => x.id === id)
  if (!u) return <div>User not found. <Link to="/admin/users" className="underline">Back to users</Link></div>
  const txs = adminTx.filter((t) => t.userId === u.id).map((t) => (refunds[t.txnId] ? { ...t, status: 'Refunded' as const } : t))
  const facts: [string, string][] = [['Plan', u.plan], ['Coin balance', String(u.coins)], ['Total paid', money(spentBy(u.id))], ['Joined', u.joined], ['Last active', u.lastActive], ['Signed up on', u.platform]]
  return (
    <div className="max-w-6xl">
      <Link to="/admin/users" className="text-sm text-ink/55 flex items-center gap-1 mb-3"><ArrowLeft size={14} />Back to users</Link>
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-full bg-accent text-white flex items-center justify-center text-xl font-bold">{u.name[0]}</div>
        <div><h1 className="text-2xl font-bold">{u.name}</h1><p className="text-sm text-ink/55">{u.email} · {u.country}</p></div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mb-6">{facts.map(([k, v]) => <div key={k} className={`${card} !p-4`}><div className="text-xs text-ink/50">{k}</div><div className="font-bold mt-1">{v}</div></div>)}</div>
      <h2 className="text-lg font-bold mb-3">Payments and transactions</h2>
      <div className={`${card} p-0 overflow-x-auto`}>
        <table className="w-full text-sm whitespace-nowrap"><thead className="text-left text-ink/50 text-xs border-b border-line"><tr><th className="p-3">Transaction ID</th><th>Date</th><th>Item</th><th>Amount</th><th>Payment method</th><th>Platform</th><th>Provider reference</th><th>Status</th><th></th></tr></thead>
          <tbody>{txs.map((t) => (
            <tr key={t.txnId} className="border-b border-line">
              <td className={`p-3 ${mono}`}>{t.txnId}</td><td>{t.date}</td><td>{t.item}</td><td className="font-semibold">{money(t.amount)}</td><td>{t.method}</td><td>{t.platform}</td><td className={mono}>{t.ref}</td>
              <td><span className={statusPill(t.status)}>{t.status}</span></td>
              <td className="pr-3 text-right">{t.status === 'Paid' && <button onClick={() => { refund(t.txnId); toast(`Refund recorded for ${t.txnId}`) }} className="text-xs font-semibold text-ink/60 hover:text-ink underline">Refund</button>}</td>
            </tr>))}</tbody></table>
      </div>
      <p className="text-xs text-ink/40 mt-3">Web payments show the card or wallet used. In the iOS and Android apps, purchases go through the App Store or Google Play and the store handles refunds.</p>
    </div>
  )
}

function Purchases() {
  const { tx, refunds, refund, user } = useStore()
  const toast = useToast((t) => t.show)
  const [q, setQ] = useState('')
  const [st, setSt] = useState('All')
  const mine = tx.filter((t) => t.money != null).map((t) => ({ txnId: t.txnId, ref: t.ref, date: t.date, user: `${user?.name ?? 'You'} (demo)`, item: t.label, amount: t.money!, method: t.method, platform: 'Web' as const, status: 'Paid' as const }))
  const rows = [...mine, ...adminTx].map((t) => (refunds[t.txnId] ? { ...t, status: 'Refunded' as const } : t))
    .filter((t) => (st === 'All' || t.status === st) && (t.txnId + t.user + t.item + t.method).toLowerCase().includes(q.toLowerCase()))
  return (
    <div>
      <h1 className="text-2xl font-bold">Purchases</h1>
      <p className="text-sm text-ink/55 mt-1 mb-5">Every payment on the platform. Search by transaction ID, customer or payment method.</p>
      <div className="flex flex-wrap gap-3 mb-4">
        <input value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search purchases" placeholder="Search transaction ID, customer, method" className="flex-1 min-w-[240px] max-w-md bg-surface border border-line rounded-md px-3.5 py-2.5 text-sm outline-none focus:border-ink/60" />
        <select value={st} onChange={(e) => setSt(e.target.value)} aria-label="Filter by status" className="bg-surface border border-line rounded-md px-3 py-2.5 text-sm">{['All', 'Paid', 'Refunded', 'Failed'].map((x) => <option key={x}>{x}</option>)}</select>
      </div>
      <div className={`${card} p-0 overflow-x-auto`}>
        <table className="w-full text-sm whitespace-nowrap"><thead className="text-left text-ink/50 text-xs border-b border-line"><tr><th className="p-3">Transaction ID</th><th>Date</th><th>Customer</th><th>Item</th><th>Amount</th><th>Payment method</th><th>Platform</th><th>Provider reference</th><th>Status</th><th></th></tr></thead>
          <tbody>{rows.map((t) => (
            <tr key={t.txnId} className="border-b border-line">
              <td className={`p-3 ${mono}`}>{t.txnId}</td><td>{t.date}</td><td>{t.user}</td><td>{t.item}</td><td className="font-semibold">{money(t.amount)}</td><td>{t.method}</td><td>{t.platform}</td><td className={mono}>{t.ref}</td>
              <td><span className={statusPill(t.status)}>{t.status}</span></td>
              <td className="pr-3 text-right">{t.status === 'Paid' && <button onClick={() => { refund(t.txnId); toast(`Refund recorded for ${t.txnId}`) }} className="text-xs font-semibold text-ink/60 hover:text-ink underline">Refund</button>}</td>
            </tr>))}
            {!rows.length && <tr><td colSpan={10} className="p-6 text-center text-ink/50">No payments match that search.</td></tr>}</tbody></table>
      </div>
    </div>
  )
}

export default function Admin() {
  return (
    <div className="min-h-full flex bg-bg">
      <aside className="w-60 shrink-0 bg-surface border-r border-line p-4 hidden md:block">
        <div className="text-accent mb-8 flex items-center gap-2"><Logo size={24} /> <span className="text-xs text-ink/45 font-medium tracking-normal ml-1">Admin</span></div>
        {nav.map((n) => <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm mb-1 ${isActive ? 'bg-bg text-ink font-semibold' : 'text-ink/60 hover:bg-bg'}`}><n.icon size={17} />{n.label}</NavLink>)}
        <Link to="/" className="flex items-center gap-2 text-xs text-ink/40 mt-8 px-3"><ArrowLeft size={13} />Back to user app</Link>
      </aside>
      <main className="flex-1 min-w-0 p-5 md:p-8">
        <div className="md:hidden flex gap-2 overflow-x-auto no-scrollbar mb-4">{nav.map((n) => <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => `shrink-0 px-3 py-1.5 rounded-full text-xs ${isActive ? 'btn-primary' : 'bg-surface2'}`}>{n.label}</NavLink>)}</div>
        <Routes>
          <Route index element={<Dashboard />} />
          <Route path="shows" element={<Shows />} />
          <Route path="shows/new" element={<AddShow />} />
          <Route path="shows/:id" element={<ShowEdit />} />
          <Route path="pricing" element={<Pricing />} />
          <Route path="users" element={<Users_ />} />
          <Route path="users/:id" element={<UserDetail />} />
          <Route path="purchases" element={<Purchases />} />
        </Routes>
      </main>
      <Toast />
    </div>
  )
}
