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
    >
      <h2>Local pickup</h2>
      <p>
        You can pick up online orders at the shop: {shopInfo.mall}, {shopInfo.suite}, {shopInfo.street},{' '}
        {shopInfo.city}, {shopInfo.state} {shopInfo.zip}.
      </p>
      <p>
        If Shopify checkout offers a local pickup option, choose that. We are not inventing a fake pickup
        button on this site — pickup is set up in Shopify when it’s available. If you don’t see pickup at
        checkout, put a note on the order, DM{' '}
        <a href={shopInfo.instagramUrl} target="_blank" rel="noreferrer">{shopInfo.instagramHandle}</a>,
        or come in and we’ll sort it.
      </p>

      <h2>Shipping</h2>
      <p>
        Shipping is calculated at checkout based on your address and the package. We do not publish fake
        flat rates here. Orders {formatUsd(shopInfo.freeShippingThreshold)} and up ship free.
      </p>
      <p>
        Everything leaves from Soldotna. Alaska to the Lower 48 (and the other way around) takes extra
        transit time compared with a warehouse in the contiguous states. Tracking comes from the carrier
        Shopify uses for that shipment.
      </p>

      <h2>Returns &amp; exchanges</h2>
      <p>
        Message us before you ship something back. In-store exchanges are often the easiest if you’re on
        the Peninsula. Email <a href={`mailto:${shopInfo.email}`}>{shopInfo.email}</a> or Instagram{' '}
        {shopInfo.instagramHandle} with your order details. See also our <Link to="/terms">Terms</Link>.
      </p>

      <h2>Questions</h2>
      <p>
        <Link to="/about">Hours and the shop address</Link> ·{' '}
        <a href={shopInfo.instagramUrl} target="_blank" rel="noreferrer">Instagram</a> ·{' '}
        <a href={`mailto:${shopInfo.email}`}>{shopInfo.email}</a>
      </p>
    </PolicyPage>
  )
}
