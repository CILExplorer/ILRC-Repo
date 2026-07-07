import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { query } from '@/lib/db';
import CaseNotesClient from './CaseNotesClient';

export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{
    id?: string;
    tag?: string;
  }>;
}

export default async function CaseNotesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const activeId = params.id ? parseInt(params.id, 10) : undefined;
  const activeTag = params.tag || undefined;

  let caseNotes = [];
  let uniqueTags: string[] = [];

  try {
    // 1. Query case notes based on tag filter
    let sql = "SELECT * FROM case_notes WHERE status = 'published'";
    const queryParams: any[] = [];

    if (activeTag) {
      sql += " AND $1 = ANY(tags)";
      queryParams.push(activeTag);
    }
    sql += " ORDER BY published_at DESC";

    const result = await query(sql, queryParams);
    caseNotes = result.rows;

    // 2. Query all unique tags for the filter bar
    const tagsResult = await query(
      "SELECT DISTINCT unnest(tags) as tag FROM case_notes WHERE status = 'published' ORDER BY tag ASC"
    );
    uniqueTags = tagsResult.rows.map((r: { tag: string }) => r.tag);

  } catch (error) {
    console.error('Failed to fetch case notes:', error);
  }

  return (
    <>
      <Header />
      <main className="container" style={{ padding: '2.5rem 1.5rem' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '2.25rem', fontFamily: 'var(--font-serif)', marginBottom: '0.5rem' }}>
            Case Notes & Decisions
          </h1>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
            Structured legal analysis, awards summary, and expert commentary on key international decisions.
          </p>

          <CaseNotesClient
            caseNotes={caseNotes}
            uniqueTags={uniqueTags}
            activeId={activeId}
            activeTag={activeTag}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
