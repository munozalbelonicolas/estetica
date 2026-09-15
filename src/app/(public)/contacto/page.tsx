'use client';

import { useState } from 'react';
import { MapPin, Phone, Mail, Clock, MessageSquare, Send, CheckCircle2 } from 'lucide-react';
import '../page.css';

export default function ContactoPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    treatmentInterest: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div style={{ paddingTop: 'var(--navbar-height)' }}>
      {/* Header */}
      <section className="section" style={{ paddingBottom: 'var(--space-8)' }}>
        <div className="container text-center">
          <p className="section__subtitle">Estamos Para Ayudarte</p>
          <h1 className="heading-section">Contacto & Ubicación</h1>
          <div className="divider" style={{ margin: 'var(--space-4) auto' }} />
          <p className="section__description" style={{ maxWidth: 640, margin: '0 auto' }}>
            Comunicate con nuestro equipo de atención o visitanos en nuestro centro. Te responderemos de manera personalizada.
          </p>
        </div>
      </section>

      {/* Main Grid */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
              gap: 'var(--space-10)',
            }}
          >
            {/* Contact Details & Info */}
            <div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-6)' }}>
                Información de Atención
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', marginBottom: 'var(--space-8)' }}>
                <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'flex-start' }}>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 'var(--radius-lg)',
                      background: 'var(--primary-light)',
                      color: 'var(--primary-dark)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <MapPin size={22} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: 4 }}>Dirección</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', lineHeight: 1.6 }}>
                      Av. Del Libertador 2450, Piso 3<br />
                      Recoleta / Palermo, Buenos Aires
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'flex-start' }}>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 'var(--radius-lg)',
                      background: 'var(--primary-light)',
                      color: 'var(--primary-dark)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Phone size={22} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: 4 }}>Teléfono & WhatsApp</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', lineHeight: 1.6 }}>
                      +54 9 11 4589-2340<br />
                      Atención inmediata de 9:00 a 20:00 hs.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'flex-start' }}>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 'var(--radius-lg)',
                      background: 'var(--primary-light)',
                      color: 'var(--primary-dark)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Mail size={22} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: 4 }}>Correo Electrónico</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', lineHeight: 1.6 }}>
                      turnos@esteticastudio.com<br />
                      consultas@esteticastudio.com
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'flex-start' }}>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 'var(--radius-lg)',
                      background: 'var(--primary-light)',
                      color: 'var(--primary-dark)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Clock size={22} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: 4 }}>Horarios de Atención</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', lineHeight: 1.6 }}>
                      Lunes a Viernes: 09:00 a 20:00 hs<br />
                      Sábados: 09:00 a 15:00 hs<br />
                      Domingos y Feriados: Cerrado
                    </p>
                  </div>
                </div>
              </div>

              {/* WhatsApp Direct Banner */}
              <a
                href="https://wa.me/5491145892340?text=Hola,%20quisiera%20consultar%20por%20un%20turno%20en%20Est%C3%A9tica%20Studio"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-3)',
                  padding: 'var(--space-4) var(--space-6)',
                  background: '#25D366',
                  color: '#fff',
                  borderRadius: 'var(--radius-xl)',
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: 'var(--text-base)',
                  boxShadow: '0 8px 20px rgba(37, 211, 102, 0.25)',
                  transition: 'all 0.2s ease',
                  width: 'fit-content',
                }}
              >
                <MessageSquare size={20} /> Escribirnos por WhatsApp Directo
              </a>
            </div>

            {/* Contact Form */}
            <div
              className="card"
              style={{
                padding: 'var(--space-8)',
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-2xl)',
                border: '1px solid var(--border-light)',
              }}
            >
              {submitted ? (
                <div style={{ textAlign: 'center', padding: 'var(--space-10) 0' }}>
                  <div
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: '50%',
                      background: 'var(--status-confirmed-bg)',
                      color: 'var(--accent-teal)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 'var(--space-4)',
                    }}
                  >
                    <CheckCircle2 size={36} />
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)', marginBottom: 8 }}>
                    ¡Mensaje Enviado con Éxito!
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', lineHeight: 1.6, marginBottom: 'var(--space-6)' }}>
                    Muchas gracias por contactarte. Una de nuestras coordinadoras se comunicará contigo en menos de 24 horas hábiles.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({ name: '', email: '', phone: '', message: '', treatmentInterest: '' });
                    }}
                    className="btn btn--secondary"
                  >
                    Enviar otro mensaje
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-2)' }}>
                    Envianos tu Mensaje
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-6)' }}>
                    Completá tus datos y te responderemos por WhatsApp o email.
                  </p>

                  <div className="form-group mb-4">
                    <label className="form-label">Nombre y Apellido *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Sofía Martínez"
                      className="form-input"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }} className="mb-4">
                    <div className="form-group">
                      <label className="form-label">Email *</label>
                      <input
                        type="email"
                        required
                        placeholder="tu@email.com"
                        className="form-input"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Teléfono / WhatsApp *</label>
                      <input
                        type="tel"
                        required
                        placeholder="Ej. 11 4589-2340"
                        className="form-input"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-group mb-4">
                    <label className="form-label">Tratamiento de Interés (Opcional)</label>
                    <input
                      type="text"
                      placeholder="Ej. Limpieza facial, Criolipólisis, etc."
                      className="form-input"
                      value={formData.treatmentInterest}
                      onChange={(e) => setFormData({ ...formData, treatmentInterest: e.target.value })}
                    />
                  </div>

                  <div className="form-group mb-6">
                    <label className="form-label">Mensaje o Consulta *</label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Contanos tu duda, tus horarios disponibles o lo que necesites..."
                      className="form-input"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      style={{ resize: 'vertical' }}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn--primary btn--lg"
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    <Send size={18} /> Enviar Mensaje
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
