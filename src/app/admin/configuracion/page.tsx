'use client';

import { useState, useEffect } from 'react';
import { Settings, Save, CheckCircle2 } from 'lucide-react';
import { getClinicSettings, saveClinicSettings, ClinicSettings, DEFAULT_SETTINGS } from '@/lib/firestore-service';

export default function AdminConfiguracionPage() {
  const [settings, setSettings] = useState<ClinicSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [savedMessage, setSavedMessage] = useState(false);

  useEffect(() => {
    getClinicSettings()
      .then((data) => setSettings(data))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveClinicSettings(settings);
      setSavedMessage(true);
      setTimeout(() => setSavedMessage(false), 3000);
    } catch (err) {
      alert('Error al guardar configuración');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', maxWidth: 720 }}>
      <div>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)' }}>
          Configuración General de la Estética
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
          Parámetros del establecimiento, canales de contacto y políticas de reserva.
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
        {savedMessage && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(92, 127, 107, 0.15)',
              color: 'var(--accent-teal)',
              fontSize: 'var(--text-sm)',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 'var(--space-4)',
            }}
          >
            <CheckCircle2 size={16} /> Configuración guardada exitosamente en la base de datos.
          </div>
        )}

        <form onSubmit={handleSave}>
          <div className="form-group mb-4">
            <label className="form-label">Nombre Comercial de la Estética *</label>
            <input
              type="text"
              required
              value={settings.name}
              onChange={(e) => setSettings({ ...settings, name: e.target.value })}
              className="form-input"
            />
          </div>

          <div className="form-group mb-4">
            <label className="form-label">Eslogan / Subtítulo</label>
            <input
              type="text"
              value={settings.tagline}
              onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
              className="form-input"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="mb-4">
            <div className="form-group">
              <label className="form-label">Dirección Física</label>
              <input
                type="text"
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Ciudad / Provincia</label>
              <input
                type="text"
                value={settings.city}
                onChange={(e) => setSettings({ ...settings, city: e.target.value })}
                className="form-input"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="mb-4">
            <div className="form-group">
              <label className="form-label">WhatsApp de Contacto Directo</label>
              <input
                type="text"
                value={settings.whatsapp}
                onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Teléfono Fijo / Central</label>
              <input
                type="text"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group mb-4">
            <label className="form-label">Horarios de Atención</label>
            <input
              type="text"
              value={settings.openingHours}
              onChange={(e) => setSettings({ ...settings, openingHours: e.target.value })}
              className="form-input"
            />
          </div>

          <div className="form-group mb-6">
            <label className="form-label">Política de Cancelación</label>
            <textarea
              rows={2}
              value={settings.cancellationPolicy}
              onChange={(e) => setSettings({ ...settings, cancellationPolicy: e.target.value })}
              className="form-input"
            />
          </div>

          <button type="submit" className="btn btn--primary">
            <Save size={16} /> Guardar Cambios en Base de Datos
          </button>
        </form>
      </div>
    </div>
  );
}
