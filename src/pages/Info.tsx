import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useToast } from '../components/ui'

const NOTE = 'Placeholder text for the prototype. Replace with reviewed copy before launch.'
const PAGES: Record<string, { title: string; body: string[] }> = {
  terms: { title: 'Terms of Service', body: ['By using Reelo you agree to these terms. You must be old enough to use the service in your country.', 'Coins and subscriptions are for personal, non-commercial viewing. Unlocked episodes stay on your account.', NOTE] },
  privacy: { title: 'Privacy Policy', body: ['We collect the information needed to run your account, process payments and improve recommendations.', 'We do not sell your personal data. You can request export or deletion from Contact us.', NOTE] },
  cookies: { title: 'Cookies', body: ['We use essential cookies to keep you signed in and remember preferences such as subtitle language.', NOTE] },
  dmca: { title: 'DMCA and copyright', body: ['If you believe content on Reelo infringes your copyright, send the details to the contact below.', NOTE] },
  help: { title: 'Help centre', body: ['Episodes 1 to 3 of every show are free. Later episodes unlock with coins or a Premium plan.', 'Unlocked episodes stay on your account. Premium gives access to every eligible episode while it is active.', 'Ad rewards are on the Rewards page.', 'Need more help? Use Contact us.'] },
  about: { title: 'About Reelo', body: ['Reelo is a short vertical series platform made to watch in minutes, with live-action shows, AI series, Originals and interactive stories.', NOTE] },
  press: { title: 'Media and public relations', body: ['For press enquiries, interviews and assets, email press@reelo.example.', NOTE] },
}

export default function Info() {
  const { slug = '' } = useParams()
  const toast = useToast((t) => t.show)
  const [text, setText] = useState('')
  const [email, setEmail] = useState('')
  const inp = 'w-full bg-surface2 border border-line rounded-md px-4 py-3 text-[15px] outline-none focus:border-ink/60 placeholder:text-ink/40'
  const page = PAGES[slug]
  const wrap = 'px-5 @3xl:px-0 pt-10 @3xl:pt-20 pb-16 @3xl:max-w-2xl @3xl:mx-auto'
  if (slug === 'contact' || slug === 'feedback') {
    const fb = slug === 'feedback'
    return (
      <div className={wrap}>
        <h1 className="text-[34px] @3xl:text-[44px]">{fb ? 'Send feedback' : 'Contact us'}</h1>
        <p className="mt-3 text-ink/65">{fb ? 'Tell us what to improve. We read everything.' : 'Questions about billing, your account or a show? Email support@reelo.example or send a message below. Support hours: Mon to Sun, placeholder.'}</p>
        <div className="mt-6 space-y-3">
          <input className={inp} placeholder="Your email" aria-label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <textarea className={`${inp} min-h-[140px]`} placeholder={fb ? 'What can we do better?' : 'How can we help?'} aria-label="Message" value={text} onChange={(e) => setText(e.target.value)} />
          <button disabled={!text.trim()} onClick={() => { setText(''); setEmail(''); toast(fb ? 'Thanks for the feedback' : 'Message sent') }} className="btn-primary px-7 py-3 disabled:opacity-45">Send</button>
        </div>
        <p className="text-xs text-ink/45 mt-4">Prototype: messages are not actually sent.</p>
      </div>
    )
  }
  if (!page) return <div className={wrap}>Page not found. <Link to="/" className="underline">Home</Link></div>
  return (
    <div className={wrap}>
      <h1 className="text-[34px] @3xl:text-[44px]">{page.title}</h1>
      <div className="mt-5 space-y-4 text-[16px] text-ink/75 leading-relaxed">{page.body.map((b) => <p key={b}>{b}</p>)}</div>
    </div>
  )
}
