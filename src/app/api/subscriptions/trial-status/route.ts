import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Subscription } from '@/models/Subscription';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const userId = await getUserFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const previousTrial = await Subscription.findOne({ userId, plan: 'free' });

    return NextResponse.json({ trialUsed: !!previousTrial }, { status: 200 });
  } catch (error) {
    console.error('Error en GET /subscriptions/trial-status:', error);
    return NextResponse.json({ error: 'Error al verificar trial' }, { status: 500 });
  }
}
