'use client';

import { useState, useEffect } from 'react';
import { FileText, Plus, Search, Calendar, User, Clock, CheckCircle2, ChevronRight } from 'lucide-react';
import { getClinicalRecords, saveClinicalRecord, ClinicalRecord } from '@/lib/firestore-service';

export default function AdminHistoriasPage() {
  const [records, setRecords] = useState<ClinicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<ClinicalRecord | null>(null);

  const [formData, setFormData] = useState({
    patientName: '',
    patientPhone: '',
    professionalName: '',
    treatmentName: '',
    treatmentType: 'Facial',
    date: new Date().toISOString().split('T')[0],
    parameters: '',
    notes: '',
    observations: '',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getClinicalRecords();
      setRecords(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveClinicalRecord({
        patientId: `p_${Date.now()}`,
        patientName: formData.patientName,
        patientPhone: formData.patientPhone,
        professionalId: `prof_${Date.now()}`,
        professionalName: formData.professionalName,
        treatmentName: formData.treatmentName,
        treatmentType: formData.treatmentType,
        date: formData.date,
        parameters: formData.parameters,
        notes: formData.notes,
        observations: formData.observations,
      });
      setShowModal(false);
      setFormData({
        patientName: '',
        patientPhone: '',
        professionalName: '',
        treatmentName: '',
        treatmentType: 'Facial',
        date: new Date().toISOString().split('T')[0],
        parameters: '',
        notes: '',
        observations: '',
      });
      await loadData();
    } catch (err) {
      alert('Error al guardar ficha clínica');
    }
  };

  const filtered = records.filter((r) =>
    r.patientName.toLowerCase().includes(search.toLowerCase()) ||
    r.treatmentName.toLowerCase().includes(search.toLowerCase()) ||
    r.professionalName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)' }}>
            Historias Clínicas & Fichas Estéticas
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
            Seguimiento de sesiones, evolución dérmica y parámetros técnicos por paciente.
          </p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn--primary">
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
              Registra las evoluciones médicas y estéticas de tus pacientes en la base de datos.
            </p>
            <button onClick={() => setShowModal(true)} className="btn btn--primary">
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
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>{r.patientPhone}</div>
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 500 }}>
                      {r.treatmentName}
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>
                      {r.professionalName}
                    </td>
                    <td style={{ padding: '14px 16px', maxWidth: 280 }}>
                      <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600 }}>{r.parameters}</div>
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
              maxWidth: 500,
              width: '100%',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)', marginBottom: 'var(--space-4)' }}>
              Nueva Ficha de Evolución
            </h3>
            <form onSubmit={handleCreate}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }} className="mb-3">
                <div className="form-group">
                  <label className="form-label">Paciente *</label>
                  <input
                    type="text"
                    required
                    placeholder="Nombre completo"
                    value={formData.patientName}
                    onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Fecha *</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }} className="mb-3">
                <div className="form-group">
                  <label className="form-label">Tratamiento *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Peeling Químico"
                    value={formData.treatmentName}
                    onChange={(e) => setFormData({ ...formData, treatmentName: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Profesional *</label>
                  <input
                    type="text"
                    required
                    placeholder="Lic. Melanie Mancin"
                    value={formData.professionalName}
                    onChange={(e) => setFormData({ ...formData, professionalName: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group mb-3">
                <label className="form-label">Parámetros Técnicos Aplicados</label>
                <input
                  type="text"
                  placeholder="Ej: Ácido Mandélico 30% pH 3.5, 5 min de exposición"
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
                <button type="button" onClick={() => setShowModal(false)} className="btn btn--secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn btn--primary">
                  Guardar en Base de Datos
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
