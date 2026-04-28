import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Favorite } from '@/models/Favorite';
import { Profile } from '@/models/Profile';
import { getUserFromRequest } from '@/lib/auth';

// GET - Obtener favoritos del usuario
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const userId = await getUserFromRequest(request);
    if (!userId) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    // Obtener favoritos con información del perfil
    const favorites = await Favorite.find({ userId })
      .populate({
        path: 'profileId',
        select: 'name age gender description location services pricing photos verification stats isPublished',
      })
      .sort({ createdAt: -1 })
      .lean();

    // Filtrar perfiles eliminados o no publicados
    const validFavorites = favorites.filter(
      (fav: any) => fav.profileId && fav.profileId.isPublished
    );

    return NextResponse.json({
      success: true,
      favorites: validFavorites,
    });
  } catch (error) {
    console.error('Error al obtener favoritos:', error);
    return NextResponse.json(
      { error: 'Error al obtener favoritos' },
      { status: 500 }
    );
  }
}

// POST - Agregar a favoritos
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const userId = await getUserFromRequest(request);
    if (!userId) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const { profileId } = await request.json();

    if (!profileId) {
      return NextResponse.json(
        { error: 'ID de perfil requerido' },
        { status: 400 }
      );
    }

    // Verificar que el perfil existe
    const profile = await Profile.findById(profileId);
    if (!profile) {
      return NextResponse.json(
        { error: 'Perfil no encontrado' },
        { status: 404 }
      );
    }

    // No permitir que agregue su propio perfil
    if (profile.userId.toString() === userId) {
      return NextResponse.json(
        { error: 'No puedes agregar tu propio perfil a favoritos' },
        { status: 400 }
      );
    }

    // Verificar si ya existe
    const existingFavorite = await Favorite.findOne({ userId, profileId });
    if (existingFavorite) {
      return NextResponse.json(
        { error: 'Ya está en favoritos' },
        { status: 409 }
      );
    }

    // Crear favorito
    const favorite = await Favorite.create({
      userId,
      profileId,
    });

    // Incrementar contador de favoritos en el perfil
    await Profile.findByIdAndUpdate(profileId, {
      $inc: { 'stats.favorites': 1 },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Agregado a favoritos',
        favorite,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error al agregar favorito:', error);
    return NextResponse.json(
      { error: 'Error al agregar favorito' },
      { status: 500 }
    );
  }
}

// DELETE - Quitar de favoritos
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();

    const userId = await getUserFromRequest(request);
    if (!userId) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get('profileId');

    if (!profileId) {
      return NextResponse.json(
        { error: 'ID de perfil requerido' },
        { status: 400 }
      );
    }

    // Buscar y eliminar favorito
    const favorite = await Favorite.findOneAndDelete({
      userId,
      profileId,
    });

    if (!favorite) {
      return NextResponse.json(
        { error: 'No está en favoritos' },
        { status: 404 }
      );
    }

    // Decrementar contador de favoritos en el perfil
    await Profile.findByIdAndUpdate(profileId, {
      $inc: { 'stats.favorites': -1 },
    });

    return NextResponse.json({
      success: true,
      message: 'Eliminado de favoritos',
    });
  } catch (error) {
    console.error('Error al eliminar favorito:', error);
    return NextResponse.json(
      { error: 'Error al eliminar favorito' },
      { status: 500 }
    );
  }
}
