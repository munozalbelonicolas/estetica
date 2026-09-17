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
import { db, auth, firebaseConfig } from './firebase';
import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signOut } from 'firebase/auth';

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
  mustChangePassword?: boolean;
  tempPassword?: string;
  isBlocked?: boolean;
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
  phone?: string;
  dni?: string;
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
  roomId?: string;
  roomName?: string;
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

// ─── LOCAL STORAGE FALLBACK HELPERS ──────────────────────────────────────────

function getLocalCollection<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(`estetica_${key}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalCollection<T>(key: string, items: T[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`estetica_${key}`, JSON.stringify(items));
  } catch {}
}

function upsertLocalItem<T extends { id?: string; uid?: string }>(
  key: string,
  item: T,
  idField: 'id' | 'uid' = 'id'
): void {
  const items = getLocalCollection<T>(key);
  const targetId = (item as any)[idField];
  const idx = items.findIndex((i: any) => i[idField] === targetId);
  if (idx >= 0) {
    items[idx] = { ...items[idx], ...item };
  } else {
    items.unshift(item);
  }
  saveLocalCollection(key, items);
}

function removeLocalItem<T extends { id?: string; uid?: string }>(
  key: string,
  id: string,
  idField: 'id' | 'uid' = 'id'
): void {
  const items = getLocalCollection<T>(key);
  const filtered = items.filter((i: any) => i[idField] !== id);
  saveLocalCollection(key, filtered);
}

// ─── USERS / CLIENTS ─────────────────────────────────────────────────────────

export async function getUserProfile(uid: string, email?: string): Promise<UserProfile | null> {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      const data = { uid, ...(userDoc.data() as Omit<UserProfile, 'uid'>) };
      upsertLocalItem<UserProfile>('users', data, 'uid');
      return data;
    }

    // Fallback: Si el perfil fue cargado previamente con otro ID autogenerado, lo buscamos por email
    if (email) {
      const q = query(collection(db, 'users'), where('email', '==', email.toLowerCase()));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const found = snap.docs[0].data() as Omit<UserProfile, 'uid'>;
        const linkedData = { ...found, uid };
        try {
          await setDoc(doc(db, 'users', uid), linkedData, { merge: true });
        } catch {}
        upsertLocalItem<UserProfile>('users', linkedData, 'uid');
        return linkedData;
      }
    }
  } catch (error) {
    console.warn('Notice: Firestore getUserProfile was not accessible, checking local fallback:', error);
  }
  // Local fallback
  const localUsers = getLocalCollection<UserProfile>('users');
  return localUsers.find((u) => u.uid === uid || (email && u.email?.toLowerCase() === email.toLowerCase())) || null;
}

export async function setUserProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
  const cleanData = cleanFirestoreData(data);
  const updated = { uid, ...cleanData } as UserProfile;
  upsertLocalItem<UserProfile>('users', updated, 'uid');

  try {
    await setDoc(
      doc(db, 'users', uid),
      {
        ...cleanData,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error: any) {
    const authStatus = auth.currentUser
      ? `Usuario autenticado: ${auth.currentUser.email} (${auth.currentUser.uid})`
      : 'Sin sesión activa en Firebase Auth';
    console.warn(`Notice: No se pudo guardar perfil en Firestore [${authStatus}]:`, error);
    throw error;
  }
}

export async function getAllUsers(): Promise<UserProfile[]> {
  let firestoreUsers: UserProfile[] = [];
  try {
    const snapshot = await getDocs(collection(db, 'users'));
    if (!snapshot.empty) {
      firestoreUsers = snapshot.docs.map((d) => ({ uid: d.id, ...d.data() } as UserProfile));
      saveLocalCollection('users', firestoreUsers);
      return firestoreUsers;
    }
  } catch (error) {
    console.warn('Notice: Firestore users fetch not accessible, using local repository:', error);
  }

  const localUsers = getLocalCollection<UserProfile>('users');
  return localUsers.length > 0 ? localUsers : firestoreUsers;
}

/**
 * Crea una cuenta real en Firebase Authentication sin desloguear al administrador actual.
 * Usa una instancia secundaria aislada de Firebase App.
 */
export async function createAuthUserAccount(email: string, password: string): Promise<string> {
  const secondaryAppName = `auth-create-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const secondaryApp = initializeApp(firebaseConfig, secondaryAppName);
  try {
    const secondaryAuth = getAuth(secondaryApp);
    const cred = await createUserWithEmailAndPassword(secondaryAuth, email, password);
    const uid = cred.user.uid;
    await signOut(secondaryAuth);
    return uid;
  } finally {
    try {
      await deleteApp(secondaryApp);
    } catch {}
  }
}

