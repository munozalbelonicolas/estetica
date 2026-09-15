'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  CheckCircle,
  Clock,
  Sparkles,
  User,
} from 'lucide-react';
import './reservar.css';

type Step = 'treatment' | 'professional' | 'date' | 'confirm';

interface Treatment {
  id: string;
  name: string;
  durationMinutes: number;
  price: number | null;
  showPrice: boolean;
  category: { name: string };
}

interface Professional {
  id: string;
  user: { firstName: string; lastName: string };
  bio: string | null;
  specialties: string[];
}

interface Slot {
  time: string;
  roomId: string;
  roomName: string;
}

function ReservarContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedTreatment = searchParams.get('treatment');

  const [step, setStep] = useState<Step>('treatment');
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);

  const [selectedTreatment, setSelectedTreatment] = useState<Treatment | null>(null);
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [bookingResult, setBookingResult] = useState<any>(null);

  // Load treatments
  useEffect(() => {
    fetch('/api/treatments')
      .then((r) => r.json())
      .then((data) => {
        setTreatments(data.treatments || []);
        if (preselectedTreatment) {
          const found = data.treatments?.find((t: Treatment) => t.id === preselectedTreatment);
          if (found) {
            setSelectedTreatment(found);
            setStep('professional');
          }
        }
      });
  }, [preselectedTreatment]);

  // Load professionals when treatment selected
  useEffect(() => {
    if (!selectedTreatment) return;
    fetch(`/api/professionals?treatmentId=${selectedTreatment.id}`)
      .then((r) => r.json())
      .then((data) => setProfessionals(data.professionals || []));
  }, [selectedTreatment]);

  // Load availability when date changes
  useEffect(() => {
    if (!selectedTreatment || !selectedProfessional || !selectedDate) return;
    setLoading(true);
    setSlots([]);
    setSelectedSlot(null);
    fetch(
      `/api/appointments/availability?treatmentId=${selectedTreatment.id}&professionalId=${selectedProfessional.id}&date=${selectedDate}`
    )
      .then((r) => r.json())
      .then((data) => {
        setSlots(data.slots || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [selectedTreatment, selectedProfessional, selectedDate]);

  const handleSelectTreatment = (t: Treatment) => {
    setSelectedTreatment(t);
    setSelectedProfessional(null);
    setSelectedDate('');
    setSelectedSlot(null);
    setStep('professional');
  };

  const handleSelectProfessional = (p: Professional) => {
    setSelectedProfessional(p);
    setSelectedDate('');
    setSelectedSlot(null);
    setStep('date');
  };

  const handleConfirm = async () => {
    if (!selectedTreatment || !selectedProfessional || !selectedDate || !selectedSlot) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          treatmentId: selectedTreatment.id,
          professionalId: selectedProfessional.id,
          date: selectedDate,
          startTime: selectedSlot.time,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Error al reservar');
      } else {
        setSuccess(true);
        setBookingResult(data.appointment);
      }
    } catch {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const steps: { key: Step; label: string; number: number }[] = [
    { key: 'treatment', label: 'Tratamiento', number: 1 },
    { key: 'professional', label: 'Profesional', number: 2 },
    { key: 'date', label: 'Fecha y Hora', number: 3 },
    { key: 'confirm', label: 'Confirmar', number: 4 },
  ];

  const currentStepIndex = steps.findIndex((s) => s.key === step);

  if (success && bookingResult) {
    return (
      <div className="reservar-page">
        <div className="reservar-container">
          <div className="reservar-success">
            <div className="reservar-success__icon">
              <CheckCircle size={56} />
            </div>
            <h2 className="reservar-success__title">¡Turno Confirmado!</h2>
            <p className="reservar-success__text">
              Tu turno ha sido reservado exitosamente.
            </p>
            <div className="reservar-summary card">
              <div className="card__body">
                <div className="reservar-summary__item">
                  <span className="reservar-summary__label">Tratamiento</span>
                  <span className="reservar-summary__value">{bookingResult.treatment}</span>
                </div>
                <div className="reservar-summary__item">
                  <span className="reservar-summary__label">Profesional</span>
                  <span className="reservar-summary__value">{bookingResult.professional}</span>
                </div>
                <div className="reservar-summary__item">
                  <span className="reservar-summary__label">Fecha</span>
                  <span className="reservar-summary__value">
                    {new Date(bookingResult.date + 'T00:00:00').toLocaleDateString('es-AR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <div className="reservar-summary__item">
                  <span className="reservar-summary__label">Horario</span>
                  <span className="reservar-summary__value">
                    {bookingResult.startTime} — {bookingResult.endTime}
                  </span>
                </div>
                <div className="reservar-summary__item">
                  <span className="reservar-summary__label">Consultorio</span>
                  <span className="reservar-summary__value">{bookingResult.room}</span>
                </div>
              </div>
            </div>
            <div className="reservar-success__actions">
              <Link href="/mi-cuenta" className="btn btn--primary">
                Ir a Mi Cuenta
              </Link>
              <Link href="/" className="btn btn--secondary">
                Volver al Inicio
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="reservar-page">
      <div className="reservar-container">
        <Link href="/" className="reservar-back">
          <ArrowLeft size={18} />
          Volver
        </Link>

        <h1 className="reservar-title">Reservar Turno</h1>

        {/* Steps indicator */}
        <div className="reservar-steps">
          {steps.map((s, i) => (
            <div
              key={s.key}
              className={`reservar-step ${
                i <= currentStepIndex ? 'reservar-step--active' : ''
              } ${i < currentStepIndex ? 'reservar-step--completed' : ''}`}
            >
              <div className="reservar-step__circle">
                {i < currentStepIndex ? <CheckCircle size={16} /> : s.number}
              </div>
              <span className="reservar-step__label">{s.label}</span>
              {i < steps.length - 1 && <div className="reservar-step__line" />}
            </div>
          ))}
        </div>

        {error && <div className="auth-form__error mb-4">{error}</div>}

        {/* Step 1: Treatment */}
        {step === 'treatment' && (
          <div className="reservar-step-content animate-fadeInUp">
            <h2 className="reservar-step-title">
              <Sparkles size={20} />
              Elegí tu tratamiento
            </h2>
            <div className="reservar-options">
              {treatments.map((t) => (
                <button
                  key={t.id}
                  className={`reservar-option ${selectedTreatment?.id === t.id ? 'reservar-option--selected' : ''}`}
                  onClick={() => handleSelectTreatment(t)}
                >
                  <div className="reservar-option__info">
                    <h4 className="reservar-option__title">{t.name}</h4>
                    <p className="reservar-option__subtitle">{t.category.name}</p>
                  </div>
                  <div className="reservar-option__meta">
                    <span className="reservar-option__duration">
                      <Clock size={14} /> {t.durationMinutes} min
                    </span>
                    {t.showPrice && t.price && (
                      <span className="reservar-option__price">
                        ${t.price.toLocaleString('es-AR')}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Professional */}
        {step === 'professional' && (
          <div className="reservar-step-content animate-fadeInUp">
            <h2 className="reservar-step-title">
              <User size={20} />
              Elegí tu profesional
            </h2>
            {selectedTreatment && (
              <p className="reservar-step-subtitle">
                Para: <strong>{selectedTreatment.name}</strong>
              </p>
            )}
            <div className="reservar-options">
              {professionals.map((p) => (
                <button
                  key={p.id}
                  className={`reservar-option ${selectedProfessional?.id === p.id ? 'reservar-option--selected' : ''}`}
                  onClick={() => handleSelectProfessional(p)}
                >
                  <div className="reservar-option__avatar">
                    {p.user.firstName.charAt(0)}
                  </div>
                  <div className="reservar-option__info">
                    <h4 className="reservar-option__title">
                      {p.user.firstName} {p.user.lastName}
                    </h4>
                    <div className="reservar-option__tags">
                      {p.specialties.slice(0, 3).map((s) => (
                        <span key={s} className="badge badge--gold" style={{ fontSize: '11px' }}>
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </button>
              ))}
              {professionals.length === 0 && (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 'var(--space-8)' }}>
                  No hay profesionales disponibles para este tratamiento.
                </p>
              )}
            </div>
            <button className="btn btn--ghost mt-4" onClick={() => setStep('treatment')}>
              <ArrowLeft size={16} /> Volver
            </button>
          </div>
        )}

        {/* Step 3: Date & Time */}
        {step === 'date' && (
          <div className="reservar-step-content animate-fadeInUp">
            <h2 className="reservar-step-title">
              <Calendar size={20} />
              Elegí fecha y horario
            </h2>
            <div className="reservar-date-section">
              <div className="form-group">
                <label htmlFor="date" className="form-label">
                  Fecha
                </label>
                <input
                  id="date"
                  type="date"
                  className="form-input"
                  min={getMinDate()}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
            </div>

            {selectedDate && (
              <div className="reservar-slots">
                <h3 className="reservar-slots__title">Horarios disponibles</h3>
                {loading && (
                  <div style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
                    <span className="spinner spinner--lg" />
                  </div>
                )}
                {!loading && slots.length > 0 && (
                  <div className="reservar-slots__grid">
                    {slots.map((slot) => (
                      <button
                        key={slot.time}
                        className={`reservar-slot ${selectedSlot?.time === slot.time ? 'reservar-slot--selected' : ''}`}
                        onClick={() => {
                          setSelectedSlot(slot);
                        }}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                )}
                {!loading && slots.length === 0 && selectedDate && (
                  <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 'var(--space-6)' }}>
                    No hay horarios disponibles para esta fecha. Probá con otra.
                  </p>
                )}
              </div>
            )}

            <div className="reservar-nav">
              <button className="btn btn--ghost" onClick={() => setStep('professional')}>
                <ArrowLeft size={16} /> Volver
              </button>
              {selectedSlot && (
                <button className="btn btn--primary" onClick={() => setStep('confirm')}>
                  Continuar <ArrowRight size={16} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Confirm */}
        {step === 'confirm' && (
          <div className="reservar-step-content animate-fadeInUp">
            <h2 className="reservar-step-title">
              <CheckCircle size={20} />
              Confirmá tu turno
            </h2>
            <div className="reservar-summary card">
              <div className="card__body">
                <div className="reservar-summary__item">
                  <span className="reservar-summary__label">Tratamiento</span>
                  <span className="reservar-summary__value">{selectedTreatment?.name}</span>
                </div>
                <div className="reservar-summary__item">
                  <span className="reservar-summary__label">Profesional</span>
                  <span className="reservar-summary__value">
                    {selectedProfessional?.user.firstName} {selectedProfessional?.user.lastName}
                  </span>
                </div>
                <div className="reservar-summary__item">
                  <span className="reservar-summary__label">Fecha</span>
                  <span className="reservar-summary__value">
                    {selectedDate && new Date(selectedDate + 'T00:00:00').toLocaleDateString('es-AR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <div className="reservar-summary__item">
                  <span className="reservar-summary__label">Horario</span>
                  <span className="reservar-summary__value">{selectedSlot?.time}</span>
                </div>
                <div className="reservar-summary__item">
                  <span className="reservar-summary__label">Duración</span>
                  <span className="reservar-summary__value">{selectedTreatment?.durationMinutes} minutos</span>
                </div>
                {selectedTreatment?.showPrice && selectedTreatment?.price && (
                  <div className="reservar-summary__item">
                    <span className="reservar-summary__label">Precio</span>
                    <span className="reservar-summary__value" style={{ color: 'var(--accent-gold)', fontWeight: 600 }}>
                      ${selectedTreatment.price.toLocaleString('es-AR')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="reservar-nav">
              <button className="btn btn--ghost" onClick={() => setStep('date')}>
                <ArrowLeft size={16} /> Volver
              </button>
              <button
                className="btn btn--primary btn--lg"
                onClick={handleConfirm}
                disabled={loading}
              >
                {loading ? <span className="spinner" /> : 'Confirmar Turno'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ReservarPage() {
  return (
    <Suspense fallback={<div className="reservar-page container" style={{ padding: '60px 0', textAlign: 'center' }}>Cargando sistema de reservas...</div>}>
      <ReservarContent />
    </Suspense>
  );
}
