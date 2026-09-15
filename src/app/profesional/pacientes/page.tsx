'use client';

import { useState } from 'react';
import {
  Users,
  Search,
  FileText,
  Camera,
  Plus,
  Clock,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
} from 'lucide-react';

interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  birthDate: string;
  skinType: string;
  allergies: string;
  medicalConditions: string;
  consentForPhotos: boolean;
  sessionsCount: number;
  lastVisit: string;
  records: Array<{
    id: string;
    date: string;
    treatment: string;
    professional: string;
    notes: string;
    parameters: string;
    beforePhoto?: string;
    afterPhoto?: string;
  }>;
}

const DEMO_PATIENTS: Patient[] = [
  {
    id: 'p-1',
    name: 'María Eugenia González',
    email: 'mariaeugenia@gmail.com',
    phone: '11 3456-7890',
    birthDate: '1990-05-14',
    skinType: 'Fototipo II, Mixta deshidratada',
    allergies: 'Ninguna conocida',
    medicalConditions: 'Sin antecedentes relevantes',
    consentForPhotos: true,
    sessionsCount: 3,
    lastVisit: '2026-09-14',
    records: [
      {
        id: 'rec-1',
        date: '2026-09-14',
        treatment: 'Limpieza Facial Profunda',
        professional: 'Valentina Rossi',
        notes: 'Extracción de comedones en zona T. Máscara descongestiva con manzanilla.',
        parameters: 'Punta diamante grano fino 100 micrones, vapor 7 min.',
        beforePhoto: '/images/treatment-cleanse.jpg',
        afterPhoto: '/images/treatment-peeling.jpg',
      },
      {
        id: 'rec-2',
        date: '2026-08-10',
        treatment: 'Radiofrecuencia Facial Tripolar',
        professional: 'Valentina Rossi',
        notes: 'Estimulación de colágeno en óvalo facial. Buena respuesta térmica cutánea.',
        parameters: 'Frecuencia 1 MHz, temperatura cutánea 40.5°C.',
      },
    ],
  },
  {
    id: 'p-2',
    name: 'Luciana Beltrán',
    email: 'luciana.beltran@hotmail.com',
    phone: '11 9876-5432',
    birthDate: '1985-11-20',
    skinType: 'Fototipo III, Seca con flacidez inicial',
    allergies: 'Sensibilidad a fragancias sintéticas',
    medicalConditions: 'Hipotiroidismo controlado con levotiroxina',
    consentForPhotos: true,
    sessionsCount: 5,
    lastVisit: '2026-09-14',
    records: [
      {
        id: 'rec-3',
        date: '2026-09-14',
        treatment: 'Radiofrecuencia Facial Tripolar',
        professional: 'Valentina Rossi',
        notes: 'Sesión 3 del plan de 6. Mejoría notable en tonicidad de mejillas.',
        parameters: '41°C sostenido en tercio inferior durante 20 min.',
        beforePhoto: '/images/treatment-radiofrequency.jpg',
        afterPhoto: '/images/treatment-massage.jpg',
      },
    ],
  },
  {
    id: 'p-3',
    name: 'Sofía Álvarez',
    email: 'sofia.alvarez@gmail.com',
    phone: '11 4455-6677',
    birthDate: '1993-02-08',
    skinType: 'Fototipo II, Normal',
    allergies: 'Ninguna',
    medicalConditions: 'Ninguna',
    consentForPhotos: false,
    sessionsCount: 2,
    lastVisit: '2026-09-10',
    records: [
      {
        id: 'rec-4',
        date: '2026-09-10',
        treatment: 'Criolipólisis Plana',
        professional: 'Camila Méndez',
        notes: 'Primera sesión en flanco abdominal. Placas frías de -5°C.',
        parameters: '60 min de ciclo plano.',
      },
    ],
  },
];

