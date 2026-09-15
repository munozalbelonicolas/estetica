'use client';

import { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Users,
  Calendar,
  Download,
  Filter,
} from 'lucide-react';
import { getAllAppointments, getAllUsers, Appointment } from '@/lib/firestore-service';

export default function AdminReportesPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [userCount, setUserCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [appts, users] = await Promise.all([getAllAppointments(), getAllUsers()]);
        setAppointments(appts);
        setUserCount(users.length);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const totalRevenue = appointments
    .filter((a) => a.status !== 'cancelled')
    .reduce((sum, a) => sum + (Number(a.treatmentPrice) || 0), 0);

  const completedCount = appointments.filter((a) => a.status === 'completed').length;
  const avgTicket = appointments.length > 0 ? Math.round(totalRevenue / (appointments.length || 1)) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)' }}>
            Estadísticas & Reportes
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
            Métricas de facturación estimada y turnos calculadas en tiempo real desde la base de datos.
          </p>
        </div>

        <button
          onClick={() => {
            const csvContent =
              'data:text/csv;charset=utf-8,' +
              'ID,Fecha,Horario,Cliente,Tratamiento,Arancel,Estado\n' +
              appointments
                .map((a) => `${a.id},${a.date},${a.time},"${a.clientName}","${a.treatmentName}",${a.treatmentPrice},${a.status}`)
                .join('\n');
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement('a');
            link.setAttribute('href', encodedUri);
            link.setAttribute('download', `reporte_turnos_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }}
          className="btn btn--secondary"
          style={{ fontSize: 'var(--text-xs)' }}
        >
          <Download size={14} /> Exportar Reporte CSV
        </button>
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
            Facturación Total
          </p>
          <p style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, color: 'var(--accent-gold)' }}>
            ${totalRevenue.toLocaleString('es-AR')}
          </p>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 4 }}>
            {appointments.length} turnos registrados
          </p>
        </div>

        <div className="card" style={{ padding: 'var(--space-5)', background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-light)' }}>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', fontWeight: 600 }}>
            Turnos Concretados
          </p>
          <p style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, color: 'var(--primary)' }}>
            {completedCount}
          </p>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: 4 }}>
            Sesiones finalizadas
          </p>
        </div>

        <div className="card" style={{ padding: 'var(--space-5)', background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-light)' }}>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', fontWeight: 600 }}>
            Ticket Promedio
          </p>
          <p style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, color: 'var(--text-primary)' }}>
            ${avgTicket.toLocaleString('es-AR')}
          </p>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 4 }}>
            Por turno agendado
          </p>
        </div>

        <div className="card" style={{ padding: 'var(--space-5)', background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-light)' }}>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', fontWeight: 600 }}>
            Usuarios / Pacientes
          </p>
          <p style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, color: 'var(--accent-teal)' }}>
            {userCount}
          </p>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: 4 }}>
            Registrados en la base de datos
          </p>
        </div>
      </div>
    </div>
  );
}
