/** Reelo mark: a vertical 9:16 frame with a play triangle, plus the wordmark. */
export const LogoMark = ({ size = 28, className = '' }: { size?: number; className?: string }) => (
  <svg width={size * 0.62} height={size} viewBox="0 0 18 29" fill="none" className={className} aria-hidden="true">
    <rect x="1.25" y="1.25" width="15.5" height="26.5" rx="3.75" stroke="currentColor" strokeWidth="2.5" />
    <path d="M7 10.2v8.6a.9.9 0 0 0 1.37.77l6.2-4.3a.9.9 0 0 0 0-1.5l-6.2-4.3A.9.9 0 0 0 7 10.2Z" fill="currentColor" transform="translate(-1 0)" />
  </svg>
)

export default function Logo({ size = 26, className = '' }: { size?: number; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 font-extrabold tracking-[-0.045em] leading-none ${className}`} style={{ fontSize: size }}>
      <LogoMark size={size * 1.02} />
      <span className="grad-text">reelo</span>
    </span>
  )
}
