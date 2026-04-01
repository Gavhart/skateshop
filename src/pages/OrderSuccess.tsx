import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useScrollReveal } from '../hooks/useScrollReveal'

export default function OrderSuccess() {
  const [confetti, setConfetti] = useState(false)
  useScrollReveal()

  useEffect(() => {
    // Pop confetti on mount
    setConfetti(true)
    const t = setTimeout(() => setConfetti(false), 2000)
    return () => clearTimeout(t)
  }, [])

  const ICONS = ['🛹', '⭐', '🔥', '🤘', '✦', '⚡']

  return (
    <div className="page" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem' }}>
      <style>{`
        .success-wrap {
          max-width: 560px;
          width: 100%;
          text-align: center;
        }
        .success-icon-ring {
          width: 96px;
          height: 96px;
          border-radius: 50%;
          background: rgba(201,169,97,0.1);
          border: 2px solid rgba(201,169,97,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.75rem;
          margin: 0 auto 2rem;
          animation: ring-pulse 2s ease-in-out infinite;
        }
        @keyframes ring-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(201,169,97,0.3); }
          50% { box-shadow: 0 0 0 16px rgba(201,169,97,0); }
        }
        .success-title {
          font-family: 'Bebas Neue', cursive;
          font-size: clamp(2.5rem, 8vw, 4rem);
          letter-spacing: 0.05em;
          color: #C9A961;
          line-height: 1;
          margin-bottom: 0.5rem;
        }
        .success-sub {
          font-size: 1.1rem;
          color: #888;
          margin-bottom: 2.5rem;
          line-height: 1.7;
        }
        .success-card {
          background: #111;
          border: 1px solid #222;
          border-radius: 12px;
          padding: 1.75rem;
          margin-bottom: 2rem;
          text-align: left;
        }
        .success-card h3 {
          font-family: 'Bebas Neue', cursive;
          font-size: 1.2rem;
          letter-spacing: 0.08em;
          color: #C9A961;
          margin-bottom: 1rem;
        }
        .success-step {
          display: flex;
          align-items: flex-start;
          gap: 0.875rem;
          margin-bottom: 0.875rem;
        }
        .success-step-num {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: rgba(201,169,97,0.12);
          border: 1px solid rgba(201,169,97,0.3);
          color: #C9A961;
          font-size: 0.78rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 0.1rem;
        }
        .success-step p {
          color: #999;
          font-size: 0.9rem;
          line-height: 1.6;
          margin: 0;
        }
        .success-step strong {
          color: #f5f1e8;
        }
        .success-cta-row {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        /* Confetti burst */
        .success-confetti-particle {
          position: fixed;
          font-size: 20px;
          pointer-events: none;
          z-index: 99999;
          animation: success-fly 1.2s ease-out forwards;
        }
        @keyframes success-fly {
          0%   { opacity: 1; transform: translate(0,0) rotate(0deg) scale(1); }
          100% { opacity: 0; transform: var(--fly-to) rotate(var(--spin)) scale(0.3); }
        }
      `}</style>

      {/* Confetti burst */}
      {confetti && ICONS.flatMap((icon, ii) =>
        Array.from({ length: 4 }, (_, jj) => {
          const angle = ((ii * 4 + jj) / (ICONS.length * 4)) * 360
          const dist = 120 + Math.random() * 120
          const rad = (angle * Math.PI) / 180
          const tx = Math.cos(rad) * dist
          const ty = Math.sin(rad) * dist - 80
          return (
            <span
              key={`${ii}-${jj}`}
              className="success-confetti-particle"
              style={{
                left: '50%',
                top: '40%',
                '--fly-to': `translate(calc(-50% + ${tx}px), ${ty}px)`,
                '--spin': `${Math.random() * 720 - 360}deg`,
                animationDelay: `${(ii * 4 + jj) * 0.04}s`,
              } as React.CSSProperties}
            >
              {icon}
            </span>
          )
        })
      )}

      <div className="success-wrap">
        <div className="success-icon-ring reveal reveal-scale">🤘</div>

        <h1 className="success-title reveal">ORDER PLACED!</h1>
        <p className="success-sub reveal">
          You're officially in the Hart Boys crew.<br />
          Check your email for your order confirmation.
        </p>

        <div className="success-card reveal">
          <h3>WHAT HAPPENS NEXT</h3>
          <div className="success-step">
            <div className="success-step-num">1</div>
            <p><strong>Confirmation email</strong> — Shopify sends it automatically with your order details and receipt.</p>
          </div>
          <div className="success-step">
            <div className="success-step-num">2</div>
            <p><strong>We pack your order</strong> — Brandon gets it ready at the shop. We'll reach out if there are any questions.</p>
          </div>
          <div className="success-step">
            <div className="success-step-num">3</div>
            <p><strong>Shipping or pickup</strong> — You'll get a notification when it ships, or swing by Suite 48C to pick it up.</p>
          </div>
          <div className="success-step" style={{ marginBottom: 0 }}>
            <div className="success-step-num">4</div>
            <p><strong>Questions?</strong> — Hit us on Instagram <a href="https://instagram.com/hartboysskateshop" target="_blank" rel="noreferrer" style={{ color: '#C9A961' }}>@hartboysskateshop</a> or stop by the shop.</p>
          </div>
        </div>

        <div className="success-cta-row reveal">
          <Link to="/shop" className="btn btn-primary">KEEP SHOPPING</Link>
          <Link to="/" className="btn btn-secondary">BACK TO HOME</Link>
        </div>
      </div>
    </div>
  )
}