export async function createClientProfile(data: Omit<UserProfile, 'uid'> & { uid?: string }): Promise<string> {
  const uid = data.uid || `cli_${Date.now()}`;
  const newClient: UserProfile = {
    uid,
    ...cleanFirestoreData(data),
    firstName: data.firstName || '',
    lastName: data.lastName || '',
    email: data.email || '',
    roles: data.roles || ['CLIENT'],
    emailVerified: false,
    createdAt: new Date().toISOString(),
  };

  // Always persist locally first so UI is immediately updated and zero data is lost
  upsertLocalItem<UserProfile>('users', newClient, 'uid');

  try {
    await setDoc(doc(db, 'users', uid), {
      ...cleanFirestoreData(data),
      roles: data.roles || ['CLIENT'],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error: any) {
    const authStatus = auth.currentUser
      ? `Usuario autenticado: ${auth.currentUser.email} (${auth.currentUser.uid})`
      : 'Sin sesión activa en Firebase Auth';
    console.warn(`Notice: Firestore createClientProfile permission restricted [${authStatus}]:`, error);
    throw error;
  }

  return uid;
}

// ─── TREATMENTS ──────────────────────────────────────────────────────────────

export async function getTreatments(): Promise<Treatment[]> {
  try {
    const snapshot = await getDocs(collection(db, 'treatments'));
    if (!snapshot.empty) {
      const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Treatment));
      saveLocalCollection('treatments', items);
      return items;
    }
  } catch (error) {
    console.warn('Notice: Treatments fetch from Firestore not available, checking local store:', error);
  }
  const local = getLocalCollection<Treatment>('treatments');
  return local.length > 0 ? local : defaultTreatments;
}

export async function getTreatmentBySlug(slug: string): Promise<Treatment | null> {
  try {
    const q = query(collection(db, 'treatments'), where('slug', '==', slug), limit(1));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const docSnap = snapshot.docs[0];
      return { id: docSnap.id, ...docSnap.data() } as Treatment;
    }
  } catch {}
  const all = await getTreatments();
  return all.find((t) => t.slug === slug) || null;
}

export async function saveTreatment(treatment: Partial<Treatment> & { id?: string }): Promise<string> {
  const id = treatment.id || `t_${Date.now()}`;
  const cleanData = cleanFirestoreData(treatment);
  const fullItem = { ...cleanData, id, updatedAt: new Date().toISOString() } as Treatment;
  upsertLocalItem<Treatment>('treatments', fullItem, 'id');

  try {
    await setDoc(
      doc(db, 'treatments', id),
      {
        ...cleanData,
        id,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('Notice: Firestore saveTreatment failed, persisted locally:', err);
  }
  return id;
}

export async function createTreatment(data: Omit<Treatment, 'id'>): Promise<string> {
  return saveTreatment(data);
}

export async function updateTreatment(id: string, data: Partial<Treatment>): Promise<void> {
  await saveTreatment({ ...data, id });
}

export async function deleteTreatment(id: string): Promise<void> {
  removeLocalItem<Treatment>('treatments', id, 'id');
  try {
    await deleteDoc(doc(db, 'treatments', id));
  } catch {}
}

// ─── PROFESSIONALS ───────────────────────────────────────────────────────────

export async function getProfessionals(): Promise<Professional[]> {
  try {
    const snapshot = await getDocs(collection(db, 'professionals'));
    if (!snapshot.empty) {
      const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Professional));
      saveLocalCollection('professionals', items);
      return items;
    }
  } catch (error) {
    console.warn('Notice: Professionals fetch from Firestore not available, checking local store:', error);
  }
  const local = getLocalCollection<Professional>('professionals');
  return local.length > 0 ? local : defaultProfessionals;
}

