import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Payment } from '@/models/Payment';
import { getUserFromRequest } from '@/lib/auth';
import { MercadoPagoConfig, Preference } from 'mercadopago';

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '',
});

// =============================================
// POST - Crear preferencia de pago
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
    const { plan, profileId } = data;

    // Definir precios por plan
    const plans = {
      premium: { price: 99, title: 'Suscripción Premium PlacerLux - 1 mes' },
      vip: { price: 199, title: 'Suscripción VIP PlacerLux - 1 mes' },
    };

    const selectedPlan = plans[plan as keyof typeof plans];
    if (!selectedPlan) {
      return NextResponse.json(
        { error: 'Plan no válido' },
        { status: 400 }
      );
    }

    // Crear pago en DB
    const payment = new Payment({
      userId,
      profileId,
      subscriptionId: null,
      amount: selectedPlan.price,
      currency: 'MXN',
      method: 'mercadopago',
      status: 'pending',
      metadata: { plan },
    });

    await payment.save();

    // Crear preferencia en MercadoPago
    const preference = new Preference(client);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const isLocalhost = appUrl.includes('localhost');

    const preferenceBody: any = {
      items: [
        {
          id: payment._id.toString(),
          title: selectedPlan.title,
          quantity: 1,
          unit_price: selectedPlan.price,
          currency_id: 'MXN',
        },
      ],
      external_reference: JSON.stringify({
        paymentId: payment._id.toString(),
        userId: userId.toString(),
        profileId,
        plan,
      }),
    };

    // MercadoPago no acepta localhost en back_urls con auto_return
    if (!isLocalhost) {
      preferenceBody.back_urls = {
        success: `${appUrl}/payments/success?payment_id=${payment._id}`,
        failure: `${appUrl}/payments/failure`,
        pending: `${appUrl}/payments/pending`,
      };
      preferenceBody.auto_return = 'approved';
      preferenceBody.notification_url = `${appUrl}/api/payments/webhook`;
    }

    const preferenceData = await preference.create({ body: preferenceBody });

    return NextResponse.json(
      {
        preferenceId: preferenceData.id,
        initPoint: preferenceData.init_point,
        paymentId: payment._id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error al crear preferencia de pago:', error);
    return NextResponse.json(
      { error: 'Error al crear preferencia de pago' },
      { status: 500 }
    );
  }
}
