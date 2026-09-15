'use client';

import { useState } from 'react';
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
} from 'lucide-react';

interface AdminAppointment {
  id: string;
  clientName: string;
  clientPhone: string;
  treatmentName: string;
  professionalName: string;
  roomName: string;
  date: string;
  time: string;
  price: number;
  status: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
}

const DEMO_MASTER_APPOINTMENTS: AdminAppointment[] = [
  {
    id: 'a-1',
    clientName: 'María Eugenia González',
    clientPhone: '11 3456-7890',
    treatmentName: 'Limpieza Facial Profunda',
    professionalName: 'Valentina Rossi',
    roomName: 'Consultorio 1 - Facial',
    date: '2026-09-14',
    time: '09:00 - 10:00',
    price: 32000,
    status: 'COMPLETED',
  },
  {
    id: 'a-2',
    clientName: 'Luciana Beltrán',
    clientPhone: '11 9876-5432',
    treatmentName: 'Radiofrecuencia Facial Tripolar',
    professionalName: 'Valentina Rossi',
    roomName: 'Consultorio 1 - Facial',
    date: '2026-09-14',
    time: '10:30 - 11:15',
    price: 38000,
    status: 'IN_PROGRESS',
  },
  {
    id: 'a-3',
    clientName: 'Sofía Álvarez',
    clientPhone: '11 4455-6677',
    treatmentName: 'Criolipólisis Plana',
    professionalName: 'Camila Méndez',
    roomName: 'Consultorio 2 - Corporal',
    date: '2026-09-14',
    time: '11:00 - 12:00',
    price: 55000,
    status: 'CONFIRMED',
  },
  {
    id: 'a-4',
    clientName: 'Carla Domínguez',
    clientPhone: '11 2233-4455',
    treatmentName: 'Depilación Láser Diodo Trío',
    professionalName: 'Lucía Fernández',
    roomName: 'Consultorio 3 - Láser',
    date: '2026-09-14',
    time: '14:00 - 14:40',
    price: 26000,
    status: 'CONFIRMED',
  },
  {
    id: 'a-5',
    clientName: 'Julieta Romero',
    clientPhone: '11 7788-9900',
    treatmentName: 'Peeling Químico Renovador',
    professionalName: 'Valentina Rossi',
    roomName: 'Consultorio 1 - Facial',
    date: '2026-09-14',
    time: '16:00 - 16:45',
    price: 35000,
    status: 'PENDING',
  },
  {
    id: 'a-6',
    clientName: 'Florencia Benítez',
    clientPhone: '11 5566-7788',
    treatmentName: 'Masaje Descontracturante',
    professionalName: 'Camila Méndez',
    roomName: 'Consultorio 2 - Corporal',
    date: '2026-09-15',
    time: '11:00 - 11:50',
    price: 28000,
    status: 'CONFIRMED',
  },
];

export default function AdminAgendaPage() {
  const [appointments, setAppointments] = useState<AdminAppointment[]>(DEMO_MASTER_APPOINTMENTS);
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [search, setSearch] = useState('');

  const updateStatus = (id: string, newStatus: AdminAppointment['status']) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
    );
  };

  const filtered = appointments.filter((a) => {
    if (statusFilter !== 'todos' && a.status !== statusFilter) return false;
    if (
      search &&
      !a.clientName.toLowerCase().includes(search.toLowerCase()) &&
      !a.treatmentName.toLowerCase().includes(search.toLowerCase()) &&
      !a.professionalName.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)' }}>
          Agenda Global & Control de Turnos
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
          Supervisión centralizada de turnos, profesionales asignadas y estados de atención.
        </p>
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
              <option value="PENDING">Pendientes</option>
              <option value="CONFIRMED">Confirmados</option>
              <option value="IN_PROGRESS">En Atención</option>
              <option value="COMPLETED">Completados</option>
              <option value="CANCELLED">Cancelados</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 'var(--text-sm)' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-light)', color: 'var(--text-muted)', fontSize: 'var(--text-xs)', textTransform: 'uppercase' }}>
                <th style={{ padding: '12px 16px' }}>Fecha / Horario</th>
                <th style={{ padding: '12px 16px' }}>Paciente</th>
                <th style={{ padding: '12px 16px' }}>Tratamiento</th>
                <th style={{ padding: '12px 16px' }}>Profesional & Box</th>
                <th style={{ padding: '12px 16px' }}>Arancel</th>
                <th style={{ padding: '12px 16px' }}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: 600 }}>{a.time}</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{a.date}</div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: 600 }}>{a.clientName}</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>{a.clientPhone}</div>
                  </td>
                  <td style={{ padding: '14px 16px', fontWeight: 500 }}>{a.treatmentName}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <div>{a.professionalName}</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{a.roomName}</div>
                  </td>
                  <td style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--accent-gold)' }}>
                    ${a.price.toLocaleString('es-AR')}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <select
                      value={a.status}
                      onChange={(e) => updateStatus(a.id, e.target.value as AdminAppointment['status'])}
                      className="form-input"
                      style={{ padding: '4px 8px', fontSize: 'var(--text-xs)', width: 'auto', fontWeight: 600 }}
                    >
                      <option value="PENDING">Pendiente</option>
                      <option value="CONFIRMED">Confirmado</option>
                      <option value="IN_PROGRESS">En Atención</option>
                      <option value="COMPLETED">Completado</option>
                      <option value="CANCELLED">Cancelado</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
