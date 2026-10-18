import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { useStore } from '../store'
import { Checkout, Coin, useToast } from '../components/ui'
import { money, DEFAULT_PRICE, type Pack } from '../data'

export default function Coins() {
  const { packs, coins, buyCoins } = useStore()
  const [sel, setSel] = useState<Pack | null>(null)
  const nav = useNavigate()
  const [qs] = useSearchParams()
  const ret = qs.get('return')
  const toast = useToast((t) => t.show)
  return (
    <div className="pb-12 @3xl:max-w-6xl @3xl:mx-auto @3xl:px-10 @3xl:pt-14">
      <button onClick={() => nav(-1)} className="@3xl:hidden m-5 mb-0 flex items-center gap-1 text-sm font-semibold text-ink/70"><ChevronLeft size={18} />Back</button>
      <div className="px-5 @3xl:px-0 pt-5 @3xl:pt-0 @3xl:grid @3xl:grid-cols-2 @3xl:gap-x-20">
        <div>
          <p className="text-sm text-ink/55">Your balance</p>
          <div className="flex items-center gap-3 mt-1 text-[64px] @3xl:text-[88px] font-bold tracking-[-0.05em] leading-none"><Coin size={52} />{coins}</div>
          <p className="mt-5 text-[16px] text-ink/65 max-w-sm leading-relaxed">Unlock single episodes without a subscription. An episode costs about {DEFAULT_PRICE} coins, and an unlocked episode stays yours.</p>
        </div>
        <div className="mt-8 @3xl:mt-0">
          <h2 className="text-lg mb-3">Add coins</h2>
          <div className="border border-line rounded-xl bg-surface divide-y divide-line overflow-hidden">
            {packs.map((p) => (
              <button key={p.id} onClick={() => setSel(p)} className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-bg/60">
                <Coin size={28} />
                <span className="flex-1"><span className="block text-xl font-bold tracking-tight">{p.coins.toLocaleString()} coins</span><span className="text-sm text-ink/55">{p.bonus > 0 ? <span className="text-ok font-semibold">+{p.bonus} bonus</span> : 'No bonus'}{p.popular ? <b className="text-accent font-semibold"> · Most popular</b> : null}</span></span>
                <span className="btn-primary px-4 py-2 text-sm">{money(p.price)}</span>
              </button>
            ))}
          </div>
          <p className="text-xs text-ink/45 mt-3">Package sizes and prices are placeholders until confirmed.</p>
        </div>
      </div>
      {sel && <Checkout title={`${(sel.coins + sel.bonus).toLocaleString()} coins`} amount={money(sel.price)} onClose={() => setSel(null)} onDone={(m) => { buyCoins(sel, m); setSel(null); toast(`${sel.coins + sel.bonus} coins added`); if (ret) nav(ret, { replace: true }) }} />}
    </div>
  )
}
