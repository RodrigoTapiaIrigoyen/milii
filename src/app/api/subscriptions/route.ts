import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Subscription } from '@/models/Subscription';
import { Profile } from '@/models/Profile';
import { getUserFromRequest } from '@/lib/auth';

// =============================================
// GET - Obtener mi suscripción
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

    const subscription = await Subscription.findOne({ userId }).sort({ createdAt: -1 });

    if (!subscription) {
      return NextResponse.json(
        { error: 'No tienes una suscripción' },
        { status: 404 }
      );
    }

    return NextResponse.json({ subscription }, { status: 200 });
  } catch (error) {
    console.error('Error en GET /subscriptions:', error);
    return NextResponse.json(
      { error: 'Error al obtener suscripción' },
      { status: 500 }
    );
  }
}

// =============================================
// POST - Crear suscripción
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

    const data = await req.json();
    const { profileId, plan } = data;

    // Verificar que el perfil existe y pertenece al usuario
    const profile = await Profile.findOne({ _id: profileId, userId });
    if (!profile) {
      return NextResponse.json(
        { error: 'Perfil no encontrado' },
        { status: 404 }
      );
    }

    // Definir precios por plan
    const plans = {
      free: { price: 0, days: 7 },
      premium: { price: 99, days: 30 },
      vip: { price: 199, days: 30 },
    };

    const selectedPlan = plans[plan as keyof typeof plans];
    if (!selectedPlan) {
      return NextResponse.json(
        { error: 'Plan no válido' },
        { status: 400 }
      );
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + selectedPlan.days);

    const subscription = new Subscription({
      userId,
      profileId,
      plan,
      status: 'active',
      priceAmount: selectedPlan.price,
      currency: 'MXN',
      startDate,
      endDate,
      nextBillingDate: endDate,
      autoRenew: true,
    });

    await subscription.save();

    // Actualizar perfil
    profile.isPremium = plan !== 'free';
    await profile.save();

    return NextResponse.json(
      {
        message: 'Suscripción creada exitosamente',
        subscription,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error en POST /subscriptions:', error);
    return NextResponse.json(
      { error: 'Error al crear suscripción' },
      { status: 500 }
    );
  }
}