export async function saveProfessional(prof: Partial<Professional> & { id?: string }): Promise<string> {
  const id = prof.id || `p_${Date.now()}`;
  const cleanData = cleanFirestoreData(prof);
  const fullItem = { ...cleanData, id, updatedAt: new Date().toISOString() } as Professional;
  upsertLocalItem<Professional>('professionals', fullItem, 'id');

  try {
    await setDoc(
      doc(db, 'professionals', id),
      {
        ...cleanData,
        id,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('Notice: Firestore saveProfessional failed, persisted locally:', err);
  }
  return id;
}

export async function deleteProfessional(id: string): Promise<void> {
  removeLocalItem<Professional>('professionals', id, 'id');
  try {
    await deleteDoc(doc(db, 'professionals', id));
  } catch {}
}

// ─── APPOINTMENTS ────────────────────────────────────────────────────────────

export async function createAppointment(data: Omit<Appointment, 'id' | 'createdAt'>): Promise<string> {
  const id = `apt_${Date.now()}`;
  const cleanData = cleanFirestoreData(data);
  const newApt: Appointment = {
    ...cleanData,
    id,
    status: data.status || 'pending',
    createdAt: new Date().toISOString(),
  } as Appointment;

  upsertLocalItem<Appointment>('appointments', newApt, 'id');

  try {
    const docRef = await addDoc(collection(db, 'appointments'), {
      ...cleanData,
      status: data.status || 'pending',
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.warn('Notice: Firestore createAppointment restricted, persisted locally:', error);
    return id;
  }
}

export async function getAppointmentsByClient(clientId: string): Promise<Appointment[]> {
  try {
    const q = query(collection(db, 'appointments'), where('clientId', '==', clientId));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Appointment));
    }
  } catch (err) {
    console.warn('Notice: Firestore getAppointmentsByClient fallback to local:', err);
  }
  const local = getLocalCollection<Appointment>('appointments');
  return local.filter((a) => a.clientId === clientId);
}

export async function getAppointmentsByProfessional(professionalId: string): Promise<Appointment[]> {
  try {
    const q = query(collection(db, 'appointments'), where('professionalId', '==', professionalId));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Appointment));
    }
  } catch (err) {
    console.warn('Notice: Firestore getAppointmentsByProfessional fallback to local:', err);
  }
  const local = getLocalCollection<Appointment>('appointments');
  return local.filter((a) => a.professionalId === professionalId);
}

export async function getAllAppointments(): Promise<Appointment[]> {
  try {
    const snapshot = await getDocs(collection(db, 'appointments'));
    if (!snapshot.empty) {
      const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Appointment));
      saveLocalCollection('appointments', items);
      return items;
    }
  } catch (err) {
    console.warn('Notice: Firestore getAllAppointments fallback to local:', err);
  }
  return getLocalCollection<Appointment>('appointments');
}

export async function updateAppointmentStatus(
  id: string,
  status: Appointment['status'],
  notes?: string
): Promise<void> {
  const items = getLocalCollection<Appointment>('appointments');
  const target = items.find((a) => a.id === id);
  if (target) {
    target.status = status;
    if (notes !== undefined) target.notes = notes;
    saveLocalCollection('appointments', items);
  }
  try {
    const updateData: Record<string, any> = { status, updatedAt: serverTimestamp() };
    if (notes !== undefined) updateData.notes = notes;
    await updateDoc(doc(db, 'appointments', id), updateData);
  } catch {}
}

export async function deleteAppointment(id: string): Promise<void> {
  removeLocalItem<Appointment>('appointments', id, 'id');
  try {
    await deleteDoc(doc(db, 'appointments', id));
  } catch {}
}

// ─── ROOMS / CONSULTORIOS ───────────────────────────────────────────────────

export async function getRooms(): Promise<Room[]> {
  try {
    const snapshot = await getDocs(collection(db, 'rooms'));
    if (!snapshot.empty) {
      const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Room));
      saveLocalCollection('rooms', items);
      return items;
    }
  } catch (error) {
    console.warn('Notice: Rooms fetch from Firestore fallback to local:', error);
  }
  return getLocalCollection<Room>('rooms');
}

