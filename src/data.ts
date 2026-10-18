export type EpStatus = 'published' | 'draft' | 'scheduled'
export type Episode = {
  n: number
  title: string
  secs: number
  free: boolean
  price: number
  status: EpStatus
  releaseDate?: string
  video?: string
}
export type Show = {
  id: string
  title: string
  type: 'AI' | 'Real'
  genre: string
  synopsis: string
  hue: number
  tags: string[]
  trending: boolean
  isNew: boolean
  status: 'published' | 'draft'
  views: number
  coverUrl?: string
  episodes: Episode[]
}
export type Plan = { id: 'weekly' | 'monthly' | 'annual'; name: string; price: number; per: string; note: string; best?: boolean }
export type Pack = { id: string; coins: number; bonus: number; price: number; popular?: boolean }

export const FREE_EPISODES = 3
export const DEFAULT_PRICE = 25

const hooks = [
  'The Arrival', 'A Secret Kept', 'Midnight Call', 'Cracks Show', 'The Offer', 'Wrong Door', 'Old Photograph',
  'Betrayal', 'Two Truths', 'Last Train', 'The Message', 'Fire Escape', 'Breaking Point', 'Hidden Ledger',
  'Cold Open', 'The Confession', 'Rain Check', 'Leverage', 'No Way Back', 'Showdown',
]

function mk(id: string, title: string, type: 'AI' | 'Real', genre: string, hue: number, eps: number, synopsis: string, trending: boolean, isNew: boolean, views: number): Show {
  const episodes: Episode[] = Array.from({ length: eps }, (_, i) => ({
    n: i + 1,
    title: i === 0 ? 'Pilot' : hooks[(i * 7 + hue) % hooks.length],
    secs: 90 + ((i * 37 + hue) % 31),
    free: i < FREE_EPISODES,
    price: DEFAULT_PRICE,
    status: 'published',
    video: 'sample.mp4',
  }))
  return { id, title, type, genre, synopsis, hue, tags: [], trending, isNew, status: 'published', views, episodes }
}

const TAGS: Record<string, string[]> = {
  s1: ['Fated Lovers', 'Billionaire'], s2: ['Hidden Heir', 'Cyber Underworld'], s3: ['Lost Prince', 'Court Intrigue'], s4: ['Forced Deal', 'Dark Secrets'],
  s5: ['Enemies to Friends', 'Slice of Life'], s6: ['Haunted Signal', 'Time Twist'], s7: ['Second Chance', 'Kitchen Rivals'], s8: ['Underdogs', 'Space Academy'],
  s9: ['Secret Identity', 'Slow Burn'], s10: ['Sworn Oath', 'Last Dragon'], s11: ['Only Witness', 'Cover-up'], s12: ['Time Loop', 'Fated Lovers'],
  s13: ['Night City', 'Strangers to Allies'], s14: ['Odd Couple', 'Cold Open'], s15: ['System Failure', 'Race Against Time'], s16: ['Wrong Wedding', 'Family Chaos'],
}

