'use client';

import { useState } from 'react';
import { DoorOpen, Plus, CheckCircle2, XCircle, Sparkles } from 'lucide-react';

interface Room {
  id: string;
  name: string;
  description: string;
  equipment: string[];
  isActive: boolean;
}

const DEMO_ROOMS: Room[] = [
  {
    id: 'r-1',
    name: 'Consultorio 1 - Facial & Dermocosmética',
    description: 'Equipado para limpieza profunda, peelings químicos y alta frecuencia.',
    equipment: ['Punta de diamante', 'Vaporizador de ozono', 'Lámpara de Wood', 'Alta frecuencia'],
    isActive: true,
  },
  {
    id: 'r-2',
    name: 'Consultorio 2 - Modelado Corporal & Masajes',
    description: 'Ambiente climatizado, camilla hidráulica ergonómica y aromaterapia.',
    equipment: ['Equipo Criolipólisis Plana 4 cabezales', 'Ultracavitador', 'Camilla de madera termorregulada'],
    isActive: true,
  },
  {
    id: 'r-3',
    name: 'Consultorio 3 - Láser Diodo Trío',
    description: 'Sala con protección visual, filtros ópticos y cabezal continuo bajo cero.',
    equipment: ['Láser Diodo Trío 808nm', 'Gafas de protección láser grado médico', 'Sistema de enfriamiento chiller'],
    isActive: true,
  },
];

export default function AdminConsultoriosPage() {
  const [rooms, setRooms] = useState<Room[]>(DEMO_ROOMS);

  const toggleActive = (id: string) => {
    setRooms((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isActive: !r.isActive } : r))
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)' }}>
            Consultorios & Boxes
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
            Gestión de espacios físicos, equipamiento médico asignado y habilitación de turnos.
          </p>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 'var(--space-6)',
        }}
      >
        {rooms.map((room) => (
          <div
            key={room.id}
            className="card"
            style={{
              padding: 'var(--space-6)',
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border-light)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-4)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 'var(--radius-lg)',
                    background: 'var(--primary-light)',
                    color: 'var(--primary-dark)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <DoorOpen size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600 }}>{room.name}</h3>
                  <span style={{ fontSize: 'var(--text-xs)', color: room.isActive ? 'var(--status-confirmed)' : 'var(--text-muted)', fontWeight: 600 }}>
                    {room.isActive ? '● Habilitado para reservas' : '○ Fuera de servicio'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => toggleActive(room.id)}
                className="btn btn--ghost"
                style={{ fontSize: 'var(--text-xs)', padding: '4px 8px' }}
              >
                {room.isActive ? 'Desactivar' : 'Activar'}
              </button>
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', lineHeight: 1.6, marginBottom: 'var(--space-4)', flex: 1 }}>
              {room.description}
            </p>

            <div>
              <p style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 'var(--space-2)' }}>
                Equipamiento disponible:
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {room.equipment.map((eq, idx) => (
                  <span
                    key={idx}
                    style={{
                      padding: '3px 8px',
                      background: 'var(--bg-secondary)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: 'var(--text-xs)',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    • {eq}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
