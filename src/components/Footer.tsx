'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('success');
        setMessage(data.message);
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.error || 'Something went wrong.');
      }
    } catch (err) {
      setStatus('error');
      setMessage('Network error. Please try again.');
    }
  };

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', color: '#fff' }}>
              International Law Research Collective
            </h3>
            <p style={{ maxWidth: '600px', fontSize: '0.85rem', color: 'hsl(210, 20%, 80%)' }}>
              Practitioner-oriented international law and arbitration analysis, structured fortnightly digests, and verified case notes.
            </p>
            <div style={{ marginTop: '1.5rem', fontSize: '0.75rem', lineHeight: '1.4', color: 'hsl(210, 10%, 70%)', textAlign: 'justify' }}>
              <strong>Disclaimer:</strong> Digest items and case notes are generated from publicly available sources listed with each item. Editor&apos;s Notes and Editorial Insights are original content by the editor. Source URLs are provided for reader verification. ILRC does not guarantee accuracy — readers should verify all citations independently.
            </div>
          </div>
          <div>
            <h3 style={{ color: '#fff' }}>Mailing List</h3>
            <p style={{ fontSize: '0.85rem' }}>Subscribe to receive digests in full directly in your inbox.</p>
            <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <input
                type="email"
                placeholder="editor@lawfirm.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-control"
                style={{
                  flexGrow: 1,
                  padding: '0.4rem 0.8rem',
                  fontSize: '0.85rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                }}
                required
              />
              <button
                type="submit"
                className="btn btn-primary"
                style={{
                  padding: '0.4rem 0.8rem',
                  fontSize: '0.85rem',
                  backgroundColor: 'var(--color-secondary)',
                  borderColor: 'var(--color-secondary)',
                }}
                disabled={status === 'loading'}
              >
                {status === 'loading' ? '...' : 'Join'}
              </button>
            </form>
            {status === 'success' && (
              <p style={{ fontSize: '0.75rem', color: '#86efac', marginTop: '0.5rem' }}>{message}</p>
            )}
            {status === 'error' && (
              <p style={{ fontSize: '0.75rem', color: '#fca5a5', marginTop: '0.5rem' }}>{message}</p>
            )}
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} International Law Research Collective (ILRC). All rights reserved.</p>
          <div style={{ marginTop: '0.5rem' }}>
            <Link href="/" style={{ color: 'hsl(210, 20%, 60%)', marginRight: '1rem', fontSize: '0.8rem' }}>Home</Link>
            <Link href="/about" style={{ color: 'hsl(210, 20%, 60%)', fontSize: '0.8rem' }}>About & Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
