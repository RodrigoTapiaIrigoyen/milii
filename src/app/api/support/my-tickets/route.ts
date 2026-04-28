import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { SupportTicket } from '@/models/SupportTicket';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const userId = await getUserFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

    const tickets = await SupportTicket.find({ userId })
      .sort({ createdAt: -1 })
      .limit(20);

    return NextResponse.json({ tickets });
  } catch (error) {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