export async function saveRoom(room: Partial<Room> & { id?: string }): Promise<string> {
  const id = room.id || `r_${Date.now()}`;
  const cleanData = cleanFirestoreData(room);
  const fullItem = { ...cleanData, id, updatedAt: new Date().toISOString() } as Room;
  upsertLocalItem<Room>('rooms', fullItem, 'id');

  try {
    await setDoc(doc(db, 'rooms', id), { ...cleanData, id, updatedAt: serverTimestamp() }, { merge: true });
  } catch (err) {
    console.warn('Notice: Firestore saveRoom fallback to local:', err);
  }
  return id;
}

export async function deleteRoom(id: string): Promise<void> {
  removeLocalItem<Room>('rooms', id, 'id');
  try {
    await deleteDoc(doc(db, 'rooms', id));
  } catch {}
}

// ─── CLINICAL RECORDS (HISTORIAS) ───────────────────────────────────────────

export async function getClinicalRecords(patientId?: string): Promise<ClinicalRecord[]> {
  try {
    let q = query(collection(db, 'clinical_records'));
    if (patientId) {
      q = query(collection(db, 'clinical_records'), where('patientId', '==', patientId));
    }
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as ClinicalRecord));
      saveLocalCollection('clinical_records', items);
      return items;
    }
  } catch (error) {
    console.warn('Notice: Clinical records fallback to local:', error);
  }
  const local = getLocalCollection<ClinicalRecord>('clinical_records');
  return patientId ? local.filter((r) => r.patientId === patientId) : local;
}

export async function saveClinicalRecord(record: Partial<ClinicalRecord> & { id?: string }): Promise<string> {
  const id = record.id || `rec_${Date.now()}`;
  const cleanData = cleanFirestoreData(record);
  const fullItem = { ...cleanData, id, createdAt: new Date().toISOString() } as ClinicalRecord;
  upsertLocalItem<ClinicalRecord>('clinical_records', fullItem, 'id');

  try {
    await setDoc(doc(db, 'clinical_records', id), { ...cleanData, id, createdAt: serverTimestamp() }, { merge: true });
  } catch (err) {
    console.warn('Notice: Firestore saveClinicalRecord fallback to local:', err);
  }
  return id;
}

export async function deleteClinicalRecord(id: string): Promise<void> {
  removeLocalItem<ClinicalRecord>('clinical_records', id, 'id');
  try {
    await deleteDoc(doc(db, 'clinical_records', id));
  } catch {}
}

// ─── CLINICAL PHOTOS (FOTOS) ────────────────────────────────────────────────

export async function getClinicalPhotos(): Promise<ClinicalPhoto[]> {
  try {
    const snapshot = await getDocs(collection(db, 'clinical_photos'));
    if (!snapshot.empty) {
      const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as ClinicalPhoto));
      saveLocalCollection('clinical_photos', items);
      return items;
    }
  } catch (error) {
    console.warn('Notice: Clinical photos fallback to local:', error);
  }
  return getLocalCollection<ClinicalPhoto>('clinical_photos');
}

export async function saveClinicalPhoto(photo: Partial<ClinicalPhoto> & { id?: string }): Promise<string> {
  const id = photo.id || `photo_${Date.now()}`;
  const cleanData = cleanFirestoreData(photo);
  const fullItem = { ...cleanData, id, createdAt: new Date().toISOString() } as ClinicalPhoto;
  upsertLocalItem<ClinicalPhoto>('clinical_photos', fullItem, 'id');

  try {
    await setDoc(doc(db, 'clinical_photos', id), { ...cleanData, id, createdAt: serverTimestamp() }, { merge: true });
  } catch (err) {
    console.warn('Notice: Firestore saveClinicalPhoto fallback to local:', err);
  }
  return id;
}

export async function deleteClinicalPhoto(id: string): Promise<void> {
  removeLocalItem<ClinicalPhoto>('clinical_photos', id, 'id');
  try {
    await deleteDoc(doc(db, 'clinical_photos', id));
  } catch {}
}

// ─── AUDIT LOGS (AUDITORIA) ─────────────────────────────────────────────────

