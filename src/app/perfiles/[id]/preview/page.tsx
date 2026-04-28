'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, ArrowLeft, Loader2, AlertTriangle } from 'lucide-react';
import PerfilClientPage, { ProfileData } from '../PerfilClientPage';

interface Props {
  params: { id: string };
}

export default function PreviewPerfilPage({ params }: Props) {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/profiles/${params.id}/preview`)
      .then(async (res) => {
        if (res.status === 401) {
          router.push('/login');
          return;
        }
        if (!res.ok) throw new Error('No encontrado');
        const data = await res.json();
        setProfile(data.profile);
      })
      .catch(() => setError('No pudimos cargar la vista previa.'))
      .finally(() => setLoading(false));
  }, [params.id, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-50">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-dark-50 gap-4">
        <AlertTriangle className="w-12 h-12 text-amber-500" />
        <p className="text-dark-700 font-medium">{error || 'Perfil no encontrado'}</p>
        <Link href="/dashboard/perfil" className="btn-primary">
          Volver al editor
        </Link>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Banner de modo preview */}
      <div className="sticky top-0 z-[100] bg-amber-500 text-amber-950 text-sm font-semibold px-6 py-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4" />
          <span>Vista previa — Así verán tu perfil los clientes</span>
        </div>
        <Link
          href="/dashboard/perfil"
          className="inline-flex items-center gap-1.5 bg-amber-950/10 hover:bg-amber-950/20 px-3 py-1.5 rounded-lg transition text-xs font-bold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Volver al editor
        </Link>
      </div>

      {/* El perfil real, sin tracking (no se registran vistas en preview) */}
      <PerfilClientPage initialProfile={profile} isPreview />
    </div>
  );
}
