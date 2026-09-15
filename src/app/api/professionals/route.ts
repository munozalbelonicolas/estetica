import { NextResponse } from 'next/server';
import { getProfessionals } from '@/lib/firestore-service';

export async function GET() {
  try {
    const professionals = await getProfessionals();
    return NextResponse.json({
      professionals: professionals.map((p) => {
        const names = p.name.replace('Lic. ', '').split(' ');
        return {
          id: p.id,
          name: p.name,
          user: {
            firstName: names[0] || p.name,
            lastName: names.slice(1).join(' ') || '',
          },
          role: p.role,
          bio: p.bio,
          specialties: p.specialties,
          image: p.image,
        };
      }),
    });
  } catch (error) {
    console.error('Get professionals error:', error);
    return NextResponse.json({ error: 'Error al obtener profesionales' }, { status: 500 });
  }
}
