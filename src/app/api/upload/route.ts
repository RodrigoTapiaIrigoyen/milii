import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { Profile } from '@/models/Profile';
import { Subscription } from '@/models/Subscription';
import { uploadImage, deleteImage, extractPublicId } from '@/lib/cloudinary';

// Límite de fotos según el plan
const PHOTO_LIMITS: Record<string, number> = {
  free: 3,
  premium: 10,
  vip: Infinity,
};

// =============================================
// POST - Subir imagen
// =============================================
export async function POST(req: NextRequest) {
  try {
    const userId = await getUserFromRequest(req);
    if (!userId) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    await connectDB();

    // Obtener plan activo del usuario
    const subscription = await Subscription.findOne({
      userId,
      status: 'active',
    }).sort({ createdAt: -1 });
    const plan = subscription?.plan || 'free';
    const photoLimit = PHOTO_LIMITS[plan];

    // Verificar cuántas fotos tiene ya el perfil
    const profile = await Profile.findOne({ userId }).select('photos');
    if (profile && profile.photos.length >= photoLimit) {
      const upgradeMsg =
        plan === 'free'
          ? 'El plan Free permite máximo 3 fotos. Actualiza a Premium para subir hasta 10.'
          : 'El plan Premium permite máximo 10 fotos. Actualiza a VIP para fotos ilimitadas.';
      return NextResponse.json(
        { error: upgradeMsg, photoLimit, currentCount: profile.photos.length },
        { status: 403 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No se envió ningún archivo' },
        { status: 400 }
      );
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Tipo de archivo no permitido. Solo se permiten imágenes (JPG, PNG, WEBP)' },
        { status: 400 }
      );
    }

    // Validar tamaño (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'El archivo es muy grande. Tamaño máximo: 5MB' },
        { status: 400 }
      );
    }

    // Generar nombre único
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const timestamp = Date.now();
    const extension = file.type.split('/')[1];
    const filename = `${userId}-${timestamp}`;

    // Subir a Cloudinary
    const { url } = await uploadImage(buffer, filename);

    return NextResponse.json(
      {
        message: 'Imagen subida exitosamente',
        url,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error al subir imagen:', error);
    return NextResponse.json(
      { error: 'Error al subir imagen' },
      { status: 500 }
    );
  }
}

// =============================================
// DELETE - Eliminar imagen
// =============================================
export async function DELETE(req: NextRequest) {
  try {
    const userId = await getUserFromRequest(req);
    if (!userId) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const url = searchParams.get('url');

    if (!url) {
      return NextResponse.json(
        { error: 'URL de imagen requerida' },
        { status: 400 }
      );
    }

    // Extraer nombre de archivo / public_id de Cloudinary
    const publicId = extractPublicId(url);

    // Verificar que la imagen pertenece al usuario (el public_id contiene el userId)
    if (!publicId || !publicId.includes(userId)) {
      return NextResponse.json(
        { error: 'No tienes permiso para eliminar esta imagen' },
        { status: 403 }
      );
    }

    // Eliminar de Cloudinary
    await deleteImage(publicId);

    return NextResponse.json(
      { message: 'Imagen eliminada exitosamente' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error al eliminar imagen:', error);
    return NextResponse.json(
      { error: 'Error al eliminar imagen' },
      { status: 500 }
    );
  }
}
