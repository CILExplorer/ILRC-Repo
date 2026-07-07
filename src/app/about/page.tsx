import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="container" style={{ padding: '3.5rem 1.5rem' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-serif)', marginBottom: '1.5rem', borderBottom: '2px solid var(--color-primary)', paddingBottom: '0.5rem' }}>
            About the Collective
          </h1>
          
          <div style={{ fontSize: '1.1rem', lineHeight: '1.8', color: 'hsl(217, 33%, 20%)', marginBottom: '2.5rem' }}>
            <p style={{ marginBottom: '1.5rem' }}>
              The <strong>International Law Research Collective (ILRC)</strong> is a practitioner-oriented research initiative and fortnightly publication platform dedicated to summarizing and analyzing the latest developments in international law and arbitration. By monitoring and sourcing information from live legal news feeds and blogs worldwide, the Collective ensures that dispute resolution practitioners, academic scholars, and corporate counsel remain updated on critical treaties, institutional reforms, and tribunals awards.
            </p>
            <p>
              Each issue is compiled automatically from trusted global feeds, reviewed meticulously for accuracy, and enriched with editorial commentaries, bridging the gap between raw legal events and practical legal application.
            </p>
          </div>

          <div style={{ backgroundColor: 'hsl(36, 40%, 97%)', borderLeft: '4px solid var(--color-secondary)', padding: '2rem', borderRadius: 'var(--radius-md)', marginBottom: '3rem' }}>
            <h3 style={{ fontSize: '1.35rem', fontFamily: 'var(--font-serif)', color: 'var(--color-primary)', marginBottom: '0.75rem' }}>
              Our Knowledge Translation Mission
            </h3>
            <p style={{ fontSize: '1.05rem', fontStyle: 'italic', color: 'var(--color-text-main)', margin: '0' }}>
              &ldquo;Every publication answers: what happened, why it matters, and how a lawyer uses this information.&rdquo;
            </p>
          </div>

          <h2 style={{ fontSize: '1.6rem', fontFamily: 'var(--font-serif)', marginBottom: '1rem' }}>
            Editorial Board
          </h2>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', marginBottom: '3rem' }} className="card">
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyItems: 'center', fontSize: '1.5rem', fontWeight: 'bold', justifyContent: 'center' }}>
              AJ
            </div>
            <div>
              <h4 style={{ fontFamily: 'var(--font-sans)', fontSize: '1.15rem', fontWeight: 'bold', margin: '0' }}>
                Ananyaa Joshi
              </h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', margin: '0 0 0.25rem 0' }}>
                Editor-in-Chief & Founder
              </p>
              <p style={{ fontSize: '0.9rem', margin: '0' }}>
                Contact: <a href="mailto:ananyaa.joshi@ilrc-archive.org" style={{ textDecoration: 'underline' }}>ananyaa.joshi@ilrc-archive.org</a>
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
