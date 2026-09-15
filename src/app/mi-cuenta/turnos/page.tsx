'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  User,
  MapPin,
  CheckCircle2,
  XCircle,
  Plus,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getAppointmentsByClient, updateAppointmentStatus, Appointment } from '@/lib/firestore-service';

export default function MisTurnosPage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [activeTab, setActiveTab] = useState<'proximos' | 'historial'>('proximos');
  const [loading, setLoading] = useState(true);

  const loadAppointments = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await getAppointmentsByClient(user.uid);
      setAppointments(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, [user]);

  const handleCancelAppointment = async (id: string) => {
    if (!confirm('¿Estás seguro/a de que deseas cancelar este turno?')) return;
    try {
      await updateAppointmentStatus(id, 'cancelled');
      setAppointments((prev) =>
        prev.map((apt) => (apt.id === id ? { ...apt, status: 'cancelled' } : apt))
      );
    } catch (e) {
      alert('Error al cancelar turno en la base de datos');
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const upcomingAppointments = appointments.filter(
    (a) => a.date >= todayStr && a.status !== 'cancelled' && a.status !== 'completed'
  );

  const pastAppointments = appointments.filter(
    (a) => a.date < todayStr || a.status === 'cancelled' || a.status === 'completed'
  );

  const displayedList = activeTab === 'proximos' ? upcomingAppointments : pastAppointments;

  const getStatusBadge = (status: Appointment['status']) => {
    switch (status) {
      case 'confirmed':
        return (
          <span style={{ padding: '4px 10px', borderRadius: 'var(--radius-full)', background: 'var(--status-confirmed-bg)', color: 'var(--status-confirmed)', fontSize: 'var(--text-xs)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <CheckCircle2 size={13} /> Confirmado
          </span>
        );
      case 'pending':
        return (
          <span style={{ padding: '4px 10px', borderRadius: 'var(--radius-full)', background: 'var(--status-pending-bg)', color: 'var(--status-pending)', fontSize: 'var(--text-xs)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <Clock size={13} /> Pendiente
          </span>
        );
      case 'completed':
        return (
          <span style={{ padding: '4px 10px', borderRadius: 'var(--radius-full)', background: 'rgba(92, 127, 107, 0.15)', color: 'var(--primary)', fontSize: 'var(--text-xs)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            ✓ Realizado
          </span>
        );
      case 'cancelled':
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
    <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-light)', padding: 'var(--space-8)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)', marginBottom: 4 }}>
            Gestión de Mis Turnos
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
            Consulta tus horarios programados, estados de confirmación y tratamientos realizados.
          </p>
        </div>

        <Link href="/reservar" className="btn btn--primary">
          <Plus size={16} /> Reservar Nuevo Turno
        </Link>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 'var(--space-2)', borderBottom: '1px solid var(--border-light)', marginBottom: 'var(--space-6)' }}>
        <button
          onClick={() => setActiveTab('proximos')}
          style={{
            padding: 'var(--space-3) var(--space-5)',
            border: 'none',
            background: 'transparent',
            borderBottom: activeTab === 'proximos' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'proximos' ? 'var(--primary)' : 'var(--text-secondary)',
            fontWeight: 600,
            fontSize: 'var(--text-sm)',
            cursor: 'pointer',
          }}
        >
          Próximos Turnos ({upcomingAppointments.length})
        </button>
        <button
          onClick={() => setActiveTab('historial')}
          style={{
            padding: 'var(--space-3) var(--space-5)',
            border: 'none',
            background: 'transparent',
            borderBottom: activeTab === 'historial' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'historial' ? 'var(--primary)' : 'var(--text-secondary)',
            fontWeight: 600,
            fontSize: 'var(--text-sm)',
            cursor: 'pointer',
          }}
        >
          Historial Pasado ({pastAppointments.length})
        </button>
      </div>

      {/* Appointment Cards */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-12) 0', color: 'var(--text-muted)' }}>
          Cargando tus turnos desde la base de datos...
        </div>
      ) : displayedList.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-12) 0', color: 'var(--text-muted)' }}>
          <Calendar size={48} style={{ margin: '0 auto var(--space-3)', opacity: 0.5 }} />
          <p style={{ fontSize: 'var(--text-base)', marginBottom: 'var(--space-4)' }}>
            {activeTab === 'proximos'
              ? 'No tienes turnos próximos programados en tu cuenta.'
              : 'No hay historial de turnos finalizados.'}
          </p>
          {activeTab === 'proximos' && (
            <Link href="/reservar" className="btn btn--secondary">
              Explorar tratamientos y reservar
            </Link>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {displayedList.map((apt) => (
            <div
              key={apt.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 'var(--space-4)',
                padding: 'var(--space-5) var(--space-6)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-light)',
                background: 'var(--bg-secondary)',
              }}
            >
              <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-light)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    color: 'var(--primary)',
                  }}
                >
                  <span style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                    {new Date(apt.date + 'T00:00:00').toLocaleDateString('es-AR', { month: 'short' })}
                  </span>
                  <span style={{ fontSize: 'var(--text-lg)', lineHeight: 1 }}>
                    {new Date(apt.date + 'T00:00:00').getDate()}
                  </span>
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 4 }}>
                    <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600 }}>{apt.treatmentName}</h3>
                    {getStatusBadge(apt.status)}
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-4)', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={14} /> {apt.time} hs ({apt.treatmentDuration || 45} min)
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <User size={14} /> Prof. {apt.professionalName}
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 600, color: 'var(--accent-gold)' }}>
                      ${apt.treatmentPrice?.toLocaleString('es-AR')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div>
                {apt.status === 'confirmed' || apt.status === 'pending' ? (
                  <button
                    onClick={() => handleCancelAppointment(apt.id)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--status-cancelled)',
                      background: 'transparent',
                      color: 'var(--status-cancelled)',
                      fontSize: 'var(--text-xs)',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    Cancelar Turno
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
