import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth-utils';
import { createAppointmentSchema } from '@/lib/validations';
import { createAuditLog } from '@/lib/audit';

/**
 * POST /api/appointments
 * Create a new appointment (book a slot)
 */
export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const result = createAppointmentSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: result.error.issues },
        { status: 400 }
      );
    }

    const { treatmentId, professionalId, date, startTime } = result.data;

    // Get client record
    const client = await prisma.client.findUnique({
      where: { userId: user.id },
    });

    if (!client) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 });
    }

    // Get treatment for duration
    const treatment = await prisma.treatment.findUnique({
      where: { id: treatmentId },
      select: { durationMinutes: true, name: true },
    });

    if (!treatment) {
      return NextResponse.json({ error: 'Tratamiento no encontrado' }, { status: 404 });
    }

    // Calculate end time
    const [startH, startM] = startTime.split(':').map(Number);
    const endMinutes = startH * 60 + startM + treatment.durationMinutes;
    const endTime = `${Math.floor(endMinutes / 60).toString().padStart(2, '0')}:${(endMinutes % 60).toString().padStart(2, '0')}`;

    const appointmentDate = new Date(date + 'T00:00:00');

    // === BACKEND VALIDATION ===
    // Double-check availability (race condition protection)

    // Check professional availability
    const conflictingAppt = await prisma.appointment.findFirst({
      where: {
        professionalId,
        date: appointmentDate,
        status: { in: ['confirmed', 'pending'] },
        OR: [
          { startTime: { lt: endTime }, endTime: { gt: startTime } },
        ],
      },
    });

    if (conflictingAppt) {
      return NextResponse.json(
        { error: 'El horario ya no está disponible. Por favor seleccioná otro.' },
        { status: 409 }
      );
    }

    // Find available room
    const compatibleRooms = await prisma.treatmentRoom.findMany({
      where: { treatmentId },
      select: { roomId: true },
    });

    let assignedRoomId: string | null = null;

    for (const { roomId } of compatibleRooms) {
      const roomConflict = await prisma.appointment.findFirst({
        where: {
          roomId,
          date: appointmentDate,
          status: { in: ['confirmed', 'pending'] },
          OR: [
            { startTime: { lt: endTime }, endTime: { gt: startTime } },
          ],
        },
      });

      if (!roomConflict) {
        assignedRoomId = roomId;
        break;
      }
    }

    if (!assignedRoomId) {
      return NextResponse.json(
        { error: 'No hay consultorios disponibles para ese horario.' },
        { status: 409 }
      );
    }

    // Create appointment
    const appointment = await prisma.appointment.create({
      data: {
        clientId: client.id,
        professionalId,
        treatmentId,
        roomId: assignedRoomId,
        date: appointmentDate,
        startTime,
        endTime,
        status: 'confirmed',
      },
      include: {
        treatment: { select: { name: true } },
        professional: { include: { user: { select: { firstName: true, lastName: true } } } },
        room: { select: { name: true } },
      },
    });

    // Audit log
    await createAuditLog({
      userId: user.id,
      action: 'create',
      entityType: 'appointment',
      entityId: appointment.id,
      details: {
        treatmentName: treatment.name,
        date,
        startTime,
        endTime,
      },
    });

    return NextResponse.json({
      message: 'Turno reservado exitosamente',
      appointment: {
        id: appointment.id,
        date: date,
        startTime,
        endTime,
        treatment: appointment.treatment.name,
        professional: `${appointment.professional.user.firstName} ${appointment.professional.user.lastName}`,
        room: appointment.room.name,
        status: appointment.status,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Appointment creation error:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

/**
 * GET /api/appointments
 * Get appointments for the current user
 */
export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const upcoming = searchParams.get('upcoming');

  try {
    const client = await prisma.client.findUnique({
      where: { userId: user.id },
    });

    if (!client) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 });
    }

    const where: any = { clientId: client.id };

    if (status) {
      where.status = status;
    }

    if (upcoming === 'true') {
      where.date = { gte: new Date() };
      where.status = { in: ['confirmed', 'pending'] };
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        treatment: { select: { name: true, durationMinutes: true } },
        professional: {
          include: { user: { select: { firstName: true, lastName: true } } },
        },
        room: { select: { name: true } },
      },
      orderBy: [{ date: upcoming === 'true' ? 'asc' : 'desc' }, { startTime: 'asc' }],
    });

    return NextResponse.json({ appointments });
  } catch (error) {
    console.error('Get appointments error:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
