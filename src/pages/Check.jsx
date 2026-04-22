import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import Navbar from '../components/Navbar'
import { analyseImage } from '../services/aiService'
import { fileToBase64, getMediaType, formatFileSize } from '../utils/helpers'

export default function Check() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const fileRef  = useRef()
  const [phase, setPhase]       = useState('upload')
  const [progress, setProgress] = useState(0)
  const [progLabel, setProgLabel] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [preview, setPreview]   = useState(null)
  const [fileInfo, setFileInfo] = useState(null)
  const [error, setError]       = useState('')

  const handleFile = async file => {
    setError('')
    if (!file) return
    if (!file.type.startsWith('image/')) { setError('Please upload a valid image file (JPEG, PNG, WEBP).'); return }
    if (file.size > 25*1024*1024) { setError('File size must be under 25 MB.'); return }
    const url = URL.createObjectURL(file)
    setPreview(url)
    setFileInfo({ name:file.name, size:formatFileSize(file.size) })
    setPhase('analyzing')
    try {
      const base64   = await fileToBase64(file)
      const mimeType = getMediaType(file)
      const report   = await analyseImage(base64, mimeType, (pct,label) => { setProgress(pct); setProgLabel(label) })
      setPhase('done')
      setTimeout(() => navigate(`/report/${report.id}`), 800)
    } catch (err) {
      setError('Analysis failed: ' + (err.message||'Unknown error'))
      setPhase('upload')
    }
  }

  return (
    <>
      <Navbar solid />
      <div className="page-wrapper" style={{ background:'var(--light)' }}>
        {/* Header */}
        <div style={{ background:'var(--navy)', padding:'1.75rem 1.5rem' }}>
          <div className="container" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'1rem' }}>
            <div>
              <h1 style={{ fontFamily:'var(--font-head)', fontSize:'clamp(1.2rem,3vw,1.5rem)', fontWeight:800, color:'#fff' }}>RVG Analysis</h1>
              <p style={{ color:'rgba(255,255,255,.4)', fontSize:'.78rem', marginTop:3 }}>AI-powered dental caries detection</p>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:8, background:'rgba(255,255,255,.07)', borderRadius:100, padding:'5px 12px 5px 5px' }}>
              <div style={{ width:26, height:26, borderRadius:'50%', background:'var(--teal)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'.65rem', fontWeight:700, color:'#fff' }}>
                {user?.name?.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()}
              </div>
              <span style={{ color:'#fff', fontSize:'.8rem', fontWeight:600 }}>{user?.name?.split(' ')[0]}</span>
            </div>
          </div>
        </div>

        <div className="container" style={{ padding:'2rem 1.5rem' }}>
          {phase === 'upload' && (
            <div className="fade-up">
              <h2 style={{ fontFamily:'var(--font-head)', fontSize:'clamp(1.3rem,3vw,1.7rem)', fontWeight:800, color:'var(--navy)', marginBottom:'.4rem' }}>Upload RVG Radiograph</h2>
              <p style={{ color:'var(--slate)', marginBottom:'1.75rem', fontSize:'.92rem' }}>Upload your dental X-ray and our AI will detect caries and generate a clinical report in seconds.</p>

              <div className={`drop-zone${dragOver?' drag-over':''}`}
                onDragOver={e=>{e.preventDefault();setDragOver(true)}}
                onDragLeave={()=>setDragOver(false)}
                onDrop={e=>{e.preventDefault();setDragOver(false);handleFile(e.dataTransfer.files[0])}}
                onClick={()=>fileRef.current.click()} role="button" tabIndex={0}
                onKeyDown={e=>e.key==='Enter'&&fileRef.current.click()}>
                <div style={{ fontSize:'clamp(2.5rem,8vw,3.5rem)', marginBottom:'1rem' }}>🦷</div>
                <h3 style={{ fontFamily:'var(--font-head)', fontSize:'clamp(1rem,3vw,1.3rem)', fontWeight:700, color:'var(--navy)', marginBottom:'.5rem' }}>
                  {dragOver ? 'Drop to Analyse!' : 'Drag & Drop your RVG Image'}
                </h3>
                <p style={{ color:'var(--slate)', fontSize:'.88rem', marginBottom:'.4rem' }}>or click to browse files</p>
                <p style={{ fontSize:'.76rem', color:'var(--muted)' }}>JPEG, PNG, WEBP · Max 25 MB · Periapical &amp; Bitewing</p>
                <button className="btn btn-primary" style={{ marginTop:'1.5rem' }} onClick={e=>{e.stopPropagation();fileRef.current.click()}}>
                  <svg width="16" height="16" fill="white" viewBox="0 0 24 24"><path d="M5 20h14v-2H5v2zm0-10h4v6h6v-6h4l-7-7-7 7z"/></svg>
                  Choose File
                </button>
              </div>
              <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={e=>handleFile(e.target.files[0])} />

              {error && <div className="alert alert-error" style={{ marginTop:'1rem' }}>⚠ {error}</div>}

              <div style={{ background:'#fff', borderRadius:14, padding:'1.25rem', border:'1px solid var(--border)', marginTop:'1.5rem' }}>
                <div style={{ fontWeight:700, fontSize:'.88rem', color:'var(--navy)', marginBottom:'.75rem' }}>📋 Image Requirements</div>
                <div className="check-req-grid" style={{ fontSize:'.8rem', color:'var(--slate)', gap:'.5rem' }}>
                  {['✓ Periapical radiograph (preferred)','✓ Bitewing X-ray accepted','✓ OPG (limited accuracy)','✓ Min. 500 × 500 px','✓ Good contrast & exposure','✓ No motion blur or artifacts'].map(t=><div key={t}>{t}</div>)}
                </div>
              </div>
            </div>
          )}

          {(phase==='analyzing'||phase==='done') && (
            <div className="fade-in" style={{ textAlign:'center', padding:'4rem 1rem' }}>
              <div style={{ position:'relative', width:80, height:80, margin:'0 auto 2rem' }}>
                <div style={{ position:'absolute', inset:0, border:'4px solid var(--teal-xlight)', borderTopColor:phase==='done'?'var(--success)':'var(--teal)', borderRadius:'50%', animation:phase==='done'?'none':'spin .9s linear infinite' }} />
                <div style={{ position:'absolute', inset:12, background:'var(--teal-xlight)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:26 }}>{phase==='done'?'✅':'🧠'}</div>
              </div>
              <h3 style={{ fontFamily:'var(--font-head)', fontSize:'clamp(1.1rem,3vw,1.5rem)', fontWeight:800, color:'var(--navy)', marginBottom:'.6rem' }}>
                {phase==='done'?'Analysis Complete!':'Analysing Radiograph…'}
              </h3>
              <p style={{ color:'var(--slate)', marginBottom:'2rem', fontSize:'.9rem' }}>
                {phase==='done'?'Redirecting to your report…':progLabel}
              </p>
              <div className="progress-track" style={{ maxWidth:340, margin:'0 auto' }}>
                <div className="progress-fill" style={{ width:`${progress}%` }} />
              </div>
              <p style={{ color:'var(--teal)', fontWeight:700, marginTop:'.75rem' }}>{progress}%</p>
              {preview && (
                <div style={{ marginTop:'2rem', display:'inline-block', position:'relative' }}>
                  <img src={preview} alt="Uploaded RVG" style={{ width:'min(200px,70vw)', height:150, objectFit:'cover', borderRadius:12, opacity:.65, filter:'grayscale(.3)', border:'2px solid var(--teal)' }} />
                  {phase==='analyzing' && <div style={{ position:'absolute', left:0, right:0, height:2, background:'linear-gradient(90deg,transparent,var(--teal),transparent)', animation:'scanLine 2s ease-in-out infinite', top:'5%' }} />}
                  {fileInfo && <p style={{ marginTop:'.6rem', fontSize:'.75rem', color:'var(--slate)' }}>{fileInfo.name} · {fileInfo.size}</p>}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
