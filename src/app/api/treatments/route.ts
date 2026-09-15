import { NextResponse } from 'next/server';
import { getTreatments } from '@/lib/firestore-service';

export async function GET() {
  try {
    const treatments = await getTreatments();
    return NextResponse.json({
      treatments: treatments.map((t) => ({
        id: t.id,
        name: t.name,
        slug: t.slug,
        description: t.description,
        durationMinutes: t.duration,
        price: t.price,
        showPrice: true,
        category: { name: t.category },
        image: t.image,
      })),
    });
  } catch (error) {
    console.error('Get treatments error:', error);
    return NextResponse.json({ error: 'Error al obtener tratamientos' }, { status: 500 });
  }
}
