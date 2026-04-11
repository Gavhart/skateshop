// Canvas drawing is handled via native event listeners in useEffect (passive: false for touch)
import { useRef, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { insertWaiver } from '../lib/supabase'

const GOLD = '#c9a961'
const BG = '#0a0a0a'
const CARD = '#1a1a1a'
const MUTED = '#888'
const RED = '#e05252'

const WAIVER_SECTIONS = [
  {
    title: 'Assumption of Risk',
    body: 'I understand that skateboarding is an extreme sport that involves inherent risks of injury, including but not limited to: sprains, fractures, lacerations, concussions, and other serious bodily harm. I voluntarily assume all risks associated with participation in any class or activity hosted by Hart Boys Skate Shop.',
  },
  {
    title: 'Release of Liability',
    body: 'In consideration of being allowed to participate, I hereby release, waive, and discharge Hart Boys Skate Shop, its owners, instructors, employees, volunteers, and agents from any and all liability, claims, demands, and causes of action arising out of or related to any loss, damage, or injury, including death, that may be sustained by me during participation.',
  },
  {
    title: 'Instruction Disclaimer',
    body: 'I understand that classes are taught by local skaters who are not certified professional instructors. Instruction is provided on a volunteer or informal basis. Hart Boys Skate Shop makes no warranty regarding the qualifications or certifications of its instructors.',
  },
  {
    title: 'Equipment & Safety',
    body: 'I agree to wear appropriate protective gear including a properly fitted helmet. I am responsible for inspecting my own equipment prior to participation. Hart Boys Skate Shop is not responsible for damage to or loss of personal property.',
  },
  {
    title: 'Minor Participants',
    body: 'If I am the parent or legal guardian signing on behalf of a minor, I consent to the minor\'s participation and agree to all terms of this waiver on the minor\'s behalf. I accept full responsibility for the minor\'s safety and conduct.',
  },
  {
    title: 'Medical Authorization',
    body: 'I authorize Hart Boys Skate Shop staff to seek emergency medical treatment on my behalf (or on behalf of the minor I represent) in the event of an injury. I am responsible for all medical costs incurred.',
  },
  {
    title: 'Governing Law',
    body: 'This agreement shall be governed by the laws of the State of Alaska. If any provision of this waiver is found to be unenforceable, the remaining provisions shall remain in full force and effect.',
  },
]

export default function WaiverSign() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isDrawing = useRef(false)
  const lastPos = useRef<{ x: number; y: number } | null>(null)
  const [hasDrawn, setHasDrawn] = useState(false)
  const [signMode, setSignMode] = useState<'type' | 'draw'>('type')

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [typedSig, setTypedSig] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [scrolledToBottom, setScrolledToBottom] = useState(false)
  const waiverBodyRef = useRef<HTMLDivElement>(null)

  const signedAt = new Date().toLocaleString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })

  // Track scroll to bottom of waiver
  useEffect(() => {
    const el = waiverBodyRef.current
    if (!el) return
    const onScroll = () => {
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 20) setScrolledToBottom(true)
    }
    el.addEventListener('scroll', onScroll)
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  // Canvas drawing via native events
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = '#0d0d0d'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    const getPosFromEvent = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect()
      const scaleX = canvas.width / rect.width
      const scaleY = canvas.height / rect.height
      const src = 'touches' in e ? e.touches[0] : e
      return { x: (src.clientX - rect.left) * scaleX, y: (src.clientY - rect.top) * scaleY }
    }

    const onStart = (e: MouseEvent | TouchEvent) => {
      e.preventDefault()
      isDrawing.current = true
      lastPos.current = getPosFromEvent(e)
    }
    const onMove = (e: MouseEvent | TouchEvent) => {
      e.preventDefault()
      if (!isDrawing.current || !lastPos.current) return
      const c = canvas.getContext('2d')!
      c.strokeStyle = GOLD
      c.lineWidth = 2.5
      c.lineCap = 'round'
      c.lineJoin = 'round'
      const pos = getPosFromEvent(e)
      c.beginPath()
      c.moveTo(lastPos.current.x, lastPos.current.y)
      c.lineTo(pos.x, pos.y)
      c.stroke()
      lastPos.current = pos
      setHasDrawn(true)
    }
    const onEnd = (e: MouseEvent | TouchEvent) => {
      e.preventDefault()
      isDrawing.current = false
      lastPos.current = null
    }

    canvas.addEventListener('mousedown', onStart)
    canvas.addEventListener('mousemove', onMove)
    canvas.addEventListener('mouseup', onEnd)
    canvas.addEventListener('mouseleave', onEnd)
    canvas.addEventListener('touchstart', onStart, { passive: false })
    canvas.addEventListener('touchmove', onMove, { passive: false })
    canvas.addEventListener('touchend', onEnd, { passive: false })

    return () => {
      canvas.removeEventListener('mousedown', onStart)
      canvas.removeEventListener('mousemove', onMove)
      canvas.removeEventListener('mouseup', onEnd)
      canvas.removeEventListener('mouseleave', onEnd)
      canvas.removeEventListener('touchstart', onStart)
      canvas.removeEventListener('touchmove', onMove)
      canvas.removeEventListener('touchend', onEnd)
    }
  }, [])

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = '#0d0d0d'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    setHasDrawn(false)
  }

  const hasSig = signMode === 'type' ? typedSig.trim().length > 2 : hasDrawn

  const getSignatureData = (): string => {
    if (signMode === 'draw') {
      return canvasRef.current?.toDataURL('image/png') ?? ''
    }
    // Render typed sig to a canvas
    const offscreen = document.createElement('canvas')
    offscreen.width = 640
    offscreen.height = 120
    const ctx = offscreen.getContext('2d')!
    ctx.fillStyle = '#0d0d0d'
    ctx.fillRect(0, 0, 640, 120)
    ctx.fillStyle = GOLD
    ctx.font = "italic 54px Georgia, 'Times New Roman', serif"
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(typedSig, 320, 60)
    return offscreen.toDataURL('image/png')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!hasSig) { setError('Please provide your signature.'); return }
    if (!agreed) { setError('Please check the agreement box.'); return }
    setError('')
    setLoading(true)
    try {
      const sig = getSignatureData()
      await insertWaiver({ name, email, signature_data: sig })
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // ── Success screen ─────────────────────────────────────────────────────────

  if (submitted) {
    return (
      <div style={{ background: BG, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ maxWidth: 520, width: '100%' }}>
          {/* Confirmation card */}
          <div style={{ background: CARD, border: `1px solid rgba(201,169,97,0.35)`, borderRadius: 16, padding: '2.5rem', textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{ width: 64, height: 64, background: 'rgba(76,175,125,0.15)', border: '2px solid #4caf7d', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', margin: '0 auto 1.25rem' }}>✓</div>
            <h2 style={{ color: '#4caf7d', fontSize: '1.5rem', margin: '0 0 0.4rem', fontWeight: 900 }}>Waiver Signed</h2>
            <p style={{ color: MUTED, fontSize: '0.88rem', margin: '0 0 2rem' }}>Your electronic signature has been recorded</p>

            <div style={{ background: '#0d0d0d', border: '1px solid #222', borderRadius: 10, padding: '1.25rem', textAlign: 'left', marginBottom: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <div style={{ color: '#555', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.2rem' }}>Signer</div>
                  <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.9rem' }}>{name}</div>
                </div>
                <div>
                  <div style={{ color: '#555', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.2rem' }}>Email</div>
                  <div style={{ color: GOLD, fontSize: '0.9rem' }}>{email}</div>
                </div>
              </div>
              <div>
                <div style={{ color: '#555', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.2rem' }}>Signed At</div>
                <div style={{ color: '#aaa', fontSize: '0.88rem' }}>{signedAt}</div>
              </div>
            </div>

            <p style={{ color: '#555', fontSize: '0.8rem', lineHeight: 1.6, margin: '0 0 1.75rem' }}>
              By electronically signing this document, you agreed to the Hart Boys Skate Shop liability waiver. This signature is legally binding under the U.S. Electronic Signatures in Global and National Commerce Act (ESIGN).
            </p>

            <Link
              to="/classes"
              style={{ display: 'inline-block', padding: '0.9rem 2.5rem', background: GOLD, color: BG, fontWeight: 800, borderRadius: 8, textDecoration: 'none', fontSize: '0.95rem' }}
            >
              ← Back to Classes
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // ── Main page ──────────────────────────────────────────────────────────────

  return (
    <div style={{ background: BG, minHeight: '100vh', padding: '2rem 1rem 4rem', color: '#fff' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@600&display=swap');
        .wv-wrap { max-width: 720px; margin: 0 auto; }
        .wv-card { background: ${CARD}; border-radius: 14px; padding: 2rem; margin-bottom: 1.25rem; border: 1px solid #222; }
        .wv-label { display: block; color: #555; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 0.5rem; }
        .wv-input { width: 100%; padding: 0.9rem 1rem; background: #0d0d0d; border: 1px solid #2a2a2a; color: #fff; border-radius: 8px; font-size: 1rem; box-sizing: border-box; transition: border-color 0.2s; }
        .wv-input:focus { outline: none; border-color: ${GOLD}; }
        .wv-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        @media (max-width: 520px) { .wv-row { grid-template-columns: 1fr; } .wv-card { padding: 1.25rem; } }
        .sig-tab { padding: 0.5rem 1.25rem; border-radius: 6px; cursor: pointer; font-size: 0.8rem; font-weight: 700; letter-spacing: 0.05em; transition: all 0.15s; border: 1px solid #2a2a2a; background: none; color: #555; }
        .sig-tab.active { background: ${GOLD}; color: #000; border-color: ${GOLD}; }
        .typed-sig { font-family: 'Dancing Script', cursive; font-size: 2.8rem; color: ${GOLD}; min-height: 80px; display: flex; align-items: center; padding: 0.75rem 1.25rem; background: #0d0d0d; border-radius: 8px; border-bottom: 2px solid ${GOLD}; letter-spacing: 0.02em; }
        .sig-canvas { width: 100%; height: 130px; border-radius: 8px; display: block; touch-action: none; user-select: none; cursor: crosshair; }
        .waiver-scroll { max-height: 320px; overflow-y: auto; padding-right: 0.5rem; }
        .waiver-scroll::-webkit-scrollbar { width: 4px; }
        .waiver-scroll::-webkit-scrollbar-track { background: #111; }
        .waiver-scroll::-webkit-scrollbar-thumb { background: #333; border-radius: 2px; }
        .esign-badge { display: inline-flex; align-items: center; gap: 0.4rem; background: rgba(76,175,125,0.1); border: 1px solid rgba(76,175,125,0.3); color: #4caf7d; padding: 0.3rem 0.75rem; border-radius: 20px; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.06em; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="wv-wrap">

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link to="/classes" style={{ color: MUTED, fontSize: '0.83rem', textDecoration: 'none' }}>← Back to Classes</Link>
          <h1 style={{ color: GOLD, fontSize: 'clamp(1.8rem, 5vw, 2.4rem)', margin: '0.75rem 0 0.3rem', fontWeight: 900, letterSpacing: '-0.02em' }}>
            LIABILITY WAIVER
          </h1>
          <p style={{ color: MUTED, fontSize: '0.85rem', margin: '0 0 0.75rem' }}>Hart Boys Skate Shop — Class Participation</p>
          <span className="esign-badge">🔒 Legally Binding E-Signature</span>
        </div>

        {/* Your Info */}
        <form onSubmit={handleSubmit}>
          <div className="wv-card">
            <h3 style={{ color: GOLD, fontWeight: 800, fontSize: '0.85rem', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 1.25rem' }}>Your Information</h3>
            <div className="wv-row" style={{ marginBottom: '1rem' }}>
              <div>
                <label className="wv-label">Full Legal Name *</label>
                <input className="wv-input" required value={name} onChange={e => setName(e.target.value)} placeholder="Jane Smith" />
              </div>
              <div>
                <label className="wv-label">Email Address *</label>
                <input className="wv-input" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="jane@email.com" />
              </div>
            </div>
            <div>
              <label className="wv-label">Date</label>
              <input className="wv-input" value={signedAt} readOnly style={{ color: MUTED, cursor: 'default' }} />
            </div>
          </div>

          {/* Waiver text */}
          <div className="wv-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h3 style={{ color: GOLD, fontWeight: 800, fontSize: '0.85rem', letterSpacing: '0.08em', textTransform: 'uppercase', margin: 0 }}>Waiver Terms</h3>
              {!scrolledToBottom && <span style={{ color: '#444', fontSize: '0.75rem' }}>↓ Scroll to read</span>}
              {scrolledToBottom && <span style={{ color: '#4caf7d', fontSize: '0.75rem' }}>✓ Read</span>}
            </div>
            <div className="waiver-scroll" ref={waiverBodyRef}>
              {WAIVER_SECTIONS.map(s => (
                <div key={s.title} style={{ marginBottom: '1.25rem' }}>
                  <h4 style={{ color: GOLD, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 0.4rem', fontWeight: 700 }}>{s.title}</h4>
                  <p style={{ color: MUTED, fontSize: '0.85rem', lineHeight: 1.75, margin: 0 }}>{s.body}</p>
                </div>
              ))}
              <div style={{ height: 1, background: '#222', margin: '0.5rem 0 1rem' }} />
              <p style={{ color: '#555', fontSize: '0.78rem', textAlign: 'center' }}>— End of Waiver —</p>
            </div>
          </div>

          {/* Signature */}
          <div className="wv-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <h3 style={{ color: GOLD, fontWeight: 800, fontSize: '0.85rem', letterSpacing: '0.08em', textTransform: 'uppercase', margin: 0 }}>Your Signature</h3>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button type="button" className={`sig-tab${signMode === 'type' ? ' active' : ''}`} onClick={() => setSignMode('type')}>
                  ✍ Type
                </button>
                <button type="button" className={`sig-tab${signMode === 'draw' ? ' active' : ''}`} onClick={() => setSignMode('draw')}>
                  ✏ Draw
                </button>
              </div>
            </div>

            {signMode === 'type' ? (
              <>
                <label className="wv-label">Type your full name to sign *</label>
                <input
                  className="wv-input"
                  value={typedSig}
                  onChange={e => setTypedSig(e.target.value)}
                  placeholder="Type your name here..."
                  style={{ marginBottom: '1rem' }}
                />
                <label className="wv-label">Signature Preview</label>
                <div className="typed-sig">
                  {typedSig || <span style={{ color: '#2a2a2a', fontFamily: 'sans-serif', fontSize: '0.9rem', fontStyle: 'normal' }}>Your signature will appear here</span>}
                </div>
              </>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                  <label className="wv-label" style={{ margin: 0 }}>Draw your signature *</label>
                  <button type="button" onClick={clearCanvas}
                    style={{ background: 'none', border: '1px solid #333', color: MUTED, padding: '0.3rem 0.85rem', borderRadius: 6, cursor: 'pointer', fontSize: '0.78rem' }}>
                    Clear
                  </button>
                </div>
                <canvas ref={canvasRef} width={640} height={130} className="sig-canvas"
                  style={{ touchAction: 'none', userSelect: 'none', border: `1px solid ${hasDrawn ? GOLD + '55' : '#222'}`, transition: 'border-color 0.2s' }} />
                {!hasDrawn && <p style={{ color: '#444', fontSize: '0.78rem', textAlign: 'center', marginTop: '0.5rem', fontStyle: 'italic' }}>Draw your signature above</p>}
              </>
            )}
          </div>

          {/* Agreement */}
          <div className="wv-card" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <input
              type="checkbox"
              id="agree"
              checked={agreed}
              onChange={e => setAgreed(e.target.checked)}
              style={{ width: 20, height: 20, minWidth: 20, marginTop: 2, accentColor: GOLD, cursor: 'pointer' }}
            />
            <label htmlFor="agree" style={{ color: MUTED, fontSize: '0.88rem', lineHeight: 1.65, cursor: 'pointer' }}>
              I confirm that I have read and fully understand this waiver. By typing/drawing my name above, I intend to electronically sign this document and be legally bound by its terms. I am 18 years of age or older, or I am the parent/legal guardian of the minor participant.
            </label>
          </div>

          {error && (
            <div style={{ background: 'rgba(224,82,82,0.1)', border: `1px solid ${RED}44`, borderRadius: 8, padding: '0.85rem 1rem', marginBottom: '1rem', color: RED, fontSize: '0.88rem' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !hasSig || !agreed}
            style={{
              width: '100%', padding: '1.2rem', background: hasSig && agreed ? GOLD : '#1a1a1a',
              color: hasSig && agreed ? BG : '#333', border: `1px solid ${hasSig && agreed ? GOLD : '#222'}`,
              borderRadius: 10, fontWeight: 900, fontSize: '1.05rem', cursor: loading || !hasSig || !agreed ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
              transition: 'all 0.2s',
            }}
          >
            {loading ? (
              <>
                <div style={{ width: 18, height: 18, border: '2px solid rgba(10,10,10,0.3)', borderTopColor: BG, borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                Submitting...
              </>
            ) : (
              '🔒 Submit Signed Waiver'
            )}
          </button>

          <p style={{ textAlign: 'center', color: '#333', fontSize: '0.75rem', marginTop: '1rem' }}>
            Protected by U.S. ESIGN Act · Signature stored securely
          </p>
        </form>
      </div>
    </div>
  )
}
