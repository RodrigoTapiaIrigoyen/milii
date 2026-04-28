import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import { Profile } from '@/models/Profile';
import ProfileView from '@/models/ProfileView';
import ProfileClick from '@/models/ProfileClick';
import { Favorite } from '@/models/Favorite';
import { Subscription } from '@/models/Subscription';

// Historial máximo de días por plan
const MAX_DAYS: Record<string, number> = { free: 7, premium: 30, vip: 90 };

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const auth = await verifyAuth(req);
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const requestedDays = parseInt(searchParams.get('days') || '30');

    // Obtener plan activo para aplicar límite de historial
    const subscription = await Subscription.findOne({
      userId: auth.user.id,
      status: 'active',
    }).sort({ createdAt: -1 });
    const plan = subscription?.plan || 'free';
    const maxDays = MAX_DAYS[plan];
    // Si el usuario pide más días de los que su plan permite, se recorta
    const days = Math.min(requestedDays, maxDays);

    // Obtener perfil del usuario
    const profile = await Profile.findOne({ userId: auth.user.id });
    if (!profile) {
      return NextResponse.json(
        { error: 'Perfil no encontrado' },
        { status: 404 }
      );
    }

    // Fecha de inicio para el análisis
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Obtener vistas por día
    const viewsByDay = await ProfileView.aggregate([
      {
        $match: {
          profileId: profile._id,
          viewedAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$viewedAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Obtener clics por día
    const clicksByDay = await ProfileClick.aggregate([
      {
        $match: {
          profileId: profile._id,
          clickedAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$clickedAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Obtener favoritos por día
    const favoritesByDay = await Favorite.aggregate([
      {
        $match: {
          profileId: profile._id,
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Crear array de todos los días del rango
    const allDays: string[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      allDays.push(date.toISOString().split('T')[0]);
    }

    // Combinar datos con todos los días (rellenar con 0 los días sin datos)
    const chartData = allDays.map((day) => {
      const viewsData = viewsByDay.find((v) => v._id === day);
      const clicksData = clicksByDay.find((c) => c._id === day);
      const favoritesData = favoritesByDay.find((f) => f._id === day);

      return {
        date: day,
        views: viewsData?.count || 0,
        clicks: clicksData?.count || 0,
        favorites: favoritesData?.count || 0,
      };
    });

    // Estadísticas resumidas
    const totalViews = await ProfileView.countDocuments({
      profileId: profile._id,
      viewedAt: { $gte: startDate },
    });

    const totalClicks = await ProfileClick.countDocuments({
      profileId: profile._id,
      clickedAt: { $gte: startDate },
    });

    const totalFavorites = await Favorite.countDocuments({
      profileId: profile._id,
      createdAt: { $gte: startDate },
    });

    // Tasa de conversión (clics / vistas)
    const conversionRate = totalViews > 0 
      ? ((totalClicks / totalViews) * 100).toFixed(2)
      : '0.00';

    // Vistas únicas (por IP)
    const uniqueViews = await ProfileView.distinct('ipAddress', {
      profileId: profile._id,
      viewedAt: { $gte: startDate },
    }).then(ips => ips.length);

    return NextResponse.json({
      chartData,
      summary: {
        totalViews,
        totalClicks,
        totalFavorites,
        uniqueViews,
        conversionRate: parseFloat(conversionRate),
        period: `${days} días`,
      },
      profile: {
        name: profile.name,
        category: profile.category,
        isPublished: profile.isPublished,
      },
      planInfo: {
        plan,
        maxDays,
        daysUsed: days,
      },
    });
  } catch (error) {
    console.error('Error al obtener analíticas:', error);
    return NextResponse.json(
      { error: 'Error al obtener analíticas' },
      { status: 500 }
    );
  }
}
