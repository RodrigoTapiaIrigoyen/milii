'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Loader2,
  MessageCircle,
  Mail,
  Clock,
  Zap,
  Crown,
  Star,
  ChevronRight,
  Send,
  CheckCircle,
} from 'lucide-react';
import NotificationBell from '@/components/shared/NotificationBell';

type Plan = 'free' | 'premium' | 'vip';

const SUPPORT_CONFIG: Record<Plan, {
  label: string;
  responseTime: string;
  responseTimeColor: string;
  icon: React.ElementType;
  iconColor: string;
  badgeClass: string;
  channels: { icon: React.ElementType; label: string; value: string; href: string; description: string }[];
  features: string[];
}> = {
  free: {
    label: 'Free',
    responseTime: '24–72 horas',
    responseTimeColor: 'text-gray-500',
    icon: Clock,
    iconColor: 'text-gray-400',
    badgeClass: 'bg-gray-100 text-gray-600',
    channels: [
      {
        icon: Mail,
        label: 'Email',
        value: 'soporte@placerlux.lat',
        href: 'mailto:soporte@placerlux.lat?subject=Soporte PlacerLux',
        description: 'Respuesta en 24–72 horas hábiles',
      },
    ],
    features: ['Soporte por email', 'Base de conocimiento', 'Preguntas frecuentes'],
  },
  premium: {
    label: 'Premium',
    responseTime: 'menos de 24 horas',
    responseTimeColor: 'text-blue-600',
    icon: Star,
    iconColor: 'text-blue-500',
    badgeClass: 'bg-blue-100 text-blue-700',
    channels: [
      {
        icon: MessageCircle,
        label: 'WhatsApp Prioritario',
        value: '+52 55 0000 0001',
        href: 'https://wa.me/5255000000001?text=Hola,%20soy%20usuario%20Premium%20y%20necesito%20soporte',
        description: 'Cola prioritaria – respuesta en menos de 24h',
      },
      {
        icon: Mail,
        label: 'Email',
        value: 'soporte@placerlux.lat',
        href: 'mailto:soporte@placerlux.lat?subject=Soporte Prioritario Premium',
        description: 'Respuesta prioritaria en menos de 24 horas',
      },
    ],
    features: ['Soporte por WhatsApp prioritario', 'Soporte por email con prioridad', 'Cola de atención adelantada'],
  },
  vip: {
    label: 'VIP',
    responseTime: 'pocas horas',
    responseTimeColor: 'text-yellow-600',
    icon: Crown,
    iconColor: 'text-yellow-500',
    badgeClass: 'bg-yellow-100 text-yellow-700',
    channels: [
      {
        icon: MessageCircle,
        label: 'WhatsApp VIP',
        value: '+52 55 0000 0002',
        href: 'https://wa.me/5255000000002?text=Hola,%20soy%20usuario%20VIP%20y%20necesito%20soporte',
        description: 'Línea exclusiva VIP – respuesta en pocas horas',
      },
      {
        icon: Mail,
        label: 'Email VIP',
        value: 'vip@placerlux.lat',
        href: 'mailto:vip@placerlux.lat?subject=Soporte VIP',
        description: 'Email exclusivo con atención máxima prioridad',
      },
    ],
    features: ['Línea VIP exclusiva de WhatsApp', 'Email VIP dedicado', 'Primera en la cola de atención'],
  },
};

