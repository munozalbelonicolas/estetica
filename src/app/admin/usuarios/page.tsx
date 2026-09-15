'use client';

import { useState, useEffect } from 'react';
import { UserCircle, Shield, Key, Search, UserCheck } from 'lucide-react';
import { getAllUsers, UserProfile } from '@/lib/firestore-service';

export default function AdminUsuariosPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filtered = users.filter((u) => {
    const term = search.toLowerCase();
    const fullName = `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase();
    const email = (u.email || '').toLowerCase();
    const role = (u.roles?.join(', ') || '').toLowerCase();
    return fullName.includes(term) || email.includes(term) || role.includes(term);
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)' }}>
          Usuarios, Roles & Permisos
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
          Cuentas registradas en Firestore y asignación de perfiles (Administrador, Profesional, Cliente).
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

        {loading ? (
          <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--text-muted)' }}>
            Cargando usuarios desde Firestore...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 'var(--space-12)', textAlign: 'center' }}>
            <UserCircle size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 8 }}>
              No hay usuarios adicionales en Firestore
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
              Los usuarios aparecerán automáticamente al registrarse o iniciar sesión con Google/Email.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 'var(--text-sm)' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-light)', color: 'var(--text-muted)', fontSize: 'var(--text-xs)', textTransform: 'uppercase' }}>
                  <th style={{ padding: '12px 16px' }}>Usuario</th>
                  <th style={{ padding: '12px 16px' }}>Email</th>
                  <th style={{ padding: '12px 16px' }}>Rol Asignado</th>
                  <th style={{ padding: '12px 16px' }}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => {
                  const isAdmin = u.roles?.includes('ADMIN') || u.roles?.includes('DIRECTOR');
                  const isProfessional = u.roles?.includes('PROFESSIONAL') || u.roles?.includes('DOCTOR');
                  return (
                    <tr key={u.uid} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '14px 16px', fontWeight: 600 }}>
                        {u.firstName} {u.lastName || ''}
                      </td>
                      <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>{u.email}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <span
                          style={{
                            padding: '3px 10px',
                            borderRadius: 'var(--radius-full)',
                            fontSize: 'var(--text-xs)',
                            fontWeight: 600,
                            background: isAdmin
                              ? 'rgba(163, 137, 86, 0.15)'
                              : isProfessional
                              ? 'rgba(92, 127, 107, 0.15)'
                              : 'var(--bg-secondary)',
                            color: isAdmin
                              ? 'var(--accent-gold)'
                              : isProfessional
                              ? 'var(--primary)'
                              : 'var(--text-secondary)',
                          }}
                        >
                          {isAdmin ? 'Administrador' : isProfessional ? 'Profesional' : 'Cliente'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ color: 'var(--status-confirmed)', fontWeight: 600, fontSize: 'var(--text-xs)' }}>
                          ● Activo
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
