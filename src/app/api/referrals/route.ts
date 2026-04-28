import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { Referral } from '@/models/Referral';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const currentUser = await getUserFromRequest(req);
    if (!currentUser) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    await connectDB();

    const user = await User.findById(currentUser.userId)
      .select('referralCode referralCredit email')
      .lean();

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // Obtener todos los referidos de este usuario
    const referrals = await Referral.find({ referrerId: currentUser.userId })
      .populate('referredUserId', 'email createdAt')
      .sort({ createdAt: -1 })
      .lean();

    const totalReferrals = referrals.length;
    const rewardedReferrals = referrals.filter((r) => r.status === 'rewarded').length;
    const totalEarned = referrals
      .filter((r) => r.status === 'rewarded')
      .reduce((sum, r) => sum + r.rewardAmount, 0);

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const referralLink = user.referralCode
      ? `${appUrl}/register?ref=${user.referralCode}`
      : null;

    return NextResponse.json({
      referralCode: user.referralCode || null,
      referralLink,
      referralCredit: (user as any).referralCredit ?? 0,
      stats: {
        total: totalReferrals,
        rewarded: rewardedReferrals,
        pending: totalReferrals - rewardedReferrals,
        totalEarned,
      },
      referrals: referrals.map((r) => ({
        id: r._id,
        status: r.status,
        rewardAmount: r.rewardAmount,
        createdAt: r.createdAt,
        rewardedAt: r.rewardedAt,
        // Solo mostramos el email parcialmente por privacidad
        referredEmail: (r.referredUserId as any)?.email
          ? maskEmail((r.referredUserId as any).email)
          : '—',
      })),
    });
  } catch (error) {
    console.error('Error en /api/referrals:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

function maskEmail(email: string): string {
  const [user, domain] = email.split('@');
  if (!user || !domain) return '***@***';
  const visible = user.slice(0, 2);
  return `${visible}***@${domain}`;
}
