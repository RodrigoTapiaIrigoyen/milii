'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Search, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-dark-900 flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Fondo decorativo */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-brand-500/5 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-luxury-500/5 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #d4af37 1px, transparent 1px), linear-gradient(to bottom, #d4af37 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div
        className="relative z-10 text-center max-w-lg transition-all duration-700"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(24px)',
        }}
      >
        {/* Número 404 con gradiente dorado */}
        <div className="mb-6 select-none">
          <span
            className="text-[120px] sm:text-[160px] font-black leading-none tracking-tighter"
            style={{
              background: 'linear-gradient(135deg, #c9a227 0%, #f0d060 50%, #c9a227 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            404
          </span>
        </div>

        {/* Logo */}
        <div className="mb-4">
          <span className="text-2xl font-bold text-white">
            Placer<span style={{ color: '#d4af37' }}>Lux</span>
          </span>
        </div>

        {/* Mensaje */}
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3">
          Página no encontrada
        </h1>
        <p className="text-dark-400 text-base leading-relaxed mb-10">
          El perfil o página que buscas ya no existe, fue movido,<br className="hidden sm:block" />
          o la URL tiene un error tipográfico.
        </p>

        {/* Acciones */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-dark-900 transition"
            style={{
              background: 'linear-gradient(135deg, #c9a227, #e8c84a)',
              boxShadow: '0 4px 20px rgba(212,175,55,0.3)',
            }}
          >
            <Home className="w-5 h-5" />
            Ir al inicio
          </Link>
          <Link
            href="/perfiles"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white border border-dark-600 hover:border-dark-400 transition bg-dark-800 hover:bg-dark-700"
          >
            <Search className="w-5 h-5" />
            Explorar perfiles
          </Link>
        </div>

        {/* Volver */}
        <button
          onClick={() => window.history.back()}
          className="mt-8 inline-flex items-center gap-2 text-dark-500 hover:text-dark-300 text-sm transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a la página anterior
        </button>
      </div>
    </div>
  );
}
