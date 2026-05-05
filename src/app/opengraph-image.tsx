import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'PlacerLux — Perfiles Premium Verificados';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#111827',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Fondo decorativo */}
        <div
          style={{
            position: 'absolute',
            width: 600,
            height: 600,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,46,118,0.15) 0%, transparent 70%)',
            top: -100,
            right: -100,
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,46,118,0.1) 0%, transparent 70%)',
            bottom: -100,
            left: -50,
          }}
        />

        {/* Icono diamante */}
        <div style={{ display: 'flex', marginBottom: 32 }}>
          <svg width="80" height="80" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="#1f2937"/>
            <polygon points="16,4 23,12 16,28 9,12" fill="#ff2e76" opacity="0.2"/>
            <polygon points="16,7 21,13 16,25 11,13" fill="#ff2e76" opacity="0.5"/>
            <polygon points="16,11 20,14 16,22 12,14" fill="#ff2e76"/>
            <circle cx="16" cy="14" r="2.5" fill="white"/>
          </svg>
        </div>

        {/* Nombre */}
        <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: 20 }}>
          <span style={{ fontSize: 88, fontWeight: 800, color: 'white', letterSpacing: '-3px' }}>
            Placer
          </span>
          <span style={{ fontSize: 88, fontWeight: 800, color: '#ff2e76', letterSpacing: '-3px' }}>
            Lux
          </span>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 28,
            color: '#9ca3af',
            letterSpacing: '4px',
            textTransform: 'uppercase',
            marginBottom: 48,
          }}
        >
          Perfiles Premium Verificados
        </div>

        {/* URL */}
        <div
          style={{
            fontSize: 22,
            color: '#ff2e76',
            opacity: 0.8,
          }}
        >
          placerlux.lat
        </div>
      </div>
    ),
    { ...size }
  );
}
