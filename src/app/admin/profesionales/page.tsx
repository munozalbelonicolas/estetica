'use client';

import { useState, useEffect } from 'react';
import { UserCog, Plus, Search, UserCheck, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import { getProfessionals, saveProfessional, deleteProfessional, Professional } from '@/lib/firestore-service';

export default function AdminProfesionalesPage() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    specialties: '',
    bio: '',
    image: '/images/team-maria.jpg',
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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveProfessional({
        name: formData.name,
        role: formData.role,
        specialties: formData.specialties.split(',').map((s) => s.trim()).filter(Boolean),
        bio: formData.bio,
        image: formData.image || '/images/team-maria.jpg',
        isActive: true,
      });
      setShowModal(false);
      setFormData({ name: '', role: '', specialties: '', bio: '', image: '/images/team-maria.jpg' });
      await loadData();
    } catch (err) {
      alert('Error al guardar en base de datos');
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
      alert('Error al actualizar estado');
    }
  };

  const filtered = professionals.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.role.toLowerCase().includes(search.toLowerCase()) ||
    p.specialties.some((s) => s.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)' }}>
            Equipo Profesional
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
            Cuerpo médico, cosmiatras y especialistas registrados para atención.
          </p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn--primary">
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
            placeholder="Buscar por nombre, cargo o especialidad..."
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
              No hay profesionales registrados en la base de datos
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginBottom: 20 }}>
              Agrega a las profesionales y cosmiatras del centro para que puedan recibir turnos.
            </p>
            <button onClick={() => setShowModal(true)} className="btn btn--primary">
              <Plus size={16} /> Registrar Primer Profesional
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 'var(--text-sm)' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-light)', color: 'var(--text-muted)', fontSize: 'var(--text-xs)', textTransform: 'uppercase' }}>
                  <th style={{ padding: '12px 16px' }}>Profesional</th>
                  <th style={{ padding: '12px 16px' }}>Cargo / Rol</th>
                  <th style={{ padding: '12px 16px' }}>Especialidades</th>
                  <th style={{ padding: '12px 16px' }}>Estado</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 600 }}>{p.name}</td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>{p.role}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {p.specialties?.map((s, idx) => (
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
                        ))}
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
                      <button
                        onClick={() => toggleActive(p)}
                        className="btn btn--secondary"
                        style={{ fontSize: 'var(--text-xs)', padding: '4px 10px' }}
                      >
                        {p.isActive ? 'Pausar' : 'Activar'}
                      </button>
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
              Registrar Profesional
            </h3>
            <form onSubmit={handleCreate}>
              <div className="form-group mb-3">
                <label className="form-label">Nombre y Apellido *</label>
                <input
                  type="text"
                  required
                  placeholder="Lic. Melanie Mancin"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group mb-3">
                <label className="form-label">Cargo / Título *</label>
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
                <label className="form-label">Biografía / Perfil</label>
                <textarea
                  rows={3}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="form-input"
                  placeholder="Breve reseña de formación y trayectoria..."
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn--secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn btn--primary">
                  Guardar en Base de Datos
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
