import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Coupon } from '@/models/Coupon';

// Endpoint de un solo uso para crear los cupones fundadores
// Protegido con secret key
export async function POST(req: NextRequest) {
  const { secret } = await req.json();

  if (secret !== process.env.ADMIN_SETUP_SECRET) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  await connectDB();

  const coupons = [
    {
      code: 'FUNDADOR',
      description: '3 meses Premium gratis — Miembros Fundadores PlacerLux',
      plan: 'premium',
      months: 3,
      maxUses: 50,
      expiresAt: new Date('2026-12-31'),
    },
    {
      code: 'FUNDADORVIP',
      description: '3 meses VIP gratis — Miembros Fundadores VIP PlacerLux',
      plan: 'vip',
      months: 3,
      maxUses: 20,
      expiresAt: new Date('2026-12-31'),
    },
  ];

  const results = [];
  for (const data of coupons) {
    const existing = await Coupon.findOne({ code: data.code });
    if (existing) {
      results.push({ code: data.code, status: 'ya existe' });
      continue;
    }
    await Coupon.create(data);
    results.push({ code: data.code, status: 'creado' });
  }

  return NextResponse.json({ results }, { status: 200 });
}
