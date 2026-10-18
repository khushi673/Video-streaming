// Sample customers and payments for the admin panel (dummy data, deterministic).
export type PayStatus = 'Paid' | 'Refunded' | 'Failed'
export type AdminTx = { txnId: string; ref: string; date: string; userId: string; user: string; item: string; kind: 'Subscription' | 'Coins'; amount: number; method: string; platform: 'Web' | 'iOS' | 'Android'; status: PayStatus }
export type AdminUser = { id: string; name: string; email: string; country: string; plan: 'Free' | 'Weekly' | 'Monthly' | 'Annual'; coins: number; joined: string; lastActive: string; platform: 'Web' | 'iOS' | 'Android' }

export const users: AdminUser[] = [
  { id: 'u1', name: 'Maya Rodriguez', email: 'maya.r@example.com', country: 'United States', plan: 'Monthly', coins: 120, joined: '2026-07-14', lastActive: '2026-10-14', platform: 'Web' },
  { id: 'u2', name: 'Liam Kowalski', email: 'liam.k@example.com', country: 'Canada', plan: 'Free', coins: 310, joined: '2026-08-02', lastActive: '2026-10-13', platform: 'iOS' },
  { id: 'u3', name: 'Sofia Marchetti', email: 'sofia.m@example.com', country: 'Italy', plan: 'Annual', coins: 640, joined: '2026-06-21', lastActive: '2026-10-15', platform: 'Web' },
  { id: 'u4', name: 'Noah Becker', email: 'noah.b@example.com', country: 'Germany', plan: 'Free', coins: 45, joined: '2026-09-03', lastActive: '2026-10-09', platform: 'Android' },
  { id: 'u5', name: 'Emma Laurent', email: 'emma.l@example.com', country: 'France', plan: 'Weekly', coins: 0, joined: '2026-09-18', lastActive: '2026-10-14', platform: 'Web' },
  { id: 'u6', name: 'Lucas Dubois', email: 'lucas.d@example.com', country: 'Belgium', plan: 'Monthly', coins: 215, joined: '2026-08-27', lastActive: '2026-10-12', platform: 'iOS' },
  { id: 'u7', name: 'Olivia Parker', email: 'olivia.p@example.com', country: 'United Kingdom', plan: 'Free', coins: 880, joined: '2026-05-30', lastActive: '2026-10-11', platform: 'Web' },
  { id: 'u8', name: 'Ethan Walker', email: 'ethan.w@example.com', country: 'United States', plan: 'Free', coins: 25, joined: '2026-10-01', lastActive: '2026-10-10', platform: 'Android' },
]

const web = ['Visa •••• 4242', 'Mastercard •••• 5100', 'PayPal', 'Apple Pay', 'Google Pay', 'Visa •••• 1881']
const items: [string, 'Subscription' | 'Coins', number][] = [
  ['Monthly subscription', 'Subscription', 14.99], ['Weekly subscription', 'Subscription', 4.99], ['Annual subscription', 'Subscription', 89.99],
  ['700 coins', 'Coins', 9.99], ['300 coins', 'Coins', 4.99], ['100 coins', 'Coins', 1.99], ['1,500 coins', 'Coins', 19.99], ['4,000 coins', 'Coins', 49.99],
]
const stat: PayStatus[] = ['Paid', 'Paid', 'Paid', 'Paid', 'Paid', 'Paid', 'Refunded', 'Paid', 'Failed', 'Paid']
let seed = 7
const r = () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296)
const code = (n: number) => Array.from({ length: n }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(r() * 32)]).join('')

export const adminTx: AdminTx[] = users.flatMap((u, ui) =>
  Array.from({ length: 3 + (ui % 3) }, (_, k) => {
    const it = items[Math.floor(r() * items.length)]
    const platform = u.platform
    const method = platform === 'iOS' ? 'App Store' : platform === 'Android' ? 'Google Play' : web[Math.floor(r() * web.length)]
    const day = 1 + Math.floor(r() * 28), month = 9 + (k % 2)
    const date = `2026-${String(month).padStart(2, '0')}-${String(Math.min(day, month === 10 ? 14 : 28)).padStart(2, '0')}`
    return { txnId: `TXN-${date.replace(/-/g, '')}-${code(6)}`, ref: (platform === 'Web' ? 'pi_3' : platform === 'iOS' ? 'apl_' : 'gpa_') + code(18), date, userId: u.id, user: u.name, item: it[0], kind: it[1], amount: it[2], method, platform, status: stat[Math.floor(r() * stat.length)] }
  }),
).sort((a, b) => b.date.localeCompare(a.date))

export const spentBy = (userId: string) => adminTx.filter((t) => t.userId === userId && t.status === 'Paid').reduce((a, t) => a + t.amount, 0)
