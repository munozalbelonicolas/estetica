'use client';

import { useState, useEffect } from 'react';
import { DoorOpen, Plus, CheckCircle2, XCircle } from 'lucide-react';
import { getRooms, saveRoom, deleteRoom, Room } from '@/lib/firestore-service';

export default function AdminConsultoriosPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    equipment: '',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getRooms();
      setRooms(data);
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
      await saveRoom({
        name: formData.name,
        description: formData.description,
        equipment: formData.equipment.split(',').map((s) => s.trim()).filter(Boolean),
        isActive: true,
      });
      setShowModal(false);
      setFormData({ name: '', description: '', equipment: '' });
      await loadData();
    } catch (err) {
      alert('Error al guardar consultorio');
    }
  };

  const toggleActive = async (room: Room) => {
    try {
      await saveRoom({
        ...room,
        isActive: !room.isActive,
      });
      await loadData();
    } catch (err) {
      alert('Error al actualizar estado');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)' }}>
            Consultorios & Boxes
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
            Gestión en base de datos de espacios físicos y boxes de atención médica.
          </p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn--primary">
          <Plus size={16} /> Nuevo Consultorio
        </button>
      </div>

      {loading ? (
        <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--text-muted)' }}>
          Cargando consultorios desde la base de datos...
        </div>
      ) : rooms.length === 0 ? (
        <div
          style={{
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-light)',
            padding: 'var(--space-12)',
            textAlign: 'center',
          }}
        >
          <DoorOpen size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 8 }}>
            No hay consultorios registrados
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginBottom: 20 }}>
            Registra los boxes y salas de aparatología para asignar a los profesionales.
          </p>
          <button onClick={() => setShowModal(true)} className="btn btn--primary">
            <Plus size={16} /> Registrar Primer Consultorio
          </button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 'var(--space-6)',
          }}
        >
          {rooms.map((room) => (
            <div
              key={room.id}
              className="card"
              style={{
                padding: 'var(--space-6)',
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--border-light)',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-4)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 'var(--radius-lg)',
                      background: 'var(--primary-light)',
                      color: 'var(--primary-dark)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <DoorOpen size={22} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600 }}>{room.name}</h3>
                    <span style={{ fontSize: 'var(--text-xs)', color: room.isActive ? 'var(--status-confirmed)' : 'var(--text-muted)', fontWeight: 600 }}>
                      {room.isActive ? '● Habilitado para reservas' : '○ Fuera de servicio'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => toggleActive(room)}
                  className="btn btn--ghost"
                  style={{ fontSize: 'var(--text-xs)', padding: '4px 8px' }}
                >
                  {room.isActive ? 'Desactivar' : 'Activar'}
                </button>
              </div>

              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', lineHeight: 1.6, marginBottom: 'var(--space-4)', flex: 1 }}>
                {room.description}
              </p>

              <div>
                <p style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 'var(--space-2)' }}>
                  Equipamiento disponible:
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {room.equipment.map((eq, idx) => (
                    <span
                      key={idx}
                      style={{
                        padding: '3px 8px',
                        background: 'var(--bg-secondary)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: 'var(--text-xs)',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      • {eq}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

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
              Registrar Consultorio / Box
            </h3>
            <form onSubmit={handleCreate}>
              <div className="form-group mb-3">
                <label className="form-label">Nombre del Consultorio *</label>
                <input
                  type="text"
                  required
                  placeholder="Consultorio 1 - Facial & Dermocosmética"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group mb-3">
                <label className="form-label">Descripción</label>
                <textarea
                  rows={2}
                  placeholder="Equipamiento, iluminación y características..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group mb-4">
                <label className="form-label">Equipamiento (separado por coma)</label>
                <input
                  type="text"
                  placeholder="Punta de diamante, Vaporizador de ozono, Alta frecuencia"
                  value={formData.equipment}
                  onChange={(e) => setFormData({ ...formData, equipment: e.target.value })}
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
