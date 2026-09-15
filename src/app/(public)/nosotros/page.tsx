import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, Shield, Heart, Award, CheckCircle2, ArrowRight, Clock, MapPin } from 'lucide-react';
import '../page.css';

export const metadata: Metadata = {
  title: 'Sobre Nosotros — MOON Golden Beauty',
  description: 'Conocé nuestra historia, filosofía de bienestar integral y estándares de excelencia médica en estética.',
};

export default function NosotrosPage() {
  const pillars = [
    {
      icon: <Shield size={28} />,
      title: 'Bioseguridad & Normas Médicas',
      description: 'Protocolos estrictos de esterilización, material descartable y consultorios habilitados con los más altos estándares sanitarios.',
    },
    {
      icon: <Award size={28} />,
      title: 'Tecnología de Punta Certificada',
      description: 'Equipamiento original con aprobaciones internacionales (FDA y ANMAT) para garantizar resultados efectivos y sin dolor.',
    },
    {
      icon: <Heart size={28} />,
      title: 'Cuidado Humano & Empatía',
      description: 'Un trato cálido, dedicado y respetuoso de tus tiempos. Diseñamos planes individuales para resaltar tu belleza natural sin transformarte.',
    },
  ];

  return (
    <div style={{ paddingTop: 'var(--navbar-height)' }}>
      {/* Hero */}
      <section className="section" style={{ paddingBottom: 'var(--space-8)' }}>
        <div className="container text-center">
          <p className="section__subtitle">Nuestra Filosofía</p>
          <h1 className="heading-section">Belleza Consciente, Ciencia y Calidez</h1>
          <div className="divider" style={{ margin: 'var(--space-4) auto' }} />
          <p className="section__description" style={{ maxWidth: 720, margin: '0 auto' }}>
            Nacimos con el propósito de crear un espacio donde la ciencia dermocosmética y el bienestar convergen para cuidar tu piel y brindarte momentos de renovación profunda.
          </p>
        </div>
      </section>

      {/* Main Story & Values */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: 'var(--space-12)',
              alignItems: 'center',
              marginBottom: 'var(--space-16)',
            }}
          >
            <div>
              <span className="badge badge--gold mb-3">Nuestra Esencia</span>
              <h2 className="heading-section mb-4" style={{ fontSize: 'var(--text-3xl)', textAlign: 'left' }}>
                Un santuario pensado para tu armonía y cuidado personal
              </h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 'var(--space-4)' }}>
                En Estética Studio entendemos que el cuidado de la piel trasciende lo estético: es un acto de amor propio y salud. Cada detalle de nuestras instalaciones, desde la acústica y la iluminación hasta los aromas orgánicos, fue concebido para que desconectes del estrés cotidiano.
              </p>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 'var(--space-6)' }}>
                Contamos con consultorios independientes climatizados, equipamiento de última generación y un equipo interdisciplinario que se capacita permanentemente para acercarte las innovaciones mundiales en rejuvenecimiento y modelado.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {['Diagnóstico cutáneo computarizado previo', 'Planes de tratamiento 100% personalizados', 'Seguimiento fotográfico continuo de evolución'].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', color: 'var(--text-primary)', fontWeight: 500 }}>
                    <CheckCircle2 size={18} style={{ color: 'var(--accent-teal)' }} />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ position: 'relative' }}>
              <div
                style={{
                  borderRadius: 'var(--radius-2xl)',
                  overflow: 'hidden',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                }}
              >
                <Image
                  src="/images/about-main.jpg"
                  alt="Instalaciones de MOON Golden Beauty"
                  width={800}
                  height={420}
                  style={{ width: '100%', height: 420, objectFit: 'cover' }}
                />
              </div>
            </div>
          </div>

          {/* 3 Pillars */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 'var(--space-6)',
            }}
          >
            {pillars.map((pillar, i) => (
              <div
                key={i}
                className="card"
                style={{
                  padding: 'var(--space-8)',
                  background: 'var(--bg-card)',
                  borderRadius: 'var(--radius-xl)',
                  border: '1px solid var(--border-light)',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    background: 'var(--primary-light)',
                    color: 'var(--primary-dark)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 'var(--space-4)',
                  }}
                >
                  {pillar.icon}
                </div>
                <h3 style={{ fontSize: 'var(--text-lg)', fontFamily: 'var(--font-heading)', marginBottom: 'var(--space-2)' }}>
                  {pillar.title}
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', lineHeight: 1.7 }}>
                  {pillar.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section" style={{ background: 'var(--bg-secondary)', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: 640 }}>
          <h2 className="heading-section mb-3">Viví la experiencia Estética Studio</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-6)', lineHeight: 1.7 }}>
            Agenda tu consulta diagnóstica inicial sin cargo con una de nuestras profesionales.
          </p>
          <Link href="/reservar" className="btn btn--primary btn--lg">
            <Sparkles size={18} /> Reservar mi Primera Consulta
          </Link>
        </div>
      </section>
    </div>
  );
}
