import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { seedShows, seedPlans, seedPacks, type Show, type Episode, type Plan, type Pack } from './data'

export type Tx = { id: string; txnId: string; ref: string; method: string; date: string; label: string; money?: number; coins?: number }
type User = { name: string; email: string; uid: string }
type Sub = { plan: Plan['id']; renews: string } | null

type State = {
  view: 'web' | 'mobile'
  setView: (v: 'web' | 'mobile') => void
  user: User | null
  coins: number
  sub: Sub
  unlocked: Record<string, true>
  favs: string[]
  progress: Record<string, number>
  tx: Tx[]
  shows: Show[]
  plans: Plan[]
  packs: Pack[]
  signIn: (name: string, email: string) => void
  signOut: () => void
  buyCoins: (p: Pack, method?: string) => void
  subscribe: (p: Plan, method?: string) => void
  refunds: Record<string, true>
  refund: (txnId: string) => void
  cancelSub: () => void
  unlock: (showId: string, n: number, price: number) => boolean
  toggleFav: (id: string) => void
  setProgress: (showId: string, n: number) => void
  updateShow: (id: string, patch: Partial<Show>) => void
  updateEpisode: (showId: string, n: number, patch: Partial<Episode>) => void
  bulkEpisodes: (showId: string, patch: (e: Episode) => Partial<Episode>) => void
  addShow: (s: Show) => void
  setPlans: (p: Plan[]) => void
  setPacks: (p: Pack[]) => void
  reset: () => void
}

const today = () => new Date().toISOString().slice(0, 10)
const addDays = (d: number) => new Date(Date.now() + d * 864e5).toISOString().slice(0, 10)
const rnd = (n: number) => Array.from({ length: n }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 32)]).join('')
const ids = () => ({ id: 't' + Date.now() + rnd(2), txnId: `TXN-${today().replace(/-/g, '')}-${rnd(6)}`, ref: 'pi_3' + rnd(20) })
const uid = () => String(10000 + Math.floor(Math.random() * 89999))
const initial = {
  view: 'web' as 'web' | 'mobile',
  user: null as User | null,
  coins: 0,
  sub: null as Sub,
  unlocked: {} as Record<string, true>,
  favs: ['s2'],
  progress: {} as Record<string, number>,
  tx: [] as Tx[],
  refunds: {} as Record<string, true>,
  shows: seedShows,
  plans: seedPlans,
  packs: seedPacks,
}

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      ...initial,
      setView: (view) => set({ view }),
      signIn: (name, email) => set({ user: { name, email, uid: uid() }, coins: get().coins || 50, tx: get().tx.length ? get().tx : [{ ...ids(), method: 'Promotion', date: today(), label: 'Welcome bonus', coins: 50 }] }),
      signOut: () => set({ user: null }),
      buyCoins: (p, method = 'Visa •••• 4242') =>
        set((s) => ({
          coins: s.coins + p.coins + p.bonus,
          tx: [{ ...ids(), method, date: today(), label: `${p.coins + p.bonus} coins`, money: p.price, coins: p.coins + p.bonus }, ...s.tx],
        })),
      subscribe: (p, method = 'Visa •••• 4242') =>
        set((s) => ({
          sub: { plan: p.id, renews: addDays(p.id === 'weekly' ? 7 : p.id === 'monthly' ? 30 : 365) },
          tx: [{ ...ids(), method, date: today(), label: `${p.name} subscription`, money: p.price }, ...s.tx],
        })),
      refund: (txnId) => set((s) => ({ refunds: { ...s.refunds, [txnId]: true } })),
      cancelSub: () => set({ sub: null }),
      unlock: (showId, n, price) => {
        const s = get()
        if (s.coins < price) return false
        set({
          coins: s.coins - price,
          unlocked: { ...s.unlocked, [`${showId}:${n}`]: true },
          tx: [{ ...ids(), method: 'Coins', date: today(), label: `Unlocked ${s.shows.find((x) => x.id === showId)?.title} · Ep ${n}`, coins: -price }, ...s.tx],
        })
        return true
      },
      toggleFav: (id) => set((s) => ({ favs: s.favs.includes(id) ? s.favs.filter((x) => x !== id) : [...s.favs, id] })),
      setProgress: (showId, n) => set((s) => ({ progress: { ...s.progress, [showId]: n } })),
      updateShow: (id, patch) => set((s) => ({ shows: s.shows.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),
      updateEpisode: (showId, n, patch) =>
        set((s) => ({ shows: s.shows.map((x) => (x.id === showId ? { ...x, episodes: x.episodes.map((e) => (e.n === n ? { ...e, ...patch } : e)) } : x)) })),
      bulkEpisodes: (showId, fn) =>
        set((s) => ({ shows: s.shows.map((x) => (x.id === showId ? { ...x, episodes: x.episodes.map((e) => ({ ...e, ...fn(e) })) } : x)) })),
      addShow: (sh) => set((s) => ({ shows: [sh, ...s.shows] })),
      setPlans: (plans) => set({ plans }),
      setPacks: (packs) => set({ packs }),
      reset: () => set({ ...initial, view: get().view }),
    }),
    { name: 'reelo-proto-v5' },
  ),
)

export const hasAccess = (s: { sub: Sub; unlocked: Record<string, true> }, showId: string, e: Episode) =>
  e.free || !!s.sub || !!s.unlocked[`${showId}:${e.n}`]
