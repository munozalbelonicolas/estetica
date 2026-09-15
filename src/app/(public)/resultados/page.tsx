'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import '../page.css';

interface CaseItem {
  id: string;
  title: string;
  category: string;
  sessions: string;
  description: string;
  beforeImage: string;
  afterImage: string;
  patientAge: string;
  treatmentName: string;
}

const CLINICAL_CASES: CaseItem[] = [
  {
    id: 'case-1',
    title: 'Limpieza Facial Profunda & Microdermoabrasión',
    category: 'Facial',
    sessions: '3 sesiones',
    description: 'Reducción notable de poros dilatados, extracción de comedones y recuperación de la luminosidad natural de la piel.',
    beforeImage: '/images/treatment-cleanse.jpg',
    afterImage: '/images/treatment-cleanse.jpg',
    patientAge: '32 años',
    treatmentName: 'Limpieza Facial Profunda',
  },
  {
    id: 'case-2',
    title: 'Radiofrecuencia Tripolar & Lifting Facial',
    category: 'Facial',
    sessions: '6 sesiones',
    description: 'Reafirmación del óvalo facial, notable mejoría en tonicidad y atenuación de surcos nasogenianos.',
    beforeImage: '/images/treatment-radiofrequency.jpg',
    afterImage: '/images/treatment-radiofrequency.jpg',
    patientAge: '45 años',
    treatmentName: 'Radiofrecuencia Facial Tripolar',
  },
  {
    id: 'case-3',
    title: 'Peeling Químico Renovador & Despigmentante',
    category: 'Facial',
    sessions: '4 sesiones',
    description: 'Aclaramiento de manchas solares (melasma), textura uniforme y rejuvenecimiento de la capa epidérmica.',
    beforeImage: '/images/treatment-peeling.jpg',
    afterImage: '/images/treatment-peeling.jpg',
    patientAge: '39 años',
    treatmentName: 'Peeling Químico Médico',
  },
  {
    id: 'case-4',
    title: 'VelaShape & Modelado Corporal',
    category: 'Corporal',
    sessions: '8 sesiones',
    description: 'Disminución de 4 cm en contorno de flancos y abdomen, mejorando notablemente el aspecto de celulitis.',
    beforeImage: '/images/treatment-massage.jpg',
    afterImage: '/images/treatment-massage.jpg',
    patientAge: '29 años',
    treatmentName: 'VelaShape & Modelación Corporal',
  },
];

export default function ResultadosPage() {
  const [activeCategory, setActiveCategory] = useState<string>('todos');

  const categories = ['todos', 'Facial', 'Corporal'];

  const filteredItems = activeCategory === 'todos'
    ? CLINICAL_CASES
    : CLINICAL_CASES.filter((item) => item.category === activeCategory);

  return (
    <div style={{ paddingTop: 'var(--navbar-height)' }}>
      {/* Header */}
      <section className="section" style={{ paddingBottom: 'var(--space-8)' }}>
        <div className="container text-center">
          <p className="section__subtitle">Evidencia Real</p>
          <h1 className="heading-section">Resultados Reales</h1>
          <div className="divider" style={{ margin: 'var(--space-4) auto' }} />
          <p className="section__description" style={{ maxWidth: 680, margin: '0 auto' }}>
            Resultados clínicos comprobados en nuestras pacientes. Cada protocolo es personalizado por nuestras especialistas matriculadas.
          </p>

          {/* Category filter pills */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 'var(--space-3)',
              marginTop: 'var(--space-6)',
            }}
          >
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: '8px 20px',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid',
                  borderColor: activeCategory === cat ? 'var(--accent-gold)' : 'var(--border-light)',
                  background: activeCategory === cat ? 'var(--accent-gold)' : 'var(--bg-card)',
                  color: activeCategory === cat ? 'var(--text-white)' : 'var(--text-secondary)',
                  fontWeight: 600,
                  fontSize: 'var(--text-sm)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textTransform: 'capitalize',
                }}
              >
                {cat === 'todos' ? 'Todos los tratamientos' : cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Grid of Results */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
              gap: 'var(--space-8)',
            }}
          >
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="card card--interactive"
                style={{
                  borderRadius: 'var(--radius-2xl)',
                  overflow: 'hidden',
                  border: '1px solid var(--border-light)',
                  background: 'var(--bg-card)',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div style={{ height: 260, position: 'relative', overflow: 'hidden' }}>
                  <Image
                    src={item.afterImage}
                    alt={item.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    style={{ objectFit: 'cover' }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      top: '1rem',
                      right: '1rem',
                      background: 'rgba(29, 27, 24, 0.85)',
                      backdropFilter: 'blur(8px)',
                      padding: '4px 12px',
                      borderRadius: 'var(--radius-full)',
                      color: 'var(--accent-gold)',
                      fontSize: 'var(--text-xs)',
                      fontWeight: 600,
                    }}
                  >
                    {item.sessions}
                  </div>
                </div>

                <div className="card__body" style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--accent-gold)', fontWeight: 600, textTransform: 'uppercase' }}>
                      {item.category} • {item.patientAge}
                    </span>
                  </div>

                  <h3 style={{ fontSize: 'var(--text-lg)', fontFamily: 'var(--font-heading)', marginBottom: '0.75rem' }}>
                    {item.title}
                  </h3>

                  <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', lineHeight: 1.6, marginBottom: '1.5rem', flex: 1 }}>
                    {item.description}
                  </p>

                  <Link href="/reservar" className="btn btn--primary" style={{ width: '100%', justifyContent: 'center' }}>
                    <Calendar size={16} /> Reservar este tratamiento
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
