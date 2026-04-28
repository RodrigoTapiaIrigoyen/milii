import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Profile } from '@/models/Profile';
import { getUserFromRequest } from '@/lib/auth';

// =============================================
// GET - Obtener perfil por ID (público)
// =============================================
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const profile = await Profile.findById(params.id).select('-userId');

    if (!profile) {
      return NextResponse.json(
        { error: 'Perfil no encontrado' },
        { status: 404 }
      );
    }

    // Solo mostrar perfiles publicados y activos
    if (!profile.isPublished || !profile.status.isActive) {
      return NextResponse.json(
        { error: 'Perfil no disponible' },
        { status: 403 }
      );
    }

    // Incrementar vistas
    profile.stats.views += 1;
    await profile.save();

    return NextResponse.json({ profile }, { status: 200 });
  } catch (error) {
    console.error('Error en GET /profiles/[id]:', error);
    return NextResponse.json(
      { error: 'Error al obtener perfil' },
      { status: 500 }
    );
  }
}

// =============================================
// PUT - Actualizar perfil (requiere ser dueño)
// =============================================
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const userId = await getUserFromRequest(req);
    if (!userId) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const profile = await Profile.findById(params.id);

    if (!profile) {
      return NextResponse.json(
        { error: 'Perfil no encontrado' },
        { status: 404 }
      );
    }

    // Verificar que el usuario sea el dueño del perfil
    if (profile.userId.toString() !== userId) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      );
    }

    const data = await req.json();

    // Actualizar campos
    if (data.name) profile.name = data.name;
    if (data.age) profile.age = data.age;
    if (data.gender) profile.gender = data.gender;
    if (data.description !== undefined) profile.description = data.description;
    if (data.whatsapp !== undefined) profile.whatsapp = data.whatsapp;
    if (data.telegram !== undefined) profile.telegram = data.telegram;
    if (data.photos) profile.photos = data.photos;
    if (data.services) profile.services = data.services;

    if (data.location) {
      profile.location = {
        country: data.location.country || profile.location.country,
        state: data.location.state || profile.location.state,
        city: data.location.city || profile.location.city,
        zone: data.location.zone || profile.location.zone,
      };
    }

    if (data.pricing) {
      profile.pricing = {
        hourlyRate: data.pricing.hourlyRate,
        serviceRate: data.pricing.serviceRate,
        currency: data.pricing.currency || 'MXN',
      };
    }

    await profile.save();

    return NextResponse.json(
      {
        message: 'Perfil actualizado exitosamente',
        profile,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error en PUT /profiles/[id]:', error);
    return NextResponse.json(
      { error: 'Error al actualizar perfil' },
      { status: 500 }
    );
  }
}

// =============================================
// DELETE - Eliminar perfil (requiere ser dueño)
// =============================================
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const userId = await getUserFromRequest(req);
    if (!userId) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const profile = await Profile.findById(params.id);

    if (!profile) {
      return NextResponse.json(
        { error: 'Perfil no encontrado' },
        { status: 404 }
      );
    }

    // Verificar que el usuario sea el dueño del perfil
    if (profile.userId.toString() !== userId) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      );
    }

    await profile.deleteOne();

    return NextResponse.json(
      { message: 'Perfil eliminado exitosamente' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error en DELETE /profiles/[id]:', error);
    return NextResponse.json(
      { error: 'Error al eliminar perfil' },
      { status: 500 }
    );
  }
}
