import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Profile } from '@/models/Profile';
import { getUserFromRequest } from '@/lib/auth';

// =============================================
// GET - Obtener mi perfil
// =============================================
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const userId = await getUserFromRequest(req);
    if (!userId) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const profile = await Profile.findOne({ userId });

    if (!profile) {
      return NextResponse.json(
        { error: 'No tienes un perfil creado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ profile }, { status: 200 });
  } catch (error) {
    console.error('Error en GET /profiles/my-profile:', error);
    return NextResponse.json(
      { error: 'Error al obtener perfil' },
      { status: 500 }
    );
  }
}

// =============================================
// PUT - Actualizar mi perfil
// =============================================
export async function PUT(req: NextRequest) {
  try {
    await connectDB();

    const userId = await getUserFromRequest(req);
    if (!userId) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const profile = await Profile.findOne({ userId });

    if (!profile) {
      return NextResponse.json(
        { error: 'No tienes un perfil creado' },
        { status: 404 }
      );
    }

    const data = await req.json();

    // Actualizar campos permitidos
    if (data.artisticName) profile.artisticName = data.artisticName;
    if (data.age) profile.age = data.age;
    if (data.description !== undefined) profile.description = data.description;
    if (data.whatsapp !== undefined) profile.whatsapp = data.whatsapp;
    if (data.photos !== undefined) profile.photos = data.photos;

    if (data.pricing) {
      profile.pricing = {
        hourlyRate: data.pricing.hourlyRate,
        serviceRate: data.pricing.serviceRate,
        currency: data.pricing.currency || 'MXN',
      };
    }

    if (data.location) {
      profile.location = {
        country: data.location.country || 'México',
        state: data.location.state || '',
        city: data.location.city || '',
        zone: data.location.zone || '',
      };
    }

    if (data.categories) {
      profile.categories = {
        serviceType: data.categories.serviceType || [],
        gender: data.categories.gender || '',
        orientation: data.categories.orientation || '',
        availability: data.categories.availability || [],
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
    console.error('Error en PUT /profiles/my-profile:', error);
    return NextResponse.json(
      { error: 'Error al actualizar perfil' },
      { status: 500 }
    );
  }
}

// =============================================
// DELETE - Eliminar mi perfil
// =============================================
export async function DELETE(req: NextRequest) {
  try {
    await connectDB();

    const userId = await getUserFromRequest(req);
    if (!userId) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const profile = await Profile.findOne({ userId });

    if (!profile) {
      return NextResponse.json(
        { error: 'No tienes un perfil creado' },
        { status: 404 }
      );
    }

    await profile.deleteOne();

    return NextResponse.json(
      { message: 'Perfil eliminado exitosamente' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error en DELETE /profiles/my-profile:', error);
    return NextResponse.json(
      { error: 'Error al eliminar perfil' },
      { status: 500 }
    );
  }
}
