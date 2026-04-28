'use client';

import Link from 'next/link';
import { Clock } from 'lucide-react';

export default function PaymentPendingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-50">
      <div className="card-elevated max-w-md mx-auto text-center p-10">
        <div className="bg-yellow-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
          <Clock className="w-12 h-12 text-yellow-600" />
        </div>
        <h1 className="text-3xl font-bold text-dark-900 mb-3">
          Pago pendiente
        </h1>
        <p className="text-dark-600 mb-8">
          Tu pago está siendo procesado. Si pagaste en OXXO o transferencia, puede tardar unas horas.
          Te notificaremos cuando se confirme.
        </p>
        <div className="space-y-3">
          <Link
            href="/dashboard"
            className="btn-primary w-full block text-center"
          >
            Ir al Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
