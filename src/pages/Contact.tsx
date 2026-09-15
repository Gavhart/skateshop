import { Link } from 'react-router-dom'
import PolicyPage from '../components/PolicyPage'
import {
  HOURS,
  SHOP_ADDRESS,
  SHOP_EMAIL,
  SHOP_INSTAGRAM_HANDLE,
  SHOP_INSTAGRAM_URL,
  SHOP_MAPS_URL,
} from '../lib/shopInfo'

function Contact() {
  return (
    <PolicyPage
      title="CONTACT"
      subtitle="Come hang — or slide into the DMs."
      lead="We're a small shop in Soldotna. The fastest way to reach us is Instagram or stopping by Peninsula Center Mall. No bots, no call center — just the crew at the counter."
      wide
    >
      <div className="policy-cards">
        <div className="policy-card">
          <div className="policy-card-header">
            <span>📍</span>
            <h3>FIND US</h3>
          </div>
          <div className="policy-card-body">
            <p>{SHOP_ADDRESS.mall}</p>
            <p>{SHOP_ADDRESS.suite}</p>
            <p>{SHOP_ADDRESS.street}</p>
            <p>{SHOP_ADDRESS.city}</p>
            <a
              className="policy-maps-link"
              href={SHOP_MAPS_URL}
              target="_blank"
              rel="noreferrer"
            >
              📍 Get Directions
            </a>
          </div>
        </div>

        <div className="policy-card">
          <div className="policy-card-header">
            <span>🕐</span>
            <h3>HOURS</h3>
          </div>
          <div className="policy-card-body">
            <div className="policy-hours-block">
              <span className="policy-season winter">Winter</span>
              <p>{HOURS.winter}</p>
              <p>{HOURS.sunday}</p>
            </div>
            <div className="policy-hours-block">
              <span className="policy-season summer">Summer</span>
              <p>{HOURS.summer}</p>
              <p>{HOURS.sunday}</p>
            </div>
          </div>
        </div>

        <div className="policy-card">
          <div className="policy-card-header">
            <span>🤙</span>
            <h3>SAY HELLO</h3>
          </div>
          <div className="policy-card-body">
            <p>
              <a href={SHOP_INSTAGRAM_URL} target="_blank" rel="noreferrer">
                📸 {SHOP_INSTAGRAM_HANDLE}
              </a>
            </p>
            <p>
              <a href={`mailto:${SHOP_EMAIL}`}>{SHOP_EMAIL}</a>
            </p>
            <p>Or just come hang at the shop.</p>
          </div>
        </div>
      </div>

      <div className="policy-cta-row">
        <Link to="/shipping" className="btn btn-secondary">SHIPPING</Link>
        <Link to="/returns" className="btn btn-secondary">RETURNS</Link>
        <Link to="/about" className="btn btn-primary">ABOUT THE SHOP</Link>
      </div>
    </PolicyPage>
  )
}

export default Contact
