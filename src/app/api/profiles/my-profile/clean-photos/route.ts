import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Profile } from '@/models/Profile';
import { getUserFromRequest } from '@/lib/auth';
import { extractPublicId } from '@/lib/cloudinary';

// Simulación: aquí podrías consultar Cloudinary para validar existencia real
// Por simplicidad, solo limpia URLs vacías, nulas o duplicadas

export async function PATCH(req: NextRequest) {
  try {
    await connectDB();
    const userId = await getUserFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }
    const profile = await Profile.findOne({ userId });
    if (!profile) {
      return NextResponse.json({ error: 'No tienes un perfil creado' }, { status: 404 });
    }
    // Limpiar: quitar vacíos, nulos, duplicados
    const cleanPhotos = Array.from(new Set((profile.photos || []).filter((url: string) => url && url.trim() !== '')));
    profile.photos = cleanPhotos;
    await profile.save();
    return NextResponse.json({ message: 'Array photos limpiado', photos: cleanPhotos }, { status: 200 });
  } catch (error) {
    console.error('Error al limpiar photos:', error);
    return NextResponse.json({ error: 'Error al limpiar photos' }, { status: 500 });
  }
}