export async function getAuditLogs(): Promise<AuditLog[]> {
  try {
    const snapshot = await getDocs(collection(db, 'audit_logs'));
    if (!snapshot.empty) {
      const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as AuditLog));
      saveLocalCollection('audit_logs', items);
      return items;
    }
  } catch (error) {
    console.warn('Notice: Audit logs fallback to local:', error);
  }
  return getLocalCollection<AuditLog>('audit_logs');
}

export async function logAuditEvent(
  action: string,
  details: string,
  category: AuditLog['category'] = 'SYSTEM',
  userName = 'Sistema',
  userEmail = ''
): Promise<void> {
  const id = `log_${Date.now()}`;
  const logItem: AuditLog = {
    id,
    timestamp: new Date().toISOString(),
    action,
    details,
    category,
    userName,
    userEmail,
  };
  upsertLocalItem<AuditLog>('audit_logs', logItem, 'id');

  try {
    await setDoc(doc(db, 'audit_logs', id), logItem);
  } catch (e) {
    console.warn('Notice: Could not record audit log to Firestore (saved locally):', e);
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
      const data = { ...DEFAULT_SETTINGS, ...docSnap.data() } as ClinicSettings;
      if (typeof window !== 'undefined') {
        localStorage.setItem('estetica_settings', JSON.stringify(data));
      }
      return data;
    }
  } catch {
    // Check local storage fallback
    if (typeof window !== 'undefined') {
      const local = localStorage.getItem('estetica_settings');
      if (local) return JSON.parse(local);
    }
  }
  return DEFAULT_SETTINGS;
}

export async function saveClinicSettings(settings: Partial<ClinicSettings>): Promise<void> {
  const current = await getClinicSettings();
  const updated = { ...current, ...cleanFirestoreData(settings) };
  if (typeof window !== 'undefined') {
    localStorage.setItem('estetica_settings', JSON.stringify(updated));
  }
  try {
    await setDoc(doc(db, 'settings', 'general'), cleanFirestoreData(settings), { merge: true });
  } catch (err) {
    console.warn('Notice: Firestore saveClinicSettings failed (saved locally):', err);
  }
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

export const defaultRooms: Room[] = [
  {
    id: 'r-1',
    name: 'Consultorio 1 - Facial & Dermocosmética',
    description: 'Equipado para limpieza profunda, peelings químicos y alta frecuencia.',
    equipment: ['Punta de diamante', 'Vaporizador de ozono', 'Lámpara de Wood', 'Alta frecuencia'],
    isActive: true,
  },
  {
    id: 'r-2',
    name: 'Consultorio 2 - Modelado Corporal & Masajes',
    description: 'Ambiente climatizado, camilla hidráulica ergonómica y aromaterapia.',
    equipment: ['Equipo Criolipólisis Plana 4 cabezales', 'Ultracavitador', 'Camilla de madera termorregulada'],
    isActive: true,
  },
  {
    id: 'r-3',
    name: 'Consultorio 3 - Láser Diodo Trío',
    description: 'Sala con protección visual, filtros ópticos y cabezal continuo bajo cero.',
    equipment: ['Láser Diodo Trío 808nm', 'Gafas de protección láser grado médico', 'Sistema de enfriamiento chiller'],
    isActive: true,
  },
];

export async function ensureSeededCollections(): Promise<void> {
  try {
    const tSnap = await getDocs(collection(db, 'treatments'));
    if (tSnap.empty) {
      for (const t of defaultTreatments) {
        await setDoc(doc(db, 'treatments', t.id), { ...t, updatedAt: serverTimestamp() }, { merge: true });
      }
    }
    const pSnap = await getDocs(collection(db, 'professionals'));
    if (pSnap.empty) {
      for (const p of defaultProfessionals) {
        await setDoc(doc(db, 'professionals', p.id), { ...p, updatedAt: serverTimestamp() }, { merge: true });
      }
    }
    const rSnap = await getDocs(collection(db, 'rooms'));
    if (rSnap.empty) {
      for (const r of defaultRooms) {
        await setDoc(doc(db, 'rooms', r.id), { ...r, updatedAt: serverTimestamp() }, { merge: true });
      }
    }
  } catch (e) {
    console.warn('Notice: Firestore seeding check completed with fallback:', e);
  }
}
