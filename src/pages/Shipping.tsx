import { Link } from 'react-router-dom'
import PolicyPage from '../components/PolicyPage'
import {
  FREE_SHIPPING_THRESHOLD,
  SHOP_ADDRESS,
  SHOP_INSTAGRAM_HANDLE,
  SHOP_INSTAGRAM_URL,
} from '../lib/shopInfo'

function Shipping() {
  return (
    <PolicyPage
      title="SHIPPING"
      subtitle="From Soldotna to your door."
      lead="We ship from the Kenai Peninsula. Alaska is a long way from most warehouses — that's why we keep the policy simple and the threshold honest."
    >
      <section className="policy-section">
        <h2>Free shipping</h2>
        <p>
          Orders of <strong>${FREE_SHIPPING_THRESHOLD}+</strong> ship free. That's the same
          threshold you'll see in the shop and on Build a Board. Under that, shipping is
          calculated at checkout based on where you're sending it.
        </p>
      </section>

      <section className="policy-section">
        <h2>Where it ships from</h2>
        <p>
          Hart Boys is a brick-and-mortar shop at {SHOP_ADDRESS.mall}, {SHOP_ADDRESS.suite},{' '}
          {SHOP_ADDRESS.cityShort}. Online orders leave from Soldotna, Alaska — not a Lower
          48 warehouse. If you're elsewhere in Alaska, that can actually help. If you're in
          the Lower 48 or Hawaii, build in extra transit time.
        </p>
      </section>

      <section className="policy-section">
        <h2>Timing</h2>
        <p>
          We pack orders as quickly as we can around shop hours. Once a package is in the
          carrier's hands, delivery windows are up to them — weather, ferries, and rural
          routes on the Peninsula can add a few days. Tracking goes out with your Shopify
          confirmation email when a label is created.
        </p>
        <ul>
          <li>In-stock items typically ship within a few business days.</li>
          <li>Custom builds and special orders may take longer — we'll flag that if it applies.</li>
          <li>We don't control holidays, storms, or carrier delays. We'll help if something looks stuck.</li>
        </ul>
      </section>

      <section className="policy-section">
        <h2>Damaged or missing packages</h2>
        <p>
          If a box shows up crushed, or something's missing, take a couple photos and hit
          us on Instagram{' '}
          <a href={SHOP_INSTAGRAM_URL} target="_blank" rel="noreferrer">
            {SHOP_INSTAGRAM_HANDLE}
          </a>{' '}
          or stop by the shop. We'll figure it out.
        </p>
      </section>

      <section className="policy-section">
        <h2>Questions before you order</h2>
        <p>
          Not sure if a deck will ship okay, or want to grab it in person instead?{' '}
          <Link to="/contact">Contact us</Link> or come through {SHOP_ADDRESS.mall}. Pickup
          availability depends on what's on the floor that day.
        </p>
      </section>

      <p className="policy-note">
        This is a shop policy, not legal advice. Carrier rules and checkout totals at
        Shopify checkout are the final word on a given order.
      </p>
    </PolicyPage>
  )
}

export default Shipping
