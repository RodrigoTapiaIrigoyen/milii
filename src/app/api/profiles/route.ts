import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Profile } from '@/models/Profile';
import { getUserFromRequest } from '@/lib/auth';

// =============================================
// GET - Obtener todos los perfiles (públicos)
// =============================================
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const state = searchParams.get('state');
    const service = searchParams.get('service');

    const query: any = { 
      isPublished: true,
      'status.isActive': true,
      approvalStatus: 'approved',
    };

    if (state) {
      query['location.state'] = state;
    }

    if (service) {
      query['services'] = service;
    }

    const skip = (page - 1) * limit;

    const profiles = await Profile.find(query)
      .select('-userId')
      .sort({ isFeatured: -1, isPremium: -1, 'stats.views': -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Profile.countDocuments(query);

    return NextResponse.json(
      {
        profiles,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error en GET /profiles:', error);
    return NextResponse.json(
      { error: 'Error al obtener perfiles' },
      { status: 500 }
    );
  }
}

// =============================================
// POST - Crear nuevo perfil (requiere autenticación)
// =============================================
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const userId = await getUserFromRequest(req);
    if (!userId) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    // Verificar si el usuario ya tiene un perfil
    const existingProfile = await Profile.findOne({ userId });
    if (existingProfile) {
      return NextResponse.json(
        { error: 'Ya tienes un perfil creado' },
        { status: 409 }
      );
    }

    const data = await req.json();

    const profile = new Profile({
      userId,
      name: data.name,
      age: data.age,
      gender: data.gender,
      description: data.description || '',
      whatsapp: data.whatsapp || '',
      telegram: data.telegram || '',
      photos: data.photos || [],
      services: data.services || [],
      pricing: {
        hourlyRate: data.pricing?.hourlyRate,
        serviceRate: data.pricing?.serviceRate,
        currency: data.pricing?.currency || 'MXN',
      },
      location: {
        country: data.location?.country || 'México',
        state: data.location?.state || '',
        city: data.location?.city || '',
        zone: data.location?.zone || '',
      },
      verification: {
        isVerified: false,
        verifiedAt: null,
        documents: [],
      },
      status: {
        isActive: true,
        isSuspended: false,
        suspensionReason: '',
      },
      isPublished: false,
      stats: {
        views: 0,
        whatsappClicks: 0,
        favorites: 0,
      },
    });

    await profile.save();

    return NextResponse.json(
      {
        message: 'Perfil creado exitosamente',
        profile,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error en POST /profiles:', error);
    return NextResponse.json(
      { error: 'Error al crear perfil' },
      { status: 500 }
    );
  }
}
