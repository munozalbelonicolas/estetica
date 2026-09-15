import { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import { Calendar, User, Clock, FileText, ChevronRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Mi Cuenta — Estética Studio',
};

export default function MiCuentaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: 'calc(var(--navbar-height) + var(--space-8))', minHeight: '80vh', background: 'var(--bg-secondary)', paddingBottom: 'var(--space-16)' }}>
        <div className="container">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              fontSize: 'var(--text-sm)',
              color: 'var(--text-muted)',
              marginBottom: 'var(--space-6)',
            }}
          >
            <Link href="/" style={{ color: 'var(--text-muted)' }}>Inicio</Link>
            <ChevronRight size={14} />
            <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Mi Cuenta</span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '260px 1fr',
              gap: 'var(--space-8)',
              alignItems: 'start',
            }}
          >
            {/* Sidebar Navigation */}
            <aside
              style={{
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--border-light)',
                padding: 'var(--space-6)',
              }}
            >
              <h2 style={{ fontSize: 'var(--text-base)', fontFamily: 'var(--font-heading)', marginBottom: 'var(--space-4)', paddingBottom: 'var(--space-3)', borderBottom: '1px solid var(--border-light)' }}>
                Portal de Cliente
              </h2>
              <nav style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                <Link
                  href="/mi-cuenta/turnos"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-3)',
                    padding: 'var(--space-3) var(--space-4)',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--primary-bg)',
                    color: 'var(--primary)',
                    fontWeight: 600,
                    fontSize: 'var(--text-sm)',
                  }}
                >
                  <Calendar size={18} /> Mis Turnos
                </Link>
                <Link
                  href="/reservar"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-3)',
                    padding: 'var(--space-3) var(--space-4)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-secondary)',
                    fontWeight: 500,
                    fontSize: 'var(--text-sm)',
                  }}
                >
                  <Clock size={18} /> Reservar Nuevo Turno
                </Link>
              </nav>
            </aside>

            {/* Main Content Area */}
            <div>{children}</div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
