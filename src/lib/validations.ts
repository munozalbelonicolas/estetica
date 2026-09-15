import { z } from 'zod';

// ─── User Schemas ───────────────────────────────────────────

export const registerSchema = z.object({
  firstName: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre es demasiado largo'),
  lastName: z
    .string()
    .min(2, 'El apellido debe tener al menos 2 caracteres')
    .max(50, 'El apellido es demasiado largo'),
  email: z
    .string()
    .email('Ingresa un email válido'),
  phone: z
    .string()
    .min(8, 'El teléfono debe tener al menos 8 dígitos')
    .optional()
    .or(z.literal('')),
  birthDate: z
    .string()
    .optional()
    .or(z.literal('')),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .regex(/[0-9]/, 'Debe contener al menos un número'),
  confirmPassword: z
    .string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

export const loginSchema = z.object({
  email: z.string().email('Ingresa un email válido'),
  password: z.string().min(1, 'Ingresa tu contraseña'),
});

export const updateProfileSchema = z.object({
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  phone: z.string().optional().or(z.literal('')),
  birthDate: z.string().optional().or(z.literal('')),
  dni: z.string().optional().or(z.literal('')),
  observations: z.string().optional().or(z.literal('')),
});

// ─── Treatment Schemas ──────────────────────────────────────

export const treatmentSchema = z.object({
  name: z.string().min(2, 'El nombre es obligatorio'),
  categoryId: z.string().uuid('Selecciona una categoría'),
  description: z.string().optional().or(z.literal('')),
  durationMinutes: z.coerce.number().min(5, 'La duración mínima es 5 minutos'),
  price: z.coerce.number().min(0).optional().nullable(),
  showPrice: z.boolean().default(true),
  indications: z.string().optional().or(z.literal('')),
  contraindications: z.string().optional().or(z.literal('')),
  isActive: z.boolean().default(true),
});

// ─── Appointment Schemas ────────────────────────────────────

export const createAppointmentSchema = z.object({
  treatmentId: z.string().uuid('Selecciona un tratamiento'),
  professionalId: z.string().uuid('Selecciona una profesional'),
  date: z.string().min(1, 'Selecciona una fecha'),
  startTime: z.string().min(1, 'Selecciona un horario'),
});

// ─── Treatment Record Schemas ───────────────────────────────

export const treatmentRecordSchema = z.object({
  appointmentId: z.string().uuid().optional().nullable(),
  clientId: z.string().uuid(),
  treatmentId: z.string().uuid(),
  treatedArea: z.string().optional().or(z.literal('')),
  observations: z.string().optional().or(z.literal('')),
  productsUsed: z.string().optional().or(z.literal('')),
  recommendations: z.string().optional().or(z.literal('')),
  nextTreatmentSuggested: z.string().optional().or(z.literal('')),
  nextSessionDate: z.string().optional().or(z.literal('')),
});

// ─── Room Schemas ───────────────────────────────────────────

export const roomSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  type: z.string().default('consultorio'),
  isActive: z.boolean().default(true),
});

// ─── Professional Schemas ───────────────────────────────────

export const professionalSchema = z.object({
  userId: z.string().uuid(),
  bio: z.string().optional().or(z.literal('')),
  specialties: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type TreatmentInput = z.infer<typeof treatmentSchema>;
export type AppointmentInput = z.infer<typeof createAppointmentSchema>;
export type TreatmentRecordInput = z.infer<typeof treatmentRecordSchema>;
