'use client';

import { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Users,
  Calendar,
  Clock,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getAllAppointments, Appointment } from '@/lib/firestore-service';

export default function ProfessionalReportesPage() {
  const { userProfile, user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const currentProfName = userProfile?.firstName
    ? `${userProfile.firstName} ${userProfile.lastName || ''}`.trim()
    : 'Lic. Melanie Mancin';

  useEffect(() => {
    async function load() {
      try {
        const all = await getAllAppointments();
        // Filter strictly for the current professional
        const myAppts = all.filter(
          (a) =>
            a.professionalName?.toLowerCase().includes(currentProfName.toLowerCase()) ||
            a.professionalName?.toLowerCase().includes((userProfile?.firstName || '').toLowerCase())
        );
        setAppointments(myAppts);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [currentProfName, userProfile]);

  const totalMyRevenue = appointments
    .filter((a) => a.status !== 'cancelled')
    .reduce((sum, a) => sum + (Number(a.treatmentPrice) || 0), 0);

  const completedCount = appointments.filter((a) => a.status === 'completed').length;
  const pendingCount = appointments.filter((a) => a.status === 'pending' || a.status === 'confirmed').length;
  const avgTicket = appointments.length > 0 ? Math.round(totalMyRevenue / (appointments.length || 1)) : 0;

  // Most performed treatments by this professional
  const treatmentCounts: Record<string, number> = {};
  appointments.forEach((a) => {
    if (a.treatmentName) {
      treatmentCounts[a.treatmentName] = (treatmentCounts[a.treatmentName] || 0) + 1;
    }
  });

  const topTreatments = Object.entries(treatmentCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)' }}>
          Mi Rendimiento & Estadísticas Personales
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-xs)' }}>
          Panel individual de atención de <strong>{currentProfName}</strong>. Métricas confidenciales exclusivas de tu actividad.
        </p>
      </div>

      {/* Summary Stat Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 'var(--space-4)',
        }}
      >
        <div className="card" style={{ padding: 'var(--space-5)', background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-light)' }}>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', fontWeight: 600 }}>
            Mi Facturación Generada
          </p>
          <p style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, color: 'var(--accent-gold)' }}>
            ${totalMyRevenue.toLocaleString('es-AR')}
          </p>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 4 }}>
            {appointments.length} turnos asignados a ti
          </p>
        </div>

        <div className="card" style={{ padding: 'var(--space-5)', background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-light)' }}>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', fontWeight: 600 }}>
            Sesiones Concretadas
          </p>
          <p style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, color: 'var(--primary)' }}>
            {completedCount}
          </p>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: 4 }}>
            {pendingCount} turnos programados pendientes
          </p>
        </div>

        <div className="card" style={{ padding: 'var(--space-5)', background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-light)' }}>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', fontWeight: 600 }}>
            Ticket Promedio por Paciente
          </p>
          <p style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, color: 'var(--text-primary)' }}>
            ${avgTicket.toLocaleString('es-AR')}
          </p>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 4 }}>
            En tus consultas realizadas
          </p>
        </div>

        <div className="card" style={{ padding: 'var(--space-5)', background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-light)' }}>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', fontWeight: 600 }}>
            Efectividad de Atención
          </p>
          <p style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, color: 'var(--accent-teal)' }}>
            {appointments.length > 0 ? Math.round((completedCount / appointments.length) * 100) : 100}%
          </p>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: 4 }}>
            Tasa de sesiones completadas
          </p>
        </div>
      </div>

      {/* Top treatments breakdown for this professional */}
      <div
        style={{
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-light)',
          padding: 'var(--space-6)',
        }}
      >
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-lg)', marginBottom: 'var(--space-4)' }}>
          Tratamientos más realizados por ti
        </h3>

        {topTreatments.length === 0 ? (
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
            Aún no tienes turnos registrados para calcular tus tratamientos más solicitados.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {topTreatments.map((t, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--bg-secondary)', borderRadius: 8 }}>
                <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{t.name}</span>
                <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: 'var(--text-sm)' }}>
                  {t.count} {t.count === 1 ? 'sesión' : 'sesiones'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
