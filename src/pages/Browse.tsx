import { useParams, Link } from 'react-router-dom'
import { useStore } from '../store'
import { Card } from '../components/Cards'

const titles: Record<string, string> = { ai: 'AI series', live: 'Live action', new: 'New and popular', list: 'My list' }

export default function Browse() {
  const { kind = 'ai' } = useParams()
  const { shows, favs } = useStore()
  const live = shows.filter((s) => s.status === 'published')
  const list =
    kind === 'ai' ? live.filter((s) => s.type === 'AI')
    : kind === 'live' ? live.filter((s) => s.type === 'Real')
    : kind === 'new' ? [...live.filter((s) => s.isNew || s.trending)].sort((a, b) => b.views - a.views)
    : live.filter((s) => favs.includes(s.id))
  return (
    <div className="px-4 @3xl:px-12 pb-10 @3xl:pt-4">
      <h1 className="text-[28px] @3xl:text-4xl font-extrabold tracking-tight">{titles[kind] ?? 'Browse'}</h1>
      <div className="grid grid-cols-3 @3xl:grid-cols-6 @5xl:grid-cols-8 gap-x-3 gap-y-6 @3xl:gap-x-5 mt-6 pb-14">
        {list.map((s) => <Card key={s.id} s={s} />)}
      </div>
      {!list.length && <p className="text-ink/60 text-sm">{kind === 'list' ? <>Your list is empty. Use the plus button on a show to add it. <Link to="/" className="underline text-ink">Find something to watch</Link></> : 'Nothing here yet.'}</p>}
    </div>
  )
}
