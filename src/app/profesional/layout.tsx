import { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import { Calendar, Users, FileText, Camera, Clock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Portal Profesional — Estética Studio',
};

export default function ProfesionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main
        style={{
          paddingTop: 'calc(var(--navbar-height) + var(--space-6))',
          minHeight: '85vh',
          background: 'var(--bg-secondary)',
          paddingBottom: 'var(--space-16)',
        }}
      >
        <div className="container">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 'var(--space-6)',
              flexWrap: 'wrap',
              gap: 'var(--space-4)',
              background: 'var(--bg-card)',
              padding: 'var(--space-4) var(--space-6)',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border-light)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--primary-light)',
                  color: 'var(--primary-dark)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                }}
              >
                PRO
              </div>
              <div>
                <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 600 }}>Portal Profesional</h2>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                  Agenda compartida, historias estéticas y seguimiento clínico
                </p>
              </div>
            </div>

            {/* Quick Navigation Tabs */}
            <nav style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
              <Link
                href="/profesional/agenda"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 600,
                  background: 'var(--primary-bg)',
                  color: 'var(--primary)',
                  textDecoration: 'none',
                }}
              >
                <Calendar size={14} /> Agenda Compartida
              </Link>
              <Link
                href="/profesional/pacientes"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 600,
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-secondary)',
                  textDecoration: 'none',
                }}
              >
                <Users size={14} /> Fichas de Pacientes
              </Link>
            </nav>
          </div>

          <div>{children}</div>
        </div>
      </main>
      <Footer />
    </>
  );
}
