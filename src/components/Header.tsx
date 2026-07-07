'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="navbar">
      <div className="container nav-container">
        <Link href="/" className="logo">
          ILRC
        </Link>
        <nav>
          <ul className="nav-links">
            <li>
              <Link href="/" className={isActive('/') ? 'active' : ''}>
                Home
              </Link>
            </li>
            <li>
              <Link href="/digests" className={isActive('/digests') ? 'active' : ''}>
                Digests
              </Link>
            </li>
            <li>
              <Link href="/case-notes" className={isActive('/case-notes') ? 'active' : ''}>
                Case Notes
              </Link>
            </li>
            <li>
              <Link href="/about" className={isActive('/about') ? 'active' : ''}>
                About
              </Link>
            </li>
            <li>
              <Link href="/admin" className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                Editor Portal
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
