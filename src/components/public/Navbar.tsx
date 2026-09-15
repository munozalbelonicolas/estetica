'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { Menu, X, Calendar, User, LogIn, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
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
  const { user, userProfile, isAdmin, isProfessional, logout } = useAuth();
  const isHome = pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
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
    if (!user) return null;
    if (isAdmin) return '/admin';
    if (isProfessional) return '/profesional/agenda';
    return '/mi-cuenta/turnos';
  };

  const dashboardLink = getDashboardLink();
  const displayName = userProfile?.firstName || user?.displayName?.split(' ')[0] || 'Mi Cuenta';

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
            <Image
              src="/images/logo.png"
              alt="MOON Golden Beauty Estética"
              width={42}
              height={42}
              className="navbar__logo-img"
              priority
            />
            <div className="navbar__logo-brand">
              <span className="navbar__logo-text">MOON</span>
              <span className="navbar__logo-accent">Golden Beauty</span>
            </div>
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
            {user ? (
              <div className="navbar__user-menu">
                {dashboardLink && (
                  <Link href={dashboardLink} className="navbar__action-btn">
                    <User size={18} />
                    <span className="navbar__action-text">{displayName}</span>
                  </Link>
                )}
                <button
                  onClick={() => logout()}
                  className="navbar__action-btn navbar__action-btn--logout"
                  title="Cerrar sesión"
                >
                  <LogOut size={16} />
                </button>
              </div>
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
            {user ? (
              <>
                {dashboardLink && (
                  <Link href={dashboardLink} className="btn btn--secondary btn--full">
                    <User size={18} />
                    Panel ({displayName})
                  </Link>
                )}
                <button
                  onClick={() => logout()}
                  className="btn btn--outline btn--full"
                  style={{ marginTop: '0.5rem' }}
                >
                  <LogOut size={18} />
                  Cerrar Sesión
                </button>
              </>
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
