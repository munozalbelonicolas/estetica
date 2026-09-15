'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  Search,
  FileText,
  Plus,
  Calendar,
  Phone,
  Mail,
  CheckCircle2,
} from 'lucide-react';
import { getAllUsers, getClinicalRecords, saveClinicalRecord, UserProfile, ClinicalRecord } from '@/lib/firestore-service';

export default function ProfessionalPacientesPage() {
  const [patients, setPatients] = useState<UserProfile[]>([]);
  const [records, setRecords] = useState<ClinicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<UserProfile | null>(null);
  const [showAddRecordModal, setShowAddRecordModal] = useState(false);

  const [newTreatment, setNewTreatment] = useState('Limpieza Facial Profunda');
  const [newNotes, setNewNotes] = useState('');
  const [newParams, setNewParams] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersData, recordsData] = await Promise.all([
        getAllUsers(),
        getClinicalRecords(),
      ]);
      setPatients(usersData);
      setRecords(recordsData);
      if (usersData.length > 0 && !selectedPatient) {
        setSelectedPatient(usersData[0]);
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

  const handleAddRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;

    try {
      await saveClinicalRecord({
        patientId: selectedPatient.uid,
        patientName: `${selectedPatient.firstName} ${selectedPatient.lastName || ''}`.trim(),
        patientPhone: selectedPatient.phone,
        professionalId: 'prof_current',
        professionalName: 'Lic. Melanie Mancin',
        treatmentName: newTreatment,
        treatmentType: 'Facial',
        date: new Date().toISOString().split('T')[0],
        parameters: newParams,
        notes: newNotes,
      });

      setShowAddRecordModal(false);
      setNewNotes('');
      setNewParams('');
      await loadData();
    } catch (err) {
      alert('Error al guardar historia clínica en Firestore');
    }
  };

  const filteredPatients = patients.filter((p) => {
    const term = searchQuery.toLowerCase();
    const fullName = `${p.firstName || ''} ${p.lastName || ''}`.toLowerCase();
    const email = (p.email || '').toLowerCase();
    const phone = (p.phone || '').toLowerCase();
    return fullName.includes(term) || email.includes(term) || phone.includes(term);
  });

  const patientRecords = records.filter(
    (r) =>
      r.patientId === selectedPatient?.uid ||
      r.patientName.toLowerCase() === `${selectedPatient?.firstName} ${selectedPatient?.lastName || ''}`.trim().toLowerCase()
  );

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '320px 1fr',
        gap: 'var(--space-6)',
        alignItems: 'start',
      }}
    >
      {/* Patient Search & List */}
      <div
        style={{
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-light)',
          padding: 'var(--space-5)',
        }}
      >
        <div style={{ position: 'relative', marginBottom: 'var(--space-4)' }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Buscar por nombre o teléfono..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input"
            style={{ paddingLeft: 36, fontSize: 'var(--text-xs)' }}
          />
        </div>

        {loading ? (
          <div style={{ padding: 'var(--space-4)', textAlign: 'center', color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>
            Cargando pacientes...
          </div>
        ) : filteredPatients.length === 0 ? (
          <div style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>
            No hay pacientes registrados en la base de datos.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {filteredPatients.map((p) => {
              const isSelected = selectedPatient?.uid === p.uid;

              return (
                <button
                  key={p.uid}
                  onClick={() => setSelectedPatient(p)}
                  style={{
                    width: '100%',
                    padding: 'var(--space-3) var(--space-4)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid',
                    borderColor: isSelected ? 'var(--primary)' : 'var(--border-light)',
                    background: isSelected ? 'var(--primary-bg)' : 'var(--bg-secondary)',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: isSelected ? 'var(--primary)' : 'var(--text-primary)' }}>
                    {p.firstName} {p.lastName || ''}
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: 2 }}>
                    {p.phone || p.email}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected Patient Medical & Aesthetic Chart */}
      {selectedPatient ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* Header Card */}
          <div
            style={{
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border-light)',
              padding: 'var(--space-6)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              gap: 'var(--space-4)',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 4 }}>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)' }}>
                  {selectedPatient.firstName} {selectedPatient.lastName || ''}
                </h2>
                <span className="badge badge--gold">
                  {patientRecords.length} Sesiones Registradas
                </span>
              </div>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                Email: {selectedPatient.email} • Tel: {selectedPatient.phone || '—'} • DNI: {selectedPatient.dni || '—'}
              </p>
            </div>

            <button
              onClick={() => setShowAddRecordModal(true)}
              className="btn btn--primary"
            >
              <Plus size={16} /> Registrar Nueva Sesión
            </button>
          </div>

          {/* Treatment History Records */}
          <div
            style={{
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border-light)',
              padding: 'var(--space-6)',
            }}
          >
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-lg)', marginBottom: 'var(--space-4)' }}>
              Evolución e Historial Clínico
            </h3>

            {patientRecords.length === 0 ? (
              <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--text-muted)' }}>
                <FileText size={36} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                <p>No hay sesiones registradas para esta paciente.</p>
                <button
                  onClick={() => setShowAddRecordModal(true)}
                  className="btn btn--secondary"
                  style={{ marginTop: 12, fontSize: 'var(--text-xs)' }}
                >
                  Registrar Primera Sesión
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
                {patientRecords.map((rec) => (
                  <div
                    key={rec.id}
                    style={{
                      padding: 'var(--space-5)',
                      background: 'var(--bg-secondary)',
                      borderRadius: 'var(--radius-lg)',
                      border: '1px solid var(--border-light)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                        <span style={{ fontWeight: 700, fontSize: 'var(--text-base)' }}>{rec.treatmentName}</span>
                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <Calendar size={12} /> {rec.date}
                        </span>
                      </div>
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                        Por {rec.professionalName}
                      </span>
                    </div>

                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)', marginBottom: 8, lineHeight: 1.6 }}>
                      <strong>Notas clínicas:</strong> {rec.notes}
                    </p>
                    {rec.parameters && (
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                        <strong>Parámetros aplicados:</strong> {rec.parameters}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div style={{ padding: 'var(--space-12)', textAlign: 'center', color: 'var(--text-muted)' }}>
          Selecciona un paciente para ver su ficha clínica.
        </div>
      )}

      {/* Add New Session Modal */}
      {showAddRecordModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 'var(--space-4)',
          }}
          onClick={() => setShowAddRecordModal(false)}
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
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)', marginBottom: 'var(--space-2)' }}>
              Registrar Sesión para {selectedPatient?.firstName} {selectedPatient?.lastName}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-xs)', marginBottom: 'var(--space-6)' }}>
              Añade notas clínicas y parámetros utilizados en la base de datos.
            </p>

            <form onSubmit={handleAddRecord}>
              <div className="form-group mb-4">
                <label className="form-label">Tratamiento Realizado *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Limpieza Facial Profunda"
                  value={newTreatment}
                  onChange={(e) => setNewTreatment(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group mb-4">
                <label className="form-label">Parámetros del Equipo / Cosméticos</label>
                <input
                  type="text"
                  placeholder="Ej. Punta diamante 100 micrones, vapor 7 min"
                  value={newParams}
                  onChange={(e) => setNewParams(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group mb-6">
                <label className="form-label">Observaciones y Reacción de la Piel *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Detalles sobre tolerancia, rojeces, recomendaciones dadas..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="form-input"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
                <button
                  type="button"
                  onClick={() => setShowAddRecordModal(false)}
                  className="btn btn--secondary"
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn--primary">
                  Guardar en Historia Clínica
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
