import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Loader from '../components/Loader'
import { bookAppointment, getAvailableSlots } from '../services/appointmentService'
import { MONTH_NAMES, DAY_NAMES_SHORT, getCalendarDays } from '../utils/helpers'

const DOCTORS = [
  { id:'d1', emoji:'👨‍⚕️', name:'Dr. Arjun Mehta', spec:'Conservative Dentistry', rating:'4.9', reviews:340 },
  { id:'d2', emoji:'👩‍⚕️', name:'Dr. Meera Iyer',  spec:'Endodontist',            rating:'4.8', reviews:210 },
  { id:'d3', emoji:'👨‍🔬', name:'Dr. Sandeep Rao', spec:'Oral Radiologist',       rating:'4.9', reviews:158 },
]
const APPT_TYPES = ['Initial Consultation','Caries Treatment','Root Canal Therapy','AI-Assisted Diagnosis Review','Follow-up Visit']
const STEPS = ['Choose Doctor','Date & Time','Your Details','Confirm']

export default function Appointment() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [done, setDone] = useState(false)
  const [busy, setBusy] = useState(false)
  const [bookedAppt, setBookedAppt] = useState(null)
  const [selDoctor, setSelDoctor] = useState(null)
  const [apptType, setApptType]   = useState(APPT_TYPES[0])
  const today = new Date()
  const [calYear, setCalYear]   = useState(today.getFullYear())
  const [calMonth, setCalMonth] = useState(today.getMonth())
  const [selDay, setSelDay]     = useState(null)
  const [slots, setSlots]       = useState([])
  const [selTime, setSelTime]   = useState(null)
  const [loadSlots, setLoadSlots] = useState(false)
  const [form, setForm] = useState({ name:user?.name||'', email:user?.email||'', phone:'', notes:'' })
  const [formErr, setFormErr] = useState({})

  useEffect(() => {
    if (!selDay||!selDoctor) return
    setLoadSlots(true); setSelTime(null)
    const ds = `${calYear}-${String(calMonth+1).padStart(2,'0')}-${String(selDay).padStart(2,'0')}`
    getAvailableSlots(selDoctor.id, ds).then(d=>setSlots(d.slots||[])).catch(()=>setSlots([])).finally(()=>setLoadSlots(false))
  },[selDay,selDoctor,calYear,calMonth])

  const changeMonth = dir => {
    let m=calMonth+dir, y=calYear
    if(m<0){m=11;y--} if(m>11){m=0;y++}
    setCalMonth(m); setCalYear(y); setSelDay(null); setSelTime(null)
  }
  const isPast = d => new Date(calYear,calMonth,d) < new Date(today.getFullYear(),today.getMonth(),today.getDate())
  const { firstDay, totalDays } = getCalendarDays(calYear, calMonth)

  const next = () => {
    if(step===1&&!selDoctor){alert('Please select a doctor.');return}
    if(step===2&&(!selDay||!selTime)){alert('Please select a date and time slot.');return}
    if(step===3){
      const e={}
      if(!form.name.trim())e.name='Name is required.'
      if(!form.email.trim())e.email='Email is required.'
      if(!form.phone.trim())e.phone='Phone is required.'
      if(Object.keys(e).length){setFormErr(e);return}
    }
    setStep(s=>s+1)
  }

  const confirmBooking = async () => {
    setBusy(true)
    try {
      const dateStr = `${MONTH_NAMES[calMonth]} ${selDay}, ${calYear}`
      const { appointment } = await bookAppointment({ doctor:selDoctor, date:dateStr, time:selTime, type:apptType, patient:form, userId:user?.id })
      setBookedAppt({ doctor:selDoctor, date:dateStr, time:selTime, type:apptType, patient:form, id:appointment.id })
      setDone(true)
    } catch(err){ alert('Booking failed: '+err.message) }
    finally { setBusy(false) }
  }

  if(done&&bookedAppt) return (
    <><Navbar solid />
    <div className="page-wrapper" style={{ background:'var(--light)', display:'flex', alignItems:'center', justifyContent:'center', padding:'2rem' }}>
      <div className="fade-up" style={{ background:'#fff', borderRadius:20, padding:'clamp(2rem,5vw,4rem) clamp(1.5rem,4vw,3rem)', textAlign:'center', maxWidth:520, width:'100%', border:'1px solid var(--border)', boxShadow:'var(--shadow-lg)' }}>
        <div style={{ fontSize:56, marginBottom:'1.25rem' }}>🎉</div>
        <h2 style={{ fontFamily:'var(--font-head)', fontSize:'clamp(1.5rem,4vw,2rem)', fontWeight:800, color:'var(--navy)', marginBottom:'.75rem' }}>Appointment Confirmed!</h2>
        <p style={{ color:'var(--slate)', lineHeight:1.75, marginBottom:'2rem', fontSize:'.92rem' }}>
          Your appointment with <strong>{bookedAppt.doctor.name}</strong> is confirmed for <strong>{bookedAppt.date}</strong> at <strong>{bookedAppt.time}</strong>.
        </p>
        <div style={{ background:'var(--teal-xlight)', borderRadius:12, padding:'1.25rem', marginBottom:'2rem', border:'1px solid rgba(13,148,136,.2)', textAlign:'left' }}>
          {[['Doctor',bookedAppt.doctor.name],['Date',bookedAppt.date],['Time',bookedAppt.time],['Type',bookedAppt.type],['Patient',bookedAppt.patient.name],['Fee','₹500']].map(([k,v])=>(
            <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'.45rem 0', borderBottom:'1px solid rgba(13,148,136,.1)', fontSize:'.88rem', flexWrap:'wrap', gap:'.5rem' }}>
              <span style={{ color:'var(--slate)' }}>{k}</span><span style={{ fontWeight:700, color:'var(--navy)' }}>{v}</span>
            </div>
          ))}
        </div>
        <div style={{ display:'flex', gap:'1rem', justifyContent:'center', flexWrap:'wrap' }}>
          <button className="btn btn-primary" onClick={()=>navigate('/')}>← Back to Home</button>
          <button className="btn btn-ghost" onClick={()=>navigate('/check')}>Upload RVG</button>
        </div>
      </div>
    </div>
    <Footer /></>
  )

  return (
    <><Navbar solid />
    <div className="page-wrapper" style={{ background:'var(--light)' }}>
      <div style={{ maxWidth:820, margin:'0 auto', padding:'2rem 1.5rem' }}>
        <button onClick={()=>navigate('/')} style={{ background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:'.5rem', color:'var(--teal)', fontWeight:600, fontSize:'.88rem', fontFamily:'var(--font-body)', marginBottom:'1.5rem', padding:0 }}>← Back to home</button>
        <h1 style={{ fontFamily:'var(--font-head)', fontSize:'clamp(1.5rem,4vw,2rem)', fontWeight:800, color:'var(--navy)', marginBottom:'.4rem' }}>Book an Appointment</h1>
        <p style={{ color:'var(--slate)', marginBottom:'2rem', fontSize:'.92rem' }}>Schedule a consultation with our dental specialists</p>

        {/* Step indicator */}
        <div className="step-indicator" style={{ gap:0, marginBottom:'2rem' }}>
          {STEPS.map((s,i) => {
            const n=i+1, done=n<step, active=n===step
            return (
              <div key={s} style={{ display:'flex', alignItems:'center', flex:1, minWidth:0 }}>
                <div style={{ display:'flex', alignItems:'center', gap:'.4rem', flexShrink:0 }}>
                  <div style={{ width:28, height:28, borderRadius:'50%', border:`2px solid ${done||active?'var(--teal)':'var(--border)'}`, background:done?'var(--teal)':'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'.72rem', fontWeight:700, color:done?'#fff':active?'var(--teal)':'var(--muted)', flexShrink:0 }}>{done?'✓':n}</div>
                  <span style={{ fontSize:'clamp(.65rem,.8vw+.5rem,.78rem)', fontWeight:700, color:done?'var(--teal-dark)':active?'var(--navy)':'var(--muted)', whiteSpace:'nowrap' }}>{s}</span>
                </div>
                {i<STEPS.length-1&&<div style={{ flex:1, height:2, background:n<step?'var(--teal)':'var(--border)', margin:'0 .4rem', minWidth:8, transition:'background .3s' }} />}
              </div>
            )
          })}
        </div>

        <div style={{ background:'#fff', borderRadius:20, padding:'clamp(1.25rem,4vw,2rem)', border:'1px solid var(--border)', boxShadow:'var(--shadow-sm)' }}>

          {/* STEP 1 */}
          {step===1 && (
            <div className="fade-in">
              <h3 style={{ fontFamily:'var(--font-head)', fontWeight:700, color:'var(--navy)', marginBottom:'1.25rem' }}>Select a Specialist</h3>
              <div className="doctor-grid">
                {DOCTORS.map(d=>(
                  <div key={d.id} onClick={()=>setSelDoctor(d)} style={{ border:`2px solid ${selDoctor?.id===d.id?'var(--teal)':'var(--border)'}`, background:selDoctor?.id===d.id?'var(--teal-xlight)':'#fff', borderRadius:14, padding:'1.25rem 1rem', cursor:'pointer', textAlign:'center', transition:'all .2s' }}>
                    <div style={{ fontSize:'clamp(2rem,5vw,2.8rem)', marginBottom:'.6rem' }}>{d.emoji}</div>
                    <div style={{ fontWeight:700, fontSize:'.88rem', color:'var(--navy)' }}>{d.name}</div>
                    <div style={{ fontSize:'.72rem', color:'var(--teal-dark)', fontWeight:700, margin:'.25rem 0' }}>{d.spec}</div>
                    <div style={{ fontSize:'.7rem', color:'var(--muted)' }}>⭐ {d.rating} · {d.reviews} reviews</div>
                  </div>
                ))}
              </div>
              <div className="form-group" style={{ marginTop:'.5rem' }}>
                <label className="form-label">Appointment Type</label>
                <select className="form-select" value={apptType} onChange={e=>setApptType(e.target.value)}>
                  {APPT_TYPES.map(t=><option key={t}>{t}</option>)}
                </select>
              </div>
              <div style={{ display:'flex', justifyContent:'flex-end', marginTop:'1.25rem' }}>
                <button className="btn btn-primary" onClick={next}>Next: Choose Date →</button>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step===2 && (
            <div className="fade-in">
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1rem' }}>
                <h3 style={{ fontFamily:'var(--font-head)', fontWeight:700, color:'var(--navy)' }}>📅 {MONTH_NAMES[calMonth]} {calYear}</h3>
                <div style={{ display:'flex', gap:'.5rem' }}>
                  <button onClick={()=>changeMonth(-1)} style={{ width:32, height:32, border:'1.5px solid var(--border)', borderRadius:8, background:'none', cursor:'pointer', fontSize:'1.1rem' }}>‹</button>
                  <button onClick={()=>changeMonth(1)}  style={{ width:32, height:32, border:'1.5px solid var(--border)', borderRadius:8, background:'none', cursor:'pointer', fontSize:'1.1rem' }}>›</button>
                </div>
              </div>
              <div className="cal-grid">
                {DAY_NAMES_SHORT.map(d=><div key={d} style={{ textAlign:'center', fontSize:'.68rem', fontWeight:700, color:'var(--muted)', padding:'.3rem' }}>{d}</div>)}
                {Array(firstDay).fill(null).map((_,i)=><div key={`e${i}`} />)}
                {Array.from({length:totalDays},(_,i)=>i+1).map(d=>{
                  const past=isPast(d), isToday=d===today.getDate()&&calMonth===today.getMonth()&&calYear===today.getFullYear(), sel=d===selDay
                  return <div key={d} onClick={()=>!past&&setSelDay(d)} style={{ textAlign:'center', padding:'.5rem .2rem', borderRadius:7, fontSize:'.82rem', cursor:past?'not-allowed':'pointer', border:`1.5px solid ${sel?'var(--teal)':isToday?'var(--teal)':'transparent'}`, background:sel?'var(--teal)':'transparent', color:sel?'#fff':past?'var(--muted)':isToday?'var(--teal)':'var(--text)', opacity:past?.38:1, fontWeight:sel||isToday?700:400, transition:'all .15s' }}>{d}</div>
                })}
              </div>
              <h3 style={{ fontFamily:'var(--font-head)', fontWeight:700, color:'var(--navy)', marginBottom:'1rem' }}>🕐 Available Slots {selDay&&`— ${MONTH_NAMES[calMonth]} ${selDay}`}</h3>
              {!selDay && <p style={{ color:'var(--muted)', fontSize:'.88rem', marginBottom:'1.5rem' }}>Select a date first.</p>}
              {selDay&&loadSlots && <div style={{ padding:'1.5rem 0', display:'flex', justifyContent:'center' }}><Loader message="Loading slots…" /></div>}
              {selDay&&!loadSlots && (
                <div className="time-grid">
                  {slots.map(({ time, available }) => (
                    <div key={time} onClick={()=>available&&setSelTime(time)} style={{ padding:'.6rem .3rem', borderRadius:8, textAlign:'center', fontSize:'.82rem', fontWeight:500, border:`1.5px solid ${!available?'var(--border)':selTime===time?'var(--teal)':'var(--border)'}`, background:!available?'var(--light)':selTime===time?'var(--teal)':'#fff', color:!available?'var(--muted)':selTime===time?'#fff':'var(--text)', cursor:available?'pointer':'not-allowed', textDecoration:!available?'line-through':'none', opacity:!available?.5:1, transition:'all .15s' }}>{time}</div>
                  ))}
                </div>
              )}
              <div style={{ display:'flex', justifyContent:'space-between', marginTop:'1rem', flexWrap:'wrap', gap:'.75rem' }}>
                <button className="btn btn-ghost" onClick={()=>setStep(1)}>← Back</button>
                <button className="btn btn-primary" onClick={next}>Next: Your Details →</button>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step===3 && (
            <div className="fade-in">
              <h3 style={{ fontFamily:'var(--font-head)', fontWeight:700, color:'var(--navy)', marginBottom:'1.25rem' }}>👤 Patient Information</h3>
              <div className="form-grid-2">
                <div className="form-group"><label className="form-label">Full Name *</label><input className={`form-input${formErr.name?' error':''}`} value={form.name} onChange={e=>{setForm(f=>({...f,name:e.target.value}));setFormErr(er=>({...er,name:''}))}} placeholder="Dr. Priya Sharma" />{formErr.name&&<p className="form-error">⚠ {formErr.name}</p>}</div>
                <div className="form-group"><label className="form-label">Phone *</label><input className={`form-input${formErr.phone?' error':''}`} value={form.phone} onChange={e=>{setForm(f=>({...f,phone:e.target.value}));setFormErr(er=>({...er,phone:''}))}} placeholder="+91 98765 43210" type="tel" />{formErr.phone&&<p className="form-error">⚠ {formErr.phone}</p>}</div>
              </div>
              <div className="form-group"><label className="form-label">Email Address *</label><input className={`form-input${formErr.email?' error':''}`} value={form.email} onChange={e=>{setForm(f=>({...f,email:e.target.value}));setFormErr(er=>({...er,email:''}))}} placeholder="doctor@clinic.com" type="email" />{formErr.email&&<p className="form-error">⚠ {formErr.email}</p>}</div>
              <div className="form-group"><label className="form-label">Reason for Visit</label><textarea className="form-textarea" style={{ minHeight:85 }} value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} placeholder="Describe your symptoms…" /></div>
              <div style={{ display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:'.75rem' }}>
                <button className="btn btn-ghost" onClick={()=>setStep(2)}>← Back</button>
                <button className="btn btn-primary" onClick={next}>Review Appointment →</button>
              </div>
            </div>
          )}

          {/* STEP 4 */}
          {step===4 && (
            <div className="fade-in">
              <h3 style={{ fontFamily:'var(--font-head)', fontWeight:700, color:'var(--navy)', marginBottom:'1.25rem' }}>✅ Confirm Your Appointment</h3>
              <div style={{ background:'var(--teal-xlight)', borderRadius:14, padding:'1.5rem', marginBottom:'1.5rem', border:'1px solid rgba(13,148,136,.2)' }}>
                {[['Doctor',selDoctor?.name],['Specialty',selDoctor?.spec],['Date',`${MONTH_NAMES[calMonth]} ${selDay}, ${calYear}`],['Time',selTime||'—'],['Type',apptType],['Patient',form.name],['Email',form.email],['Phone',form.phone],['Consultation Fee','₹500']].map(([k,v])=>(
                  <div key={k} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'.48rem 0', borderBottom:'1px solid rgba(13,148,136,.12)', fontSize:'.88rem', flexWrap:'wrap', gap:'.5rem' }}>
                    <span style={{ color:'var(--slate)', flexShrink:0 }}>{k}</span>
                    <span style={{ fontWeight:700, color:k==='Consultation Fee'?'var(--teal-dark)':'var(--navy)', textAlign:'right' }}>{v||'—'}</span>
                  </div>
                ))}
              </div>
              <div className="alert alert-warn" style={{ marginBottom:'1.5rem' }}>ℹ️ Please arrive 10 minutes early and bring any prior radiographs.</div>
              <div style={{ display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:'.75rem' }}>
                <button className="btn btn-ghost" onClick={()=>setStep(3)} disabled={busy}>← Back</button>
                <button className="btn btn-success" onClick={confirmBooking} disabled={busy} style={{ minWidth:180 }}>
                  {busy?<Loader size="sm" color="#fff" />:'Confirm Booking ✓'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    <Footer /></>
  )
}
