import { Link } from 'react-router-dom'
import Seo from '../components/Seo'
import { shopInfo } from '../lib/shopInfo'

export default function NotFound() {
  return (
    <div className="page" style={{ textAlign: 'center', padding: '6rem 1.5rem', maxWidth: 560, margin: '0 auto' }}>
      <Seo
        title={`Page not found | ${shopInfo.name}`}
        description="That page isn’t on the Hart Boys Skate Shop site."
        path="/404"
      />
      <p style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🛹</p>
      <h1 className="glitch" data-text="404" style={{ color: 'var(--accent)', marginBottom: '0.75rem' }}>404</h1>
      <p style={{ color: 'var(--muted)', marginBottom: '1.75rem' }}>
        This page doesn’t exist. The shop, classes, and the rest of the site are still here.
      </p>
      <Link to="/" className="btn btn-primary">BACK HOME</Link>
    </div>
  )
}