export default function PacientesPage() {
  const [patients, setPatients] = useState<Patient[]>(DEMO_PATIENTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(DEMO_PATIENTS[0]);
  const [showAddRecordModal, setShowAddRecordModal] = useState(false);

  // New record form state
  const [newTreatment, setNewTreatment] = useState('Limpieza Facial Profunda');
  const [newNotes, setNewNotes] = useState('');
  const [newParams, setNewParams] = useState('');

  const filteredPatients = patients.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.phone.includes(searchQuery)
  );

  const handleAddRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;

    const newRec = {
      id: `rec-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      treatment: newTreatment,
      professional: 'Valentina Rossi',
      notes: newNotes,
      parameters: newParams,
    };

    const updated = {
      ...selectedPatient,
      sessionsCount: selectedPatient.sessionsCount + 1,
      lastVisit: newRec.date,
      records: [newRec, ...selectedPatient.records],
    };

    setSelectedPatient(updated);
    setPatients((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    setShowAddRecordModal(false);
    setNewNotes('');
    setNewParams('');
  };

  const toggleConsent = (patientId: string) => {
    if (!selectedPatient) return;
    const updated = {
      ...selectedPatient,
      consentForPhotos: !selectedPatient.consentForPhotos,
    };
    setSelectedPatient(updated);
    setPatients((prev) => prev.map((p) => (p.id === patientId ? updated : p)));
  };

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

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          {filteredPatients.map((p) => {
            const isSelected = selectedPatient?.id === p.id;

            return (
              <button
                key={p.id}
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
                  {p.name}
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: 2 }}>
                  {p.phone} • {p.sessionsCount} sesiones
                </div>
              </button>
            );
          })}
        </div>
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
                  {selectedPatient.name}
                </h2>
                <span className="badge badge--gold">
                  {selectedPatient.sessionsCount} Sesiones Realizadas
                </span>
              </div>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                Email: {selectedPatient.email} • Tel: {selectedPatient.phone} • F. Nac: {selectedPatient.birthDate}
              </p>
            </div>

            <button
              onClick={() => setShowAddRecordModal(true)}
              className="btn btn--primary"
            >
              <Plus size={16} /> Registrar Nueva Sesión
            </button>
          </div>

          {/* Clinical Info & Alerts */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: 'var(--space-4)',
            }}
          >
            <div style={{ background: 'var(--bg-card)', padding: 'var(--space-5)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)' }}>
              <p style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>
                BIOTIPO CUTÁNEO:
              </p>
              <p style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>
                {selectedPatient.skinType}
              </p>
            </div>

            <div style={{ background: 'rgba(212, 165, 165, 0.12)', padding: 'var(--space-5)', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(212, 165, 165, 0.3)' }}>
              <p style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--accent-rose)', marginBottom: 4 }}>
                ALERGIAS & PRECAUCIONES:
              </p>
              <p style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--accent-rose)' }}>
                {selectedPatient.allergies}
              </p>
            </div>

            <div style={{ background: 'var(--bg-card)', padding: 'var(--space-5)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>
                  CONSENTIMIENTO FOTOS:
                </p>
                <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: selectedPatient.consentForPhotos ? 'var(--accent-teal)' : 'var(--text-muted)' }}>
                  {selectedPatient.consentForPhotos ? '✓ Autorizado para galería' : '✕ Uso interno exclusivamente'}
                </p>
              </div>
              <button
                onClick={() => toggleConsent(selectedPatient.id)}
                className="btn btn--secondary"
                style={{ padding: '6px 12px', fontSize: 'var(--text-xs)' }}
              >
                Cambiar
              </button>
            </div>
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
              Evolución e Historial de Tratamientos
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
              {selectedPatient.records.map((rec) => (
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
                      <span style={{ fontWeight: 700, fontSize: 'var(--text-base)' }}>{rec.treatment}</span>
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <Calendar size={12} /> {rec.date}
                      </span>
                    </div>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                      Por {rec.professional}
                    </span>
                  </div>

                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)', marginBottom: 8, lineHeight: 1.6 }}>
                    <strong>Notas clínicas:</strong> {rec.notes}
                  </p>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginBottom: rec.beforePhoto ? 12 : 0 }}>
                    <strong>Parámetros aplicados:</strong> {rec.parameters}
                  </p>

                  {/* Photos before/after attached */}
                  {rec.beforePhoto && rec.afterPhoto && (
                    <div style={{ marginTop: 'var(--space-3)', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--border-light)' }}>
                      <p style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
                        FOTOGRAFÍAS DE EVOLUCIÓN:
                      </p>
                      <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
                        <div style={{ width: 140 }}>
                          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', display: 'block', marginBottom: 2 }}>Antes:</span>
                          <img src={rec.beforePhoto} alt="Antes" style={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: 'var(--radius-md)' }} />
                        </div>
                        <div style={{ width: 140 }}>
                          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--primary)', fontWeight: 600, display: 'block', marginBottom: 2 }}>Después:</span>
                          <img src={rec.afterPhoto} alt="Después" style={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: 'var(--radius-md)', border: '2px solid var(--primary-light)' }} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}

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
              Registrar Sesión para {selectedPatient?.name}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-xs)', marginBottom: 'var(--space-6)' }}>
              Añade notas clínicas, parámetros utilizados y evolución de la paciente.
            </p>

            <form onSubmit={handleAddRecord}>
              <div className="form-group mb-4">
                <label className="form-label">Tratamiento Realizado *</label>
                <select
                  value={newTreatment}
                  onChange={(e) => setNewTreatment(e.target.value)}
                  className="form-input"
                >
                  <option value="Limpieza Facial Profunda">Limpieza Facial Profunda</option>
                  <option value="Radiofrecuencia Facial Tripolar">Radiofrecuencia Facial Tripolar</option>
                  <option value="Peeling Químico Renovador">Peeling Químico Renovador</option>
                  <option value="Criolipólisis Plana">Criolipólisis Plana</option>
                  <option value="Depilación Láser Diodo Trío">Depilación Láser Diodo Trío</option>
                  <option value="Masaje Descontracturante & Relajante">Masaje Descontracturante & Relajante</option>
                </select>
              </div>

              <div className="form-group mb-4">
                <label className="form-label">Parámetros del Equipo / Cosméticos Utilizados</label>
                <input
                  type="text"
                  placeholder="Ej. Intensidad 4, cabezal frío, ácido mandélico 10%"
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
