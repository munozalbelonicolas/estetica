import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const treatments = await prisma.treatment.findMany({
      where: { isActive: true },
      include: {
        category: { select: { name: true } },
      },
      orderBy: [{ category: { sortOrder: 'asc' } }, { sortOrder: 'asc' }],
    });

    return NextResponse.json({ treatments });
  } catch (error) {
    console.error('Get treatments error:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
