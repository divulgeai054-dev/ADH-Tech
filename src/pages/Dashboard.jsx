import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { getSavedReports } from '../services/aiService'
import { getAppointments } from '../services/appointmentService'
import { formatDate, RISK_COLOR } from '../utils/helpers'

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [reports, setReports] = useState([])
  const [appointments, setAppointments] = useState([])
  useEffect(() => {
    setReports(getSavedReports().slice(0,5))
    getAppointments().then(d => setAppointments((d.appointments||[]).slice(0,3))).catch(()=>{})
  },[])

  const stats = [
    { label:'Total Analyses',    value:reports.length||0, color:'var(--teal)' },
    { label:'High Risk Cases',   value:reports.filter(r=>r.overallRisk==='High').length, color:'var(--danger)' },
    { label:'Reports Saved',     value:Math.max(0,reports.length), color:'var(--navy)' },
    { label:'Avg Confidence',    value:reports.length ? Math.round(reports.reduce((a,r)=>a+(r.findings?.[0]?.confidence||90),0)/reports.length)+'%':'—', color:'var(--success)' },
  ]

  return (
    <>
      <Navbar solid />
      <div className="page-wrapper" style={{ background:'var(--light)' }}>
        {/* Header */}
        <div style={{ background:'var(--navy)', padding:'2rem 1.5rem' }}>
          <div className="container">
            <div className="dash-header-row">
              <div>
                <p style={{ color:'rgba(255,255,255,.45)', fontSize:'.8rem', marginBottom:'.2rem' }}>Welcome back,</p>
                <h1 style={{ fontFamily:'var(--font-head)', fontSize:'clamp(1.4rem,4vw,1.9rem)', fontWeight:800, color:'#fff' }}>{user?.name}</h1>
                <p style={{ color:'var(--teal-light)', fontSize:'.82rem', marginTop:4 }}>{user?.clinic||'My Clinic'} · Member since {formatDate(user?.joinedAt)}</p>
              </div>
              <Link to="/check" className="btn btn-primary">+ New AI Analysis</Link>
            </div>
          </div>
        </div>

        <div className="container" style={{ padding:'2rem 1.5rem' }}>
          {/* Stats */}
          <div className="dash-stats-grid">
            {stats.map(({ label, value, color }) => (
              <div key={label} style={{ background:'#fff', borderRadius:12, padding:'1.1rem', border:'1px solid var(--border)', textAlign:'center' }}>
                <div style={{ fontFamily:'var(--font-head)', fontSize:'clamp(1.4rem,4vw,2rem)', fontWeight:800, color }}>{value}</div>
                <div style={{ fontSize:'.72rem', color:'var(--slate)', marginTop:4 }}>{label}</div>
              </div>
            ))}
          </div>

          <div className="dash-main-grid">
            {/* Recent analyses */}
            <div style={{ background:'#fff', borderRadius:16, padding:'1.5rem', border:'1px solid var(--border)' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.25rem', flexWrap:'wrap', gap:'.5rem' }}>
                <h2 style={{ fontFamily:'var(--font-head)', fontSize:'1.05rem', fontWeight:700, color:'var(--navy)' }}>Recent Analyses</h2>
                <Link to="/report" style={{ color:'var(--teal)', fontSize:'.82rem', fontWeight:700 }}>View all →</Link>
              </div>
              {reports.length === 0 ? (
                <div style={{ textAlign:'center', padding:'2.5rem 1rem' }}>
                  <div style={{ fontSize:44, marginBottom:'1rem' }}>🦷</div>
                  <p style={{ fontWeight:700, color:'var(--navy)', marginBottom:'.4rem' }}>No analyses yet</p>
                  <p style={{ fontSize:'.85rem', color:'var(--slate)', marginBottom:'1.5rem' }}>Upload your first RVG image to get started.</p>
                  <Link to="/check" className="btn btn-primary btn-sm">Start AI Analysis</Link>
                </div>
              ) : (
                <div className="table-wrap">
                  <table className="data-table">
                    <thead><tr><th>Report ID</th><th>Date</th><th>Teeth</th><th>Risk</th><th></th></tr></thead>
                    <tbody>
                      {reports.map(r => (
                        <tr key={r.id}>
                          <td style={{ fontWeight:700, color:'var(--navy)', fontSize:'.82rem' }}>{r.id?.slice(0,14)}</td>
                          <td>{formatDate(r.createdAt)}</td>
                          <td>{r.teethAnalyzed??'—'}</td>
                          <td><span style={{ background:`${RISK_COLOR[r.overallRisk]||'var(--slate)'}18`, color:RISK_COLOR[r.overallRisk]||'var(--slate)', fontSize:'.72rem', fontWeight:700, padding:'3px 9px', borderRadius:100 }}>{r.overallRisk||'—'}</span></td>
                          <td><Link to={`/report/${r.id}`} style={{ color:'var(--teal)', fontWeight:700, fontSize:'.8rem' }}>View →</Link></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Right panel */}
            <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
              {/* Quick actions */}
              <div style={{ background:'#fff', borderRadius:16, padding:'1.5rem', border:'1px solid var(--border)' }}>
                <h3 style={{ fontFamily:'var(--font-head)', fontWeight:700, color:'var(--navy)', marginBottom:'1rem', fontSize:'1rem' }}>Quick Actions</h3>
                {[
                  { icon:'🦷', label:'Upload New RVG', to:'/check' },
                  { icon:'📅', label:'Book Appointment', to:'/appointment' },
                  { icon:'📋', label:'View All Reports', to:'/report' },
                ].map(({ icon, label, to }) => (
                  <Link key={to} to={to} style={{ display:'flex', alignItems:'center', gap:'.85rem', padding:'.8rem', borderRadius:10, marginBottom:'.35rem', transition:'background .2s', color:'var(--navy)', fontWeight:600, fontSize:'.9rem', textDecoration:'none' }}
                    onMouseEnter={e => e.currentTarget.style.background='var(--teal-xlight)'}
                    onMouseLeave={e => e.currentTarget.style.background=''}>
                    <span style={{ fontSize:20 }}>{icon}</span>
                    <span style={{ flex:1 }}>{label}</span>
                    <span style={{ color:'var(--muted)' }}>→</span>
                  </Link>
                ))}
              </div>
              {/* Plan card */}
              <div style={{ background:'linear-gradient(135deg,var(--navy),var(--navy-mid))', borderRadius:16, padding:'1.5rem', color:'#fff' }}>
                <h3 style={{ fontFamily:'var(--font-head)', fontWeight:700, marginBottom:'.6rem', fontSize:'1rem' }}>Your Plan</h3>
                <div style={{ fontFamily:'var(--font-head)', fontSize:'1.5rem', fontWeight:800, color:'var(--teal-light)', marginBottom:'.4rem' }}>Starter</div>
                <div style={{ color:'rgba(255,255,255,.45)', fontSize:'.8rem', marginBottom:'1.1rem' }}>{reports.length} of 10 analyses used</div>
                <div className="progress-track" style={{ marginBottom:'.5rem' }}><div className="progress-fill" style={{ width:`${Math.min((reports.length/10)*100,100)}%` }} /></div>
                <div style={{ fontSize:'.72rem', color:'rgba(255,255,255,.35)', marginBottom:'1.25rem' }}>{10-reports.length} remaining this month</div>
                <Link to="/#pricing" className="btn btn-primary btn-full" style={{ justifyContent:'center' }}>Upgrade Plan</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
