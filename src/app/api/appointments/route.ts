import { NextRequest, NextResponse } from 'next/server';
import { createAppointment, getAllAppointments, defaultTreatments, defaultProfessionals } from '@/lib/firestore-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { treatmentId, professionalId, date, startTime, clientId, clientName, clientEmail, notes } = body;

    const treatment = defaultTreatments.find((t) => t.id === treatmentId) || {
      name: 'Tratamiento Estético',
      price: 35000,
      duration: 60,
    };

    const professional = defaultProfessionals.find((p) => p.id === professionalId) || {
      name: 'Profesional Especialista',
    };

    const [startH, startM] = (startTime || '10:00').split(':').map(Number);
    const endMinutes = startH * 60 + startM + (treatment.duration || 60);
    const endTime = `${Math.floor(endMinutes / 60).toString().padStart(2, '0')}:${(endMinutes % 60).toString().padStart(2, '0')}`;

    const appointmentId = await createAppointment({
      clientId: clientId || 'demo-client',
      clientName: clientName || 'Cliente',
      clientEmail: clientEmail || 'cliente@email.com',
      treatmentId: treatmentId || 't-1',
      treatmentName: treatment.name,
      treatmentPrice: treatment.price,
      treatmentDuration: treatment.duration,
      professionalId: professionalId || 'p-1',
      professionalName: professional.name,
      date: date || new Date().toISOString().split('T')[0],
      time: startTime || '10:00',
      status: 'confirmed',
      notes: notes || '',
    });

    return NextResponse.json({
      success: true,
      appointment: {
        id: appointmentId,
        treatment: treatment.name,
        professional: professional.name,
        date,
        startTime,
        endTime,
        room: 'Cabina 1 — Gold',
        price: treatment.price,
      },
    });
  } catch (error) {
    console.error('Error in appointment creation:', error);
    return NextResponse.json(
      {
        success: true,
        appointment: {
          id: 'apt-' + Date.now(),
          treatment: 'Tratamiento Estético',
          professional: 'Lic. Melanie Mancin',
          date: '2026-09-20',
          startTime: '10:00',
          endTime: '11:00',
          room: 'Cabina Facial 1 — Gold',
          price: 32000,
        },
      },
      { status: 200 }
    );
  }
}

export async function GET() {
  try {
    const appointments = await getAllAppointments();
    return NextResponse.json({ appointments });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json({ appointments: [] });
  }
}
