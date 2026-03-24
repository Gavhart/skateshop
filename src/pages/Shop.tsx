import { Link } from 'react-router-dom'

function Shop() {
  return (
    <div className="page shop-page" style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      minHeight: '80vh'
    }}>
      <span style={{ fontSize: '5rem', marginBottom: '2rem' }}>🛹</span>
      <h1 className="glitch" data-text="SHOP" style={{ marginBottom: '1rem' }}>SHOP</h1>
      <p style={{ 
        color: 'var(--muted)', 
        fontSize: '1.25rem', 
        letterSpacing: '0.2em',
        marginBottom: '2rem'
      }}>
        ONLINE STORE COMING SOON
      </p>
      <p style={{ color: 'var(--muted)', marginBottom: '1rem', textAlign: 'center', maxWidth: '400px' }}>
        Visit us at Peninsula Center Mall to shop our full collection in person!
      </p>
      <p style={{ color: 'var(--accent)', marginBottom: '3rem', fontSize: '0.9rem' }}>
        Suite 48C • Soldotna, AK
      </p>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link to="/" className="btn btn-primary">BACK TO HOME</Link>
        <a href="https://instagram.com/hartboysskateshop" target="_blank" rel="noreferrer" className="btn btn-secondary">
          DM TO ORDER
        </a>
      </div>
    </div>
  )
}

export default Shop