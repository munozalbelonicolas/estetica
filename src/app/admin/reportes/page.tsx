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
  UserCheck,
  Sparkles,
} from 'lucide-react';
import { getAllAppointments, getAllUsers, getProfessionals, Appointment, Professional } from '@/lib/firestore-service';

export default function AdminReportesPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [userCount, setUserCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedProf, setSelectedProf] = useState<string>('todos');

  useEffect(() => {
    async function load() {
      try {
        const [appts, users, profs] = await Promise.all([
          getAllAppointments(),
          getAllUsers(),
          getProfessionals(),
        ]);
        setAppointments(appts);
        setUserCount(users.length);
        setProfessionals(profs);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Filtered by selected professional if not 'todos'
  const filteredAppointments = selectedProf === 'todos'
    ? appointments
    : appointments.filter((a) => a.professionalName === selectedProf);

  const totalRevenue = filteredAppointments
    .filter((a) => a.status !== 'cancelled')
    .reduce((sum, a) => sum + (Number(a.treatmentPrice) || 0), 0);

  const completedCount = filteredAppointments.filter((a) => a.status === 'completed').length;
  const pendingCount = filteredAppointments.filter((a) => a.status === 'pending' || a.status === 'confirmed').length;
  const avgTicket = filteredAppointments.length > 0 ? Math.round(totalRevenue / (filteredAppointments.length || 1)) : 0;

  // Breakdown by professional
  const profStats: Record<string, { total: number; revenue: number; completed: number }> = {};
  appointments.forEach((a) => {
    const profName = a.professionalName || 'Sin asignar';
    if (!profStats[profName]) {
      profStats[profName] = { total: 0, revenue: 0, completed: 0 };
    }
    profStats[profName].total += 1;
    if (a.status !== 'cancelled') {
      profStats[profName].revenue += Number(a.treatmentPrice) || 0;
    }
    if (a.status === 'completed') {
      profStats[profName].completed += 1;
    }
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)' }}>
            Estadísticas & Reportes Ejecutivos (Admin)
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
            Visión global de facturación, volumen general y desglose individual por cada profesional.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Professional Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Filter size={14} style={{ color: 'var(--text-muted)' }} />
            <select
              value={selectedProf}
              onChange={(e) => setSelectedProf(e.target.value)}
              className="form-input"
              style={{ width: 'auto', fontSize: 'var(--text-xs)' }}
            >
              <option value="todos">📊 Visión General (Todos los Profesionales)</option>
              {professionals.map((p) => (
                <option key={p.id} value={p.name}>👤 Solo {p.name}</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => {
              const csvContent =
                'data:text/csv;charset=utf-8,' +
                'ID,Fecha,Horario,Cliente,Tratamiento,Profesional,Arancel,Estado\n' +
                filteredAppointments
                  .map((a) => `${a.id},${a.date},${a.time},"${a.clientName}","${a.treatmentName}","${a.professionalName}",${a.treatmentPrice},${a.status}`)
                  .join('\n');
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement('a');
              link.setAttribute('href', encodedUri);
              link.setAttribute('download', `reporte_admin_${selectedProf.replace(/ /g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className="btn btn--secondary"
            style={{ fontSize: 'var(--text-xs)' }}
          >
            <Download size={14} /> Exportar CSV
          </button>
        </div>
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
            {selectedProf === 'todos' ? 'Facturación Total General' : `Facturación — ${selectedProf}`}
          </p>
          <p style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, color: 'var(--accent-gold)' }}>
            ${totalRevenue.toLocaleString('es-AR')}
          </p>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 4 }}>
            {filteredAppointments.length} turnos {selectedProf === 'todos' ? 'en total' : 'asignados'}
          </p>
        </div>

        <div className="card" style={{ padding: 'var(--space-5)', background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-light)' }}>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', fontWeight: 600 }}>
            Turnos Realizados
          </p>
          <p style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, color: 'var(--primary)' }}>
            {completedCount}
          </p>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: 4 }}>
            {pendingCount} turnos pendientes
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
            Por turno atendido
          </p>
        </div>

        <div className="card" style={{ padding: 'var(--space-5)', background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-light)' }}>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', fontWeight: 600 }}>
            Pacientes / Usuarios
          </p>
          <p style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, color: 'var(--accent-teal)' }}>
            {userCount}
          </p>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: 4 }}>
            Registrados en la base de datos
          </p>
        </div>
      </div>

      {/* Breakdown per Professional (Admin privilege) */}
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
            Rendimiento Comparativo por Profesional
          </h3>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--accent-gold)', fontWeight: 600 }}>
            Acceso exclusivo Administrador
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 'var(--text-sm)' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-light)', color: 'var(--text-muted)', fontSize: 'var(--text-xs)', textTransform: 'uppercase' }}>
                <th style={{ padding: '12px 16px' }}>Profesional</th>
                <th style={{ padding: '12px 16px' }}>Turnos Asignados</th>
                <th style={{ padding: '12px 16px' }}>Turnos Completados</th>
                <th style={{ padding: '12px 16px' }}>Facturación Generada</th>
                <th style={{ padding: '12px 16px' }}>Tasa de Concreción</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(profStats).length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No hay turnos registrados para calcular estadísticas por profesional.
                  </td>
                </tr>
              ) : (
                Object.entries(profStats).map(([name, stat]) => {
                  const rate = stat.total > 0 ? Math.round((stat.completed / stat.total) * 100) : 0;
                  return (
                    <tr key={name} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '14px 16px', fontWeight: 600 }}>{name}</td>
                      <td style={{ padding: '14px 16px' }}>{stat.total} turnos</td>
                      <td style={{ padding: '14px 16px', color: 'var(--primary)', fontWeight: 600 }}>
                        {stat.completed}
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--accent-gold)' }}>
                        ${stat.revenue.toLocaleString('es-AR')}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 80, height: 6, background: 'var(--bg-secondary)', borderRadius: 4, overflow: 'hidden' }}>
                            <div style={{ width: `${rate}%`, height: '100%', background: 'var(--primary)' }} />
                          </div>
                          <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600 }}>{rate}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
