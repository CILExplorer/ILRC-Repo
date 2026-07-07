'use client';

import { useState } from 'react';

interface Digest {
  id: number;
  issue_number: number;
  status: string;
  published_at: string;
  last_edited_at?: string;
  editors_note?: string;
  editors_insight?: string;
  tags?: string[];
  arb_title: string;
  arb_summary: string;
  arb_source_name: string;
  arb_source_url: string;
  arb_source_date: string;
  treaty_title: string;
  treaty_summary: string;
  treaty_source_name: string;
  treaty_source_url: string;
  treaty_source_date: string;
  inst_title: string;
  inst_summary: string;
  inst_source_name: string;
  inst_source_url: string;
  inst_source_date: string;
}

export default function ArchiveListClient({ digests }: { digests: Digest[] }) {
  const [expandedIds, setExpandedIds] = useState<Record<number, boolean>>({});

  const toggleExpand = (id: number) => {
    setExpandedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  if (digests.length === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
        <p style={{ color: 'var(--color-text-muted)' }}>No published digests found in the archive.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {digests.map((digest) => {
        const isExpanded = !!expandedIds[digest.id];
        const pubDate = new Date(digest.published_at).toLocaleDateString('en-US', {
          dateStyle: 'medium',
        });

        return (
          <article
            key={digest.id}
            className="card"
            style={{
              padding: '0',
              overflow: 'hidden',
              borderLeft: isExpanded ? '4px solid var(--color-secondary)' : '1px solid var(--color-border)',
            }}
          >
            {/* Header toggle */}
            <div
              onClick={() => toggleExpand(digest.id)}
              style={{
                padding: '1.5rem 1.75rem',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: isExpanded ? 'var(--color-surface-hover)' : 'transparent',
                transition: 'background-color var(--transition-fast)',
              }}
            >
              <div>
                <h3 style={{ fontSize: '1.35rem', margin: '0 0 0.25rem 0' }}>
                  Issue #{digest.issue_number}
                </h3>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                    Published: {pubDate}
                  </span>
                  {digest.tags && digest.tags.length > 0 && (
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      {digest.tags.slice(0, 3).map((tag, idx) => (
                        <span
                          key={idx}
                          style={{
                            fontSize: '0.7rem',
                            backgroundColor: 'var(--color-border)',
                            padding: '0.1rem 0.4rem',
                            borderRadius: 'var(--radius-sm)',
                            color: 'var(--color-text-muted)',
                          }}
                        >
                          #{tag}
                        </span>
                      ))}
                      {digest.tags.length > 3 && (
                        <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                          +{digest.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <button
                className="btn btn-text"
                style={{
                  fontSize: '1.25rem',
                  padding: '0.5rem',
                  transform: isExpanded ? 'rotate(180deg)' : 'none',
                  transition: 'transform var(--transition-fast)',
                }}
                aria-label={isExpanded ? 'Collapse' : 'Expand'}
              >
                ▼
              </button>
            </div>

            {/* Expandable Body */}
            {isExpanded && (
              <div style={{ padding: '2rem 1.75rem', borderTop: '1px solid var(--color-border)' }}>
                {digest.last_edited_at && (
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontStyle: 'italic', marginBottom: '1rem', textAlign: 'right' }}>
                    Last edited: {new Date(digest.last_edited_at).toLocaleDateString()}
                  </p>
                )}

                {/* Editor's Note */}
                {digest.editors_note && (
                  <div
                    style={{
                      backgroundColor: 'var(--color-background)',
                      borderLeft: '4px solid var(--color-text-muted)',
                      padding: '1rem 1.25rem',
                      borderRadius: 'var(--radius-sm)',
                      marginBottom: '2rem',
                      fontStyle: 'italic',
                      fontSize: '0.95rem',
                    }}
                  >
                    <strong>Editor&apos;s Note: </strong> &ldquo;{digest.editors_note}&rdquo;
                  </div>
                )}

                {/* Editor's Insight */}
                {digest.editors_insight && (
                  <div className="editors-insight-box" style={{ margin: '0 0 2rem 0' }}>
                    <h3>Editor&apos;s Insight</h3>
                    <p>{digest.editors_insight}</p>
                    <div className="editors-insight-byline">Original Content &bull; Ananyaa Joshi</div>
                  </div>
                )}

                {/* Sections */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  <div className="digest-section" style={{ margin: '0' }}>
                    <h4 className="digest-section-title">Arbitration Development</h4>
                    <h5 style={{ fontFamily: 'var(--font-sans)', fontSize: '1.1rem', margin: '0 0 0.5rem 0', fontWeight: '700' }}>
                      {digest.arb_title}
                    </h5>
                    <p className="digest-section-content" style={{ fontSize: '0.95rem' }}>{digest.arb_summary}</p>
                    <span className="digest-source">
                      Source: <a href={digest.arb_source_url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline' }}>{digest.arb_source_name}</a> &bull; {new Date(digest.arb_source_date).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="digest-section" style={{ margin: '0' }}>
                    <h4 className="digest-section-title">Treaty Update</h4>
                    <h5 style={{ fontFamily: 'var(--font-sans)', fontSize: '1.1rem', margin: '0 0 0.5rem 0', fontWeight: '700' }}>
                      {digest.treaty_title}
                    </h5>
                    <p className="digest-section-content" style={{ fontSize: '0.95rem' }}>{digest.treaty_summary}</p>
                    <span className="digest-source">
                      Source: <a href={digest.treaty_source_url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline' }}>{digest.treaty_source_name}</a> &bull; {new Date(digest.treaty_source_date).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="digest-section" style={{ margin: '0' }}>
                    <h4 className="digest-section-title">Institution Update</h4>
                    <h5 style={{ fontFamily: 'var(--font-sans)', fontSize: '1.1rem', margin: '0 0 0.5rem 0', fontWeight: '700' }}>
                      {digest.inst_title}
                    </h5>
                    <p className="digest-section-content" style={{ fontSize: '0.95rem' }}>{digest.inst_summary}</p>
                    <span className="digest-source">
                      Source: <a href={digest.inst_source_url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline' }}>{digest.inst_source_name}</a> &bull; {new Date(digest.inst_source_date).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {digest.tags && digest.tags.length > 0 && (
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '2rem', borderTop: '1px solid var(--color-border)', paddingTop: '1.25rem' }}>
                    {digest.tags.map((tag, idx) => (
                      <span key={idx} style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-secondary)', border: '1px solid var(--color-border)', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem' }}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                  <a href={`/api/digests/${digest.id}/pdf`} className="btn btn-primary">
                    Download PDF
                  </a>
                  <button onClick={() => toggleExpand(digest.id)} className="btn btn-secondary">
                    Collapse
                  </button>
                </div>
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
