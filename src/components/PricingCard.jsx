import { useNavigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth'

export default function PricingCard({ name, price, period, features, cta, featured = false, delay = 0 }) {
  const navigate         = useNavigate()
  const { isAuthenticated } = useAuth()

  const handleCta = () => {
    if (name === 'Enterprise') { document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }); return }
    isAuthenticated ? navigate('/check') : navigate('/register')
  }

  return (
    <div
      className="fade-up"
      style={{
        background:    featured ? 'var(--navy)'  : 'var(--white)',
        borderRadius:  20,
        border:        `${featured ? '2px' : '1.5px'} solid ${featured ? 'var(--teal)' : 'var(--border)'}`,
        padding:       '2rem',
        position:      'relative',
        transform:     featured ? 'scale(1.04)' : 'none',
        boxShadow:     featured ? '0 20px 60px rgba(13,148,136,.2)' : 'none',
        animationDelay:`${delay}s`,
        transition:    'transform .3s, box-shadow .3s',
      }}
    >
      {/* Popular badge */}
      {featured && (
        <div style={{
          position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)',
          background: 'var(--teal)', color: '#fff',
          fontSize: '.68rem', fontWeight: 800,
          padding: '4px 18px', borderRadius: 100,
          letterSpacing: '.06em', textTransform: 'uppercase', whiteSpace: 'nowrap',
        }}>
          Most Popular
        </div>
      )}

      {/* Plan name */}
      <p style={{
        fontSize: '.78rem', fontWeight: 700,
        color: featured ? 'rgba(255,255,255,.45)' : 'var(--slate)',
        textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '.75rem',
      }}>
        {name}
      </p>

      {/* Price */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: '1.5rem' }}>
        {price !== 'Custom' && (
          <span style={{ fontSize: '1.1rem', fontWeight: 700, color: featured ? '#fff' : 'var(--navy)' }}>₹</span>
        )}
        <span style={{
          fontFamily: 'var(--font-head)', fontSize: '2.8rem', fontWeight: 800,
          color: featured ? '#fff' : 'var(--navy)', lineHeight: 1,
        }}>
          {price}
        </span>
        <span style={{ fontSize: '.82rem', color: featured ? 'rgba(255,255,255,.38)' : 'var(--muted)' }}>
          {period}
        </span>
      </div>

      {/* Features */}
      <ul style={{ marginBottom: '2rem' }}>
        {features.map(f => (
          <li key={f} style={{
            display: 'flex', alignItems: 'flex-start', gap: '.6rem',
            padding: '.48rem 0',
            borderBottom: `1px solid ${featured ? 'rgba(255,255,255,.08)' : 'var(--border)'}`,
            fontSize: '.88rem', color: featured ? 'rgba(255,255,255,.72)' : 'var(--slate)',
          }}>
            <span style={{ color: 'var(--teal)', fontWeight: 700, flexShrink: 0, marginTop: 1 }}>✓</span>
            {f}
          </li>
        ))}
      </ul>

      {/* CTA */}
      <button
        onClick={handleCta}
        className={featured ? 'btn btn-primary btn-full' : 'btn btn-ghost btn-full'}
        style={!featured ? { fontWeight: 700 } : {}}
      >
        {cta}
      </button>
    </div>
  )
}
