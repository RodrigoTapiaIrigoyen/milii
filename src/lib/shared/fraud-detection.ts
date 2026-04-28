import { Profile } from '@/models/Profile';

// Palabras clave asociadas a estafas / extorsión frecuentes
const SCAM_KEYWORDS = [
  'pago adelantado',
  'anticipo obligatorio',
  'transferencia primero',
  'comprobante primero',
  'manda dinero',
  'envia dinero',
  'envía dinero',
  'depósito previo',
  'depósito antes',
  'bitcoin',
  'criptomoneda',
  'usdt',
  'western union',
  'moneygram',
  'no reembolso',
  'sin reembolso',
  'no devoluciones',
  'seña obligatoria',
  'garantía de pago',
];

// Patrones sospechosos en números de contacto
const SUSPICIOUS_PHONE_PATTERNS = [
  /^(\d)\1{8,}$/,          // Número repetido ej: 5555555555
  /^(123456789|987654321)/, // Secuencias obvias
];

/**
 * Ejecuta todos los chequeos antifraude sobre un perfil y devuelve las flags detectadas.
 */
export async function runFraudChecks(
  profile: any,
  submissionIp: string
): Promise<string[]> {
  const flags: string[] = [];

  // 1. Detectar palabras clave de estafa en la descripción
  if (profile.description) {
    const descLower = profile.description.toLowerCase();
    const found = SCAM_KEYWORDS.filter((kw) => descLower.includes(kw));
    if (found.length > 0) {
      flags.push(`DESCRIPCION_SOSPECHOSA: "${found.join('", "')}"`);
    }
  }

  // 2. Detectar número de WhatsApp duplicado (mismo número en otro perfil)
  if (profile.whatsapp) {
    const cleanPhone = profile.whatsapp.replace(/\D/g, '');
    if (cleanPhone.length >= 8) {
      const duplicate = await Profile.findOne({
        _id: { $ne: profile._id },
        whatsapp: { $regex: cleanPhone.slice(-8) },
        approvalStatus: { $in: ['approved', 'pending_review'] },
      });
      if (duplicate) {
        flags.push(`WHATSAPP_DUPLICADO: número ya usado en otro perfil`);
      }
    }
    // Patrón sospechoso en el número
    const isSuspiciousPhone = SUSPICIOUS_PHONE_PATTERNS.some((re) =>
      re.test(cleanPhone)
    );
    if (isSuspiciousPhone) {
      flags.push('WHATSAPP_PATRON_SOSPECHOSO: número con formato inválido');
    }
  }

  // 3. Detectar Telegram duplicado
  if (profile.telegram) {
    const telegramClean = profile.telegram.replace(/^@/, '').toLowerCase();
    const duplicate = await Profile.findOne({
      _id: { $ne: profile._id },
      telegram: { $regex: new RegExp(telegramClean, 'i') },
      approvalStatus: { $in: ['approved', 'pending_review'] },
    });
    if (duplicate) {
      flags.push('TELEGRAM_DUPLICADO: usuario de Telegram ya registrado en otro perfil');
    }
  }

  // 4. Detectar múltiples envíos desde la misma IP (posible granja de perfiles)
  if (submissionIp && submissionIp !== 'unknown') {
    const sameIpCount = await Profile.countDocuments({
      submissionIp,
      _id: { $ne: profile._id },
      approvalStatus: { $in: ['approved', 'pending_review', 'rejected'] },
    });
    if (sameIpCount >= 3) {
      flags.push(
        `IP_MULTIPLES_PERFILES: ${sameIpCount} perfiles enviados desde la misma IP`
      );
    }
  }

  // 5. Perfil sin descripción o descripción muy corta (posible bot)
  if (!profile.description || profile.description.trim().length < 20) {
    flags.push('DESCRIPCION_INCOMPLETA: descripción muy corta o ausente');
  }

  // 6. Perfil sin fotos o con una sola foto
  if (!profile.photos || profile.photos.length < 2) {
    flags.push('FOTOS_INSUFICIENTES: menos de 2 fotos en el perfil');
  }

  return flags;
}
