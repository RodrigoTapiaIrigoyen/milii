import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Profile } from '@/models/Profile';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Obtener parámetros de búsqueda y filtros
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const state = searchParams.get('state') || '';
    const city = searchParams.get('city') || '';
    const service = searchParams.get('service') || '';
    const gender = searchParams.get('gender') || '';
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const minAge = searchParams.get('minAge');
    const maxAge = searchParams.get('maxAge');
    const verified = searchParams.get('verified');
    const sortBy = searchParams.get('sortBy') || 'popular'; // popular, recent, priceAsc, priceDesc
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Construir query base
    const query: any = { 
      isPublished: true,
      'status.isActive': true,
      'status.isSuspended': { $ne: true }
    };

    // Búsqueda por texto (nombre o descripción)
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Filtro por ubicación
    if (state) {
      query['location.state'] = state;
    }
    if (city) {
      query['location.city'] = { $regex: city, $options: 'i' };
    }

    // Filtro por servicio
    if (service) {
      query.services = service;
    }

    // Filtro por género
    if (gender) {
      query.gender = gender;
    }

    // Filtro por edad
    if (minAge) {
      query.age = { ...query.age, $gte: parseInt(minAge) };
    }
    if (maxAge) {
      query.age = { ...query.age, $lte: parseInt(maxAge) };
    }

    // Filtro por precio
    if (minPrice || maxPrice) {
      const priceQuery: any = {};
      if (minPrice) priceQuery.$gte = parseInt(minPrice);
      if (maxPrice) priceQuery.$lte = parseInt(maxPrice);
      
      query.$or = [
        { 'pricing.hourlyRate': priceQuery },
        { 'pricing.serviceRate': priceQuery }
      ];
    }

    // Filtro verificados
    if (verified === 'true') {
      query['verification.isVerified'] = true;
    }

    // Determinar ordenamiento
    let sort: any = {};
    switch (sortBy) {
      case 'recent':
        sort = { createdAt: -1 };
        break;
      case 'priceAsc':
        sort = { 'pricing.hourlyRate': 1 };
        break;
      case 'priceDesc':
        sort = { 'pricing.hourlyRate': -1 };
        break;
      case 'popular':
      default:
        sort = { isFeatured: -1, isPremium: -1, 'stats.views': -1, createdAt: -1 };
    }

    // Calcular skip para paginación
    const skip = (page - 1) * limit;

    // Ejecutar query con paginación
    const [profiles, total] = await Promise.all([
      Profile.find(query)
        .select('-userId')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Profile.countDocuments(query)
    ]);

    return NextResponse.json({
      success: true,
      profiles,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error al obtener perfiles públicos:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener perfiles' },
      { status: 500 }
    );
  }
}
