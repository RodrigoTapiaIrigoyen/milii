import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { SupportTicket } from '@/models/SupportTicket';
import { Subscription } from '@/models/Subscription';
import { User } from '@/models/User';
import { getUserFromRequest } from '@/lib/auth';
import { createNotification } from '@/lib/shared/notifications';

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const userId = await getUserFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const user = await User.findById(userId).select('email');
    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    const { subject, message } = await req.json();
    if (!subject?.trim() || !message?.trim()) {
      return NextResponse.json({ error: 'Asunto y mensaje son requeridos' }, { status: 400 });
    }

    // Obtener plan activo
    const subscription = await Subscription.findOne({
      userId,
      status: 'active',
    }).sort({ createdAt: -1 });
    const plan = subscription?.plan || 'free';

    // Crear ticket
    const ticket = await SupportTicket.create({
      userId,
      userEmail: user.email,
      plan,
      subject: subject.trim(),
      message: message.trim(),
    });

    // Notificar al admin (buscar primer usuario admin)
    const admin = await User.findOne({ role: 'admin' }).select('_id');
    if (admin) {
      await createNotification({
        userId: admin._id.toString(),
        type: 'general',
        title: `Nuevo ticket de soporte [${plan.toUpperCase()}]`,
        message: `${user.email}: ${subject.trim()}`,
        link: '/admin?tab=support',
        metadata: { ticketId: ticket._id.toString(), plan },
      });
    }

    // Confirmar al usuario
    await createNotification({
      userId: userId.toString(),
      type: 'general',
      title: 'Ticket de soporte recibido',
      message: `Recibimos tu consulta "${subject.trim()}". Te responderemos pronto.`,
      link: '/dashboard/soporte',
    });

    return NextResponse.json({ ok: true, ticketId: ticket._id }, { status: 201 });
  } catch (error) {
    console.error('Error al crear ticket de soporte:', error);
    return NextResponse.json({ error: 'Error al enviar el mensaje' }, { status: 500 });
  }
}
