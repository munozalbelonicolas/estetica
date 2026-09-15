import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { Clock, ArrowLeft, Calendar, CheckCircle, AlertTriangle, ShieldCheck } from 'lucide-react';
import { DEMO_CATEGORIES, DemoTreatment } from '@/lib/demo-data';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ slug: string }>;
}

function findDemoTreatment(slug: string): DemoTreatment | null {
  for (const cat of DEMO_CATEGORIES) {
    const found = cat.treatments.find((t) => t.slug === slug);
    if (found) {
      return {
        ...found,
        category: { name: cat.name, slug: cat.slug },
        professionalTreatments: [
          {
            professional: {
              id: 'prof-1',
              user: { firstName: 'Valentina', lastName: 'Rossi' },
              specialties: ['Cosmiatría Facial', 'Peelings Químicos'],
            },
          },
          {
            professional: {
              id: 'prof-2',
              user: { firstName: 'Camila', lastName: 'Méndez' },
              specialties: ['Modelado Corporal'],
            },
          },
        ],
      };
    }
  }
  return null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  let treatmentName = 'Tratamiento';
  let treatmentDesc = 'Tratamiento profesional en Estética Studio';

  try {
    const dbTreatment = await prisma.treatment.findUnique({
      where: { slug },
      select: { name: true, description: true },
    });
    if (dbTreatment) {
      treatmentName = dbTreatment.name;
      treatmentDesc = dbTreatment.description?.substring(0, 160) || treatmentDesc;
    } else {
      const demo = findDemoTreatment(slug);
      if (demo) {
        treatmentName = demo.name;
        treatmentDesc = demo.description.substring(0, 160);
      }
    }
  } catch {
    const demo = findDemoTreatment(slug);
    if (demo) {
      treatmentName = demo.name;
      treatmentDesc = demo.description.substring(0, 160);
    }
  }

  return {
    title: `${treatmentName} | Estética Studio`,
    description: treatmentDesc,
  };
}

