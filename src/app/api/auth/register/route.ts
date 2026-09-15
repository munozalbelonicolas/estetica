import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({
    message: 'Registration is managed via Firebase Auth client SDK',
  });
}
