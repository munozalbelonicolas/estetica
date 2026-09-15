'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Eye, EyeOff, UserPlus, ArrowLeft } from 'lucide-react';
import './auth.css';

export default function RegisterPage() {
  const router = useRouter();
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
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field error on change
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');
    setErrors({});
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.errors) {
          setErrors(data.errors);
        } else {
          setGeneralError(data.message || 'Error al crear la cuenta');
        }
        return;
      }

      // Auto sign in after registration
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setGeneralError('Cuenta creada, pero hubo un error al iniciar sesión. Intentá ingresar manualmente.');
      } else {
        router.push('/mi-cuenta');
        router.refresh();
      }
    } catch {
      setGeneralError('Ocurrió un error. Intentá de nuevo.');
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
            <h1 className="auth-page__title">Crear Cuenta</h1>
            <p className="auth-page__subtitle">
              Registrate para reservar turnos y acceder a tu historial
            </p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {generalError && (
              <div className="auth-form__error">{generalError}</div>
            )}

            <div className="auth-form__row">
              <div className="form-group">
                <label htmlFor="firstName" className="form-label form-label--required">
                  Nombre
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  className={`form-input ${errors.firstName ? 'form-input--error' : ''}`}
                  placeholder="Tu nombre"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
                {errors.firstName && <span className="form-error">{errors.firstName}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="lastName" className="form-label form-label--required">
                  Apellido
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  className={`form-input ${errors.lastName ? 'form-input--error' : ''}`}
                  placeholder="Tu apellido"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
                {errors.lastName && <span className="form-error">{errors.lastName}</span>}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label form-label--required">
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

            <div className="auth-form__row">
              <div className="form-group">
                <label htmlFor="phone" className="form-label">
                  Teléfono
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
              <div className="form-group">
                <label htmlFor="birthDate" className="form-label">
                  Fecha de nacimiento
                </label>
                <input
                  id="birthDate"
                  name="birthDate"
                  type="date"
                  className="form-input"
                  value={formData.birthDate}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label form-label--required">
                Contraseña
              </label>
              <div className="auth-form__password-wrapper">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  className={`form-input ${errors.password ? 'form-input--error' : ''}`}
                  placeholder="Mínimo 8 caracteres"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  autoComplete="new-password"
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
              {errors.password && <span className="form-error">{errors.password}</span>}
              <span className="form-hint">
                Debe contener al menos 8 caracteres, una mayúscula y un número
              </span>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label form-label--required">
                Confirmar contraseña
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                className={`form-input ${errors.confirmPassword ? 'form-input--error' : ''}`}
                placeholder="Repetí tu contraseña"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                autoComplete="new-password"
              />
              {errors.confirmPassword && <span className="form-error">{errors.confirmPassword}</span>}
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
                  <UserPlus size={18} />
                  Crear Cuenta
                </>
              )}
            </button>
          </form>

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
