// Fallback mock data when DB is not yet populated or offline
export interface DemoCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  sortOrder: number;
  isActive: boolean;
  treatments: DemoTreatment[];
}

export interface DemoTreatment {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  durationMinutes: number;
  price: number | null;
  showPrice: boolean;
  preparationInstructions?: string | null;
  aftercareInstructions?: string | null;
  contraindications?: string | null;
  recommendedSessions?: number | null;
  sessionIntervalDays?: number | null;
  imageUrl?: string | null;
  isActive: boolean;
  sortOrder: number;
  category?: { name: string; slug: string };
  professionalTreatments?: Array<{
    professional: {
      id: string;
      user: { firstName: string; lastName: string; avatarUrl?: string | null };
      specialties: string[];
    };
  }>;
}

export const DEMO_CATEGORIES: DemoCategory[] = [
  {
    id: 'cat-1',
    name: 'Tratamientos Faciales',
    slug: 'faciales',
    description: 'Tratamientos diseñados para revitalizar, iluminar y rejuvenecer la piel del rostro con tecnología avanzada.',
    sortOrder: 1,
    isActive: true,
    treatments: [
      {
        id: 't-1',
        categoryId: 'cat-1',
        name: 'Limpieza Facial Profunda',
        slug: 'limpieza-facial-profunda',
        shortDescription: 'Higiene profunda con extracción y punta de diamante.',
        description: 'Tratamiento completo de higiene facial que incluye desmaquillado, exfoliación mecánica con punta de diamante, vapor de ozono, extracción suave de impurezas y comedones, mascarilla descongestiva e hidratante y alta frecuencia antiséptica.',
        durationMinutes: 60,
        price: 32000,
        showPrice: true,
        preparationInstructions: 'Venir sin maquillaje si es posible. No haber tomado sol intenso 48hs previas.',
        aftercareInstructions: 'Evitar maquillaje y exposición solar directa por 24hs. Usar protector solar FPS 50.',
        contraindications: 'Acné inflamatorio severo o heridas abiertas.',
        recommendedSessions: 1,
        sessionIntervalDays: 30,
        isActive: true,
        sortOrder: 1,
        imageUrl: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 't-2',
        categoryId: 'cat-1',
        name: 'Radiofrecuencia Facial Tripolar',
        slug: 'radiofrecuencia-facial',
        shortDescription: 'Efecto lifting sin cirugía y producción natural de colágeno.',
        description: 'La radiofrecuencia genera calor controlado en las capas profundas de la dermis, contrayendo las fibras de colágeno existentes y estimulando la síntesis de nuevo colágeno y elastina. Redefine el óvalo facial y tensa la piel.',
        durationMinutes: 45,
        price: 38000,
        showPrice: true,
        preparationInstructions: 'Piel limpia e hidratada.',
        aftercareInstructions: 'Hidratar con suero de ácido hialurónico y aplicar protector solar.',
        contraindications: 'Marcapasos, embarazo o implantes metálicos en la zona facial.',
        recommendedSessions: 6,
        sessionIntervalDays: 15,
        isActive: true,
        sortOrder: 2,
        imageUrl: 'https://images.unsplash.com/photo-1512290900672-1f4175a0026e?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 't-3',
        categoryId: 'cat-1',
        name: 'Peeling Químico Renovador',
        slug: 'peeling-quimico',
        shortDescription: 'Renovación celular para manchas, líneas de expresión y luminosidad.',
        description: 'Aplicación de ácidos cosméticos adaptados al tipo de piel (glicólico, mandélico o salicílico) que remueven capas superficiales queratinizadas, uniformando el tono y textura de la piel.',
        durationMinutes: 45,
        price: 35000,
        showPrice: true,
        preparationInstructions: 'Suspender retinoides y exfoliantes 5 días antes.',
        aftercareInstructions: 'Uso obligatorio y continuo de fotoprotección solar cada 3 horas.',
        contraindications: 'Embarazo, lactancia, piel lastimada o expuesta al sol recientemente.',
        recommendedSessions: 4,
        sessionIntervalDays: 21,
        isActive: true,
        sortOrder: 3,
        imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
      },
    ],
  },
  {
    id: 'cat-2',
    name: 'Tratamientos Corporales',
    slug: 'corporales',
    description: 'Modelado, reducción de adiposidad localizada, tonificación y mejora del tono de la piel.',
    sortOrder: 2,
    isActive: true,
    treatments: [
      {
        id: 't-4',
        categoryId: 'cat-2',
        name: 'Criolipólisis Plana',
        slug: 'criolipolisis-plana',
        shortDescription: 'Reducción no invasiva de grasa localizada por frío controlado.',
        description: 'Tecnología médica que cristaliza y destruye selectivamente las células grasas mediante enfriamiento controlado, reduciendo volumen corporal de forma definitiva.',
        durationMinutes: 60,
        price: 55000,
        showPrice: true,
        preparationInstructions: 'Ingerir abundante agua antes y después de la sesión.',
        aftercareInstructions: 'Mantener hidratación alta de al menos 2 litros diarios.',
        contraindications: 'Crioglobulinemia, hernia en la zona o embarazo.',
        recommendedSessions: 3,
        sessionIntervalDays: 30,
        isActive: true,
        sortOrder: 1,
        imageUrl: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 't-5',
        categoryId: 'cat-2',
        name: 'Masaje Descontracturante & Relajante',
        slug: 'masaje-descontracturante',
        shortDescription: 'Alivio profundo de tensiones cervicales y lumbares con aromaterapia.',
        description: 'Sesión integral que combina técnicas manuales profundas para disolver contracturas con maniobras sedativas y aceites esenciales naturales de lavanda y eucalipto.',
        durationMinutes: 50,
        price: 28000,
        showPrice: true,
        preparationInstructions: 'Ropa cómoda y no haber ingerido comidas copiosas recientemente.',
        aftercareInstructions: 'Descansar e hidratarse adecuadamente tras la sesión.',
        contraindications: 'Fiebre, infecciones activas o trombosis.',
        recommendedSessions: 1,
        sessionIntervalDays: 15,
        isActive: true,
        sortOrder: 2,
        imageUrl: 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?auto=format&fit=crop&w=800&q=80',
      },
    ],
  },
  {
    id: 'cat-3',
    name: 'Depilación Definitiva Láser',
    slug: 'depilacion',
    description: 'Sistemas láser tridiodo indoloros y eficaces en todo tipo de fototipos.',
    sortOrder: 3,
    isActive: true,
    treatments: [
      {
        id: 't-6',
        categoryId: 'cat-3',
        name: 'Depilación Láser Diodo Trío',
        slug: 'depilacion-laser-diodo',
        shortDescription: 'Eliminación progresiva y definitiva del vello sin dolor.',
        description: 'Equipo de cabezal frío continuo que emite 3 longitudes de onda (Alejandrita, Diodo y Nd:YAG) para destruir el folículo piloso de manera rápida y segura.',
        durationMinutes: 40,
        price: 26000,
        showPrice: true,
        preparationInstructions: 'Rasurar con maquinilla la zona 24 horas antes. No arrancar con cera.',
        aftercareInstructions: 'Gel descongestivo de aloe vera. Evitar agua muy caliente en 24hs.',
        contraindications: 'Fotosensibilidad o consumo de medicamentos fotosensibilizantes.',
        recommendedSessions: 6,
        sessionIntervalDays: 30,
        isActive: true,
        sortOrder: 1,
        imageUrl: 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?auto=format&fit=crop&w=800&q=80',
      },
    ],
  },
];

