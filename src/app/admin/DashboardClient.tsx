'use client';

import { useState } from 'react';
import Link from 'next/router';
import { useRouter } from 'next/navigation';

interface Digest {
  id: number;
  issue_number: number;
  status: string;
  created_at: string;
  published_at?: string;
  arb_title: string;
  treaty_title: string;
  inst_title: string;
}

interface CaseNote {
  id: number;
  title: string;
  citation_tribunal: string;
  status: string;
  created_at: string;
  published_at?: string;
}

interface DashboardClientProps {
  initialDigests: Digest[];
  initialCaseNotes: CaseNote[];
  subscriberCount: number;
  upcomingCronTriggers: string[];
}

export default function DashboardClient({
  initialDigests,
  initialCaseNotes,
  subscriberCount,
  upcomingCronTriggers,
}: DashboardClientProps) {
  const router = useRouter();
  const [digests, setDigests] = useState<Digest[]>(initialDigests);
  const [caseNotes, setCaseNotes] = useState<CaseNote[]>(initialCaseNotes);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const triggerManualScrape = async () => {
    setGenerating(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/admin/digests/generate', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setSuccess(`Success! Draft Issue #${data.issue_number} has been generated.`);
        // Refresh page data
        router.refresh();
        // Update local list if we want, or router.refresh will pull new props
        const refetchRes = await fetch('/api/admin/digests');
        const refetchData = await refetchRes.json();
        if (refetchData.success) {
          setDigests(refetchData.digests);
        }
      } else {
        setError(data.error || 'Failed to generate digest.');
      }
    } catch (err) {
      setError('A network error occurred.');
    } finally {
      setGenerating(false);
    }
  };

  const handleUnpublish = async (id: number) => {
    if (!confirm('Are you sure you want to unpublish this issue? It will be removed from the public website and returned to draft queue.')) return;
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`/api/admin/digests/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'pending' }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess('Issue unpublished successfully.');
        router.refresh();
        const refetchRes = await fetch('/api/admin/digests');
        const refetchData = await refetchRes.json();
        if (refetchData.success) {
          setDigests(refetchData.digests);
        }
      } else {
        setError(data.error || 'Failed to unpublish.');
      }
    } catch (err) {
      setError('A network error occurred.');
    }
  };

  const handleDeleteDigest = async (id: number) => {
    if (!confirm('Are you sure you want to permanently delete this pending digest draft? This action cannot be undone.')) return;
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`/api/admin/digests/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSuccess('Digest draft deleted successfully.');
        router.refresh();
        setDigests(digests.filter((d) => d.id !== id));
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to delete.');
      }
    } catch (err) {
      setError('A network error occurred.');
    }
  };

  const handleDeleteCaseNote = async (id: number) => {
    if (!confirm('Are you sure you want to permanently delete this case note?')) return;
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`/api/admin/case-notes/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSuccess('Case note deleted successfully.');
        router.refresh();
        setCaseNotes(caseNotes.filter((n) => n.id !== id));
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to delete.');
      }
    } catch (err) {
      setError('A network error occurred.');
    }
  };

  const pendingDigests = digests.filter((d) => d.status === 'pending');
  const publishedDigests = digests.filter((d) => d.status === 'published');

  return (
    <div>
      {/* Top Header Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', fontFamily: 'var(--font-serif)', margin: 0 }}>
            Editorial Dashboard
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', margin: 0 }}>
            Manage fortnightly legal drafts, publish newsletters, and format case commentaries.
          </p>
        </div>

        <button
          onClick={triggerManualScrape}
          className="btn btn-primary"
          style={{ padding: '0.75rem 1.5rem', fontSize: '0.9rem' }}
          disabled={generating}
        >
          {generating ? 'Scraping feeds & LLM parsing...' : '⚡ Trigger Manual Scrape'}
        </button>
      </div>

      {/* Notifications */}
      {success && (
        <div style={{ padding: '1rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderLeft: '4px solid var(--color-success)', color: 'var(--color-success)', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem' }}>
          {success}
        </div>
      )}
      {error && (
        <div style={{ padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderLeft: '4px solid var(--color-danger)', color: 'var(--color-danger)', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2" style={{ marginBottom: '2.5rem' }}>
        <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '1rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-sans)', fontWeight: '600', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Mailing List Subscribers
            </h3>
            <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--color-primary)', lineHeight: 1 }}>
              {subscriberCount}
            </p>
          </div>
          <span style={{ fontSize: '2.5rem' }}>✉️</span>
        </div>

        <div className="card">
          <h3 style={{ fontSize: '1rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-sans)', fontWeight: '600', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            Scheduled Cron Triggers (14-day cycle)
          </h3>
          <ul style={{ paddingLeft: '1.25rem', fontSize: '0.8rem', color: 'var(--color-text-main)', margin: 0 }}>
            {upcomingCronTriggers.slice(0, 3).map((trigger, idx) => (
              <li key={idx} style={{ marginBottom: '0.25rem' }}>
                {trigger}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Pending Reviews Section */}
      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
          Pending Editorial Review ({pendingDigests.length})
        </h2>

        {pendingDigests.length > 0 ? (
          <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--color-surface-hover)', borderBottom: '1px solid var(--color-border)' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Draft ID</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Scraped Date</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Arbitration Dev</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingDigests.map((d) => (
                  <tr key={d.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '1rem', fontWeight: 'bold' }}>Draft #{d.issue_number}</td>
                    <td style={{ padding: '1rem' }}>{new Date(d.created_at).toLocaleDateString()}</td>
                    <td style={{ padding: '1rem', color: 'var(--color-text-muted)', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {d.arb_title}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => router.push(`/admin/digest/${d.id}`)}
                        className="btn btn-primary"
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                      >
                        Review & Edit
                      </button>
                      <button
                        onClick={() => handleDeleteDigest(d.id)}
                        className="btn btn-danger"
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
            No pending drafts to review. Click &ldquo;Trigger Manual Scrape&rdquo; above to generate one.
          </div>
        )}
      </section>

      {/* Case Notes Workspace */}
      <section style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem', width: '100%', margin: 0 }}>
            Case Notes Workspace ({caseNotes.length})
          </h2>
          <button
            onClick={() => router.push('/admin/case-notes/new')}
            className="btn btn-secondary"
            style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', whiteSpace: 'nowrap', marginLeft: '1rem' }}
          >
            + Generate Case Note
          </button>
        </div>

        {caseNotes.length > 0 ? (
          <div className="card" style={{ padding: 0, overflowX: 'auto', marginTop: '1rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--color-surface-hover)', borderBottom: '1px solid var(--color-border)' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Case Title</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Citation / Tribunal</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Created Date</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {caseNotes.map((n) => (
                  <tr key={n.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '1rem', fontWeight: 'bold' }}>{n.title}</td>
                    <td style={{ padding: '1rem' }}>{n.citation_tribunal}</td>
                    <td style={{ padding: '1rem' }}>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          padding: '0.2rem 0.5rem',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: n.status === 'published' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(100, 116, 139, 0.1)',
                          color: n.status === 'published' ? 'var(--color-success)' : 'var(--color-text-muted)',
                          fontWeight: 'bold',
                        }}
                      >
                        {n.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>{new Date(n.created_at).toLocaleDateString()}</td>
                    <td style={{ padding: '1rem', textAlign: 'right', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => router.push(`/admin/case-notes/${n.id}`)}
                        className="btn btn-secondary"
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteCaseNote(n.id)}
                        className="btn btn-danger"
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)', marginTop: '1rem' }}>
            No case notes created yet. Paste a decision URL above to generate one.
          </div>
        )}
      </section>

      {/* Published Issues History */}
      <section>
        <h2 style={{ fontSize: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
          Published Digest History ({publishedDigests.length})
        </h2>

        {publishedDigests.length > 0 ? (
          <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--color-surface-hover)', borderBottom: '1px solid var(--color-border)' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Issue No.</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Publication Date</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Arbitration Dev</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {publishedDigests.map((d) => (
                  <tr key={d.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '1rem', fontWeight: 'bold' }}>Issue #{d.issue_number}</td>
                    <td style={{ padding: '1rem' }}>
                      {d.published_at ? new Date(d.published_at).toLocaleDateString() : 'N/A'}
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--color-text-muted)', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {d.arb_title}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => router.push(`/admin/digest/${d.id}`)}
                        className="btn btn-secondary"
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleUnpublish(d.id)}
                        className="btn btn-danger"
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', backgroundColor: 'var(--color-secondary)', borderColor: 'var(--color-secondary)' }}
                      >
                        Unpublish
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
            No published issues yet.
          </div>
        )}
      </section>
    </div>
  );
}
