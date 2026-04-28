import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Profile } from '@/models/Profile';

export async function GET() {
  try {
    await connectDB();

    // Obtener perfiles publicados, verificados y activos (máximo 6 para la página principal)
    const profiles = await Profile.find({
      isPublished: true,
      'verification.isVerified': true,
      'status.isActive': true,
    })
      .select('name age whatsapp location photos pricing services description stats')
      .sort({ 'stats.views': -1, createdAt: -1 }) // Ordenar por popularidad
      .limit(6)
      .lean();

    return NextResponse.json({ profiles });
  } catch (error: any) {
    console.error('Error fetching featured profiles:', error);
    return NextResponse.json(
      { error: 'Error al obtener perfiles destacados' },
      { status: 500 }
    );
  }
}