export const DEMO_PROFESSIONALS = [
  {
    id: 'prof-1',
    user: {
      firstName: 'Valentina',
      lastName: 'Rossi',
      email: 'valentina@esteticastudio.com',
      avatarUrl: 'https://images.unsplash.com/photo-1594824813581-c7c427382f6e?auto=format&fit=crop&w=400&q=80',
    },
    bio: 'Cosmiatra Universitaria y especialista en dermocosmética avanzada con más de 8 años de trayectoria.',
    specialties: ['Cosmiatría Facial', 'Peelings Químicos', 'Rejuvenecimiento'],
    licenseNumber: 'MN-4821',
  },
  {
    id: 'prof-2',
    user: {
      firstName: 'Camila',
      lastName: 'Méndez',
      email: 'camila@esteticastudio.com',
      avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80',
    },
    bio: 'Kinesióloga Fisiatra especializada en estética y modelado corporal, aparatología y drenaje linfático.',
    specialties: ['Modelado Corporal', 'Criolipólisis', 'Drenaje Linfático Manual'],
    licenseNumber: 'MN-5914',
  },
  {
    id: 'prof-3',
    user: {
      firstName: 'Lucía',
      lastName: 'Fernández',
      email: 'lucia@esteticastudio.com',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    },
    bio: 'Técnica en Láser y Cosmetología, apasionada por los protocolos no invasivos e individualizados.',
    specialties: ['Láser Diodo', 'Radiofrecuencia', 'Masoterapia'],
    licenseNumber: 'MN-7230',
  },
];

export const DEMO_BEFORE_AFTER = [
  {
    id: 'ba-1',
    title: 'Tratamiento de Acné y Poros Dilatados',
    treatmentName: 'Peeling Químico Renovador',
    sessions: 4,
    description: 'Protocolo de 4 sesiones de peeling salicílico y mandélico combinado con higiene profunda.',
    beforeUrl: 'https://images.unsplash.com/photo-1512290900672-1f4175a0026e?auto=format&fit=crop&w=600&q=80',
    afterUrl: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=600&q=80',
    category: 'Facial',
  },
  {
    id: 'ba-2',
    title: 'Reafirmación Facial & Efecto Glow',
    treatmentName: 'Radiofrecuencia Facial Tripolar',
    sessions: 6,
    description: 'Lifting biológico sin agujas, estimulación de colágeno y reducción del surco nasogeniano.',
    beforeUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80',
    afterUrl: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=600&q=80',
    category: 'Facial',
  },
  {
    id: 'ba-3',
    title: 'Reducción de Adiposidad Abdominal',
    treatmentName: 'Criolipólisis Plana',
    sessions: 3,
    description: 'Reducción de 5 cm de contorno en zona infraumbilical tras 3 sesiones mensuales de frío plano.',
    beforeUrl: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=600&q=80',
    afterUrl: 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?auto=format&fit=crop&w=600&q=80',
    category: 'Corporal',
  },
];
