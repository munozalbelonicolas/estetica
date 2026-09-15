'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Users,
  UserPlus,
  XCircle,
  TrendingUp,
  Clock,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { getAllAppointments, getAllUsers, getTreatments, Appointment, UserProfile, Treatment } from '@/lib/firestore-service';
import './dashboard.css';

export default function AdminDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [appts, usrs, trts] = await Promise.all([
          getAllAppointments(),
          getAllUsers(),
          getTreatments(),
        ]);
        setAppointments(appts);
        setUsers(usrs);
        setTreatments(trts);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter((a) => a.date === todayStr);
  const totalClients = users.length;
  const completedAppointments = appointments.filter((a) => a.status === 'completed');
  const cancelledAppointments = appointments.filter((a) => a.status === 'cancelled');

  // Treatment frequency count
  const treatmentCounts: Record<string, number> = {};
  appointments.forEach((a) => {
    if (a.treatmentName) {
      treatmentCounts[a.treatmentName] = (treatmentCounts[a.treatmentName] || 0) + 1;
    }
  });

  const topTreatments = Object.entries(treatmentCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return (
    <div className="dashboard">
      <div className="admin-page-header">
        <div>
          <h1>Dashboard Administrativo</h1>
          <p>Métricas en tiempo real desde la base de datos de MOON Golden Beauty</p>
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
            <p className="stat-card__value">{loading ? '...' : todayAppointments.length}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card__icon stat-card__icon--gold">
            <Users size={22} />
          </div>
          <div>
            <p className="stat-card__label">Total Usuarios / Clientes</p>
            <p className="stat-card__value">{loading ? '...' : totalClients}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card__icon stat-card__icon--green">
            <UserPlus size={22} />
          </div>
          <div>
            <p className="stat-card__label">Turnos Realizados</p>
            <p className="stat-card__value">{loading ? '...' : completedAppointments.length}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card__icon stat-card__icon--rose">
            <XCircle size={22} />
          </div>
          <div>
            <p className="stat-card__label">Cancelaciones</p>
            <p className="stat-card__value">{loading ? '...' : cancelledAppointments.length}</p>
          </div>
        </div>
      </div>

      {/* Charts / Data Row */}
      <div className="dashboard__charts">
        {/* Appointments Summary */}
        <div className="dashboard__chart-card card">
          <div className="card__body">
            <div className="flex items-center justify-between mb-4">
              <h3 className="dashboard__chart-title">Turnos en Base de Datos</h3>
              <Link href="/admin/agenda" className="badge badge--teal" style={{ textDecoration: 'none', cursor: 'pointer' }}>
                Ver Agenda Global <ArrowRight size={12} style={{ marginLeft: 4 }} />
              </Link>
            </div>
            <div className="dashboard__month-stats">
              <div className="dashboard__month-stat">
                <span className="dashboard__month-stat-value">{appointments.length}</span>
                <span className="dashboard__month-stat-label">Total Registrados</span>
              </div>
              <div className="dashboard__month-stat">
                <span className="dashboard__month-stat-value">{todayAppointments.length}</span>
                <span className="dashboard__month-stat-label">Para hoy</span>
              </div>
              <div className="dashboard__month-stat">
                <span className="dashboard__month-stat-value">{completedAppointments.length}</span>
                <span className="dashboard__month-stat-label">Completados</span>
              </div>
              <div className="dashboard__month-stat">
                <span className="dashboard__month-stat-value">{cancelledAppointments.length}</span>
                <span className="dashboard__month-stat-label">Cancelados</span>
              </div>
            </div>
          </div>
        </div>

        {/* Top Treatments */}
        <div className="dashboard__chart-card card">
          <div className="card__body">
            <h3 className="dashboard__chart-title">
              <Sparkles size={18} />
              Tratamientos Solicitados
            </h3>
            {topTreatments.length === 0 ? (
              <div style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>
                Los tratamientos más solicitados se calcularán automáticamente conforme se agenden turnos.
              </div>
            ) : (
              <div className="dashboard__top-list">
                {topTreatments.map((t, i) => (
                  <div key={i} className="dashboard__top-item">
                    <span className="dashboard__top-rank">{i + 1}</span>
                    <span className="dashboard__top-name">{t.name}</span>
                    <div className="dashboard__top-bar-wrapper">
                      <div
                        className="dashboard__top-bar"
                        style={{
                          width: `${(t.count / (topTreatments[0]?.count || 1)) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="dashboard__top-count">{t.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
