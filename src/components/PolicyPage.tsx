import type { ReactNode } from 'react'

const POLICY_STYLES = `
  .policy-page .policy-wrap {
    max-width: 760px;
    margin: 0 auto;
    padding: 0 2rem 5rem;
  }

  .policy-page .policy-lead {
    color: #888;
    font-size: 1.05rem;
    line-height: 1.8;
    margin-bottom: 2.5rem;
    text-align: center;
  }

  .policy-page .policy-section {
    margin-bottom: 2.5rem;
  }

  .policy-page .policy-section h2 {
    font-family: 'Bebas Neue', cursive;
    font-size: 1.75rem;
    letter-spacing: 0.08em;
    color: #c9a961;
    margin: 0 0 0.85rem;
  }

  .policy-page .policy-section p,
  .policy-page .policy-section li {
    color: #ccc;
    line-height: 1.85;
    font-size: 1.05rem;
  }

  .policy-page .policy-section p {
    margin-bottom: 1rem;
  }

  .policy-page .policy-section p:last-child {
    margin-bottom: 0;
  }

  .policy-page .policy-section strong {
    color: #c9a961;
    font-weight: 600;
  }

  .policy-page .policy-section a {
    color: #c9a961;
    text-decoration: none;
    border-bottom: 1px solid rgba(201,169,97,0.4);
  }

  .policy-page .policy-section a:hover {
    border-color: #c9a961;
  }

  .policy-page .policy-section ul {
    padding-left: 1.25rem;
    margin: 0.5rem 0 1rem;
  }

  .policy-page .policy-section li {
    margin-bottom: 0.55rem;
  }

  .policy-note {
    border-left: 3px solid #c9a961;
    padding: 1.15rem 1.4rem;
    margin: 2rem 0 0;
    background: rgba(201,169,97,0.05);
    color: #aaa;
    font-size: 0.92rem;
    line-height: 1.7;
  }

  .policy-cards {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.25rem;
    margin-bottom: 2.5rem;
    text-align: left;
  }

  @media (max-width: 767px) {
    .policy-cards { grid-template-columns: 1fr; }
    .policy-page .policy-wrap { padding: 0 1.25rem 4rem; }
  }

  @media (max-width: 1023px) and (min-width: 768px) {
    .policy-cards { grid-template-columns: 1fr 1fr; }
  }

  .policy-card {
    background: #141414;
    border: 1px solid #2a2a2a;
    border-radius: 12px;
    padding: 1.75rem;
    transition: border-color 0.25s, box-shadow 0.25s;
  }

  .policy-card:hover {
    border-color: rgba(201,169,97,0.4);
    box-shadow: 0 0 20px rgba(201,169,97,0.08);
  }

  .policy-card-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .policy-card-header h3 {
    font-family: 'Bebas Neue', cursive;
    font-size: 1.25rem;
    letter-spacing: 0.1em;
    margin: 0;
    color: #c9a961;
  }

  .policy-card-body p {
    color: #999;
    font-size: 0.95rem;
    margin: 0.35rem 0;
    line-height: 1.5;
  }

  .policy-card-body a {
    color: #c9a961;
    text-decoration: none;
  }

  .policy-card-body a:hover {
    text-decoration: underline;
  }

  .policy-season {
    display: inline-block;
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    padding: 0.2rem 0.6rem;
    border-radius: 4px;
    margin-bottom: 0.5rem;
  }

  .policy-season.winter {
    background: rgba(100,150,255,0.15);
    color: #6496ff;
  }

  .policy-season.summer {
    background: rgba(255,180,50,0.15);
    color: #ffb432;
  }

  .policy-hours-block { margin-bottom: 1rem; }

  .policy-maps-link {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    color: #c9a961;
    text-decoration: none;
    font-size: 0.82rem;
    margin-top: 0.75rem;
    border: 1px solid rgba(201,169,97,0.35);
    padding: 0.4rem 0.9rem;
    border-radius: 20px;
    transition: background 0.2s;
  }

  .policy-maps-link:hover { background: rgba(201,169,97,0.1); }

  .policy-cta-row {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    justify-content: center;
  }
`

interface PolicyPageProps {
  title: string
  subtitle: string
  lead?: string
  children: ReactNode
  wide?: boolean
}

function PolicyPage({ title, subtitle, lead, children, wide }: PolicyPageProps) {
  return (
    <div className="page policy-page">
      <style>{POLICY_STYLES}</style>
      <div className="page-header">
        <h1 className="glitch" data-text={title}>{title}</h1>
        <p>{subtitle}</p>
      </div>
      <div className="policy-wrap" style={wide ? { maxWidth: 1100 } : undefined}>
        {lead && <p className="policy-lead">{lead}</p>}
        {children}
      </div>
    </div>
  )
}

export default PolicyPage
