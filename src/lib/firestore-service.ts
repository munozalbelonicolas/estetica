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

// ─── USERS ───────────────────────────────────────────────────────────────────

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return { uid, ...(userDoc.data() as Omit<UserProfile, 'uid'>) };
    }
    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

export async function setUserProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
  try {
    await setDoc(
      doc(db, 'users', uid),
      {
        ...data,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error('Error saving user profile:', error);
    throw error;
  }
}

// ─── TREATMENTS ──────────────────────────────────────────────────────────────

export async function getTreatments(): Promise<Treatment[]> {
  try {
    const q = query(collection(db, 'treatments'), where('isActive', '==', true));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Treatment));
    }
    // Fallback if collection not seeded yet
    return defaultTreatments;
  } catch (error) {
    console.warn('Could not fetch treatments from Firestore, using initial dataset:', error);
    return defaultTreatments;
  }
}

export async function getTreatmentBySlug(slug: string): Promise<Treatment | null> {
  try {
    const q = query(collection(db, 'treatments'), where('slug', '==', slug), limit(1));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() } as Treatment;
    }
    return defaultTreatments.find((t) => t.slug === slug) || null;
  } catch {
    return defaultTreatments.find((t) => t.slug === slug) || null;
  }
}

// ─── PROFESSIONALS ───────────────────────────────────────────────────────────

export async function getProfessionals(): Promise<Professional[]> {
  try {
    const q = query(collection(db, 'professionals'), where('isActive', '==', true));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Professional));
    }
    return defaultProfessionals;
  } catch (error) {
    console.warn('Could not fetch professionals from Firestore, using initial dataset:', error);
    return defaultProfessionals;
  }
}

// ─── APPOINTMENTS ────────────────────────────────────────────────────────────

export async function createAppointment(data: Omit<Appointment, 'id' | 'createdAt'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, 'appointments'), {
      ...data,
      status: data.status || 'confirmed',
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
    const q = query(
      collection(db, 'appointments'),
      where('clientId', '==', clientId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Appointment));
  } catch {
    // Fallback without compound index
    const q = query(collection(db, 'appointments'), where('clientId', '==', clientId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Appointment));
  }
}

export async function getAllAppointments(): Promise<Appointment[]> {
  try {
    const q = query(collection(db, 'appointments'), orderBy('createdAt', 'desc'), limit(100));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Appointment));
  } catch {
    const snapshot = await getDocs(collection(db, 'appointments'));
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Appointment));
  }
}

export async function updateAppointmentStatus(
  id: string,
  status: Appointment['status']
): Promise<void> {
  await updateDoc(doc(db, 'appointments', id), { status, updatedAt: serverTimestamp() });
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