export default async function TreatmentDetailPage({ params }: Props) {
  const { slug } = await params;
  let treatment: any = null;

  try {
    const dbTreatment = await prisma.treatment.findUnique({
      where: { slug, isActive: true },
      include: {
        category: true,
        professionalTreatments: {
          include: {
            professional: {
              include: { user: true },
            },
          },
        },
      },
    });
    if (dbTreatment) {
      treatment = dbTreatment;
    } else {
      treatment = findDemoTreatment(slug);
    }
  } catch {
    treatment = findDemoTreatment(slug);
  }

  if (!treatment) {
    notFound();
  }

  return (
    <div style={{ paddingTop: 'calc(var(--navbar-height) + var(--space-8))' }}>
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

        {treatment.category?.name && (
          <div className="badge badge--gold mb-4">{treatment.category.name}</div>
        )}

        <h1
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'var(--text-4xl)',
            fontWeight: 400,
            marginBottom: 'var(--space-4)',
          }}
        >
          {treatment.name}
        </h1>

        <div
          style={{
            display: 'flex',
            gap: 'var(--space-6)',
            marginBottom: 'var(--space-8)',
            flexWrap: 'wrap',
          }}
        >
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              color: 'var(--text-secondary)',
              fontSize: 'var(--text-sm)',
            }}
          >
            <Clock size={16} />
            {treatment.durationMinutes} minutos
          </span>
          {treatment.showPrice && treatment.price && (
            <span
              style={{
                fontWeight: 600,
                color: 'var(--accent-gold)',
                fontSize: 'var(--text-lg)',
              }}
            >
              ${treatment.price.toLocaleString('es-AR')}
            </span>
          )}
        </div>

        {/* Treatment Image if available */}
        {treatment.imageUrl && (
          <div
            style={{
              borderRadius: 'var(--radius-xl)',
              overflow: 'hidden',
              marginBottom: 'var(--space-8)',
              maxHeight: 380,
            }}
          >
            <img
              src={treatment.imageUrl}
              alt={treatment.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        )}

        {/* Description */}
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <h2
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'var(--text-xl)',
              marginBottom: 'var(--space-3)',
            }}
          >
            Descripción del Tratamiento
          </h2>
          <p
            style={{
              color: 'var(--text-secondary)',
              lineHeight: 1.8,
              fontSize: 'var(--text-base)',
            }}
          >
            {treatment.description}
          </p>
        </div>

        {/* Preparation / Indications */}
        {treatment.preparationInstructions && (
          <div
            style={{
              padding: 'var(--space-5)',
              background: 'var(--status-confirmed-bg)',
              borderRadius: 'var(--radius-lg)',
              marginBottom: 'var(--space-4)',
            }}
          >
            <h3
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                fontSize: 'var(--text-sm)',
                fontWeight: 600,
                color: 'var(--accent-teal)',
                marginBottom: 'var(--space-2)',
              }}
            >
              <CheckCircle size={16} />
              Preparación e Indicaciones Previas
            </h3>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
              {treatment.preparationInstructions}
            </p>
          </div>
        )}

        {/* Aftercare */}
        {treatment.aftercareInstructions && (
          <div
            style={{
              padding: 'var(--space-5)',
              background: 'rgba(212, 165, 165, 0.15)',
              borderRadius: 'var(--radius-lg)',
              marginBottom: 'var(--space-4)',
            }}
          >
            <h3
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                fontSize: 'var(--text-sm)',
                fontWeight: 600,
                color: 'var(--accent-rose)',
                marginBottom: 'var(--space-2)',
              }}
            >
              <ShieldCheck size={16} />
              Cuidados Posteriores
            </h3>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
              {treatment.aftercareInstructions}
            </p>
          </div>
        )}

        {/* Contraindications */}
        {treatment.contraindications && (
          <div
            style={{
              padding: 'var(--space-5)',
              background: 'var(--status-pending-bg)',
              borderRadius: 'var(--radius-lg)',
              marginBottom: 'var(--space-8)',
            }}
          >
            <h3
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                fontSize: 'var(--text-sm)',
                fontWeight: 600,
                color: 'var(--status-pending)',
                marginBottom: 'var(--space-2)',
              }}
            >
              <AlertTriangle size={16} />
              Contraindicaciones
            </h3>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
              {treatment.contraindications}
            </p>
          </div>
        )}

        {/* Professionals */}
        {treatment.professionalTreatments && treatment.professionalTreatments.length > 0 && (
          <div style={{ marginBottom: 'var(--space-8)' }}>
            <h3
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'var(--text-xl)',
                marginBottom: 'var(--space-4)',
              }}
            >
              Profesionales que realizan este tratamiento
            </h3>
            <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
              {treatment.professionalTreatments.map((pt: any, index: number) => (
                <div
                  key={pt.id || index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-3)',
                    padding: 'var(--space-3) var(--space-4)',
                    background: 'var(--bg-secondary)',
                    borderRadius: 'var(--radius-lg)',
                  }}
                >
                  <div
                    className="avatar avatar-placeholder"
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      background: 'var(--primary-light)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 600,
                      color: 'var(--primary-dark)',
                    }}
                  >
                    {pt.professional.user.firstName.charAt(0)}
                  </div>
                  <span style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>
                    {pt.professional.user.firstName} {pt.professional.user.lastName}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div
          style={{
            textAlign: 'center',
            padding: 'var(--space-10)',
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-xl)',
            marginBottom: 'var(--space-16)',
          }}
        >
          <h3
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'var(--text-2xl)',
              marginBottom: 'var(--space-3)',
            }}
          >
            ¿Querés reservar este tratamiento?
          </h3>
          <p
            style={{
              color: 'var(--text-secondary)',
              marginBottom: 'var(--space-6)',
              fontSize: 'var(--text-sm)',
            }}
          >
            Elegí tu profesional favorita y reservá un turno en pocos pasos.
          </p>
          <Link href={`/reservar?treatment=${treatment.id}`} className="btn btn--primary btn--lg">
            <Calendar size={20} />
            Reservar Turno
          </Link>
        </div>
      </div>
    </div>
  );
}
