'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  MapPin,
  CheckCircle2,
  PlayCircle,
  XCircle,
  AlertCircle,
  Filter,
  FileText,
} from 'lucide-react';

interface AgendaItem {
  id: string;
  clientName: string;
  clientPhone: string;
  treatmentName: string;
  professionalName: string;
  roomName: string;
  startTime: string;
  endTime: string;
  status: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  notes?: string;
  skinType?: string;
  allergies?: string;
}

const INITIAL_AGENDA: AgendaItem[] = [
  {
    id: 'ag-1',
    clientName: 'María Eugenia González',
    clientPhone: '11 3456-7890',
    treatmentName: 'Limpieza Facial Profunda',
    professionalName: 'Valentina Rossi',
    roomName: 'Consultorio 1 - Facial',
    startTime: '09:00',
    endTime: '10:00',
    status: 'COMPLETED',
    skinType: 'Mixta deshidratada',
    allergies: 'Ninguna conocida',
    notes: 'Primera sesión del protocolo de luminosidad. Excelente tolerancia a punta de diamante.',
  },
  {
    id: 'ag-2',
    clientName: 'Luciana Beltrán',
    clientPhone: '11 9876-5432',
    treatmentName: 'Radiofrecuencia Facial Tripolar',
    professionalName: 'Valentina Rossi',
    roomName: 'Consultorio 1 - Facial',
    startTime: '10:30',
    endTime: '11:15',
    status: 'IN_PROGRESS',
    skinType: 'Seca con líneas de expresión',
    allergies: 'Sensibilidad a fragancias',
    notes: 'Sesión 3 de 6. Se enfoca en contorno mandibular y surco nasogeniano.',
  },
  {
    id: 'ag-3',
    clientName: 'Sofía Álvarez',
    clientPhone: '11 4455-6677',
    treatmentName: 'Criolipólisis Plana',
    professionalName: 'Camila Méndez',
    roomName: 'Consultorio 2 - Corporal',
    startTime: '11:00',
    endTime: '12:00',
    status: 'CONFIRMED',
    skinType: 'Normal',
    allergies: 'Ninguna',
    notes: 'Zona abdomen bajo. Ingesta de 2L de agua previa.',
  },
  {
    id: 'ag-4',
    clientName: 'Carla Domínguez',
    clientPhone: '11 2233-4455',
    treatmentName: 'Depilación Láser Diodo Trío',
    professionalName: 'Lucía Fernández',
    roomName: 'Consultorio 3 - Láser',
    startTime: '14:00',
    endTime: '14:40',
    status: 'CONFIRMED',
    skinType: 'Fototipo III',
    allergies: 'Ninguna',
    notes: 'Sesión 4 piernas completas.',
  },
  {
    id: 'ag-5',
    clientName: 'Julieta Romero',
    clientPhone: '11 7788-9900',
    treatmentName: 'Peeling Químico Renovador',
    professionalName: 'Valentina Rossi',
    roomName: 'Consultorio 1 - Facial',
    startTime: '16:00',
    endTime: '16:45',
    status: 'PENDING',
    skinType: 'Grasa con tendencia acneica',
    allergies: 'Aspirina (evitar ácido salicílico)',
    notes: 'Preparación con ácido mandélico al 10%.',
  },
];

