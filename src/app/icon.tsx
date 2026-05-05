import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#111827',
          width: 32,
          height: 32,
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Diamante simplificado */}
        <svg width="22" height="26" viewBox="0 0 22 26" fill="none">
          <polygon points="11,1 20,9 11,25 2,9" fill="#ff2e76" opacity="0.25"/>
          <polygon points="11,4 18,10 11,22 4,10" fill="#ff2e76" opacity="0.6"/>
          <polygon points="11,8 16,11 11,19 6,11" fill="#ff2e76"/>
          <circle cx="11" cy="11" r="2.5" fill="white"/>
        </svg>
      </div>
    ),
    { ...size }
  );
}
