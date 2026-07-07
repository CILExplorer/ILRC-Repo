'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface CaseNote {
  id: number;
  title: string;
  source_url: string;
  fetch_date: string;
  status: string;
  created_at: string;
  published_at?: string;
  last_edited_at?: string;
  citation_tribunal: string;
  facts: string;
  legal_issues: string;
  reasoning: string;
  critical_analysis: string;
  significance: string;
  editors_commentary?: string;
  tags?: string[];
  verified: boolean;
}

export default function CaseNoteEditorClient({ caseNote }: { caseNote: CaseNote }) {
  const router = useRouter();

  // State for all editable fields
  const [title, setTitle] = useState(caseNote.title);
  const [sourceUrl, setSourceUrl] = useState(caseNote.source_url);
  const [citationTribunal, setCitationTribunal] = useState(caseNote.citation_tribunal);
  
  const [facts, setFacts] = useState(caseNote.facts);
  const [legalIssues, setLegalIssues] = useState(caseNote.legal_issues);
  const [reasoning, setReasoning] = useState(caseNote.reasoning);
  const [criticalAnalysis, setCriticalAnalysis] = useState(caseNote.critical_analysis);
  const [significance, setSignificance] = useState(caseNote.significance);
  
  const [editorsCommentary, setEditorsCommentary] = useState(caseNote.editors_commentary || '');
  const [tags, setTags] = useState(caseNote.tags ? caseNote.tags.join(', ') : '');

  // Verification checkbox
  const [verified, setVerified] = useState(caseNote.verified);

  // UI status states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Calculate word count for Commentary
  const getWordCount = (text: string) => {
    const trimmed = text.trim();
    if (trimmed === '') return 0;
    return trimmed.split(/\s+/).length;
  };

  const wordCount = getWordCount(editorsCommentary);
  const isWordCountInRange = wordCount >= 100 && wordCount <= 200;

  const handleSave = async (targetStatus: 'draft' | 'published') => {
    setError('');
    setSuccess('');
    setLoading(true);

    if (targetStatus === 'published' && !verified) {
      setError('Sourcing enforcement error: The source verification checkbox must be checked before publishing.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/admin/case-notes/${caseNote.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          source_url: sourceUrl,
          citation_tribunal: citationTribunal,
          facts,
          legal_issues: legalIssues,
          reasoning,
          critical_analysis: criticalAnalysis,
          significance,
          editors_commentary: editorsCommentary,
          tags,
          verified,
          status: targetStatus,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess(
          targetStatus === 'published'
            ? 'Case note published live successfully!'
            : 'Case note draft saved successfully.'
        );
        router.refresh();
        if (targetStatus === 'published') {
          setTimeout(() => router.push('/admin'), 1500);
        }
      } else {
        setError(data.error || 'Failed to update case note.');
      }
    } catch (err) {
      setError('A network error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleUnpublish = async () => {
    if (!confirm('Are you sure you want to unpublish this case note?')) return;
    handleSave('draft');
  };

  const publishDisabled = !verified || loading;

  return (
    <div>
      {/* Editorial Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-serif)', margin: 0 }}>
            {caseNote.status === 'published' ? 'Edit Published Case Note' : 'Review Generated Case Note'}
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', margin: 0 }}>
            Generated on {new Date(caseNote.fetch_date).toLocaleDateString()} &bull; Draft ID: {caseNote.id}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={() => router.push('/admin')} className="btn btn-secondary">
            &larr; Back to Dashboard
          </button>
        </div>
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

      {/* Workspace Split Layout */}
      <div className="admin-form-grid">
        
        {/* Left Column: Case Note Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div className="card">
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
              Primary Information
            </h3>
            
            <div className="form-group">
              <label className="form-label" htmlFor="title-field">Case Name / Document Title</label>
              <input
                id="title-field"
                type="text"
                className="form-control"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="citation-field">Citation and Tribunal</label>
              <input
                id="citation-field"
                type="text"
                className="form-control"
                value={citationTribunal}
                onChange={(e) => setCitationTribunal(e.target.value)}
                placeholder="e.g. ICSID Case No. ARB/22/1"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="url-field">Source URL</label>
              <input
                id="url-field"
                type="url"
                className="form-control"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="card">
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
              Structured Analysis (Claude Generated)
            </h3>

            <div className="form-group">
              <label className="form-label" htmlFor="facts-field">Facts (approx 100 words)</label>
              <textarea
                id="facts-field"
                className="form-control"
                value={facts}
                onChange={(e) => setFacts(e.target.value)}
                style={{ minHeight: '120px' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="issues-field">Legal Issues (approx 50 words)</label>
              <textarea
                id="issues-field"
                className="form-control"
                value={legalIssues}
                onChange={(e) => setLegalIssues(e.target.value)}
                style={{ minHeight: '90px' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reasoning-field">Tribunal&apos;s Reasoning (approx 200 words)</label>
              <textarea
                id="reasoning-field"
                className="form-control"
                value={reasoning}
                onChange={(e) => setReasoning(e.target.value)}
                style={{ minHeight: '180px' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="analysis-field">Critical Analysis (approx 200 words)</label>
              <textarea
                id="analysis-field"
                className="form-control"
                value={criticalAnalysis}
                onChange={(e) => setCriticalAnalysis(e.target.value)}
                style={{ minHeight: '180px' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="significance-field">Significance (approx 80 words)</label>
              <textarea
                id="significance-field"
                className="form-control"
                value={significance}
                onChange={(e) => setSignificance(e.target.value)}
                style={{ minHeight: '110px' }}
              />
            </div>
          </div>
        </div>

        {/* Right Column: Editor Additions & Verification */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Editor's Commentary */}
          <div className="card">
            <h3 style={{ fontSize: '1.15rem', color: 'var(--color-primary)', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.4rem', marginBottom: '1rem' }}>
              Commentary
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-secondary)', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              ✒️ Original Content — Not AI Generated
            </p>
            
            <div className="form-group">
              <label className="form-label" htmlFor="editors-commentary-field">Editor&apos;s Commentary (Ananyaa Joshi)</label>
              <textarea
                id="editors-commentary-field"
                className="form-control"
                value={editorsCommentary}
                onChange={(e) => setEditorsCommentary(e.target.value)}
                placeholder="Paste original commentary regarding award impacts..."
                style={{ minHeight: '180px', fontSize: '0.9rem' }}
              />

              {/* Word Counter */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem', fontSize: '0.8rem' }}>
                <span style={{ color: isWordCountInRange ? 'var(--color-success)' : 'var(--color-secondary)', fontWeight: 'bold' }}>
                  Words: {wordCount} (Target: 100-200)
                </span>
                {!isWordCountInRange && wordCount > 0 && (
                  <span style={{ color: 'var(--color-text-muted)' }}>
                    {wordCount < 100 ? 'Too short' : 'Soft limit exceeded'}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="card">
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.75rem' }}>Metadata Tags</h3>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" htmlFor="tags-field">Comma Separated Tags</label>
              <input
                id="tags-field"
                type="text"
                className="form-control"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="investment arbitration, treaty"
              />
            </div>
          </div>

          {/* Sourcing Verification Checkbox */}
          <div className="card" style={{ borderColor: publishDisabled ? 'var(--color-border)' : 'var(--color-secondary)' }}>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--color-primary)', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.4rem', marginBottom: '1rem' }}>
              Source Verification
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '1.25rem' }}>
              Verify details against the award/decision source URL.
            </p>

            <label style={{ display: 'flex', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer', alignItems: 'flex-start' }}>
              <input
                type="checkbox"
                checked={verified}
                onChange={(e) => setVerified(e.target.checked)}
                style={{ marginTop: '0.2rem' }}
              />
              <span>
                I have verified this case note against the source URL at{' '}
                <a href={sourceUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline' }}>
                  source URL
                </a>
                .
              </span>
            </label>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button
              onClick={() => handleSave('draft')}
              className="btn btn-secondary"
              style={{ width: '100%' }}
              disabled={loading}
            >
              Save Draft
            </button>

            <button
              onClick={() => handleSave('published')}
              className="btn btn-primary"
              style={{ width: '100%', backgroundColor: publishDisabled ? 'var(--color-text-muted)' : 'var(--color-primary)' }}
              disabled={publishDisabled}
            >
              {loading ? 'Publishing...' : 'Publish Case Note'}
            </button>

            {caseNote.status === 'published' && (
              <button
                onClick={handleUnpublish}
                className="btn btn-danger"
                style={{ width: '100%' }}
                disabled={loading}
              >
                Unpublish (Revert to Draft)
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
