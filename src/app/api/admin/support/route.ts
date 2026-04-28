import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { SupportTicket } from '@/models/SupportTicket';
import { User } from '@/models/User';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const userId = await getUserFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

    const user = await User.findById(userId).select('role');
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const query: any = {};
    if (status) query.status = status;

    const tickets = await SupportTicket.find(query)
      .sort({ plan: -1, createdAt: -1 }) // VIP primero
      .limit(100);

    return NextResponse.json({ tickets });
  } catch (error) {
    console.error('Error al obtener tickets:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
