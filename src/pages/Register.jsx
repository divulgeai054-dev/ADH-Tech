import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import { registerUser } from '../services/authService'
import { validateRegister } from '../utils/helpers'
import Loader from '../components/Loader'

export default function Register() {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const [form, setForm]     = useState({ name:'', email:'', clinic:'', password:'', confirm:'' })
  const [errors, setErrors] = useState({})
  const [apiErr, setApiErr] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw]   = useState(false)
  const [agreed, setAgreed]   = useState(false)
  const set = k => v => { setForm(f=>({...f,[k]:v})); setErrors(e=>({...e,[k]:''})); setApiErr('') }
  const handleSubmit = async e => {
    e.preventDefault()
    if (!agreed) { setApiErr('Please accept the Terms of Service to continue.'); return }
    const errs = validateRegister(form)
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    try { const { user, token } = await registerUser(form); login(user, token); navigate('/dashboard', { replace:true }) }
    catch (err) { setApiErr(err.message||'Registration failed. Please try again.') }
    finally { setLoading(false) }
  }
  return (
    <div className="auth-layout" style={{ paddingTop:'var(--nav-h)' }}>
      {/* Promo side */}
      <div className="auth-promo-side" style={{ background:'linear-gradient(135deg,var(--navy-mid),var(--teal-dark))' }}>
        <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(255,255,255,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.03) 1px,transparent 1px)', backgroundSize:'40px 40px', pointerEvents:'none' }} />
        <div className="fade-up" style={{ color:'#fff', maxWidth:380, position:'relative', zIndex:1 }}>
          <Link to="/" style={{ display:'flex', alignItems:'center', gap:10, marginBottom:'2rem', textDecoration:'none' }}>
            <div style={{ width:36, height:36, background:'linear-gradient(135deg,var(--teal),var(--accent))', borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <svg width="19" height="19" viewBox="0 0 24 24" fill="white"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
            </div>
            <span style={{ fontFamily:'var(--font-head)', fontSize:'1.2rem', fontWeight:800 }}>DivulgeAI</span>
          </Link>
          <h2 style={{ fontFamily:'var(--font-head)', fontSize:'1.9rem', fontWeight:800, marginBottom:'1rem', lineHeight:1.2 }}>Join 1,200+ Dental Professionals</h2>
          <p style={{ color:'rgba(255,255,255,.62)', lineHeight:1.75, marginBottom:'2rem' }}>Start detecting caries earlier with the most accurate AI diagnostic platform built for dentists.</p>
          <div style={{ display:'flex', flexDirection:'column', gap:'.65rem' }}>
            {[['🚀','Up and running in under 5 minutes'],['🆓','10 free analyses — no credit card needed'],['🔒','HIPAA-compliant & fully encrypted'],['📞','Dedicated onboarding support'],['🌍','Used in 48+ countries worldwide']].map(([icon,text])=>(
              <div key={text} style={{ display:'flex', alignItems:'center', gap:'.85rem', background:'rgba(255,255,255,.07)', borderRadius:10, padding:'.8rem 1rem' }}>
                <span style={{ fontSize:18 }}>{icon}</span>
                <span style={{ fontSize:'.88rem', color:'rgba(255,255,255,.82)' }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Form side */}
      <div className="auth-form-side">
        <div className="auth-box">
          <h2 style={{ fontFamily:'var(--font-head)', fontSize:'clamp(1.4rem,4vw,1.75rem)', fontWeight:800, color:'var(--navy)', marginBottom:'.4rem' }}>Create your account</h2>
          <p style={{ color:'var(--slate)', fontSize:'.88rem', marginBottom:'1.75rem' }}>Free forever on Starter plan. Upgrade anytime.</p>
          {apiErr && <div className="alert alert-error" style={{ marginBottom:'1.25rem' }}>⚠ {apiErr}</div>}
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group"><label className="form-label">Full Name *</label><input className={`form-input${errors.name?' error':''}`} value={form.name} onChange={e=>set('name')(e.target.value)} placeholder="Dr. Priya Sharma" autoComplete="name" />{errors.name&&<p className="form-error">⚠ {errors.name}</p>}</div>
            <div className="form-group"><label className="form-label">Email Address *</label><input className={`form-input${errors.email?' error':''}`} type="email" value={form.email} onChange={e=>set('email')(e.target.value)} placeholder="doctor@clinic.com" autoComplete="email" />{errors.email&&<p className="form-error">⚠ {errors.email}</p>}</div>
            <div className="form-group"><label className="form-label">Clinic / Hospital</label><input className="form-input" value={form.clinic} onChange={e=>set('clinic')(e.target.value)} placeholder="Apollo Dental Centre" /></div>
            <div className="form-group">
              <label className="form-label">Password * <span style={{ fontWeight:400, color:'var(--muted)' }}>(min. 6 chars)</span></label>
              <div style={{ position:'relative' }}>
                <input className={`form-input${errors.password?' error':''}`} type={showPw?'text':'password'} value={form.password} onChange={e=>set('password')(e.target.value)} placeholder="Choose a strong password" style={{ paddingRight:'2.8rem' }} autoComplete="new-password" />
                <button type="button" onClick={()=>setShowPw(s=>!s)} style={{ position:'absolute', right:'.85rem', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', fontSize:17 }}>{showPw?'🙈':'👁'}</button>
              </div>
              {errors.password&&<p className="form-error">⚠ {errors.password}</p>}
            </div>
            <div className="form-group"><label className="form-label">Confirm Password *</label><input className={`form-input${errors.confirm?' error':''}`} type="password" value={form.confirm} onChange={e=>set('confirm')(e.target.value)} placeholder="Repeat your password" autoComplete="new-password" />{errors.confirm&&<p className="form-error">⚠ {errors.confirm}</p>}</div>
            <div style={{ display:'flex', alignItems:'flex-start', gap:'.75rem', margin:'1rem 0 1.5rem' }}>
              <input type="checkbox" id="terms" checked={agreed} onChange={e=>setAgreed(e.target.checked)} style={{ marginTop:3, accentColor:'var(--teal)', width:16, height:16, flexShrink:0, cursor:'pointer' }} />
              <label htmlFor="terms" style={{ fontSize:'.82rem', color:'var(--slate)', lineHeight:1.55, cursor:'pointer' }}>
                I agree to the <span style={{ color:'var(--teal)', fontWeight:700 }}>Terms of Service</span> and <span style={{ color:'var(--teal)', fontWeight:700 }}>Privacy Policy</span>. Data processed per HIPAA guidelines.
              </label>
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ fontSize:'.95rem' }}>
              {loading ? <Loader size="sm" color="#fff" /> : 'Create My Account →'}
            </button>
          </form>
          <div className="divider">or continue with</div>
          {[['🔵','Google'],['⬛','Microsoft']].map(([ico,name])=>(
            <button key={name} type="button" className="btn btn-ghost btn-full" style={{ marginBottom:'.65rem', fontWeight:600 }} onClick={handleSubmit}>{ico} Continue with {name}</button>
          ))}
          <p style={{ textAlign:'center', fontSize:'.85rem', color:'var(--slate)', marginTop:'1.25rem' }}>
            Already have an account? <Link to="/login" style={{ color:'var(--teal)', fontWeight:700 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
