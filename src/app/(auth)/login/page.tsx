'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, LogIn, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import './auth.css';

export default function LoginPage() {
  const router = useRouter();
  const { loginWithEmail, loginWithGoogle, user, resendVerificationEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [unverifiedAlert, setUnverifiedAlert] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const redirectByRole = (roles: string[]) => {
    if (roles.includes('admin')) {
      router.push('/admin');
    } else if (roles.includes('professional')) {
      router.push('/profesional/agenda');
    } else {
      router.push('/mi-cuenta/turnos');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setUnverifiedAlert(false);
    setLoading(true);

    try {
      const profile = await loginWithEmail(email, password);
      if (profile) {
        redirectByRole(profile.roles || ['client']);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      if (err?.message?.includes('bloqueada') || err?.message?.includes('suspendida')) {
        setError(err.message);
      } else if (err?.code === 'auth/invalid-credential' || err?.code === 'auth/user-not-found' || err?.code === 'auth/wrong-password') {
        setError('Email o contraseña incorrectos.');
      } else if (err?.code === 'auth/too-many-requests') {
        setError('Demasiados intentos fallidos. Por favor, intentá más tarde o recuperá tu contraseña.');
      } else {
        setError(err?.message || 'Ocurrió un error al iniciar sesión. Verificá tus credenciales.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      const profile = await loginWithGoogle();
      if (profile) {
        redirectByRole(profile.roles || ['client']);
      }
    } catch (err: any) {
      console.error('Google login error:', err);
      if (err?.code !== 'auth/popup-closed-by-user') {
        setError('Error al iniciar sesión con Google. Intentá nuevamente.');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      await resendVerificationEmail();
      setVerificationSent(true);
    } catch (e) {
      console.error('Error resending email:', e);
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
              width={140}
              height={140}
              className="auth-page__brand-logo"
              priority
            />
            <div className="auth-page__brand-titles">
              <span className="auth-page__brand-text">MOON</span>
              <span className="auth-page__brand-accent">Golden Beauty</span>
            </div>
          </div>
          <p className="auth-page__side-tagline">
            Tu bienestar, nuestra pasión. Tratamientos estéticos de alta gama.
          </p>
        </div>
      </div>
      <div className="auth-page__form-container">
        <div className="auth-page__form-wrapper">
          <Link href="/" className="auth-page__back">
            <ArrowLeft size={18} />
            Volver al inicio
          </Link>

          <div className="auth-page__header">
            <h1 className="auth-page__title">Bienvenida de nuevo</h1>
            <p className="auth-page__subtitle">
              Ingresá a tu cuenta para gestionar tus turnos y tratamientos
            </p>
          </div>

          {/* Google Sign-in */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={googleLoading || loading}
            className="btn btn--secondary btn--full btn--google"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              marginBottom: '1.25rem',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            {googleLoading ? 'Iniciando con Google...' : 'Continuar con Google'}
          </button>

          <div className="auth-divider" style={{ display: 'flex', alignItems: 'center', margin: '1rem 0', color: 'var(--text-muted)' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-light)' }} />
            <span style={{ padding: '0 0.75rem', fontSize: '0.85rem' }}>o con email</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-light)' }} />
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {error && <div className="auth-form__error">{error}</div>}

            {unverifiedAlert && (
              <div
                style={{
                  background: 'rgba(212, 175, 55, 0.1)',
                  border: '1px solid var(--accent-gold)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.75rem',
                  fontSize: '0.875rem',
                  color: 'var(--text-primary)',
                  marginBottom: '1rem',
                }}
              >
                Tu correo aún no ha sido verificado. Por favor, revisá tu casilla de correo o{' '}
                <button
                  type="button"
                  onClick={handleResendVerification}
                  style={{ color: 'var(--accent-gold)', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  {verificationSent ? '¡Correo reenviado!' : 'Reenviar verificación'}
                </button>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email
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

            <div className="form-group">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="form-label">
                  Contraseña
                </label>
                <Link href="/recuperar-password" className="auth-form__forgot">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <div className="auth-form__password-wrapper">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="auth-form__password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn--primary btn--full btn--lg"
              disabled={loading || googleLoading}
            >
              {loading ? (
                <span className="spinner" />
              ) : (
                <>
                  <LogIn size={18} />
                  Iniciar Sesión
                </>
              )}
            </button>
          </form>

          <p className="auth-page__switch">
            ¿No tenés cuenta?{' '}
            <Link href="/registro" className="auth-page__switch-link">
              Crear cuenta
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
