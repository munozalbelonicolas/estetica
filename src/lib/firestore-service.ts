import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';

export interface UserProfile {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  birthDate?: string;
  dni?: string;
  avatarUrl?: string;
  roles: string[];
  emailVerified: boolean;
  createdAt?: any;
  updatedAt?: any;
}

export interface TreatmentCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  order: number;
}

export interface Treatment {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price: number;
  duration: number; // minutes
  category: string; // e.g. 'Facial', 'Corporal', 'Masajes'
  categoryId?: string;
  image: string;
  benefits?: string[];
  contraindications?: string[];
  featured?: boolean;
  isActive: boolean;
}

export interface Professional {
  id: string;
  userId?: string;
  name: string;
  email?: string;
  role: string;
  specialties: string[];
  bio: string;
  image: string;
  availableDays?: number[]; // 1=Mon, 2=Tue...
  workingHours?: { start: string; end: string };
  isActive: boolean;
}

export interface Appointment {
  id: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  treatmentId: string;
  treatmentName: string;
  treatmentPrice: number;
  treatmentDuration: number;
  professionalId: string;
  professionalName: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  createdAt?: any;
}

// ─── EXTENDED INTERFACES ──────────────────────────────────────────────────

export interface Room {
  id: string;
  name: string;
  description: string;
  equipment: string[];
  isActive: boolean;
  createdAt?: any;
}

export interface ClinicalRecord {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone?: string;
  professionalId: string;
  professionalName: string;
  date: string;
  treatmentName: string;
  treatmentType: string;
  notes: string;
  parameters: string;
  observations?: string;
  beforePhoto?: string;
  afterPhoto?: string;
  createdAt?: any;
}

export interface ClinicalPhoto {
  id: string;
  patientName: string;
  treatmentName: string;
  date: string;
  beforeUrl: string;
  afterUrl: string;
  notes?: string;
  createdAt?: any;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  userEmail: string;
  userName: string;
  ip?: string;
  details: string;
  category: 'AUTH' | 'APPOINTMENT' | 'PATIENT' | 'ADMIN' | 'SYSTEM';
}

export interface ClinicSettings {
  name: string;
  tagline: string;
  address: string;
  city: string;
  phone: string;
  whatsapp: string;
  email: string;
  openingHours: string;
  cancellationPolicy: string;
  onlineBookingEnabled: boolean;
}

// ─── UTILS ───────────────────────────────────────────────────────────────────

export function cleanFirestoreData<T extends Record<string, any>>(data: T): Partial<T> {
  const cleaned: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      cleaned[key] = value;
    }
  }
  return cleaned as Partial<T>;
}

// ─── USERS / CLIENTS ─────────────────────────────────────────────────────────

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return { uid, ...(userDoc.data() as Omit<UserProfile, 'uid'>) };
    }
    return null;
  } catch (error) {
    console.warn('Notice: Firestore getUserProfile was not accessible:', error);
    return null;
  }
}

export async function setUserProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
  try {
    const cleanData = cleanFirestoreData(data);
    await setDoc(
      doc(db, 'users', uid),
      {
        ...cleanData,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    console.warn('Notice: could not persist user profile to Firestore:', error);
  }
}

export async function getAllUsers(): Promise<UserProfile[]> {
  try {
    const snapshot = await getDocs(collection(db, 'users'));
    if (!snapshot.empty) {
      return snapshot.docs.map((d) => ({ uid: d.id, ...d.data() } as UserProfile));
    }
    return [];
  } catch (error) {
    console.warn('Error fetching all users from Firestore:', error);
    return [];
  }
}

export async function createClientProfile(data: Omit<UserProfile, 'uid'> & { uid?: string }): Promise<string> {
  const uid = data.uid || `cli_${Date.now()}`;
  await setDoc(doc(db, 'users', uid), {
    ...cleanFirestoreData(data),
    roles: data.roles || ['CLIENT'],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return uid;
}

// ─── TREATMENTS ──────────────────────────────────────────────────────────────

export async function getTreatments(): Promise<Treatment[]> {
  try {
    const snapshot = await getDocs(collection(db, 'treatments'));
    if (!snapshot.empty) {
      return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Treatment));
    }
    return [];
  } catch (error) {
    console.warn('Could not fetch treatments from Firestore:', error);
    return [];
  }
}

export async function getTreatmentBySlug(slug: string): Promise<Treatment | null> {
  try {
    const q = query(collection(db, 'treatments'), where('slug', '==', slug), limit(1));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const docSnap = snapshot.docs[0];
      return { id: docSnap.id, ...docSnap.data() } as Treatment;
    }
    return null;
  } catch {
    return null;
  }
}

