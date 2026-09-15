import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { registerSchema } from '@/lib/validations';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const result = registerSchema.safeParse(body);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((err: any) => {
        const field = err.path[0] as string;
        fieldErrors[field] = err.message;
      });
      return NextResponse.json(
        { message: 'Datos inválidos', errors: fieldErrors },
        { status: 400 }
      );
    }

    const { firstName, lastName, email, phone, birthDate, password } = result.data;

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'Ya existe una cuenta con ese email', errors: { email: 'Este email ya está registrado' } },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Get client role
    const clientRole = await prisma.role.findUnique({
      where: { name: 'client' },
    });

    if (!clientRole) {
      return NextResponse.json(
        { message: 'Error de configuración del sistema' },
        { status: 500 }
      );
    }

    // Create user with client role
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        phone: phone || null,
        birthDate: birthDate ? new Date(birthDate) : null,
        passwordHash,
        userRoles: {
          create: {
            roleId: clientRole.id,
          },
        },
        client: {
          create: {},
        },
      },
    });

    return NextResponse.json(
      {
        message: 'Cuenta creada exitosamente',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
