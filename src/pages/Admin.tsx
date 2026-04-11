import { useState, useEffect, useRef } from 'react'
import {
  fetchClassSignups, confirmSignup, deleteSignup,
  fetchStokeEntries, approveWallEntry, deleteWallEntry,
  fetchWaivers, deleteWaiver,
  type ClassSignup, type StokeEntry, type Waiver,
} from '../lib/supabase'

const ADMIN_PASSWORD = 'dropIn@HB26'
const LAST_VISIT_KEY = 'hb_admin_last_visit'
const GOLD = '#c9a961'
const GREEN = '#4caf7d'
const RED = '#e05252'
const BG = '#0a0a0a'
const CARD = '#111'
const BORDER = '#1e1e1e'

type Tab = 'signups' | 'wall' | 'waivers'

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
  return new Date(d).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

function isNew(dateStr: string, since: number) {
  return new Date(dateStr).getTime() > since
}

function exportCSV(signups: ClassSignup[]) {
  const headers = ['Name', 'Email', 'Phone', 'Age', 'Class', 'Skill Level', 'Notes', 'Confirmed', 'Date']
  const rows = signups.map(s => [
    s.name, s.email, s.phone || '', s.age || '', CLASS_LABELS[s.class_type] || s.class_type,
    SKILL_LABELS[s.skill_level || ''] || s.skill_level || '', s.message || '',
    s.confirmed ? 'Yes' : 'No', fmt(s.created_at),
  ])
  const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url
  a.download = `hartboys-signups-${new Date().toISOString().split('T')[0]}.csv`
  a.click(); URL.revokeObjectURL(url)
}

