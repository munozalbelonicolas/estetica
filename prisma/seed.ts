import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...\n');

  // ─── ROLES ──────────────────────────────────────────────
  console.log('Creating roles...');
  const clientRole = await prisma.role.upsert({
    where: { name: 'client' },
    update: {},
    create: { name: 'client', label: 'Cliente' },
  });
  const professionalRole = await prisma.role.upsert({
    where: { name: 'professional' },
    update: {},
    create: { name: 'professional', label: 'Profesional' },
  });
  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: { name: 'admin', label: 'Administrador' },
  });

  // ─── PERMISSIONS ────────────────────────────────────────
  console.log('Creating permissions...');
  const permissionData = [
    { key: 'profile.view', label: 'Ver perfil', group: 'perfil' },
    { key: 'profile.edit', label: 'Editar perfil', group: 'perfil' },
    { key: 'treatments.view', label: 'Ver tratamientos', group: 'tratamientos' },
    { key: 'treatments.manage', label: 'Gestionar tratamientos', group: 'tratamientos' },
    { key: 'appointments.view_own', label: 'Ver turnos propios', group: 'turnos' },
    { key: 'appointments.create', label: 'Crear turnos', group: 'turnos' },
    { key: 'appointments.view_all', label: 'Ver todos los turnos', group: 'turnos' },
    { key: 'appointments.manage', label: 'Gestionar turnos', group: 'turnos' },
    { key: 'schedule.view_own', label: 'Ver agenda propia', group: 'agenda' },
    { key: 'schedule.view_all', label: 'Ver agenda completa', group: 'agenda' },
    { key: 'rooms.view_availability', label: 'Ver disponibilidad consultorios', group: 'consultorios' },
    { key: 'rooms.manage', label: 'Gestionar consultorios', group: 'consultorios' },
    { key: 'clients.view', label: 'Ver clientes', group: 'clientes' },
    { key: 'clients.manage', label: 'Gestionar clientes', group: 'clientes' },
    { key: 'records.view_own', label: 'Ver historial propio', group: 'historial' },
    { key: 'records.view_assigned', label: 'Ver historial de pacientes', group: 'historial' },
    { key: 'records.create', label: 'Crear registros', group: 'historial' },
    { key: 'photos.upload', label: 'Subir fotos', group: 'fotos' },
    { key: 'photos.view_client', label: 'Ver fotos de clientes', group: 'fotos' },
    { key: 'photos.manage_public', label: 'Gestionar galería pública', group: 'fotos' },
    { key: 'professionals.manage', label: 'Gestionar profesionales', group: 'profesionales' },
    { key: 'reports.view', label: 'Ver reportes', group: 'reportes' },
    { key: 'users.manage', label: 'Gestionar usuarios', group: 'usuarios' },
    { key: 'roles.manage', label: 'Gestionar roles', group: 'usuarios' },
    { key: 'audit.view', label: 'Ver auditoría', group: 'admin' },
  ];

  const permissions: Record<string, string> = {};
  for (const p of permissionData) {
    const perm = await prisma.permission.upsert({
      where: { key: p.key },
      update: {},
      create: p,
    });
    permissions[p.key] = perm.id;
  }

  // ─── ROLE-PERMISSION ASSIGNMENTS ────────────────────────
  console.log('Assigning permissions to roles...');

  // Client permissions
  const clientPerms = [
    'profile.view', 'profile.edit', 'treatments.view',
    'appointments.view_own', 'appointments.create', 'records.view_own',
  ];
  for (const key of clientPerms) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: clientRole.id, permissionId: permissions[key] } },
      update: {},
      create: { roleId: clientRole.id, permissionId: permissions[key] },
    });
  }

  // Professional permissions
  const profPerms = [
    'profile.view', 'profile.edit', 'treatments.view',
    'appointments.view_own', 'appointments.create', 'appointments.view_all',
    'schedule.view_own', 'schedule.view_all', 'rooms.view_availability',
    'clients.view', 'records.view_assigned', 'records.create',
    'photos.upload', 'photos.view_client',
  ];
  for (const key of profPerms) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: professionalRole.id, permissionId: permissions[key] } },
      update: {},
      create: { roleId: professionalRole.id, permissionId: permissions[key] },
    });
  }

  // Admin gets ALL permissions
  for (const key of Object.keys(permissions)) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: adminRole.id, permissionId: permissions[key] } },
      update: {},
      create: { roleId: adminRole.id, permissionId: permissions[key] },
    });
  }

  // ─── PASSWORD HASH ──────────────────────────────────────
  const defaultPassword = await bcrypt.hash('Admin123!', 12);

  // ─── ADMIN USER ─────────────────────────────────────────
  console.log('Creating admin user...');
  const admin = await prisma.user.upsert({
    where: { email: 'admin@estetica.com' },
    update: {},
    create: {
      email: 'admin@estetica.com',
      passwordHash: defaultPassword,
      firstName: 'Nicolás',
      lastName: 'Admin',
      phone: '+54 11 9999-0000',
      isActive: true,
      userRoles: {
        create: { roleId: adminRole.id },
      },
    },
  });

  // ─── PROFESSIONAL USERS ─────────────────────────────────
  console.log('Creating professional users...');

  const profData = [
    {
      email: 'laura@estetica.com',
      firstName: 'Laura',
      lastName: 'Martínez',
      phone: '+54 11 1111-1111',
      bio: 'Especialista en tratamientos faciales con más de 8 años de experiencia. Certificada en radiofrecuencia y peelings químicos.',
      specialties: ['Tratamientos Faciales', 'Peeling', 'Radiofrecuencia'],
    },
    {
      email: 'maria@estetica.com',
      firstName: 'María',
      lastName: 'González',
      phone: '+54 11 2222-2222',
      bio: 'Experta en tratamientos corporales y masajes terapéuticos. Formación en drenaje linfático y técnicas de relajación.',
      specialties: ['Masajes', 'Tratamientos Corporales', 'Drenaje Linfático'],
    },
    {
      email: 'ana@estetica.com',
      firstName: 'Ana',
      lastName: 'López',
      phone: '+54 11 3333-3333',
      bio: 'Especialista en depilación y dermaplaning. Técnica precisa y atención cuidadosa para cada cliente.',
      specialties: ['Depilación', 'Dermaplaning', 'Limpieza Facial'],
    },
  ];

  const professionals: any[] = [];
  for (const p of profData) {
    const user = await prisma.user.upsert({
      where: { email: p.email },
      update: {},
      create: {
        email: p.email,
        passwordHash: defaultPassword,
        firstName: p.firstName,
        lastName: p.lastName,
        phone: p.phone,
        isActive: true,
        userRoles: {
          create: { roleId: professionalRole.id },
        },
        professional: {
          create: {
            bio: p.bio,
            specialties: p.specialties,
            isActive: true,
          },
        },
      },
      include: { professional: true },
    });
    professionals.push(user);
  }

  // ─── CLIENT USERS ───────────────────────────────────────
  console.log('Creating client users...');
  const clientData = [
    { email: 'valentina@email.com', firstName: 'Valentina', lastName: 'Rodríguez', phone: '+54 11 4444-1111' },
    { email: 'carolina@email.com', firstName: 'Carolina', lastName: 'Méndez', phone: '+54 11 4444-2222' },
    { email: 'lucia@email.com', firstName: 'Lucía', lastName: 'Sánchez', phone: '+54 11 4444-3333' },
    { email: 'camila@email.com', firstName: 'Camila', lastName: 'Fernández', phone: '+54 11 4444-4444' },
    { email: 'sofia@email.com', firstName: 'Sofía', lastName: 'Torres', phone: '+54 11 4444-5555' },
    { email: 'martina@email.com', firstName: 'Martina', lastName: 'Díaz', phone: '+54 11 4444-6666' },
    { email: 'julieta@email.com', firstName: 'Julieta', lastName: 'Romero', phone: '+54 11 4444-7777' },
    { email: 'florencia@email.com', firstName: 'Florencia', lastName: 'Peralta', phone: '+54 11 4444-8888' },
    { email: 'milagros@email.com', firstName: 'Milagros', lastName: 'Acosta', phone: '+54 11 4444-9999' },
    { email: 'agustina@email.com', firstName: 'Agustina', lastName: 'Navarro', phone: '+54 11 4444-0000' },
  ];

  const clients: any[] = [];
  for (const c of clientData) {
    const user = await prisma.user.upsert({
      where: { email: c.email },
      update: {},
      create: {
        email: c.email,
        passwordHash: defaultPassword,
        firstName: c.firstName,
        lastName: c.lastName,
        phone: c.phone,
        birthDate: new Date(1990 + Math.floor(Math.random() * 15), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        isActive: true,
        userRoles: {
          create: { roleId: clientRole.id },
        },
        client: {
          create: {},
        },
      },
      include: { client: true },
    });
    clients.push(user);
  }

  // ─── TREATMENT CATEGORIES ──────────────────────────────
  console.log('Creating treatment categories...');
  const categories = [
    { name: 'Tratamientos Faciales', slug: 'facial', description: 'Cuidados profesionales para tu rostro', sortOrder: 1 },
    { name: 'Tratamientos Corporales', slug: 'corporal', description: 'Tratamientos para cuerpo y bienestar', sortOrder: 2 },
    { name: 'Depilación', slug: 'depilacion', description: 'Servicios de depilación profesional', sortOrder: 3 },
    { name: 'Masajes', slug: 'masajes', description: 'Masajes terapéuticos y de relajación', sortOrder: 4 },
  ];

  const categoryMap: Record<string, string> = {};
  for (const cat of categories) {
    const created = await prisma.treatmentCategory.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    categoryMap[cat.slug] = created.id;
  }

  // ─── TREATMENTS ─────────────────────────────────────────
  console.log('Creating treatments...');
  const treatments = [
    {
      name: 'Limpieza Facial Profunda',
      slug: 'limpieza-facial-profunda',
      categorySlug: 'facial',
      description: 'Limpieza profesional que elimina impurezas, desobstruye poros y devuelve la luminosidad natural a tu piel. Incluye vaporización, extracción, y mascarilla personalizada.',
      durationMinutes: 60,
      price: 15000,
      indications: 'Recomendado cada 30-45 días para mantener la piel saludable.',
      contraindications: 'Evitar en caso de heridas abiertas o infecciones activas en el rostro.',
    },
    {
      name: 'Radiofrecuencia Facial',
      slug: 'radiofrecuencia-facial',
      categorySlug: 'facial',
      description: 'Tratamiento no invasivo que estimula la producción de colágeno y elastina para una piel más firme, tersa y rejuvenecida.',
      durationMinutes: 45,
      price: 18000,
      indications: 'Ideal para flacidez leve a moderada, líneas finas y pérdida de firmeza.',
      contraindications: 'No apto para embarazadas o personas con marcapasos.',
    },
    {
      name: 'Peeling Químico',
      slug: 'peeling-quimico',
      categorySlug: 'facial',
      description: 'Renovación celular controlada que mejora la textura, reduce manchas y unifica el tono de la piel. Personalizado según el tipo de piel.',
      durationMinutes: 40,
      price: 12000,
      indications: 'Manchas, textura irregular, cicatrices leves de acné.',
      contraindications: 'Evitar exposición solar intensa antes y después del tratamiento.',
    },
    {
      name: 'Dermaplaning',
      slug: 'dermaplaning',
      categorySlug: 'facial',
      description: 'Exfoliación mecánica suave que elimina células muertas y vello facial fino, dejando la piel ultrasuave y luminosa.',
      durationMinutes: 30,
      price: 10000,
      indications: 'Para todo tipo de piel. Ideal antes de eventos especiales.',
      contraindications: 'No realizar sobre piel con acné activo o rosácea severa.',
    },
    {
      name: 'Masaje Descontracturante',
      slug: 'masaje-descontracturante',
      categorySlug: 'masajes',
      description: 'Masaje terapéutico que alivia tensiones musculares, reduce el estrés y promueve la relajación profunda del cuerpo.',
      durationMinutes: 50,
      price: 14000,
      indications: 'Tensión muscular, contracturas, estrés acumulado.',
      contraindications: 'Evitar en caso de lesiones agudas o inflamaciones.',
    },
    {
      name: 'Drenaje Linfático',
      slug: 'drenaje-linfatico',
      categorySlug: 'corporal',
      description: 'Técnica de masaje suave que estimula el sistema linfático, reduce la retención de líquidos y mejora la circulación.',
      durationMinutes: 60,
      price: 16000,
      indications: 'Retención de líquidos, piernas cansadas, post-operatorio.',
      contraindications: 'No apto en caso de infecciones, trombosis o insuficiencia cardíaca.',
    },
    {
      name: 'Tratamiento Corporal Reafirmante',
      slug: 'tratamiento-corporal-reafirmante',
      categorySlug: 'corporal',
      description: 'Tratamiento que combina técnicas manuales y activos específicos para mejorar la firmeza y elasticidad de la piel del cuerpo.',
      durationMinutes: 70,
      price: 20000,
      indications: 'Flacidez corporal, pérdida de firmeza post parto o descenso de peso.',
      contraindications: 'Consultar en caso de problemas dermatológicos.',
    },
    {
      name: 'Depilación con Cera',
      slug: 'depilacion-cera',
      categorySlug: 'depilacion',
      description: 'Depilación profesional con cera de alta calidad. Servicio disponible para diferentes zonas del cuerpo.',
      durationMinutes: 30,
      price: 8000,
      indications: 'Vello no deseado en cualquier zona del cuerpo.',
      contraindications: 'No aplicar sobre piel irritada, quemada o con heridas.',
    },
  ];

  const treatmentMap: Record<string, string> = {};
  for (const t of treatments) {
    const created = await prisma.treatment.upsert({
      where: { slug: t.slug },
      update: {},
      create: {
        name: t.name,
        slug: t.slug,
        categoryId: categoryMap[t.categorySlug],
        description: t.description,
        durationMinutes: t.durationMinutes,
        price: t.price,
        showPrice: true,
        indications: t.indications,
        contraindications: t.contraindications,
        isActive: true,
      },
    });
    treatmentMap[t.slug] = created.id;
  }

  // ─── ROOMS ──────────────────────────────────────────────
  console.log('Creating rooms...');
  const rooms = [
    { name: 'Consultorio 1', type: 'consultorio' },
    { name: 'Consultorio 2', type: 'consultorio' },
    { name: 'Sala Corporal', type: 'sala_corporal' },
  ];

  const roomIds: string[] = [];
  for (const r of rooms) {
    const created = await prisma.room.create({ data: r });
    roomIds.push(created.id);
  }

  // ─── TREATMENT-ROOM COMPATIBILITY ──────────────────────
  console.log('Setting treatment-room compatibility...');
  // Facial treatments → Consultorio 1 y 2
  const facialTreatments = ['limpieza-facial-profunda', 'radiofrecuencia-facial', 'peeling-quimico', 'dermaplaning', 'depilacion-cera'];
  for (const slug of facialTreatments) {
    for (let i = 0; i < 2; i++) {
      await prisma.treatmentRoom.create({
        data: { treatmentId: treatmentMap[slug], roomId: roomIds[i] },
      });
    }
  }
  // Corporal treatments → Sala Corporal + Consultorio 2
  const corporalTreatments = ['masaje-descontracturante', 'drenaje-linfatico', 'tratamiento-corporal-reafirmante'];
  for (const slug of corporalTreatments) {
    await prisma.treatmentRoom.create({
      data: { treatmentId: treatmentMap[slug], roomId: roomIds[2] },
    });
    await prisma.treatmentRoom.create({
      data: { treatmentId: treatmentMap[slug], roomId: roomIds[1] },
    });
  }

  // ─── PROFESSIONAL-TREATMENT ASSIGNMENTS ─────────────────
  console.log('Assigning treatments to professionals...');
  const profs = await prisma.professional.findMany({ include: { user: true } });

  // Laura → facial treatments
  const laura = profs.find(p => p.user.firstName === 'Laura');
  if (laura) {
    for (const slug of ['limpieza-facial-profunda', 'radiofrecuencia-facial', 'peeling-quimico', 'dermaplaning']) {
      await prisma.professionalTreatment.create({
        data: { professionalId: laura.id, treatmentId: treatmentMap[slug] },
      });
    }
  }

  // María → corporal treatments
  const maria = profs.find(p => p.user.firstName === 'María');
  if (maria) {
    for (const slug of ['masaje-descontracturante', 'drenaje-linfatico', 'tratamiento-corporal-reafirmante']) {
      await prisma.professionalTreatment.create({
        data: { professionalId: maria.id, treatmentId: treatmentMap[slug] },
      });
    }
  }

  // Ana → depilation + some facial
  const ana = profs.find(p => p.user.firstName === 'Ana');
  if (ana) {
    for (const slug of ['depilacion-cera', 'dermaplaning', 'limpieza-facial-profunda']) {
      await prisma.professionalTreatment.create({
        data: { professionalId: ana.id, treatmentId: treatmentMap[slug] },
      });
    }
  }

  // ─── PROFESSIONAL SCHEDULES ─────────────────────────────
  console.log('Creating professional schedules...');
  for (const prof of profs) {
    // Monday to Friday 9:00-18:00
    for (let day = 1; day <= 5; day++) {
      await prisma.professionalSchedule.create({
        data: {
          professionalId: prof.id,
          dayOfWeek: day,
          startTime: '09:00',
          endTime: '18:00',
          isActive: true,
        },
      });
    }
    // Saturday 9:00-14:00
    await prisma.professionalSchedule.create({
      data: {
        professionalId: prof.id,
        dayOfWeek: 6,
        startTime: '09:00',
        endTime: '14:00',
        isActive: true,
      },
    });
  }

  // ─── APPOINTMENTS ───────────────────────────────────────
  console.log('Creating appointments...');
  const today = new Date();
  const clientRecords = await prisma.client.findMany({ include: { user: true } });

  // Create appointments for the next 7 days
  const statuses = ['confirmed', 'confirmed', 'confirmed', 'completed', 'completed'];
  const treatmentSlugs = Object.keys(treatmentMap);

  for (let dayOffset = -7; dayOffset <= 7; dayOffset++) {
    const date = new Date(today);
    date.setDate(date.getDate() + dayOffset);
    
    // Skip Sundays
    if (date.getDay() === 0) continue;

    // 3-5 appointments per day
    const numAppointments = 3 + Math.floor(Math.random() * 3);
    const usedSlots: Set<string> = new Set();

    for (let i = 0; i < numAppointments; i++) {
      const client = clientRecords[Math.floor(Math.random() * clientRecords.length)];
      const randomProf = profs[Math.floor(Math.random() * profs.length)];
      
      // Get treatments this professional can do
      const profTreatments = await prisma.professionalTreatment.findMany({
        where: { professionalId: randomProf.id },
        include: { treatment: true },
      });
      if (profTreatments.length === 0) continue;
      
      const profTreatment = profTreatments[Math.floor(Math.random() * profTreatments.length)];
      const treatment = profTreatment.treatment;

      // Get compatible rooms
      const compatibleRooms = await prisma.treatmentRoom.findMany({
        where: { treatmentId: treatment.id },
      });
      if (compatibleRooms.length === 0) continue;
      
      const room = compatibleRooms[Math.floor(Math.random() * compatibleRooms.length)];
      
      // Generate time slot
      const hours = [9, 10, 11, 12, 14, 15, 16, 17];
      const hour = hours[Math.floor(Math.random() * hours.length)];
      const startTime = `${hour.toString().padStart(2, '0')}:00`;
      
      // Check for collision
      const slotKey = `${randomProf.id}-${startTime}`;
      const roomKey = `${room.roomId}-${startTime}`;
      if (usedSlots.has(slotKey) || usedSlots.has(roomKey)) continue;
      usedSlots.add(slotKey);
      usedSlots.add(roomKey);

      const endMinutes = hour * 60 + treatment.durationMinutes;
      const endHour = Math.floor(endMinutes / 60);
      const endMin = endMinutes % 60;
      const endTime = `${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`;

      const status = dayOffset < 0
        ? (Math.random() > 0.15 ? 'completed' : (Math.random() > 0.5 ? 'cancelled' : 'no_show'))
        : (dayOffset === 0 ? 'confirmed' : 'confirmed');

      await prisma.appointment.create({
        data: {
          clientId: client.id,
          professionalId: randomProf.id,
          treatmentId: treatment.id,
          roomId: room.roomId,
          date: date,
          startTime,
          endTime,
          status,
        },
      });
    }
  }

  // ─── TREATMENT RECORDS (for completed appointments) ─────
  console.log('Creating treatment records...');
  const completedAppts = await prisma.appointment.findMany({
    where: { status: 'completed' },
    include: { treatment: true },
  });

  for (const appt of completedAppts) {
    await prisma.treatmentRecord.create({
      data: {
        appointmentId: appt.id,
        clientId: appt.clientId,
        professionalId: appt.professionalId,
        treatmentId: appt.treatmentId,
        date: appt.date,
        treatedArea: appt.treatment.name.includes('Facial') ? 'Rostro completo' : (appt.treatment.name.includes('Corporal') ? 'Cuerpo' : 'Zona específica'),
        observations: 'Tratamiento realizado sin inconvenientes. La paciente respondió bien al procedimiento.',
        productsUsed: 'Productos profesionales específicos para el tratamiento.',
        recommendations: 'Mantener hidratación. Usar protector solar. Evitar exposición solar directa por 48hs.',
        nextTreatmentSuggested: appt.treatment.name,
        nextSessionDate: new Date(appt.date.getTime() + 30 * 24 * 60 * 60 * 1000),
      },
    });
  }

  // ─── BUSINESS CONFIG ────────────────────────────────────
  console.log('Creating business config...');
  await prisma.businessConfig.upsert({
    where: { key: 'business_hours' },
    update: {},
    create: {
      key: 'business_hours',
      value: {
        monday: { open: '09:00', close: '20:00' },
        tuesday: { open: '09:00', close: '20:00' },
        wednesday: { open: '09:00', close: '20:00' },
        thursday: { open: '09:00', close: '20:00' },
        friday: { open: '09:00', close: '20:00' },
        saturday: { open: '09:00', close: '14:00' },
        sunday: null,
      },
    },
  });

  await prisma.businessConfig.upsert({
    where: { key: 'cancellation_policy' },
    update: {},
    create: {
      key: 'cancellation_policy',
      value: {
        minHoursBefore: 24,
        allowReschedule: true,
        message: 'Los turnos pueden cancelarse o reprogramarse con un mínimo de 24 horas de anticipación.',
      },
    },
  });

  console.log('\n✅ Seed completed successfully!');
  console.log('\n📋 Login credentials (all passwords: Admin123!):');
  console.log('   Admin:        admin@estetica.com');
  console.log('   Profesional:  laura@estetica.com / maria@estetica.com / ana@estetica.com');
  console.log('   Cliente:      valentina@email.com (and 9 more)');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
