import { NextResponse } from 'next/server';
import { getTreatments, createTreatment, updateTreatment } from '@/lib/firestore-service';

export async function GET() {
  try {
    const treatments = await getTreatments();
    return NextResponse.json({
      treatments: treatments.map((t) => ({
        id: t.id,
        name: t.name,
        slug: t.slug,
        description: t.description,
        shortDescription: t.shortDescription,
        durationMinutes: t.duration,
        price: t.price,
        showPrice: true,
        category: { name: t.category },
        image: t.image,
        isActive: t.isActive,
        benefits: t.benefits || [],
      })),
    });
  } catch (error) {
    console.error('Get treatments error:', error);
    return NextResponse.json({ error: 'Error al obtener tratamientos' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const id = await createTreatment({
      name: body.name,
      slug:
        body.slug ||
        body.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, ''),
      description: body.description || '',
      shortDescription: body.shortDescription || '',
      price: Number(body.price) || 0,
      duration: Number(body.duration || body.durationMinutes) || 60,
      category: body.category || 'Facial',
      image: body.image || '/images/treatments/facial.jpg',
      benefits: body.benefits || [],
      isActive: body.isActive !== false,
    });
    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Create treatment error:', error);
    return NextResponse.json({ error: 'Error al crear tratamiento' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, ...data } = body;
    if (!id) {
      return NextResponse.json({ error: 'ID de tratamiento requerido' }, { status: 400 });
    }
    await updateTreatment(id, data);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update treatment error:', error);
    return NextResponse.json({ error: 'Error al actualizar tratamiento' }, { status: 500 });
  }
}
