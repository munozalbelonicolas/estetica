import Link from 'next/link';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import './Footer.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          {/* Brand */}
          <div className="footer__brand">
            <div className="footer__logo">
              <span className="footer__logo-text">Estética</span>
              <span className="footer__logo-accent">Studio</span>
            </div>
            <p className="footer__tagline">
              Tu bienestar, nuestra pasión. Tratamientos estéticos profesionales 
              en un ambiente de cuidado y confianza.
            </p>
            <div className="footer__social">
              <a href="#" className="footer__social-link" aria-label="Instagram">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                </svg>
              </a>
              <a href="#" className="footer__social-link" aria-label="Facebook">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer__section">
            <h4 className="footer__heading">Navegación</h4>
            <nav className="footer__nav">
              <Link href="/tratamientos">Tratamientos</Link>
              <Link href="/profesionales">Profesionales</Link>
              <Link href="/resultados">Resultados</Link>
              <Link href="/nosotros">Sobre Nosotros</Link>
              <Link href="/faq">Preguntas Frecuentes</Link>
              <Link href="/contacto">Contacto</Link>
            </nav>
          </div>

          {/* Treatments */}
          <div className="footer__section">
            <h4 className="footer__heading">Tratamientos</h4>
            <nav className="footer__nav">
              <Link href="/tratamientos#facial">Tratamientos Faciales</Link>
              <Link href="/tratamientos#corporal">Tratamientos Corporales</Link>
              <Link href="/tratamientos#depilacion">Depilación</Link>
              <Link href="/tratamientos#masajes">Masajes</Link>
            </nav>
          </div>

          {/* Contact */}
          <div className="footer__section">
            <h4 className="footer__heading">Contacto</h4>
            <div className="footer__contact">
              <div className="footer__contact-item">
                <MapPin size={16} />
                <span>Av. Principal 1234, Ciudad</span>
              </div>
              <div className="footer__contact-item">
                <Phone size={16} />
                <span>+54 11 1234-5678</span>
              </div>
              <div className="footer__contact-item">
                <Mail size={16} />
                <span>info@esteticastudio.com</span>
              </div>
              <div className="footer__contact-item">
                <Clock size={16} />
                <span>Lun - Vie: 9:00 - 20:00</span>
              </div>
              <div className="footer__contact-item">
                <Clock size={16} />
                <span>Sáb: 9:00 - 14:00</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="footer__bottom">
          <p>© {currentYear} Estética Studio. Todos los derechos reservados.</p>
          <div className="footer__bottom-links">
            <Link href="/privacidad">Política de Privacidad</Link>
            <Link href="/terminos">Términos y Condiciones</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
