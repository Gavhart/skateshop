import { useState } from 'react'
import { Link } from 'react-router-dom'

function Waiver() {
  const [printed, setPrinted] = useState(false)

  const handlePrint = () => {
    window.print()
    setPrinted(true)
  }

  return (
    <div className="page waiver-page">
      <div className="no-print">
        <div className="page-header">
          <h1 className="glitch" data-text="WAIVER">WAIVER</h1>
          <p>Print and bring to class</p>
        </div>

        <div className="waiver-actions">
          <button onClick={handlePrint} className="btn btn-primary">
            🖨️ PRINT WAIVER
          </button>
          <Link to="/classes" className="btn btn-secondary">
            ← BACK TO CLASSES
          </Link>
        </div>

        {printed && (
          <div className="print-confirm">
            <span>✅</span> Print dialog opened. Bring signed copy to class!
          </div>
        )}

        <p className="waiver-instructions">
          <strong>Instructions:</strong> Print this page, sign both sides, 
          and bring to your first class. Parents must sign for minors under 18.
        </p>
      </div>

      <div className="waiver-document">
        <div className="waiver-header">
          <h2>HART BOYS SKATE SHOP</h2>
          <h3>SKATE CLASS PARTICIPATION AGREEMENT</h3>
          <p className="waiver-date">Date: _______________</p>
        </div>

        <div className="waiver-section">
          <h4>PARTICIPANT INFORMATION</h4>
          <div className="waiver-fields">
            <div className="field-row">
              <label>Name:</label>
              <span className="field-line">_____________________________________________</span>
            </div>
            <div className="field-row">
              <label>Phone:</label>
              <span className="field-line">_____________________________________________</span>
            </div>
            <div className="field-row">
              <label>Email:</label>
              <span className="field-line">_____________________________________________</span>
            </div>
            <div className="field-row">
              <label>Class Date:</label>
              <span className="field-line">_____________________________________________</span>
            </div>
          </div>
        </div>

        <div className="waiver-section">
          <h4>ASSUMPTION OF RISK</h4>
          <p>I understand that skateboarding is an extreme sport with inherent risks of serious injury including head trauma, broken bones, paralysis, or death. I am participating entirely at my own risk.</p>
        </div>

        <div className="waiver-section">
          <h4>RELEASE OF LIABILITY</h4>
          <p>In exchange for participation, I agree NOT TO SUE Hart Boys Skate Shop, its owners, instructors, or employees for any injury, damage, or death occurring during class. I release them from all liability.</p>
        </div>

        <div className="waiver-section">
          <h4>MEDICAL CONSENT</h4>
          <p>I am physically able to participate. If injured and unable to consent, Hart Boys may seek emergency medical care. I agree to pay all medical costs.</p>
        </div>

        <div className="waiver-section">
          <h4>RULES AGREEMENT</h4>
          <p>I agree to:</p>
          <ul>
            <li>Wear helmet at all times while on a skateboard</li>
            <li>Follow instructor directions and safety rules</li>
            <li>Stay within designated class areas</li>
            <li>Report any injuries immediately</li>
          </ul>
        </div>

        <div className="waiver-section signature-block">
          <p className="waiver-bind">I have read and understand this agreement. I am 18+ and legally competent to sign, OR I am a parent/guardian signing for a minor.</p>

          <div className="signature-area">
            <div className="signature-line">
              <label>Participant Signature:</label>
              <span className="sig-line">___________________________________</span>
            </div>
            <div className="signature-line">
              <label>Date:</label>
              <span className="sig-line">_________________</span>
            </div>
          </div>

          <div className="parent-signature">
            <h4>FOR MINORS UNDER 18 - PARENT/GUARDIAN MUST COMPLETE:</h4>
            <div className="signature-area">
              <div className="signature-line">
                <label>Parent/Guardian Name:</label>
                <span className="sig-line">___________________________________</span>
              </div>
              <div className="signature-line">
                <label>Parent/Guardian Signature:</label>
                <span className="sig-line">___________________________________</span>
              </div>
              <div className="signature-line">
                <label>Date:</label>
                <span className="sig-line">_________________</span>
              </div>
              <div className="signature-line">
                <label>Emergency Contact Phone:</label>
                <span className="sig-line">___________________________________</span>
              </div>
            </div>
          </div>
        </div>

        <div className="waiver-footer">
          <p>Hart Boys Skate Shop • 44332 Sterling Highway, Suite 48C, Soldotna, AK 99669</p>
          <p>hartboysskateshop@gmail.com • @hartboysskateshop</p>
          <p className="waiver-id">Form ID: HBSS-2025-WVR</p>
        </div>
      </div>
    </div>
  )
}

export default Waiver