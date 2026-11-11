import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { ChevronLeft, Heart, List, Lock, Pause, Play, SkipForward, Crown, Check, MessageCircle, Share2, Settings, Download } from 'lucide-react'
import { useStore, hasAccess } from '../store'
import { Coin, Sheet, useToast } from '../components/ui'
import { fmtTime, videoSrc, coverSrc, choiceFor, captionAt, LANGS } from '../data'

const SPEEDS = [0.75, 1, 1.25, 1.5, 2]
const SAMPLE_COMMENTS = [{ id: 'x1', name: 'Ava', text: 'That ending!! Need the next one right now.', date: '' }, { id: 'x2', name: 'Marcus', text: 'Called it in episode 2.', date: '' }, { id: 'x3', name: 'Priya', text: 'The acting here is so good.', date: '' }]

const roundBtn = 'w-11 h-11 rounded-full bg-black/45 backdrop-blur text-white flex items-center justify-center hover:bg-black/65'

export default function Player() {
  const { id, ep } = useParams()
  const n = Number(ep)
  const nav = useNavigate()
  const s = useStore()
  const toast = useToast((t) => t.show)
  const show = s.shows.find((x) => x.id === id)
  const eps = show?.episodes.filter((e) => e.status === 'published') ?? []
  const episode = eps.find((e) => e.n === n)
  const [t, setT] = useState(0)
  const [playing, setPlaying] = useState(true)
  const [drawer, setDrawer] = useState(false)
  const [unlockOpen, setUnlockOpen] = useState(false)
  const [sheet, setSheet] = useState<'none' | 'comments' | 'settings'>('none')
  const [speed, setSpeed] = useState(1)
  const [draft, setDraft] = useState('')
  const touch = useRef(0)
  const vid = useRef<HTMLVideoElement>(null)
  const open = !!show && !!episode && hasAccess(s, show.id, episode)
  const idx = eps.findIndex((e) => e.n === n)
  const next = eps[idx + 1]
  const prev = eps[idx - 1]
  const key = `${id}:${n}`
  const choice = show ? choiceFor(show, n) : null
  const chosen = s.choices[key]
  const showChoice = open && !!choice && !chosen && !!episode && t >= episode.secs - 10

  useEffect(() => { setT(0); setPlaying(true); setUnlockOpen(!open) }, [id, ep]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (open && show) s.setProgress(show.id, n) }, [open, id, ep]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const v = vid.current
    if (!v) return
    if (playing) v.play().catch(() => {})
    else v.pause()
  }, [playing, open, id, ep])
  useEffect(() => {
    if (!open || !playing || !episode) return
    const i = setInterval(() => setT((x) => x + 1), 1000 / speed)
    return () => clearInterval(i)
  }, [open, playing, episode, speed])
  useEffect(() => { if (vid.current) vid.current.playbackRate = speed }, [speed, open, id, ep])
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' && eps.some((x) => x.n === n + 1)) nav(`/watch/${id}/${n + 1}`, { replace: true })
      else if (e.key === 'ArrowUp' && n > 1) nav(`/watch/${id}/${n - 1}`, { replace: true })
      else if (e.key === ' ' && open) { e.preventDefault(); setPlaying((p) => !p) }
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [id, n, open, eps.length]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (episode && t >= episode.secs && next && !(choice && !chosen)) nav(`/watch/${id}/${next.n}`, { replace: true }) }, [t]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!show || !episode) return <div className="p-6 pt-20">Episode not available. <Link to="/" className="underline">Home</Link></div>
  const go = (e?: { n: number }) => e && nav(`/watch/${show.id}/${e.n}`, { replace: true })
  const unlockNow = () => {
    if (s.unlock(show.id, n, episode.price)) { toast(`Episode ${n} unlocked`); setUnlockOpen(false) }
  }
  const short = s.coins < episode.price
  const downloaded = s.downloads.includes(key)
  const comments = [...(s.comments[key] ?? []), ...SAMPLE_COMMENTS]
  const share = async () => {
    const url = `${location.origin}${location.pathname}#/show/${show.id}`
    try { await navigator.clipboard.writeText(url); toast('Link copied') } catch { toast(url) }
  }
  const download = () => {
    if (!open) return toast('Unlock this episode to download it')
    s.toggleDownload(key)
    toast(downloaded ? 'Download removed' : 'Saved for offline (simulated)')
  }
  const pick = (c: 'a' | 'b') => { s.setChoice(key, c); go(eps.find((e) => e.n === n + (c === 'a' ? 1 : 2)) ?? next) }
  const sendComment = () => { if (draft.trim()) { s.addComment(key, draft.trim()); setDraft('') } }
  const chip = (on: boolean) => `px-3.5 py-1.5 rounded-full text-[13px] font-semibold border ${on ? 'chip-on' : 'border-line text-ink/75'}`
  const buy = () => nav(`/coins?return=${encodeURIComponent(`/watch/${show.id}/${n}`)}`)

  return (
    <div className="absolute inset-0 bg-black flex justify-center">
      <div className="relative h-full w-full @3xl:w-auto @3xl:aspect-[9/16] @3xl:max-w-full overflow-hidden bg-black select-none" onTouchStart={(e) => (touch.current = e.touches[0].clientY)} onTouchEnd={(e) => { const d = touch.current - e.changedTouches[0].clientY; if (d > 60) go(next); if (d < -60) go(prev) }} onWheel={(e) => { if (e.deltaY > 40) go(next); if (e.deltaY < -40) go(prev) }}>
        {/* Real clip (vertical 9:16). The episode timeline runs over a looping sample clip in this prototype. */}
        {open ? (
          <video key={`${show.id}-${n}`} ref={vid} src={videoSrc(show)} poster={coverSrc(show)} onLoadedMetadata={(e) => { const v = e.currentTarget; if (v.duration) v.currentTime = ((n - 1) * 1.7) % Math.max(1, v.duration - 1) }} className="absolute inset-0 w-full h-full object-cover" autoPlay muted loop playsInline preload="auto" disablePictureInPicture controlsList="nodownload noplaybackrate" onContextMenu={(e) => e.preventDefault()} />
        ) : (
          <img src={coverSrc(show)} alt="" className="absolute inset-0 w-full h-full object-cover blur-md scale-110 brightness-50" />
        )}
        <button className="absolute inset-0" onClick={() => open && setPlaying((p) => !p)} aria-label="Play or pause">
          {open && !playing && <span className="absolute inset-0 m-auto w-[76px] h-[76px] rounded-full bg-black/55 border border-white/70 flex items-center justify-center"><Play size={32} fill="#fff" /></span>}
        </button>

        {/* Top bar */}
        <div className="absolute top-0 inset-x-0 scrim-t pt-4 pb-10 px-3 flex items-start gap-2 pointer-events-none">
          <button onClick={() => nav(`/show/${show.id}`)} className="pointer-events-auto w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/15" aria-label="Back"><ChevronLeft size={26} /></button>
          <div className="flex-1 min-w-0 pt-0.5"><div className="font-bold text-[15px] truncate">{show.title}</div><div className="text-xs text-white/75">Episode {n}: {episode.title}</div></div>
          <div className="flex items-center gap-1.5 text-sm font-semibold bg-black/45 backdrop-blur rounded-full pl-1.5 pr-3 py-1"><Coin size={20} />{s.coins}</div>
        </div>
        {open && <div className="absolute top-[72px] right-3 text-[11px] font-medium text-white/55 pointer-events-none [text-shadow:0_1px_4px_rgba(0,0,0,.7)]">ID {s.user?.uid}</div>}

        {/* Side actions */}
        <div className="absolute right-3 bottom-28 flex flex-col items-center gap-3">
          <button onClick={() => s.toggleFav(show.id)} className={roundBtn} aria-label="Add to my list"><Heart size={22} className={s.favs.includes(show.id) ? 'fill-[#FF2E63] text-[#FF2E63]' : ''} /></button>
          <button onClick={() => setSheet('comments')} className={roundBtn} aria-label="Comments"><MessageCircle size={21} /></button>
          <button onClick={share} className={roundBtn} aria-label="Share"><Share2 size={20} /></button>
          <button onClick={() => setDrawer(true)} className={roundBtn} aria-label="Episodes"><List size={22} /></button>
          <button onClick={() => setSheet('settings')} className={roundBtn} aria-label="Subtitles, speed and download"><Settings size={21} /></button>
          <button onClick={() => go(next)} disabled={!next} className={`${roundBtn} disabled:opacity-40`} aria-label="Next episode"><SkipForward size={22} /></button>
        </div>

        {open && s.lang !== 'Off' && playing && <div className="absolute inset-x-12 bottom-20 text-center text-[15px] font-semibold pointer-events-none"><span className="bg-black/60 px-2.5 py-1 rounded leading-snug box-decoration-clone">{captionAt(s.lang, t)}</span></div>}
        {showChoice && choice && (
          <div className="absolute inset-x-0 bottom-24 z-20 px-4 anim-fade">
            <div className="bg-black/75 backdrop-blur rounded-xl p-4">
              <p className="text-[11px] uppercase tracking-wide text-accent font-bold text-center">Interactive · your choice shapes what happens next</p>
              <p className="text-center font-bold text-lg mt-1 mb-3">{choice.q}</p>
              <div className="grid grid-cols-2 gap-2"><button onClick={() => pick('a')} className="btn-play py-3 text-sm">{choice.a}</button><button onClick={() => pick('b')} className="btn-ghost py-3 text-sm">{choice.b}</button></div>
            </div>
          </div>
        )}

        {/* Bottom controls */}
        <div className="absolute bottom-0 inset-x-0 scrim-b pt-16 pb-5 px-4">
          <div className="flex items-center gap-3">
            <button onClick={() => open && setPlaying((p) => !p)} aria-label={playing ? 'Pause' : 'Play'} className="text-white">{playing ? <Pause size={24} fill="#fff" /> : <Play size={24} fill="#fff" />}</button>
            <div className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-[#FF2E63] to-[#FF7A1A]" style={{ width: `${open ? Math.min(100, (t / episode.secs) * 100) : 0}%` }} /></div>
            <span className="text-xs text-white/80 tabular-nums">{fmtTime(open ? t : 0)} / {fmtTime(episode.secs)}</span>
          </div>
        </div>

        {!open && !unlockOpen && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center">
            <Lock size={34} />
            <p className="font-bold text-xl mt-3">Episode {n} is locked</p>
            <button onClick={() => setUnlockOpen(true)} className="btn-play mt-4 px-7 py-3">See unlock options</button>
          </div>
        )}

        {!open && unlockOpen && (
          <Sheet title={`Unlock episode ${n}`} onClose={() => (prev ? go(prev) : nav(`/show/${show.id}`))}>
            <p className="text-sm text-ink/65 mb-4">Episodes 1 to 3 are free. Keep watching with coins or Premium.</p>
            <button onClick={short ? buy : unlockNow} className="w-full flex items-center justify-between border border-line rounded-md p-4 mb-3 hover:border-ink/60 text-left">
              <span><span className="block font-semibold">{short ? 'Not enough coins' : 'Unlock with coins'}</span><span className="text-xs text-ink/55">{short ? `You have ${s.coins}, you need ${episode.price - s.coins} more` : `${s.coins - episode.price} coins left afterwards`}</span></span>
              <span className="flex items-center gap-1.5 font-bold text-lg"><Coin size={20} />{episode.price}</span>
            </button>
            {short && <button onClick={buy} className="btn-play w-full py-3.5 mb-3">Add coins</button>}
            <button onClick={() => nav('/plans')} className="w-full flex items-center gap-3 bg-surface2 rounded-md p-4 text-left hover:bg-line">
              <Crown size={20} className="text-accent shrink-0" /><span className="flex-1"><span className="block font-semibold">Go Premium</span><span className="text-xs text-ink/60">Every episode, from $4.99 a week</span></span>
            </button>
          </Sheet>
        )}

        {sheet === 'settings' && (
          <Sheet title="Playback settings" onClose={() => setSheet('none')}>
            <p className="text-sm font-semibold mb-2">Subtitles</p>
            <div className="flex flex-wrap gap-2 mb-5">{LANGS.map((l) => <button key={l} onClick={() => s.setLang(l)} className={chip(s.lang === l)}>{l}</button>)}</div>
            <p className="text-sm font-semibold mb-2">Speed</p>
            <div className="flex flex-wrap gap-2 mb-5">{SPEEDS.map((x) => <button key={x} onClick={() => setSpeed(x)} className={chip(speed === x)}>{x}x</button>)}</div>
            <button onClick={download} className="w-full flex items-center gap-3 bg-surface2 rounded-md p-4 text-left hover:bg-line"><Download size={19} className="shrink-0" /><span className="flex-1"><span className="block font-semibold">{downloaded ? 'Downloaded' : 'Download episode'}</span><span className="text-xs text-ink/60">{open ? 'Watch offline. Simulated in this prototype.' : 'Unlock this episode first.'}</span></span>{downloaded && <Check size={16} className="text-accent" />}</button>
            <p className="text-[11px] text-ink/40 mt-3">Subtitle lines are samples until real captions are added per episode.</p>
          </Sheet>
        )}
        {sheet === 'comments' && (
          <Sheet title={`Comments · Episode ${n}`} onClose={() => setSheet('none')}>
            <div className="flex gap-2 mb-4">
              <input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { e.stopPropagation(); if (e.key === 'Enter') sendComment() }} placeholder="Add a comment" aria-label="Add a comment" className="flex-1 bg-surface2 border border-line rounded-md px-3.5 py-2.5 text-sm outline-none focus:border-ink/60" />
              <button onClick={sendComment} disabled={!draft.trim()} className="btn-primary px-4 text-sm disabled:opacity-45">Post</button>
            </div>
            <ul className="space-y-3.5 max-h-[45dvh] overflow-y-auto no-scrollbar">{comments.map((c) => <li key={c.id} className="flex gap-3"><span className="w-8 h-8 rounded-full bg-surface2 text-xs font-bold flex items-center justify-center shrink-0">{c.name[0]}</span><div><div className="text-xs text-ink/55">{c.name}{c.date ? ` · ${c.date}` : ''}</div><div className="text-sm">{c.text}</div></div></li>)}</ul>
          </Sheet>
        )}

        {drawer && (
          <Sheet title="Episodes" onClose={() => setDrawer(false)}>
            <div className="grid grid-cols-6 gap-2">
              {eps.map((e) => {
                const ok = hasAccess(s, show.id, e)
                return (
                  <button key={e.n} onClick={() => { setDrawer(false); go(e) }} className={`aspect-square rounded text-sm font-semibold flex items-center justify-center relative ${e.n === n ? 'chip-on' : ok ? 'bg-surface2' : 'bg-bg text-ink/45 border border-line'}`}>
                    {e.n}{!ok && <Lock size={9} className="absolute bottom-1 right-1" />}{ok && !e.free && <Check size={9} strokeWidth={4} className="absolute bottom-1 right-1 text-accent" />}
                  </button>
                )
              })}
            </div>
          </Sheet>
        )}
      </div>
    </div>
  )
}
