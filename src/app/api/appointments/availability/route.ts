import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth-utils';

/**
 * GET /api/appointments/availability
 * 
 * Query params:
 *   - treatmentId (required)
 *   - professionalId (required)
 *   - date (required, YYYY-MM-DD)
 * 
 * Returns available time slots for the given treatment, professional, and date.
 */
export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const treatmentId = searchParams.get('treatmentId');
  const professionalId = searchParams.get('professionalId');
  const dateStr = searchParams.get('date');

  if (!treatmentId || !professionalId || !dateStr) {
    return NextResponse.json(
      { error: 'Faltan parámetros: treatmentId, professionalId, date' },
      { status: 400 }
    );
  }

  try {
    const date = new Date(dateStr + 'T00:00:00');
    const dayOfWeek = date.getDay(); // 0=Sunday

    // 1. Get treatment details
    const treatment = await prisma.treatment.findUnique({
      where: { id: treatmentId },
      select: { id: true, durationMinutes: true, name: true },
    });
    if (!treatment) {
      return NextResponse.json({ error: 'Tratamiento no encontrado' }, { status: 404 });
    }

    // 2. Check professional schedule for this day
    const schedule = await prisma.professionalSchedule.findFirst({
      where: {
        professionalId,
        dayOfWeek,
        isActive: true,
      },
    });
    if (!schedule) {
      return NextResponse.json({ slots: [], message: 'La profesional no atiende este día' });
    }

    // 3. Get existing appointments for professional on this date
    const existingAppointments = await prisma.appointment.findMany({
      where: {
        professionalId,
        date,
        status: { in: ['confirmed', 'pending'] },
      },
      select: { startTime: true, endTime: true, roomId: true },
    });

    // 4. Get compatible rooms for this treatment
    const compatibleRooms = await prisma.treatmentRoom.findMany({
      where: { treatmentId },
      select: { roomId: true },
    });
    const compatibleRoomIds = compatibleRooms.map((cr) => cr.roomId);

    if (compatibleRoomIds.length === 0) {
      return NextResponse.json({ slots: [], message: 'No hay consultorios compatibles' });
    }

    // 5. Get all appointments using compatible rooms on this date
    const roomAppointments = await prisma.appointment.findMany({
      where: {
        roomId: { in: compatibleRoomIds },
        date,
        status: { in: ['confirmed', 'pending'] },
      },
      select: { startTime: true, endTime: true, roomId: true },
    });

    // 6. Get blocked slots for this date
    const blockedSlots = await prisma.blockedSlot.findMany({
      where: {
        date,
        OR: [
          { professionalId },
          { roomId: { in: compatibleRoomIds } },
          { allDay: true },
        ],
      },
    });

    // Check for all-day blocks
    const hasAllDayBlock = blockedSlots.some(
      (bs) => bs.allDay && (bs.professionalId === professionalId || !bs.professionalId)
    );
    if (hasAllDayBlock) {
      return NextResponse.json({ slots: [], message: 'No hay disponibilidad este día' });
    }

    // 7. Generate time slots (every 30 minutes within schedule)
    const [startHour, startMin] = schedule.startTime.split(':').map(Number);
    const [endHour, endMin] = schedule.endTime.split(':').map(Number);
    const scheduleStartMinutes = startHour * 60 + startMin;
    const scheduleEndMinutes = endHour * 60 + endMin;
    const slotInterval = 30; // minutes

    const availableSlots: { time: string; roomId: string; roomName: string }[] = [];

    // Get room names
    const rooms = await prisma.room.findMany({
      where: { id: { in: compatibleRoomIds }, isActive: true },
      select: { id: true, name: true },
    });
    const roomNames = rooms.reduce(
      (acc, r) => ({ ...acc, [r.id]: r.name }),
      {} as Record<string, string>
    );

    for (
      let slotStart = scheduleStartMinutes;
      slotStart + treatment.durationMinutes <= scheduleEndMinutes;
      slotStart += slotInterval
    ) {
      const slotEnd = slotStart + treatment.durationMinutes;
      const slotStartTime = `${Math.floor(slotStart / 60)
        .toString()
        .padStart(2, '0')}:${(slotStart % 60).toString().padStart(2, '0')}`;
      const slotEndTime = `${Math.floor(slotEnd / 60)
        .toString()
        .padStart(2, '0')}:${(slotEnd % 60).toString().padStart(2, '0')}`;

      // Check if professional is free
      const professionalBusy = existingAppointments.some((appt) => {
        return timeOverlaps(slotStartTime, slotEndTime, appt.startTime, appt.endTime);
      });

      if (professionalBusy) continue;

      // Check if professional is blocked
      const professionalBlocked = blockedSlots.some((bs) => {
        if (bs.professionalId !== professionalId) return false;
        if (bs.allDay) return true;
        if (bs.startTime && bs.endTime) {
          return timeOverlaps(slotStartTime, slotEndTime, bs.startTime, bs.endTime);
        }
        return false;
      });

      if (professionalBlocked) continue;

      // Find an available room
      let availableRoomId: string | null = null;
      for (const roomId of compatibleRoomIds) {
        const roomBusy = roomAppointments.some((appt) => {
          if (appt.roomId !== roomId) return false;
          return timeOverlaps(slotStartTime, slotEndTime, appt.startTime, appt.endTime);
        });

        const roomBlocked = blockedSlots.some((bs) => {
          if (bs.roomId !== roomId) return false;
          if (bs.allDay) return true;
          if (bs.startTime && bs.endTime) {
            return timeOverlaps(slotStartTime, slotEndTime, bs.startTime, bs.endTime);
          }
          return false;
        });

        if (!roomBusy && !roomBlocked) {
          availableRoomId = roomId;
          break;
        }
      }

      if (availableRoomId) {
        availableSlots.push({
          time: slotStartTime,
          roomId: availableRoomId,
          roomName: roomNames[availableRoomId] || 'Consultorio',
        });
      }
    }

    return NextResponse.json({ slots: availableSlots });
  } catch (error) {
    console.error('Availability error:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

/**
 * Check if two time ranges overlap.
 * Times are in "HH:MM" format.
 */
function timeOverlaps(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean {
  const toMinutes = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };
  const s1 = toMinutes(start1);
  const e1 = toMinutes(end1);
  const s2 = toMinutes(start2);
  const e2 = toMinutes(end2);
  return s1 < e2 && s2 < e1;
}
