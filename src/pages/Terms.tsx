import { Link } from 'react-router-dom'
import PolicyPage from '../components/PolicyPage'
import { shopInfo } from '../lib/shopInfo'

export default function Terms() {
  return (
    <PolicyPage
      title="TERMS"
      subtitle="Shop policy for buying online, in the store, and taking classes."
      description={`Terms and shop policies for ${shopInfo.name} in ${shopInfo.city}, ${shopInfo.state}.`}
      path="/terms"
    >
      <p>
        These are Hart Boys Skate Shop house rules — how we sell gear, how pickup and shipping work, and
        how classes run. This is not legal advice and it is not a corporate terms-of-service novel.
        Alaska law applies.
      </p>

      <h2>Buying online</h2>
      <p>
        Prices on the site are in US dollars. Checkout is handled by Shopify. When you place an order you
        agree to pay the total shown at checkout, including tax and whatever shipping Shopify calculates
        for your address. We pack orders from the Soldotna shop. Product photos and descriptions come from
        our catalog; if something looks off, message us before it ships.
      </p>
      <p>
        Stock moves. If an item sells out between your click and our pack, we’ll contact you using the
        info on the order.
      </p>

      <h2>Buying in the shop</h2>
      <p>
        Come see us at {shopInfo.mall}, {shopInfo.suite}, {shopInfo.street}, {shopInfo.city}, {shopInfo.state}{' '}
        {shopInfo.zip}. What’s on the wall is what we have that day. Hours change with the season — check{' '}
        <Link to="/about">About</Link> or Instagram before you drive across town.
      </p>

      <h2>Classes and waivers</h2>
      <p>
        Skate classes require a signed waiver. Minors need a parent or legal guardian. Signing up online
        does not guarantee a spot until we confirm. Follow the waiver and class pages for the current process.
      </p>

      <h2>Shipping, pickup, returns</h2>
      <p>
        Shipping and local pickup details live on our <Link to="/shipping">Shipping &amp; pickup</Link> page.
        Returns and exchanges are covered on <Link to="/returns">Returns</Link>.
        Questions about an order — email{' '}
        <a href={`mailto:${shopInfo.email}`}>{shopInfo.email}</a> or DM{' '}
        <a href={shopInfo.instagramUrl} target="_blank" rel="noreferrer">{shopInfo.instagramHandle}</a>.
      </p>

      <h2>The website</h2>
      <p>
        We try to keep the site accurate. Builds, classes, and product pages can change. Don’t copy our
        photos or branding for your own shop. If a link is broken, tell us.
      </p>

      <div className="policy-note">
        Last updated for the current Hart Boys website. For the real conversation, talk to a person at
        the shop — not a policy page.
      </div>
    </PolicyPage>
  )
}
