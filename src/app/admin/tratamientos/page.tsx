'use client';

import { useState } from 'react';
import {
  Sparkles,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  Search,
} from 'lucide-react';
import { defaultTreatments } from '@/lib/firestore-service';

interface TreatmentRow {
  id: string;
  name: string;
  category: string;
  durationMinutes: number;
  price: number;
  showPrice: boolean;
  isActive: boolean;
}

export default function AdminTratamientosPage() {
  const initialTreatments: TreatmentRow[] = defaultTreatments.map((t) => ({
    id: t.id,
    name: t.name,
    category: t.category,
    durationMinutes: t.duration,
    price: t.price || 0,
    showPrice: true,
    isActive: t.isActive,
  }));

  const [treatments, setTreatments] = useState<TreatmentRow[]>(initialTreatments);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newTreatment, setNewTreatment] = useState({
    name: '',
    category: 'Tratamientos Faciales',
    durationMinutes: 45,
    price: 35000,
  });

  const toggleActive = (id: string) => {
    setTreatments((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isActive: !t.isActive } : t))
    );
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const created: TreatmentRow = {
      id: `t-${Date.now()}`,
      name: newTreatment.name,
      category: newTreatment.category,
      durationMinutes: Number(newTreatment.durationMinutes),
      price: Number(newTreatment.price),
      showPrice: true,
      isActive: true,
    };
    setTreatments([created, ...treatments]);
    setShowModal(false);
    setNewTreatment({
      name: '',
      category: 'Tratamientos Faciales',
      durationMinutes: 45,
      price: 35000,
    });
  };

  const filtered = treatments.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)' }}>
            Gestión de Tratamientos
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
            Configuración de servicios, duraciones de turno, categorías y aranceles.
          </p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn--primary">
          <Plus size={16} /> Nuevo Tratamiento
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
            placeholder="Buscar por tratamiento o categoría..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input"
            style={{ paddingLeft: 36, fontSize: 'var(--text-xs)' }}
          />
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 'var(--text-sm)' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-light)', color: 'var(--text-muted)', fontSize: 'var(--text-xs)', textTransform: 'uppercase' }}>
                <th style={{ padding: '12px 16px' }}>Tratamiento</th>
                <th style={{ padding: '12px 16px' }}>Categoría</th>
                <th style={{ padding: '12px 16px' }}>Duración</th>
                <th style={{ padding: '12px 16px' }}>Precio</th>
                <th style={{ padding: '12px 16px' }}>Estado</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '14px 16px', fontWeight: 600 }}>{t.name}</td>
                  <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>{t.category}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={14} style={{ color: 'var(--text-muted)' }} /> {t.durationMinutes} min
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--accent-gold)' }}>
                    ${t.price.toLocaleString('es-AR')}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <button
                      onClick={() => toggleActive(t.id)}
                      style={{
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        color: t.isActive ? 'var(--status-confirmed)' : 'var(--text-muted)',
                        fontWeight: 600,
                        fontSize: 'var(--text-xs)',
                      }}
                    >
                      {t.isActive ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                      {t.isActive ? 'Activo' : 'Pausado'}
                    </button>
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    <button
                      onClick={() => toggleActive(t.id)}
                      style={{
                        padding: '6px 10px',
                        border: '1px solid var(--border-light)',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--bg-secondary)',
                        cursor: 'pointer',
                        fontSize: 'var(--text-xs)',
                      }}
                    >
                      {t.isActive ? 'Desactivar' : 'Activar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
              Agregar Tratamiento
            </h3>
            <form onSubmit={handleCreate}>
              <div className="form-group mb-4">
                <label className="form-label">Nombre del Tratamiento *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Dermaplaning Glow"
                  value={newTreatment.name}
                  onChange={(e) => setNewTreatment({ ...newTreatment, name: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group mb-4">
                <label className="form-label">Categoría *</label>
                <select
                  value={newTreatment.category}
                  onChange={(e) => setNewTreatment({ ...newTreatment, category: e.target.value })}
                  className="form-input"
                >
                  <option value="Tratamientos Faciales">Tratamientos Faciales</option>
                  <option value="Tratamientos Corporales">Tratamientos Corporales</option>
                  <option value="Depilación Definitiva Láser">Depilación Definitiva Láser</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="mb-6">
                <div className="form-group">
                  <label className="form-label">Duración (min) *</label>
                  <input
                    type="number"
                    required
                    min={15}
                    step={15}
                    value={newTreatment.durationMinutes}
                    onChange={(e) => setNewTreatment({ ...newTreatment, durationMinutes: Number(e.target.value) })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Precio ($ AR) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    step={1000}
                    value={newTreatment.price}
                    onChange={(e) => setNewTreatment({ ...newTreatment, price: Number(e.target.value) })}
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn--secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn btn--primary">
                  Guardar Tratamiento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
