import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, ArrowRight, Sparkles, CheckCircle } from 'lucide-react';
import { getTreatments, defaultTreatments } from '@/lib/firestore-service';
import '../page.css';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Tratamientos — MOON Golden Beauty',
  description:
    'Descubrí todos nuestros tratamientos estéticos profesionales. Faciales, corporales, masajes y depilación láser definitiva.',
};

export default async function TratamientosPage() {
  const treatments = await getTreatments();

  // Group treatments by category
  const categoriesMap: Record<string, typeof treatments> = {};
  treatments.forEach((t) => {
    const cat = t.category || 'Otros';
    if (!categoriesMap[cat]) categoriesMap[cat] = [];
    categoriesMap[cat].push(t);
  });

  const categoryNames = Object.keys(categoriesMap);

  return (
    <div style={{ paddingTop: 'var(--navbar-height)' }}>
      {/* Hero */}
      <section className="section" style={{ paddingBottom: '2rem' }}>
        <div className="container">
          <div className="section__header">
            <p className="section__subtitle">Nuestros Servicios</p>
            <h1 className="heading-section">Tratamientos Estéticos</h1>
            <div className="divider" />
            <p className="section__description">
              Protocolos personalizados con tecnología de vanguardia y cosmecéutica de excelencia para realzar tu belleza y bienestar integral.
            </p>
          </div>
        </div>
      </section>

      {/* Categories with treatments */}
      {categoryNames.map((category) => (
        <section key={category} className="section" style={{ paddingTop: '2rem' }}>
          <div className="container">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <Sparkles size={24} color="var(--accent-gold)" />
              <h2 className="heading-card" style={{ fontSize: '1.75rem' }}>{category}</h2>
            </div>

            <div className="grid grid-3">
              {categoriesMap[category].map((treatment) => (
                <div key={treatment.id} className="card treatment-card">
                  <div className="treatment-card__image">
                    <Image
                      src={treatment.image || '/images/treatment-cleanse.jpg'}
                      alt={treatment.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      style={{ objectFit: 'cover' }}
                    />
                    <div className="treatment-card__duration">
                      <Clock size={14} />
                      <span>{treatment.duration} min</span>
                    </div>
                  </div>
                  <div className="card__body treatment-card__content">
                    <h3 className="treatment-card__title">{treatment.name}</h3>
                    <p className="treatment-card__description">{treatment.description}</p>

                    {treatment.benefits && (
                      <ul style={{ listStyle: 'none', padding: 0, margin: '1rem 0', fontSize: '0.85rem' }}>
                        {treatment.benefits.map((b, i) => (
                          <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', color: 'var(--text-secondary)' }}>
                            <CheckCircle size={14} color="var(--accent-gold)" />
                            {b}
                          </li>
                        ))}
                      </ul>
                    )}

                    <div className="treatment-card__footer">
                      <div className="treatment-card__price">
                        <span className="treatment-card__price-value">
                          ${treatment.price.toLocaleString('es-AR')}
                        </span>
                      </div>
                      <Link
                        href={`/reservar?treatment=${treatment.id}`}
                        className="btn btn--primary btn--sm"
                      >
                        Reservar
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* CTA Section */}
      <section className="cta section" style={{ margin: '4rem 0 0' }}>
        <div className="container cta__container">
          <div className="cta__content">
            <h2 className="cta__title">¿Tenés dudas sobre qué tratamiento elegir?</h2>
            <p className="cta__text">
              Nuestras profesionales te asesoran de forma personalizada para diseñar un plan a tu medida.
            </p>
            <div className="cta__actions">
              <Link href="/contacto" className="btn btn--primary btn--lg">
                Consultar por WhatsApp
              </Link>
              <Link href="/reservar" className="btn btn--secondary btn--lg">
                Reservar Turno
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
