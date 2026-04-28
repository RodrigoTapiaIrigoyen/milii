'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Loader2 } from 'lucide-react';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    // Dar tiempo al webhook para procesar
    const timer = setTimeout(() => {
      setVerifying(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-brand-500 mx-auto mb-4" />
          <p className="text-dark-600 text-lg">Verificando tu pago...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-50">
      <div className="card-elevated max-w-md mx-auto text-center p-10">
        <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-dark-900 mb-3">
          ¡Pago exitoso!
        </h1>
        <p className="text-dark-600 mb-8">
          Tu suscripción ha sido activada. Ya puedes publicar tu perfil y aparecer en el directorio.
        </p>
        <div className="space-y-3">
          <Link
            href="/dashboard/perfil"
            className="btn-primary w-full block text-center"
          >
            Ir a mi perfil
          </Link>
          <Link
            href="/dashboard"
            className="text-brand-500 hover:text-brand-600 font-medium block"
          >
            Ir al Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
