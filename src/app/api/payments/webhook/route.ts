import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Payment } from '@/models/Payment';
import { Subscription } from '@/models/Subscription';
import { Profile } from '@/models/Profile';
import { User } from '@/models/User';
import { Referral } from '@/models/Referral';
import { MercadoPagoConfig, Payment as MPPayment } from 'mercadopago';
import { createNotification } from '@/lib/shared/notifications';
import crypto from 'crypto';

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '',
});

// =============================================
// Verificar firma del webhook de MercadoPago
// https://www.mercadopago.com.ar/developers/es/docs/your-integrations/notifications/webhooks
// =============================================
function verifyWebhookSignature(req: NextRequest, rawBody: string): boolean {
  const webhookSecret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  // Si no está configurado el secret, solo en dev permitimos pasar
  if (!webhookSecret) {
    if (process.env.NODE_ENV === 'production') {
      console.error('[Webhook] MERCADOPAGO_WEBHOOK_SECRET no configurado en producción');
      return false;
    }
    return true;
  }

  const xSignature = req.headers.get('x-signature');
  const xRequestId = req.headers.get('x-request-id');
  const dataId = new URL(req.url).searchParams.get('data.id') ||
                 req.headers.get('x-request-id');

  if (!xSignature) return false;

  // Formato: ts=<timestamp>,v1=<hash>
  const parts = Object.fromEntries(
    xSignature.split(',').map((p) => p.split('=') as [string, string])
  );
  const ts = parts['ts'];
  const receivedHash = parts['v1'];

  if (!ts || !receivedHash) return false;

  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
  const expectedHash = crypto
    .createHmac('sha256', webhookSecret)
    .update(manifest)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(receivedHash, 'hex'),
    Buffer.from(expectedHash, 'hex')
  );
}

// =============================================
// POST - Webhook de MercadoPago
// =============================================
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();

    // Verificar firma del webhook
    if (!verifyWebhookSignature(req, rawBody)) {
      console.warn('[Webhook] Firma inválida — solicitud rechazada');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = JSON.parse(rawBody);

    // MercadoPago envía diferentes tipos de notificaciones
    if (body.type !== 'payment') {
      return NextResponse.json({ received: true }, { status: 200 });
    }

    await connectDB();

    // Obtener detalles del pago desde MercadoPago
    const mpPayment = new MPPayment(client);
    const paymentInfo = await mpPayment.get({ id: body.data.id });

    if (!paymentInfo || !paymentInfo.external_reference) {
      return NextResponse.json({ received: true }, { status: 200 });
    }

    // Parsear la referencia externa
    let refData: { paymentId: string; userId: string; profileId: string; plan: string };
    try {
      refData = JSON.parse(paymentInfo.external_reference);
    } catch {
      return NextResponse.json({ error: 'Invalid reference' }, { status: 400 });
    }

    // Buscar el pago en nuestra DB
    const payment = await Payment.findById(refData.paymentId);
    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    // Actualizar estado del pago según MercadoPago
    if (paymentInfo.status === 'approved') {
      payment.status = 'completed';
      payment.paidAt = new Date();
      payment.externalId = body.data.id.toString();
      payment.externalProvider = 'mercadopago';
      await payment.save();

      // Crear suscripción
      const plans: Record<string, { days: number }> = {
        premium: { days: 30 },
        vip: { days: 30 },
      };

      const planConfig = plans[refData.plan] || { days: 30 };
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + planConfig.days);

      const subscription = new Subscription({
        userId: refData.userId,
        profileId: refData.profileId,
        plan: refData.plan,
        status: 'active',
        priceAmount: payment.amount,
        currency: 'MXN',
        startDate,
        endDate,
        nextBillingDate: endDate,
        autoRenew: false,
      });

      await subscription.save();

      // Actualizar pago con suscripción
      payment.subscriptionId = subscription._id;
      await payment.save();

      // Actualizar perfil
      await Profile.findByIdAndUpdate(refData.profileId, {
        isPremium: refData.plan !== 'free',
        isFeatured: refData.plan === 'vip',
      });

      // Notificar al usuario
      try {
        await createNotification({
          userId: refData.userId,
          type: 'payment',
          title: '¡Pago confirmado!',
          message: `Tu suscripción ${refData.plan.toUpperCase()} está activa por 30 días.`,
          link: '/dashboard',
        });
      } catch (e) {
        console.error('Error al notificar pago:', e);
      }

      // ================================================
      // Programa de referidos: acreditar $100 al referidor
      // ================================================
      try {
        const payingUser = await User.findById(refData.userId).select('referredBy').lean() as { referredBy?: unknown } | null;
        if (payingUser?.referredBy) {
          // Buscar el referral pendiente (solo se premia UNA vez por usuario)
          const referral = await Referral.findOneAndUpdate(
            {
              referrerId: payingUser.referredBy,
              referredUserId: refData.userId,
              status: 'pending',
            },
            {
              status: 'rewarded',
              rewardedAt: new Date(),
            },
            { new: true }
          );

          if (referral) {
            // Sumar crédito al referidor
            await User.findByIdAndUpdate(payingUser.referredBy, {
              $inc: { referralCredit: referral.rewardAmount },
            });

            // Notificar al referidor
            await createNotification({
              userId: payingUser.referredBy.toString(),
              type: 'subscription',
              title: '¡Ganaste $100 de crédito!',
              message: `Una persona que referiste acaba de activar su plan. Tienes $${referral.rewardAmount} MXN de crédito para tu próxima renovación.`,
              link: '/dashboard/referidos',
            });
          }
        }
      } catch (e) {
        console.error('Error al procesar referido:', e);
        // No bloqueamos el flujo principal
      }
    } else if (paymentInfo.status === 'rejected') {
      payment.status = 'failed';
      payment.externalId = body.data.id.toString();
      await payment.save();
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('Error en webhook de MercadoPago:', error);
    return NextResponse.json({ received: true }, { status: 200 });
  }
}
