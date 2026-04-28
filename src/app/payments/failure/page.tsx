'use client';

import Link from 'next/link';
import { XCircle } from 'lucide-react';

export default function PaymentFailurePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-50">
      <div className="card-elevated max-w-md mx-auto text-center p-10">
        <div className="bg-red-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-12 h-12 text-red-600" />
        </div>
        <h1 className="text-3xl font-bold text-dark-900 mb-3">
          Pago no procesado
        </h1>
        <p className="text-dark-600 mb-8">
          Hubo un problema con tu pago. No se realizó ningún cargo. Puedes intentar nuevamente.
        </p>
        <div className="space-y-3">
          <Link
            href="/dashboard/planes"
            className="btn-primary w-full block text-center"
          >
            Intentar de nuevo
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
