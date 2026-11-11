import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, ChevronLeft } from 'lucide-react'
import { useStore } from '../store'
import { Checkout, useToast } from '../components/ui'
import { money, type Plan } from '../data'

export default function Plans() {
  const { plans, sub, subscribe, cancelSub } = useStore()
  const [sel, setSel] = useState<Plan['id']>('monthly')
  const [pay, setPay] = useState(false)
  const toast = useToast((t) => t.show)
  const nav = useNavigate()
  const plan = plans.find((p) => p.id === sel)!
  const base = ['Every eligible episode, no coins needed', 'Ad-free HD vertical playback']
  const perksByPlan: Record<Plan['id'], string[]> = {
    weekly: [...base, 'Billed weekly, so it suits a single binge', 'Cancel anytime'],
    monthly: [...base, 'New episodes the day they release', '50 bonus coins every month', 'Cancel anytime'],
    annual: [...base, 'New episodes the day they release', '100 bonus coins every month', 'Early access to new shows', 'Priority support', 'About 50% cheaper than paying monthly'],
  }
  const perks = perksByPlan[sel]
  return (
    <div className="pb-12 @3xl:max-w-6xl @3xl:mx-auto @3xl:px-10 @3xl:pt-14">
      <button onClick={() => nav(-1)} className="@3xl:hidden m-5 mb-0 flex items-center gap-1 text-sm font-semibold text-ink/70"><ChevronLeft size={18} />Back</button>
      <div className="px-5 @3xl:px-0 pt-5 @3xl:pt-0 @3xl:grid @3xl:grid-cols-2 @3xl:gap-x-20">
        <div>
          <h1 className="text-[38px] @3xl:text-[56px]">Every show.<br />Every episode.</h1>
          <p className="mt-4 text-[16px] text-ink/65 max-w-md leading-relaxed">One subscription replaces buying episodes one at a time. Switch plans or cancel whenever you like.</p>
          {sub && (
            <div className="mt-6 border-l-2 border-ok pl-4 text-sm">
              <div className="font-semibold">You’re on the {plans.find((p) => p.id === sub.plan)?.name} plan</div>
              <div className="text-ink/55 mt-0.5">Renews {sub.renews}</div>
              <button onClick={() => { cancelSub(); toast('Subscription cancelled') }} className="mt-2 text-ink/55 underline underline-offset-2">Cancel subscription</button>
            </div>
          )}
        </div>

        <div className="mt-8 @3xl:mt-0 @3xl:row-span-2">
          <div role="radiogroup" aria-label="Plan" className="border border-line rounded-xl bg-surface divide-y divide-line overflow-hidden">
            {plans.map((p) => (
              <button key={p.id} role="radio" aria-checked={sel === p.id} onClick={() => setSel(p.id)} className={`w-full flex items-center gap-4 px-5 py-5 text-left ${sel === p.id ? 'bg-accent/10' : 'bg-surface hover:bg-bg/60'}`}>
                <span className={`w-5 h-5 rounded-full shrink-0 border ${sel === p.id ? 'border-[6px] border-accent' : 'border-line'}`} />
                <span className="flex-1"><span className="block font-semibold text-lg">{p.name}</span><span className="text-sm text-ink/55">{p.best ? <b className="text-accent font-semibold">Most popular. </b> : null}{p.note}</span></span>
                <span className="text-right"><span className="block text-2xl font-bold tracking-tight">{money(p.price)}</span><span className="text-xs text-ink/50">per {p.per}</span></span>
              </button>
            ))}
          </div>
          <button onClick={() => setPay(true)} className="btn-primary w-full mt-4 py-4 text-base">{sub ? 'Switch to' : 'Subscribe to'} {plan.name.toLowerCase()} for {money(plan.price)}</button>
          <p className="text-xs text-ink/45 mt-3 leading-relaxed">Prices and perks are placeholders until confirmed. Taxes may apply.</p>
        </div>

        <div className="mt-8 @3xl:mt-10">
          <h2 className="text-lg mb-3">What the {plan.name.toLowerCase()} plan includes</h2>
          <ul key={sel} className="space-y-3 anim-fade">{perks.map((x) => <li key={x} className="flex gap-3 text-[15px]"><Check size={18} className="text-ok shrink-0 mt-0.5" />{x}</li>)}</ul>
        </div>
      </div>
      {pay && <Checkout title={`${plan.name} subscription`} amount={money(plan.price)} onClose={() => setPay(false)} onDone={(m) => { subscribe(plan, m); setPay(false); toast('Subscription active'); nav('/account') }} />}
    </div>
  )
}
