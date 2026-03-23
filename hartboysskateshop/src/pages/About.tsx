import { Link } from 'react-router-dom'

function About() {
  return (
    <div className="page about-page">
      <div className="page-header">
        <h1 className="glitch" data-text="ABOUT">ABOUT</h1>
        <p>Alaska's premier skate shop — Now Open</p>
      </div>

      <section className="about-content">
        <div className="about-text">
          <h2>We're Open!</h2>
          <p>
            Hart Boys Skate Shop is now open at the Peninsula Center Mall in Soldotna, Alaska. 
            We've brought the best skateboard brands to the Last Frontier.
          </p>
          <p>
            Whether you're hitting the streets or the skatepark, we've got the gear you need. 
            From decks and trucks to wheels and apparel — we've got you covered.
          </p>
          
          <div className="about-info">
            <div className="info-item">
              <h4>📍 LOCATION</h4>
              <p>Peninsula Center Mall<br />Suite 48C<br />44332 Sterling Highway<br />Soldotna, AK 99669</p>
            </div>
            <div className="info-item">
              <h4>🕐 HOURS</h4>
              <p>Monday - Saturday<br />10:00 AM - 8:00 PM<br />Sunday<br />12:00 PM - 6:00 PM</p>
            </div>
            <div className="info-item">
              <h4>📱 CONTACT</h4>
              <p>Follow us on Instagram<br />@hartboysskateshop<br /><br />Visit us in-store!</p>
            </div>
          </div>
          
          <div className="about-cta">
            <Link to="/shop" className="btn btn-primary">SHOP NOW</Link>
            <Link to="/gallery" className="btn btn-secondary">VIEW GALLERY</Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default About