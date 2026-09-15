'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, UserPlus, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { isValidArgentinePhone, isValidEmail } from '@/lib/validation';
import './auth.css';

export default function RegisterPage() {
  const router = useRouter();
  const { registerWithEmail, loginWithGoogle } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    birthDate: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'El nombre es obligatorio';
    if (!formData.lastName.trim()) newErrors.lastName = 'El apellido es obligatorio';
    if (!formData.email.trim()) {
      newErrors.email = 'El email es obligatorio';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Ingrese un formato de correo electrónico válido';
    }
    if (formData.phone.trim() && !isValidArgentinePhone(formData.phone)) {
      newErrors.phone = 'Teléfono inválido para Argentina (ej: 11 2345-6789 o +54 9 11 2345-6789)';
    }
    if (formData.password.length < 6) newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');
    if (!validate()) return;
    setLoading(true);

    try {
      const profile = await registerWithEmail(formData.email, formData.password, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        birthDate: formData.birthDate,
      });

      setSuccess(true);
      setTimeout(() => {
        if (profile.roles?.includes('admin')) {
          router.push('/admin');
        } else {
          router.push('/mi-cuenta/turnos');
        }
      }, 2500);
    } catch (err: any) {
      console.error('Registration error:', err);
      if (err?.code === 'auth/email-already-in-use') {
        setGeneralError('Este correo electrónico ya está registrado. Por favor, iniciá sesión.');
      } else if (err?.code === 'auth/weak-password') {
        setGeneralError('La contraseña es demasiado débil.');
      } else if (err?.code === 'auth/invalid-email') {
        setGeneralError('El formato de correo no es válido.');
      } else {
        setGeneralError('Error al crear la cuenta. Intentá nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setGeneralError('');
    setGoogleLoading(true);
    try {
      const profile = await loginWithGoogle();
      if (profile.roles?.includes('admin')) {
        router.push('/admin');
      } else {
        router.push('/mi-cuenta/turnos');
      }
    } catch (err: any) {
      console.error('Google signup error:', err);
      if (err?.code !== 'auth/popup-closed-by-user') {
        setGeneralError('Error al registrarse con Google. Intentá nuevamente.');
      }
    } finally {
      setGoogleLoading(false);
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
            Tu bienestar, nuestra pasión. Creá tu cuenta y reservá tus turnos en segundos.
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
            <h1 className="auth-page__title">Crear cuenta</h1>
            <p className="auth-page__subtitle">
              Registrate para reservar turnos, ver tu historial y acceder a promociones
            </p>
          </div>

          {/* Google Sign-up */}
          <button
            type="button"
            onClick={handleGoogleSignup}
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
            {googleLoading ? 'Registrando con Google...' : 'Registrarse con Google'}
          </button>

          <div className="auth-divider" style={{ display: 'flex', alignItems: 'center', margin: '1rem 0', color: 'var(--text-muted)' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-light)' }} />
            <span style={{ padding: '0 0.75rem', fontSize: '0.85rem' }}>o con email</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-light)' }} />
          </div>

          {success ? (
            <div
              style={{
                background: 'rgba(52, 168, 83, 0.1)',
                border: '1px solid #34A853',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
                textAlign: 'center',
                color: 'var(--text-primary)',
              }}
            >
              <CheckCircle2 size={36} color="#34A853" style={{ margin: '0 auto 0.5rem' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.25rem' }}>¡Cuenta creada con éxito!</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                Te enviamos un correo de verificación. Redirigiendo a tu panel...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="auth-form">
              {generalError && <div className="auth-form__error">{generalError}</div>}

              <div className="grid grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label htmlFor="firstName" className="form-label">
                    Nombre
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    className={`form-input ${errors.firstName ? 'form-input--error' : ''}`}
                    placeholder="María"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                  {errors.firstName && <span className="form-error">{errors.firstName}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="lastName" className="form-label">
                    Apellido
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    className={`form-input ${errors.lastName ? 'form-input--error' : ''}`}
                    placeholder="González"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                  {errors.lastName && <span className="form-error">{errors.lastName}</span>}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className={`form-input ${errors.email ? 'form-input--error' : ''}`}
                  placeholder="tu@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                />
                {errors.email && <span className="form-error">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="phone" className="form-label">
                  Teléfono / WhatsApp
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  className="form-input"
                  placeholder="+54 11 1234-5678"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              <div className="grid grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label htmlFor="password" className="form-label">
                    Contraseña
                  </label>
                  <div className="auth-form__password-wrapper">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      className={`form-input ${errors.password ? 'form-input--error' : ''}`}
                      placeholder="Mínimo 6 caracteres"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                    <button
                      type="button"
                      className="auth-form__password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.password && <span className="form-error">{errors.password}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword" className="form-label">
                    Confirmar
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    className={`form-input ${errors.confirmPassword ? 'form-input--error' : ''}`}
                    placeholder="Repetir contraseña"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                  {errors.confirmPassword && <span className="form-error">{errors.confirmPassword}</span>}
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
                    <UserPlus size={18} />
                    Crear Cuenta
                  </>
                )}
              </button>
            </form>
          )}

          <p className="auth-page__switch">
            ¿Ya tenés cuenta?{' '}
            <Link href="/login" className="auth-page__switch-link">
              Iniciar sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
