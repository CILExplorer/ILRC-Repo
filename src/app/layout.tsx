import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'International Law Research Collective (ILRC)',
  description: 'Practitioner-oriented international law and arbitration digest, source verified analysis, and case commentary.',
  keywords: 'international law, arbitration, SIAC, ICSID, WIPO, ICJ, treaties, case notes',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
