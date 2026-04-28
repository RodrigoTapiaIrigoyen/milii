import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import { User } from '@/models/User';
import { Profile } from '@/models/Profile';
import Payment from '@/models/Payment';
import { Subscription } from '@/models/Subscription';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const auth = await verifyAuth(req);
    if (!auth.authenticated || !auth.user || auth.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get('days') || '30');

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Usuarios nuevos por día
    const newUsersByDay = await User.aggregate([
      {
        $match: {
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

    // Perfiles nuevos por día
    const newProfilesByDay = await Profile.aggregate([
      {
        $match: {
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

    // Ingresos por día
    const revenueByDay = await Payment.aggregate([
      {
        $match: {
          status: 'approved',
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          revenue: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Crear array de todos los días
    const allDays: string[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      allDays.push(date.toISOString().split('T')[0]);
    }

    // Combinar datos
    const chartData = allDays.map((day) => {
      const usersData = newUsersByDay.find((u) => u._id === day);
      const profilesData = newProfilesByDay.find((p) => p._id === day);
      const revenueData = revenueByDay.find((r) => r._id === day);

      return {
        date: day,
        users: usersData?.count || 0,
        profiles: profilesData?.count || 0,
        revenue: revenueData?.revenue || 0,
        transactions: revenueData?.count || 0,
      };
    });

    // Totales del período
    const totalNewUsers = await User.countDocuments({
      createdAt: { $gte: startDate },
    });

    const totalNewProfiles = await Profile.countDocuments({
      createdAt: { $gte: startDate },
    });

    const totalRevenue = await Payment.aggregate([
      {
        $match: {
          status: 'approved',
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
        },
      },
    ]);

    const totalTransactions = await Payment.countDocuments({
      status: 'approved',
      createdAt: { $gte: startDate },
    });

    // Distribución por planes (suscripciones activas)
    const planDistribution = await Subscription.aggregate([
      {
        $match: {
          status: 'active',
        },
      },
      {
        $group: {
          _id: '$plan',
          count: { $sum: 1 },
        },
      },
    ]);

    // Categorías más populares de perfiles
    const categoriesDistribution = await Profile.aggregate([
      {
        $match: {
          isPublished: true,
        },
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // Totales generales
    const totalUsers = await User.countDocuments();
    const totalProfiles = await Profile.countDocuments();
    const activeSubscriptions = await Subscription.countDocuments({ status: 'active' });
    const publishedProfiles = await Profile.countDocuments({ isPublished: true });

    return NextResponse.json({
      chartData,
      summary: {
        totalNewUsers,
        totalNewProfiles,
        totalRevenue: totalRevenue[0]?.total || 0,
        totalTransactions,
        period: `${days} días`,
      },
      distributions: {
        plans: planDistribution,
        categories: categoriesDistribution,
      },
      totals: {
        users: totalUsers,
        profiles: totalProfiles,
        activeSubscriptions,
        publishedProfiles,
      },
    });
  } catch (error) {
    console.error('Error al obtener analíticas de admin:', error);
    return NextResponse.json(
      { error: 'Error al obtener analíticas' },
      { status: 500 }
    );
  }
}
