'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  MapPin,
  CheckCircle2,
  XCircle,
  PlayCircle,
  Filter,
  Search,
  Plus,
  LayoutGrid,
  List,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import {
  getAllAppointments,
  updateAppointmentStatus,
  createAppointment,
  getProfessionals,
  getTreatments,
  getRooms,
  getAllUsers,
  Appointment,
  Professional,
  Treatment,
  Room,
  UserProfile,
} from '@/lib/firestore-service';

export default function ProfessionalAgendaPage() {
  const { userProfile, user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [clients, setClients] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [selectedProfessional, setSelectedProfessional] = useState<string>('todos');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Calendar month state
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const currentProfName = userProfile?.firstName
    ? `${userProfile.firstName} ${userProfile.lastName || ''}`.trim()
    : 'Lic. Melanie Mancin';

  const [newAppt, setNewAppt] = useState({
    clientId: '',
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    treatmentId: '',
    treatmentName: '',
    treatmentPrice: 35000,
    treatmentDuration: 45,
    professionalId: '',
    professionalName: currentProfName,
    roomId: '',
    roomName: '',
    date: new Date().toISOString().split('T')[0],
    time: '10:00',
    notes: '',
  });

  const loadAll = async () => {
    setLoading(true);
    try {
      const [appts, profs, trts, rms, usrs] = await Promise.all([
        getAllAppointments(),
        getProfessionals(),
        getTreatments(),
        getRooms(),
        getAllUsers(),
      ]);
      setAppointments(appts);
      setProfessionals(profs);
      setTreatments(trts);
      setRooms(rms);
      setClients(usrs);

      if (trts.length > 0 && !newAppt.treatmentName) {
        setNewAppt((prev) => ({
          ...prev,
          treatmentId: trts[0].id,
          treatmentName: trts[0].name,
          treatmentPrice: trts[0].price || 35000,
          treatmentDuration: trts[0].duration || 45,
        }));
      }
      if (rms.length > 0 && !newAppt.roomName) {
        setNewAppt((prev) => ({
          ...prev,
          roomId: rms[0].id,
          roomName: rms[0].name,
        }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: Appointment['status']) => {
    try {
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
      );
      await updateAppointmentStatus(id, newStatus);
    } catch (e) {
      console.warn('Notice: status updated locally in professional agenda:', e);
    }
  };

  const handleSelectTreatment = (treatmentId: string) => {
    const found = treatments.find((t) => t.id === treatmentId);
    if (found) {
      setNewAppt({
        ...newAppt,
        treatmentId: found.id,
        treatmentName: found.name,
        treatmentPrice: found.price || 35000,
        treatmentDuration: found.duration || 45,
      });
    }
  };

  const [clientSearchQuery, setClientSearchQuery] = useState('');
  const [showClientDropdown, setShowClientDropdown] = useState(false);

  const handleSelectClient = (client: UserProfile) => {
    setNewAppt({
      ...newAppt,
      clientId: client.uid,
      clientName: `${client.firstName} ${client.lastName || ''}`.trim(),
      clientPhone: client.phone || '',
      clientEmail: client.email || '',
    });
    setClientSearchQuery(`${client.firstName} ${client.lastName || ''}`.trim());
    setShowClientDropdown(false);
  };

  const handleClearClient = () => {
    setNewAppt({
      ...newAppt,
      clientId: '',
      clientName: '',
      clientPhone: '',
      clientEmail: '',
    });
    setClientSearchQuery('');
    setShowClientDropdown(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createAppointment({
        clientId: newAppt.clientId || `cli_${Date.now()}`,
        clientName: newAppt.clientName,
        clientPhone: newAppt.clientPhone,
        clientEmail: newAppt.clientEmail || 'cliente@ejemplo.com',
        treatmentId: newAppt.treatmentId || `t_${Date.now()}`,
        treatmentName: newAppt.treatmentName,
        treatmentPrice: Number(newAppt.treatmentPrice),
        treatmentDuration: Number(newAppt.treatmentDuration),
        professionalId: newAppt.professionalId || `prof_${Date.now()}`,
        professionalName: newAppt.professionalName || currentProfName,
        roomId: newAppt.roomId,
        roomName: newAppt.roomName,
        date: newAppt.date,
        time: newAppt.time,
        status: 'confirmed',
        notes: newAppt.notes,
      });
      setShowModal(false);
      await loadAll();
    } catch (err) {
      console.warn('Notice: Appointment creation handled:', err);
      setShowModal(false);
      await loadAll();
    }
  };

  const filtered = appointments.filter((a) => {
    if (selectedProfessional !== 'todos' && a.professionalName !== selectedProfessional) {
      return false;
    }
    if (
      search &&
      !a.clientName?.toLowerCase().includes(search.toLowerCase()) &&
      !a.treatmentName?.toLowerCase().includes(search.toLowerCase()) &&
      !a.professionalName?.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  // Calendar calculations
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));
  const monthName = currentMonth.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Header & Controls */}
      <div
        style={{
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-light)',
          padding: 'var(--space-6)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 'var(--space-4)',
        }}
      >
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)' }}>
            Calendario Unificado & Agenda Compartida
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-xs)' }}>
            Visualizá todos los turnos del centro y agendá sesiones directamente para tus pacientes.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ display: 'flex', background: 'var(--bg-secondary)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: 2 }}>
            <button
              onClick={() => setViewMode('calendar')}
              style={{
                padding: '6px 12px',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                background: viewMode === 'calendar' ? 'var(--primary)' : 'transparent',
                color: viewMode === 'calendar' ? '#fff' : 'var(--text-secondary)',
                fontSize: 'var(--text-xs)',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <LayoutGrid size={13} /> Calendario
            </button>
            <button
              onClick={() => setViewMode('list')}
              style={{
                padding: '6px 12px',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                background: viewMode === 'list' ? 'var(--primary)' : 'transparent',
                color: viewMode === 'list' ? '#fff' : 'var(--text-secondary)',
                fontSize: 'var(--text-xs)',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <List size={13} /> Lista
            </button>
          </div>

          <button onClick={() => setShowModal(true)} className="btn btn--primary" style={{ fontSize: 'var(--text-xs)' }}>
            <Plus size={15} /> Agendar Turno a Paciente
          </button>
        </div>
      </div>

      <div
        style={{
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-light)',
          padding: 'var(--space-6)',
        }}
      >
        {/* Filter controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 'var(--space-6)' }}>
          <div style={{ position: 'relative', minWidth: 260, flex: 1 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Buscar por paciente, tratamiento o colega..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input"
              style={{ paddingLeft: 36, fontSize: 'var(--text-xs)' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Filter size={14} style={{ color: 'var(--text-muted)' }} />
            <select
              value={selectedProfessional}
              onChange={(e) => setSelectedProfessional(e.target.value)}
              className="form-input"
              style={{ width: 'auto', fontSize: 'var(--text-xs)' }}
            >
              <option value="todos">Todas las Profesionales</option>
              {professionals.map((p) => (
                <option key={p.id} value={p.name}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* UNIFIED CALENDAR */}
        {viewMode === 'calendar' ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <button onClick={prevMonth} className="btn btn--secondary" style={{ padding: '6px 12px', fontSize: 'var(--text-xs)' }}>
                <ChevronLeft size={16} /> Mes Anterior
              </button>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-lg)', textTransform: 'capitalize' }}>
                {monthName}
              </h3>
              <button onClick={nextMonth} className="btn btn--secondary" style={{ padding: '6px 12px', fontSize: 'var(--text-xs)' }}>
                Mes Siguiente <ChevronRight size={16} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, textAlign: 'center' }}>
              {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
                <div key={day} style={{ padding: 8, fontWeight: 700, fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                  {day}
                </div>
              ))}

              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`blank-${i}`} style={{ minHeight: 90, background: 'var(--bg-secondary)', opacity: 0.3, borderRadius: 8 }} />
              ))}

              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                const dayAppts = filtered.filter((a) => a.date === dateStr);
                const isToday = new Date().toISOString().split('T')[0] === dateStr;

                return (
                  <div
                    key={dayNum}
                    style={{
                      minHeight: 110,
                      background: isToday ? 'rgba(163, 137, 86, 0.08)' : 'var(--bg-secondary)',
                      borderRadius: 8,
                      border: isToday ? '2px solid var(--accent-gold)' : '1px solid var(--border-light)',
                      padding: 6,
                      display: 'flex',
                      flexDirection: 'column',
                      textAlign: 'left',
                      overflow: 'hidden',
                    }}
                  >
                    <span style={{ fontSize: 11, fontWeight: 700, color: isToday ? 'var(--accent-gold)' : 'var(--text-primary)', marginBottom: 4 }}>
                      {dayNum} {isToday && '• Hoy'}
                    </span>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 3, overflowY: 'auto', maxHeight: 85 }}>
                      {dayAppts.map((apt) => (
                        <div
                          key={apt.id}
                          title={`${apt.time} - ${apt.clientName} (${apt.treatmentName}) con ${apt.professionalName}`}
                          style={{
                            padding: '3px 6px',
                            background: 'var(--bg-card)',
                            borderLeft: `3px solid ${
                              apt.status === 'completed'
                                ? 'var(--primary)'
                                : apt.status === 'confirmed'
                                ? 'var(--status-confirmed)'
                                : 'var(--accent-gold)'
                            }`,
                            borderRadius: 4,
                            fontSize: 10,
                            lineHeight: 1.2,
                          }}
                        >
                          <div style={{ fontWeight: 700 }}>{apt.time} - {apt.clientName}</div>
                          <div style={{ color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {apt.treatmentName} • {apt.professionalName.replace('Lic. ', '')}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* LIST VIEW */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {filtered.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '120px 1fr auto',
                  alignItems: 'center',
                  gap: 'var(--space-6)',
                  padding: 'var(--space-4) var(--space-5)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-light)',
                  background: 'var(--bg-secondary)',
                }}
              >
                <div>
                  <span style={{ fontSize: 'var(--text-base)', fontWeight: 700 }}>{item.time} hs</span>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{item.date}</div>
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontWeight: 600 }}>{item.clientName}</span>
                    <span style={{ fontSize: 'var(--text-xs)', padding: '2px 8px', borderRadius: 12, background: 'var(--bg-card)', fontWeight: 600 }}>
                      {item.status.toUpperCase()}
                    </span>
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                    {item.treatmentName} • {item.professionalName} • {item.roomName || 'Box asignado'}
                  </div>
                </div>

                <div>
                  <select
                    value={item.status}
                    onChange={(e) => handleUpdateStatus(item.id, e.target.value as Appointment['status'])}
                    className="form-input"
                    style={{ padding: '4px 8px', fontSize: 'var(--text-xs)', width: 'auto', fontWeight: 600 }}
                  >
                    <option value="pending">En Espera</option>
                    <option value="confirmed">Confirmado</option>
                    <option value="completed">Completado</option>
                    <option value="cancelled">Cancelado</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Manual Booking Modal for Professional */}
      {showModal && (
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
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-2xl)',
              padding: 'var(--space-8)',
              maxWidth: 540,
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)', marginBottom: 'var(--space-4)' }}>
              Agendar Turno a Paciente
            </h3>
            <form onSubmit={handleCreate}>
              {/* Searchable Client Autocomplete */}
              <div className="form-group mb-3" style={{ position: 'relative' }}>
                <label className="form-label">Buscar Paciente Registrado</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }} />
                    <input
                      type="text"
                      placeholder="Escribe para buscar paciente (nombre, teléfono, DNI, email)..."
                      value={clientSearchQuery}
                      onChange={(e) => {
                        setClientSearchQuery(e.target.value);
                        setShowClientDropdown(true);
                      }}
                      onFocus={() => setShowClientDropdown(true)}
                      className="form-input"
                      style={{ paddingLeft: 36, fontSize: 'var(--text-xs)' }}
                    />
                  </div>
                  {newAppt.clientId && (
                    <button
                      type="button"
                      onClick={handleClearClient}
                      className="btn btn--secondary"
                      style={{ fontSize: '11px', padding: '0 10px' }}
                    >
                      Limpiar
                    </button>
                  )}
                </div>

                {/* Autocomplete Dropdown */}
                {showClientDropdown && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-light)',
                      borderRadius: 'var(--radius-lg)',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4)',
                      zIndex: 100,
                      maxHeight: 220,
                      overflowY: 'auto',
                      marginTop: 4,
                    }}
                  >
                    {(() => {
                      const term = clientSearchQuery.toLowerCase().trim();
                      const matched = clients.filter((c) => {
                        const name = `${c.firstName || ''} ${c.lastName || ''}`.toLowerCase();
                        const email = (c.email || '').toLowerCase();
                        const phone = (c.phone || '').toLowerCase();
                        const dni = (c.dni || '').toLowerCase();
                        return name.includes(term) || email.includes(term) || phone.includes(term) || dni.includes(term);
                      });

                      if (matched.length === 0) {
                        return (
                          <div style={{ padding: 12, fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textAlign: 'center' }}>
                            No se encontraron clientes con ese criterio. Completa los datos abajo para registrar el turno.
                          </div>
                        );
                      }

                      return matched.map((c) => (
                        <div
                          key={c.uid}
                          onClick={() => handleSelectClient(c)}
                          style={{
                            padding: '10px 14px',
                            borderBottom: '1px solid var(--border-light)',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            fontSize: 'var(--text-xs)',
                            transition: 'background 0.15s ease',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-secondary)')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                        >
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                              {c.firstName} {c.lastName || ''}
                            </div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
                              {c.email} {c.phone ? `• ${c.phone}` : ''} {c.dni ? `• DNI: ${c.dni}` : ''}
                            </div>
                          </div>
                          <span style={{ color: 'var(--accent-gold)', fontWeight: 600, fontSize: '11px' }}>
                            Seleccionar
                          </span>
                        </div>
                      ));
                    })()}
                  </div>
                )}
              </div>

              {newAppt.clientId && (
                <div
                  style={{
                    padding: '8px 12px',
                    background: 'rgba(92, 127, 107, 0.12)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--primary)',
                    color: 'var(--primary)',
                    fontSize: '11px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 12,
                  }}
                >
                  <span>✓ Paciente vinculado: {newAppt.clientName}</span>
                  <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>ID: {newAppt.clientId}</span>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }} className="mb-3">
                <div className="form-group">
                  <label className="form-label">Nombre del Paciente *</label>
                  <input
                    type="text"
                    required
                    placeholder="Nombre completo"
                    value={newAppt.clientName}
                    onChange={(e) => setNewAppt({ ...newAppt, clientName: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Teléfono</label>
                  <input
                    type="text"
                    placeholder="11 2345-6789"
                    value={newAppt.clientPhone}
                    onChange={(e) => setNewAppt({ ...newAppt, clientPhone: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group mb-3">
                <label className="form-label">Tratamiento a Realizar *</label>
                <select
                  value={newAppt.treatmentId}
                  onChange={(e) => handleSelectTreatment(e.target.value)}
                  className="form-input"
                >
                  {treatments.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} — ${t.price?.toLocaleString('es-AR')} ({t.duration} min)
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }} className="mb-3">
                <div className="form-group">
                  <label className="form-label">Profesional Asignada *</label>
                  <select
                    value={newAppt.professionalName}
                    onChange={(e) => {
                      const prof = professionals.find((p) => p.name === e.target.value);
                      setNewAppt({
                        ...newAppt,
                        professionalName: e.target.value,
                        professionalId: prof ? prof.id : '',
                      });
                    }}
                    className="form-input"
                  >
                    {professionals.map((p) => (
                      <option key={p.id} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Consultorio / Box *</label>
                  <select
                    value={newAppt.roomName}
                    onChange={(e) => {
                      const room = rooms.find((r) => r.name === e.target.value);
                      setNewAppt({
                        ...newAppt,
                        roomName: e.target.value,
                        roomId: room ? room.id : '',
                      });
                    }}
                    className="form-input"
                  >
                    {rooms.map((r) => (
                      <option key={r.id} value={r.name}>{r.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }} className="mb-3">
                <div className="form-group">
                  <label className="form-label">Fecha *</label>
                  <input
                    type="date"
                    required
                    value={newAppt.date}
                    onChange={(e) => setNewAppt({ ...newAppt, date: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Horario *</label>
                  <input
                    type="time"
                    required
                    value={newAppt.time}
                    onChange={(e) => setNewAppt({ ...newAppt, time: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group mb-4">
                <label className="form-label">Notas Clínicas Previas</label>
                <input
                  type="text"
                  placeholder="Sesión de seguimiento, evaluación..."
                  value={newAppt.notes}
                  onChange={(e) => setNewAppt({ ...newAppt, notes: e.target.value })}
                  className="form-input"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn--secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn btn--primary">
                  Guardar Turno en Agenda
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
