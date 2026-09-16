'use client';

import { useState, useEffect } from 'react';
import {
  UserCircle,
  Shield,
  Key,
  Search,
  UserCheck,
  UserPlus,
  AlertCircle,
  CheckCircle2,
  Lock,
  Phone,
  Mail,
  ShieldAlert,
  Edit2,
  Ban,
  RotateCcw,
  Copy,
  Check,
  X,
  Eye,
  EyeOff,
} from 'lucide-react';
import { getAllUsers, createClientProfile, setUserProfile, UserProfile } from '@/lib/firestore-service';
import { isValidArgentineDni, isValidArgentinePhone, isValidEmail } from '@/lib/validation';
import { useAuth } from '@/context/AuthContext';

export default function AdminUsuariosPage() {
  const { isAdmin, loading: authLoading, user: authUser } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Create form data
  const [createData, setCreateData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dni: '',
    role: 'CLIENT',
    tempPassword: 'Moon2026!',
    mustChangePassword: true,
  });

  // Edit form data
  const [editData, setEditData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dni: '',
    role: 'CLIENT',
    isBlocked: false,
  });

  // Reset password form data
  const [resetData, setResetData] = useState({
    tempPassword: 'Moon2026!',
    copied: false,
    success: false,
  });

  const [errors, setErrors] = useState<{ email?: string; phone?: string; dni?: string; form?: string }>({});

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (e) {
      console.error(e);
      showToast('Error al cargar la nómina de usuarios', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // ─── CREATE USER ──────────────────────────────────────────────────────────
  const openCreateModal = () => {
    setCreateData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dni: '',
      role: 'CLIENT',
      tempPassword: 'Moon2026!',
      mustChangePassword: true,
    });
    setErrors({});
    setShowCreateModal(true);
  };

  const validateCreate = () => {
    const errs: { email?: string; phone?: string; dni?: string; form?: string } = {};
    if (!createData.firstName.trim() || !createData.lastName.trim()) {
      errs.form = 'El nombre y apellido son obligatorios';
    }
    if (!createData.email.trim()) {
      errs.email = 'El correo electrónico es obligatorio';
    } else if (!isValidEmail(createData.email)) {
      errs.email = 'Formato de correo inválido (ej: usuario@correo.com)';
    }
    if (createData.phone.trim() && !isValidArgentinePhone(createData.phone)) {
      errs.phone = 'Teléfono inválido para Argentina (ej: 11 2345-6789 o +54 9 11 2345-6789)';
    }
    if (createData.dni.trim() && !isValidArgentineDni(createData.dni)) {
      errs.dni = 'DNI inválido (debe contener 7 u 8 números)';
    }
    if (!createData.tempPassword || createData.tempPassword.length < 6) {
      errs.form = 'La contraseña genérica debe tener al menos 6 caracteres';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateCreate()) return;

    setSaving(true);
    try {
      const assignedRoles = [createData.role.toLowerCase()];
      if (!assignedRoles.includes('client')) {
        assignedRoles.push('client');
      }

      await createClientProfile({
        uid: `usr_${Date.now()}`,
        firstName: createData.firstName.trim(),
        lastName: createData.lastName.trim(),
        email: createData.email.trim().toLowerCase(),
        phone: createData.phone.trim(),
        dni: createData.dni.replace(/[\.\s\-]/g, ''),
        roles: assignedRoles,
        mustChangePassword: true,
        tempPassword: createData.tempPassword,
        isBlocked: false,
        emailVerified: false,
      });

      setShowCreateModal(false);
      setErrors({});
      showToast(`Usuario ${createData.firstName} creado con éxito con clave provisoria: ${createData.tempPassword}`);
      await loadUsers();
    } catch (err) {
      setErrors({ form: 'No se pudo guardar el usuario en la base de datos.' });
    } finally {
      setSaving(false);
    }
  };

  // ─── EDIT USER ────────────────────────────────────────────────────────────
  const openEditModal = (u: UserProfile) => {
    setSelectedUser(u);
    const rolesLower = (u.roles || []).map((r) => r.toLowerCase());
    let currentRole = 'CLIENT';
    if (rolesLower.includes('admin') || rolesLower.includes('director')) {
      currentRole = 'ADMIN';
    } else if (rolesLower.includes('professional') || rolesLower.includes('doctor')) {
      currentRole = 'PROFESSIONAL';
    }

    setEditData({
      firstName: u.firstName || '',
      lastName: u.lastName || '',
      email: u.email || '',
      phone: u.phone || '',
      dni: u.dni || '',
      role: currentRole,
      isBlocked: !!u.isBlocked,
    });
    setErrors({});
    setShowEditModal(true);
  };

  const validateEdit = () => {
    const errs: { email?: string; phone?: string; dni?: string; form?: string } = {};
    if (!editData.firstName.trim() || !editData.lastName.trim()) {
      errs.form = 'El nombre y apellido son obligatorios';
    }
    if (!editData.email.trim()) {
      errs.email = 'El correo electrónico es obligatorio';
    } else if (!isValidEmail(editData.email)) {
      errs.email = 'Formato de correo inválido (ej: usuario@correo.com)';
    }
    if (editData.phone.trim() && !isValidArgentinePhone(editData.phone)) {
      errs.phone = 'Teléfono inválido para Argentina (ej: 11 2345-6789 o +54 9 11 2345-6789)';
    }
    if (editData.dni.trim() && !isValidArgentineDni(editData.dni)) {
      errs.dni = 'DNI inválido (debe contener 7 u 8 números)';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !validateEdit()) return;

    setSaving(true);
    try {
      const assignedRoles = [editData.role.toLowerCase()];
      if (!assignedRoles.includes('client')) {
        assignedRoles.push('client');
      }

      await setUserProfile(selectedUser.uid, {
        firstName: editData.firstName.trim(),
        lastName: editData.lastName.trim(),
        email: editData.email.trim().toLowerCase(),
        phone: editData.phone.trim(),
        dni: editData.dni.replace(/[\.\s\-]/g, ''),
        roles: assignedRoles,
        isBlocked: editData.isBlocked,
      });

      setShowEditModal(false);
      showToast(`Usuario ${editData.firstName} ${editData.lastName} actualizado con éxito.`);
      await loadUsers();
    } catch (err) {
      setErrors({ form: 'Error al actualizar el usuario.' });
    } finally {
      setSaving(false);
    }
  };

  // ─── TOGGLE BLOCK / UNBLOCK ───────────────────────────────────────────────
  const handleToggleBlock = async (u: UserProfile) => {
    if (u.uid === authUser?.uid) {
      showToast('No puedes bloquear tu propia cuenta de administrador.', 'error');
      return;
    }

    const nextState = !u.isBlocked;
    const actionLabel = nextState ? 'bloqueado' : 'desbloqueado';

    try {
      await setUserProfile(u.uid, {
        isBlocked: nextState,
      });

      setUsers((prev) =>
        prev.map((item) => (item.uid === u.uid ? { ...item, isBlocked: nextState } : item))
      );

      showToast(`Usuario ${u.firstName} ${u.lastName || ''} ha sido ${actionLabel}.`);
    } catch (e) {
      console.error(e);
      showToast('No se pudo modificar el estado de bloqueo.', 'error');
    }
  };

  // ─── RESET / BLANQUEAR PASSWORD ───────────────────────────────────────────
  const openResetModal = (u: UserProfile) => {
    setSelectedUser(u);
    setResetData({
      tempPassword: 'Moon2026!',
      copied: false,
      success: false,
    });
    setShowResetModal(true);
  };

  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    if (!resetData.tempPassword || resetData.tempPassword.length < 6) {
      showToast('La contraseña provisoria debe tener al menos 6 caracteres.', 'error');
      return;
    }

    setSaving(true);
    try {
      await setUserProfile(selectedUser.uid, {
        mustChangePassword: true,
        tempPassword: resetData.tempPassword,
      });

      setUsers((prev) =>
        prev.map((item) =>
          item.uid === selectedUser.uid
            ? { ...item, mustChangePassword: true, tempPassword: resetData.tempPassword }
            : item
        )
      );

      setResetData((prev) => ({ ...prev, success: true }));
      showToast(`Contraseña blanqueada con éxito para ${selectedUser.firstName}. Clave: ${resetData.tempPassword}`);
    } catch (e) {
      console.error(e);
      showToast('Error al blanquear la contraseña.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(resetData.tempPassword);
    setResetData((prev) => ({ ...prev, copied: true }));
    setTimeout(() => {
      setResetData((prev) => ({ ...prev, copied: false }));
    }, 2500);
  };

  if (!authLoading && !isAdmin) {
    return (
      <div style={{ padding: 'var(--space-12)', textAlign: 'center' }}>
        <ShieldAlert size={48} style={{ color: 'var(--accent-error)', margin: '0 auto 16px' }} />
        <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, marginBottom: 8 }}>Acceso Restringido</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
          Solo los administradores autorizados tienen permisos para gestionar la nómina de usuarios y credenciales del sistema.
        </p>
      </div>
    );
  }

  const filtered = users.filter((u) => {
    const term = search.toLowerCase();
    const fullName = `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase();
    const email = (u.email || '').toLowerCase();
    const phone = (u.phone || '').toLowerCase();
    const dni = (u.dni || '').toLowerCase();
    const roleStr = (u.roles || []).join(' ').toLowerCase();

    const matchesSearch = fullName.includes(term) || email.includes(term) || phone.includes(term) || dni.includes(term);
    if (!matchesSearch) return false;

    // Role filter
    if (roleFilter === 'ADMIN' && !roleStr.includes('admin') && !roleStr.includes('director')) return false;
    if (roleFilter === 'PROFESSIONAL' && !roleStr.includes('professional') && !roleStr.includes('doctor')) return false;
    if (roleFilter === 'CLIENT' && (roleStr.includes('admin') || roleStr.includes('professional'))) return false;

    // Status filter
    if (statusFilter === 'ACTIVE' && (u.isBlocked || u.mustChangePassword)) return false;
    if (statusFilter === 'BLOCKED' && !u.isBlocked) return false;
    if (statusFilter === 'PENDING' && !u.mustChangePassword) return false;

    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Toast Notification */}
      {notification && (
        <div
          style={{
            position: 'fixed',
            top: 24,
            right: 24,
            zIndex: 9999,
            padding: '12px 20px',
            borderRadius: 'var(--radius-lg)',
            background: notification.type === 'success' ? '#1b4332' : '#7f1d1d',
            color: '#fff',
            border: `1px solid ${notification.type === 'success' ? '#2d6a4f' : '#991b1b'}`,
            boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: 'var(--text-sm)',
            fontWeight: 500,
            animation: 'fadeIn 0.2s ease',
          }}
        >
          {notification.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)' }}>
            Usuarios, Roles & Permisos
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
            Administración integral de cuentas: edición de datos, control de bloqueo y blanqueo de contraseñas.
          </p>
        </div>
        <button onClick={openCreateModal} className="btn btn--primary">
          <UserPlus size={16} /> Crear Nuevo Usuario
        </button>
      </div>

      <div
        style={{
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-light)',
          padding: 'var(--space-6)',
        }}
      >
        {/* Filters */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 'var(--space-5)' }}>
          <div style={{ maxWidth: 360, width: '100%', position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Buscar por nombre, email, teléfono o DNI..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input"
              style={{ paddingLeft: 36, fontSize: 'var(--text-xs)' }}
            />
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: 4, background: 'var(--bg-secondary)', padding: 3, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
              {['ALL', 'ADMIN', 'PROFESSIONAL', 'CLIENT'].map((rf) => (
                <button
                  key={rf}
                  onClick={() => setRoleFilter(rf)}
                  style={{
                    padding: '5px 10px',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    background: roleFilter === rf ? 'var(--primary)' : 'transparent',
                    color: roleFilter === rf ? '#fff' : 'var(--text-secondary)',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {rf === 'ALL' ? 'Todos' : rf === 'ADMIN' ? 'Admins' : rf === 'PROFESSIONAL' ? 'Profesionales' : 'Clientes'}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 4, background: 'var(--bg-secondary)', padding: 3, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
              {[
                { id: 'ALL', label: 'Todos' },
                { id: 'ACTIVE', label: '● Activos' },
                { id: 'BLOCKED', label: '⛔ Bloqueados' },
                { id: 'PENDING', label: '🔑 Clave Pendiente' },
              ].map((st) => (
                <button
                  key={st.id}
                  onClick={() => setStatusFilter(st.id)}
                  style={{
                    padding: '5px 10px',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    background: statusFilter === st.id ? 'var(--accent-gold)' : 'transparent',
                    color: statusFilter === st.id ? '#fff' : 'var(--text-secondary)',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Users Table */}
        {loading ? (
          <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--text-muted)' }}>
            Cargando usuarios desde la base de datos...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 'var(--space-12)', textAlign: 'center' }}>
            <UserCircle size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 8 }}>
              No se encontraron usuarios con los filtros aplicados
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginBottom: 20 }}>
              Crea un nuevo usuario asignándole una contraseña genérica provisoria.
            </p>
            <button onClick={openCreateModal} className="btn btn--primary">
              <UserPlus size={16} /> Crear Nuevo Usuario
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 'var(--text-sm)' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-light)', color: 'var(--text-muted)', fontSize: 'var(--text-xs)', textTransform: 'uppercase' }}>
                  <th style={{ padding: '12px 16px' }}>Usuario</th>
                  <th style={{ padding: '12px 16px' }}>Contacto & DNI</th>
                  <th style={{ padding: '12px 16px' }}>Rol Asignado</th>
                  <th style={{ padding: '12px 16px' }}>Estado & Seguridad</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => {
                  const rolesLower = (u.roles || []).map((r) => r.toLowerCase());
                  const isAdm = rolesLower.includes('admin') || rolesLower.includes('director');
                  const isProf = rolesLower.includes('professional') || rolesLower.includes('doctor');
                  const isPendingChange = u.mustChangePassword === true;
                  const isBlocked = !!u.isBlocked;

                  return (
                    <tr
                      key={u.uid}
                      style={{
                        borderBottom: '1px solid var(--border-light)',
                        opacity: isBlocked ? 0.7 : 1,
                        background: isBlocked ? 'rgba(239, 68, 68, 0.03)' : 'transparent',
                      }}
                    >
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span>{u.firstName} {u.lastName || ''}</span>
                          {isBlocked && (
                            <span style={{ fontSize: '10px', background: 'var(--accent-error)', color: '#fff', padding: '1px 6px', borderRadius: 4, fontWeight: 700 }}>
                              BLOQUEADO
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>{u.email}</div>
                      </td>
                      <td style={{ padding: '14px 16px', color: 'var(--text-secondary)', fontSize: 'var(--text-xs)' }}>
                        <div>{u.phone ? `Tel: ${u.phone}` : '—'}</div>
                        <div>{u.dni ? `DNI: ${u.dni}` : ''}</div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span
                          style={{
                            padding: '3px 10px',
                            borderRadius: 'var(--radius-full)',
                            fontSize: 'var(--text-xs)',
                            fontWeight: 600,
                            background: isAdm
                              ? 'rgba(163, 137, 86, 0.15)'
                              : isProf
                              ? 'rgba(92, 127, 107, 0.15)'
                              : 'var(--bg-secondary)',
                            color: isAdm
                              ? 'var(--accent-gold)'
                              : isProf
                              ? 'var(--primary)'
                              : 'var(--text-secondary)',
                          }}
                        >
                          {isAdm ? 'Administrador' : isProf ? 'Profesional' : 'Cliente'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        {isBlocked ? (
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--accent-error)', fontSize: 'var(--text-xs)', fontWeight: 600 }}>
                            <Ban size={13} />
                            <span>Acceso Bloqueado</span>
                          </div>
                        ) : isPendingChange ? (
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--accent-gold)', fontSize: 'var(--text-xs)', fontWeight: 600 }}>
                            <Key size={13} />
                            <span>Cambio de clave pendiente</span>
                          </div>
                        ) : (
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--status-confirmed)', fontSize: 'var(--text-xs)', fontWeight: 600 }}>
                            <CheckCircle2 size={13} />
                            <span>Activo</span>
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          {/* Botón Editar */}
                          <button
                            onClick={() => openEditModal(u)}
                            title="Editar datos del usuario"
                            style={{
                              padding: '6px 10px',
                              background: 'var(--bg-secondary)',
                              border: '1px solid var(--border-light)',
                              borderRadius: 'var(--radius-md)',
                              color: 'var(--text-primary)',
                              fontSize: '11px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                            }}
                          >
                            <Edit2 size={13} /> Editar
                          </button>

                          {/* Botón Blanquear Contraseña */}
                          <button
                            onClick={() => openResetModal(u)}
                            title="Blanquear contraseña a clave genérica"
                            style={{
                              padding: '6px 10px',
                              background: 'rgba(163, 137, 86, 0.12)',
                              border: '1px solid var(--accent-gold)',
                              borderRadius: 'var(--radius-md)',
                              color: 'var(--accent-gold)',
                              fontSize: '11px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                            }}
                          >
                            <Key size={13} /> Blanquear
                          </button>

                          {/* Botón Bloquear / Desbloquear */}
                          <button
                            onClick={() => handleToggleBlock(u)}
                            title={isBlocked ? 'Desbloquear acceso a este usuario' : 'Bloquear acceso a este usuario'}
                            style={{
                              padding: '6px 10px',
                              background: isBlocked ? 'rgba(34, 197, 94, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                              border: `1px solid ${isBlocked ? 'var(--status-confirmed)' : 'var(--accent-error)'}`,
                              borderRadius: 'var(--radius-md)',
                              color: isBlocked ? 'var(--status-confirmed)' : 'var(--accent-error)',
                              fontSize: '11px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                            }}
                          >
                            {isBlocked ? (
                              <>
                                <CheckCircle2 size={13} /> Desbloquear
                              </>
                            ) : (
                              <>
                                <Ban size={13} /> Bloquear
                              </>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── MODAL: CREAR NUEVO USUARIO ─────────────────────────────────────── */}
      {showCreateModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 16,
          }}
          onClick={() => setShowCreateModal(false)}
        >
          <div
            style={{
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-2xl)',
              padding: 'var(--space-8)',
              maxWidth: 520,
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(163, 137, 86, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent-gold)',
                  }}
                >
                  <UserPlus size={20} />
                </div>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)' }}>
                  Crear Nuevo Usuario
                </h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {errors.form && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 14px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid var(--accent-error)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--accent-error)',
                  fontSize: 'var(--text-xs)',
                  marginBottom: 16,
                }}
              >
                <AlertCircle size={16} />
                <span>{errors.form}</span>
              </div>
            )}

            <form onSubmit={handleCreateUser}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }} className="mb-3">
                <div className="form-group">
                  <label className="form-label">Nombre *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Laura"
                    value={createData.firstName}
                    onChange={(e) => setCreateData({ ...createData, firstName: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Apellido *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Benítez"
                    value={createData.lastName}
                    onChange={(e) => setCreateData({ ...createData, lastName: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group mb-3">
                <label className="form-label">Correo Electrónico (Acceso) *</label>
                <input
                  type="email"
                  required
                  placeholder="usuario@correo.com"
                  value={createData.email}
                  onChange={(e) => {
                    setCreateData({ ...createData, email: e.target.value });
                    if (errors.email) setErrors({ ...errors, email: undefined });
                  }}
                  className="form-input"
                  style={{ borderColor: errors.email ? 'var(--accent-error)' : undefined }}
                />
                {errors.email && (
                  <span style={{ color: 'var(--accent-error)', fontSize: '11px', marginTop: 4, display: 'block' }}>
                    {errors.email}
                  </span>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }} className="mb-3">
                <div className="form-group">
                  <label className="form-label">Teléfono (Argentina)</label>
                  <input
                    type="text"
                    placeholder="11 2345-6789"
                    value={createData.phone}
                    onChange={(e) => {
                      setCreateData({ ...createData, phone: e.target.value });
                      if (errors.phone) setErrors({ ...errors, phone: undefined });
                    }}
                    className="form-input"
                    style={{ borderColor: errors.phone ? 'var(--accent-error)' : undefined }}
                  />
                  {errors.phone && (
                    <span style={{ color: 'var(--accent-error)', fontSize: '11px', marginTop: 4, display: 'block' }}>
                      {errors.phone}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">DNI (Argentina)</label>
                  <input
                    type="text"
                    placeholder="38123456"
                    value={createData.dni}
                    onChange={(e) => {
                      setCreateData({ ...createData, dni: e.target.value });
                      if (errors.dni) setErrors({ ...errors, dni: undefined });
                    }}
                    className="form-input"
                    style={{ borderColor: errors.dni ? 'var(--accent-error)' : undefined }}
                  />
                  {errors.dni && (
                    <span style={{ color: 'var(--accent-error)', fontSize: '11px', marginTop: 4, display: 'block' }}>
                      {errors.dni}
                    </span>
                  )}
                </div>
              </div>

              <div className="form-group mb-3">
                <label className="form-label">Rol Asignado *</label>
                <select
                  value={createData.role}
                  onChange={(e) => setCreateData({ ...createData, role: e.target.value })}
                  className="form-input"
                >
                  <option value="CLIENT">Cliente (Turnos y fichas personales)</option>
                  <option value="PROFESSIONAL">Profesional (Agenda de atención y reportería propia)</option>
                  <option value="ADMIN">Administrador (Control total del centro, finanzas y consultorios)</option>
                </select>
              </div>

              <div
                style={{
                  padding: 'var(--space-4)',
                  background: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-light)',
                  marginBottom: 'var(--space-5)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <Lock size={14} style={{ color: 'var(--accent-gold)' }} />
                  <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Contraseña Genérica Provisoria
                  </span>
                </div>
                <input
                  type="text"
                  required
                  value={createData.tempPassword}
                  onChange={(e) => setCreateData({ ...createData, tempPassword: e.target.value })}
                  className="form-input"
                  style={{ marginBottom: 6, fontWeight: 600, letterSpacing: '0.05em' }}
                />
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                  🛡️ El sistema solicitará obligatoriamente cambiar esta clave en el primer inicio de sesión del usuario.
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn btn--secondary"
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn--primary" disabled={saving}>
                  {saving ? 'Creando Usuario...' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: EDITAR USUARIO ─────────────────────────────────────────── */}
      {showEditModal && selectedUser && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 16,
          }}
          onClick={() => setShowEditModal(false)}
        >
          <div
            style={{
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-2xl)',
              padding: 'var(--space-8)',
              maxWidth: 520,
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(92, 127, 107, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--primary)',
                  }}
                >
                  <Edit2 size={20} />
                </div>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)' }}>
                  Editar Usuario
                </h3>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {errors.form && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 14px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid var(--accent-error)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--accent-error)',
                  fontSize: 'var(--text-xs)',
                  marginBottom: 16,
                }}
              >
                <AlertCircle size={16} />
                <span>{errors.form}</span>
              </div>
            )}

            <form onSubmit={handleUpdateUser}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }} className="mb-3">
                <div className="form-group">
                  <label className="form-label">Nombre *</label>
                  <input
                    type="text"
                    required
                    value={editData.firstName}
                    onChange={(e) => setEditData({ ...editData, firstName: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Apellido *</label>
                  <input
                    type="text"
                    required
                    value={editData.lastName}
                    onChange={(e) => setEditData({ ...editData, lastName: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group mb-3">
                <label className="form-label">Correo Electrónico *</label>
                <input
                  type="email"
                  required
                  value={editData.email}
                  onChange={(e) => {
                    setEditData({ ...editData, email: e.target.value });
                    if (errors.email) setErrors({ ...errors, email: undefined });
                  }}
                  className="form-input"
                  style={{ borderColor: errors.email ? 'var(--accent-error)' : undefined }}
                />
                {errors.email && (
                  <span style={{ color: 'var(--accent-error)', fontSize: '11px', marginTop: 4, display: 'block' }}>
                    {errors.email}
                  </span>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }} className="mb-3">
                <div className="form-group">
                  <label className="form-label">Teléfono</label>
                  <input
                    type="text"
                    placeholder="11 2345-6789"
                    value={editData.phone}
                    onChange={(e) => {
                      setEditData({ ...editData, phone: e.target.value });
                      if (errors.phone) setErrors({ ...errors, phone: undefined });
                    }}
                    className="form-input"
                    style={{ borderColor: errors.phone ? 'var(--accent-error)' : undefined }}
                  />
                  {errors.phone && (
                    <span style={{ color: 'var(--accent-error)', fontSize: '11px', marginTop: 4, display: 'block' }}>
                      {errors.phone}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">DNI</label>
                  <input
                    type="text"
                    placeholder="38123456"
                    value={editData.dni}
                    onChange={(e) => {
                      setEditData({ ...editData, dni: e.target.value });
                      if (errors.dni) setErrors({ ...errors, dni: undefined });
                    }}
                    className="form-input"
                    style={{ borderColor: errors.dni ? 'var(--accent-error)' : undefined }}
                  />
                  {errors.dni && (
                    <span style={{ color: 'var(--accent-error)', fontSize: '11px', marginTop: 4, display: 'block' }}>
                      {errors.dni}
                    </span>
                  )}
                </div>
              </div>

              <div className="form-group mb-3">
                <label className="form-label">Rol Asignado *</label>
                <select
                  value={editData.role}
                  onChange={(e) => setEditData({ ...editData, role: e.target.value })}
                  className="form-input"
                >
                  <option value="CLIENT">Cliente (Turnos y fichas personales)</option>
                  <option value="PROFESSIONAL">Profesional (Agenda de atención y reportería propia)</option>
                  <option value="ADMIN">Administrador (Control total del centro, finanzas y consultorios)</option>
                </select>
              </div>

              {/* Bloqueo Switch */}
              <div
                style={{
                  padding: 'var(--space-4)',
                  background: editData.isBlocked ? 'rgba(239, 68, 68, 0.08)' : 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-lg)',
                  border: `1px solid ${editData.isBlocked ? 'var(--accent-error)' : 'var(--border-light)'}`,
                  marginBottom: 'var(--space-5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: 'var(--text-xs)', color: editData.isBlocked ? 'var(--accent-error)' : 'var(--text-primary)' }}>
                    {editData.isBlocked ? '⛔ Cuenta Bloqueada' : '🟢 Cuenta Activa'}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {editData.isBlocked
                      ? 'El usuario no podrá iniciar sesión en la plataforma.'
                      : 'El usuario tiene acceso normal con sus credenciales.'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setEditData({ ...editData, isBlocked: !editData.isBlocked })}
                  className={`btn btn--xs ${editData.isBlocked ? 'btn--secondary' : 'btn--outline'}`}
                  style={{ fontSize: '11px' }}
                >
                  {editData.isBlocked ? 'Desbloquear' : 'Bloquear Acceso'}
                </button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="btn btn--secondary"
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn--primary" disabled={saving}>
                  {saving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: BLANQUEAR / RESETEAR CONTRASEÑA ────────────────────────── */}
      {showResetModal && selectedUser && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 16,
          }}
          onClick={() => setShowResetModal(false)}
        >
          <div
            style={{
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-2xl)',
              padding: 'var(--space-8)',
              maxWidth: 480,
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(163, 137, 86, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent-gold)',
                  }}
                >
                  <Key size={20} />
                </div>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)' }}>
                  Blanquear Contraseña
                </h3>
              </div>
              <button
                onClick={() => setShowResetModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-xs)', marginBottom: 16, lineHeight: 1.5 }}>
              Asigna una clave provisoria al usuario <strong>{selectedUser.firstName} {selectedUser.lastName}</strong> ({selectedUser.email}). El sistema le exigirá crear una nueva contraseña en su próximo inicio de sesión.
            </p>

            <form onSubmit={handleConfirmReset}>
              <div className="form-group mb-4">
                <label className="form-label">Nueva Clave Provisoria *</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="text"
                    required
                    value={resetData.tempPassword}
                    onChange={(e) => setResetData({ ...resetData, tempPassword: e.target.value })}
                    className="form-input"
                    style={{ fontWeight: 600, letterSpacing: '0.05em' }}
                  />
                  <button
                    type="button"
                    onClick={handleCopyPassword}
                    className="btn btn--secondary"
                    style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '0 12px' }}
                    title="Copiar clave al portapapeles"
                  >
                    {resetData.copied ? <Check size={16} style={{ color: 'var(--status-confirmed)' }} /> : <Copy size={16} />}
                    <span style={{ fontSize: '11px' }}>{resetData.copied ? '¡Copiado!' : 'Copiar'}</span>
                  </button>
                </div>
              </div>

              {resetData.success && (
                <div
                  style={{
                    padding: '12px',
                    background: 'rgba(34, 197, 94, 0.1)',
                    border: '1px solid var(--status-confirmed)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--status-confirmed)',
                    fontSize: 'var(--text-xs)',
                    marginBottom: 16,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <CheckCircle2 size={16} />
                  <span>
                    ✓ Contraseña blanqueada correctamente. Pásale la clave temporal <strong>{resetData.tempPassword}</strong> al usuario.
                  </span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  className="btn btn--secondary"
                  disabled={saving}
                >
                  {resetData.success ? 'Cerrar' : 'Cancelar'}
                </button>
                <button type="submit" className="btn btn--primary" disabled={saving}>
                  {saving ? 'Blanqueando...' : 'Confirmar Blanqueo de Clave'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
