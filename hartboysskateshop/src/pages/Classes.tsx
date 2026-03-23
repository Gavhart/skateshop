import { useState } from 'react'
import { Link } from 'react-router-dom'

const FORMSPREE_ID = 'https://formspree.io/f/xaqpkrno'

function Classes() {
  const [submitted, setSubmitted] = useState(false)
  const [hovered, setHovered] = useState<number | null>(null)
  const [skill, setSkill] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.currentTarget as HTMLFormElement
    const formData = new FormData(form)
    
    await fetch(FORMSPREE_ID, {
      method: 'POST',
      body: formData,
      headers: { 'Accept': 'application/json' }
    })
    
    setSubmitted(true)
    form.reset()
    setSkill('')
  }

  const cardStyle = (index: number) => ({
    background: '#1a1a1a',
    border: `2px solid ${hovered === index ? '#c9a961' : '#444'}`,
    borderRadius: '12px',
    padding: '2rem',
    transition: 'all 0.3s',
    boxShadow: hovered === index ? '0 0 30px rgba(201,169,97,0.3)' : 'none',
    transform: hovered === index ? 'translateY(-5px)' : 'translateY(0)',
    cursor: 'pointer'
  })

  const skillOptionStyle = (isSelected: boolean) => ({
    background: isSelected ? '#c9a961' : '#0a0a0a',
    border: `1px solid ${isSelected ? '#c9a961' : '#333'}`,
    padding: '1rem',
    borderRadius: '6px',
    textAlign: 'center' as const,
    cursor: 'pointer'
  })

  return (
    <div className="page classes-page">
      {/* HEADER - matches other pages */}
      <div className="page-header">
        <h1 className="glitch" data-text="CLASSES">CLASSES</h1>
        <p>Local skaters teaching locals</p>
      </div>

      {/* Class Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
        gap: '1.5rem',
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '2rem'
      }}>
        {/* Free Beginner */}
        <div 
          style={cardStyle(0)}
          onMouseEnter={() => setHovered(0)}
          onMouseLeave={() => setHovered(null)}
        >
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🛹</div>
          <h3 style={{ color: '#c9a961', fontSize: '1.5rem', marginBottom: '0.5rem' }}>BEGINNER BASICS</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#c9a961' }}>FREE</p>
          <ul style={{ listStyle: 'none', padding: 0, color: '#888', fontSize: '0.9rem', lineHeight: '2' }}>
            <li>✓ Board setup & safety</li>
            <li>✓ Proper stance & pushing</li>
            <li>✓ Turning and stopping</li>
            <li>✓ How to fall safely</li>
          </ul>
          <p style={{ color: '#666', fontSize: '0.8rem', marginTop: '1.5rem' }}>📅 Soon to be determined • 👤 6 max</p>
        </div>

        {/* Street */}
        <div 
          style={cardStyle(1)}
          onMouseEnter={() => setHovered(1)}
          onMouseLeave={() => setHovered(null)}
        >
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔥</div>
          <h3 style={{ color: '#c9a961', fontSize: '1.5rem', marginBottom: '0.5rem' }}>STREET TECHNIQUES</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>$25</p>
          <ul style={{ listStyle: 'none', padding: 0, color: '#888', fontSize: '0.9rem', lineHeight: '2' }}>
            <li>✓ Ollies & kickflips</li>
            <li>✓ Basic rail grinds</li>
            <li>✓ Stair & gap basics</li>
            <li>✓ Park etiquette</li>
          </ul>
          <p style={{ color: '#666', fontSize: '0.8rem', marginTop: '1.5rem' }}>📅 By appointment • 👤 4 max</p>
        </div>

        {/* Group */}
        <div 
          style={cardStyle(2)}
          onMouseEnter={() => setHovered(2)}
          onMouseLeave={() => setHovered(null)}
        >
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>👥</div>
          <h3 style={{ color: '#c9a961', fontSize: '1.5rem', marginBottom: '0.5rem' }}>SMALL GROUP</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>$15<span style={{ fontSize: '1rem', fontWeight: 'normal' }}>/person</span></p>
          <ul style={{ listStyle: 'none', padding: 0, color: '#888', fontSize: '0.9rem', lineHeight: '2' }}>
            <li>✓ 2-3 friends together</li>
            <li>✓ Custom for your group</li>
            <li>✓ More individual time</li>
            <li>✓ Flexible scheduling</li>
          </ul>
          <p style={{ color: '#666', fontSize: '0.8rem', marginTop: '1.5rem' }}>📅 By appointment • 👤 2-3 people</p>
        </div>
      </div>

      {/* Signup Form */}
      <div style={{ background: '#1a1a1a', padding: '2.5rem', borderRadius: '12px', maxWidth: '600px', margin: '0 auto 4rem' }}>
        {submitted ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>🤘</p>
            <h3 style={{ color: '#c9a961', fontSize: '2rem', marginBottom: '1rem' }}>You're booked!</h3>
            <p style={{ color: '#888', marginBottom: '2rem' }}>Check your email. Bring your signed <Link to="/waiver" style={{ color: '#c9a961' }}>waiver</Link>!</p>
            <button 
              onClick={() => setSubmitted(false)}
              style={{ padding: '1rem 2rem', background: 'transparent', border: '1px solid #c9a961', color: '#c9a961', cursor: 'pointer', borderRadius: '6px' }}
            >
              Sign up another person
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <h3 style={{ textAlign: 'center', marginBottom: '2.5rem', color: '#c9a961', fontSize: '1.8rem' }}>Sign Up</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', color: '#666', fontSize: '0.75rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Full Name *</label>
                <input name="name" required style={{ width: '100%', padding: '1rem', background: '#0a0a0a', border: '1px solid #333', color: 'white', borderRadius: '6px', fontSize: '1rem' }} />
              </div>
              <div>
                <label style={{ display: 'block', color: '#666', fontSize: '0.75rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Email *</label>
                <input name="email" type="email" required style={{ width: '100%', padding: '1rem', background: '#0a0a0a', border: '1px solid #333', color: 'white', borderRadius: '6px', fontSize: '1rem' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', color: '#666', fontSize: '0.75rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Phone</label>
                <input name="phone" type="tel" placeholder="(907) 555-0123" style={{ width: '100%', padding: '1rem', background: '#0a0a0a', border: '1px solid #333', color: 'white', borderRadius: '6px', fontSize: '1rem' }} />
              </div>
              <div>
                <label style={{ display: 'block', color: '#666', fontSize: '0.75rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Age</label>
                <input name="age" type="number" placeholder="15" min="5" max="99" style={{ width: '100%', padding: '1rem', background: '#0a0a0a', border: '1px solid #333', color: 'white', borderRadius: '6px', fontSize: '1rem' }} />
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', color: '#666', fontSize: '0.75rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Which class? *</label>
              <select name="classType" required style={{ width: '100%', padding: '1rem', background: '#0a0a0a', border: '1px solid #333', color: 'white', borderRadius: '6px', fontSize: '1rem' }}>
                <option value="">Select a class...</option>
                <option value="beginner">🟢 Beginner Basics — FREE (Flexible)</option>
                <option value="street">🟡 Street Techniques — $25 (Flexible)</option>
                <option value="group">🔵 Small Group — $15/person (Flexible)</option>
              </select>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', color: '#666', fontSize: '0.75rem', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Your skill level? *</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                <div 
                  onClick={() => setSkill('never')}
                  style={skillOptionStyle(skill === 'never')}
                >
                  <input type="radio" name="skill" value="never" required checked={skill === 'never'} style={{ display: 'none' }} readOnly />
                  <span style={{ color: skill === 'never' ? '#0a0a0a' : '#888', fontSize: '0.85rem', fontWeight: skill === 'never' ? 'bold' : 'normal' }}>Never skated</span>
                </div>
                <div 
                  onClick={() => setSkill('basic')}
                  style={skillOptionStyle(skill === 'basic')}
                >
                  <input type="radio" name="skill" value="basic" checked={skill === 'basic'} style={{ display: 'none' }} readOnly />
                  <span style={{ color: skill === 'basic' ? '#0a0a0a' : '#888', fontSize: '0.85rem', fontWeight: skill === 'basic' ? 'bold' : 'normal' }}>Can push & roll</span>
                </div>
                <div 
                  onClick={() => setSkill('tricks')}
                  style={skillOptionStyle(skill === 'tricks')}
                >
                  <input type="radio" name="skill" value="tricks" checked={skill === 'tricks'} style={{ display: 'none' }} readOnly />
                  <span style={{ color: skill === 'tricks' ? '#0a0a0a' : '#888', fontSize: '0.85rem', fontWeight: skill === 'tricks' ? 'bold' : 'normal' }}>Learning tricks</span>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', color: '#666', fontSize: '0.75rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Questions / Preferred dates</label>
              <textarea name="notes" placeholder="What dates work for you? Any injuries or concerns?" rows={3} style={{ width: '100%', padding: '1rem', background: '#0a0a0a', border: '1px solid #333', color: 'white', borderRadius: '6px', fontSize: '1rem', resize: 'vertical' }} />
            </div>

            <div style={{ background: 'rgba(201,169,97,0.05)', border: '1px solid rgba(201,169,97,0.3)', padding: '1.5rem', borderRadius: '6px', marginBottom: '1.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer' }}>
                <input type="checkbox" name="waiver" required style={{ width: '18px', height: '18px', marginTop: '0.2rem', accentColor: '#c9a961' }} />
                <span style={{ color: '#888', fontSize: '0.9rem', lineHeight: '1.6' }}>
                  I understand this is taught by a local skater (not a certified pro), and I participate at my own risk. I agree to the <Link to="/waiver" style={{ color: '#c9a961' }}>waiver</Link>.
                </span>
              </label>
            </div>

            <input type="text" name="_gotcha" style={{ display: 'none' }} />

            <button type="submit" style={{ width: '100%', padding: '1.25rem', background: '#c9a961', color: '#0a0a0a', border: 'none', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', borderRadius: '6px' }}>
              BOOK CLASS →
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default Classes