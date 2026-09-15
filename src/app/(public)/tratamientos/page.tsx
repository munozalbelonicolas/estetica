import { Metadata } from 'next';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { Clock, ArrowRight, Sparkles } from 'lucide-react';
import { DEMO_CATEGORIES, DemoCategory } from '@/lib/demo-data';
import '../page.css';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Tratamientos',
  description: 'Descubrí todos nuestros tratamientos estéticos profesionales. Faciales, corporales, masajes y más.',
};

export default async function TratamientosPage() {
  let categories: DemoCategory[] = [];

  try {
    const dbCategories = await prisma.treatmentCategory.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        treatments: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (dbCategories && dbCategories.length > 0) {
      categories = dbCategories as unknown as DemoCategory[];
    } else {
      categories = DEMO_CATEGORIES;
    }
  } catch {
    categories = DEMO_CATEGORIES;
  }

  return (
    <div style={{ paddingTop: 'var(--navbar-height)' }}>
      {/* Hero */}
      <section className="section" style={{ paddingBottom: 0 }}>
        <div className="container">
          <div className="section__header">
            <p className="section__subtitle">Nuestros Servicios</p>
            <h1 className="heading-section">Tratamientos</h1>
            <div className="divider" />
            <p className="section__description">
              Conocé todos los tratamientos que ofrecemos. Cada uno diseñado
              para brindarte los mejores resultados con tecnología de vanguardia y cuidado personalizado.
            </p>
          </div>
        </div>
      </section>

      {/* Categories with treatments */}
      {categories.map((category) => (
        <section
          key={category.id}
          id={category.slug}
          className="section"
          style={{ paddingTop: 'var(--space-8)' }}
        >
          <div className="container">
            <h2 className="heading-section mb-2">{category.name}</h2>
            {category.description && (
              <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-6)' }}>
                {category.description}
              </p>
            )}
            <div className="treatments-grid">
              {category.treatments.map((treatment) => (
                <Link
                  key={treatment.id}
                  href={`/tratamientos/${treatment.slug}`}
                  className="treatment-card card card--interactive"
                >
                  <div className="treatment-card__image">
                    {treatment.imageUrl ? (
                      <img
                        src={treatment.imageUrl}
                        alt={treatment.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div className="treatment-card__image-placeholder">
                        <Sparkles size={32} />
                      </div>
                    )}
                    <span className="treatment-card__category">
                      {category.name}
                    </span>
                  </div>
                  <div className="card__body">
                    <h3 className="card__title">{treatment.name}</h3>
                    <p className="card__text">
                      {treatment.description?.substring(0, 120)}
                      {treatment.description && treatment.description.length > 120 ? '...' : ''}
                    </p>
                    <div className="treatment-card__meta">
                      <span className="treatment-card__duration">
                        <Clock size={14} />
                        {treatment.durationMinutes} min
                      </span>
                      {treatment.showPrice && treatment.price && (
                        <span style={{ fontWeight: 600, color: 'var(--accent-gold)' }}>
                          ${treatment.price.toLocaleString('es-AR')}
                        </span>
                      )}
                      <span className="treatment-card__link">
                        Ver más <ArrowRight size={14} />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ))}

      {categories.length === 0 && (
        <section className="section">
          <div className="container text-center">
            <Sparkles size={48} style={{ color: 'var(--text-muted)', margin: '0 auto var(--space-4)' }} />
            <p style={{ color: 'var(--text-muted)' }}>
              Próximamente publicaremos nuestros tratamientos.
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
