'use client';

import { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Users,
  Calendar,
  Download,
  Filter,
} from 'lucide-react';

export default function AdminReportesPage() {
  const [period, setPeriod] = useState<'mes' | 'trimestre' | 'anio'>('mes');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)' }}>
            Estadísticas & Reportes
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
            Métricas de facturación estimada, ocupación de consultorios y retención de pacientes.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ display: 'flex', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', padding: 2 }}>
            <button
              onClick={() => setPeriod('mes')}
              style={{
                padding: '6px 14px',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                background: period === 'mes' ? 'var(--primary)' : 'transparent',
                color: period === 'mes' ? '#fff' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: 'var(--text-xs)',
                cursor: 'pointer',
              }}
            >
              Mes Actual
            </button>
            <button
              onClick={() => setPeriod('trimestre')}
              style={{
                padding: '6px 14px',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                background: period === 'trimestre' ? 'var(--primary)' : 'transparent',
                color: period === 'trimestre' ? '#fff' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: 'var(--text-xs)',
                cursor: 'pointer',
              }}
            >
              Trimestre
            </button>
          </div>

          <button
            onClick={() => alert('Exportando reporte a formato CSV/Excel...')}
            className="btn btn--secondary"
            style={{ fontSize: 'var(--text-xs)' }}
          >
            <Download size={14} /> Exportar
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
            Facturación Estimada
          </p>
          <p style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, color: 'var(--accent-gold)' }}>
            $4.850.000
          </p>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--accent-teal)', marginTop: 4, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <TrendingUp size={12} /> +18% vs período anterior
          </p>
        </div>

        <div className="card" style={{ padding: 'var(--space-5)', background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-light)' }}>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', fontWeight: 600 }}>
            Tasa de Ocupación de Consultorios
          </p>
          <p style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, color: 'var(--primary)' }}>
            82.4%
          </p>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: 4 }}>
            Capacidad óptima en horas pico
          </p>
        </div>

        <div className="card" style={{ padding: 'var(--space-5)', background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-light)' }}>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', fontWeight: 600 }}>
            Ticket Promedio por Turno
          </p>
          <p style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, color: 'var(--text-primary)' }}>
            $35.140
          </p>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 4 }}>
            138 turnos concretados
          </p>
        </div>

        <div className="card" style={{ padding: 'var(--space-5)', background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-light)' }}>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', fontWeight: 600 }}>
            Retención de Pacientes
          </p>
          <p style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, color: 'var(--accent-teal)' }}>
            76%
          </p>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: 4 }}>
            Pacientes que reservan más de 2 sesiones
          </p>
        </div>
      </div>

      {/* Consultorios Occupancy */}
      <div
        style={{
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-light)',
          padding: 'var(--space-6)',
        }}
      >
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-lg)', marginBottom: 'var(--space-4)' }}>
          Distribución de Ocupación por Consultorio
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {[
            { name: 'Consultorio 1 - Facial & Dermocosmética', percent: 88, hours: '142 hrs' },
            { name: 'Consultorio 2 - Modelado Corporal & Masajes', percent: 81, hours: '128 hrs' },
            { name: 'Consultorio 3 - Láser Diodo Trío', percent: 78, hours: '115 hrs' },
          ].map((room, i) => (
            <div key={i}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)', marginBottom: 6 }}>
                <span style={{ fontWeight: 600 }}>{room.name}</span>
                <span style={{ color: 'var(--text-secondary)' }}>{room.percent}% ({room.hours})</span>
              </div>
              <div style={{ width: '100%', height: 10, background: 'var(--bg-secondary)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                <div style={{ width: `${room.percent}%`, height: '100%', background: 'var(--primary)', borderRadius: 'var(--radius-full)' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
