'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewCaseNotePage() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [tags, setTags] = useState('');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [statusText, setStatusText] = useState('');

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setGenerating(true);
    setError('');
    setStatusText('Fetching URL contents & cleaning HTML...');

    try {
      // 1. Trigger the Claude-based generation API
      const genRes = await fetch('/api/generate-case-note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      if (!genRes.ok) {
        const genData = await genRes.json();
        throw new Error(genData.error || 'Failed to analyze source URL.');
      }

      setStatusText('Parsing legal issues & reasoning with Claude...');
      const genData = await genRes.json();
      const generated = genData.data;

      setStatusText('Saving draft case note in database...');

      // 2. Save the generated sections to our case_notes table as a draft
      const saveRes = await fetch('/api/admin/case-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source_url: url,
          title: generated.title || 'Decision Summary',
          citation_tribunal: generated.citation_tribunal,
          facts: generated.facts,
          legal_issues: generated.legal_issues,
          reasoning: generated.reasoning,
          critical_analysis: generated.critical_analysis,
          significance: generated.significance,
          tags: tags,
          status: 'draft',
        }),
      });

      const saveData = await saveRes.json();
      if (saveRes.ok) {
        // Redirect to the editor page for this newly created note
        router.push(`/admin/case-notes/${saveData.caseNote.id}`);
        router.refresh();
      } else {
        throw new Error(saveData.error || 'Failed to save generated draft.');
      }

    } catch (err) {
      console.error(err);
      setError((err as Error).message || 'An error occurred during generation.');
    } finally {
      setGenerating(false);
      setStatusText('');
    }
  };

  return (
    <div className="admin-layout" style={{ minHeight: '100vh', display: 'flex' }}>
      <aside className="admin-sidebar">
        <h2>ILRC Editor Panel</h2>
        <nav className="admin-nav">
          <a href="/admin">Dashboard</a>
          <a href="/admin/case-notes/new" className="active">+ New Case Note</a>
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
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-serif)', margin: 0 }}>
              Generate Case Note
            </h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
              Paste the URL of an award, judgment, or legal briefing to generate a structured analysis.
            </p>
          </div>

          <div className="card">
            <form onSubmit={handleGenerate}>
              <div className="form-group">
                <label className="form-label" htmlFor="source-url-input">Decision / Award Source URL</label>
                <input
                  id="source-url-input"
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="form-control"
                  placeholder="https://icsid.worldbank.org/news-and-events/..."
                  required
                  disabled={generating}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label" htmlFor="tags-input">Topic Tags (comma-separated)</label>
                <input
                  id="tags-input"
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="form-control"
                  placeholder="investment arbitration, bilateral treaty, ICSID"
                  disabled={generating}
                />
              </div>

              {statusText && (
                <div style={{ fontSize: '0.85rem', color: 'var(--color-secondary)', marginBottom: '1rem', fontStyle: 'italic' }}>
                  ⏳ {statusText}
                </div>
              )}

              {error && (
                <div style={{ fontSize: '0.85rem', color: 'var(--color-danger)', backgroundColor: 'rgba(239, 68, 68, 0.08)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem' }}>
                  ❌ {error}
                </div>
              )}

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => router.push('/admin')}
                  className="btn btn-secondary"
                  disabled={generating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flexGrow: 1 }}
                  disabled={generating}
                >
                  {generating ? 'Processing with Claude...' : 'Generate Draft Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
