'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Digest {
  id: number;
  issue_number: number;
  status: string;
  created_at: string;
  published_at?: string;
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
  verified_arb: boolean;
  verified_treaty: boolean;
  verified_inst: boolean;
}

export default function DigestEditorClient({ digest }: { digest: Digest }) {
  const router = useRouter();
  
  // State for all editable fields
  const [arbTitle, setArbTitle] = useState(digest.arb_title);
  const [arbSummary, setArbSummary] = useState(digest.arb_summary);
  const [arbSourceName, setArbSourceName] = useState(digest.arb_source_name);
  const [arbSourceUrl, setArbSourceUrl] = useState(digest.arb_source_url);
  const [arbSourceDate, setArbSourceDate] = useState(
    digest.arb_source_date ? new Date(digest.arb_source_date).toISOString().split('T')[0] : ''
  );

  const [treatyTitle, setTreatyTitle] = useState(digest.treaty_title);
  const [treatySummary, setTreatySummary] = useState(digest.treaty_summary);
  const [treatySourceName, setTreatySourceName] = useState(digest.treaty_source_name);
  const [treatySourceUrl, setTreatySourceUrl] = useState(digest.treaty_source_url);
  const [treatySourceDate, setTreatySourceDate] = useState(
    digest.treaty_source_date ? new Date(digest.treaty_source_date).toISOString().split('T')[0] : ''
  );

  const [instTitle, setInstTitle] = useState(digest.inst_title);
  const [instSummary, setInstSummary] = useState(digest.inst_summary);
  const [instSourceName, setInstSourceName] = useState(digest.inst_source_name);
  const [instSourceUrl, setInstSourceUrl] = useState(digest.inst_source_url);
  const [instSourceDate, setInstSourceDate] = useState(
    digest.inst_source_date ? new Date(digest.inst_source_date).toISOString().split('T')[0] : ''
  );

  const [editorsNote, setEditorsNote] = useState(digest.editors_note || '');
  const [editorsInsight, setEditorsInsight] = useState(digest.editors_insight || '');
  const [tags, setTags] = useState(digest.tags ? digest.tags.join(', ') : '');

  // Verification Checkboxes
  const [verifiedArb, setVerifiedArb] = useState(digest.verified_arb);
  const [verifiedTreaty, setVerifiedTreaty] = useState(digest.verified_treaty);
  const [verifiedInst, setVerifiedInst] = useState(digest.verified_inst);

  // UI state
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Calculate word count for Editorial Insight
  const getWordCount = (text: string) => {
    const trimmed = text.trim();
    if (trimmed === '') return 0;
    return trimmed.split(/\s+/).length;
  };

  const wordCount = getWordCount(editorsInsight);
  const isWordCountInRange = wordCount >= 100 && wordCount <= 200;

  const handleSave = async (targetStatus: 'pending' | 'published') => {
    setError('');
    setSuccess('');
    setLoading(true);

    if (targetStatus === 'published' && (!verifiedArb || !verifiedTreaty || !verifiedInst)) {
      setError('Sourcing enforcement error: All source verification checkboxes must be checked before publishing.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/admin/digests/${digest.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          arb_title: arbTitle,
          arb_summary: arbSummary,
          arb_source_name: arbSourceName,
          arb_source_url: arbSourceUrl,
          arb_source_date: arbSourceDate,

          treaty_title: treatyTitle,
          treaty_summary: treatySummary,
          treaty_source_name: treatySourceName,
          treaty_source_url: treatySourceUrl,
          treaty_source_date: treatySourceDate,

          inst_title: instTitle,
          inst_summary: instSummary,
          inst_source_name: instSourceName,
          inst_source_url: instSourceUrl,
          inst_source_date: instSourceDate,

          verified_arb: verifiedArb,
          verified_treaty: verifiedTreaty,
          verified_inst: verifiedInst,

          editors_note: editorsNote,
          editors_insight: editorsInsight,
          tags: tags,
          status: targetStatus,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess(
          targetStatus === 'published'
            ? 'Issue published successfully and mailing list broadcast triggered!'
            : 'Draft saved successfully.'
        );
        router.refresh();
        if (targetStatus === 'published') {
          setTimeout(() => router.push('/admin'), 1500);
        }
      } else {
        setError(data.error || 'Failed to update digest.');
      }
    } catch (err) {
      setError('A network error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleUnpublish = async () => {
    if (!confirm('Are you sure you want to unpublish this issue?')) return;
    handleSave('pending');
  };

  const publishDisabled = !verifiedArb || !verifiedTreaty || !verifiedInst || loading;

  return (
    <div>
      {/* Editorial Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-serif)', margin: 0 }}>
            {digest.status === 'published' ? 'Edit Published Digest' : 'Digest Editorial Workspace'}
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', margin: 0 }}>
            Issue #{digest.issue_number} &bull; Created on {new Date(digest.created_at).toLocaleDateString()}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={() => router.push('/admin')} className="btn btn-secondary">
            &larr; Back to Dashboard
          </button>
          <button onClick={() => setIsPreviewOpen(true)} className="btn btn-secondary">
            👁️ Preview Publication
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

      {/* Main Workspace Form */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Editor's Note Field */}
          <div className="card">
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
              Editor&apos;s Note
            </h3>
            <div className="form-group">
              <label className="form-label" htmlFor="editors-note-field">Suggested Theme Synthesis (Draft)</label>
              <textarea
                id="editors-note-field"
                className="form-control"
                value={editorsNote}
                onChange={(e) => setEditorsNote(e.target.value)}
                placeholder="Write a 2-3 sentence synthesis of the issue's theme..."
                style={{ minHeight: '80px' }}
              />
            </div>
          </div>

          {/* 1. Arbitration Development Card */}
          <div className="card">
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
              Arbitration Development
            </h3>
            <div className="form-group">
              <label className="form-label" htmlFor="arb-title-field">Headline / Title</label>
              <input
                id="arb-title-field"
                type="text"
                className="form-control"
                value={arbTitle}
                onChange={(e) => setArbTitle(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="arb-summary-field">Summary (3-4 Sentences)</label>
              <textarea
                id="arb-summary-field"
                className="form-control"
                value={arbSummary}
                onChange={(e) => setArbSummary(e.target.value)}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="arb-source-name-field">Source Name</label>
                <input
                  id="arb-source-name-field"
                  type="text"
                  className="form-control"
                  value={arbSourceName}
                  onChange={(e) => setArbSourceName(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="arb-source-url-field">Source URL</label>
                <input
                  id="arb-source-url-field"
                  type="url"
                  className="form-control"
                  value={arbSourceUrl}
                  onChange={(e) => setArbSourceUrl(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="arb-source-date-field">Publication Date</label>
                <input
                  id="arb-source-date-field"
                  type="date"
                  className="form-control"
                  value={arbSourceDate}
                  onChange={(e) => setArbSourceDate(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* 2. Treaty Update Card */}
          <div className="card">
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
              Treaty Update
            </h3>
            <div className="form-group">
              <label className="form-label" htmlFor="treaty-title-field">Headline / Title</label>
              <input
                id="treaty-title-field"
                type="text"
                className="form-control"
                value={treatyTitle}
                onChange={(e) => setTreatyTitle(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="treaty-summary-field">Summary (3-4 Sentences)</label>
              <textarea
                id="treaty-summary-field"
                className="form-control"
                value={treatySummary}
                onChange={(e) => setTreatySummary(e.target.value)}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="treaty-source-name-field">Source Name</label>
                <input
                  id="treaty-source-name-field"
                  type="text"
                  className="form-control"
                  value={treatySourceName}
                  onChange={(e) => setTreatySourceName(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="treaty-source-url-field">Source URL</label>
                <input
                  id="treaty-source-url-field"
                  type="url"
                  className="form-control"
                  value={treatySourceUrl}
                  onChange={(e) => setTreatySourceUrl(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="treaty-source-date-field">Publication Date</label>
                <input
                  id="treaty-source-date-field"
                  type="date"
                  className="form-control"
                  value={treatySourceDate}
                  onChange={(e) => setTreatySourceDate(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* 3. Institution Update Card */}
          <div className="card">
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
              Institution Update (SIAC, ICC, ICSID, WIPO, ICJ, UN)
            </h3>
            <div className="form-group">
              <label className="form-label" htmlFor="inst-title-field">Headline / Title</label>
              <input
                id="inst-title-field"
                type="text"
                className="form-control"
                value={instTitle}
                onChange={(e) => setInstTitle(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="inst-summary-field">Summary (3-4 Sentences)</label>
              <textarea
                id="inst-summary-field"
                className="form-control"
                value={instSummary}
                onChange={(e) => setInstSummary(e.target.value)}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="inst-source-name-field">Source Name</label>
                <input
                  id="inst-source-name-field"
                  type="text"
                  className="form-control"
                  value={instSourceName}
                  onChange={(e) => setInstSourceName(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="inst-source-url-field">Source URL</label>
                <input
                  id="inst-source-url-field"
                  type="url"
                  className="form-control"
                  value={instSourceUrl}
                  onChange={(e) => setInstSourceUrl(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="inst-source-date-field">Publication Date</label>
                <input
                  id="inst-source-date-field"
                  type="date"
                  className="form-control"
                  value={instSourceDate}
                  onChange={(e) => setInstSourceDate(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Editor original content & publish checklist */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Editorial Insight Card */}
          <div className="card">
            <h3 style={{ fontSize: '1.15rem', color: 'var(--color-primary)', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.4rem', marginBottom: '1rem' }}>
              Original Insight
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-secondary)', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              ✒️ Original Content — Not AI Generated
            </p>
            <div className="form-group">
              <label className="form-label" htmlFor="editors-insight-field">Editorial Insight (bylined Ananyaa Joshi)</label>
              <textarea
                id="editors-insight-field"
                className="form-control"
                value={editorsInsight}
                onChange={(e) => setEditorsInsight(e.target.value)}
                placeholder="Write original commentary and practitioner takeaways..."
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

          {/* Tags Card */}
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
                placeholder="investment arbitration, SIAC, treaty law"
              />
            </div>
          </div>

          {/* Sourcing Verification Checklist */}
          <div className="card" style={{ borderColor: publishDisabled ? 'var(--color-border)' : 'var(--color-secondary)' }}>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--color-primary)', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.4rem', marginBottom: '1rem' }}>
              Verification Checklist
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
              You must verify all LLM summaries against their original source URLs before publishing.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <label style={{ display: 'flex', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer', alignItems: 'flex-start' }}>
                <input
                  type="checkbox"
                  checked={verifiedArb}
                  onChange={(e) => setVerifiedArb(e.target.checked)}
                  style={{ marginTop: '0.2rem' }}
                />
                <span>I have verified the Arbitration summary against <a href={arbSourceUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline' }}>source URL</a>.</span>
              </label>

              <label style={{ display: 'flex', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer', alignItems: 'flex-start' }}>
                <input
                  type="checkbox"
                  checked={verifiedTreaty}
                  onChange={(e) => setVerifiedTreaty(e.target.checked)}
                  style={{ marginTop: '0.2rem' }}
                />
                <span>I have verified the Treaty update against <a href={treatySourceUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline' }}>source URL</a>.</span>
              </label>

              <label style={{ display: 'flex', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer', alignItems: 'flex-start' }}>
                <input
                  type="checkbox"
                  checked={verifiedInst}
                  onChange={(e) => setVerifiedInst(e.target.checked)}
                  style={{ marginTop: '0.2rem' }}
                />
                <span>I have verified the Institution update against <a href={instSourceUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline' }}>source URL</a>.</span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button
              onClick={() => handleSave('pending')}
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
              {loading ? 'Publishing...' : 'Publish Issue'}
            </button>

            {digest.status === 'published' && (
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

      {/* Preview Modal */}
      {isPreviewOpen && (
        <div className="modal-overlay" onClick={() => setIsPreviewOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px' }}>
            <button
              onClick={() => setIsPreviewOpen(false)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                border: 'none',
                background: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: 'var(--color-text-muted)',
              }}
            >
              &times;
            </button>

            <div className="digest-header">
              <h1 className="digest-title" style={{ fontSize: '2rem' }}>
                International Law Research Collective
              </h1>
              <p style={{ fontStyle: 'italic', color: 'var(--color-secondary)' }}>
                Practitioner-oriented international law and arbitration analysis
              </p>
              <div className="digest-meta" style={{ marginTop: '1rem' }}>
                <strong>Issue #{digest.issue_number} (PREVIEW)</strong>
                <span>Date: {new Date().toLocaleDateString('en-US', { dateStyle: 'long' })}</span>
              </div>
            </div>

            {editorsNote && (
              <div
                style={{
                  backgroundColor: 'var(--color-background)',
                  borderLeft: '4px solid var(--color-text-muted)',
                  padding: '1rem 1.25rem',
                  borderRadius: 'var(--radius-sm)',
                  marginBottom: '2rem',
                  fontStyle: 'italic',
                }}
              >
                <strong>Editor&apos;s Note: </strong> &ldquo;{editorsNote}&rdquo;
              </div>
            )}

            {editorsInsight && (
              <div className="editors-insight-box">
                <h3>Editor&apos;s Insight</h3>
                <p>{editorsInsight}</p>
                <div className="editors-insight-byline">Original Content &bull; Ananyaa Joshi</div>
              </div>
            )}

            <div className="digest-section">
              <h4 className="digest-section-title">Arbitration Development</h4>
              <h5 style={{ fontFamily: 'var(--font-sans)', fontSize: '1.1rem', margin: '0 0 0.5rem 0', fontWeight: '700' }}>
                {arbTitle}
              </h5>
              <p className="digest-section-content">{arbSummary}</p>
              <span className="digest-source">
                Source: <span style={{ textDecoration: 'underline' }}>{arbSourceName}</span> &bull; {arbSourceDate}
              </span>
            </div>

            <div className="digest-section">
              <h4 className="digest-section-title">Treaty Update</h4>
              <h5 style={{ fontFamily: 'var(--font-sans)', fontSize: '1.1rem', margin: '0 0 0.5rem 0', fontWeight: '700' }}>
                {treatyTitle}
              </h5>
              <p className="digest-section-content">{treatySummary}</p>
              <span className="digest-source">
                Source: <span style={{ textDecoration: 'underline' }}>{treatySourceName}</span> &bull; {treatySourceDate}
              </span>
            </div>

            <div className="digest-section">
              <h4 className="digest-section-title">Institution Update</h4>
              <h5 style={{ fontFamily: 'var(--font-sans)', fontSize: '1.1rem', margin: '0 0 0.5rem 0', fontWeight: '700' }}>
                {instTitle}
              </h5>
              <p className="digest-section-content">{instSummary}</p>
              <span className="digest-source">
                Source: <span style={{ textDecoration: 'underline' }}>{instSourceName}</span> &bull; {instSourceDate}
              </span>
            </div>

            <div className="disclaimer-box">
              Digest items and case notes are generated from publicly available sources listed with each item. Editor&apos;s Notes and Editorial Insights are original content by the editor. Source URLs are provided for reader verification. ILRC does not guarantee accuracy — readers should verify all citations independently.
            </div>

            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
              <button onClick={() => setIsPreviewOpen(false)} className="btn btn-primary">
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
