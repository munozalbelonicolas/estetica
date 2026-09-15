'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Camera, Plus, Search, Calendar, User, Trash2 } from 'lucide-react';
import { getClinicalPhotos, saveClinicalPhoto, deleteClinicalPhoto, ClinicalPhoto } from '@/lib/firestore-service';

export default function AdminFotosPage() {
  const [photos, setPhotos] = useState<ClinicalPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    patientName: '',
    treatmentName: '',
    date: new Date().toISOString().split('T')[0],
    beforeUrl: '/images/treatment-cleanse.jpg',
    afterUrl: '/images/treatment-peeling.jpg',
    notes: '',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getClinicalPhotos();
      setPhotos(data);
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
      await saveClinicalPhoto({
        patientName: formData.patientName,
        treatmentName: formData.treatmentName,
        date: formData.date,
        beforeUrl: formData.beforeUrl,
        afterUrl: formData.afterUrl,
        notes: formData.notes,
      });
      setShowModal(false);
      setFormData({
        patientName: '',
        treatmentName: '',
        date: new Date().toISOString().split('T')[0],
        beforeUrl: '/images/treatment-cleanse.jpg',
        afterUrl: '/images/treatment-peeling.jpg',
        notes: '',
      });
      await loadData();
    } catch (err) {
      alert('Error al guardar registro fotográfico');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este registro fotográfico?')) return;
    try {
      await deleteClinicalPhoto(id);
      await loadData();
    } catch (err) {
      alert('Error al eliminar');
    }
  };

  const filtered = photos.filter((p) =>
    p.patientName.toLowerCase().includes(search.toLowerCase()) ||
    p.treatmentName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)' }}>
            Registro Fotográfico & Evolución
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
            Comparativas antes y después de tratamientos clínicos y estéticos.
          </p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn--primary">
          <Plus size={16} /> Agregar Comparativa
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
            placeholder="Buscar por paciente o tratamiento..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input"
            style={{ paddingLeft: 36, fontSize: 'var(--text-xs)' }}
          />
        </div>

        {loading ? (
          <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--text-muted)' }}>
            Cargando registros fotográficos desde la base de datos...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 'var(--space-12)', textAlign: 'center' }}>
            <Camera size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 8 }}>
              No hay fotos clínicas registradas
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginBottom: 20 }}>
              Registra las primeras fotos de antes y después de tus tratamientos en la base de datos.
            </p>
            <button onClick={() => setShowModal(true)} className="btn btn--primary">
              <Plus size={16} /> Subir Primera Comparativa
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-6)' }}>
            {filtered.map((item) => (
              <div
                key={item.id}
                style={{
                  background: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-light)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, background: 'var(--border-light)' }}>
                  <div style={{ position: 'relative', height: 180 }}>
                    <Image
                      src={item.beforeUrl || '/images/treatment-cleanse.jpg'}
                      alt="Antes"
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                    <span
                      style={{
                        position: 'absolute',
                        bottom: 8,
                        left: 8,
                        background: 'rgba(0,0,0,0.7)',
                        color: '#fff',
                        fontSize: 10,
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: 4,
                      }}
                    >
                      ANTES
                    </span>
                  </div>
                  <div style={{ position: 'relative', height: 180 }}>
                    <Image
                      src={item.afterUrl || '/images/treatment-peeling.jpg'}
                      alt="Después"
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                    <span
                      style={{
                        position: 'absolute',
                        bottom: 8,
                        left: 8,
                        background: 'var(--accent-gold)',
                        color: '#000',
                        fontSize: 10,
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: 4,
                      }}
                    >
                      DESPUÉS
                    </span>
                  </div>
                </div>

                <div style={{ padding: 'var(--space-4)', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h4 style={{ fontSize: 'var(--text-base)', fontWeight: 600 }}>{item.patientName}</h4>
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{item.date}</span>
                    </div>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--accent-gold)', fontWeight: 600, marginTop: 2 }}>
                      {item.treatmentName}
                    </p>
                    {item.notes && (
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: 8 }}>
                        {item.notes}
                      </p>
                    )}
                  </div>

                  <div style={{ marginTop: 12, textAlign: 'right' }}>
                    <button
                      onClick={() => handleDelete(item.id)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--status-cancelled)',
                        fontSize: 'var(--text-xs)',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <Trash2 size={12} /> Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
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
              Subir Comparativa Clínica
            </h3>
            <form onSubmit={handleCreate}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }} className="mb-3">
                <div className="form-group">
                  <label className="form-label">Paciente *</label>
                  <input
                    type="text"
                    required
                    placeholder="Nombre completo"
                    value={formData.patientName}
                    onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Fecha *</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group mb-3">
                <label className="form-label">Tratamiento *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Radiofrecuencia Facial Tripolar"
                  value={formData.treatmentName}
                  onChange={(e) => setFormData({ ...formData, treatmentName: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group mb-4">
                <label className="form-label">Notas de Evolución</label>
                <textarea
                  rows={2}
                  placeholder="Resultados observados post 3 sesiones..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="form-input"
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
