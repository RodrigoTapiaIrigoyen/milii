import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { SupportTicket } from '@/models/SupportTicket';
import { User } from '@/models/User';
import { getUserFromRequest } from '@/lib/auth';
import { createNotification } from '@/lib/shared/notifications';

async function getAdminUser(req: NextRequest) {
  const userId = await getUserFromRequest(req);
  if (!userId) return null;
  const user = await User.findById(userId).select('role');
  if (!user || user.role !== 'admin') return null;
  return user;
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    if (!(await getAdminUser(req))) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }
    const ticket = await SupportTicket.findById(params.id);
    if (!ticket) return NextResponse.json({ error: 'Ticket no encontrado' }, { status: 404 });
    return NextResponse.json({ ticket });
  } catch (error) {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    if (!(await getAdminUser(req))) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const { status, adminNotes, reply } = await req.json();

    const ticket = await SupportTicket.findById(params.id);
    if (!ticket) return NextResponse.json({ error: 'Ticket no encontrado' }, { status: 404 });

    // Aplicar cambios de estado y notas
    if (status) {
      ticket.status = status;
      if (status === 'resolved') ticket.resolvedAt = new Date();
    }
    if (adminNotes !== undefined) ticket.adminNotes = adminNotes;

    // Agregar respuesta del admin
    if (reply?.trim()) {
      ticket.replies.push({ from: 'admin', message: reply.trim(), createdAt: new Date() });

      // Notificar al usuario
      await createNotification({
        userId: ticket.userId.toString(),
        type: 'general',
        title: '💬 Respuesta de soporte recibida',
        message: reply.trim().length > 120 ? reply.trim().substring(0, 120) + '…' : reply.trim(),
        link: '/dashboard/soporte',
        metadata: { ticketId: ticket._id.toString() },
      });
    }

    await ticket.save();
    return NextResponse.json({ ticket });
  } catch (error) {
    console.error('Error al actualizar ticket:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
