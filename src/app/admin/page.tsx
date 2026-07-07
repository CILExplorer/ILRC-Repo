import { redirect, notFound } from 'next/navigation';
import { isAdminAuthenticated } from '@/lib/auth';
import { query } from '@/lib/db';
import DashboardClient from './DashboardClient';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export const revalidate = 0;

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  // 1. Check if authenticated
  if (!(await isAdminAuthenticated())) {
    const resolvedParams = await searchParams;
    const access = resolvedParams.access;
    if (access === 'cilexplorer') {
      redirect('/admin/login?access=cilexplorer');
    } else {
      notFound(); // Hides dashboard under 404 page
    }
  }

  let subscriberCount = 0;
  let digests: any[] = [];
  let caseNotes: any[] = [];

  try {
    // 2. Query statistics
    const subRes = await query('SELECT COUNT(*) as count FROM subscribers');
    subscriberCount = parseInt(subRes.rows[0]?.count || '0', 10);

    // 3. Query digests list
    const digestRes = await query('SELECT * FROM digests ORDER BY issue_number DESC, created_at DESC');
    digests = digestRes.rows;

    // 4. Query case notes list
    const notesRes = await query('SELECT * FROM case_notes ORDER BY created_at DESC');
    caseNotes = notesRes.rows;

  } catch (error) {
    console.error('Admin Dashboard server query error:', error);
  }

  // 5. Calculate upcoming cron triggers (mocking every 14 days starting from a base date)
  // Let's assume a fortnightly schedule (e.g., every other Monday or every 14 days)
  const upcomingCronTriggers: string[] = [];
  const startOfPeriod = new Date('2026-07-06T00:00:00Z'); // Baseline
  const now = new Date();
  
  // Find the next 5 executions
  let checkTime = new Date(startOfPeriod.getTime());
  while (upcomingCronTriggers.length < 5) {
    if (checkTime > now) {
      upcomingCronTriggers.push(
        checkTime.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          timeZoneName: 'short'
        })
      );
    }
    // Add 14 days
    checkTime.setDate(checkTime.getDate() + 14);
  }

  return (
    <div className="admin-layout" style={{ minHeight: '100vh', display: 'flex' }}>
      {/* Sidebar navigation */}
      <aside className="admin-sidebar">
        <h2>ILRC Editor Panel</h2>
        <nav className="admin-nav">
          <a href="/admin" className="active">Dashboard</a>
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

      {/* Main dashboard content */}
      <main className="admin-main">
        <DashboardClient
          initialDigests={digests}
          initialCaseNotes={caseNotes}
          subscriberCount={subscriberCount}
          upcomingCronTriggers={upcomingCronTriggers}
        />
      </main>
    </div>
  );
}
