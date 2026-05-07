import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Coupon } from '@/models/Coupon';
import { Subscription } from '@/models/Subscription';
import { Profile } from '@/models/Profile';
import { getUserFromRequest } from '@/lib/auth';
import { createNotification } from '@/lib/shared/notifications';

// =============================================
// POST - Validar cupón (sin aplicar)
// =============================================
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const userId = await getUserFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { code, action, profileId } = await req.json();

    if (!code) {
      return NextResponse.json({ error: 'Código requerido' }, { status: 400 });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase().trim() });

    if (!coupon || !coupon.isActive) {
      return NextResponse.json({ error: 'Cupón inválido o expirado' }, { status: 404 });
    }

    if (coupon.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Este cupón ha expirado' }, { status: 400 });
    }

    if (coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json({ error: 'Este cupón ya no tiene usos disponibles' }, { status: 400 });
    }

    // Verificar si el usuario ya usó este cupón
    if (coupon.usedBy.some((id: any) => id.toString() === userId.toString())) {
      return NextResponse.json({ error: 'Ya utilizaste este cupón' }, { status: 409 });
    }

    // Si solo valida (sin aplicar), devolver info del cupón
    if (action !== 'apply') {
      return NextResponse.json({
        valid: true,
        plan: coupon.plan,
        months: coupon.months,
        description: coupon.description,
        usesLeft: coupon.maxUses - coupon.usedCount,
      });
    }

    // === APLICAR CUPÓN ===
    if (!profileId) {
      return NextResponse.json({ error: 'Perfil requerido para aplicar el cupón' }, { status: 400 });
    }

    const profile = await Profile.findOne({ _id: profileId, userId });
    if (!profile) {
      return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 });
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + coupon.months);

    const subscription = new Subscription({
      userId,
      profileId,
      plan: coupon.plan,
      status: 'active',
      priceAmount: 0,
      currency: 'MXN',
      startDate,
      endDate,
      nextBillingDate: endDate,
      autoRenew: false,
      metadata: { couponCode: coupon.code },
    });

    await subscription.save();

    // Actualizar perfil
    await Profile.findByIdAndUpdate(profileId, {
      isPremium: true,
      isFeatured: coupon.plan === 'vip',
    });

    // Marcar cupón como usado
    coupon.usedCount += 1;
    coupon.usedBy.push(userId as any);
    await coupon.save();

    // Notificar al usuario
    try {
      await createNotification({
        userId: userId.toString(),
        type: 'payment',
        title: '¡Cupón activado!',
        message: `Tu suscripción ${coupon.plan.toUpperCase()} por ${coupon.months} meses está activa. ¡Bienvenido a PlacerLux!`,
        link: '/dashboard',
      });
    } catch {}

    return NextResponse.json({
      success: true,
      message: `¡Cupón aplicado! Tienes ${coupon.months} meses de ${coupon.plan.toUpperCase()} activos.`,
      subscription,
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error en cupón:', error);
    return NextResponse.json({ error: 'Error al procesar el cupón' }, { status: 500 });
  }
}
