'use client';

import { useState, useEffect } from 'react';
import { DoorOpen, Plus, CheckCircle2, XCircle, Edit2, Trash2, X, Wrench, Sparkles } from 'lucide-react';
import { getRooms, saveRoom, deleteRoom, Room } from '@/lib/firestore-service';

export default function AdminConsultoriosPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    equipmentList: [] as string[],
    newEquipmentInput: '',
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

  const openCreateModal = () => {
    setEditingRoom(null);
    setFormData({
      name: '',
      description: '',
      equipmentList: [],
      newEquipmentInput: '',
    });
    setShowModal(true);
  };

  const openEditModal = (room: Room) => {
    setEditingRoom(room);
    setFormData({
      name: room.name,
      description: room.description || '',
      equipmentList: Array.isArray(room.equipment) ? [...room.equipment] : [],
      newEquipmentInput: '',
    });
    setShowModal(true);
  };

  const handleAddEquipment = () => {
    const val = formData.newEquipmentInput.trim();
    if (!val) return;
    if (!formData.equipmentList.includes(val)) {
      setFormData({
        ...formData,
        equipmentList: [...formData.equipmentList, val],
        newEquipmentInput: '',
      });
    } else {
      setFormData({ ...formData, newEquipmentInput: '' });
    }
  };

  const handleRemoveEquipment = (indexToRemove: number) => {
    setFormData({
      ...formData,
      equipmentList: formData.equipmentList.filter((_, idx) => idx !== indexToRemove),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveRoom({
        id: editingRoom ? editingRoom.id : undefined,
        name: formData.name,
        description: formData.description,
        equipment: formData.equipmentList,
        isActive: editingRoom ? editingRoom.isActive : true,
      });
      setShowModal(false);
      await loadData();
    } catch (err) {
      alert('Error al guardar consultorio en base de datos');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Estás seguro/a de eliminar "${name}"?`)) return;
    try {
      await deleteRoom(id);
      await loadData();
    } catch (err) {
      alert('Error al eliminar consultorio');
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
            Consultorios & Boxes de Atención
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
            Configuración de espacios físicos, boxes clínicos y asignación de aparatología médica.
          </p>
        </div>
        <button onClick={openCreateModal} className="btn btn--primary">
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
            Registra los consultorios y añade el equipamiento y herramientas que dispone cada uno.
          </p>
          <button onClick={openCreateModal} className="btn btn--primary">
            <Plus size={16} /> Registrar Primer Consultorio
          </button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
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
                justifyContent: 'space-between',
              }}
            >
              <div>
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

                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      onClick={() => openEditModal(room)}
                      className="btn btn--secondary"
                      style={{ padding: '6px 10px', fontSize: 'var(--text-xs)' }}
                      title="Editar Consultorio y Herramientas"
                    >
                      <Edit2 size={13} /> Editar
                    </button>
                    <button
                      onClick={() => handleDelete(room.id, room.name)}
                      className="btn btn--ghost"
                      style={{ padding: '6px 8px', color: 'var(--status-cancelled)', fontSize: 'var(--text-xs)' }}
                      title="Eliminar Consultorio"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', lineHeight: 1.6, marginBottom: 'var(--space-4)' }}>
                  {room.description || 'Sin descripción detallada.'}
                </p>

                <div style={{ marginTop: 'var(--space-4)', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--border-light)' }}>
                  <p style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 'var(--space-2)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Wrench size={12} /> Herramientas & Equipamiento ({room.equipment?.length || 0}):
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {room.equipment && room.equipment.length > 0 ? (
                      room.equipment.map((eq, idx) => (
                        <span
                          key={idx}
                          style={{
                            padding: '4px 10px',
                            background: 'var(--bg-secondary)',
                            borderRadius: 'var(--radius-full)',
                            fontSize: 'var(--text-xs)',
                            color: 'var(--text-primary)',
                            border: '1px solid var(--border-light)',
                            fontWeight: 500,
                          }}
                        >
                          • {eq}
                        </span>
                      ))
                    ) : (
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                        No tiene herramientas registradas.
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 'var(--space-4)', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => toggleActive(room)}
                  className="btn btn--ghost"
                  style={{ fontSize: 'var(--text-xs)', padding: '4px 8px' }}
                >
                  {room.isActive ? 'Desactivar box' : 'Activar box'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
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
              maxWidth: 520,
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)' }}>
                {editingRoom ? 'Modificar Consultorio & Equipamiento' : 'Registrar Nuevo Consultorio'}
              </h3>
              <button onClick={() => setShowModal(false)} className="btn btn--ghost" style={{ padding: 4 }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group mb-3">
                <label className="form-label">Nombre del Consultorio / Box *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Consultorio 1 - Facial & Dermocosmética"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group mb-4">
                <label className="form-label">Descripción</label>
                <textarea
                  rows={2}
                  placeholder="Características del espacio, ambientación, camilla..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="form-input"
                />
              </div>

              {/* Tools & Equipment Tag Editor */}
              <div className="form-group mb-6">
                <label className="form-label">Herramientas & Equipos en este consultorio</label>
                <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                  <input
                    type="text"
                    placeholder="Ej: Punta de diamante, Alta frecuencia, Lámpara Wood..."
                    value={formData.newEquipmentInput}
                    onChange={(e) => setFormData({ ...formData, newEquipmentInput: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddEquipment();
                      }
                    }}
                    className="form-input"
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    onClick={handleAddEquipment}
                    className="btn btn--secondary"
                    style={{ padding: '8px 14px', fontSize: 'var(--text-xs)' }}
                  >
                    <Plus size={14} /> Añadir
                  </button>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, minHeight: 40, padding: 8, background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                  {formData.equipmentList.length === 0 ? (
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                      Escribe una herramienta y presiona Añadir o Enter para agregarla.
                    </span>
                  ) : (
                    formData.equipmentList.map((eq, idx) => (
                      <span
                        key={idx}
                        style={{
                          padding: '4px 10px',
                          background: 'var(--bg-card)',
                          borderRadius: 'var(--radius-full)',
                          fontSize: 'var(--text-xs)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          border: '1px solid var(--border-light)',
                          fontWeight: 500,
                        }}
                      >
                        {eq}
                        <button
                          type="button"
                          onClick={() => handleRemoveEquipment(idx)}
                          style={{
                            border: 'none',
                            background: 'transparent',
                            cursor: 'pointer',
                            color: 'var(--text-muted)',
                            padding: 0,
                            display: 'flex',
                          }}
                          title="Quitar herramienta"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn--secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn btn--primary">
                  {editingRoom ? 'Guardar Cambios' : 'Registrar Consultorio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
