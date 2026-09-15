'use client';

import { useState, useEffect } from 'react';
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
  Filter,
  FileText,
} from 'lucide-react';
import { getAllAppointments, updateAppointmentStatus, Appointment } from '@/lib/firestore-service';

export default function ProfessionalAgendaPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfessional, setSelectedProfessional] = useState<string>('todos');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const data = await getAllAppointments();
      setAppointments(data);
    } catch (e) {
      console.error(e);
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
      alert('Error al actualizar estado en Firestore');
    }
  };

  const filtered = appointments.filter((a) => {
    if (selectedProfessional !== 'todos' && a.professionalName !== selectedProfessional) {
      return false;
    }
    return true;
  });

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
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <CalendarIcon size={18} style={{ color: 'var(--primary)' }} />
          <span style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-lg)', fontWeight: 600 }}>
            Agenda de Turnos Clínicos
          </span>
        </div>

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
              <option value="Lic. Melanie Mancin">Lic. Melanie Mancin</option>
              <option value="Lic. Nicolás Muñoz">Lic. Nicolás Muñoz</option>
              <option value="Lic. Laura Benítez">Lic. Laura Benítez</option>
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
            Turnos en Base de Datos ({filtered.length})
          </h3>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
            Sincronizado con Firestore
          </span>
        </div>

        {loading ? (
          <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--text-muted)' }}>
            Cargando agenda desde la base de datos...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 'var(--space-12)', textAlign: 'center' }}>
            <CalendarIcon size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 8 }}>
              No hay turnos registrados en la agenda
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginBottom: 20 }}>
              Los turnos asignados a los profesionales aparecerán aquí al ser reservados.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {filtered.map((item) => (
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
                  background: 'var(--bg-secondary)',
                }}
              >
                {/* Time column */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {item.time} hs
                  </span>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                    {item.date}
                  </span>
                </div>

                {/* Patient & Treatment info */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 4 }}>
                    <span style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {item.clientName}
                    </span>
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: 'var(--text-xs)',
                        fontWeight: 600,
                        background:
                          item.status === 'completed'
                            ? 'rgba(92, 127, 107, 0.15)'
                            : item.status === 'confirmed'
                            ? 'var(--status-confirmed-bg)'
                            : 'var(--bg-card)',
                        color:
                          item.status === 'completed'
                            ? 'var(--primary)'
                            : item.status === 'confirmed'
                            ? 'var(--status-confirmed)'
                            : 'var(--text-secondary)',
                      }}
                    >
                      {item.status.toUpperCase()}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-4)', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                    <span><strong>Tratamiento:</strong> {item.treatmentName}</span>
                    <span><strong>Profesional:</strong> {item.professionalName}</span>
                    <span><strong>Contacto:</strong> {item.clientPhone || item.clientEmail}</span>
                  </div>
                </div>

                {/* Status action */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <select
                    value={item.status}
                    onChange={(e) => handleUpdateStatus(item.id, e.target.value as Appointment['status'])}
                    className="form-input"
                    style={{
                      padding: '6px 10px',
                      fontSize: 'var(--text-xs)',
                      fontWeight: 600,
                      width: 'auto',
                      cursor: 'pointer',
                    }}
                  >
                    <option value="pending">En Espera</option>
                    <option value="confirmed">Confirmado</option>
                    <option value="completed">Completado</option>
                    <option value="cancelled">Cancelado</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
