'use client';

import { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  User,
  MapPin,
  CheckCircle2,
  XCircle,
  PlayCircle,
  Filter,
  Search,
  Plus,
} from 'lucide-react';
import { getAllAppointments, updateAppointmentStatus, createAppointment, Appointment } from '@/lib/firestore-service';

export default function AdminAgendaPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

  const [newAppt, setNewAppt] = useState({
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    treatmentName: '',
    treatmentPrice: 35000,
    professionalName: 'Lic. Melanie Mancin',
    date: new Date().toISOString().split('T')[0],
    time: '10:00',
  });

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const data = await getAllAppointments();
      setAppointments(data);
    } catch (e) {
      console.error('Error fetching appointments:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: Appointment['status']) => {
    try {
      await updateAppointmentStatus(id, newStatus);
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
      );
    } catch (e) {
      alert('Error actualizando estado en Firestore');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createAppointment({
        clientId: `cli_${Date.now()}`,
        clientName: newAppt.clientName,
        clientPhone: newAppt.clientPhone,
        clientEmail: newAppt.clientEmail || 'cliente@ejemplo.com',
        treatmentId: `t_${Date.now()}`,
        treatmentName: newAppt.treatmentName,
        treatmentPrice: Number(newAppt.treatmentPrice),
        treatmentDuration: 45,
        professionalId: `prof_${Date.now()}`,
        professionalName: newAppt.professionalName,
        date: newAppt.date,
        time: newAppt.time,
        status: 'confirmed',
      });
      setShowModal(false);
      setNewAppt({
        clientName: '',
        clientPhone: '',
        clientEmail: '',
        treatmentName: '',
        treatmentPrice: 35000,
        professionalName: 'Lic. Melanie Mancin',
        date: new Date().toISOString().split('T')[0],
        time: '10:00',
      });
      await loadAppointments();
    } catch (err) {
      alert('Error al agendar turno');
    }
  };

  const filtered = appointments.filter((a) => {
    if (statusFilter !== 'todos' && a.status !== statusFilter) return false;
    if (
      search &&
      !a.clientName?.toLowerCase().includes(search.toLowerCase()) &&
      !a.treatmentName?.toLowerCase().includes(search.toLowerCase()) &&
      !a.professionalName?.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)' }}>
            Agenda Global & Control de Turnos
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
            Supervisión centralizada en base de datos de turnos y estados de atención.
          </p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn--primary">
          <Plus size={16} /> Agendar Turno Directo
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
        {/* Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 'var(--space-6)' }}>
          <div style={{ position: 'relative', width: 320 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Buscar por paciente, servicio o profesional..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input"
              style={{ paddingLeft: 36, fontSize: 'var(--text-xs)' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Filter size={14} style={{ color: 'var(--text-muted)' }} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-input"
              style={{ width: 'auto', fontSize: 'var(--text-xs)' }}
            >
              <option value="todos">Todos los Estados</option>
              <option value="pending">Pendientes</option>
              <option value="confirmed">Confirmados</option>
              <option value="completed">Completados</option>
              <option value="cancelled">Cancelados</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--text-muted)' }}>
            Cargando turnos desde la base de datos...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 'var(--space-12)', textAlign: 'center' }}>
            <Calendar size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 8 }}>
              No hay turnos registrados
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginBottom: 20 }}>
              Agenda un turno de prueba para verificar el flujo en la base de datos.
            </p>
            <button onClick={() => setShowModal(true)} className="btn btn--primary">
              <Plus size={16} /> Agendar Primer Turno
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 'var(--text-sm)' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-light)', color: 'var(--text-muted)', fontSize: 'var(--text-xs)', textTransform: 'uppercase' }}>
                  <th style={{ padding: '12px 16px' }}>Fecha / Horario</th>
                  <th style={{ padding: '12px 16px' }}>Paciente</th>
                  <th style={{ padding: '12px 16px' }}>Tratamiento</th>
                  <th style={{ padding: '12px 16px' }}>Profesional</th>
                  <th style={{ padding: '12px 16px' }}>Arancel</th>
                  <th style={{ padding: '12px 16px' }}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => (
                  <tr key={a.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 600 }}>{a.time} hs</div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{a.date}</div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 600 }}>{a.clientName}</div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>{a.clientPhone || a.clientEmail}</div>
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 500 }}>{a.treatmentName}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <div>{a.professionalName}</div>
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--accent-gold)' }}>
                      ${a.treatmentPrice?.toLocaleString('es-AR')}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <select
                        value={a.status}
                        onChange={(e) => handleUpdateStatus(a.id, e.target.value as Appointment['status'])}
                        className="form-input"
                        style={{ padding: '4px 8px', fontSize: 'var(--text-xs)', width: 'auto', fontWeight: 600 }}
                      >
                        <option value="pending">Pendiente</option>
                        <option value="confirmed">Confirmado</option>
                        <option value="completed">Completado</option>
                        <option value="cancelled">Cancelado</option>
                      </select>
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
              Agendar Turno
            </h3>
            <form onSubmit={handleCreate}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }} className="mb-3">
                <div className="form-group">
                  <label className="form-label">Paciente *</label>
                  <input
                    type="text"
                    required
                    placeholder="Nombre y Apellido"
                    value={newAppt.clientName}
                    onChange={(e) => setNewAppt({ ...newAppt, clientName: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Teléfono</label>
                  <input
                    type="text"
                    placeholder="11 2345-6789"
                    value={newAppt.clientPhone}
                    onChange={(e) => setNewAppt({ ...newAppt, clientPhone: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group mb-3">
                <label className="form-label">Tratamiento *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Limpieza Facial Profunda"
                  value={newAppt.treatmentName}
                  onChange={(e) => setNewAppt({ ...newAppt, treatmentName: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group mb-3">
                <label className="form-label">Profesional Asignada *</label>
                <input
                  type="text"
                  required
                  value={newAppt.professionalName}
                  onChange={(e) => setNewAppt({ ...newAppt, professionalName: e.target.value })}
                  className="form-input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }} className="mb-4">
                <div className="form-group">
                  <label className="form-label">Fecha *</label>
                  <input
                    type="date"
                    required
                    value={newAppt.date}
                    onChange={(e) => setNewAppt({ ...newAppt, date: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Horario *</label>
                  <input
                    type="time"
                    required
                    value={newAppt.time}
                    onChange={(e) => setNewAppt({ ...newAppt, time: e.target.value })}
                    className="form-input"
                  />
                </div>
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
