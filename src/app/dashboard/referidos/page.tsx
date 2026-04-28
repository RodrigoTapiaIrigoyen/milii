'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Share2,
  Copy,
  CheckCheck,
  Gift,
  Users,
  Clock,
  Coins,
  Loader2,
  ChevronRight,
} from 'lucide-react';

interface ReferralStats {
  total: number;
  rewarded: number;
  pending: number;
  totalEarned: number;
}

interface ReferralItem {
  id: string;
  status: 'pending' | 'rewarded' | 'expired';
  rewardAmount: number;
  createdAt: string;
  rewardedAt?: string;
  referredEmail: string;
}

interface ReferralData {
  referralCode: string | null;
  referralLink: string | null;
  referralCredit: number;
  stats: ReferralStats;
  referrals: ReferralItem[];
}

export default function ReferidosPage() {
  const router = useRouter();
  const [data, setData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/referrals');
      if (res.status === 401) {
        router.push('/login');
        return;
      }
      if (!res.ok) throw new Error();
      const json = await res.json();
      setData(json);
    } catch {
      // silencioso
    } finally {
      setLoading(false);
    }
  };

  const copyLink = async () => {
    if (!data?.referralLink) return;
    try {
      await navigator.clipboard.writeText(data.referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback for older browsers
      const el = document.createElement('textarea');
      el.value = data.referralLink;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareLink = async () => {
    if (!data?.referralLink) return;
    if (navigator.share) {
      await navigator.share({
        title: 'Únete a PlacerLux',
        text: '¡Regístrate en PlacerLux con mi código y publica tu perfil gratis!',
        url: data.referralLink,
      });
    } else {
      copyLink();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-50">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      </div>
    );
  }

  const statusLabel: Record<string, string> = {
    pending: 'Pendiente de pago',
    rewarded: 'Crédito ganado',
    expired: 'Expirado',
  };

  const statusColor: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    rewarded: 'bg-green-100 text-green-800',
    expired: 'bg-gray-100 text-gray-600',
  };

  return (
    <div className="min-h-screen bg-dark-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-dark-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-dark-600 hover:text-dark-900 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Dashboard</span>
          </Link>
          <span className="text-dark-300">/</span>
          <span className="text-dark-900 font-semibold text-sm">Programa de Referidos</span>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">

        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 mb-4">
            <Gift className="w-8 h-8 text-purple-600" />
          </div>
          <h1 className="text-3xl font-bold text-dark-900 mb-2">Invita y gana créditos</h1>
          <p className="text-dark-600 max-w-lg mx-auto">
            Por cada profesional que se registre con tu enlace y active un plan de pago,{' '}
            <strong className="text-dark-900">tú recibes $100 MXN de crédito</strong> para tu próxima
            renovación.
          </p>
        </div>

        {/* Crédito disponible */}
        {data && (data.referralCredit ?? 0) > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <Coins className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-green-700 font-medium">Crédito disponible</p>
                <p className="text-3xl font-bold text-green-800">${data.referralCredit} MXN</p>
              </div>
            </div>
            <p className="text-sm text-green-700 max-w-xs text-right hidden sm:block">
              Se aplica automáticamente en tu próxima renovación de suscripción.
            </p>
          </div>
        )}

        {/* Enlace de referido */}
        <div className="card-elevated p-6">
          <h2 className="text-lg font-bold text-dark-900 mb-4 flex items-center gap-2">
            <Share2 className="w-5 h-5 text-purple-500" />
            Tu enlace personal
          </h2>

          {data?.referralLink ? (
            <>
              <div className="flex items-center gap-3 p-4 bg-dark-50 rounded-xl border border-dark-200 mb-4">
                <code className="flex-1 text-sm text-dark-700 break-all font-mono">
                  {data.referralLink}
                </code>
                <button
                  onClick={copyLink}
                  className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition"
                >
                  {copied ? (
                    <>
                      <CheckCheck className="w-4 h-4" />
                      ¡Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copiar
                    </>
                  )}
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={shareLink}
                  className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-purple-500 text-white font-semibold hover:bg-purple-600 transition"
                >
                  <Share2 className="w-5 h-5" />
                  Compartir enlace
                </button>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(
                    `¡Hola! Únete a PlacerLux y publica tu perfil profesional. Usa mi enlace: ${data.referralLink}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-green-500 text-white font-semibold hover:bg-green-600 transition"
                >
                  {/* WhatsApp icon via SVG simple */}
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Enviar por WhatsApp
                </a>
              </div>

              <p className="mt-4 text-xs text-dark-500 text-center">
                Código: <strong className="font-mono text-dark-700">{data.referralCode}</strong>
              </p>
            </>
          ) : (
            <p className="text-dark-600 text-sm">
              Tu código de referido se genera automáticamente. Si no aparece,{' '}
              <Link href="/dashboard/configuracion" className="text-brand-500 underline">
                actualiza tu cuenta
              </Link>
              .
            </p>
          )}
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="card p-5 text-center">
            <Users className="w-7 h-7 mx-auto mb-2 text-purple-500" />
            <p className="text-2xl font-bold text-dark-900">{data?.stats.total ?? 0}</p>
            <p className="text-xs text-dark-500 mt-1">Total referidas</p>
          </div>
          <div className="card p-5 text-center">
            <Clock className="w-7 h-7 mx-auto mb-2 text-yellow-500" />
            <p className="text-2xl font-bold text-dark-900">{data?.stats.pending ?? 0}</p>
            <p className="text-xs text-dark-500 mt-1">Pendientes de pago</p>
          </div>
          <div className="card p-5 text-center">
            <CheckCheck className="w-7 h-7 mx-auto mb-2 text-green-500" />
            <p className="text-2xl font-bold text-dark-900">{data?.stats.rewarded ?? 0}</p>
            <p className="text-xs text-dark-500 mt-1">Créditos ganados</p>
          </div>
          <div className="card p-5 text-center">
            <Coins className="w-7 h-7 mx-auto mb-2 text-amber-500" />
            <p className="text-2xl font-bold text-dark-900">${data?.stats.totalEarned ?? 0}</p>
            <p className="text-xs text-dark-500 mt-1">MXN acumulados</p>
          </div>
        </div>

        {/* Cómo funciona */}
        <div className="card-elevated p-6">
          <h2 className="text-lg font-bold text-dark-900 mb-5">¿Cómo funciona?</h2>
          <ol className="space-y-4">
            {[
              {
                step: '1',
                title: 'Comparte tu enlace',
                desc: 'Envía tu enlace personal a profesionales que quieran publicar su perfil.',
              },
              {
                step: '2',
                title: 'Se registran en PlacerLux',
                desc: 'La persona se registra usando tu enlace (el código queda vinculado automáticamente).',
              },
              {
                step: '3',
                title: 'Activan su primer plan de pago',
                desc: 'Cuando esa persona paga su primera suscripción Premium o VIP, tú ganas $100 MXN.',
              },
              {
                step: '4',
                title: 'Descuento en tu renovación',
                desc: 'El crédito se aplica automáticamente al renovar tu propio plan. Sin caducidad.',
              },
            ].map((item) => (
              <li key={item.step} className="flex items-start gap-4">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-bold text-sm flex items-center justify-center">
                  {item.step}
                </span>
                <div>
                  <p className="font-semibold text-dark-900 text-sm">{item.title}</p>
                  <p className="text-dark-600 text-sm">{item.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* Lista de referidos */}
        <div className="card-elevated p-6">
          <h2 className="text-lg font-bold text-dark-900 mb-5">Mis referidas</h2>

          {!data?.referrals.length ? (
            <div className="text-center py-10">
              <Users className="w-12 h-12 mx-auto mb-3 text-dark-300" />
              <p className="text-dark-500 font-medium">Aún no tienes referidas</p>
              <p className="text-dark-400 text-sm mt-1">
                Comparte tu enlace y empieza a ganar créditos.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-dark-100">
              {data.referrals.map((r) => (
                <div key={r.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-dark-100 flex items-center justify-center">
                      <Users className="w-4 h-4 text-dark-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-dark-800">{r.referredEmail}</p>
                      <p className="text-xs text-dark-500">
                        Registrada el{' '}
                        {new Date(r.createdAt).toLocaleDateString('es-MX', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {r.status === 'rewarded' && (
                      <span className="text-sm font-bold text-green-700">+${r.rewardAmount} MXN</span>
                    )}
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColor[r.status]}`}
                    >
                      {statusLabel[r.status]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Términos */}
        <p className="text-xs text-dark-400 text-center pb-6">
          El crédito se aplica solo cuando la persona referida activa su primera suscripción de pago (Premium o VIP). No aplica para planes gratuitos. Un mismo usuario no puede ser referido dos veces.
        </p>
      </div>
    </div>
  );
}
