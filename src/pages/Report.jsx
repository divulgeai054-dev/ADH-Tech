import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { getSavedReports } from '../services/aiService'
import { formatDateTime, SEVERITY_COLOR, SEVERITY_BG, RISK_COLOR, URGENCY_COLOR, downloadReportTxt } from '../utils/helpers'

export default function Report() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [report, setReport]   = useState(null)
  const [reports, setReports] = useState([])
  const [notFound, setNotFound] = useState(false)
  const [sideOpen, setSideOpen] = useState(false)

  useEffect(() => {
    const all = getSavedReports()
    setReports(all)
    if (id) { const f = all.find(r=>r.id===id); f ? setReport(f) : setNotFound(true) }
    else if (all.length > 0) setReport(all[0])
  }, [id])

  if (notFound) return (
    <><Navbar solid />
    <div className="page-wrapper" style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'80vh', textAlign:'center', padding:'2rem' }}>
      <div><div style={{ fontSize:52, marginBottom:'1rem' }}>🔍</div>
      <h2 style={{ fontFamily:'var(--font-head)', fontWeight:800, color:'var(--navy)', marginBottom:'.5rem' }}>Report Not Found</h2>
      <p style={{ color:'var(--slate)', marginBottom:'1.5rem' }}>This report doesn't exist or has been deleted.</p>
      <Link to="/check" className="btn btn-primary">Start New Analysis</Link></div>
    </div><Footer /></>
  )

  if (!report && reports.length === 0) return (
    <><Navbar solid />
    <div className="page-wrapper" style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'80vh', textAlign:'center', padding:'2rem' }}>
      <div><div style={{ fontSize:52, marginBottom:'1rem' }}>📋</div>
      <h2 style={{ fontFamily:'var(--font-head)', fontWeight:800, color:'var(--navy)', marginBottom:'.5rem' }}>No Reports Yet</h2>
      <p style={{ color:'var(--slate)', marginBottom:'1.5rem' }}>Upload an RVG image to generate your first clinical report.</p>
      <Link to="/check" className="btn btn-primary">Upload RVG Image</Link></div>
    </div><Footer /></>
  )

  const r = report || reports[0]
  if (!r) return null
  const urgencyColor = URGENCY_COLOR[r.urgency]||'var(--slate)'
  const riskColor    = RISK_COLOR[r.overallRisk]||'var(--slate)'

  return (
    <><Navbar solid />
    <div className="page-wrapper" style={{ background:'var(--light)' }}>
      {/* Header */}
      <div style={{ background:'var(--navy)', padding:'1.75rem 1.5rem' }}>
        <div className="container" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'1rem' }}>
          <div>
            <h1 style={{ fontFamily:'var(--font-head)', fontSize:'clamp(1.2rem,3vw,1.5rem)', fontWeight:800, color:'#fff' }}>Clinical Report</h1>
            <p style={{ color:'rgba(255,255,255,.4)', fontSize:'.76rem', marginTop:3 }}>ID: {r.id?.slice(0,18)} · {formatDateTime(r.createdAt)}</p>
          </div>
          <div style={{ display:'flex', gap:'.65rem', flexWrap:'wrap' }}>
            <button className="btn btn-dark btn-sm" onClick={()=>downloadReportTxt(r,user)}>⬇ Download</button>
            <Link to="/check" className="btn btn-primary btn-sm">+ New Analysis</Link>
            {reports.length > 1 && <button className="btn btn-ghost btn-sm" onClick={()=>setSideOpen(o=>!o)} style={{ display:'none' }} id="reports-toggle">📋 All Reports</button>}
          </div>
        </div>
      </div>

      <div className="container" style={{ padding:'2rem 1.5rem' }}>
        <div className="report-layout">
          {/* Sidebar */}
          {reports.length > 1 && (
            <div style={{ background:'#fff', borderRadius:16, padding:'1.25rem', border:'1px solid var(--border)', height:'fit-content' }}>
              <h3 style={{ fontFamily:'var(--font-head)', fontSize:'.9rem', fontWeight:700, color:'var(--navy)', marginBottom:'1rem' }}>All Reports</h3>
              {reports.map(rr => (
                <div key={rr.id} onClick={()=>{setReport(rr);navigate(`/report/${rr.id}`)}}
                  style={{ padding:'.8rem', borderRadius:10, marginBottom:'.4rem', cursor:'pointer', background:r.id===rr.id?'var(--teal-xlight)':'transparent', border:`1px solid ${r.id===rr.id?'rgba(13,148,136,.25)':'transparent'}`, transition:'all .2s' }}
                  onMouseEnter={e=>{ if(r.id!==rr.id) e.currentTarget.style.background='var(--light)' }}
                  onMouseLeave={e=>{ if(r.id!==rr.id) e.currentTarget.style.background='transparent' }}>
                  <div style={{ fontSize:'.78rem', fontWeight:700, color:'var(--navy)' }}>{rr.id?.slice(0,16)}</div>
                  <div style={{ fontSize:'.7rem', color:'var(--slate)', marginTop:2 }}>{formatDateTime(rr.createdAt)}</div>
                  <span style={{ display:'inline-block', marginTop:5, background:`${RISK_COLOR[rr.overallRisk]||'var(--slate)'}18`, color:RISK_COLOR[rr.overallRisk]||'var(--slate)', fontSize:'.65rem', fontWeight:700, padding:'2px 7px', borderRadius:100 }}>{rr.overallRisk}</span>
                </div>
              ))}
            </div>
          )}

          {/* Main */}
          <div className="fade-in">
            {/* Summary cards */}
            <div className="report-stats-grid" style={{ marginBottom:'1.25rem' }}>
              {[
                { label:'Teeth Analyzed', value:r.teethAnalyzed??'—', color:'var(--teal)' },
                { label:'Severe Lesions',  value:r.findings?.filter(f=>f.severity==='Severe').length??0, color:'var(--danger)' },
                { label:'Moderate Caries', value:r.findings?.filter(f=>f.severity==='Moderate').length??0, color:'var(--warn)' },
                { label:'Image Quality',   value:r.imageQuality||'—', color:'var(--slate)' },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ background:'#fff', borderRadius:12, padding:'1rem', border:'1px solid var(--border)', textAlign:'center' }}>
                  <div style={{ fontFamily:'var(--font-head)', fontSize:'clamp(1.2rem,3vw,1.7rem)', fontWeight:800, color }}>{value}</div>
                  <div style={{ fontSize:'.7rem', color:'var(--slate)', marginTop:4 }}>{label}</div>
                </div>
              ))}
            </div>

            {/* Risk + urgency badges */}
            <div style={{ display:'flex', gap:'.75rem', marginBottom:'1.25rem', flexWrap:'wrap' }}>
              {[
                { label:`🚦 Risk: ${r.overallRisk}`, color:riskColor },
                { label:`⏱ Urgency: ${r.urgency}`, color:urgencyColor },
                { label:`🦴 Bone: ${r.boneLevel||'—'}`, color:'var(--teal-dark)' },
              ].map(({ label, color }) => (
                <div key={label} style={{ background:`${color}14`, border:`1px solid ${color}40`, borderRadius:10, padding:'.55rem 1rem', fontSize:'.82rem', fontWeight:700, color }}>{label}</div>
              ))}
            </div>

            {/* Findings */}
            <div style={{ background:'#fff', borderRadius:16, padding:'1.5rem', border:'1px solid var(--border)', marginBottom:'1.25rem' }}>
              <h2 style={{ fontFamily:'var(--font-head)', fontSize:'1.05rem', fontWeight:700, color:'var(--navy)', marginBottom:'1.25rem' }}>🔍 AI Findings</h2>
              {(!r.findings||r.findings.length===0) ? (
                <div style={{ textAlign:'center', padding:'2.5rem 1rem' }}>
                  <div style={{ fontSize:44, marginBottom:'.75rem' }}>✅</div>
                  <p style={{ fontWeight:700, color:'var(--navy)', marginBottom:'.4rem' }}>No caries detected</p>
                  <p style={{ fontSize:'.88rem', color:'var(--slate)' }}>Radiograph appears healthy. Routine 6-month recall recommended.</p>
                </div>
              ) : r.findings.map((f,i) => (
                <div key={i} style={{ background:SEVERITY_BG[f.severity]||'#f8fafc', borderLeft:`4px solid ${SEVERITY_COLOR[f.severity]||'var(--slate)'}`, borderRadius:10, padding:'1rem', marginBottom:'.75rem' }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'.5rem', flexWrap:'wrap', gap:'.5rem' }}>
                    <div style={{ fontWeight:700, fontSize:'.88rem', color:'var(--navy)' }}>🦷 Tooth FDI {f.tooth} — {f.surface} surface</div>
                    <span style={{ background:SEVERITY_COLOR[f.severity], color:'#fff', fontSize:'.68rem', fontWeight:700, padding:'3px 10px', borderRadius:100 }}>{f.severity}</span>
                  </div>
                  <p style={{ fontSize:'.83rem', color:'var(--slate)', lineHeight:1.6, marginBottom:'.6rem' }}>{f.description}</p>
                  <div style={{ fontSize:'.78rem', color:'var(--navy-mid)', fontWeight:600, marginBottom:'.55rem' }}>📝 {f.recommendation}</div>
                  <div style={{ display:'flex', alignItems:'center', gap:'.65rem' }}>
                    <span style={{ fontSize:'.7rem', color:SEVERITY_COLOR[f.severity], fontWeight:700, whiteSpace:'nowrap' }}>Confidence {f.confidence}%</span>
                    <div className="progress-track" style={{ flex:1 }}>
                      <div style={{ height:'100%', borderRadius:100, background:SEVERITY_COLOR[f.severity], width:`${f.confidence}%`, transition:'width .6s ease' }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {r.summaryNote && (
              <div className="alert alert-info" style={{ marginBottom:'1.25rem' }}>
                <span style={{ fontSize:20, flexShrink:0 }}>📋</span>
                <div><div style={{ fontWeight:700, marginBottom:'.35rem' }}>Clinical Summary</div><p style={{ lineHeight:1.65 }}>{r.summaryNote}</p></div>
              </div>
            )}
            <div className="alert alert-warn">
              ⚠️ <div><strong>Clinical Disclaimer:</strong> This AI report is intended to assist qualified dental professionals and does not replace clinical examination or professional judgment.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <Footer /></>
  )
}
