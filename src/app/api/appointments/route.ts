import { NextRequest, NextResponse } from 'next/server';
import {
  createAppointment,
  getAllAppointments,
  getAppointmentsByClient,
  getAppointmentsByProfessional,
  updateAppointmentStatus,
  getTreatments,
  getProfessionals,
  defaultTreatments,
  defaultProfessionals,
} from '@/lib/firestore-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      treatmentId,
      professionalId,
      date,
      startTime,
      clientId,
      clientName,
      clientEmail,
      clientPhone,
      notes,
    } = body;

    const [allTreatments, allProfessionals] = await Promise.all([
      getTreatments().catch(() => defaultTreatments),
      getProfessionals().catch(() => defaultProfessionals),
    ]);

    const treatment =
      allTreatments.find((t) => t.id === treatmentId) ||
      defaultTreatments.find((t) => t.id === treatmentId) || {
        name: 'Tratamiento Estético',
        price: 35000,
        duration: 60,
      };

    const professional =
      allProfessionals.find((p) => p.id === professionalId) ||
      defaultProfessionals.find((p) => p.id === professionalId) || {
        name: 'Profesional Especialista',
      };

    const [startH, startM] = (startTime || '10:00').split(':').map(Number);
    const endMinutes = startH * 60 + startM + (treatment.duration || 60);
    const endTime = `${Math.floor(endMinutes / 60)
      .toString()
      .padStart(2, '0')}:${(endMinutes % 60).toString().padStart(2, '0')}`;

    const appointmentId = await createAppointment({
      clientId: clientId || 'demo-client',
      clientName: clientName || 'Cliente',
      clientEmail: clientEmail || 'cliente@email.com',
      clientPhone: clientPhone || '',
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
      { error: 'Error al crear el turno en la base de datos' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    const professionalId = searchParams.get('professionalId');
    const date = searchParams.get('date');

    let appointments;
    if (clientId) {
      appointments = await getAppointmentsByClient(clientId);
    } else if (professionalId) {
      appointments = await getAppointmentsByProfessional(professionalId);
    } else {
      appointments = await getAllAppointments();
    }

    if (date) {
      appointments = appointments.filter((apt) => apt.date === date);
    }

    return NextResponse.json({ appointments });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json({ appointments: [] });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, notes } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: 'id y status son requeridos' },
        { status: 400 }
      );
    }

    await updateAppointmentStatus(id, status, notes);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating appointment:', error);
    return NextResponse.json(
      { error: 'Error al actualizar el turno' },
      { status: 500 }
    );
  }
}
