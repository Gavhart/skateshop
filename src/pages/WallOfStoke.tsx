import { useState, useEffect } from 'react'
import { useScrollReveal } from '../hooks/useScrollReveal'

const GOLD = '#c9a961'
const AVATARS = ['🛹','🔥','⚡','🤘','💀','🦅','🌊','🏔️','🌲','⭐','👊','✌️','🐐','🎯','🎪','🦎']

const SEED_ENTRIES = [
  { id: 'seed-1', avatar: '🛹', name: 'Jake M.', city: 'Soldotna, AK', note: "Hart Boys hooked me up with my first real setup. Dude behind the counter spent 20 minutes helping me pick the right deck width. That's the kind of shop this is.", date: '2025-11-12' },
  { id: 'seed-2', avatar: '🔥', name: 'Taryn L.', city: 'Kenai, AK', note: "Drove over from Kenai specifically because everyone told me this was THE spot. They were right. Got a Powell deck and these guys actually know their stuff. Not just selling, they're skaters.", date: '2025-12-03' },
  { id: 'seed-3', avatar: '🤘', name: 'Cole R.', city: 'Homer, AK', note: "My son walked in nervous about getting into skating and walked out with a full setup and a smile. They took their time, no pressure. That means everything.", date: '2026-01-18' },
  { id: 'seed-4', avatar: '💀', name: 'Bex T.', city: 'Anchorage, AK', note: "Worth the drive every single time. Real talk — best skate shop in the state. Support locals.", date: '2026-02-07' },
  { id: 'seed-5', avatar: '🌊', name: 'Marcus H.', city: 'Soldotna, AK', note: "Built my first board here with their build-a-board thing online. Showed up to pick it up and they had it ready and DIALED. Trucks tight, wheels spinning right. These guys care.", date: '2026-03-22' },
]

interface Entry {
  id: string
  avatar: string
  name: string
  city: string
  note: string
  date: string
}

const LS_KEY = 'hb_wall_of_stoke'

function loadEntries(): Entry[] {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || '[]')
  } catch { return [] }
}

function saveEntries(entries: Entry[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(entries))
}

export default function WallOfStoke() {
  const [userEntries, setUserEntries] = useState<Entry[]>(loadEntries)
  const [avatar, setAvatar] = useState('🛹')
  const [name, setName] = useState('')
  const [city, setCity] = useState('')
  const [note, setNote] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')

  const allEntries = [...userEntries, ...SEED_ENTRIES]

  useScrollReveal([allEntries])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !note.trim()) { setError('Name and note are required.'); return }
    if (note.trim().length < 10) { setError('Tell us a bit more!'); return }
    const entry: Entry = {
      id: `user-${Date.now()}`,
      avatar,
      name: name.trim(),
      city: city.trim() || 'Unknown',
      note: note.trim(),
      date: new Date().toISOString().split('T')[0],
    }
    const updated = [entry, ...userEntries]
    setUserEntries(updated)
    saveEntries(updated)
    setSubmitted(true)
    setName(''); setCity(''); setNote(''); setAvatar('🛹'); setError('')
  }

  // Format date nicely
  function fmtDate(d: string) {
    return new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
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
        .stoke-submit-btn:hover { opacity: 0.88; }
        .stoke-drop-btn { padding: 0.9rem 2rem; background: transparent; border: 2px solid ${GOLD};
          color: ${GOLD}; border-radius: 8px; font-size: 0.9rem; font-weight: 700;
          letter-spacing: 0.08em; cursor: pointer; transition: background 0.2s, color 0.2s; }
        .stoke-drop-btn:hover { background: ${GOLD}; color: #000; }
      `}</style>

      {/* Header */}
      <div style={{ textAlign: 'center', padding: '5rem 1.5rem 3rem' }}>
        <h1 className="glitch" data-text="WALL OF STOKE">WALL OF STOKE</h1>
        <p style={{ color: '#666', marginTop: '0.75rem', fontSize: '1rem' }}>
          Real talk from the community. Drop your story.
        </p>
      </div>

      {/* Entries grid */}
      <div className="stoke-grid">
        {allEntries.map((entry, i) => (
          <div key={entry.id} className={`stoke-card reveal reveal-delay-${(i % 4) + 1}`}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <span style={{ fontSize: '2rem', lineHeight: 1 }}>{entry.avatar}</span>
              <div>
                <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>{entry.name}</div>
                <div style={{ color: '#555', fontSize: '0.78rem' }}>📍 {entry.city}</div>
              </div>
              <div style={{ marginLeft: 'auto', color: '#444', fontSize: '0.72rem' }}>{fmtDate(entry.date)}</div>
            </div>
            <p style={{ color: '#999', fontSize: '0.9rem', lineHeight: '1.65', margin: 0 }}>
              "{entry.note}"
            </p>
          </div>
        ))}
      </div>

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
            <p style={{ color: '#888', marginBottom: '2rem' }}>Your entry is live on the wall.</p>
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
                  <input className="stoke-input" style={inputStyle} placeholder="Your name" value={name}
                    onChange={e => setName(e.target.value)} maxLength={40} />
                </div>
                <div>
                  <label style={{ color: '#888', fontSize: '0.78rem', letterSpacing: '0.08em', display: 'block', marginBottom: '0.4rem' }}>
                    CITY
                  </label>
                  <input className="stoke-input" style={inputStyle} placeholder="Soldotna, AK" value={city}
                    onChange={e => setCity(e.target.value)} maxLength={40} />
                </div>
              </div>

              <div>
                <label style={{ color: '#888', fontSize: '0.78rem', letterSpacing: '0.08em', display: 'block', marginBottom: '0.4rem' }}>
                  YOUR NOTE *
                </label>
                <textarea className="stoke-input" style={{ ...inputStyle, minHeight: 110, resize: 'vertical', fontFamily: 'inherit' }}
                  placeholder="Tell us about your experience, your setup, your session…"
                  value={note} onChange={e => setNote(e.target.value)} maxLength={300} />
                <div style={{ color: '#444', fontSize: '0.72rem', textAlign: 'right', marginTop: '0.25rem' }}>
                  {note.length}/300
                </div>
              </div>

              {error && <p style={{ color: '#e05252', fontSize: '0.85rem', margin: 0 }}>{error}</p>}

              <button type="submit" className="stoke-submit-btn">POST TO THE WALL 🤘</button>
              <button type="button" style={{ background: 'none', border: 'none', color: '#444', cursor: 'pointer', fontSize: '0.85rem' }}
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
