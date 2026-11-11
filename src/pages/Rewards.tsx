import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Check, Gift, PlayCircle } from 'lucide-react'
import { useStore, todayStr } from '../store'
import { Coin, Confetti, Sheet, useToast } from '../components/ui'
import { CHECKIN_COINS, AD_REWARD, AD_MAX } from '../data'

export default function Rewards() {
  const { coins, checkin, claimCheckin, ads, watchAd } = useStore()
  const toast = useToast((t) => t.show)
  const nav = useNavigate()
  const [adOpen, setAdOpen] = useState(false)
  const [left, setLeft] = useState(5)
  const [burst, setBurst] = useState(0)
  const today = todayStr()
  const claimed = checkin.last === today
  const adsUsed = ads.date === today ? ads.count : 0
  // Day shown as "next" in the 7-day strip
  const dayIdx = claimed ? (checkin.streak - 1) % 7 : checkin.streak % 7
  useEffect(() => {
    if (!adOpen) return
    if (left <= 0) {
      setAdOpen(false)
      const ok = watchAd()
      if (ok) setBurst((b) => b + 1)
      toast(ok ? `+${AD_REWARD} coins earned` : 'Daily ad limit reached')
      return
    }
    const t = setTimeout(() => setLeft((x) => x - 1), 1000)
    return () => clearTimeout(t)
  }, [adOpen, left]) // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="pb-12 @3xl:max-w-6xl @3xl:mx-auto @3xl:px-10 @3xl:pt-14">
      {burst > 0 && <Confetti key={burst} />}
      <button onClick={() => nav(-1)} className="@3xl:hidden m-5 mb-0 flex items-center gap-1 text-sm font-semibold text-ink/70"><ChevronLeft size={18} />Back</button>
      <div className="px-5 @3xl:px-0 pt-5 @3xl:pt-0">
        <h1 className="text-[34px] @3xl:text-[48px] flex items-center gap-3"><Gift size={34} className="text-accent" />Rewards</h1>
        <p className="mt-2 text-ink/65 flex items-center gap-2">Your balance <Coin size={18} /><b className="text-ink">{coins}</b></p>

        <section className="mt-8 border border-line rounded-xl bg-surface p-5 @3xl:p-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div><h2 className="text-lg">Daily check-in</h2><p className="text-sm text-ink/55 mt-0.5">{checkin.streak ? `${checkin.streak}-day streak. ` : ''}Come back every day for bigger rewards. Miss a day and the streak restarts.</p></div>
            <button disabled={claimed} onClick={() => { const c = claimCheckin(); if (c) { setBurst((b) => b + 1); toast(`+${c} coins. See you tomorrow`) } }} className={`btn-primary px-6 py-3 text-sm disabled:opacity-45 disabled:cursor-not-allowed ${claimed ? '' : 'pulse-glow'}`}>{claimed ? 'Claimed today' : `Claim ${CHECKIN_COINS[dayIdx]} coins`}</button>
          </div>
          <div className="mt-5 grid grid-cols-7 gap-2">
            {CHECKIN_COINS.map((c, i) => {
              const done = claimed ? i <= dayIdx : i < dayIdx
              const now = !claimed && i === dayIdx
              return (
                <div key={i} className={`rounded-lg py-3 text-center border ${now ? 'border-accent bg-accent/10' : 'border-line bg-bg'} ${done ? 'opacity-60' : ''}`}>
                  <div className="text-[11px] text-ink/55">Day {i + 1}</div>
                  <div className="my-1.5 flex justify-center">{done ? <Check size={18} className="text-ok" /> : <Coin size={18} />}</div>
                  <div className="text-sm font-bold">+{c}</div>
                </div>
              )
            })}
          </div>
        </section>

        <section className="mt-5 border border-line rounded-xl bg-surface p-5 @3xl:p-6 flex items-center justify-between gap-4 flex-wrap">
          <div><h2 className="text-lg flex items-center gap-2"><PlayCircle size={20} />Watch an ad, get coins</h2><p className="text-sm text-ink/55 mt-0.5">+{AD_REWARD} coins per ad, up to {AD_MAX} a day. Today: {adsUsed} of {AD_MAX}.</p></div>
          <button disabled={adsUsed >= AD_MAX} onClick={() => { setLeft(5); setAdOpen(true) }} className="btn-primary px-6 py-3 text-sm disabled:opacity-45 disabled:cursor-not-allowed">{adsUsed >= AD_MAX ? 'Come back tomorrow' : 'Watch ad'}</button>
        </section>

        <section className="mt-8">
          <h2 className="text-lg mb-3">More ways to earn</h2>
          <ul className="text-[15px] space-y-2.5 text-ink/80 list-disc pl-5">
            <li>Welcome bonus of 50 coins when you create an account.</li>
            <li>Bonus coins on every coin pack.</li>
            <li>Monthly and annual Premium members get bonus coins each month.</li>
          </ul>
          <p className="text-xs text-ink/45 mt-5">Reward amounts are placeholders until confirmed. In this prototype the ad is simulated.</p>
        </section>
      </div>
      {adOpen && (
        <Sheet title="Sponsored" onClose={() => setAdOpen(false)}>
          <div className="aspect-video rounded-md bg-surface2 flex flex-col items-center justify-center text-center"><span className="text-xs text-ink/50">Ad placeholder</span><span className="mt-1 text-3xl font-bold tabular-nums">{left}</span></div>
          <p className="text-sm text-ink/60 mt-3">Stay until the timer ends to earn {AD_REWARD} coins.</p>
        </Sheet>
      )}
    </div>
  )
}
