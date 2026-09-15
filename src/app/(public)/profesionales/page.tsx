import { Metadata } from 'next';
import Link from 'next/link';
import { Sparkles, Calendar, Award, Heart, CheckCircle2 } from 'lucide-react';
import { DEMO_PROFESSIONALS } from '@/lib/demo-data';
import prisma from '@/lib/prisma';
import '../page.css';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Nuestro Equipo de Profesionales',
  description: 'Conocé a las especialistas certificadas en salud y estética que cuidarán de tu piel y bienestar.',
};

interface ProfessionalItem {
  id: string;
  user: {
    firstName: string;
    lastName: string;
    email?: string;
    avatarUrl?: string | null;
  };
  bio?: string | null;
  specialties: string[];
  licenseNumber?: string;
}

export default async function ProfesionalesPage() {
  let professionals: ProfessionalItem[] = DEMO_PROFESSIONALS;

  try {
    const dbProfessionals = await prisma.professional.findMany({
      where: { isActive: true },
      include: {
        user: {
          select: { firstName: true, lastName: true, email: true, avatarUrl: true },
        },
      },
    });

    if (dbProfessionals && dbProfessionals.length > 0) {
      professionals = dbProfessionals.map((p) => ({
        id: p.id,
        user: p.user,
        bio: p.bio,
        specialties: p.specialties || [],
        licenseNumber: (p as any).licenseNumber || undefined,
      }));
    }
  } catch {
    // fallback to demo professionals
  }

  return (
    <div style={{ paddingTop: 'var(--navbar-height)' }}>
      {/* Header */}
      <section className="section" style={{ paddingBottom: 'var(--space-8)' }}>
        <div className="container text-center">
          <p className="section__subtitle">Excelencia & Calidez</p>
          <h1 className="heading-section">Nuestro Equipo Profesional</h1>
          <div className="divider" style={{ margin: 'var(--space-4) auto' }} />
          <p className="section__description" style={{ maxWidth: 640, margin: '0 auto' }}>
            Cada tratamiento es realizado por profesionales matriculadas con formación universitaria continua y vocación de servicio.
          </p>
        </div>
      </section>

      {/* Professionals Grid */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: 'var(--space-8)',
            }}
          >
            {professionals.map((prof) => (
              <div
                key={prof.id}
                className="card card--interactive"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 'var(--radius-2xl)',
                  overflow: 'hidden',
                  border: '1px solid var(--border-light)',
                  background: 'var(--bg-card)',
                }}
              >
                <div style={{ height: 280, position: 'relative', overflow: 'hidden' }}>
                  <img
                    src={prof.user.avatarUrl || 'https://images.unsplash.com/photo-1594824813581-c7c427382f6e?auto=format&fit=crop&w=600&q=80'}
                    alt={`${prof.user.firstName} ${prof.user.lastName}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      padding: 'var(--space-4)',
                      background: 'linear-gradient(to top, rgba(29, 27, 24, 0.85), transparent)',
                      color: 'var(--white)',
                    }}
                  >
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 'var(--space-1)',
                        fontSize: 'var(--text-xs)',
                        color: 'var(--accent-gold-light)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        fontWeight: 600,
                      }}
                    >
                      <Award size={14} /> Especialista Certificada
                    </span>
                    <h3 style={{ fontSize: 'var(--text-xl)', fontFamily: 'var(--font-heading)', color: 'var(--white)', marginTop: 4 }}>
                      {prof.user.firstName} {prof.user.lastName}
                    </h3>
                    {prof.licenseNumber && (
                      <p style={{ fontSize: 'var(--text-xs)', opacity: 0.85 }}>Mat. {prof.licenseNumber}</p>
                    )}
                  </div>
                </div>

                <div className="card__body" style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: 'var(--space-6)' }}>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', lineHeight: 1.7, marginBottom: 'var(--space-4)', flex: 1 }}>
                    {prof.bio}
                  </p>

                  <div style={{ marginBottom: 'var(--space-6)' }}>
                    <p style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-2)' }}>
                      Especialidades:
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                      {prof.specialties.map((spec, i) => (
                        <span
                          key={i}
                          style={{
                            padding: '4px 10px',
                            background: 'var(--primary-bg)',
                            color: 'var(--primary-dark)',
                            borderRadius: 'var(--radius-full)',
                            fontSize: 'var(--text-xs)',
                            fontWeight: 500,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          <CheckCircle2 size={12} /> {spec}
                        </span>
                      ))}
                    </div>
                  </div>

                  <Link
                    href={`/reservar?professional=${prof.id}`}
                    className="btn btn--primary"
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    <Calendar size={16} /> Reservar Turno con {prof.user.firstName}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quality Commitment Section */}
      <section className="section" style={{ background: 'var(--bg-secondary)' }}>
        <div className="container">
          <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: 'var(--primary-light)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary-dark)',
                marginBottom: 'var(--space-4)',
              }}
            >
              <Heart size={28} />
            </div>
            <h2 className="heading-section mb-3">Atención Segura y Personalizada</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: 'var(--text-base)' }}>
              En nuestro centro no creemos en recetas estándar. Evaluamos tu biotipo cutáneo, antecedentes y expectativas en una consulta diagnóstica inicial para diseñar un plan a tu medida con aparatología médica de última generación.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
