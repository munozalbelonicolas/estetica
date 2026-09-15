'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn, getSession } from 'next-auth/react';
import { Eye, EyeOff, LogIn, ArrowLeft } from 'lucide-react';
import './auth.css';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Email o contraseña incorrectos');
      } else {
        const session = await getSession();
        const roles = (session?.user as any)?.roles || [];

        if (roles.includes('admin')) {
          router.push('/admin');
        } else if (roles.includes('professional')) {
          router.push('/profesional/agenda');
        } else {
          router.push('/mi-cuenta/turnos');
        }
        router.refresh();
      }
    } catch {
      setError('Ocurrió un error. Intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-page__side">
        <div className="auth-page__side-content">
          <div className="auth-page__brand">
            <span className="auth-page__brand-text">Estética</span>
            <span className="auth-page__brand-accent">Studio</span>
          </div>
          <p className="auth-page__side-tagline">
            Tu bienestar, nuestra pasión
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
              Ingresá a tu cuenta para gestionar tus turnos
            </p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {error && <div className="auth-form__error">{error}</div>}

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
              disabled={loading}
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
