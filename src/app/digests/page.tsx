import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { query } from '@/lib/db';
import ArchiveListClient from './ArchiveListClient';

export const revalidate = 0;

export default async function DigestsArchivePage() {
  let digests = [];
  try {
    const result = await query(
      "SELECT * FROM digests WHERE status = 'published' ORDER BY issue_number DESC"
    );
    digests = result.rows;
  } catch (error) {
    console.error('Failed to fetch digests for archive:', error);
  }

  return (
    <>
      <Header />
      <main className="container" style={{ padding: '2.5rem 1.5rem' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '2.25rem', fontFamily: 'var(--font-serif)', marginBottom: '0.5rem' }}>
            Digest Archive
          </h1>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '2.5rem' }}>
            Explore past issues of the fortnightly international law and arbitration digest.
          </p>

          <ArchiveListClient digests={digests} />
        </div>
      </main>
      <Footer />
    </>
  );
}
