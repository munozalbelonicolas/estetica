'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Sparkles, Calendar, Check, ArrowRight, ShieldCheck, Eye } from 'lucide-react';
import { DEMO_BEFORE_AFTER } from '@/lib/demo-data';
import '../page.css';

export default function ResultadosPage() {
  const [activeCategory, setActiveCategory] = useState<string>('todos');
  const [selectedView, setSelectedView] = useState<Record<string, 'after' | 'before'>>({});

  const categories = ['todos', 'Facial', 'Corporal'];

  const filteredItems = activeCategory === 'todos'
    ? DEMO_BEFORE_AFTER
    : DEMO_BEFORE_AFTER.filter((item) => item.category === activeCategory);

  const toggleView = (id: string, view: 'before' | 'after') => {
    setSelectedView((prev) => ({ ...prev, [id]: view }));
  };

  return (
    <div style={{ paddingTop: 'var(--navbar-height)' }}>
      {/* Header */}
      <section className="section" style={{ paddingBottom: 'var(--space-8)' }}>
        <div className="container text-center">
          <p className="section__subtitle">Evidencia Real</p>
          <h1 className="heading-section">Resultados Antes y Después</h1>
          <div className="divider" style={{ margin: 'var(--space-4) auto' }} />
          <p className="section__description" style={{ maxWidth: 680, margin: '0 auto' }}>
            Fotografías clínicas tomadas bajo las mismas condiciones de luz y ángulo. Cada caso cuenta con consentimiento informado expreso para fines demostrativos.
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
                  borderColor: activeCategory === cat ? 'var(--primary)' : 'var(--border-light)',
                  background: activeCategory === cat ? 'var(--primary)' : 'var(--bg-card)',
                  color: activeCategory === cat ? 'var(--white)' : 'var(--text-secondary)',
                  fontWeight: 500,
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

      {/* Gallery Grid */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
              gap: 'var(--space-8)',
            }}
          >
            {filteredItems.map((item) => {
              const currentView = selectedView[item.id] || 'after';

              return (
                <div
                  key={item.id}
                  className="card"
                  style={{
                    borderRadius: 'var(--radius-2xl)',
                    overflow: 'hidden',
                    border: '1px solid var(--border-light)',
                    background: 'var(--bg-card)',
                  }}
                >
                  {/* Photo Container */}
                  <div style={{ position: 'relative', height: 320, background: '#111' }}>
                    <img
                      src={currentView === 'after' ? item.afterUrl : item.beforeUrl}
                      alt={`${item.title} - ${currentView === 'after' ? 'Después' : 'Antes'}`}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'opacity 0.3s ease',
                      }}
                    />

                    {/* View Switcher Overlay Pills */}
                    <div
                      style={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        display: 'flex',
                        background: 'rgba(0, 0, 0, 0.65)',
                        backdropFilter: 'blur(8px)',
                        padding: 4,
                        borderRadius: 'var(--radius-full)',
                      }}
                    >
                      <button
                        onClick={() => toggleView(item.id, 'before')}
                        style={{
                          padding: '4px 12px',
                          borderRadius: 'var(--radius-full)',
                          border: 'none',
                          background: currentView === 'before' ? 'var(--white)' : 'transparent',
                          color: currentView === 'before' ? '#000' : 'var(--white)',
                          fontSize: 'var(--text-xs)',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        Antes
                      </button>
                      <button
                        onClick={() => toggleView(item.id, 'after')}
                        style={{
                          padding: '4px 12px',
                          borderRadius: 'var(--radius-full)',
                          border: 'none',
                          background: currentView === 'after' ? 'var(--primary)' : 'transparent',
                          color: 'var(--white)',
                          fontSize: 'var(--text-xs)',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        Después
                      </button>
                    </div>

                    {/* State Tag */}
                    <div
                      style={{
                        position: 'absolute',
                        bottom: 16,
                        left: 16,
                        background: currentView === 'after' ? 'rgba(74, 124, 89, 0.9)' : 'rgba(0, 0, 0, 0.75)',
                        color: 'var(--white)',
                        padding: '4px 12px',
                        borderRadius: 'var(--radius-md)',
                        fontSize: 'var(--text-xs)',
                        fontWeight: 600,
                        letterSpacing: '0.04em',
                      }}
                    >
                      {currentView === 'after' ? '✓ DESPUÉS DEL TRATAMIENTO' : 'ESTADO INICIAL'}
                    </div>
                  </div>

                  {/* Card Info */}
                  <div className="card__body" style={{ padding: 'var(--space-6)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span className="badge badge--gold">{item.treatmentName}</span>
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                        {item.sessions} sesiones
                      </span>
                    </div>

                    <h3 style={{ fontSize: 'var(--text-lg)', fontFamily: 'var(--font-heading)', marginBottom: 8 }}>
                      {item.title}
                    </h3>

                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 'var(--space-5)' }}>
                      {item.description}
                    </p>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingTop: 'var(--space-4)',
                        borderTop: '1px solid var(--border-light)',
                      }}
                    >
                      <span
                        style={{
                          fontSize: 'var(--text-xs)',
                          color: 'var(--accent-teal)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <ShieldCheck size={14} /> Consentimiento verificado
                      </span>

                      <Link
                        href="/reservar"
                        style={{
                          fontSize: 'var(--text-sm)',
                          fontWeight: 600,
                          color: 'var(--primary)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        Reservar <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
