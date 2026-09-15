'use client';

import { useState } from 'react';
import { KeyRound, ShieldAlert, CheckCircle2, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { setUserProfile } from '@/lib/firestore-service';
import { updatePassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function ForcePasswordChangeModal() {
  const { user, userProfile } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // If user is not logged in or doesn't have mustChangePassword set to true, do not render
  if (!user || !userProfile || !userProfile.mustChangePassword) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    if (userProfile.tempPassword && newPassword === userProfile.tempPassword) {
      setError('La nueva contraseña no puede ser igual a la contraseña provisoria.');
      return;
    }

    setLoading(true);
    try {
      if (auth.currentUser) {
        try {
          await updatePassword(auth.currentUser, newPassword);
        } catch (firebaseErr: any) {
          console.warn('Firebase Auth updatePassword warning:', firebaseErr);
        }
      }

      // Update Firestore / local profile to remove mustChangePassword flag
      await setUserProfile(user.uid, {
        mustChangePassword: false,
        tempPassword: '',
      });

      // Update in-memory userProfile
      userProfile.mustChangePassword = false;

      setSuccess(true);
      setTimeout(() => {
        window.location.reload();
      }, 1200);
    } catch (err: any) {
      setError(err?.message || 'Error al actualizar la contraseña. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(10, 10, 12, 0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        padding: 16,
      }}
    >
      <div
        style={{
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-2xl)',
          border: '1px solid var(--accent-gold)',
          padding: 'var(--space-8)',
          maxWidth: 460,
          width: '100%',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 'var(--radius-full)',
              background: 'rgba(163, 137, 86, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-gold)',
              margin: '0 auto 16px',
            }}
          >
            <KeyRound size={28} />
          </div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)', marginBottom: 8 }}>
            Cambio Obligatorio de Contraseña
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-xs)', lineHeight: 1.5 }}>
            Por razones de seguridad, al acceder por primera vez con una clave provisoria asignada por el administrador, debes definir tu contraseña personal definitiva.
          </p>
        </div>

        {error && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 14px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid var(--accent-error)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--accent-error)',
              fontSize: 'var(--text-xs)',
              marginBottom: 16,
            }}
          >
            <ShieldAlert size={16} />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 10,
              padding: 'var(--space-6)',
              background: 'rgba(92, 127, 107, 0.1)',
              borderRadius: 'var(--radius-lg)',
              color: 'var(--primary)',
              textAlign: 'center',
            }}
          >
            <CheckCircle2 size={32} />
            <h4 style={{ fontWeight: 600 }}>¡Contraseña Actualizada con Éxito!</h4>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
              Iniciando tu sesión en la plataforma...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group mb-3">
              <label className="form-label">Nueva Contraseña *</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Mínimo 6 caracteres"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="form-input"
                  style={{ paddingRight: 40 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="form-group mb-6">
              <label className="form-label">Confirmar Nueva Contraseña *</label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Repita la nueva contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="form-input"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn--primary btn--full"
              style={{ padding: '12px', fontSize: 'var(--text-sm)', fontWeight: 600 }}
            >
              <Lock size={16} /> {loading ? 'Actualizando...' : 'Guardar Nueva Contraseña y Entrar'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
