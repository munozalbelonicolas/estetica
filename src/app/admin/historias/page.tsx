'use client';

import { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Search,
  Calendar,
  User,
  Clock,
  CheckCircle2,
  ChevronRight,
  UserPlus,
  AlertCircle,
  Phone,
  Mail,
  ShieldCheck,
} from 'lucide-react';
import {
  getClinicalRecords,
  saveClinicalRecord,
  getAllUsers,
  createClientProfile,
  getProfessionals,
  getTreatments,
  ClinicalRecord,
  UserProfile,
  Professional,
  Treatment,
} from '@/lib/firestore-service';
import { isValidArgentineDni, isValidArgentinePhone, isValidEmail } from '@/lib/validation';

export default function AdminHistoriasPage() {
  const [records, setRecords] = useState<ClinicalRecord[]>([]);
  const [clients, setClients] = useState<UserProfile[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<ClinicalRecord | null>(null);
  const [saving, setSaving] = useState(false);

  // Form State
  const [patientMode, setPatientMode] = useState<'select' | 'new'>('select');
  const [selectedClientId, setSelectedClientId] = useState('');
  
  // New Client Form
  const [newClient, setNewClient] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dni: '',
  });

  // Clinical Record Details Form
  const [formData, setFormData] = useState({
    professionalId: '',
    professionalName: '',
    treatmentName: '',
    treatmentType: 'Facial',
    date: new Date().toISOString().split('T')[0],
    parameters: '',
    notes: '',
    observations: '',
  });

  const [errors, setErrors] = useState<{ client?: string; email?: string; phone?: string; dni?: string; form?: string }>({});

  const loadData = async () => {
    setLoading(true);
    try {
      const [recs, usrs, profs, trts] = await Promise.all([
        getClinicalRecords(),
        getAllUsers(),
        getProfessionals(),
        getTreatments(),
      ]);
      setRecords(recs);
      setClients(usrs);
      setProfessionals(profs);
      setTreatments(trts);

      if (usrs.length > 0 && !selectedClientId) {
        setSelectedClientId(usrs[0].uid);
      }
      if (profs.length > 0 && !formData.professionalName) {
        setFormData((prev) => ({
          ...prev,
          professionalId: profs[0].id,
          professionalName: profs[0].name,
        }));
      }
      if (trts.length > 0 && !formData.treatmentName) {
        setFormData((prev) => ({
          ...prev,
          treatmentName: trts[0].name,
          treatmentType: trts[0].category || 'Facial',
        }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openNewModal = () => {
    setPatientMode(clients.length > 0 ? 'select' : 'new');
    if (clients.length > 0 && !selectedClientId) {
      setSelectedClientId(clients[0].uid);
    }
    setNewClient({ firstName: '', lastName: '', email: '', phone: '', dni: '' });
    setErrors({});
    setShowModal(true);
  };

  const validateNewClient = () => {
    const errs: { email?: string; phone?: string; dni?: string; form?: string } = {};
    if (!newClient.firstName.trim() || !newClient.lastName.trim()) {
      errs.form = 'El nombre y apellido del paciente son requeridos';
    }
    if (!newClient.email.trim()) {
      errs.email = 'El correo electrónico es requerido';
    } else if (!isValidEmail(newClient.email)) {
      errs.email = 'Correo electrónico inválido';
    }
    if (newClient.phone.trim() && !isValidArgentinePhone(newClient.phone)) {
      errs.phone = 'Teléfono inválido para Argentina (ej: 11 2345-6789 o +54 9 11 2345-6789)';
    }
    if (newClient.dni.trim() && !isValidArgentineDni(newClient.dni)) {
      errs.dni = 'DNI inválido (debe tener 7 u 8 dígitos numéricos)';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    let targetPatientId = selectedClientId;
    let targetPatientName = '';
    let targetPatientPhone = '';

    if (patientMode === 'new') {
      if (!validateNewClient()) return;
      setSaving(true);
      try {
        const uid = await createClientProfile({
          firstName: newClient.firstName.trim(),
          lastName: newClient.lastName.trim(),
          email: newClient.email.trim().toLowerCase(),
          phone: newClient.phone.trim(),
          dni: newClient.dni.replace(/[\.\s\-]/g, ''),
          roles: ['CLIENT'],
          emailVerified: false,
        });
        targetPatientId = uid;
        targetPatientName = `${newClient.firstName.trim()} ${newClient.lastName.trim()}`;
        targetPatientPhone = newClient.phone.trim();
      } catch (err) {
        setErrors({ form: 'Error al registrar nuevo paciente' });
        setSaving(false);
        return;
      }
    } else {
      if (!targetPatientId) {
        setErrors({ form: 'Debe seleccionar un paciente registrado o crear uno nuevo.' });
        return;
      }
      const existing = clients.find((c) => c.uid === targetPatientId);
      if (existing) {
        targetPatientName = `${existing.firstName} ${existing.lastName || ''}`.trim();
        targetPatientPhone = existing.phone || '';
      }
    }

    if (!formData.notes.trim()) {
      setErrors({ form: 'Las notas clínicas de la sesión son obligatorias' });
      return;
    }

    setSaving(true);
    try {
      await saveClinicalRecord({
        patientId: targetPatientId,
        patientName: targetPatientName,
        patientPhone: targetPatientPhone,
        professionalId: formData.professionalId || (professionals[0]?.id ?? 'prof_default'),
        professionalName: formData.professionalName || (professionals[0]?.name ?? 'Especialista'),
        treatmentName: formData.treatmentName || (treatments[0]?.name ?? 'Tratamiento Estético'),
        treatmentType: formData.treatmentType,
        date: formData.date,
        parameters: formData.parameters,
        notes: formData.notes,
        observations: formData.observations,
      });

      setShowModal(false);
      setFormData({
        professionalId: professionals[0]?.id || '',
        professionalName: professionals[0]?.name || '',
        treatmentName: treatments[0]?.name || '',
        treatmentType: treatments[0]?.category || 'Facial',
        date: new Date().toISOString().split('T')[0],
        parameters: '',
        notes: '',
        observations: '',
      });
      await loadData();
    } catch (err) {
      console.warn('Notice: Clinical record fallback:', err);
      setShowModal(false);
      await loadData();
    } finally {
      setSaving(false);
    }
  };

  const filtered = records.filter((r) => {
    const term = search.toLowerCase();
    return (
      (r.patientName || '').toLowerCase().includes(term) ||
      (r.treatmentName || '').toLowerCase().includes(term) ||
      (r.professionalName || '').toLowerCase().includes(term)
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)' }}>
            Historias Clínicas & Fichas Estéticas
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
            Seguimiento de sesiones, evolución dérmica y parámetros técnicos por paciente registrado.
          </p>
        </div>
        <button onClick={openNewModal} className="btn btn--primary">
          <Plus size={16} /> Nueva Ficha de Evolución
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
        <div style={{ marginBottom: 'var(--space-5)', maxWidth: 360, position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Buscar por paciente, tratamiento o especialista..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input"
            style={{ paddingLeft: 36, fontSize: 'var(--text-xs)' }}
          />
        </div>

        {loading ? (
          <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--text-muted)' }}>
            Cargando historias clínicas desde la base de datos...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 'var(--space-12)', textAlign: 'center' }}>
            <FileText size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 8 }}>
              No hay historias clínicas registradas aún
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginBottom: 20 }}>
              Crea una ficha médica seleccionando un paciente de tu base de datos o registrando uno nuevo.
            </p>
            <button onClick={openNewModal} className="btn btn--primary">
              <Plus size={16} /> Crear Primera Ficha
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 'var(--text-sm)' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-light)', color: 'var(--text-muted)', fontSize: 'var(--text-xs)', textTransform: 'uppercase' }}>
                  <th style={{ padding: '12px 16px' }}>Fecha</th>
                  <th style={{ padding: '12px 16px' }}>Paciente</th>
                  <th style={{ padding: '12px 16px' }}>Tratamiento</th>
                  <th style={{ padding: '12px 16px' }}>Profesional</th>
                  <th style={{ padding: '12px 16px' }}>Parámetros / Notas</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Detalle</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--accent-gold)' }}>
                      {r.date}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 600 }}>{r.patientName}</div>
                      {r.patientPhone && (
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>{r.patientPhone}</div>
                      )}
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 500 }}>
                      {r.treatmentName}
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>
                      {r.professionalName}
                    </td>
                    <td style={{ padding: '14px 16px', maxWidth: 280 }}>
                      <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600 }}>{r.parameters || 'Sesión estándar'}</div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {r.notes}
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <button
                        onClick={() => setSelectedRecord(r)}
                        className="btn btn--secondary"
                        style={{ fontSize: 'var(--text-xs)', padding: '4px 8px' }}
                      >
                        Ver Ficha
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Detail Modal */}
      {selectedRecord && (
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
          onClick={() => setSelectedRecord(null)}
        >
          <div
            style={{
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-2xl)',
              padding: 'var(--space-8)',
              maxWidth: 520,
              width: '100%',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--accent-gold)', fontWeight: 600 }}>
                  FICHA CLÍNICA ESTÉTICA
                </span>
                <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 700 }}>{selectedRecord.patientName}</h3>
              </div>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{selectedRecord.date}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 'var(--text-sm)' }}>
              <div>
                <strong style={{ color: 'var(--text-secondary)' }}>Tratamiento:</strong> {selectedRecord.treatmentName}
              </div>
              <div>
                <strong style={{ color: 'var(--text-secondary)' }}>Especialista:</strong> {selectedRecord.professionalName}
              </div>
              <div>
                <strong style={{ color: 'var(--text-secondary)' }}>Parámetros Técnicos:</strong>
                <p style={{ marginTop: 4, padding: 8, background: 'var(--bg-secondary)', borderRadius: 8 }}>
                  {selectedRecord.parameters || 'Sin parámetros especificados'}
                </p>
              </div>
              <div>
                <strong style={{ color: 'var(--text-secondary)' }}>Evolución y Observaciones:</strong>
                <p style={{ marginTop: 4, padding: 8, background: 'var(--bg-secondary)', borderRadius: 8 }}>
                  {selectedRecord.notes || selectedRecord.observations || 'Sin notas adicionales'}
                </p>
              </div>
            </div>

            <div style={{ marginTop: 24, textAlign: 'right' }}>
              <button onClick={() => setSelectedRecord(null)} className="btn btn--secondary">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 'var(--space-4)' }}>
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
                <FileText size={20} />
              </div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)' }}>
                Nueva Ficha de Evolución
              </h3>
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

            <form onSubmit={handleCreate}>
              {/* Patient Selection Controls */}
              <div style={{ marginBottom: 'var(--space-4)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <label className="form-label" style={{ marginBottom: 0 }}>Paciente *</label>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      type="button"
                      onClick={() => {
                        setPatientMode('select');
                        setErrors({});
                      }}
                      className={`btn btn--xs ${patientMode === 'select' ? 'btn--primary' : 'btn--secondary'}`}
                      style={{ fontSize: '11px', padding: '2px 8px' }}
                    >
                      <User size={12} /> Cliente Registrado
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPatientMode('new');
                        setErrors({});
                      }}
                      className={`btn btn--xs ${patientMode === 'new' ? 'btn--primary' : 'btn--secondary'}`}
                      style={{ fontSize: '11px', padding: '2px 8px' }}
                    >
                      <UserPlus size={12} /> + Registrar Nuevo
                    </button>
                  </div>
                </div>

                {patientMode === 'select' ? (
                  <div>
                    {clients.length === 0 ? (
                      <div style={{ padding: 12, background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                        No hay clientes registrados en la base de datos. Utiliza la opción &quot;+ Registrar Nuevo&quot; arriba.
                      </div>
                    ) : (
                      <select
                        className="form-input"
                        value={selectedClientId}
                        onChange={(e) => setSelectedClientId(e.target.value)}
                        required
                      >
                        {clients.map((c) => (
                          <option key={c.uid} value={c.uid}>
                            {c.firstName} {c.lastName || ''} {c.dni ? `(DNI: ${c.dni})` : ''} {c.phone ? `• ${c.phone}` : ''}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                ) : (
                  <div style={{ padding: 12, background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border-light)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 8 }}>
                      <div>
                        <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Nombre *</label>
                        <input
                          type="text"
                          required
                          placeholder="Ej: Laura"
                          value={newClient.firstName}
                          onChange={(e) => setNewClient({ ...newClient, firstName: e.target.value })}
                          className="form-input"
                          style={{ fontSize: 'var(--text-xs)' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Apellido *</label>
                        <input
                          type="text"
                          required
                          placeholder="Ej: Benítez"
                          value={newClient.lastName}
                          onChange={(e) => setNewClient({ ...newClient, lastName: e.target.value })}
                          className="form-input"
                          style={{ fontSize: 'var(--text-xs)' }}
                        />
                      </div>
                    </div>

                    <div style={{ marginBottom: 8 }}>
                      <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Email *</label>
                      <input
                        type="email"
                        required
                        placeholder="laura@correo.com"
                        value={newClient.email}
                        onChange={(e) => {
                          setNewClient({ ...newClient, email: e.target.value });
                          if (errors.email) setErrors({ ...errors, email: undefined });
                        }}
                        className="form-input"
                        style={{ fontSize: 'var(--text-xs)', borderColor: errors.email ? 'var(--accent-error)' : undefined }}
                      />
                      {errors.email && (
                        <span style={{ color: 'var(--accent-error)', fontSize: '10px' }}>{errors.email}</span>
                      )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <div>
                        <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Teléfono (Argentina)</label>
                        <input
                          type="text"
                          placeholder="11 2345-6789"
                          value={newClient.phone}
                          onChange={(e) => {
                            setNewClient({ ...newClient, phone: e.target.value });
                            if (errors.phone) setErrors({ ...errors, phone: undefined });
                          }}
                          className="form-input"
                          style={{ fontSize: 'var(--text-xs)', borderColor: errors.phone ? 'var(--accent-error)' : undefined }}
                        />
                        {errors.phone && (
                          <span style={{ color: 'var(--accent-error)', fontSize: '10px' }}>{errors.phone}</span>
                        )}
                      </div>
                      <div>
                        <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>DNI Argentino</label>
                        <input
                          type="text"
                          placeholder="38123456"
                          value={newClient.dni}
                          onChange={(e) => {
                            setNewClient({ ...newClient, dni: e.target.value });
                            if (errors.dni) setErrors({ ...errors, dni: undefined });
                          }}
                          className="form-input"
                          style={{ fontSize: 'var(--text-xs)', borderColor: errors.dni ? 'var(--accent-error)' : undefined }}
                        />
                        {errors.dni && (
                          <span style={{ color: 'var(--accent-error)', fontSize: '10px' }}>{errors.dni}</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Treatment and Professional selection */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }} className="mb-3">
                <div className="form-group">
                  <label className="form-label">Tratamiento *</label>
                  <select
                    className="form-input"
                    value={formData.treatmentName}
                    onChange={(e) => {
                      const tName = e.target.value;
                      const found = treatments.find((t) => t.name === tName);
                      setFormData({
                        ...formData,
                        treatmentName: tName,
                        treatmentType: found?.category || 'Facial',
                      });
                    }}
                    required
                  >
                    {treatments.map((t) => (
                      <option key={t.id} value={t.name}>
                        {t.name} ({t.category})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Profesional *</label>
                  <select
                    className="form-input"
                    value={formData.professionalName}
                    onChange={(e) => {
                      const pName = e.target.value;
                      const found = professionals.find((p) => p.name === pName);
                      setFormData({
                        ...formData,
                        professionalId: found?.id || '',
                        professionalName: pName,
                      });
                    }}
                    required
                  >
                    {professionals.map((p) => (
                      <option key={p.id} value={p.name}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group mb-3">
                <label className="form-label">Fecha de Atención *</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group mb-3">
                <label className="form-label">Parámetros Técnicos Aplicados</label>
                <input
                  type="text"
                  placeholder="Ej: Ácido Mandélico 30% pH 3.5, 5 min de exposición / Cabezal 3.0mm"
                  value={formData.parameters}
                  onChange={(e) => setFormData({ ...formData, parameters: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group mb-4">
                <label className="form-label">Notas y Evolución Clínica *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Respuesta dérmica, tolerancia, indicaciones domiciliarias..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="form-input"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setErrors({});
                  }}
                  className="btn btn--secondary"
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn--primary" disabled={saving}>
                  {saving ? 'Guardando...' : 'Guardar Ficha Clínica'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
