import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, ArrowLeft, Calendar, CheckCircle, ShieldCheck, Sparkles } from 'lucide-react';
import { getTreatmentBySlug } from '@/lib/firestore-service';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const treatment = await getTreatmentBySlug(slug);

  if (!treatment) {
    return {
      title: 'Tratamiento | MOON Golden Beauty',
    };
  }

  return {
    title: `${treatment.name} | MOON Golden Beauty`,
    description: treatment.description.substring(0, 160),
  };
}

export default async function TreatmentDetailPage({ params }: Props) {
  const { slug } = await params;
  const treatment = await getTreatmentBySlug(slug);

  if (!treatment) {
    notFound();
  }

  return (
    <div style={{ paddingTop: 'calc(var(--navbar-height) + var(--space-8))', paddingBottom: '4rem' }}>
      <div className="container container--narrow">
        <Link
          href="/tratamientos"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            fontSize: 'var(--text-sm)',
            color: 'var(--text-muted)',
            marginBottom: 'var(--space-6)',
          }}
        >
          <ArrowLeft size={16} />
          Volver a tratamientos
        </Link>

        <div className="badge badge--gold mb-4" style={{ display: 'inline-block', marginBottom: '1rem' }}>
          {treatment.category}
        </div>

        <h1
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'var(--text-4xl)',
            fontWeight: 700,
            marginBottom: 'var(--space-4)',
          }}
        >
          {treatment.name}
        </h1>

        {/* Hero image of treatment */}
        <div style={{ position: 'relative', height: 360, borderRadius: 'var(--radius-xl)', overflow: 'hidden', marginBottom: '2rem' }}>
          <Image
            src={treatment.image || '/images/treatment-cleanse.jpg'}
            alt={treatment.name}
            fill
            sizes="(max-width: 1200px) 100vw, 800px"
            style={{ objectFit: 'cover' }}
            priority
          />
        </div>

        {/* Quick info */}
        <div
          style={{
            display: 'flex',
            gap: 'var(--space-6)',
            padding: 'var(--space-4) var(--space-6)',
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-lg)',
            marginBottom: 'var(--space-8)',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Clock size={20} color="var(--accent-gold)" />
            <div>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', display: 'block' }}>
                Duración
              </span>
              <strong style={{ fontSize: 'var(--text-base)' }}>{treatment.duration} minutos</strong>
            </div>
          </div>

          <div>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', display: 'block' }}>
              Inversión
            </span>
            <strong style={{ fontSize: 'var(--text-xl)', color: 'var(--accent-gold)' }}>
              ${treatment.price.toLocaleString('es-AR')}
            </strong>
          </div>

          <Link href={`/reservar?treatment=${treatment.id}`} className="btn btn--primary">
            <Calendar size={18} />
            Reservar Turno
          </Link>
        </div>

        {/* Description */}
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-3)' }}>
            Descripción del Tratamiento
          </h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: 'var(--text-base)' }}>
            {treatment.description}
          </p>
        </div>

        {/* Benefits */}
        {treatment.benefits && treatment.benefits.length > 0 && (
          <div style={{ marginBottom: 'var(--space-8)' }}>
            <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-4)' }}>
              Beneficios Principales
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              {treatment.benefits.map((benefit, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '1rem',
                    background: 'var(--bg-card)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-light)',
                  }}
                >
                  <CheckCircle size={18} color="var(--accent-gold)" />
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Booking CTA */}
        <div
          style={{
            textAlign: 'center',
            padding: '3rem 2rem',
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-2xl)',
            border: '1px solid var(--border-light)',
            marginTop: '3rem',
          }}
        >
          <Sparkles size={32} color="var(--accent-gold)" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>¿Lista para vivir la experiencia MOON?</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', maxWidth: 480, margin: '0 auto 1.5rem' }}>
            Reservá tu turno online en simples pasos y empezá a disfrutar de resultados visibles y bienestar.
          </p>
          <Link href={`/reservar?treatment=${treatment.id}`} className="btn btn--primary btn--lg">
            <Calendar size={20} />
            Reservar {treatment.name}
          </Link>
        </div>
      </div>
    </div>
  );
}