export async function saveTreatment(treatment: Partial<Treatment> & { id?: string }): Promise<string> {
  const id = treatment.id || `t_${Date.now()}`;
  const cleanData = cleanFirestoreData(treatment);
  await setDoc(
    doc(db, 'treatments', id),
    {
      ...cleanData,
      id,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
  return id;
}

export async function deleteTreatment(id: string): Promise<void> {
  await deleteDoc(doc(db, 'treatments', id));
}

// ─── PROFESSIONALS ───────────────────────────────────────────────────────────

export async function getProfessionals(): Promise<Professional[]> {
  try {
    const snapshot = await getDocs(collection(db, 'professionals'));
    if (!snapshot.empty) {
      return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Professional));
    }
    return [];
  } catch (error) {
    console.warn('Could not fetch professionals from Firestore:', error);
    return [];
  }
}

export async function saveProfessional(prof: Partial<Professional> & { id?: string }): Promise<string> {
  const id = prof.id || `p_${Date.now()}`;
  const cleanData = cleanFirestoreData(prof);
  await setDoc(
    doc(db, 'professionals', id),
    {
      ...cleanData,
      id,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
  return id;
}

export async function deleteProfessional(id: string): Promise<void> {
  await deleteDoc(doc(db, 'professionals', id));
}

// ─── APPOINTMENTS ────────────────────────────────────────────────────────────

export async function createAppointment(data: Omit<Appointment, 'id' | 'createdAt'>): Promise<string> {
  try {
    const cleanData = cleanFirestoreData(data);
    const docRef = await addDoc(collection(db, 'appointments'), {
      ...cleanData,
      status: data.status || 'pending',
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating appointment:', error);
    throw error;
  }
}

export async function getAppointmentsByClient(clientId: string): Promise<Appointment[]> {
  try {
    const q = query(collection(db, 'appointments'), where('clientId', '==', clientId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Appointment));
  } catch (err) {
    console.warn('Error fetching client appointments:', err);
    return [];
  }
}

export async function getAllAppointments(): Promise<Appointment[]> {
  try {
    const snapshot = await getDocs(collection(db, 'appointments'));
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Appointment));
  } catch (err) {
    console.warn('Error fetching appointments:', err);
    return [];
  }
}

export async function updateAppointmentStatus(
  id: string,
  status: Appointment['status']
): Promise<void> {
  await updateDoc(doc(db, 'appointments', id), { status, updatedAt: serverTimestamp() });
}

export async function deleteAppointment(id: string): Promise<void> {
  await deleteDoc(doc(db, 'appointments', id));
}

// ─── ROOMS / CONSULTORIOS ───────────────────────────────────────────────────

export async function getRooms(): Promise<Room[]> {
  try {
    const snapshot = await getDocs(collection(db, 'rooms'));
    if (!snapshot.empty) {
      return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Room));
    }
    return [];
  } catch (error) {
    console.warn('Error fetching rooms:', error);
    return [];
  }
}

export async function saveRoom(room: Partial<Room> & { id?: string }): Promise<string> {
  const id = room.id || `r_${Date.now()}`;
  const cleanData = cleanFirestoreData(room);
  await setDoc(doc(db, 'rooms', id), { ...cleanData, id, updatedAt: serverTimestamp() }, { merge: true });
  return id;
}

export async function deleteRoom(id: string): Promise<void> {
  await deleteDoc(doc(db, 'rooms', id));
}

// ─── CLINICAL RECORDS (HISTORIAS) ───────────────────────────────────────────

export async function getClinicalRecords(patientId?: string): Promise<ClinicalRecord[]> {
  try {
    let q = query(collection(db, 'clinical_records'));
    if (patientId) {
      q = query(collection(db, 'clinical_records'), where('patientId', '==', patientId));
    }
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as ClinicalRecord));
  } catch (error) {
    console.warn('Error fetching clinical records:', error);
    return [];
  }
}

export async function saveClinicalRecord(record: Partial<ClinicalRecord> & { id?: string }): Promise<string> {
  const id = record.id || `rec_${Date.now()}`;
  const cleanData = cleanFirestoreData(record);
  await setDoc(doc(db, 'clinical_records', id), { ...cleanData, id, createdAt: serverTimestamp() }, { merge: true });
  return id;
}

