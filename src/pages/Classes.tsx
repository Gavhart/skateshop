import { useState } from 'react'
import { Link } from 'react-router-dom'
import { insertClassSignup } from '../lib/supabase'

const FORMSPREE_ID = 'https://formspree.io/f/xaqpkrno'

function Classes() {
  const [submitted, setSubmitted] = useState(false)
  const [hovered, setHovered] = useState<number | null>(null)
  const [skill, setSkill] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const form = e.currentTarget as HTMLFormElement
    const formData = new FormData(form)

    try {
      // Save to Supabase
      await insertClassSignup({
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        phone: formData.get('phone') as string || undefined,
        age: formData.get('age') ? Number(formData.get('age')) : undefined,
        class_type: formData.get('classType') as string,
        skill_level: skill || undefined,
        message: formData.get('notes') as string || undefined,
      })
      // Also send to Formspree for email notification
      fetch(FORMSPREE_ID, { method: 'POST', body: formData, headers: { 'Accept': 'application/json' } })
      setSubmitted(true)
      form.reset()
      setSkill('')
    } catch (err) {
      console.error('Signup error:', err)
      alert(`Something went wrong: ${err instanceof Error ? err.message : 'Please try again.'}`)
    } finally {
      setLoading(false)
    }
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

  return (
    <div className="page classes-page">
      <style>{`
        .classes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
          max-width: 1000px;
          margin: 0 auto;
          padding: 2rem;
        }
        .classes-form-wrap {
          background: #1a1a1a;
          padding: 2.5rem;
          border-radius: 12px;
          max-width: 600px;
          margin: 0 auto 4rem;
        }
        @media (max-width: 600px) {
          .classes-form-wrap {
            padding: 1.5rem;
            margin: 0 1rem 3rem;
          }
        }
        .form-row-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        @media (max-width: 600px) {
          .form-row-2 {
            grid-template-columns: 1fr;
          }
        }
        .form-field {
          margin-bottom: 1.5rem;
        }
        .form-label {
          display: block;
          color: #666;
          font-size: 0.75rem;
          margin-bottom: 0.5rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
        .form-input {
          width: 100%;
          padding: 1rem;
          background: #0a0a0a;
          border: 1px solid #333;
          color: white;
          border-radius: 6px;
          font-size: 1rem;
          box-sizing: border-box;
          transition: border-color 0.2s;
        }
        .form-input:focus {
          outline: none;
          border-color: #c9a961;
        }
        .skill-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.75rem;
        }
        @media (max-width: 480px) {
          .skill-grid {
            grid-template-columns: 1fr;
          }
        }
        .skill-option {
          padding: 1rem;
          border-radius: 6px;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s;
          user-select: none;
          -webkit-tap-highlight-color: transparent;
          min-height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .skill-option:active {
          transform: scale(0.97);
        }
        .skill-option--selected {
          background: #c9a961;
          border: 1px solid #c9a961;
        }
        .skill-option--unselected {
          background: #0a0a0a;
          border: 1px solid #333;
        }
        .skill-option--selected .skill-label {
          color: #0a0a0a;
          font-weight: bold;
        }
        .skill-option--unselected .skill-label {
          color: #888;
          font-weight: normal;
        }
        .waiver-box {
          background: rgba(201,169,97,0.05);
          border: 1px solid rgba(201,169,97,0.3);
          padding: 1.5rem;
          border-radius: 6px;
          margin-bottom: 1.5rem;
        }
        .waiver-label {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          cursor: pointer;
        }
        .waiver-checkbox {
          width: 20px;
          height: 20px;
          min-width: 20px;
          margin-top: 0.1rem;
          accent-color: #c9a961;
          cursor: pointer;
        }
        .submit-btn {
          width: 100%;
          padding: 1.25rem;
          background: #c9a961;
          color: #0a0a0a;
          border: none;
          font-size: 1.1rem;
          font-weight: bold;
          cursor: pointer;
          border-radius: 6px;
          transition: opacity 0.2s, transform 0.1s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }
        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .submit-btn:not(:disabled):hover {
          opacity: 0.9;
        }
        .submit-btn:not(:disabled):active {
          transform: scale(0.99);
        }
        .spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(10,10,10,0.3);
          border-top-color: #0a0a0a;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* HEADER */}
      <div className="page-header">
        <h1 className="glitch" data-text="CLASSES">CLASSES</h1>
        <p>Local skaters teaching locals</p>
      </div>

      {/* Class Cards */}
      <div className="classes-grid">
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
            <li>✓ Board setup &amp; safety</li>
            <li>✓ Proper stance &amp; pushing</li>
            <li>✓ Turning and stopping</li>
            <li>✓ How to fall safely</li>
          </ul>
          <p style={{ color: '#666', fontSize: '0.8rem', marginTop: '1.5rem' }}>📅 Soon to be determined • 👤 6 max</p>
        </div>

      </div>

      {/* Signup Form */}
      <div className="classes-form-wrap">
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

            {/* Name + Email */}
            <div className="form-row-2">
              <div>
                <label className="form-label">Full Name *</label>
                <input name="name" required className="form-input" />
              </div>
              <div>
                <label className="form-label">Email *</label>
                <input name="email" type="email" required className="form-input" />
              </div>
            </div>

            {/* Phone + Age */}
            <div className="form-row-2">
              <div>
                <label className="form-label">Phone</label>
                <input name="phone" type="tel" placeholder="(907) 555-0123" className="form-input" />
              </div>
              <div>
                <label className="form-label">Age</label>
                <input name="age" type="number" placeholder="15" min="5" max="99" className="form-input" />
              </div>
            </div>

            {/* Class type */}
            <div className="form-field">
              <label className="form-label">Which class? *</label>
              <select name="classType" required className="form-input">
                <option value="">Select a class...</option>
                <option value="beginner">🟢 Beginner Basics — FREE (Flexible)</option>
              </select>
            </div>

            {/* Skill level */}
            <div className="form-field">
              <label className="form-label">Your skill level? *</label>
              <div className="skill-grid">
                {[
                  { value: 'never', label: 'Never skated' },
                  { value: 'basic', label: 'Can push & roll' },
                  { value: 'tricks', label: 'Learning tricks' },
                ].map(({ value, label }) => (
                  <div
                    key={value}
                    className={`skill-option ${skill === value ? 'skill-option--selected' : 'skill-option--unselected'}`}
                    onClick={() => setSkill(value)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && setSkill(value)}
                  >
                    <input type="radio" name="skill" value={value} required checked={skill === value} style={{ display: 'none' }} readOnly />
                    <span className="skill-label">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="form-field">
              <label className="form-label">Questions / Preferred dates</label>
              <textarea
                name="notes"
                placeholder="What dates work for you? Any injuries or concerns?"
                rows={3}
                className="form-input"
                style={{ resize: 'vertical' }}
              />
            </div>

            {/* Waiver */}
            <div className="waiver-box">
              <label className="waiver-label">
                <input type="checkbox" name="waiver" required className="waiver-checkbox" />
                <span style={{ color: '#888', fontSize: '0.9rem', lineHeight: '1.6' }}>
                  I understand this is taught by a local skater (not a certified pro), and I participate at my own risk. I agree to the <Link to="/waiver" style={{ color: '#c9a961' }}>waiver</Link>.
                </span>
              </label>
            </div>

            {/* Honeypot */}
            <input type="text" name="_gotcha" style={{ display: 'none' }} />

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? (
                <>
                  <div className="spinner" />
                  Sending...
                </>
              ) : (
                'BOOK CLASS →'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default Classes
