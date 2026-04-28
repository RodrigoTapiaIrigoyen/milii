import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Profile } from '@/models/Profile';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const profile = await Profile.findOne({
      _id: params.id,
      isPublished: true,
      approvalStatus: 'approved',
    }).select('-userId'); // No exponer el userId

    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'Perfil no encontrado' },
        { status: 404 }
      );
    }

    // Incrementar contador de visualizaciones
    await Profile.findByIdAndUpdate(params.id, {
      $inc: { 'stats.views': 1 }
    });

    return NextResponse.json({
      success: true,
      profile
    });
  } catch (error) {
    console.error('Error al obtener perfil público:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener perfil' },
      { status: 500 }
    );
  }
}
