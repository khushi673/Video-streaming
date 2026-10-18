import { useEffect, useState, type ReactNode } from 'react'
import { create } from 'zustand'
import { Check, X, CreditCard, Lock, Monitor, Smartphone, Gem } from 'lucide-react'
import { useStore } from '../store'
import { coverSrc, type Show } from '../data'

export const Coin = ({ size = 16 }: { size?: number }) => (
  <span className="inline-flex items-center justify-center rounded-full font-bold text-bg bg-ink shrink-0 align-middle" style={{ width: size, height: size, fontSize: size * 0.56 }}>
    c
  </span>
)

type ToastState = { msg: string | null; show: (m: string) => void }
export const useToast = create<ToastState>((set) => ({
  msg: null,
  show: (m) => {
    set({ msg: m })
    setTimeout(() => set({ msg: null }), 2200)
  },
}))
export const Toast = () => {
  const msg = useToast((s) => s.msg)
  if (!msg) return null
  return (
    <div className="fixed left-1/2 -translate-x-1/2 bottom-24 z-[100] anim-pop bg-white text-[#111] text-sm font-semibold px-4 py-2.5 rounded-md flex items-center gap-2 shadow-xl">
      <Check size={15} /> {msg}
    </div>
  )
}

/** Vertical key art: a frame from the show's own video, with the title set over it. */
export const Poster = ({ show, className = '', gem = false }: { show: Show; className?: string; big?: boolean; gem?: boolean }) => (
  <div className={`@container relative overflow-hidden rounded-[6px] bg-surface2 ${className}`}>
    <img src={coverSrc(show)} alt="" loading="lazy" draggable={false} className="absolute inset-0 w-full h-full object-cover" />
    <div className="absolute inset-x-0 bottom-0 h-[55%] scrim-b opacity-90" />
    {gem && <span title="Unlock with coins or Premium" className="absolute top-[5%] right-[6%] w-[16cqw] h-[16cqw] min-w-[18px] min-h-[18px] rounded-full bg-black/55 text-white flex items-center justify-center"><Gem className="w-[55%] h-[55%]" /></span>}
    <div className="absolute inset-x-0 bottom-0 p-[7cqw] text-white">
      <div className="font-extrabold leading-[1.02] tracking-[-0.03em]" style={{ fontSize: 'clamp(14px, 11cqw, 38px)' }}>{show.title}</div>
      <div className="mt-[1.4cqw] text-white/70 font-medium" style={{ fontSize: 'max(10px, 5cqw)' }}>{show.type === 'AI' ? 'AI series' : 'Live action'}, {show.genre}</div>
    </div>
  </div>
)

export const Sheet = ({ children, onClose, title }: { children: ReactNode; onClose: () => void; title?: string }) => (
  <div className="fixed inset-0 z-50 flex items-end @3xl:items-center @3xl:justify-center anim-fade" onClick={onClose}>
    <div className="absolute inset-0 bg-black/70" />
    <div className="relative w-full @3xl:max-w-md bg-surface text-ink rounded-t-2xl @3xl:rounded-xl border border-line p-5 pb-8 anim-sheet max-h-[90%] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xl">{title}</h3>
        <button onClick={onClose} className="w-8 h-8 rounded-full text-ink/60 hover:bg-surface2 flex items-center justify-center" aria-label="Close"><X size={18} /></button>
      </div>
      {children}
    </div>
  </div>
)

const METHODS: Record<string, string> = { card: 'Visa •••• 4242', apple: 'Apple Pay', google: 'Google Pay' }

