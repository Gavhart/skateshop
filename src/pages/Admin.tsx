import { useState, useEffect } from 'react'
import { fetchClassSignups, fetchStokeEntries, type ClassSignup, type StokeEntry } from '../lib/supabase'

// ── Change this password to whatever you want ──────────────────────────────
const ADMIN_PASSWORD = 'dropIn@HB26'

const GOLD = '#c9a961'
const BG = '#0a0a0a'
const CARD = '#111'
const BORDER = '#1e1e1e'

type Tab = 'signups' | 'wall'

const CLASS_LABELS: Record<string, string> = {
  beginner: '🟢 Beginner Basics',
  street: '🟡 Street Techniques',
  group: '🔵 Small Group',
}

const SKILL_LABELS: Record<string, string> = {
  never: 'Never skated',
  basic: 'Can push & roll',
  tricks: 'Learning tricks',
}

function fmt(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function Admin() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem('hb_admin') === '1')
  const [pw, setPw] = useState('')
  const [pwError, setPwError] = useState(false)

  const [tab, setTab] = useState<Tab>('signups')
  const [signups, setSignups] = useState<ClassSignup[]>([])
  const [wall, setWall] = useState<StokeEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')

  function login(e: React.FormEvent) {
    e.preventDefault()
    if (pw === ADMIN_PASSWORD) {
      sessionStorage.setItem('hb_admin', '1')
      setAuthed(true)
    } else {
      setPwError(true)
      setPw('')
    }
  }

  useEffect(() => {
    if (!authed) return
    setLoading(true)
    Promise.all([fetchClassSignups(), fetchStokeEntries()])
      .then(([s, w]) => { setSignups(s); setWall(w) })
      .finally(() => setLoading(false))
  }, [authed])

  const inputStyle: React.CSSProperties = {
    background: '#111', border: `1px solid #2a2a2a`, borderRadius: 8,
    color: '#fff', padding: '0.75rem 1rem', fontSize: '0.95rem', outline: 'none',
    width: '100%', boxSizing: 'border-box',
  }

  // ── Login screen ──────────────────────────────────────────────────────────
  if (!authed) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: BG }}>
        <div style={{ width: '100%', maxWidth: 360, padding: '0 1.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔒</div>
            <h2 style={{ color: GOLD, letterSpacing: '0.1em', margin: 0 }}>ADMIN</h2>
            <p style={{ color: '#444', fontSize: '0.85rem', marginTop: '0.25rem' }}>Hart Boys Skate Shop</p>
          </div>
          <form onSubmit={login} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input
              type="password"
              placeholder="Password"
              value={pw}
              onChange={e => { setPw(e.target.value); setPwError(false) }}
              style={{ ...inputStyle, textAlign: 'center', fontSize: '1.1rem' }}
              autoFocus
            />
            {pwError && <p style={{ color: '#e05252', textAlign: 'center', margin: 0, fontSize: '0.85rem' }}>Wrong password.</p>}
            <button type="submit" style={{
              padding: '0.9rem', background: GOLD, color: '#000', border: 'none',
              borderRadius: 8, fontWeight: 800, fontSize: '0.95rem', letterSpacing: '0.08em', cursor: 'pointer',
            }}>
              ENTER
            </button>
          </form>
        </div>
      </div>
    )
  }

  // ── Filtered data ─────────────────────────────────────────────────────────
  const q = search.toLowerCase()
  const filteredSignups = signups.filter(s =>
    !q || s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q) || s.class_type.includes(q)
  )
  const filteredWall = wall.filter(w =>
    !q || w.name.toLowerCase().includes(q) || w.city.toLowerCase().includes(q) || w.note.toLowerCase().includes(q)
  )

  // ── Dashboard ─────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: BG, paddingBottom: '4rem' }}>
      <style>{`
        .admin-table { width: 100%; border-collapse: collapse; font-size: 0.88rem; }
        .admin-table th { color: #555; font-weight: 600; letter-spacing: 0.08em; font-size: 0.72rem;
          text-align: left; padding: 0.6rem 1rem; border-bottom: 1px solid #1a1a1a; white-space: nowrap; }
        .admin-table td { padding: 0.85rem 1rem; border-bottom: 1px solid #161616; color: #aaa; vertical-align: top; }
        .admin-table tr:last-child td { border-bottom: none; }
        .admin-table tr:hover td { background: #141414; }
        .admin-tab { padding: 0.6rem 1.4rem; border: 1px solid #222; border-radius: 6px;
          background: none; color: #555; cursor: pointer; font-size: 0.8rem; font-weight: 700;
          letter-spacing: 0.06em; transition: all 0.15s; }
        .admin-tab.active { background: ${GOLD}; color: #000; border-color: ${GOLD}; }
        .admin-tab:not(.active):hover { border-color: #444; color: #aaa; }
        @media(max-width:640px) { .admin-table th, .admin-table td { padding: 0.65rem 0.5rem; } }
      `}</style>

      {/* Header */}
      <div style={{ borderBottom: `1px solid ${BORDER}`, padding: '1.5rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ color: GOLD, fontSize: '1.2rem', letterSpacing: '0.1em', margin: 0 }}>HART BOYS — ADMIN</h1>
          <p style={{ color: '#444', fontSize: '0.78rem', margin: '0.2rem 0 0' }}>Class signups & Wall of Stoke</p>
        </div>
        <button onClick={() => { sessionStorage.removeItem('hb_admin'); setAuthed(false) }}
          style={{ background: 'none', border: '1px solid #2a2a2a', color: '#555', borderRadius: 6, padding: '0.4rem 1rem', cursor: 'pointer', fontSize: '0.8rem' }}>
          Log out
        </button>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', padding: '1.5rem 2rem' }}>
        {[
          { label: 'Class Signups', value: signups.length, icon: '🛹' },
          { label: 'This Month', value: signups.filter(s => new Date(s.created_at).getMonth() === new Date().getMonth()).length, icon: '📅' },
          { label: 'Wall of Stoke', value: wall.length, icon: '🤘' },
        ].map(stat => (
          <div key={stat.label} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '1.25rem 1.5rem' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>{stat.icon}</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', lineHeight: 1 }}>{loading ? '…' : stat.value}</div>
            <div style={{ color: '#555', fontSize: '0.78rem', marginTop: '0.3rem' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs + search */}
      <div style={{ padding: '0 2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
        <button className={`admin-tab${tab === 'signups' ? ' active' : ''}`} onClick={() => setTab('signups')}>
          CLASS SIGNUPS ({signups.length})
        </button>
        <button className={`admin-tab${tab === 'wall' ? ' active' : ''}`} onClick={() => setTab('wall')}>
          WALL OF STOKE ({wall.length})
        </button>
        <input
          style={{ ...inputStyle, width: 'auto', flex: 1, minWidth: 160, maxWidth: 280, padding: '0.5rem 0.9rem', fontSize: '0.85rem' }}
          placeholder="Search…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div style={{ margin: '0 2rem', background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, overflow: 'auto' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#444' }}>Loading…</div>
        ) : tab === 'signups' ? (
          filteredSignups.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#444' }}>No signups yet.</div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>NAME</th>
                  <th>EMAIL</th>
                  <th>PHONE</th>
                  <th>AGE</th>
                  <th>CLASS</th>
                  <th>SKILL</th>
                  <th>NOTES</th>
                  <th>DATE</th>
                </tr>
              </thead>
              <tbody>
                {filteredSignups.map(s => (
                  <tr key={s.id}>
                    <td style={{ color: '#fff', fontWeight: 600, whiteSpace: 'nowrap' }}>{s.name}</td>
                    <td><a href={`mailto:${s.email}`} style={{ color: GOLD, textDecoration: 'none' }}>{s.email}</a></td>
                    <td style={{ whiteSpace: 'nowrap' }}>{s.phone || '—'}</td>
                    <td>{s.age || '—'}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>{CLASS_LABELS[s.class_type] || s.class_type}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>{SKILL_LABELS[s.skill_level || ''] || s.skill_level || '—'}</td>
                    <td style={{ maxWidth: 200, color: '#666' }}>{s.message || '—'}</td>
                    <td style={{ whiteSpace: 'nowrap', color: '#555' }}>{fmt(s.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        ) : (
          filteredWall.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#444' }}>No entries yet.</div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>AVATAR</th>
                  <th>NAME</th>
                  <th>CITY</th>
                  <th>NOTE</th>
                  <th>DATE</th>
                </tr>
              </thead>
              <tbody>
                {filteredWall.map(w => (
                  <tr key={w.id}>
                    <td style={{ fontSize: '1.4rem' }}>{w.avatar}</td>
                    <td style={{ color: '#fff', fontWeight: 600, whiteSpace: 'nowrap' }}>{w.name}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>📍 {w.city}</td>
                    <td style={{ maxWidth: 320, color: '#666', lineHeight: 1.5 }}>"{w.note}"</td>
                    <td style={{ whiteSpace: 'nowrap', color: '#555' }}>{fmt(w.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        )}
      </div>
    </div>
  )
}
