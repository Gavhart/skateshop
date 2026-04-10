import { useState, useEffect } from 'react'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { fetchStokeEntries, insertStokeEntry, type StokeEntry } from '../lib/supabase'

const GOLD = '#c9a961'
const AVATARS = ['🛹','🔥','⚡','🤘','💀','🦅','🌊','🏔️','🌲','⭐','👊','✌️','🐐','🎯','🎪','🦎']

export default function WallOfStoke() {
  const [entries, setEntries] = useState<StokeEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(false)

  const [avatar, setAvatar] = useState('🛹')
  const [name, setName] = useState('')
  const [city, setCity] = useState('')
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')

  useScrollReveal([entries])

  useEffect(() => {
    fetchStokeEntries()
      .then(data => { setEntries(data); setLoading(false) })
      .catch(() => { setFetchError(true); setLoading(false) })
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !note.trim()) { setError('Name and note are required.'); return }
    if (note.trim().length < 10) { setError('Tell us a bit more!'); return }
    setSubmitting(true)
    setError('')
    try {
      const newEntry = await insertStokeEntry({
        avatar,
        name: name.trim(),
        city: city.trim() || 'Unknown',
        note: note.trim(),
      })
      setEntries(prev => [newEntry, ...prev])
      setSubmitted(true)
      setName(''); setCity(''); setNote(''); setAvatar('🛹')
    } catch {
      setError('Something went wrong. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  function fmtDate(d: string) {
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', background: '#111', border: '1px solid #2a2a2a', borderRadius: 8,
    color: '#fff', padding: '0.85rem 1rem', fontSize: '1rem', outline: 'none',
    transition: 'border-color 0.2s', boxSizing: 'border-box',
  }

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '6rem' }}>
      <style>{`
        .stoke-grid { columns: 1; gap: 1.25rem; padding: 0 1.5rem; max-width: 1100px; margin: 0 auto; }
        @media(min-width:640px) { .stoke-grid { columns: 2; } }
        @media(min-width:960px) { .stoke-grid { columns: 3; } }
        .stoke-card { break-inside: avoid; background: #111; border: 1px solid #1e1e1e;
          border-radius: 14px; padding: 1.5rem; margin-bottom: 1.25rem;
          transition: border-color 0.2s, transform 0.2s; }
        .stoke-card:hover { border-color: #333; transform: translateY(-2px); }
        .stoke-input:focus { border-color: ${GOLD} !important; }
        .stoke-avatar-btn { background: #111; border: 2px solid #222; border-radius: 10px;
          font-size: 1.6rem; padding: 0.4rem 0.5rem; cursor: pointer; transition: border-color 0.15s, transform 0.15s; }
        .stoke-avatar-btn:hover { border-color: #555; transform: scale(1.1); }
        .stoke-avatar-btn.selected { border-color: ${GOLD}; background: #1a1500; }
        .stoke-submit-btn { width: 100%; padding: 1rem; background: ${GOLD}; color: #000;
          border: none; border-radius: 8px; font-size: 1rem; font-weight: 800;
          letter-spacing: 0.08em; cursor: pointer; transition: opacity 0.2s; }
        .stoke-submit-btn:hover:not(:disabled) { opacity: 0.88; }
        .stoke-submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .stoke-drop-btn { padding: 0.9rem 2rem; background: transparent; border: 2px solid ${GOLD};
          color: ${GOLD}; border-radius: 8px; font-size: 0.9rem; font-weight: 700;
          letter-spacing: 0.08em; cursor: pointer; transition: background 0.2s, color 0.2s; }
        .stoke-drop-btn:hover { background: ${GOLD}; color: #000; }
        @keyframes spinDot { to { transform: rotate(360deg); } }
      `}</style>

      {/* Header */}
      <div style={{ textAlign: 'center', padding: '5rem 1.5rem 3rem' }}>
        <h1 className="glitch" data-text="WALL OF STOKE">WALL OF STOKE</h1>
        <p style={{ color: '#666', marginTop: '0.75rem', fontSize: '1rem' }}>
          Real talk from the community. Drop your story.
        </p>
        {!loading && !fetchError && (
          <p style={{ color: '#444', fontSize: '0.8rem', marginTop: '0.4rem' }}>
            {entries.length} {entries.length === 1 ? 'entry' : 'entries'} and counting
          </p>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#444' }}>
          <div style={{ width: 28, height: 28, border: `3px solid #222`, borderTopColor: GOLD,
            borderRadius: '50%', animation: 'spinDot 0.7s linear infinite', margin: '0 auto 1rem' }} />
          Loading the wall…
        </div>
      )}

      {/* Error state */}
      {fetchError && (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#555' }}>
          Couldn't load entries. Check your connection.
        </div>
      )}

      {/* Entries grid */}
      {!loading && !fetchError && (
        <div className="stoke-grid">
          {entries.length === 0 && (
            <div style={{ color: '#444', textAlign: 'center', padding: '3rem', gridColumn: '1/-1' }}>
              No entries yet — be the first to drop your stoke.
            </div>
          )}
          {entries.map((entry, i) => (
            <div key={entry.id} className={`stoke-card reveal reveal-delay-${(i % 4) + 1}`}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <span style={{ fontSize: '2rem', lineHeight: 1 }}>{entry.avatar}</span>
                <div>
                  <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>{entry.name}</div>
                  <div style={{ color: '#555', fontSize: '0.78rem' }}>📍 {entry.city}</div>
                </div>
                <div style={{ marginLeft: 'auto', color: '#444', fontSize: '0.72rem' }}>
                  {fmtDate(entry.created_at)}
                </div>
              </div>
              <p style={{ color: '#999', fontSize: '0.9rem', lineHeight: '1.65', margin: 0 }}>
                "{entry.note}"
              </p>
            </div>
          ))}
        </div>
      )}

      {/* CTA / Form */}
      <div style={{ maxWidth: 600, margin: '4rem auto 0', padding: '0 1.5rem', textAlign: 'center' }}>
        {!showForm ? (
          <>
            <p style={{ color: '#555', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
              Skated with us? Got your first setup here? Tell the world.
            </p>
            <button className="stoke-drop-btn" onClick={() => setShowForm(true)}>
              🤘 DROP YOUR STOKE
            </button>
          </>
        ) : submitted ? (
          <div style={{ background: '#111', border: `1px solid ${GOLD}`, borderRadius: 14, padding: '2.5rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🤘</div>
            <h3 style={{ color: GOLD, fontSize: '1.5rem', marginBottom: '0.5rem' }}>STOKE DROPPED.</h3>
            <p style={{ color: '#888', marginBottom: '2rem' }}>Your entry is live on the wall for everyone to see.</p>
            <button className="stoke-drop-btn" onClick={() => { setSubmitted(false); setShowForm(false) }}>
              Add Another
            </button>
          </div>
        ) : (
          <div style={{ background: '#0e0e0e', border: '1px solid #1e1e1e', borderRadius: 16, padding: '2.5rem 2rem', textAlign: 'left' }}>
            <h3 style={{ color: GOLD, marginBottom: '2rem', textAlign: 'center', fontSize: '1.3rem', letterSpacing: '0.06em' }}>
              DROP YOUR STOKE
            </h3>

            {/* Avatar picker */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ color: '#888', fontSize: '0.8rem', letterSpacing: '0.08em', display: 'block', marginBottom: '0.75rem' }}>
                PICK YOUR VIBE
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {AVATARS.map(a => (
                  <button key={a} className={`stoke-avatar-btn${avatar === a ? ' selected' : ''}`}
                    type="button" onClick={() => setAvatar(a)}>{a}</button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ color: '#888', fontSize: '0.78rem', letterSpacing: '0.08em', display: 'block', marginBottom: '0.4rem' }}>
                    NAME *
                  </label>
                  <input className="stoke-input" style={inputStyle} placeholder="Your name"
                    value={name} onChange={e => setName(e.target.value)} maxLength={40} />
                </div>
                <div>
                  <label style={{ color: '#888', fontSize: '0.78rem', letterSpacing: '0.08em', display: 'block', marginBottom: '0.4rem' }}>
                    CITY
                  </label>
                  <input className="stoke-input" style={inputStyle} placeholder="Soldotna, AK"
                    value={city} onChange={e => setCity(e.target.value)} maxLength={40} />
                </div>
              </div>

              <div>
                <label style={{ color: '#888', fontSize: '0.78rem', letterSpacing: '0.08em', display: 'block', marginBottom: '0.4rem' }}>
                  YOUR NOTE *
                </label>
                <textarea className="stoke-input"
                  style={{ ...inputStyle, minHeight: 110, resize: 'vertical', fontFamily: 'inherit' }}
                  placeholder="Tell us about your experience, your setup, your session…"
                  value={note} onChange={e => setNote(e.target.value)} maxLength={300} />
                <div style={{ color: '#444', fontSize: '0.72rem', textAlign: 'right', marginTop: '0.25rem' }}>
                  {note.length}/300
                </div>
              </div>

              {error && <p style={{ color: '#e05252', fontSize: '0.85rem', margin: 0 }}>{error}</p>}

              <button type="submit" className="stoke-submit-btn" disabled={submitting}>
                {submitting ? 'POSTING…' : 'POST TO THE WALL 🤘'}
              </button>
              <button type="button"
                style={{ background: 'none', border: 'none', color: '#444', cursor: 'pointer', fontSize: '0.85rem' }}
                onClick={() => { setShowForm(false); setError('') }}>
                Cancel
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