export default function AgendaPage() {
  const [items, setItems] = useState<AgendaItem[]>(INITIAL_AGENDA);
  const [selectedProfessional, setSelectedProfessional] = useState<string>('todos');
  const [selectedRoom, setSelectedRoom] = useState<string>('todos');
  const [currentDate, setCurrentDate] = useState<string>('Lunes, 14 de Septiembre 2026');
  const [selectedPatientModal, setSelectedPatientModal] = useState<AgendaItem | null>(null);

  const updateStatus = (id: string, newStatus: AgendaItem['status']) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );
  };

  const filteredItems = items.filter((item) => {
    if (selectedProfessional !== 'todos' && item.professionalName !== selectedProfessional) {
      return false;
    }
    if (selectedRoom !== 'todos' && item.roomName !== selectedRoom) {
      return false;
    }
    return true;
  });

  const getStatusBadge = (status: AgendaItem['status']) => {
    switch (status) {
      case 'IN_PROGRESS':
        return (
          <span style={{ padding: '4px 10px', borderRadius: 'var(--radius-full)', background: 'rgba(217, 119, 6, 0.15)', color: '#d97706', fontSize: 'var(--text-xs)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <PlayCircle size={13} /> En Atención
          </span>
        );
      case 'CONFIRMED':
        return (
          <span style={{ padding: '4px 10px', borderRadius: 'var(--radius-full)', background: 'var(--status-confirmed-bg)', color: 'var(--status-confirmed)', fontSize: 'var(--text-xs)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <CheckCircle2 size={13} /> Confirmado
          </span>
        );
      case 'COMPLETED':
        return (
          <span style={{ padding: '4px 10px', borderRadius: 'var(--radius-full)', background: 'rgba(92, 127, 107, 0.15)', color: 'var(--primary)', fontSize: 'var(--text-xs)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            ✓ Completado
          </span>
        );
      case 'PENDING':
        return (
          <span style={{ padding: '4px 10px', borderRadius: 'var(--radius-full)', background: 'var(--status-pending-bg)', color: 'var(--status-pending)', fontSize: 'var(--text-xs)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <Clock size={13} /> En Espera
          </span>
        );
      case 'CANCELLED':
        return (
          <span style={{ padding: '4px 10px', borderRadius: 'var(--radius-full)', background: 'var(--status-cancelled-bg)', color: 'var(--status-cancelled)', fontSize: 'var(--text-xs)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <XCircle size={13} /> Cancelado
          </span>
        );
      default:
        return <span className="badge">{status}</span>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Date Header & Filters */}
      <div
        style={{
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-light)',
          padding: 'var(--space-6)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 'var(--space-4)',
        }}
      >
        {/* Date Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <button
            className="btn btn--ghost"
            style={{ padding: '8px 12px', border: '1px solid var(--border-light)' }}
            onClick={() => setCurrentDate('Viernes, 11 de Septiembre 2026')}
          >
            <ChevronLeft size={16} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <CalendarIcon size={18} style={{ color: 'var(--primary)' }} />
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-lg)', fontWeight: 600 }}>
              {currentDate}
            </span>
          </div>
          <button
            className="btn btn--ghost"
            style={{ padding: '8px 12px', border: '1px solid var(--border-light)' }}
            onClick={() => setCurrentDate('Martes, 15 de Septiembre 2026')}
          >
            <ChevronRight size={16} />
          </button>
          <button
            className="btn btn--secondary"
            style={{ padding: '6px 14px', fontSize: 'var(--text-xs)' }}
            onClick={() => setCurrentDate('Lunes, 14 de Septiembre 2026')}
          >
            Hoy
          </button>
        </div>

        {/* Filter Controls */}
        <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Filter size={14} style={{ color: 'var(--text-muted)' }} />
            <select
              value={selectedProfessional}
              onChange={(e) => setSelectedProfessional(e.target.value)}
              className="form-input"
              style={{ padding: '6px 12px', fontSize: 'var(--text-xs)', width: 'auto' }}
            >
              <option value="todos">Todas las Profesionales</option>
              <option value="Valentina Rossi">Valentina Rossi</option>
              <option value="Camila Méndez">Camila Méndez</option>
              <option value="Lucía Fernández">Lucía Fernández</option>
            </select>
          </div>

          <div>
            <select
              value={selectedRoom}
              onChange={(e) => setSelectedRoom(e.target.value)}
              className="form-input"
              style={{ padding: '6px 12px', fontSize: 'var(--text-xs)', width: 'auto' }}
            >
              <option value="todos">Todos los Consultorios</option>
              <option value="Consultorio 1 - Facial">Consultorio 1 - Facial</option>
              <option value="Consultorio 2 - Corporal">Consultorio 2 - Corporal</option>
              <option value="Consultorio 3 - Láser">Consultorio 3 - Láser</option>
            </select>
          </div>
        </div>
      </div>

      {/* Agenda Timeline List */}
      <div
        style={{
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-light)',
          padding: 'var(--space-6)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-lg)' }}>
            Turnos del Día ({filteredItems.length})
          </h3>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
            Actualización en tiempo real
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {filteredItems.map((item) => (
            <div
              key={item.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '120px 1fr auto',
                alignItems: 'center',
                gap: 'var(--space-6)',
                padding: 'var(--space-4) var(--space-5)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-light)',
                background: item.status === 'IN_PROGRESS' ? 'rgba(212, 165, 165, 0.08)' : 'var(--bg-secondary)',
                borderLeft: item.status === 'IN_PROGRESS' ? '4px solid var(--accent-rose)' : '1px solid var(--border-light)',
              }}
            >
              {/* Time column */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {item.startTime}
                </span>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                  hasta {item.endTime}
                </span>
              </div>

              {/* Patient & Treatment info */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 4 }}>
                  <button
                    onClick={() => setSelectedPatientModal(item)}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      padding: 0,
                      fontSize: 'var(--text-base)',
                      fontWeight: 600,
                      color: 'var(--primary)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      textDecoration: 'underline',
                    }}
                  >
                    {item.clientName}
                  </button>
                  {getStatusBadge(item.status)}
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-4)', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                  <span><strong>Tratamiento:</strong> {item.treatmentName}</span>
                  <span><strong>Profesional:</strong> {item.professionalName}</span>
                  <span><strong>Lugar:</strong> {item.roomName}</span>
                  <span><strong>Tel:</strong> {item.clientPhone}</span>
                </div>
              </div>

              {/* Quick status actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <select
                  value={item.status}
                  onChange={(e) => updateStatus(item.id, e.target.value as AgendaItem['status'])}
                  className="form-input"
                  style={{
                    padding: '6px 10px',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 600,
                    width: 'auto',
                    cursor: 'pointer',
                  }}
                >
                  <option value="PENDING">En Espera</option>
                  <option value="CONFIRMED">Confirmado</option>
                  <option value="IN_PROGRESS">En Atención</option>
                  <option value="COMPLETED">Completado</option>
                  <option value="CANCELLED">Cancelado</option>
                  <option value="NO_SHOW">Ausente</option>
                </select>

                <button
                  onClick={() => setSelectedPatientModal(item)}
                  title="Ver Ficha Clínica"
                  style={{
                    padding: '8px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-light)',
                    background: 'var(--bg-card)',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                  }}
                >
                  <FileText size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Patient Detail Modal */}
      {selectedPatientModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 'var(--space-4)',
          }}
          onClick={() => setSelectedPatientModal(null)}
        >
          <div
            style={{
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-2xl)',
              padding: 'var(--space-8)',
              maxWidth: 540,
              width: '100%',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-4)' }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)' }}>
                  {selectedPatientModal.clientName}
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
                  Tel: {selectedPatientModal.clientPhone} • {selectedPatientModal.treatmentName}
                </p>
              </div>
              <button
                onClick={() => setSelectedPatientModal(null)}
                className="btn btn--ghost"
                style={{ padding: 4 }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', marginTop: 'var(--space-4)' }}>
              <div style={{ background: 'var(--bg-secondary)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)' }}>
                <p style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 2 }}>
                  BIOTIPO CUTÁNEO / EVALUACIÓN:
                </p>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
                  {selectedPatientModal.skinType || 'Sin especificar'}
                </p>
              </div>

              <div style={{ background: 'rgba(212, 165, 165, 0.15)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)' }}>
                <p style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--accent-rose)', marginBottom: 2 }}>
                  ALERGIAS O CONTRAINDICACIONES:
                </p>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
                  {selectedPatientModal.allergies || 'Ninguna'}
                </p>
              </div>

              <div>
                <p style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>
                  NOTAS DE LA SESIÓN:
                </p>
                <textarea
                  defaultValue={selectedPatientModal.notes}
                  rows={3}
                  className="form-input"
                  style={{ width: '100%', fontSize: 'var(--text-sm)' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
                <button
                  onClick={() => setSelectedPatientModal(null)}
                  className="btn btn--primary"
                >
                  Guardar Observaciones
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