export default function Admin() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem('hb_admin') === '1')
  const [pw, setPw] = useState('')
  const [pwError, setPwError] = useState(false)
  const lastVisit = useRef(Number(localStorage.getItem(LAST_VISIT_KEY) || 0))

  const [tab, setTab] = useState<Tab>('signups')
  const [signups, setSignups] = useState<ClassSignup[]>([])
  const [wall, setWall] = useState<StokeEntry[]>([])
  const [waivers, setWaivers] = useState<Waiver[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null)

  function login(e: React.FormEvent) {
    e.preventDefault()
    if (pw === ADMIN_PASSWORD) {
      sessionStorage.setItem('hb_admin', '1')
      setAuthed(true)
    } else {
      setPwError(true); setPw('')
    }
  }

  function logout() {
    localStorage.setItem(LAST_VISIT_KEY, Date.now().toString())
    sessionStorage.removeItem('hb_admin')
    setAuthed(false)
  }

  useEffect(() => {
    if (!authed) return
    setLoading(true)
    Promise.all([fetchClassSignups(), fetchStokeEntries(false), fetchWaivers()])
      .then(([s, w, wv]) => { setSignups(s); setWall(w); setWaivers(wv) })
      .finally(() => setLoading(false))
  }, [authed])

  // ── Actions ───────────────────────────────────────────────────────────────

  async function toggleConfirm(s: ClassSignup) {
    await confirmSignup(s.id, !s.confirmed)
    setSignups(prev => prev.map(x => x.id === s.id ? { ...x, confirmed: !s.confirmed } : x))
  }

  async function handleDeleteSignup(id: string) {
    await deleteSignup(id)
    setSignups(prev => prev.filter(x => x.id !== id))
    setConfirmingDelete(null)
  }

  async function toggleApprove(w: StokeEntry) {
    await approveWallEntry(w.id, !w.approved)
    setWall(prev => prev.map(x => x.id === w.id ? { ...x, approved: !w.approved } : x))
  }

  async function handleDeleteWall(id: string) {
    await deleteWallEntry(id)
    setWall(prev => prev.filter(x => x.id !== id))
    setConfirmingDelete(null)
  }

  async function handleDeleteWaiver(id: string) {
    await deleteWaiver(id)
    setWaivers(prev => prev.filter(x => x.id !== id))
    setConfirmingDelete(null)
  }

  // ── Styles ─────────────────────────────────────────────────────────────────

  const inputStyle: React.CSSProperties = {
    background: '#111', border: `1px solid #2a2a2a`, borderRadius: 8,
    color: '#fff', padding: '0.75rem 1rem', fontSize: '0.95rem', outline: 'none',
    width: '100%', boxSizing: 'border-box',
  }

  const iconBtn = (color: string): React.CSSProperties => ({
    background: 'none', border: `1px solid ${color}22`, borderRadius: 6,
    color, cursor: 'pointer', padding: '0.3rem 0.55rem', fontSize: '0.8rem',
    transition: 'background 0.15s', whiteSpace: 'nowrap',
  })

  // ── Login ─────────────────────────────────────────────────────────────────

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
            <input type="password" placeholder="Password" value={pw} autoFocus
              onChange={e => { setPw(e.target.value); setPwError(false) }}
              style={{ ...inputStyle, textAlign: 'center', fontSize: '1.1rem' }} />
            {pwError && <p style={{ color: RED, textAlign: 'center', margin: 0, fontSize: '0.85rem' }}>Wrong password.</p>}
            <button type="submit" style={{
              padding: '0.9rem', background: GOLD, color: '#000', border: 'none',
              borderRadius: 8, fontWeight: 800, fontSize: '0.95rem', letterSpacing: '0.08em', cursor: 'pointer',
            }}>ENTER</button>
          </form>
        </div>
      </div>
    )
  }

  // ── Filtered data ─────────────────────────────────────────────────────────

  const q = search.toLowerCase()
  const filteredSignups = signups.filter(s =>
    !q || s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q) || (s.class_type || '').includes(q)
  )
  const filteredWall = wall.filter(w =>
    !q || w.name.toLowerCase().includes(q) || w.city.toLowerCase().includes(q) || w.note.toLowerCase().includes(q)
  )

  const newSignups = signups.filter(s => isNew(s.created_at, lastVisit.current)).length
  const newWall = wall.filter(w => isNew(w.created_at, lastVisit.current)).length
  const pendingWall = wall.filter(w => !w.approved).length
  const newWaivers = waivers.filter(w => isNew(w.created_at, lastVisit.current)).length
  const filteredWaivers = waivers.filter(w =>
    !q || w.name.toLowerCase().includes(q) || w.email.toLowerCase().includes(q)
  )

  // ── Dashboard ─────────────────────────────────────────────────────────────

  return (
    <div style={{ minHeight: '100vh', background: BG, paddingBottom: '4rem' }}>
      <style>{`
        .admin-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
        .admin-table th { color: #555; font-weight: 600; letter-spacing: 0.07em; font-size: 0.7rem;
          text-align: left; padding: 0.6rem 0.85rem; border-bottom: 1px solid #1a1a1a; white-space: nowrap; }
        .admin-table td { padding: 0.8rem 0.85rem; border-bottom: 1px solid #161616; color: #aaa; vertical-align: middle; }
        .admin-table tr:last-child td { border-bottom: none; }
        .admin-table tr:hover td { background: #141414; }
        .admin-table .sticky-col { position: sticky; right: 0; background: #111; z-index: 1; box-shadow: -4px 0 8px rgba(0,0,0,0.4); }
        .admin-table tr:hover .sticky-col { background: #141414; }
        .admin-tab { padding: 0.55rem 1.2rem; border: 1px solid #222; border-radius: 6px;
          background: none; color: #555; cursor: pointer; font-size: 0.78rem; font-weight: 700;
          letter-spacing: 0.06em; transition: all 0.15s; position: relative; }
        .admin-tab.active { background: ${GOLD}; color: #000; border-color: ${GOLD}; }
        .admin-tab:not(.active):hover { border-color: #444; color: #aaa; }
        .new-dot { display: inline-block; background: ${RED}; color: #fff; border-radius: 10px;
          font-size: 0.65rem; font-weight: 800; padding: 0.1rem 0.4rem; margin-left: 0.4rem; vertical-align: middle; }
        .pending-dot { display: inline-block; background: #e09a52; color: #000; border-radius: 10px;
          font-size: 0.65rem; font-weight: 800; padding: 0.1rem 0.4rem; margin-left: 0.4rem; vertical-align: middle; }
        .icon-btn:hover { background: rgba(255,255,255,0.06) !important; }
        .confirm-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); display: flex;
          align-items: center; justify-content: center; z-index: 100; }
        .desktop-table { display: block; }
        .mobile-cards { display: none; }
        .mobile-card { background: #161616; border: 1px solid #222; border-radius: 10px; padding: 1rem; margin-bottom: 0.75rem; }
        .mobile-card-row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.4rem; font-size: 0.85rem; }
        .mobile-card-label { color: #555; font-size: 0.7rem; letter-spacing: 0.06em; font-weight: 600; }
        .mobile-card-actions { display: flex; gap: 0.5rem; margin-top: 0.85rem; flex-wrap: wrap; }
        @media(max-width: 700px) {
          .desktop-table { display: none; }
          .mobile-cards { display: block; padding: 1rem; }
        }
      `}</style>

      {/* Delete confirm overlay */}
      {confirmingDelete && (
        <div className="confirm-overlay">
          <div style={{ background: '#161616', border: `1px solid #2a2a2a`, borderRadius: 14, padding: '2rem', maxWidth: 340, width: '90%', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🗑️</div>
            <p style={{ color: '#ccc', marginBottom: '1.5rem' }}>Are you sure? This can't be undone.</p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button onClick={() => setConfirmingDelete(null)}
                style={{ padding: '0.6rem 1.4rem', background: 'none', border: '1px solid #333', color: '#888', borderRadius: 7, cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={() => {
                const [type, id] = confirmingDelete.split(':')
                if (type === 'signup') handleDeleteSignup(id)
                else if (type === 'wall') handleDeleteWall(id)
                else handleDeleteWaiver(id)
              }} style={{ padding: '0.6rem 1.4rem', background: RED, border: 'none', color: '#fff', borderRadius: 7, cursor: 'pointer', fontWeight: 700 }}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ borderBottom: `1px solid ${BORDER}`, padding: '1.25rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ color: GOLD, fontSize: '1.1rem', letterSpacing: '0.1em', margin: 0 }}>HART BOYS — ADMIN</h1>
          <p style={{ color: '#444', fontSize: '0.75rem', margin: '0.15rem 0 0' }}>Class signups & Wall of Stoke</p>
        </div>
        <button onClick={logout} style={{ background: 'none', border: '1px solid #2a2a2a', color: '#555', borderRadius: 6, padding: '0.4rem 1rem', cursor: 'pointer', fontSize: '0.8rem' }}>
          Log out
        </button>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', padding: '1.5rem 2rem' }}>
        {[
          { label: 'Total Signups', value: signups.length, icon: '🛹', accent: GOLD },
          { label: 'This Month', value: signups.filter(s => new Date(s.created_at).getMonth() === new Date().getMonth()).length, icon: '📅', accent: '#888' },
          { label: 'Confirmed', value: signups.filter(s => s.confirmed).length, icon: '✅', accent: GREEN },
          { label: 'Wall Entries', value: wall.length, icon: '🤘', accent: GOLD },
          { label: 'Pending Review', value: pendingWall, icon: '⏳', accent: '#e09a52' },
          { label: 'Signed Waivers', value: waivers.length, icon: '✍️', accent: '#7eb8f7' },
        ].map(stat => (
          <div key={stat.label} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '1.1rem 1.25rem' }}>
            <div style={{ fontSize: '1.3rem', marginBottom: '0.3rem' }}>{stat.icon}</div>
            <div style={{ fontSize: '1.9rem', fontWeight: 800, color: stat.accent, lineHeight: 1 }}>{loading ? '…' : stat.value}</div>
            <div style={{ color: '#555', fontSize: '0.74rem', marginTop: '0.25rem' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs + search + export */}
      <div style={{ padding: '0 2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
        <button className={`admin-tab${tab === 'signups' ? ' active' : ''}`} onClick={() => setTab('signups')}>
          SIGNUPS ({signups.length})
          {newSignups > 0 && <span className="new-dot">{newSignups} NEW</span>}
        </button>
        <button className={`admin-tab${tab === 'wall' ? ' active' : ''}`} onClick={() => setTab('wall')}>
          WALL OF STOKE ({wall.length})
          {newWall > 0 && <span className="new-dot">{newWall} NEW</span>}
          {pendingWall > 0 && <span className="pending-dot">{pendingWall} PENDING</span>}
        </button>
        <button className={`admin-tab${tab === 'waivers' ? ' active' : ''}`} onClick={() => setTab('waivers')}>
          WAIVERS ({waivers.length})
          {newWaivers > 0 && <span className="new-dot">{newWaivers} NEW</span>}
        </button>
        <input style={{ ...inputStyle, width: 'auto', flex: 1, minWidth: 140, maxWidth: 260, padding: '0.5rem 0.9rem', fontSize: '0.85rem' }}
          placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} />
        {tab === 'signups' && signups.length > 0 && (
          <button onClick={() => exportCSV(signups)} style={{
            padding: '0.5rem 1rem', background: 'none', border: `1px solid #2a2a2a`,
            color: '#888', borderRadius: 7, cursor: 'pointer', fontSize: '0.8rem', whiteSpace: 'nowrap',
          }}>
            ⬇ Export CSV
          </button>
        )}
      </div>

      {/* ── Desktop table ── */}
      <div className="desktop-table" style={{ margin: '0 2rem', background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, overflow: 'auto' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#444' }}>Loading…</div>
        ) : tab === 'signups' ? (
          filteredSignups.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#444' }}>No signups yet.</div>
          ) : (
            <table className="admin-table">
              <thead><tr>
                <th></th><th>NAME</th><th>EMAIL</th><th>PHONE</th><th>AGE</th>
                <th>CLASS</th><th>SKILL</th><th>NOTES</th><th>DATE</th>
                <th className="sticky-col">ACTIONS</th>
              </tr></thead>
              <tbody>
                {filteredSignups.map(s => (
                  <tr key={s.id}>
                    <td>{isNew(s.created_at, lastVisit.current) && <span style={{ background: RED, color: '#fff', borderRadius: 8, fontSize: '0.6rem', fontWeight: 800, padding: '0.1rem 0.4rem' }}>NEW</span>}</td>
                    <td style={{ color: '#fff', fontWeight: 600, whiteSpace: 'nowrap' }}>{s.name}</td>
                    <td><a href={`mailto:${s.email}`} style={{ color: GOLD, textDecoration: 'none' }}>{s.email}</a></td>
                    <td style={{ whiteSpace: 'nowrap' }}>{s.phone || '—'}</td>
                    <td>{s.age || '—'}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>{CLASS_LABELS[s.class_type] || s.class_type}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>{SKILL_LABELS[s.skill_level || ''] || s.skill_level || '—'}</td>
                    <td style={{ maxWidth: 180, color: '#666', fontSize: '0.82rem' }}>{s.message || '—'}</td>
                    <td style={{ whiteSpace: 'nowrap', color: '#555', fontSize: '0.78rem' }}>{fmt(s.created_at)}</td>
                    <td className="sticky-col">
                      <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                        <button className="icon-btn" style={iconBtn(s.confirmed ? GREEN : '#555')} onClick={() => toggleConfirm(s)}>
                          {s.confirmed ? '✅ Confirmed' : '○ Confirm'}
                        </button>
                        <a href={`mailto:${s.email}?subject=Your Hart Boys Class Signup&body=Hey ${s.name.split(' ')[0]},%0A%0AThanks for signing up!`} style={{ ...iconBtn('#888'), textDecoration: 'none', display: 'inline-block' }}>✉</a>
                        <button className="icon-btn" style={{ ...iconBtn(RED), padding: '0.3rem 0.75rem' }} onClick={() => setConfirmingDelete(`signup:${s.id}`)}>🗑 Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        ) : tab === 'wall' ? (
          filteredWall.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#444' }}>No entries yet.</div>
          ) : (
            <table className="admin-table">
              <thead><tr>
                <th></th><th>AVATAR</th><th>NAME</th><th>CITY</th><th>NOTE</th><th>DATE</th>
                <th className="sticky-col">ACTIONS</th>
              </tr></thead>
              <tbody>
                {filteredWall.map(w => (
                  <tr key={w.id}>
                    <td>{isNew(w.created_at, lastVisit.current) && <span style={{ background: RED, color: '#fff', borderRadius: 8, fontSize: '0.6rem', fontWeight: 800, padding: '0.1rem 0.4rem' }}>NEW</span>}</td>
                    <td style={{ fontSize: '1.4rem' }}>{w.avatar}</td>
                    <td style={{ color: '#fff', fontWeight: 600, whiteSpace: 'nowrap' }}>{w.name}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>📍 {w.city}</td>
                    <td style={{ maxWidth: 280, color: '#666', lineHeight: 1.5, fontSize: '0.82rem' }}>"{w.note}"</td>
                    <td style={{ whiteSpace: 'nowrap', color: '#555', fontSize: '0.78rem' }}>{fmt(w.created_at)}</td>
                    <td className="sticky-col">
                      <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                        <button className="icon-btn" style={iconBtn(w.approved ? GREEN : '#e09a52')} onClick={() => toggleApprove(w)}>
                          {w.approved ? '✅ Live' : '⏳ Approve'}
                        </button>
                        <button className="icon-btn" style={{ ...iconBtn(RED), padding: '0.3rem 0.75rem' }} onClick={() => setConfirmingDelete(`wall:${w.id}`)}>
                          🗑 Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        ) : (
          filteredWaivers.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#444' }}>No signed waivers yet.</div>
          ) : (
            <table className="admin-table">
              <thead><tr>
                <th></th><th>NAME</th><th>EMAIL</th><th>SIGNATURE</th><th>DATE</th>
                <th className="sticky-col">ACTIONS</th>
              </tr></thead>
              <tbody>
                {filteredWaivers.map(wv => (
                  <tr key={wv.id}>
                    <td>{isNew(wv.created_at, lastVisit.current) && <span style={{ background: RED, color: '#fff', borderRadius: 8, fontSize: '0.6rem', fontWeight: 800, padding: '0.1rem 0.4rem' }}>NEW</span>}</td>
                    <td style={{ color: '#fff', fontWeight: 600, whiteSpace: 'nowrap' }}>{wv.name}</td>
                    <td><a href={`mailto:${wv.email}`} style={{ color: GOLD, textDecoration: 'none' }}>{wv.email}</a></td>
                    <td>
                      <img src={wv.signature_data} alt="signature" style={{ height: 40, border: '1px solid #2a2a2a', borderRadius: 4, background: '#111', display: 'block' }} />
                    </td>
                    <td style={{ whiteSpace: 'nowrap', color: '#555', fontSize: '0.78rem' }}>{fmt(wv.created_at)}</td>
                    <td className="sticky-col">
                      <button className="icon-btn" style={{ ...iconBtn(RED), padding: '0.3rem 0.75rem' }} onClick={() => setConfirmingDelete(`waiver:${wv.id}`)}>🗑 Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        )}
      </div>

      {/* ── Mobile cards ── */}
      {!loading && (
        <div className="mobile-cards">
          {tab === 'signups' ? (
            filteredSignups.length === 0 ? (
              <p style={{ color: '#444', textAlign: 'center', padding: '2rem 0' }}>No signups yet.</p>
            ) : filteredSignups.map(s => (
              <div key={s.id} className="mobile-card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div>
                    <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem' }}>{s.name}</span>
                    {isNew(s.created_at, lastVisit.current) && <span style={{ background: RED, color: '#fff', borderRadius: 8, fontSize: '0.6rem', fontWeight: 800, padding: '0.1rem 0.4rem', marginLeft: '0.5rem' }}>NEW</span>}
                  </div>
                  <span style={{ color: '#555', fontSize: '0.72rem' }}>{fmt(s.created_at)}</span>
                </div>
                <div className="mobile-card-label">EMAIL</div>
                <a href={`mailto:${s.email}`} style={{ color: GOLD, fontSize: '0.88rem', textDecoration: 'none' }}>{s.email}</a>
                {s.phone && <><div className="mobile-card-label" style={{ marginTop: '0.5rem' }}>PHONE</div><div style={{ color: '#aaa', fontSize: '0.88rem' }}>{s.phone}</div></>}
                <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem' }}>
                  {s.age && <div><div className="mobile-card-label">AGE</div><div style={{ color: '#aaa', fontSize: '0.88rem' }}>{s.age}</div></div>}
                  <div><div className="mobile-card-label">CLASS</div><div style={{ color: '#aaa', fontSize: '0.88rem' }}>{CLASS_LABELS[s.class_type] || s.class_type}</div></div>
                  <div><div className="mobile-card-label">SKILL</div><div style={{ color: '#aaa', fontSize: '0.88rem' }}>{SKILL_LABELS[s.skill_level || ''] || '—'}</div></div>
                </div>
                {s.message && <><div className="mobile-card-label" style={{ marginTop: '0.5rem' }}>NOTES</div><div style={{ color: '#666', fontSize: '0.85rem' }}>{s.message}</div></>}
                <div className="mobile-card-actions">
                  <button className="icon-btn" style={{ ...iconBtn(s.confirmed ? GREEN : '#555'), padding: '0.5rem 0.9rem', fontSize: '0.85rem' }} onClick={() => toggleConfirm(s)}>
                    {s.confirmed ? '✅ Confirmed' : '○ Confirm'}
                  </button>
                  <a href={`mailto:${s.email}?subject=Your Hart Boys Class Signup&body=Hey ${s.name.split(' ')[0]},%0A%0AThanks for signing up!`}
                    style={{ ...iconBtn('#888'), textDecoration: 'none', display: 'inline-block', padding: '0.5rem 0.9rem', fontSize: '0.85rem' }}>✉ Reply</a>
                  <button className="icon-btn" style={{ ...iconBtn(RED), padding: '0.5rem 0.9rem', fontSize: '0.85rem' }} onClick={() => setConfirmingDelete(`signup:${s.id}`)}>🗑 Delete</button>
                </div>
              </div>
            ))
          ) : tab === 'wall' ? (
            filteredWall.length === 0 ? (
              <p style={{ color: '#444', textAlign: 'center', padding: '2rem 0' }}>No entries yet.</p>
            ) : filteredWall.map(w => (
              <div key={w.id} className="mobile-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '1.8rem' }}>{w.avatar}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ color: '#fff', fontWeight: 700 }}>{w.name}</span>
                      {isNew(w.created_at, lastVisit.current) && <span style={{ background: RED, color: '#fff', borderRadius: 8, fontSize: '0.6rem', fontWeight: 800, padding: '0.1rem 0.4rem' }}>NEW</span>}
                    </div>
                    <div style={{ color: '#555', fontSize: '0.78rem' }}>📍 {w.city}</div>
                  </div>
                  <span style={{ color: '#555', fontSize: '0.72rem' }}>{fmt(w.created_at)}</span>
                </div>
                <p style={{ color: '#666', fontSize: '0.88rem', lineHeight: 1.55, margin: '0 0 0.85rem' }}>"{w.note}"</p>
                <div className="mobile-card-actions">
                  <button className="icon-btn" style={{ ...iconBtn(w.approved ? GREEN : '#e09a52'), padding: '0.5rem 0.9rem', fontSize: '0.85rem' }} onClick={() => toggleApprove(w)}>
                    {w.approved ? '✅ Live' : '⏳ Approve'}
                  </button>
                  <button className="icon-btn" style={{ ...iconBtn(RED), padding: '0.5rem 0.9rem', fontSize: '0.85rem' }} onClick={() => setConfirmingDelete(`wall:${w.id}`)}>🗑 Delete</button>
                </div>
              </div>
            ))
          ) : (
            filteredWaivers.length === 0 ? (
              <p style={{ color: '#444', textAlign: 'center', padding: '2rem 0' }}>No signed waivers yet.</p>
            ) : filteredWaivers.map(wv => (
              <div key={wv.id} className="mobile-card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div>
                    <span style={{ color: '#fff', fontWeight: 700 }}>{wv.name}</span>
                    {isNew(wv.created_at, lastVisit.current) && <span style={{ background: RED, color: '#fff', borderRadius: 8, fontSize: '0.6rem', fontWeight: 800, padding: '0.1rem 0.4rem', marginLeft: '0.5rem' }}>NEW</span>}
                  </div>
                  <span style={{ color: '#555', fontSize: '0.72rem' }}>{fmt(wv.created_at)}</span>
                </div>
                <div className="mobile-card-label">EMAIL</div>
                <a href={`mailto:${wv.email}`} style={{ color: GOLD, fontSize: '0.88rem', textDecoration: 'none' }}>{wv.email}</a>
                <div className="mobile-card-label" style={{ marginTop: '0.75rem' }}>SIGNATURE</div>
                <img src={wv.signature_data} alt="signature" style={{ height: 48, border: '1px solid #2a2a2a', borderRadius: 6, background: '#111', marginTop: '0.3rem', display: 'block' }} />
                <div className="mobile-card-actions">
                  <button className="icon-btn" style={{ ...iconBtn(RED), padding: '0.5rem 0.9rem', fontSize: '0.85rem' }} onClick={() => setConfirmingDelete(`waiver:${wv.id}`)}>🗑 Delete</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
