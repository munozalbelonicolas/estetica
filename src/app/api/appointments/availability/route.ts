import { NextRequest, NextResponse } from 'next/server';
import { getAllAppointments } from '@/lib/firestore-service';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const treatmentId = searchParams.get('treatmentId');
  const professionalId = searchParams.get('professionalId');
  const dateStr = searchParams.get('date');

  if (!treatmentId || !dateStr) {
    return NextResponse.json(
      { error: 'Faltan parámetros: treatmentId, date' },
      { status: 400 }
    );
  }

  const date = new Date(dateStr + 'T00:00:00');
  const dayOfWeek = date.getDay(); // 0=Sunday

  if (dayOfWeek === 0) {
    return NextResponse.json({ slots: [], message: 'Los domingos el centro se encuentra cerrado.' });
  }

  // Generate standard available time slots for the aesthetic studio
  const baseTimes = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
  const rooms = [
    { roomId: 'cab-1', roomName: 'Cabina Facial 1 — Gold' },
    { roomId: 'cab-2', roomName: 'Cabina Corporal 2 — Spa' },
    { roomId: 'cab-3', roomName: 'Cabina Láser 3 — Premium' },
  ];

  try {
    const allAppointments = await getAllAppointments();
    // Filter booked appointments on dateStr that are active (not cancelled)
    const bookedTimes = new Set(
      allAppointments
        .filter((apt) => {
          if (apt.date !== dateStr || apt.status === 'cancelled') return false;
          if (professionalId && apt.professionalId && apt.professionalId !== professionalId) return false;
          return true;
        })
        .map((apt) => apt.time)
    );

    const availableSlots = baseTimes
      .filter((time) => !bookedTimes.has(time))
      .map((time, idx) => {
        const room = rooms[idx % rooms.length];
        return {
          time,
          roomId: room.roomId,
          roomName: room.roomName,
        };
      });

    return NextResponse.json({ slots: availableSlots });
  } catch (err) {
    console.error('Error calculating availability:', err);
    // fallback
    const slots = baseTimes.map((time, idx) => ({
      time,
      roomId: rooms[idx % rooms.length].roomId,
      roomName: rooms[idx % rooms.length].roomName,
    }));
    return NextResponse.json({ slots });
  }
}
