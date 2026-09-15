'use client';

import { useState, useEffect } from 'react';
import {
  UserCircle,
  Shield,
  Key,
  Search,
  UserCheck,
  UserPlus,
  AlertCircle,
  CheckCircle2,
  Lock,
  Phone,
  Mail,
  ShieldAlert,
} from 'lucide-react';
import { getAllUsers, createClientProfile, UserProfile } from '@/lib/firestore-service';
import { isValidArgentineDni, isValidArgentinePhone, isValidEmail } from '@/lib/validation';
import { useAuth } from '@/context/AuthContext';

export default function AdminUsuariosPage() {
  const { isAdmin, loading: authLoading } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dni: '',
    role: 'CLIENT', // 'ADMIN' | 'PROFESSIONAL' | 'CLIENT'
    tempPassword: 'Moon2026!',
    mustChangePassword: true,
  });

  const [errors, setErrors] = useState<{ email?: string; phone?: string; dni?: string; form?: string }>({});

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const openNewModal = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dni: '',
      role: 'CLIENT',
      tempPassword: 'Moon2026!',
      mustChangePassword: true,
    });
    setErrors({});
    setShowModal(true);
  };

  const validate = () => {
    const errs: { email?: string; phone?: string; dni?: string; form?: string } = {};
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      errs.form = 'El nombre y apellido son obligatorios';
    }
    if (!formData.email.trim()) {
      errs.email = 'El correo electrónico es obligatorio';
    } else if (!isValidEmail(formData.email)) {
      errs.email = 'Formato de correo inválido (ej: usuario@correo.com)';
    }
    if (formData.phone.trim() && !isValidArgentinePhone(formData.phone)) {
      errs.phone = 'Teléfono inválido para Argentina (ej: 11 2345-6789 o +54 9 11 2345-6789)';
    }
    if (formData.dni.trim() && !isValidArgentineDni(formData.dni)) {
      errs.dni = 'DNI inválido (debe contener 7 u 8 números)';
    }
    if (!formData.tempPassword || formData.tempPassword.length < 6) {
      errs.form = 'La contraseña genérica debe tener al menos 6 caracteres';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      const assignedRoles = [formData.role.toLowerCase()];
      if (!assignedRoles.includes('client')) {
        assignedRoles.push('client');
      }

      await createClientProfile({
        uid: `usr_${Date.now()}`,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        dni: formData.dni.replace(/[\.\s\-]/g, ''),
        roles: assignedRoles,
        mustChangePassword: true,
        tempPassword: formData.tempPassword,
        emailVerified: false,
      });

      setShowModal(false);
      setErrors({});
      await loadUsers();
    } catch (err) {
      setErrors({ form: 'No se pudo guardar el usuario en la base de datos.' });
    } finally {
      setSaving(false);
    }
  };

  if (!authLoading && !isAdmin) {
    return (
      <div style={{ padding: 'var(--space-12)', textAlign: 'center' }}>
        <ShieldAlert size={48} style={{ color: 'var(--accent-error)', margin: '0 auto 16px' }} />
        <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, marginBottom: 8 }}>Acceso Restringido</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
          Solo los administradores autorizados tienen permisos para gestionar la nómina de usuarios y credenciales del sistema.
        </p>
      </div>
    );
  }

  const filtered = users.filter((u) => {
    const term = search.toLowerCase();
    const fullName = `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase();
    const email = (u.email || '').toLowerCase();
    const phone = (u.phone || '').toLowerCase();
    const dni = (u.dni || '').toLowerCase();
    const roleStr = (u.roles || []).join(' ').toLowerCase();

    const matchesSearch = fullName.includes(term) || email.includes(term) || phone.includes(term) || dni.includes(term);

    if (roleFilter === 'ALL') return matchesSearch;
    if (roleFilter === 'ADMIN') return matchesSearch && (roleStr.includes('admin') || roleStr.includes('director'));
    if (roleFilter === 'PROFESSIONAL') return matchesSearch && (roleStr.includes('professional') || roleStr.includes('doctor'));
    if (roleFilter === 'CLIENT') return matchesSearch && !roleStr.includes('admin') && !roleStr.includes('professional');
    return matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)' }}>
            Usuarios, Roles & Permisos
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
            Cuentas registradas, asignación de roles y emisión de credenciales de acceso.
          </p>
        </div>
        <button onClick={openNewModal} className="btn btn--primary">
          <UserPlus size={16} /> Crear Nuevo Usuario
        </button>
      </div>

      <div
        style={{
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-light)',
          padding: 'var(--space-6)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 'var(--space-5)' }}>
          <div style={{ maxWidth: 360, width: '100%', position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Buscar por nombre, email, teléfono o DNI..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input"
              style={{ paddingLeft: 36, fontSize: 'var(--text-xs)' }}
            />
          </div>

          <div style={{ display: 'flex', gap: 6 }}>
            {['ALL', 'ADMIN', 'PROFESSIONAL', 'CLIENT'].map((rf) => (
              <button
                key={rf}
                onClick={() => setRoleFilter(rf)}
                className={`btn btn--xs ${roleFilter === rf ? 'btn--primary' : 'btn--secondary'}`}
                style={{ fontSize: '11px', padding: '4px 10px' }}
              >
                {rf === 'ALL' ? 'Todos' : rf === 'ADMIN' ? 'Admins' : rf === 'PROFESSIONAL' ? 'Profesionales' : 'Clientes'}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--text-muted)' }}>
            Cargando usuarios desde la base de datos...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 'var(--space-12)', textAlign: 'center' }}>
            <UserCircle size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 8 }}>
              No hay usuarios en esta vista
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginBottom: 20 }}>
              Crea un nuevo usuario asignándole una contraseña genérica provisoria.
            </p>
            <button onClick={openNewModal} className="btn btn--primary">
              <UserPlus size={16} /> Crear Primer Usuario
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 'var(--text-sm)' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-light)', color: 'var(--text-muted)', fontSize: 'var(--text-xs)', textTransform: 'uppercase' }}>
                  <th style={{ padding: '12px 16px' }}>Usuario</th>
                  <th style={{ padding: '12px 16px' }}>Contacto & DNI</th>
                  <th style={{ padding: '12px 16px' }}>Rol Asignado</th>
                  <th style={{ padding: '12px 16px' }}>Estado & Seguridad</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => {
                  const rolesLower = (u.roles || []).map((r) => r.toLowerCase());
                  const isAdm = rolesLower.includes('admin') || rolesLower.includes('director');
                  const isProf = rolesLower.includes('professional') || rolesLower.includes('doctor');
                  const isPendingChange = u.mustChangePassword === true;

                  return (
                    <tr key={u.uid} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 600 }}>{u.firstName} {u.lastName || ''}</div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>{u.email}</div>
                      </td>
                      <td style={{ padding: '14px 16px', color: 'var(--text-secondary)', fontSize: 'var(--text-xs)' }}>
                        <div>{u.phone ? `Tel: ${u.phone}` : '—'}</div>
                        <div>{u.dni ? `DNI: ${u.dni}` : ''}</div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span
                          style={{
                            padding: '3px 10px',
                            borderRadius: 'var(--radius-full)',
                            fontSize: 'var(--text-xs)',
                            fontWeight: 600,
                            background: isAdm
                              ? 'rgba(163, 137, 86, 0.15)'
                              : isProf
                              ? 'rgba(92, 127, 107, 0.15)'
                              : 'var(--bg-secondary)',
                            color: isAdm
                              ? 'var(--accent-gold)'
                              : isProf
                              ? 'var(--primary)'
                              : 'var(--text-secondary)',
                          }}
                        >
                          {isAdm ? 'Administrador' : isProf ? 'Profesional' : 'Cliente'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        {isPendingChange ? (
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--accent-gold)', fontSize: 'var(--text-xs)', fontWeight: 600 }}>
                            <Key size={13} />
                            <span>Cambio de clave pendiente</span>
                          </div>
                        ) : (
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--status-confirmed)', fontSize: 'var(--text-xs)', fontWeight: 600 }}>
                            <CheckCircle2 size={13} />
                            <span>Activo</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Create User with Generic Password */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 16,
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-2xl)',
              padding: 'var(--space-8)',
              maxWidth: 500,
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 'var(--space-4)' }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(163, 137, 86, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent-gold)',
                }}
              >
                <UserPlus size={20} />
              </div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)' }}>
                Crear Nuevo Usuario
              </h3>
            </div>

            {errors.form && (
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
                <AlertCircle size={16} />
                <span>{errors.form}</span>
              </div>
            )}

            <form onSubmit={handleCreateUser}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }} className="mb-3">
                <div className="form-group">
                  <label className="form-label">Nombre *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Laura"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Apellido *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Benítez"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group mb-3">
                <label className="form-label">Correo Electrónico (Acceso) *</label>
                <input
                  type="email"
                  required
                  placeholder="usuario@correo.com"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    if (errors.email) setErrors({ ...errors, email: undefined });
                  }}
                  className="form-input"
                  style={{ borderColor: errors.email ? 'var(--accent-error)' : undefined }}
                />
                {errors.email && (
                  <span style={{ color: 'var(--accent-error)', fontSize: '11px', marginTop: 4, display: 'block' }}>
                    {errors.email}
                  </span>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }} className="mb-3">
                <div className="form-group">
                  <label className="form-label">Teléfono (Argentina)</label>
                  <input
                    type="text"
                    placeholder="11 2345-6789"
                    value={formData.phone}
                    onChange={(e) => {
                      setFormData({ ...formData, phone: e.target.value });
                      if (errors.phone) setErrors({ ...errors, phone: undefined });
                    }}
                    className="form-input"
                    style={{ borderColor: errors.phone ? 'var(--accent-error)' : undefined }}
                  />
                  {errors.phone && (
                    <span style={{ color: 'var(--accent-error)', fontSize: '11px', marginTop: 4, display: 'block' }}>
                      {errors.phone}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">DNI</label>
                  <input
                    type="text"
                    placeholder="38123456"
                    value={formData.dni}
                    onChange={(e) => {
                      setFormData({ ...formData, dni: e.target.value });
                      if (errors.dni) setErrors({ ...errors, dni: undefined });
                    }}
                    className="form-input"
                    style={{ borderColor: errors.dni ? 'var(--accent-error)' : undefined }}
                  />
                  {errors.dni && (
                    <span style={{ color: 'var(--accent-error)', fontSize: '11px', marginTop: 4, display: 'block' }}>
                      {errors.dni}
                    </span>
                  )}
                </div>
              </div>

              <div className="form-group mb-3">
                <label className="form-label">Rol del Usuario *</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="form-input"
                >
                  <option value="CLIENT">Cliente (Turnos y fichas personales)</option>
                  <option value="PROFESSIONAL">Profesional (Agenda de atención y reportería propia)</option>
                  <option value="ADMIN">Administrador (Control total del centro, finanzas y consultorios)</option>
                </select>
              </div>

              {/* Generic Password Box */}
              <div
                style={{
                  padding: 'var(--space-4)',
                  background: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-light)',
                  marginBottom: 'var(--space-5)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <Lock size={14} style={{ color: 'var(--accent-gold)' }} />
                  <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Contraseña Genérica Provisoria
                  </span>
                </div>
                <input
                  type="text"
                  required
                  value={formData.tempPassword}
                  onChange={(e) => setFormData({ ...formData, tempPassword: e.target.value })}
                  className="form-input"
                  style={{ marginBottom: 6, fontWeight: 600, letterSpacing: '0.05em' }}
                />
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                  🛡️ El sistema solicitará obligatoriamente cambiar esta clave a una nueva contraseña personal en el primer inicio de sesión del usuario.
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn--secondary"
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn--primary" disabled={saving}>
                  {saving ? 'Creando Usuario...' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
