import PolicyPage from '../components/PolicyPage'
import { shopInfo } from '../lib/shopInfo'

export default function Privacy() {
  return (
    <PolicyPage
      title="PRIVACY"
      subtitle="How we handle the information you share with a small skate shop."
      description={`Privacy policy for ${shopInfo.name} in ${shopInfo.city}, ${shopInfo.state}.`}
      path="/privacy"
    >
      <p>
        Hart Boys Skate Shop is a small, family-run shop in {shopInfo.city}, {shopInfo.state}.
        This page is written in plain language — not as a giant legal dump.
      </p>

      <h2>What we collect</h2>
      <ul>
        <li>
          <strong>Online orders.</strong> Checkout runs on Shopify. Shopify collects what it needs to take
          payment and ship or hold your order (typically name, email, shipping/billing address, and payment details).
          We see order info in Shopify so we can pack and follow up. We do not store card numbers on this website.
        </li>
        <li>
          <strong>Classes and waivers.</strong> If you sign up for a class or submit a waiver on this site,
          we save the information you enter (name, email, and whatever else is on that form) so we can run classes
          and keep a record of the waiver. That data lives in the same backend we use for class signups and waivers.
        </li>
        <li>
          <strong>Instagram.</strong> If you DM {shopInfo.instagramHandle}, Instagram holds that conversation.
          We use it to answer questions — we are not scraping DMs into a marketing list from this website.
        </li>
        <li>
          <strong>Email.</strong> You can reach us at{' '}
          <a href={`mailto:${shopInfo.email}`}>{shopInfo.email}</a>. We use that inbox to reply to you.
        </li>
      </ul>

      <h2>What we don’t do</h2>
      <p>
        We don’t sell your information. We don’t run a pile of mystery trackers that we can honestly name
        beyond Shopify checkout, our class/waiver forms, and the social apps you already use to talk to us.
        If a browser or host adds standard analytics or security logs, that’s the usual background noise of
        running a website — we are not building a profile to sell.
      </p>

      <h2>How long we keep it</h2>
      <p>
        Orders stay in Shopify as long as we need them for the shop. Class signups and waivers stay on file
        so we know who signed up and who signed the waiver. Message us if you want us to look up or delete
        something we control (class/waiver records or an order we can still edit).
      </p>

      <h2>Kids</h2>
      <p>
        Parents or guardians handle class signups and waivers for minors. Don’t send us information about a
        child that isn’t needed for a class or a purchase.
      </p>

      <h2>Questions</h2>
      <p>
        Email <a href={`mailto:${shopInfo.email}`}>{shopInfo.email}</a> or DM{' '}
        <a href={shopInfo.instagramUrl} target="_blank" rel="noreferrer">{shopInfo.instagramHandle}</a>.
        Stop by {shopInfo.mall}, {shopInfo.suite}, {shopInfo.city}.
      </p>
    </PolicyPage>
  )
}
