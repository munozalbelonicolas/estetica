'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Mail, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import './auth.css';

export default function RecuperarPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await resetPassword(email);
      setSent(true);
    } catch (err: any) {
      console.error('Password reset error:', err);
      if (err?.code === 'auth/user-not-found') {
        setError('No encontramos ninguna cuenta asociada a este correo electrónico.');
      } else if (err?.code === 'auth/invalid-email') {
        setError('El formato de correo no es válido.');
      } else {
        setError('Ocurrió un error al enviar el correo. Intentá nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-page__side">
        <div className="auth-page__side-content">
          <div className="auth-page__brand">
            <Image
              src="/images/logo.png"
              alt="MOON Golden Beauty"
              width={64}
              height={64}
              className="auth-page__brand-logo"
            />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span className="auth-page__brand-text">MOON</span>
              <span className="auth-page__brand-accent">Golden Beauty</span>
            </div>
          </div>
          <p className="auth-page__side-tagline">
            Recuperá el acceso a tu cuenta de forma rápida y segura.
          </p>
        </div>
      </div>
      <div className="auth-page__form-container">
        <div className="auth-page__form-wrapper">
          <Link href="/login" className="auth-page__back">
            <ArrowLeft size={18} />
            Volver al inicio de sesión
          </Link>

          <div className="auth-page__header">
            <h1 className="auth-page__title">Recuperar contraseña</h1>
            <p className="auth-page__subtitle">
              Ingresá tu email registrado y te enviaremos un enlace seguro para restablecer tu contraseña
            </p>
          </div>

          {sent ? (
            <div
              style={{
                background: 'rgba(52, 168, 83, 0.1)',
                border: '1px solid #34A853',
                borderRadius: 'var(--radius-md)',
                padding: '1.5rem',
                textAlign: 'center',
                color: 'var(--text-primary)',
              }}
            >
              <CheckCircle2 size={40} color="#34A853" style={{ margin: '0 auto 0.75rem' }} />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                ¡Correo de recuperación enviado!
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                Revisá tu bandeja de entrada en <strong>{email}</strong> (incluyendo la carpeta de spam o correo no deseado) y seguí las instrucciones.
              </p>
              <Link href="/login" className="btn btn--primary btn--full">
                Ir a Iniciar Sesión
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="auth-form">
              {error && <div className="auth-form__error">{error}</div>}

              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email registrado
                </label>
                <input
                  id="email"
                  type="email"
                  className="form-input"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>

              <button
                type="submit"
                className="btn btn--primary btn--full btn--lg"
                disabled={loading}
              >
                {loading ? (
                  <span className="spinner" />
                ) : (
                  <>
                    <Mail size={18} />
                    Enviar enlace de recuperación
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