export default function SoportePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<Plan>('free');
  const [messageSent, setMessageSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({ subject: '', message: '' });
  const [myTickets, setMyTickets] = useState<any[]>([]);
  const [expandedTicket, setExpandedTicket] = useState<string | null>(null);

  useEffect(() => {
    checkAccessAndLoad();
  }, []);

  const checkAccessAndLoad = async () => {
    try {
      const authRes = await fetch('/api/auth/me');
      if (!authRes.ok) { router.push('/login'); return; }
    } catch { router.push('/login'); return; }

    try {
      const subRes = await fetch('/api/subscriptions');
      if (subRes.ok) {
        const data = await subRes.json();
        if (['free', 'premium', 'vip'].includes(data.subscription?.plan)) {
          setPlan(data.subscription.plan as Plan);
        }
      }
    } catch { /* sin suscripción = free */ }

    try {
      const ticketsRes = await fetch('/api/support/my-tickets');
      if (ticketsRes.ok) {
        const data = await ticketsRes.json();
        setMyTickets(data.tickets || []);
      }
    } catch { /* ignorar */ }

    setLoading(false);
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.message.trim()) return;
    setSending(true);
    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setMessageSent(true);
      } else {
        const data = await res.json();
        alert(data.error || 'Error al enviar el mensaje');
      }
    } catch {
      alert('Error al enviar el mensaje');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-50">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      </div>
    );
  }

  const config = SUPPORT_CONFIG[plan];
  const PlanIcon = config.icon;

  return (
    <div className="min-h-screen bg-dark-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-dark-200 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-dark-700 hover:text-dark-900 transition">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-semibold">Soporte</span>
          </Link>
          <NotificationBell />
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">

        {/* Header con nivel de soporte */}
        <div className="card-elevated p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-dark-900">Centro de Soporte</h1>
              <p className="text-dark-500 mt-1 text-sm">
                Tiempo de respuesta estimado:{' '}
                <span className={`font-semibold ${config.responseTimeColor}`}>
                  {config.responseTime}
                </span>
              </p>
            </div>
            <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${config.badgeClass}`}>
              <PlanIcon className={`w-4 h-4 ${config.iconColor}`} />
              Plan {config.label}
            </span>
          </div>

          {/* Beneficios del nivel de soporte */}
          <ul className="space-y-1.5">
            {config.features.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-dark-700">
                <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                {f}
              </li>
            ))}
          </ul>

          {plan === 'free' && (
            <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-sm text-amber-800">
                💡 Con un plan Premium o VIP obtienes soporte prioritario por WhatsApp.{' '}
                <Link href="/dashboard/planes" className="font-semibold underline">
                  Ver planes →
                </Link>
              </p>
            </div>
          )}
        </div>

        {/* Canales de contacto */}
        <div>
          <p className="text-sm font-semibold text-dark-600 mb-3">Contáctanos por</p>
          <div className="space-y-3">
            {config.channels.map((ch) => {
              const ChIcon = ch.icon;
              return (
                <a
                  key={ch.label}
                  href={ch.href}
                  target={ch.href.startsWith('http') ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  className="card-elevated p-5 flex items-center justify-between hover:shadow-lg transition group"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      ch.icon === MessageCircle ? 'bg-green-100' : 'bg-blue-100'
                    }`}>
                      <ChIcon className={`w-5 h-5 ${ch.icon === MessageCircle ? 'text-green-600' : 'text-blue-600'}`} />
                    </div>
                    <div>
                      <p className="font-semibold text-dark-900">{ch.label}</p>
                      <p className="text-sm text-dark-500">{ch.description}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-dark-400 group-hover:text-brand-500 transition" />
                </a>
              );
            })}
          </div>
        </div>

        {/* Formulario de contacto */}
        <div className="card-elevated p-6">
          <div className="flex items-center gap-3 mb-5">
            <Send className="w-5 h-5 text-brand-600" />
            <h2 className="text-lg font-bold text-dark-900">Enviar mensaje</h2>
          </div>

          {messageSent ? (
            <div className="text-center py-6">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <p className="font-semibold text-dark-900 mb-1">Mensaje enviado</p>
              <p className="text-sm text-dark-500">
                Te responderemos a tu email en {config.responseTime}.
              </p>
              <button
                onClick={() => { setMessageSent(false); setForm({ subject: '', message: '' }); }}
                className="mt-4 text-sm text-brand-600 hover:underline"
              >
                Enviar otro mensaje
              </button>
            </div>
          ) : (
            <form onSubmit={handleSendEmail} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-1.5">Asunto</label>
                <input
                  type="text"
                  value={form.subject}
                  onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-dark-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition"
                  placeholder="Describe brevemente tu consulta"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-1.5">Mensaje</label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-dark-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition resize-none"
                  rows={5}
                  placeholder="Detalla tu problema o pregunta..."
                  required
                />
              </div>
              <button
                type="submit"
                disabled={sending}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {sending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Enviar mensaje
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Historial de tickets */}
        {myTickets.length > 0 && (
          <div className="card-elevated p-6">
            <h2 className="text-lg font-bold text-dark-900 mb-4">Mis consultas</h2>
            <div className="space-y-3">
              {myTickets.map((ticket: any) => (
                <div key={ticket._id} className="border border-dark-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setExpandedTicket(expandedTicket === ticket._id ? null : ticket._id)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-dark-50 transition"
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        ticket.status === 'open' ? 'bg-red-100 text-red-700'
                          : ticket.status === 'resolved' ? 'bg-green-100 text-green-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {ticket.status === 'open' ? 'Abierto' : ticket.status === 'resolved' ? 'Resuelto' : 'En proceso'}
                      </span>
                      <span className="text-sm font-medium text-dark-900">{ticket.subject}</span>
                      {(ticket.replies?.filter((r: any) => r.from === 'admin').length ?? 0) > 0 && (
                        <span className="text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full font-medium">
                          {ticket.replies.filter((r: any) => r.from === 'admin').length} respuesta(s)
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <span className="text-xs text-dark-400">
                        {new Date(ticket.createdAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
                      </span>
                      <ChevronRight className={`w-4 h-4 text-dark-400 transition-transform ${expandedTicket === ticket._id ? 'rotate-90' : ''}`} />
                    </div>
                  </button>

                  {expandedTicket === ticket._id && (
                    <div className="border-t border-dark-200 p-4 space-y-3 bg-dark-50">
                      {/* Mensaje original */}
                      <div className="bg-white rounded-xl p-4 border border-dark-200">
                        <p className="text-xs text-dark-400 mb-1">Tu mensaje</p>
                        <p className="text-sm text-dark-800 whitespace-pre-wrap leading-relaxed">{ticket.message}</p>
                      </div>
                      {/* Respuestas */}
                      {(ticket.replies || []).map((reply: any, i: number) => (
                        <div key={i} className={`rounded-xl p-4 border ${
                          reply.from === 'admin'
                            ? 'bg-brand-50 border-brand-200'
                            : 'bg-white border-dark-200'
                        }`}>
                          <p className={`text-xs mb-1 font-medium ${reply.from === 'admin' ? 'text-brand-600' : 'text-dark-400'}`}>
                            {reply.from === 'admin' ? '💬 Respuesta del equipo de soporte' : 'Tu mensaje'}
                          </p>
                          <p className="text-sm text-dark-800 whitespace-pre-wrap leading-relaxed">{reply.message}</p>
                          <p className="text-xs text-dark-400 mt-2">
                            {new Date(reply.createdAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      ))}
                      {(ticket.replies || []).filter((r: any) => r.from === 'admin').length === 0 && (
                        <p className="text-xs text-dark-400 text-center py-2">Aún sin respuesta — te notificaremos cuando contestemos.</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FAQ rápido */}
        <div className="card-elevated p-6">
          <h2 className="text-lg font-bold text-dark-900 mb-4">Preguntas frecuentes</h2>
          <div className="space-y-3">
            {[
              { q: '¿Cuánto tarda en aprobarse mi perfil?', a: plan === 'vip' ? 'Como usuario VIP tu perfil es revisado con máxima prioridad, en pocas horas.' : plan === 'premium' ? 'Con tu plan Premium tienes prioridad — generalmente en menos de 24 horas.' : 'Los perfiles Free son revisados en el orden de llegada, generalmente en 24–48 horas.' },
              { q: '¿Cómo cancelo mi suscripción?', a: 'Desde Dashboard → Suscripción puedes cancelar tu plan activo. Conservas acceso hasta la fecha de vencimiento.' },
              { q: '¿Puedo cambiar mis fotos después de aprobado?', a: 'Sí, puedes actualizar tus fotos en cualquier momento desde el editor de perfil.' },
              { q: '¿Qué pasa cuando mi plan vence?', a: 'Tu perfil se despublica automáticamente. Puedes renovar en cualquier momento desde la sección Planes.' },
            ].map(({ q, a }) => (
              <details key={q} className="group border border-dark-200 rounded-xl">
                <summary className="flex items-center justify-between p-4 cursor-pointer list-none">
                  <span className="text-sm font-medium text-dark-900">{q}</span>
                  <ChevronRight className="w-4 h-4 text-dark-400 group-open:rotate-90 transition-transform" />
                </summary>
                <p className="px-4 pb-4 text-sm text-dark-600">{a}</p>
              </details>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
