import { useRef, useState, useEffect } from 'react'
// Canvas drawing is handled via native event listeners in useEffect (passive: false for touch)
import { Link } from 'react-router-dom'
import { insertWaiver } from '../lib/supabase'

const GOLD = '#c9a961'
const BG = '#0a0a0a'
const CARD = '#1a1a1a'
const TEXT = '#ffffff'
const MUTED = '#888'

export default function WaiverSign() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isDrawing = useRef(false)
  const lastPos = useRef<{ x: number; y: number } | null>(null)
  const [hasSig, setHasSig] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const getPosFromEvent = (e: MouseEvent | TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const src = 'touches' in e ? e.touches[0] : e
    return {
      x: (src.clientX - rect.left) * scaleX,
      y: (src.clientY - rect.top) * scaleY,
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.fillStyle = '#111'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    const onStart = (e: MouseEvent | TouchEvent) => {
      e.preventDefault()
      isDrawing.current = true
      lastPos.current = getPosFromEvent(e, canvas)
    }

    const onMove = (e: MouseEvent | TouchEvent) => {
      e.preventDefault()
      if (!isDrawing.current || !lastPos.current) return
      const c = canvas.getContext('2d')!
      c.strokeStyle = GOLD
      c.lineWidth = 2.5
      c.lineCap = 'round'
      c.lineJoin = 'round'
      const pos = getPosFromEvent(e, canvas)
      c.beginPath()
      c.moveTo(lastPos.current.x, lastPos.current.y)
      c.lineTo(pos.x, pos.y)
      c.stroke()
      lastPos.current = pos
      setHasSig(true)
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

  const clearSig = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.fillStyle = '#111'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    setHasSig(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!hasSig) { setError('Please sign the waiver above.'); return }
    setError('')
    setLoading(true)
    try {
      const canvas = canvasRef.current!
      const sig = canvas.toDataURL('image/png')
      await insertWaiver({ name, email, signature_data: sig })
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div style={{ background: BG, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ textAlign: 'center', maxWidth: 480 }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🤘</div>
          <h2 style={{ color: GOLD, fontSize: '2rem', marginBottom: '1rem' }}>Waiver Signed!</h2>
          <p style={{ color: MUTED, marginBottom: '2rem', lineHeight: 1.7 }}>
            You're all set, <strong style={{ color: TEXT }}>{name}</strong>. We'll see you at the session.
            Bring your helmet and pads!
          </p>
          <Link
            to="/classes"
            style={{ display: 'inline-block', padding: '1rem 2.5rem', background: GOLD, color: BG, fontWeight: 'bold', borderRadius: 8, textDecoration: 'none', fontSize: '1rem' }}
          >
            ← Back to Classes
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: BG, minHeight: '100vh', padding: '2rem 1rem 4rem', color: TEXT }}>
      <style>{`
        .waiver-wrap { max-width: 700px; margin: 0 auto; }
        .waiver-section { background: ${CARD}; border-radius: 12px; padding: 2rem; margin-bottom: 1.5rem; }
        .waiver-text { color: ${MUTED}; font-size: 0.88rem; line-height: 1.8; }
        .waiver-text h4 { color: ${GOLD}; margin: 1.2rem 0 0.4rem; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.08em; }
        .sig-canvas { width: 100%; height: 160px; border-radius: 8px; cursor: crosshair; display: block; touch-action: none; }
        .w-input { width: 100%; padding: 0.9rem 1rem; background: #0a0a0a; border: 1px solid #333; color: white; border-radius: 6px; font-size: 1rem; box-sizing: border-box; transition: border-color 0.2s; }
        .w-input:focus { outline: none; border-color: ${GOLD}; }
        .w-label { display: block; color: #666; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 0.5rem; }
        .w-field { margin-bottom: 1.2rem; }
        .w-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        @media (max-width: 520px) { .w-row { grid-template-columns: 1fr; } .waiver-section { padding: 1.25rem; } }
      `}</style>

      <div className="waiver-wrap">
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link to="/classes" style={{ color: MUTED, fontSize: '0.85rem', textDecoration: 'none' }}>← Back to Classes</Link>
          <h1 style={{ color: GOLD, fontSize: 'clamp(1.8rem, 5vw, 2.5rem)', margin: '0.75rem 0 0.25rem', fontWeight: 900, letterSpacing: '-0.02em' }}>
            LIABILITY WAIVER
          </h1>
          <p style={{ color: MUTED, fontSize: '0.9rem' }}>Hart Boys Skate Shop — Class Participation</p>
        </div>

        {/* Waiver text */}
        <div className="waiver-section">
          <div className="waiver-text">
            <h4>Assumption of Risk</h4>
            <p>I understand that skateboarding is an extreme sport that involves inherent risks of injury, including but not limited to: sprains, fractures, lacerations, concussions, and other serious bodily harm. I voluntarily assume all risks associated with participation in any class or activity hosted by Hart Boys Skate Shop.</p>

            <h4>Release of Liability</h4>
            <p>In consideration of being allowed to participate, I hereby release, waive, and discharge Hart Boys Skate Shop, its owners, instructors, employees, volunteers, and agents from any and all liability, claims, demands, and causes of action arising out of or related to any loss, damage, or injury, including death, that may be sustained by me during participation in any class or activity.</p>

            <h4>Instruction Disclaimer</h4>
            <p>I understand that classes are taught by local skaters who are not certified professional instructors. Instruction is provided on a volunteer or informal basis. I agree that Hart Boys Skate Shop makes no warranty, express or implied, regarding the qualifications or certifications of its instructors.</p>

            <h4>Equipment & Safety</h4>
            <p>I agree to wear appropriate protective gear including a properly fitted helmet. I understand that I am responsible for inspecting my own equipment prior to participation. Hart Boys Skate Shop is not responsible for damage to or loss of personal property.</p>

            <h4>Minor Participants</h4>
            <p>If I am the parent or legal guardian signing on behalf of a minor, I consent to the minor's participation and agree to all terms of this waiver on the minor's behalf. I accept full responsibility for the minor's safety and conduct.</p>

            <h4>Medical Authorization</h4>
            <p>I authorize Hart Boys Skate Shop staff to seek emergency medical treatment on my behalf (or on behalf of the minor I represent) in the event of an injury. I am responsible for all medical costs incurred.</p>

            <h4>Governing Law</h4>
            <p>This agreement shall be governed by the laws of the State of Alaska. If any provision of this waiver is found to be unenforceable, the remaining provisions shall remain in full force and effect.</p>
          </div>
        </div>

        {/* Signature form */}
        <form onSubmit={handleSubmit}>
          <div className="waiver-section">
            <h3 style={{ color: GOLD, marginBottom: '1.5rem', fontSize: '1.1rem', fontWeight: 800 }}>YOUR INFORMATION</h3>
            <div className="w-row">
              <div className="w-field">
                <label className="w-label">Full Name *</label>
                <input
                  className="w-input"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Jane Smith"
                />
              </div>
              <div className="w-field">
                <label className="w-label">Email *</label>
                <input
                  className="w-input"
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="jane@email.com"
                />
              </div>
            </div>

            {/* Date (auto) */}
            <div className="w-field">
              <label className="w-label">Date Signed</label>
              <input
                className="w-input"
                value={new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                readOnly
                style={{ color: MUTED, cursor: 'default' }}
              />
            </div>
          </div>

          {/* Signature pad */}
          <div className="waiver-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ color: GOLD, fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>SIGN BELOW</h3>
              <button
                type="button"
                onClick={clearSig}
                style={{ background: 'transparent', border: '1px solid #444', color: MUTED, padding: '0.4rem 1rem', borderRadius: 6, cursor: 'pointer', fontSize: '0.8rem' }}
              >
                Clear
              </button>
            </div>
            <p style={{ color: MUTED, fontSize: '0.8rem', marginBottom: '0.75rem' }}>
              Draw your signature using your mouse or finger
            </p>
            <canvas
              ref={canvasRef}
              width={640}
              height={160}
              className="sig-canvas"
              style={{ touchAction: 'none', userSelect: 'none' }}
            />
            {!hasSig && (
              <p style={{ color: '#555', fontSize: '0.8rem', textAlign: 'center', marginTop: '0.5rem', fontStyle: 'italic' }}>
                ↑ Sign your name in the box above
              </p>
            )}
          </div>

          {/* Agreement checkbox */}
          <div className="waiver-section" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <input
              type="checkbox"
              id="agree"
              required
              style={{ width: 20, height: 20, minWidth: 20, marginTop: 2, accentColor: GOLD, cursor: 'pointer' }}
            />
            <label htmlFor="agree" style={{ color: MUTED, fontSize: '0.9rem', lineHeight: 1.6, cursor: 'pointer' }}>
              By checking this box and signing above, I confirm that I have read and fully understand this waiver. I agree to be legally bound by its terms. I am 18 years of age or older, or I am the parent/legal guardian of the minor participant.
            </label>
          </div>

          {error && (
            <p style={{ color: '#e05', background: 'rgba(238,0,85,0.1)', border: '1px solid rgba(238,0,85,0.3)', padding: '0.75rem 1rem', borderRadius: 8, marginBottom: '1rem', fontSize: '0.9rem' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '1.25rem', background: GOLD, color: BG,
              border: 'none', borderRadius: 8, fontWeight: 900, fontSize: '1.1rem',
              cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              transition: 'opacity 0.2s',
            }}
          >
            {loading ? (
              <>
                <div style={{ width: 18, height: 18, border: '2px solid rgba(10,10,10,0.3)', borderTopColor: BG, borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                Saving...
              </>
            ) : (
              '✍️  SIGN & SUBMIT WAIVER'
            )}
          </button>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </form>
      </div>
    </div>
  )
}
