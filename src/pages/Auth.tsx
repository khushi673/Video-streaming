import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useStore } from '../store'
import { Frame } from '../components/ui'
import { coverSrc } from '../data'
import Logo from '../components/Logo'

export default function Auth() {
  const [mode, setMode] = useState<'in' | 'up'>('up')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const signIn = useStore((s) => s.signIn)
  const shows = useStore((s) => s.shows)
  const nav = useNavigate()
  const go = (n = name, e = email) => {
    signIn(n || e.split('@')[0] || 'Guest', e || 'guest@example.com')
    nav('/')
  }
  const inp = 'w-full bg-surface2 border border-line rounded-md px-4 py-3.5 text-[15px] outline-none focus:border-ink/70 placeholder:text-ink/40'
  return (
    <Frame floatingToggle>
      <div className="relative h-full overflow-hidden bg-bg">
        <div className="absolute inset-0 grid grid-cols-4 @3xl:grid-cols-8 opacity-40" aria-hidden="true">
          {shows.slice(0, 8).map((x) => <img key={x.id} src={coverSrc(x)} alt="" className="w-full h-full object-cover" />)}
        </div>
        <div className="absolute inset-0 bg-black/60" />
        <div className="absolute inset-0 scrim-b" />
        <div className="relative h-full overflow-y-auto no-scrollbar flex flex-col">
          <div className="px-6 @3xl:px-12 pt-6 @3xl:pt-8 text-accent"><Logo size={34} /></div>
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="w-full max-w-[420px] bg-black/75 backdrop-blur rounded-lg p-7 @3xl:p-12">
              <h2 className="text-[32px] font-extrabold tracking-tight">{mode === 'up' ? 'Create account' : 'Log in'}</h2>
              <p className="text-ink/60 text-sm mt-1 mb-6">The first 3 episodes of every show are free.</p>
              <div className="space-y-3">
                {mode === 'up' && <input className={inp} placeholder="Name" aria-label="Name" value={name} onChange={(e) => setName(e.target.value)} />}
                <input className={inp} placeholder="Email" aria-label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <input className={inp} placeholder="Password" aria-label="Password" type="password" />
              </div>
              <button onClick={() => go()} className="btn-primary w-full mt-5 py-3.5">{mode === 'up' ? 'Create account' : 'Log in'}</button>
              <div className="flex items-center gap-3 my-5 text-ink/40 text-xs"><div className="flex-1 h-px bg-line" />or<div className="flex-1 h-px bg-line" /></div>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => go('Alex', 'alex@gmail.com')} className="btn-ghost py-3 text-sm">Google</button>
                <button onClick={() => go('Alex', 'alex@icloud.com')} className="btn-ghost py-3 text-sm">Apple</button>
              </div>
              <p className="text-sm text-ink/60 mt-6">{mode === 'up' ? 'Already have an account?' : 'New here?'} <button onClick={() => setMode(mode === 'up' ? 'in' : 'up')} className="font-bold text-ink hover:underline">{mode === 'up' ? 'Log in' : 'Create an account'}</button></p>
              <p className="text-[11px] text-ink/40 mt-4">Prototype notes: new accounts start with 50 coins. Social login is shown for demo and is not yet confirmed for the MVP.</p>
              <Link to="/admin" className="text-xs text-ink/50 underline mt-3 inline-block">Open admin panel</Link>
            </div>
          </div>
        </div>
      </div>
    </Frame>
  )
}