// hue only seeds the tone fallback; id decides which clip, cover and banner a show uses.
const rawShows: Show[] = [
  mk('s1', 'Billionaire’s Second Chance', 'Real', 'Romance', 340, 58, 'She walked away from his empire. Now he must win her back, one episode at a time.', true, false, 1820000),
  mk('s2', 'Neon Dynasty 2099', 'AI', 'Sci-Fi', 265, 55, 'In a megacity ruled by dynasties of code, a street courier discovers the heir that never existed.', true, true, 1340000),
  mk('s3', 'The Last Heir', 'AI', 'Fantasy', 28, 60, 'A forgotten prince wakes in a kingdom that has already crowned his enemy.', true, false, 990000),
  mk('s4', 'Midnight Contract', 'Real', 'Thriller', 215, 52, 'One signature. One night. A deal that cannot be broken or survived.', false, true, 760000),
  mk('s5', 'Roommate Rules', 'Real', 'Comedy', 150, 56, 'Three strangers, one apartment, and a list of rules everyone is breaking.', true, false, 640000),
  mk('s6', 'Ghost Signal', 'AI', 'Horror', 285, 50, 'A radio in an abandoned station keeps broadcasting tomorrow’s news.', false, true, 410000),
  mk('s7', 'Chef Under Fire', 'Real', 'Drama', 12, 54, 'A disgraced chef gets 30 days to save the restaurant that destroyed her.', true, false, 530000),
  mk('s8', 'Orbit Academy', 'AI', 'Sci-Fi', 190, 57, 'The galaxy’s worst cadets are its only hope.', false, true, 280000),
  mk('s9', 'Heiress in Disguise', 'Real', 'Romance', 320, 53, 'She hides her family name to find out who loves her. One of them already knows.', true, true, 870000),
  mk('s10', 'Dragon’s Oath', 'AI', 'Fantasy', 35, 59, 'A thief swears to guard the last dragon egg and starts a war she cannot win alone.', true, false, 720000),
  mk('s11', 'The Silent Witness', 'Real', 'Thriller', 225, 51, 'The only person who saw the crime has not spoken in ten years. Tonight someone wants her to.', false, true, 455000),
  mk('s12', 'Love on Loop', 'AI', 'Romance', 300, 56, 'Every morning resets. Every night they fall for each other again. Only one remembers.', true, false, 610000),
  mk('s13', 'City of Strangers', 'Real', 'Drama', 205, 55, 'One long night in Paris. Six people who should never have met.', false, true, 330000),
  mk('s14', 'Paws & Problems', 'AI', 'Comedy', 140, 54, 'A llama, a penguin and a very bad idea. A comedy about the worst road trip on ice.', true, false, 580000),
  mk('s15', 'Blackout Protocol', 'AI', 'Sci-Fi', 255, 52, 'When the grid fails, the city’s AI starts making its own rules.', true, true, 505000),
  mk('s16', 'The Wedding Crasher', 'Real', 'Comedy', 355, 50, 'He crashed the wrong wedding. Now he has to stay for the whole weekend.', false, true, 295000),
]
export const seedShows: Show[] = rawShows.map((x) => ({ ...x, tags: TAGS[x.id] ?? [] }))

export const seedPlans: Plan[] = [
  { id: 'weekly', name: 'Weekly', price: 4.99, per: 'week', note: 'Try it out' },
  { id: 'monthly', name: 'Monthly', price: 14.99, per: 'month', note: 'Most flexible', best: true },
  { id: 'annual', name: 'Annual', price: 89.99, per: 'year', note: 'Save ~50%' },
]

export const seedPacks: Pack[] = [
  { id: 'p1', coins: 100, bonus: 0, price: 1.99 },
  { id: 'p2', coins: 300, bonus: 20, price: 4.99 },
  { id: 'p3', coins: 700, bonus: 80, price: 9.99, popular: true },
  { id: 'p4', coins: 1500, bonus: 250, price: 19.99 },
  { id: 'p5', coins: 4000, bonus: 900, price: 49.99 },
]

export const fmtViews = (n: number) => (n >= 1e6 ? (n / 1e6).toFixed(1) + 'M' : Math.round(n / 1e3) + 'K')
export const fmtTime = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`
export const money = (n: number) => '$' + n.toFixed(2)
const STEP: Record<number, number> = { 340: 0, 265: 2, 28: 1, 215: 3, 150: 2, 285: 1, 12: 3, 190: 0 }
const step = (hue: number) => STEP[hue] ?? 1
export const tone = (hue: number, l = 25) => `hsl(216 30% ${l - 9 + step(hue) * 4}%)`
export const toneAlt = (hue: number, l = 25) => `hsl(216 28% ${l - 2 + step(hue) * 4}%)`

/** Each show has its own vertical clip; its cover is a frame from that same clip. */
const assetId = (show: { id: string; hue: number }) => (/^s([1-9]|1[0-6])$/.test(show.id) ? show.id : `s${(Math.floor(show.hue / 10) % 16) + 1}`)
export const videoSrc = (show: { id: string; hue: number }) => `${import.meta.env.BASE_URL}videos/${assetId(show)}.mp4`
export const coverSrc = (show: { id: string; hue: number; coverUrl?: string }) => show.coverUrl ?? `${import.meta.env.BASE_URL}videos/${assetId(show)}.jpg`
export const bannerSrc = (show: { id: string; hue: number; coverUrl?: string }) => show.coverUrl ?? `${import.meta.env.BASE_URL}videos/b${assetId(show).slice(1)}.jpg`
