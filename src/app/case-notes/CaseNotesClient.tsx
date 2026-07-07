'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface CaseNote {
  id: number;
  title: string;
  source_url: string;
  fetch_date: string;
  published_at: string;
  last_edited_at?: string;
  citation_tribunal: string;
  facts: string;
  legal_issues: string;
  reasoning: string;
  critical_analysis: string;
  significance: string;
  editors_commentary?: string;
  tags?: string[];
}

interface CaseNotesClientProps {
  caseNotes: CaseNote[];
  uniqueTags: string[];
  activeId?: number;
  activeTag?: string;
}

export default function CaseNotesClient({
  caseNotes,
  uniqueTags,
  activeId,
  activeTag,
}: CaseNotesClientProps) {
  const router = useRouter();
  const [expandedIds, setExpandedIds] = useState<Record<number, boolean>>({});

  // Expand target ID on load
  useEffect(() => {
    if (activeId !== undefined) {
      setExpandedIds((prev) => ({
        ...prev,
        [activeId]: true,
      }));
      // Scroll to element
      setTimeout(() => {
        const el = document.getElementById(`case-note-${activeId}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }, [activeId]);

  const toggleExpand = (id: number) => {
    setExpandedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleTagClick = (tag?: string) => {
    if (tag) {
      router.push(`/case-notes?tag=${encodeURIComponent(tag)}`);
    } else {
      router.push('/case-notes');
    }
  };

  return (
    <div>
      {/* Tag Filter Bar */}
      <div style={{ marginBottom: '2rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--color-text-muted)' }}>
          Filter by:
        </span>
        <button
          onClick={() => handleTagClick(undefined)}
          className={`btn ${!activeTag ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem', borderRadius: 'var(--radius-sm)' }}
        >
          All Topics
        </button>
        {uniqueTags.map((tag) => (
          <button
            key={tag}
            onClick={() => handleTagClick(tag)}
            className={`btn ${activeTag === tag ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem', borderRadius: 'var(--radius-sm)' }}
          >
            #{tag}
          </button>
        ))}
      </div>

      {caseNotes.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: 'var(--color-text-muted)' }}>
            No case notes found {activeTag ? `matching #${activeTag}` : ''}.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {caseNotes.map((note) => {
            const isExpanded = !!expandedIds[note.id];
            const fetchDateFormatted = new Date(note.fetch_date).toLocaleDateString();
            const publishDateFormatted = new Date(note.published_at).toLocaleDateString('en-US', {
              dateStyle: 'medium',
            });

            return (
              <article
                key={note.id}
                id={`case-note-${note.id}`}
                className="card"
                style={{
                  padding: '0',
                  overflow: 'hidden',
                  borderLeft: isExpanded ? '4px solid var(--color-secondary)' : '1px solid var(--color-border)',
                }}
              >
                {/* Header toggle */}
                <div
                  onClick={() => toggleExpand(note.id)}
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
                  <div style={{ flexGrow: 1, paddingRight: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.3rem', margin: '0 0 0.25rem 0' }}>{note.title}</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 'bold' }}>
                        {note.citation_tribunal}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                        &bull; Published: {publishDateFormatted}
                      </span>
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

                {/* Expandable Content */}
                {isExpanded && (
                  <div style={{ padding: '2rem 1.75rem', borderTop: '1px solid var(--color-border)' }}>
                    {note.last_edited_at && (
                      <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontStyle: 'italic', marginBottom: '1rem', textAlign: 'right' }}>
                        Last edited: {new Date(note.last_edited_at).toLocaleDateString()}
                      </p>
                    )}

                    {/* Editor's Commentary */}
                    {note.editors_commentary && (
                      <div
                        className="editors-insight-box"
                        style={{
                          margin: '0 0 2rem 0',
                          backgroundColor: 'hsl(36, 40%, 97%)',
                          borderLeft: '4px solid var(--color-secondary)',
                        }}
                      >
                        <h3 style={{ color: 'var(--color-secondary)' }}>Editor&apos;s Commentary</h3>
                        <p>{note.editors_commentary}</p>
                        <div className="editors-insight-byline">Original Content &bull; Ananyaa Joshi</div>
                      </div>
                    )}

                    {/* Six Structured Sections */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                      <div>
                        <h4 style={{ fontSize: '1rem', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--color-secondary)', marginBottom: '0.25rem' }}>
                          Citation and Tribunal
                        </h4>
                        <p style={{ fontSize: '0.95rem' }}>{note.citation_tribunal}</p>
                      </div>

                      <div>
                        <h4 style={{ fontSize: '1rem', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--color-secondary)', marginBottom: '0.25rem' }}>
                          Facts
                        </h4>
                        <p style={{ fontSize: '0.95rem' }}>{note.facts}</p>
                      </div>

                      <div>
                        <h4 style={{ fontSize: '1rem', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--color-secondary)', marginBottom: '0.25rem' }}>
                          Legal Issues
                        </h4>
                        <p style={{ fontSize: '0.95rem' }}>{note.legal_issues}</p>
                      </div>

                      <div>
                        <h4 style={{ fontSize: '1rem', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--color-secondary)', marginBottom: '0.25rem' }}>
                          Tribunal&apos;s Reasoning
                        </h4>
                        <p style={{ fontSize: '0.95rem' }}>{note.reasoning}</p>
                      </div>

                      <div>
                        <h4 style={{ fontSize: '1rem', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--color-secondary)', marginBottom: '0.25rem' }}>
                          Critical Analysis
                        </h4>
                        <p style={{ fontSize: '0.95rem' }}>{note.critical_analysis}</p>
                      </div>

                      <div>
                        <h4 style={{ fontSize: '1rem', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--color-secondary)', marginBottom: '0.25rem' }}>
                          Significance
                        </h4>
                        <p style={{ fontSize: '0.95rem' }}>{note.significance}</p>
                      </div>
                    </div>

                    {/* Metadata Footer */}
                    <div
                      style={{
                        marginTop: '2rem',
                        borderTop: '1px solid var(--color-border)',
                        paddingTop: '1.25rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem',
                      }}
                    >
                      {note.tags && note.tags.length > 0 && (
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          {note.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              style={{
                                backgroundColor: 'var(--color-background)',
                                color: 'var(--color-text-main)',
                                border: '1px solid var(--color-border)',
                                padding: '0.2rem 0.5rem',
                                borderRadius: 'var(--radius-sm)',
                                fontSize: '0.75rem',
                              }}
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                        Source URL:{' '}
                        <a
                          href={note.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ textDecoration: 'underline' }}
                        >
                          {note.source_url}
                        </a>{' '}
                        &bull; Fetch Date: {fetchDateFormatted}
                      </div>

                      <div
                        style={{
                          fontSize: '0.75rem',
                          color: 'var(--color-text-muted)',
                          backgroundColor: 'var(--color-background)',
                          padding: '0.75rem 1rem',
                          borderRadius: 'var(--radius-sm)',
                          borderLeft: '2px solid var(--color-secondary)',
                          lineHeight: '1.4',
                          marginTop: '0.5rem',
                        }}
                      >
                        Generated from source material at{' '}
                        <a href={note.source_url} target="_blank" rel="noopener noreferrer">
                          {note.source_url}
                        </a>
                        . Verify all citations against the original award or decision.
                      </div>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
