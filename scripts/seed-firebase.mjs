import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD-6Y-ptY2oaZ144y93wauaZK8_te2qYJE",
  authDomain: "estetica-12593.firebaseapp.com",
  projectId: "estetica-12593",
  storageBucket: "estetica-12593.firebasestorage.app",
  messagingSenderId: "572906197549",
  appId: "1:572906197549:web:76bf33b0f9a29722eadea4",
  measurementId: "G-Y5C3FZWCXP"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const ADMINS = [
  {
    email: 'melaniemancin@gmail.com',
    password: 'Admin.123!',
    firstName: 'Melanie',
    lastName: 'Mancin',
    phone: '+54 11 0000-0000',
    roles: ['admin', 'professional', 'client'],
  },
  {
    email: 'nicolasmunozalbelo@gmail.com',
    password: 'Admin.123!',
    firstName: 'Nicolás',
    lastName: 'Muñoz',
    phone: '+54 11 0000-0000',
    roles: ['admin', 'professional', 'client'],
  },
];

const TREATMENTS = [
  {
    id: 't-1',
    name: 'Limpieza Facial Profunda',
    slug: 'limpieza-facial-profunda',
    description: 'Limpieza profesional con extracción, exfoliación enzimática, microdermoabrasión y máscara descongestiva según el tipo de piel. Devuelve la luminosidad y frescura natural.',
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
    description: 'Tecnología de calor controlado que estimula la síntesis de colágeno y elastina, brindando un efecto tensor inmediato y progresivo.',
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
    description: 'Aplicación de ácidos cosmecéuticos para renovación celular selectiva, tratamiento de manchas, acné y líneas de expresión.',
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
    description: 'Terapia manual profunda combinada con aceites esenciales botánicos y piedras calientes para liberar tensiones musculares acumuladas.',
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
    description: 'Combinación de radiofrecuencia, láser infrarrojo, vacumterapia y masaje de rodillos para reducción de celulitis y modelado corporal.',
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
    description: 'Sistema láser de última generación indoloro con cabezal frío, apto para todo tipo de pieles durante todo el año.',
    price: 28000,
    duration: 30,
    category: 'Depilación',
    image: '/images/treatment-cleanse.jpg',
    benefits: ['Resultados visibles desde la 1° sesión', 'Totalmente indoloro', 'Previene foliculitis'],
    featured: false,
    isActive: true,
  },
];

const PROFESSIONALS = [
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

async function seed() {
  console.log('🚀 Creando administradores en Firebase Auth...');

  // 1. Create / Sign In Admin Users in Auth
  for (const admin of ADMINS) {
    let uid = '';
    try {
      const userCred = await createUserWithEmailAndPassword(auth, admin.email, admin.password);
      uid = userCred.user.uid;
      console.log(`✓ Usuario Auth CREADO: ${admin.email}`);
    } catch (e) {
      if (e.code === 'auth/email-already-in-use') {
        try {
          const userCred = await signInWithEmailAndPassword(auth, admin.email, admin.password);
          uid = userCred.user.uid;
          console.log(`✓ Usuario Auth YA EXISTÍA (login exitoso): ${admin.email}`);
        } catch (loginErr) {
          console.log(`! Usuario ${admin.email} ya existe en Firebase Auth.`);
        }
      } else {
        console.error(`Error creando usuario ${admin.email}:`, e.message);
      }
    }

    if (uid) {
      try {
        await setDoc(
          doc(db, 'users', uid),
          {
            uid,
            email: admin.email,
            firstName: admin.firstName,
            lastName: admin.lastName,
            phone: admin.phone,
            roles: admin.roles,
            emailVerified: true,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
        console.log(`✓ Perfil Firestore guardado como ADMIN: ${admin.email}`);
      } catch (err) {
        console.warn(`! Firestore doc write for ${admin.email}: ${err.message}`);
      }
    }
  }

  // 2. Seed Treatments
  try {
    for (const t of TREATMENTS) {
      await setDoc(doc(db, 'treatments', t.id), { ...t, updatedAt: serverTimestamp() }, { merge: true });
      console.log(`✓ Tratamiento guardado: ${t.name}`);
    }
  } catch (err) {
    console.warn(`! Firestore treatments write: ${err.message}`);
  }

  // 3. Seed Professionals
  try {
    for (const p of PROFESSIONALS) {
      await setDoc(doc(db, 'professionals', p.id), { ...p, updatedAt: serverTimestamp() }, { merge: true });
      console.log(`✓ Profesional guardado: ${p.name}`);
    }
  } catch (err) {
    console.warn(`! Firestore professionals write: ${err.message}`);
  }

  console.log('🎉 Proceso de configuración de Firebase finalizado.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Error durante la inicialización:', err);
  process.exit(1);
});