export async function deleteClinicalRecord(id: string): Promise<void> {
  await deleteDoc(doc(db, 'clinical_records', id));
}

// ─── CLINICAL PHOTOS (FOTOS) ────────────────────────────────────────────────

export async function getClinicalPhotos(): Promise<ClinicalPhoto[]> {
  try {
    const snapshot = await getDocs(collection(db, 'clinical_photos'));
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as ClinicalPhoto));
  } catch (error) {
    console.warn('Error fetching clinical photos:', error);
    return [];
  }
}

export async function saveClinicalPhoto(photo: Partial<ClinicalPhoto> & { id?: string }): Promise<string> {
  const id = photo.id || `photo_${Date.now()}`;
  const cleanData = cleanFirestoreData(photo);
  await setDoc(doc(db, 'clinical_photos', id), { ...cleanData, id, createdAt: serverTimestamp() }, { merge: true });
  return id;
}

export async function deleteClinicalPhoto(id: string): Promise<void> {
  await deleteDoc(doc(db, 'clinical_photos', id));
}

// ─── AUDIT LOGS (AUDITORIA) ─────────────────────────────────────────────────

export async function getAuditLogs(): Promise<AuditLog[]> {
  try {
    const snapshot = await getDocs(collection(db, 'audit_logs'));
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as AuditLog));
  } catch (error) {
    console.warn('Error fetching audit logs:', error);
    return [];
  }
}

export async function logAuditEvent(action: string, details: string, category: AuditLog['category'] = 'SYSTEM', userName = 'Sistema', userEmail = ''): Promise<void> {
  try {
    const id = `log_${Date.now()}`;
    await setDoc(doc(db, 'audit_logs', id), {
      id,
      timestamp: new Date().toISOString(),
      action,
      details,
      category,
      userName,
      userEmail,
    });
  } catch (e) {
    console.warn('Could not record audit log:', e);
  }
}

// ─── SETTINGS (CONFIGURACIÓN) ───────────────────────────────────────────────

export const DEFAULT_SETTINGS: ClinicSettings = {
  name: 'MOON Golden Beauty',
  tagline: 'Estética & Bienestar Integral',
  address: 'Av. del Libertador 4980, Piso 5',
  city: 'Buenos Aires, Argentina',
  phone: '+54 11 4789-0123',
  whatsapp: '+54 9 11 2345-6789',
  email: 'contacto@moongoldenbeauty.com',
  openingHours: 'Lunes a Sábados: 09:00 a 20:00 hs',
  cancellationPolicy: 'Cancelación con 24 hs de anticipación sin penalidad.',
  onlineBookingEnabled: true,
};

