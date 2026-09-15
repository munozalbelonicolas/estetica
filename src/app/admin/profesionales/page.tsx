'use client';

import { useState, useEffect } from 'react';
import {
  UserCog,
  Plus,
  Search,
  Phone,
  Mail,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Edit2,
  ShieldCheck,
} from 'lucide-react';
import {
  getProfessionals,
  saveProfessional,
  deleteProfessional,
  createClientProfile,
  Professional,
} from '@/lib/firestore-service';
import { isValidArgentinePhone, isValidEmail, isValidArgentineDni } from '@/lib/validation';

export default function AdminProfesionalesPage() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; phone?: string; form?: string }>({});
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dni: '',
    role: '',
    specialties: '',
    bio: '',
    image: '/images/team-maria.jpg',
    isActive: true,
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getProfessionals();
      setProfessionals(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openNewModal = () => {
    setEditingId(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      dni: '',
      role: '',
      specialties: '',
      bio: '',
      image: '/images/team-maria.jpg',
      isActive: true,
    });
    setErrors({});
    setShowModal(true);
  };

  const openEditModal = (prof: Professional) => {
    setEditingId(prof.id);
    setFormData({
      name: prof.name || '',
      email: prof.email || '',
      phone: prof.phone || '',
      dni: prof.dni || '',
      role: prof.role || '',
      specialties: prof.specialties?.join(', ') || '',
      bio: prof.bio || '',
      image: prof.image || '/images/team-maria.jpg',
      isActive: prof.isActive !== false,
    });
    setErrors({});
    setShowModal(true);
  };

  const validate = () => {
    const newErrors: { email?: string; phone?: string; form?: string } = {};

    if (!formData.name.trim()) {
      newErrors.form = 'El nombre y apellido son obligatorios';
    } else if (!formData.role.trim()) {
      newErrors.form = 'El cargo o especialidad es obligatorio';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El correo electrónico es obligatorio para habilitar el acceso';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Ingrese un formato de correo electrónico válido (ej: profesional@correo.com)';
    }

    if (formData.phone.trim() && !isValidArgentinePhone(formData.phone)) {
      newErrors.phone = 'Teléfono inválido para Argentina (ej: 11 2345-6789 o +54 9 11 2345-6789)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      const profData: Partial<Professional> & { id?: string } = {
        ...(editingId ? { id: editingId } : {}),
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        dni: formData.dni.replace(/[\.\s\-]/g, ''),
        role: formData.role.trim(),
        specialties: formData.specialties.split(',').map((s) => s.trim()).filter(Boolean),
        bio: formData.bio.trim(),
        image: formData.image || '/images/team-maria.jpg',
        isActive: formData.isActive,
      };

      await saveProfessional(profData);

      // Register or synchronize their system profile with the PROFESSIONAL role
      const names = formData.name.trim().split(' ');
      const firstName = names[0] || formData.name;
      const lastName = names.slice(1).join(' ') || '';

      await createClientProfile({
        uid: editingId ? `prof_usr_${editingId}` : `prof_usr_${Date.now()}`,
        firstName,
        lastName,
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        dni: formData.dni.replace(/[\.\s\-]/g, ''),
        roles: ['professional', 'client'],
        emailVerified: false,
      });

      setShowModal(false);
      await loadData();
    } catch (err) {
      setErrors({ form: 'No se pudo guardar el profesional. Intente nuevamente.' });
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (prof: Professional) => {
    try {
      await saveProfessional({
        ...prof,
        isActive: !prof.isActive,
      });
      await loadData();
    } catch (err) {
      console.warn('Notice: status updated locally:', err);
      await loadData();
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`¿Estás seguro de que deseas eliminar a ${name} del equipo?`)) {
      await deleteProfessional(id);
      await loadData();
    }
  };

  const filtered = professionals.filter((p) => {
    const term = search.toLowerCase();
    const name = (p.name || '').toLowerCase();
    const role = (p.role || '').toLowerCase();
    const email = (p.email || '').toLowerCase();
    const phone = (p.phone || '').toLowerCase();
    const specs = (p.specialties || []).some((s) => s.toLowerCase().includes(term));
    return name.includes(term) || role.includes(term) || email.includes(term) || phone.includes(term) || specs;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)' }}>
            Equipo Profesional
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
            Cuerpo médico, cosmiatras y especialistas con acceso a la agenda y reportería de atención.
          </p>
        </div>
        <button onClick={openNewModal} className="btn btn--primary">
          <Plus size={16} /> Nuevo Profesional
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
            placeholder="Buscar por nombre, correo, teléfono o especialidad..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input"
            style={{ paddingLeft: 36, fontSize: 'var(--text-xs)' }}
          />
        </div>

        {loading ? (
          <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--text-muted)' }}>
            Cargando profesionales desde la base de datos...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 'var(--space-12)', textAlign: 'center' }}>
            <UserCog size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 8 }}>
              No hay profesionales registrados
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginBottom: 20 }}>
              Registra a las profesionales del centro con su correo y teléfono para habilitar su acceso a la agenda y métricas.
            </p>
            <button onClick={openNewModal} className="btn btn--primary">
              <Plus size={16} /> Registrar Primer Profesional
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 'var(--text-sm)' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-light)', color: 'var(--text-muted)', fontSize: 'var(--text-xs)', textTransform: 'uppercase' }}>
                  <th style={{ padding: '12px 16px' }}>Profesional</th>
                  <th style={{ padding: '12px 16px' }}>Contacto & Acceso</th>
                  <th style={{ padding: '12px 16px' }}>Especialidades</th>
                  <th style={{ padding: '12px 16px' }}>Estado</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.name}</div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{p.role}</div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 'var(--text-xs)' }}>
                        {p.email ? (
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)' }}>
                            <Mail size={13} style={{ color: 'var(--accent-gold)' }} />
                            <span>{p.email}</span>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>Sin correo asignado</span>
                        )}
                        {p.phone && (
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)' }}>
                            <Phone size={13} style={{ color: 'var(--text-muted)' }} />
                            <span>{p.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {p.specialties && p.specialties.length > 0 ? (
                          p.specialties.map((s, idx) => (
                            <span
                              key={idx}
                              style={{
                                padding: '2px 8px',
                                background: 'var(--bg-secondary)',
                                borderRadius: 'var(--radius-sm)',
                                fontSize: 'var(--text-xs)',
                                color: 'var(--text-secondary)',
                              }}
                            >
                              {s}
                            </span>
                          ))
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>General</span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          fontSize: 'var(--text-xs)',
                          fontWeight: 600,
                          color: p.isActive ? 'var(--status-confirmed)' : 'var(--text-muted)',
                        }}
                      >
                        {p.isActive ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                        {p.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <button
                          onClick={() => openEditModal(p)}
                          className="btn btn--secondary"
                          style={{ fontSize: 'var(--text-xs)', padding: '4px 8px' }}
                          title="Editar profesional"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => toggleActive(p)}
                          className="btn btn--secondary"
                          style={{ fontSize: 'var(--text-xs)', padding: '4px 10px' }}
                        >
                          {p.isActive ? 'Pausar' : 'Activar'}
                        </button>
                        <button
                          onClick={() => handleDelete(p.id, p.name)}
                          className="btn btn--secondary"
                          style={{ fontSize: 'var(--text-xs)', padding: '4px 8px', color: 'var(--accent-error)' }}
                          title="Eliminar profesional"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
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
                <ShieldCheck size={20} />
              </div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)' }}>
                {editingId ? 'Modificar Profesional' : 'Registrar Profesional'}
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

            <form onSubmit={handleSave}>
              <div className="form-group mb-3">
                <label className="form-label">Nombre y Apellido *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Lic. Melanie Mancin"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="form-input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 12 }} className="mb-3">
                <div className="form-group">
                  <label className="form-label">Correo de Acceso *</label>
                  <input
                    type="email"
                    required
                    placeholder="melanie@estetica.com"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      if (errors.email) setErrors({ ...errors, email: undefined });
                    }}
                    className="form-input"
                    style={{ borderColor: errors.email ? 'var(--accent-error)' : undefined }}
                  />
                  {errors.email ? (
                    <span style={{ color: 'var(--accent-error)', fontSize: '11px', marginTop: 4, display: 'block' }}>
                      {errors.email}
                    </span>
                  ) : (
                    <span style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: 2, display: 'block' }}>
                      Usado para iniciar sesión en la plataforma
                    </span>
                  )}
                </div>

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
                      WhatsApp o celular
                    </span>
                  )}
                </div>
              </div>

              <div className="form-group mb-3">
                <label className="form-label">Cargo / Título Profesional *</label>
                <input
                  type="text"
                  required
                  placeholder="Cosmiatra & Directora Médica"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group mb-3">
                <label className="form-label">Especialidades (separadas por coma) *</label>
                <input
                  type="text"
                  required
                  placeholder="Dermatocosmiatría, Peelings Médicos, Antiage"
                  value={formData.specialties}
                  onChange={(e) => setFormData({ ...formData, specialties: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group mb-4">
                <label className="form-label">Biografía / Perfil Profesional</label>
                <textarea
                  rows={2}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="form-input"
                  placeholder="Breve reseña de formación y experiencia..."
                />
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
                  {saving ? 'Guardando...' : editingId ? 'Guardar Cambios' : 'Registrar Profesional'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
