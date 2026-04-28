import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Favorite } from '@/models/Favorite';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { profileId: string } }
) {
  try {
    await connectDB();

    const userId = await getUserFromRequest(request);
    if (!userId) {
      return NextResponse.json(
        { isFavorite: false },
        { status: 200 }
      );
    }

    const { profileId } = params;

    // Verificar si existe el favorito
    const favorite = await Favorite.findOne({
      userId,
      profileId,
    });

    return NextResponse.json({
      isFavorite: !!favorite,
    });
  } catch (error) {
    console.error('Error al verificar favorito:', error);
    return NextResponse.json(
      { isFavorite: false },
      { status: 200 }
    );
  }
}
