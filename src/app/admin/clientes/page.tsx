'use client';

import { useState, useEffect } from 'react';
import { Users, Plus, Search, Phone, Mail, Calendar, UserPlus, Edit2, CheckCircle2, AlertCircle } from 'lucide-react';
import { getAllUsers, createClientProfile, UserProfile } from '@/lib/firestore-service';
import { isValidArgentineDni, isValidArgentinePhone, isValidEmail } from '@/lib/validation';

export default function AdminClientesPage() {
  const [clients, setClients] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; phone?: string; dni?: string; form?: string }>({});
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dni: '',
    birthDate: '',
  });

  const loadClients = async () => {
    setLoading(true);
    try {
      const allUsers = await getAllUsers();
      setClients(allUsers);
    } catch (e) {
      console.error('Error fetching clients:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  const validate = () => {
    const newErrors: { email?: string; phone?: string; dni?: string; form?: string } = {};

    if (!formData.firstName.trim()) {
      newErrors.form = 'El nombre es obligatorio';
    } else if (!formData.lastName.trim()) {
      newErrors.form = 'El apellido es obligatorio';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El correo electrónico es obligatorio';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Ingrese un correo electrónico válido (ejemplo: usuario@correo.com)';
    }

    if (formData.phone.trim() && !isValidArgentinePhone(formData.phone)) {
      newErrors.phone = 'Número de Argentina inválido. Ingrese con código de área (ej: 11 2345-6789 o +54 9 11 2345-6789)';
    }

    if (formData.dni.trim() && !isValidArgentineDni(formData.dni)) {
      newErrors.dni = 'DNI inválido. Debe contener entre 7 y 8 números válidos (ej: 38123456)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      await createClientProfile({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        dni: formData.dni.replace(/[\.\s\-]/g, ''),
        birthDate: formData.birthDate,
        roles: ['CLIENT'],
        emailVerified: false,
      });
      setShowModal(false);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dni: '',
        birthDate: '',
      });
      setErrors({});
      await loadClients();
    } catch (err) {
      setErrors({ form: 'No se pudo registrar el cliente. Intente nuevamente.' });
    } finally {
      setSaving(false);
    }
  };

  const filtered = clients.filter((c) => {
    const term = search.toLowerCase();
    const fullName = `${c.firstName || ''} ${c.lastName || ''}`.toLowerCase();
    const email = (c.email || '').toLowerCase();
    const phone = (c.phone || '').toLowerCase();
    const dni = (c.dni || '').toLowerCase();
    return fullName.includes(term) || email.includes(term) || phone.includes(term) || dni.includes(term);
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)' }}>
            Directorio de Clientes
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
            Base de datos de pacientes registrados, historial de contacto y fichas.
          </p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn--primary">
          <UserPlus size={16} /> Nuevo Cliente
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
        <div style={{ marginBottom: 'var(--space-5)', maxWidth: 360, position: 'relative' }}>
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

        {loading ? (
          <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--text-muted)' }}>
            Cargando clientes desde la base de datos...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 'var(--space-12)', textAlign: 'center' }}>
            <Users size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 8 }}>
              No hay clientes registrados aún
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginBottom: 20 }}>
              Crea tu primer cliente o espera a que se registren desde el portal público.
            </p>
            <button onClick={() => setShowModal(true)} className="btn btn--primary">
              <UserPlus size={16} /> Registrar Primer Cliente
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 'var(--text-sm)' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-light)', color: 'var(--text-muted)', fontSize: 'var(--text-xs)', textTransform: 'uppercase' }}>
                  <th style={{ padding: '12px 16px' }}>Nombre Completo</th>
                  <th style={{ padding: '12px 16px' }}>Email</th>
                  <th style={{ padding: '12px 16px' }}>Teléfono</th>
                  <th style={{ padding: '12px 16px' }}>DNI</th>
                  <th style={{ padding: '12px 16px' }}>Rol</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.uid} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 600 }}>
                      {c.firstName} {c.lastName}
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <Mail size={14} style={{ color: 'var(--text-muted)' }} />
                        {c.email}
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      {c.phone ? (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          <Phone size={14} style={{ color: 'var(--text-muted)' }} />
                          {c.phone}
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>
                      {c.dni || '—'}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span
                        style={{
                          padding: '3px 8px',
                          borderRadius: 'var(--radius-full)',
                          fontSize: 'var(--text-xs)',
                          fontWeight: 600,
                          background: c.roles?.includes('ADMIN') ? 'rgba(163, 137, 86, 0.15)' : 'var(--bg-secondary)',
                          color: c.roles?.includes('ADMIN') ? 'var(--accent-gold)' : 'var(--text-secondary)',
                        }}
                      >
                        {c.roles?.join(', ') || 'CLIENT'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

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
              maxWidth: 480,
              width: '100%',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)', marginBottom: 'var(--space-4)' }}>
              Registrar Nuevo Cliente
            </h3>

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

            <form onSubmit={handleCreate}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }} className="mb-3">
                <div className="form-group">
                  <label className="form-label">Nombre *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Ana"
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
                    placeholder="Ej: Gómez"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group mb-3">
                <label className="form-label">Correo Electrónico *</label>
                <input
                  type="email"
                  required
                  placeholder="ejemplo@correo.com"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    if (errors.email) setErrors({ ...errors, email: undefined });
                  }}
                  className="form-input"
                  style={{ borderColor: errors.email ? 'var(--accent-error)' : undefined }}
                />
                {errors.email && (
                  <span style={{ color: 'var(--accent-error)', fontSize: 'var(--text-xs)', marginTop: 4, display: 'block' }}>
                    {errors.email}
                  </span>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }} className="mb-4">
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
                  {errors.phone ? (
                    <span style={{ color: 'var(--accent-error)', fontSize: '11px', marginTop: 4, display: 'block' }}>
                      {errors.phone}
                    </span>
                  ) : (
                    <span style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: 2, display: 'block' }}>
                      Ej: 11 2345-6789 o +54 9 11 ...
                    </span>
                  )}
                </div>
                <div className="form-group">
                  <label className="form-label">DNI Argentino</label>
                  <input
                    type="text"
                    placeholder="12345678"
                    maxLength={10}
                    value={formData.dni}
                    onChange={(e) => {
                      setFormData({ ...formData, dni: e.target.value });
                      if (errors.dni) setErrors({ ...errors, dni: undefined });
                    }}
                    className="form-input"
                    style={{ borderColor: errors.dni ? 'var(--accent-error)' : undefined }}
                  />
                  {errors.dni ? (
                    <span style={{ color: 'var(--accent-error)', fontSize: '11px', marginTop: 4, display: 'block' }}>
                      {errors.dni}
                    </span>
                  ) : (
                    <span style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: 2, display: 'block' }}>
                      7 u 8 dígitos sin letras
                    </span>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setErrors({});
                  }}
                  className="btn btn--secondary"
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn--primary" disabled={saving}>
                  {saving ? 'Guardando...' : 'Guardar en Base de Datos'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