export async function getClinicSettings(): Promise<ClinicSettings> {
  try {
    const docSnap = await getDoc(doc(db, 'settings', 'general'));
    if (docSnap.exists()) {
      return { ...DEFAULT_SETTINGS, ...docSnap.data() } as ClinicSettings;
    }
    return DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveClinicSettings(settings: Partial<ClinicSettings>): Promise<void> {
  await setDoc(doc(db, 'settings', 'general'), cleanFirestoreData(settings), { merge: true });
}

// ─── DEFAULT SEED DATA ───────────────────────────────────────────────────────

export const defaultTreatments: Treatment[] = [
  {
    id: 't-1',
    name: 'Limpieza Facial Profunda',
    slug: 'limpieza-facial-profunda',
    description:
      'Limpieza profesional con extracción, exfoliación enzimática, microdermoabrasión y máscara descongestiva según el tipo de piel. Devuelve la luminosidad y frescura natural.',
    shortDescription: 'Limpieza profunda, exfoliación e hidratación intensiva.',
    price: 32000,
    duration: 60,
    category: 'Facial',
    image: '/images/treatment-cleanse.jpg',
    benefits: ['Elimina impurezas y puntos negros', 'Unifica la textura', 'Hidrata profundamente'],
    featured: true,
    isActive: true,
  },
  {
    id: 't-2',
    name: 'Radiofrecuencia Facial Tripolar',
    slug: 'radiofrecuencia-facial',
    description:
      'Tecnología de calor controlado que estimula la síntesis de colágeno y elastina, brindando un efecto tensor inmediato y progresivo.',
    shortDescription: 'Efecto lifting y estimulación profunda de colágeno.',
    price: 45000,
    duration: 45,
    category: 'Facial',
    image: '/images/treatment-radiofrequency.jpg',
    benefits: ['Reafirma la piel flácida', 'Atenúa líneas de expresión', 'Efecto tensor'],
    featured: true,
    isActive: true,
  },
  {
    id: 't-3',
    name: 'Peeling Químico Médico',
    slug: 'peeling-quimico',
    description:
      'Aplicación de ácidos cosmecéuticos para renovación celular selectiva, tratamiento de manchas, acné y líneas de expresión.',
    shortDescription: 'Renovación cutánea, control de manchas y luminosidad.',
    price: 38000,
    duration: 40,
    category: 'Facial',
    image: '/images/treatment-peeling.jpg',
    benefits: ['Aclara hiperpigmentaciones', 'Reduce poros dilatados', 'Piel suave y uniforme'],
    featured: true,
    isActive: true,
  },
  {
    id: 't-4',
    name: 'Masaje Descontracturante & Relajante',
    slug: 'masaje-descontracturante',
    description:
      'Terapia manual profunda combinada con aceites esenciales botánicos y piedras calientes para liberar tensiones musculares acumuladas.',
    shortDescription: 'Alivio muscular profundo y bienestar integral.',
    price: 35000,
    duration: 50,
    category: 'Corporal',
    image: '/images/treatment-massage.jpg',
    benefits: ['Alivia contracturas cervicales y lumbares', 'Reduce el estrés', 'Mejora la circulación'],
    featured: true,
    isActive: true,
  },
  {
    id: 't-5',
    name: 'VelaShape & Modelación Corporal',
    slug: 'velashape-corporal',
    description:
      'Combinación de radiofrecuencia, láser infrarrojo, vacumterapia y masaje de rodillos para reducción de celulitis y modelado corporal.',
    shortDescription: 'Reducción de celulitis, firmeza y contorno corporal.',
    price: 52000,
    duration: 60,
    category: 'Corporal',
    image: '/images/treatment-radiofrequency.jpg',
    benefits: ['Disminuye circunferencia corporal', 'Mejora celulitis grado I-III', 'Piel tensa y lisa'],
    featured: false,
    isActive: true,
  },
  {
    id: 't-6',
    name: 'Depilación Definitiva Láser Diodo',
    slug: 'depilacion-definitiva-laser',
    description:
      'Sistema láser de última generación indoloro con cabezal frío, apto para todo tipo de pieles durante todo el año.',
    shortDescription: 'Eliminación progresiva y definitiva del vello.',
    price: 28000,
    duration: 30,
    category: 'Depilación',
    image: '/images/treatment-cleanse.jpg',
    benefits: ['Resultados visibles desde la 1° sesión', 'Totalmente indoloro', 'Previene foliculitis'],
    featured: false,
    isActive: true,
  },
];

export const defaultProfessionals: Professional[] = [
  {
    id: 'p-1',
    name: 'Lic. Melanie Mancin',
    role: 'Cosmiatra & Directora Médica',
    specialties: ['Dermatocosmiatría', 'Peelings Médicos', 'Antiage Avanzado'],
    bio: 'Especialista en estética facial y tratamientos regenerativos con más de 8 años de experiencia en centros de alta complejidad.',
    image: '/images/team-maria.jpg',
    availableDays: [1, 2, 3, 4, 5, 6],
    workingHours: { start: '09:00', end: '19:00' },
    isActive: true,
  },
  {
    id: 'p-2',
    name: 'Lic. Nicolás Muñoz',
    role: 'Coordinador General & Especialista',
    specialties: ['Aparatología Estética', 'Modelación Corporal', 'Láser Diodo'],
    bio: 'Especialista en tecnologías no invasivas y protocolos de rejuvenecimiento corporal y depilación láser médica.',
    image: '/images/team-ana.jpg',
    availableDays: [1, 2, 3, 4, 5, 6],
    workingHours: { start: '09:00', end: '19:00' },
    isActive: true,
  },
  {
    id: 'p-3',
    name: 'Lic. Laura Benítez',
    role: 'Kinesióloga Fisiatra',
    specialties: ['Masajes Terapéuticos', 'Drenaje Linfático Manual', 'Rehabilitación'],
    bio: 'Enfocada en el bienestar muscular integral, descompresión postural y drenaje postquirúrgico.',
    image: '/images/team-laura.jpg',
    availableDays: [1, 2, 3, 4, 5],
    workingHours: { start: '10:00', end: '18:00' },
    isActive: true,
  },
];