/** Simulated payment sheet — no real provider is called. */
export const Checkout = ({ title, amount, onDone, onClose }: { title: string; amount: string; onDone: (method: string) => void; onClose: () => void }) => {
  const [method, setMethod] = useState('card')
  const [phase, setPhase] = useState<'pick' | 'busy' | 'ok'>('pick')
  useEffect(() => {
    if (phase === 'busy') {
      const t = setTimeout(() => setPhase('ok'), 1200)
      return () => clearTimeout(t)
    }
    if (phase === 'ok') {
      const t = setTimeout(() => onDone(METHODS[method]), 900)
      return () => clearTimeout(t)
    }
  }, [phase, onDone, method])
  return (
    <Sheet onClose={phase === 'pick' ? onClose : () => {}} title="Checkout">
      {phase === 'pick' && (
        <>
          <div className="flex justify-between items-baseline py-3 border-y border-line mb-4">
            <span className="text-sm text-ink/70">{title}</span>
            <span className="text-xl font-bold">{amount}</span>
          </div>
          {[['card', 'Credit or debit card', 'Visa ending 4242'], ['apple', 'Apple Pay', 'In the iOS app this uses App Store billing'], ['google', 'Google Pay', 'In the Android app this uses Play Billing']].map(([id, n, d]) => (
            <button key={id} onClick={() => setMethod(id)} className={`w-full flex items-center gap-3 p-3.5 rounded-md mb-2 border text-left ${method === id ? 'border-ink' : 'border-line'}`}>
              <CreditCard size={19} className="text-ink/55" />
              <div className="flex-1"><div className="text-sm font-semibold">{n}</div><div className="text-xs text-ink/50">{d}</div></div>
              <span className={`w-4 h-4 rounded-full border ${method === id ? 'border-[5px] border-accent' : 'border-line'}`} />
            </button>
          ))}
          <button onClick={() => setPhase('busy')} className="btn-primary w-full mt-3 py-3.5 flex items-center justify-center gap-2"><Lock size={15} /> Pay {amount}</button>
          <p className="text-[11px] text-ink/45 text-center mt-3">Prototype only. No payment is taken. A live provider such as Stripe is connected in the build phase.</p>
        </>
      )}
      {phase === 'busy' && <div className="py-12 text-center"><div className="w-8 h-8 mx-auto border-[3px] border-line border-t-accent rounded-full animate-spin" /><p className="mt-4 text-ink/60 text-sm">Processing payment</p></div>}
      {phase === 'ok' && <div className="py-12 text-center anim-pop"><div className="w-12 h-12 mx-auto bg-accent rounded-full flex items-center justify-center"><Check size={26} className="text-white" /></div><p className="mt-4 font-semibold">Payment successful</p></div>}
    </Sheet>
  )
}

export const ViewToggle = ({ className = '', compact = false }: { className?: string; compact?: boolean }) => {
  const { view, setView } = useStore()
  const opt = (v: 'web' | 'mobile', Icon: typeof Monitor, label: string) => (
    <button onClick={() => setView(v)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold ${view === v ? 'bg-white text-[#111]' : 'text-ink/60 hover:text-ink'}`}><Icon size={13} /><span className={compact ? 'hidden @5xl:inline' : ''}>{label}</span></button>
  )
  return <div className={`flex items-center bg-black/40 border border-line rounded-md p-0.5 backdrop-blur ${className}`}>{opt('web', Monitor, 'Web')}{opt('mobile', Smartphone, 'Mobile')}</div>
}

/** Renders children full-width (web view) or inside a phone frame (mobile view, on larger screens).
 *  The inner element is a size container so `@3xl:` styles switch with the frame, not the browser window. */
export const Frame = ({ children, floatingToggle }: { children: ReactNode; floatingToggle: boolean }) => {
  const phone = useStore((s) => s.view) === 'mobile'
  return (
    <div className={`h-[100dvh] ${phone ? 'bg-[#07090C] flex items-center justify-center' : 'bg-bg'}`}>
      {(phone || floatingToggle) && <div className="hidden md:block fixed top-4 right-4 z-[200]"><ViewToggle /></div>}
      <div className={`@container relative w-full h-full ${phone ? 'md:w-[390px] md:h-[min(844px,calc(100dvh-32px))] md:rounded-[38px] md:border-[7px] md:border-[#2a2d34] md:overflow-hidden md:shadow-2xl' : ''}`}>{children}</div>
    </div>
  )
}
