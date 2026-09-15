import type { ReactNode } from 'react'
import Seo from './Seo'
import { shopInfo } from '../lib/shopInfo'

interface PolicyPageProps {
  title: string
  subtitle: string
  description?: string
  path: string
  children: ReactNode
}

export default function PolicyPage({ title, subtitle, description, path, children }: PolicyPageProps) {
  return (
    <div className="page policy-page">
      <Seo
        title={`${title} | ${shopInfo.name}`}
        description={description || `${title} — ${shopInfo.name} in ${shopInfo.city}, ${shopInfo.state}.`}
        path={path}
      />
      <style>{`
        .policy-page .policy-body {
          max-width: 720px;
          margin: 0 auto;
          padding: 0 1.5rem 5rem;
          color: var(--text);
          line-height: 1.75;
        }
        .policy-page .policy-body h2 {
          font-family: 'Bebas Neue', cursive;
          font-size: 1.6rem;
          letter-spacing: 0.06em;
          color: var(--accent);
          margin: 2.25rem 0 0.75rem;
        }
        .policy-page .policy-body p,
        .policy-page .policy-body li {
          color: var(--muted);
          font-size: 0.98rem;
          margin-bottom: 0.9rem;
        }
        .policy-page .policy-body ul {
          padding-left: 1.25rem;
          margin-bottom: 1rem;
        }
        .policy-page .policy-body a {
          color: var(--accent);
        }
        .policy-page .policy-note {
          margin-top: 2.5rem;
          padding: 1rem 1.15rem;
          border: 1px solid #2a2a2a;
          border-radius: 8px;
          background: rgba(201,169,97,0.06);
          color: var(--muted);
          font-size: 0.85rem;
        }
      `}</style>
      <div className="page-header">
        <h1 className="glitch" data-text={title}>{title}</h1>
        <p>{subtitle}</p>
      </div>
      <div className="policy-body">
        {children}
      </div>
    </div>
  )
}
