'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, HelpCircle, Calendar, MessageCircle } from 'lucide-react';
import '../page.css';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');

  const faqs: FAQItem[] = [
    {
      category: 'turnos',
      question: '¿Con cuánta anticipación debo reservar mi turno?',
      answer: 'Recomendamos reservar con al menos 48 a 72 horas de anticipación para asegurar el horario y la profesional de tu preferencia. Si necesitas atención urgente, puedes consultar turnos del día en nuestro sistema online.',
    },
    {
      category: 'turnos',
      question: '¿Puedo cancelar o reprogramar un turno?',
      answer: 'Sí, podés cancelar o reprogramar tu turno directamente desde tu panel de cliente hasta 24 horas antes del horario fijado sin penalidad. Las cancelaciones con menor anticipación pueden requerir una seña para futuras reservas.',
    },
    {
      category: 'turnos',
      question: '¿Qué sucede si llego tarde a mi turno?',
      answer: 'Otorgamos una tolerancia de 10 minutos por respeto a las pacientes siguientes. Si la demora es mayor, el tratamiento podría adaptarse al tiempo restante o reprogramarse.',
    },
    {
      category: 'tratamientos',
      question: '¿Cómo sé cuál es el tratamiento ideal para mi tipo de piel?',
      answer: 'Antes de realizar cualquier procedimiento, nuestras especialistas efectúan una evaluación diagnóstica de biotipo cutáneo, fototipo y necesidades particulares para sugerirte el protocolo más adecuado.',
    },
    {
      category: 'tratamientos',
      question: '¿Los tratamientos con aparatología son dolorosos?',
      answer: 'No. Contamos con tecnología de última generación dotada de sistemas de enfriamiento continuo y parámetros graduables que brindan una experiencia agradable y totalmente indolora.',
    },
    {
      category: 'tratamientos',
      question: '¿Puedo maquillarme después de una sesión facial?',
      answer: 'En limpiezas profundas y peelings recomendamos no utilizar maquillaje durante las primeras 24 horas para permitir la oxigenación celular y la absorción de los principios activos aplicados.',
    },
    {
      category: 'pagos',
      question: '¿Cuáles son los medios de pago aceptados?',
      answer: 'Aceptamos transferencias bancarias, tarjetas de débito y crédito en cuotas sin interés, Mercado Pago y efectivo con descuento especial en recepción.',
    },
    {
      category: 'pagos',
      question: '¿Ofrecen planes de sesiones o packs?',
      answer: 'Sí, contamos con packs promocionales de 4, 6 y 8 sesiones para tratamientos continuos como depilación definitiva, criolipólisis y radiofrecuencia con tarifas bonificadas.',
    },
  ];

  const categories = [
    { id: 'todos', label: 'Todas las preguntas' },
    { id: 'turnos', label: 'Turnos y Reservas' },
    { id: 'tratamientos', label: 'Tratamientos y Cuidado' },
    { id: 'pagos', label: 'Pagos y Promociones' },
  ];

  const filteredFaqs = selectedCategory === 'todos'
    ? faqs
    : faqs.filter((f) => f.category === selectedCategory);

  return (
    <div style={{ paddingTop: 'var(--navbar-height)' }}>
      {/* Header */}
      <section className="section" style={{ paddingBottom: 'var(--space-8)' }}>
        <div className="container text-center">
          <p className="section__subtitle">Resolvemos tus Dudas</p>
          <h1 className="heading-section">Preguntas Frecuentes</h1>
          <div className="divider" style={{ margin: 'var(--space-4) auto' }} />
          <p className="section__description" style={{ maxWidth: 640, margin: '0 auto' }}>
            Encontrá respuestas rápidas a las consultas más habituales sobre nuestros servicios, reservas y protocolos.
          </p>

          {/* Category Filter */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: 'var(--space-3)',
              marginTop: 'var(--space-6)',
            }}
          >
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setOpenIndex(null);
                }}
                style={{
                  padding: '8px 18px',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid',
                  borderColor: selectedCategory === cat.id ? 'var(--primary)' : 'var(--border-light)',
                  background: selectedCategory === cat.id ? 'var(--primary)' : 'var(--bg-card)',
                  color: selectedCategory === cat.id ? 'var(--white)' : 'var(--text-secondary)',
                  fontWeight: 500,
                  fontSize: 'var(--text-sm)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Accordion List */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container" style={{ maxWidth: 800 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {filteredFaqs.map((faq, index) => {
              const isOpen = openIndex === index;

              return (
                <div
                  key={index}
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid',
                    borderColor: isOpen ? 'var(--primary-light)' : 'var(--border-light)',
                    borderRadius: 'var(--radius-xl)',
                    overflow: 'hidden',
                    transition: 'all 0.25s ease',
                  }}
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    style={{
                      width: '100%',
                      padding: 'var(--space-5) var(--space-6)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'transparent',
                      border: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      color: isOpen ? 'var(--primary)' : 'var(--text-primary)',
                      fontWeight: 600,
                      fontSize: 'var(--text-base)',
                    }}
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      size={20}
                      style={{
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.25s ease',
                        flexShrink: 0,
                        marginLeft: 'var(--space-4)',
                        color: 'var(--text-muted)',
                      }}
                    />
                  </button>

                  {isOpen && (
                    <div
                      style={{
                        padding: '0 var(--space-6) var(--space-5) var(--space-6)',
                        color: 'var(--text-secondary)',
                        fontSize: 'var(--text-sm)',
                        lineHeight: 1.75,
                        borderTop: '1px solid var(--border-light)',
                        paddingTop: 'var(--space-4)',
                      }}
                    >
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Contact Support Box */}
          <div
            style={{
              marginTop: 'var(--space-12)',
              padding: 'var(--space-8)',
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-2xl)',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 'var(--space-3)',
            }}
          >
            <MessageCircle size={32} style={{ color: 'var(--primary)' }} />
            <h3 style={{ fontSize: 'var(--text-xl)', fontFamily: 'var(--font-heading)' }}>
              ¿Tenés otra consulta específica?
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', maxWidth: 480 }}>
              Escribinos por WhatsApp o dejanos tu mensaje y te responderemos a la brevedad.
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-4)', marginTop: 'var(--space-2)' }}>
              <Link href="/contacto" className="btn btn--secondary">
                Formulario de Contacto
              </Link>
              <Link href="/reservar" className="btn btn--primary">
                <Calendar size={16} /> Reservar Ahora
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
