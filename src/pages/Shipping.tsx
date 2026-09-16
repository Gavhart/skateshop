import { Link } from 'react-router-dom'
import PolicyPage from '../components/PolicyPage'
import { formatUsd, shopInfo } from '../lib/shopInfo'

export default function Shipping() {
  return (
    <PolicyPage
      title="SHIPPING"
      subtitle="Pickup in Soldotna, or we ship from the Peninsula."
      description={`Shipping and local pickup for ${shopInfo.name} — free shipping at ${formatUsd(shopInfo.freeShippingThreshold)}+.`}
      path="/shipping"
      lead="We ship from the Kenai Peninsula. Alaska is a long way from most warehouses — that's why we keep the policy simple and the threshold honest."
    >
      <h2>Pick up in {shopInfo.city}</h2>
      <p>
        <strong>{shopInfo.mall}, {shopInfo.suite}</strong><br />
        {shopInfo.street}, {shopInfo.city}, {shopInfo.state} {shopInfo.zip}
      </p>
      <p>
        Pickup is the easy option if you’re on the Peninsula. Shipping is also available — and orders of{' '}
        <strong>{formatUsd(shopInfo.freeShippingThreshold)}+</strong> ship free.
      </p>
      <p>
        If Shopify checkout offers a local pickup option, choose that. We are not inventing a fake pickup
        button on this site — pickup is set up in Shopify when it’s available. If you don’t see pickup at
        checkout, put a note on the order (the cart has a field for it), DM{' '}
        <a href={shopInfo.instagramUrl} target="_blank" rel="noreferrer">{shopInfo.instagramHandle}</a>,
        or come in and we’ll sort it.
      </p>

      <h2>Free shipping</h2>
      <p>
        Orders of <strong>{formatUsd(shopInfo.freeShippingThreshold)}+</strong> ship free. That's the same
        threshold you'll see in the shop and on Build a Board. Under that, shipping is calculated at
        checkout based on your address and the package. We do not publish fake flat rates here.
      </p>

      <h2>Where it ships from</h2>
      <p>
        Everything leaves from Soldotna — not a Lower 48 warehouse. Alaska to the Lower 48 (and the other
        way around) takes extra transit time. If you're elsewhere in Alaska, that can actually help.
        Tracking comes from the carrier Shopify uses for that shipment.
      </p>

      <h2>Timing</h2>
      <p>
        We pack orders as quickly as we can around shop hours. Once a package is in the carrier's hands,
        delivery windows are up to them — weather, ferries, and rural routes on the Peninsula can add a
        few days.
      </p>
      <ul>
        <li>In-stock items typically ship within a few business days.</li>
        <li>Custom builds and special orders may take longer — we'll flag that if it applies.</li>
        <li>We don't control holidays, storms, or carrier delays. We'll help if something looks stuck.</li>
      </ul>

      <h2>Damaged or missing packages</h2>
      <p>
        If a box shows up crushed, or something's missing, take a couple photos and hit us on Instagram{' '}
        <a href={shopInfo.instagramUrl} target="_blank" rel="noreferrer">{shopInfo.instagramHandle}</a>{' '}
        or stop by the shop. We'll figure it out.
      </p>

      <h2>Returns &amp; exchanges</h2>
      <p>
        Message us before you ship something back. In-store exchanges are often the easiest if you’re on
        the Peninsula. See our <Link to="/returns">Returns</Link> policy and{' '}
        <Link to="/terms">Terms</Link>, or email{' '}
        <a href={`mailto:${shopInfo.email}`}>{shopInfo.email}</a>.
      </p>

      <h2>Questions</h2>
      <p>
        <Link to="/contact">Contact us</Link> · <Link to="/about">Hours and the shop address</Link> ·{' '}
        <a href={shopInfo.instagramUrl} target="_blank" rel="noreferrer">Instagram</a> ·{' '}
        <a href={`mailto:${shopInfo.email}`}>{shopInfo.email}</a>
      </p>

      <p className="policy-note">
        This is a shop policy, not legal advice. Carrier rules and checkout totals at
        Shopify checkout are the final word on a given order.
      </p>
    </PolicyPage>
  )
}
