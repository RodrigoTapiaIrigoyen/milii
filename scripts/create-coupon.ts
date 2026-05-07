/**
 * Script para crear cupones promocionales
 * Uso: npx ts-node scripts/create-coupon.ts
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const CouponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  description: String,
  plan: { type: String, enum: ['premium', 'vip'], default: 'premium' },
  months: { type: Number, default: 3 },
  maxUses: { type: Number, default: 50 },
  usedCount: { type: Number, default: 0 },
  usedBy: [{ type: mongoose.Schema.Types.ObjectId }],
  expiresAt: Date,
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const Coupon = mongoose.models.Coupon || mongoose.model('Coupon', CouponSchema);

async function main() {
  await mongoose.connect(process.env.MONGODB_URI!);
  console.log('Conectado a MongoDB');

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

  for (const couponData of coupons) {
    try {
      const existing = await Coupon.findOne({ code: couponData.code });
      if (existing) {
        console.log(`⚠️  Cupón "${couponData.code}" ya existe`);
        continue;
      }
      await Coupon.create(couponData);
      console.log(`✅ Cupón "${couponData.code}" creado — ${couponData.maxUses} usos, expira ${couponData.expiresAt.toLocaleDateString()}`);
    } catch (err) {
      console.error(`❌ Error creando "${couponData.code}":`, err);
    }
  }

  await mongoose.disconnect();
  console.log('\nListo. Comparte los códigos con tus primeros profesionales:');
  console.log('  Premium 3 meses: FUNDADOR');
  console.log('  VIP 3 meses:     FUNDADORVIP');
}

main().catch(console.error);
