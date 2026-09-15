'use client';

import { useState } from 'react';
import { UserCircle, Shield, Key, Search, UserCheck } from 'lucide-react';

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: 'Administrador' | 'Profesional' | 'Cliente';
  status: 'Activo' | 'Inactivo';
  lastLogin: string;
}

const DEMO_USERS: UserItem[] = [
  {
    id: 'u-1',
    name: 'Administración General',
    email: 'admin@esteticastudio.com',
    role: 'Administrador',
    status: 'Activo',
    lastLogin: 'Hoy, 13:40 hs',
  },
  {
    id: 'u-2',
    name: 'Valentina Rossi',
    email: 'valentina@esteticastudio.com',
    role: 'Profesional',
    status: 'Activo',
    lastLogin: 'Hoy, 08:50 hs',
  },
  {
    id: 'u-3',
    name: 'Camila Méndez',
    email: 'camila@esteticastudio.com',
    role: 'Profesional',
    status: 'Activo',
    lastLogin: 'Ayer, 18:20 hs',
  },
  {
    id: 'u-4',
    name: 'Lucía Fernández',
    email: 'lucia@esteticastudio.com',
    role: 'Profesional',
    status: 'Activo',
    lastLogin: '12/09/2026',
  },
  {
    id: 'u-5',
    name: 'María Eugenia González',
    email: 'mariaeugenia@gmail.com',
    role: 'Cliente',
    status: 'Activo',
    lastLogin: 'Hoy, 10:15 hs',
  },
  {
    id: 'u-6',
    name: 'Luciana Beltrán',
    email: 'luciana.beltran@hotmail.com',
    role: 'Cliente',
    status: 'Activo',
    lastLogin: '10/09/2026',
  },
];

export default function AdminUsuariosPage() {
  const [users, setUsers] = useState<UserItem[]>(DEMO_USERS);
  const [search, setSearch] = useState('');

  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)' }}>
          Usuarios, Roles & Permisos
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
          Control de accesos y asignación de perfiles (Administrador, Profesional, Cliente).
        </p>
      </div>

      <div
        style={{
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-light)',
          padding: 'var(--space-6)',
        }}
      >
        <div style={{ marginBottom: 'var(--space-5)', maxWidth: 360, position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Buscar usuario o rol..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input"
            style={{ paddingLeft: 36, fontSize: 'var(--text-xs)' }}
          />
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 'var(--text-sm)' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-light)', color: 'var(--text-muted)', fontSize: 'var(--text-xs)', textTransform: 'uppercase' }}>
                <th style={{ padding: '12px 16px' }}>Usuario</th>
                <th style={{ padding: '12px 16px' }}>Email</th>
                <th style={{ padding: '12px 16px' }}>Rol Asignado</th>
                <th style={{ padding: '12px 16px' }}>Último Acceso</th>
                <th style={{ padding: '12px 16px' }}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '14px 16px', fontWeight: 600 }}>{u.name}</td>
                  <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>{u.email}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span
                      style={{
                        padding: '3px 10px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: 'var(--text-xs)',
                        fontWeight: 600,
                        background:
                          u.role === 'Administrador'
                            ? 'rgba(163, 137, 86, 0.15)'
                            : u.role === 'Profesional'
                            ? 'rgba(92, 127, 107, 0.15)'
                            : 'var(--bg-secondary)',
                        color:
                          u.role === 'Administrador'
                            ? 'var(--accent-gold)'
                            : u.role === 'Profesional'
                            ? 'var(--primary)'
                            : 'var(--text-secondary)',
                      }}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                    {u.lastLogin}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ color: 'var(--status-confirmed)', fontWeight: 600, fontSize: 'var(--text-xs)' }}>
                      ● {u.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
