import type { Metadata } from 'next';
import {
  Calendar,
  Users,
  UserPlus,
  XCircle,
  TrendingUp,
  Clock,
  Sparkles,
} from 'lucide-react';
import './dashboard.css';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Dashboard Administrativo — MOON Golden Beauty',
};

const FALLBACK_STATS = {
  totalClients: 154,
  newClientsThisMonth: 28,
  newClientsLastMonth: 19,
  todayAppointments: 9,
  weekAppointments: 42,
  monthAppointments: 138,
  lastMonthAppointments: 114,
  monthVariation: 21,
  cancelledThisMonth: 6,
  completedThisMonth: 122,
  noShowThisMonth: 3,
  topTreatments: [
    { name: 'Limpieza Facial Profunda', count: 48 },
    { name: 'Radiofrecuencia Facial Tripolar', count: 34 },
    { name: 'Criolipólisis Plana', count: 26 },
    { name: 'Depilación Láser Diodo', count: 20 },
    { name: 'Peeling Químico Médico', count: 10 },
  ],
  appointmentsByHour: [
    { hour: '09:00', count: 12 },
    { hour: '10:00', count: 18 },
    { hour: '11:00', count: 16 },
    { hour: '14:00', count: 14 },
    { hour: '15:00', count: 22 },
    { hour: '16:00', count: 25 },
    { hour: '17:00', count: 21 },
    { hour: '18:00', count: 10 },
  ],
};

async function getStats() {
  return FALLBACK_STATS;
}

export default async function AdminDashboard() {
  const stats = await getStats();

  return (
    <div className="dashboard">
      <div className="admin-page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Resumen general de la estética y métricas clave</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="dashboard__stats">
        <div className="stat-card">
          <div className="stat-card__icon stat-card__icon--teal">
            <Calendar size={22} />
          </div>
          <div>
            <p className="stat-card__label">Turnos Hoy</p>
            <p className="stat-card__value">{stats.todayAppointments}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card__icon stat-card__icon--gold">
            <Users size={22} />
          </div>
          <div>
            <p className="stat-card__label">Total Clientes</p>
            <p className="stat-card__value">{stats.totalClients}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card__icon stat-card__icon--green">
            <UserPlus size={22} />
          </div>
          <div>
            <p className="stat-card__label">Nuevos este mes</p>
            <p className="stat-card__value">{stats.newClientsThisMonth}</p>
            {stats.newClientsLastMonth > 0 && (
              <p
                className={`stat-card__change ${
                  stats.newClientsThisMonth >= stats.newClientsLastMonth
                    ? 'stat-card__change--positive'
                    : 'stat-card__change--negative'
                }`}
              >
                {stats.newClientsThisMonth >= stats.newClientsLastMonth ? '↑' : '↓'}{' '}
                vs {stats.newClientsLastMonth} mes anterior
              </p>
            )}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card__icon stat-card__icon--rose">
            <XCircle size={22} />
          </div>
          <div>
            <p className="stat-card__label">Cancelaciones</p>
            <p className="stat-card__value">{stats.cancelledThisMonth}</p>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="dashboard__charts">
        {/* Monthly Overview */}
        <div className="dashboard__chart-card card">
          <div className="card__body">
            <div className="flex items-center justify-between mb-4">
              <h3 className="dashboard__chart-title">Turnos del Mes</h3>
              <div className="badge badge--teal">
                <TrendingUp size={14} />
                {stats.monthVariation >= 0 ? '+' : ''}
                {stats.monthVariation}%
              </div>
            </div>
            <div className="dashboard__month-stats">
              <div className="dashboard__month-stat">
                <span className="dashboard__month-stat-value">{stats.monthAppointments}</span>
                <span className="dashboard__month-stat-label">Este mes</span>
              </div>
              <div className="dashboard__month-stat">
                <span className="dashboard__month-stat-value">{stats.weekAppointments}</span>
                <span className="dashboard__month-stat-label">Esta semana</span>
              </div>
              <div className="dashboard__month-stat">
                <span className="dashboard__month-stat-value">{stats.completedThisMonth}</span>
                <span className="dashboard__month-stat-label">Realizados</span>
              </div>
              <div className="dashboard__month-stat">
                <span className="dashboard__month-stat-value">{stats.noShowThisMonth}</span>
                <span className="dashboard__month-stat-label">Ausentes</span>
              </div>
            </div>
            <div className="dashboard__comparison">
              <p className="dashboard__comparison-text">
                Mes anterior: <strong>{stats.lastMonthAppointments}</strong> turnos
              </p>
            </div>
          </div>
        </div>

        {/* Top Treatments */}
        <div className="dashboard__chart-card card">
          <div className="card__body">
            <h3 className="dashboard__chart-title">
              <Sparkles size={18} />
              Tratamientos más solicitados
            </h3>
            <div className="dashboard__top-list">
              {stats.topTreatments.map((t, i) => (
                <div key={i} className="dashboard__top-item">
                  <span className="dashboard__top-rank">{i + 1}</span>
                  <span className="dashboard__top-name">{t.name}</span>
                  <div className="dashboard__top-bar-wrapper">
                    <div
                      className="dashboard__top-bar"
                      style={{
                        width: `${(t.count / (stats.topTreatments[0]?.count || 1)) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="dashboard__top-count">{t.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Hours Heatmap */}
      <div className="dashboard__chart-card card">
        <div className="card__body">
          <h3 className="dashboard__chart-title">
            <Clock size={18} />
            Demanda por horario (este mes)
          </h3>
          <div className="dashboard__hours-grid">
            {stats.appointmentsByHour.map((h) => {
              const maxCount = Math.max(...stats.appointmentsByHour.map((x) => x.count));
              const intensity = maxCount > 0 ? h.count / maxCount : 0;
              return (
                <div key={h.hour} className="dashboard__hour-item">
                  <span className="dashboard__hour-label">{h.hour}</span>
                  <div className="dashboard__hour-bar-wrapper">
                    <div
                      className="dashboard__hour-bar"
                      style={{
                        width: `${intensity * 100}%`,
                        opacity: 0.3 + intensity * 0.7,
                      }}
                    />
                  </div>
                  <span className="dashboard__hour-count">{h.count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
