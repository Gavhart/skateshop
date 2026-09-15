import { Link } from 'react-router-dom'
import PolicyPage from '../components/PolicyPage'
import {
  RETURN_WINDOW_DAYS,
  SHOP_ADDRESS,
  SHOP_INSTAGRAM_HANDLE,
  SHOP_INSTAGRAM_URL,
  shopInfo,
} from '../lib/shopInfo'

function Returns() {
  return (
    <PolicyPage
      title="RETURNS"
      subtitle="Unused gear. Fair window. No games."
      description={`${shopInfo.returnWindowDays}-day returns for ${shopInfo.name} in ${shopInfo.city}, ${shopInfo.state}.`}
      path="/returns"
      lead="We're a small skate shop, not a giant return mill. If something didn't work out and it's still fresh, we'll take care of you."
    >
      <section className="policy-section">
        <h2>The window</h2>
        <p>
          You have <strong>{RETURN_WINDOW_DAYS} days</strong> from the day you receive an
          online order (or from the day of an in-store purchase) to start a return. After
          that, we can't take it back.
        </p>
      </section>

      <section className="policy-section">
        <h2>What we'll take back</h2>
        <p>Gear needs to be unused, unworn, and in sellable shape:</p>
        <ul>
          <li>Tags still on, original packaging when it came with some.</li>
          <li>No dirt, grip wear, wax, or "I just tried it once" marks.</li>
          <li>Shoes unworn, laces original, box intact.</li>
          <li>Apparel unwashed and unworn.</li>
        </ul>
      </section>

      <section className="policy-section">
        <h2>Boards &amp; decks</h2>
        <p>
          Completes, decks, and assembled builds are <strong>not returnable</strong> once
          they've been skated, gripped (if we didn't ship it that way), or mounted. A board
          that's been stood on in a parking lot isn't new anymore — we can't put it back
          on the wall.
        </p>
        <p>
          If a board arrives damaged in shipping, that's different: send photos and we'll
          make it right. Factory defects — same deal. Hit us up and we'll sort it.
        </p>
      </section>

      <section className="policy-section">
        <h2>How to start a return</h2>
        <p>
          Message us on Instagram{' '}
          <a href={SHOP_INSTAGRAM_URL} target="_blank" rel="noreferrer">
            {SHOP_INSTAGRAM_HANDLE}
          </a>{' '}
          or bring the item into the shop at {SHOP_ADDRESS.mall}, {SHOP_ADDRESS.suite}.
          Include your order number if you have it. We'll tell you whether to ship it back
          or drop it off.
        </p>
        <p>
          Unless we shipped you the wrong thing or it arrived damaged, return shipping is
          on you. Refunds go back to the original payment method after we inspect the
          item. Store credit is an option if you'd rather keep it in the family.
        </p>
      </section>

      <section className="policy-section">
        <h2>What we can't take</h2>
        <ul>
          <li>Used or skated hardgoods (decks, completes, trucks, wheels that have been ridden).</li>
          <li>Opened griptape, lube, wax, or other consumables.</li>
          <li>Safety gear that's been worn (helmets, pads) — once it's on a body, it's done.</li>
          <li>Sale / final-sale items marked as such at checkout or on the receipt.</li>
        </ul>
      </section>

      <section className="policy-section">
        <h2>Still stuck?</h2>
        <p>
          <Link to="/contact">Contact</Link> the shop or swing by. We're skaters — we'd
          rather get you on the right setup than fight over a return.
        </p>
      </section>

      <p className="policy-note">
        Friendly shop policy, not legal advice. If Alaska or federal consumer rules give
        you additional rights, those still apply.
      </p>
    </PolicyPage>
  )
}

export default Returns
