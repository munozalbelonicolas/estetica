'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Menu, X, Calendar, User, LogIn } from 'lucide-react';
import './Navbar.css';

const navLinks = [
  { href: '/', label: 'Inicio' },
  { href: '/tratamientos', label: 'Tratamientos' },
  { href: '/profesionales', label: 'Profesionales' },
  { href: '/resultados', label: 'Resultados' },
  { href: '/nosotros', label: 'Nosotros' },
  { href: '/contacto', label: 'Contacto' },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();
  const isHome = pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileOpen]);

  const getDashboardLink = () => {
    if (!session?.user) return null;
    const roles = (session.user as any).roles || [];
    if (roles.includes('admin')) return '/admin';
    if (roles.includes('professional')) return '/profesional';
    return '/mi-cuenta';
  };

  const dashboardLink = getDashboardLink();

  return (
    <>
      <nav
        className={`navbar ${isScrolled ? 'navbar--scrolled' : ''} ${
          !isHome || isScrolled ? 'navbar--solid' : ''
        }`}
      >
        <div className="navbar__container container">
          {/* Logo */}
          <Link href="/" className="navbar__logo">
            <span className="navbar__logo-text">Estética</span>
            <span className="navbar__logo-accent">Studio</span>
          </Link>

          {/* Desktop Nav */}
          <div className="navbar__links">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`navbar__link ${
                  pathname === link.href ? 'navbar__link--active' : ''
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="navbar__actions">
            {session?.user ? (
              <>
                {dashboardLink && (
                  <Link href={dashboardLink} className="navbar__action-btn">
                    <User size={18} />
                    <span className="navbar__action-text">Mi Panel</span>
                  </Link>
                )}
              </>
            ) : (
              <Link href="/login" className="navbar__action-btn">
                <LogIn size={18} />
                <span className="navbar__action-text">Ingresar</span>
              </Link>
            )}
            <Link href="/reservar" className="btn btn--primary btn--sm navbar__cta">
              <Calendar size={16} />
              Reservar Turno
            </Link>
            <button
              className="navbar__hamburger"
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              aria-label={isMobileOpen ? 'Cerrar menú' : 'Abrir menú'}
            >
              {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className={`mobile-menu ${isMobileOpen ? 'mobile-menu--open' : ''}`}
      >
        <div className="mobile-menu__content">
          <div className="mobile-menu__links">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`mobile-menu__link ${
                  pathname === link.href ? 'mobile-menu__link--active' : ''
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="mobile-menu__actions">
            {session?.user ? (
              dashboardLink && (
                <Link href={dashboardLink} className="btn btn--secondary btn--full">
                  <User size={18} />
                  Mi Panel
                </Link>
              )
            ) : (
              <Link href="/login" className="btn btn--secondary btn--full">
                <LogIn size={18} />
                Iniciar Sesión
              </Link>
            )}
            <Link href="/reservar" className="btn btn--primary btn--full">
              <Calendar size={18} />
              Reservar Turno
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
