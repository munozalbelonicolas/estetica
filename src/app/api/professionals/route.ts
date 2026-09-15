import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const treatmentId = searchParams.get('treatmentId');

  try {
    const where: any = { isActive: true };

    if (treatmentId) {
      where.professionalTreatments = {
        some: { treatmentId },
      };
    }

    const professionals = await prisma.professional.findMany({
      where,
      include: {
        user: {
          select: { firstName: true, lastName: true },
        },
      },
    });

    return NextResponse.json({ professionals });
  } catch (error) {
    console.error('Get professionals error:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
