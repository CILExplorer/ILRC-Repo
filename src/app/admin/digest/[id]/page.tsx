import { redirect } from 'next/navigation';
import { isAdminAuthenticated } from '@/lib/auth';
import { query } from '@/lib/db';
import DigestEditorClient from './DigestEditorClient';

export const revalidate = 0;

type Params = Promise<{ id: string }>;

export default async function AdminDigestEditorPage({ params }: { params: Params }) {
  // 1. Authenticate
  if (!(await isAdminAuthenticated())) {
    redirect('/admin/login');
  }

  const { id } = await params;

  // 2. Fetch the digest from DB
  let digest = null;
  try {
    const result = await query('SELECT * FROM digests WHERE id = $1', [id]);
    if (result.rows.length > 0) {
      digest = result.rows[0];
    }
  } catch (error) {
    console.error('Error fetching digest for editing:', error);
  }

  if (!digest) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Digest Draft Not Found</h2>
        <a href="/admin" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Back to Dashboard
        </a>
      </div>
    );
  }

  return (
    <div className="admin-layout" style={{ minHeight: '100vh', display: 'flex' }}>
      <aside className="admin-sidebar">
        <h2>ILRC Editor Panel</h2>
        <nav className="admin-nav">
          <a href="/admin">Dashboard</a>
          <a href="/admin/case-notes/new">+ New Case Note</a>
          <a href="/" target="_blank">View Live Site &nearr;</a>
        </nav>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
          <p style={{ fontSize: '0.8rem', color: 'hsl(210, 20%, 80%)', marginBottom: '1rem' }}>
            Editor: Ananyaa Joshi
          </p>
          <a href="/api/admin/auth/logout" className="btn btn-danger" style={{ width: '100%', fontSize: '0.85rem' }}>
            Log Out
          </a>
        </div>
      </aside>

      <main className="admin-main">
        <DigestEditorClient digest={digest} />
      </main>
    </div>
  );
}
