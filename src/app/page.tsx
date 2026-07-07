import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { query } from '@/lib/db';
import Link from 'next/link';

export const revalidate = 0; // Dynamic server rendering to reflect changes immediately

interface Digest {
  id: number;
  issue_number: number;
  status: string;
  published_at: Date;
  last_edited_at?: Date;
  editors_note?: string;
  editors_insight?: string;
  tags?: string[];
  custom_title?: string;
  arb_title: string;
  arb_summary: string;
  arb_source_name: string;
  arb_source_url: string;
  arb_source_date: Date;
  treaty_title: string;
  treaty_summary: string;
  treaty_source_name: string;
  treaty_source_url: string;
  treaty_source_date: Date;
  inst_title: string;
  inst_summary: string;
  inst_source_name: string;
  inst_source_url: string;
  inst_source_date: Date;
}

interface CaseNote {
  id: number;
  status: string;
  title: string;
  published_at: Date;
  source_url: string;
  citation_tribunal: string;
  facts: string;
  legal_issues: string;
  reasoning: string;
  critical_analysis: string;
  significance: string;
  editors_commentary?: string;
  tags?: string[];
}

export default async function HomePage() {
  let latestDigest: Digest | null = null;
  let recentCaseNotes: CaseNote[] = [];

  try {
    const digestResult = await query(
      "SELECT * FROM digests WHERE status = 'published' ORDER BY issue_number DESC LIMIT 1"
    );
    if (digestResult.rows.length > 0) {
      latestDigest = digestResult.rows[0];
    }

    const notesResult = await query(
      "SELECT * FROM case_notes WHERE status = 'published' ORDER BY published_at DESC LIMIT 3"
    );
    recentCaseNotes = notesResult.rows;
  } catch (error) {
    console.error('Error fetching data for home page:', error);
  }

  return (
    <>
      <Header />
      <main className="container" style={{ padding: '2.5rem 1.5rem' }}>
        {/* Mission Statement Hero Section */}
        <section style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <h1 style={{ fontSize: '3rem', fontFamily: 'var(--font-serif)', color: 'var(--color-primary)', marginBottom: '0.75rem' }}>
            International Law Research Collective
          </h1>
          <p style={{ fontSize: '1.25rem', fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--color-secondary)', maxWidth: '800px', margin: '0 auto' }}>
            &ldquo;Practitioner-oriented international law and arbitration analysis.&rdquo;
          </p>
        </section>

        <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '3rem' }}>
          {/* Left Column: Latest Digest */}
          <section>
            <h2 style={{ fontSize: '1.8rem', borderBottom: '2px solid var(--color-primary)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
              Latest Fortnightly Digest
            </h2>

            {latestDigest ? (
              <article className="digest-article" style={{ margin: '0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.6rem' }}>{latestDigest.custom_title || `Issue #${latestDigest.issue_number}`}</h3>
                  <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                    Published on {new Date(latestDigest.published_at).toLocaleDateString('en-US', { dateStyle: 'long' })}
                    {latestDigest.last_edited_at && ` (Last edited: ${new Date(latestDigest.last_edited_at).toLocaleDateString()})`}
                  </span>
                </div>

                {latestDigest.tags && latestDigest.tags.length > 0 && (
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                    {latestDigest.tags.map((tag, idx) => (
                      <span key={idx} style={{ backgroundColor: 'var(--color-border)', color: 'var(--color-text-main)', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem' }}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Editor's Note */}
                {latestDigest.editors_note && (
                  <div style={{ backgroundColor: 'var(--color-background)', borderLeft: '4px solid var(--color-text-muted)', padding: '1.25rem', borderRadius: 'var(--radius-sm)', marginBottom: '2rem', fontStyle: 'italic' }}>
                    <strong>Editor&apos;s Note: </strong> &ldquo;{latestDigest.editors_note}&rdquo;
                  </div>
                )}

                {/* Editor's Insight */}
                {latestDigest.editors_insight && (
                  <div className="editors-insight-box">
                    <h3>Editor&apos;s Insight</h3>
                    <p>{latestDigest.editors_insight}</p>
                    <div className="editors-insight-byline">Original Content — By Ananyaa Joshi</div>
                  </div>
                )}

                {/* Arbitration Development */}
                <div className="digest-section">
                  <h4 className="digest-section-title">Arbitration Development</h4>
                  <h5 style={{ fontFamily: 'var(--font-sans)', fontSize: '1.1rem', margin: '0 0 0.5rem 0', fontWeight: '700' }}>
                    {latestDigest.arb_title}
                  </h5>
                  <p className="digest-section-content">{latestDigest.arb_summary}</p>
                  <span className="digest-source">
                    Source: <a href={latestDigest.arb_source_url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline' }}>{latestDigest.arb_source_name}</a> &bull; {new Date(latestDigest.arb_source_date).toLocaleDateString()}
                  </span>
                </div>

                {/* Treaty Update */}
                <div className="digest-section">
                  <h4 className="digest-section-title">Treaty Update</h4>
                  <h5 style={{ fontFamily: 'var(--font-sans)', fontSize: '1.1rem', margin: '0 0 0.5rem 0', fontWeight: '700' }}>
                    {latestDigest.treaty_title}
                  </h5>
                  <p className="digest-section-content">{latestDigest.treaty_summary}</p>
                  <span className="digest-source">
                    Source: <a href={latestDigest.treaty_source_url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline' }}>{latestDigest.treaty_source_name}</a> &bull; {new Date(latestDigest.treaty_source_date).toLocaleDateString()}
                  </span>
                </div>

                {/* Institution Update */}
                <div className="digest-section">
                  <h4 className="digest-section-title">Institution Update</h4>
                  <h5 style={{ fontFamily: 'var(--font-sans)', fontSize: '1.1rem', margin: '0 0 0.5rem 0', fontWeight: '700' }}>
                    {latestDigest.inst_title}
                  </h5>
                  <p className="digest-section-content">{latestDigest.inst_summary}</p>
                  <span className="digest-source">
                    Source: <a href={latestDigest.inst_source_url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline' }}>{latestDigest.inst_source_name}</a> &bull; {new Date(latestDigest.inst_source_date).toLocaleDateString()}
                  </span>
                </div>

                <div style={{ marginTop: '2.5rem', display: 'flex', gap: '1rem' }}>
                  <a href={`/api/digests/${latestDigest.id}/pdf`} className="btn btn-primary">
                    Download as PDF
                  </a>
                  <Link href="/digests" className="btn btn-secondary">
                    View Archive
                  </Link>
                </div>
              </article>
            ) : (
              <div className="card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
                <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
                  No published issues are available yet.
                </p>
                <Link href="/admin" className="btn btn-primary">
                  Go to Editor Portal
                </Link>
              </div>
            )}
          </section>

          {/* Right Column: Case Notes */}
          <section>
            <h2 style={{ fontSize: '1.8rem', borderBottom: '2px solid var(--color-primary)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
              Recent Case Notes
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {recentCaseNotes.length > 0 ? (
                recentCaseNotes.map((note) => (
                  <article key={note.id} className="card" style={{ padding: '1.25rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-secondary)', fontWeight: 'bold', textTransform: 'uppercase' }}>
                      Case Note
                    </span>
                    <h3 style={{ fontSize: '1.25rem', marginTop: '0.25rem', marginBottom: '0.5rem' }}>
                      {note.title}
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>
                      {note.citation_tribunal}
                    </p>
                    <p style={{ fontSize: '0.9rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '1rem' }}>
                      {note.facts}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Link href={`/case-notes?id=${note.id}`} style={{ fontSize: '0.85rem', fontWeight: 'bold', textDecoration: 'underline' }}>
                        Read Case Note
                      </Link>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        {new Date(note.published_at).toLocaleDateString()}
                      </span>
                    </div>
                  </article>
                ))
              ) : (
                <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
                  <p style={{ color: 'var(--color-text-muted)' }}>No published case notes available.</p>
                </div>
              )}
            </div>
            
            {recentCaseNotes.length > 0 && (
              <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
                <Link href="/case-notes" style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
                  All Case Notes &rarr;
                </Link>
              </div>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
