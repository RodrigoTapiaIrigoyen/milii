import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Modelos simplificados para el seed
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  createdAt: { type: Date, default: Date.now },
});

const ProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  age: Number,
  gender: String,
  whatsapp: String,
  description: String,
  photos: [String],
  location: {
    country: String,
    state: String,
    city: String,
    zone: String,
  },
  services: [String],
  pricing: {
    hourlyRate: Number,
    serviceRate: Number,
    currency: { type: String, default: 'MXN' },
  },
  verification: {
    isVerified: { type: Boolean, default: false },
    verifiedAt: Date,
  },
  status: {
    isActive: { type: Boolean, default: true },
  },
  isPublished: { type: Boolean, default: false },
  stats: {
    views: { type: Number, default: 0 },
    whatsappClicks: { type: Number, default: 0 },
    favorites: { type: Number, default: 0 },
  },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Profile = mongoose.models.Profile || mongoose.model('Profile', ProfileSchema);

// Perfiles de ejemplo
const exampleProfiles = [
  {
    email: 'maria.spa@ejemplo.com',
    password: '$2a$10$abcdefghijklmnopqrstuvwxyz123456789', // Password hasheado (no importa para ejemplos)
    profile: {
      name: 'María González',
      age: 28,
      gender: 'Mujer',
      whatsapp: '+52 55 1234 5678',
      description: 'Terapeuta certificada con 5 años de experiencia en masajes terapéuticos y relajantes. Atención personalizada y profesional.',
      photos: [
        'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800',
        'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=800',
      ],
      location: {
        country: 'México',
        state: 'CDMX',
        city: 'Ciudad de México',
        zone: 'Polanco',
      },
      services: ['Masaje Terapéutico', 'Masaje Relajante', 'Aromaterapia'],
      pricing: {
        hourlyRate: 800,
        serviceRate: 1500,
        currency: 'MXN',
      },
    },
  },
  {
    email: 'carlos.eventos@ejemplo.com',
    password: '$2a$10$abcdefghijklmnopqrstuvwxyz123456789',
    profile: {
      name: 'Carlos Méndez',
      age: 32,
      gender: 'Hombre',
      whatsapp: '+52 55 9876 5432',
      description: 'Acompañante profesional para eventos corporativos, bodas y cenas de negocios. Impecable presentación y conversación.',
      photos: [
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800',
      ],
      location: {
        country: 'México',
        state: 'CDMX',
        city: 'Ciudad de México',
        zone: 'Santa Fe',
      },
      services: ['Eventos Corporativos', 'Bodas', 'Cenas de Negocios'],
      pricing: {
        hourlyRate: 1200,
        serviceRate: 3000,
        currency: 'MXN',
      },
    },
  },
  {
    email: 'sofia.wellness@ejemplo.com',
    password: '$2a$10$abcdefghijklmnopqrstuvwxyz123456789',
    profile: {
      name: 'Sofía Ramírez',
      age: 26,
      gender: 'Mujer',
      whatsapp: '+52 55 5555 1234',
      description: 'Especialista en masajes deportivos y rehabilitación. Ideal para atletas y personas con lesiones musculares.',
      photos: [
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800',
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800',
      ],
      location: {
        country: 'México',
        state: 'Jalisco',
        city: 'Guadalajara',
        zone: 'Providencia',
      },
      services: ['Masaje Deportivo', 'Rehabilitación', 'Quiromasaje'],
      pricing: {
        hourlyRate: 900,
        serviceRate: 1800,
        currency: 'MXN',
      },
    },
  },
  {
    email: 'ana.eventos@ejemplo.com',
    password: '$2a$10$abcdefghijklmnopqrstuvwxyz123456789',
    profile: {
      name: 'Ana Torres',
      age: 29,
      gender: 'Mujer',
      whatsapp: '+52 33 8888 9999',
      description: 'Acompañante elegante para eventos sociales, galas y celebraciones importantes. Experiencia en protocolo.',
      photos: [
        'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800',
        'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800',
      ],
      location: {
        country: 'México',
        state: 'Nuevo León',
        city: 'Monterrey',
        zone: 'San Pedro',
      },
      services: ['Eventos Sociales', 'Galas', 'Celebraciones'],
      pricing: {
        hourlyRate: 1500,
        serviceRate: 4000,
        currency: 'MXN',
      },
    },
  },
  {
    email: 'diego.spa@ejemplo.com',
    password: '$2a$10$abcdefghijklmnopqrstuvwxyz123456789',
    profile: {
      name: 'Diego Hernández',
      age: 30,
      gender: 'Hombre',
      whatsapp: '+52 81 7777 6666',
      description: 'Masajista profesional especializado en técnicas orientales. Shiatsu, Thai y reflexología.',
      photos: [
        'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800',
        'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800',
      ],
      location: {
        country: 'México',
        state: 'Quintana Roo',
        city: 'Cancún',
        zone: 'Zona Hotelera',
      },
      services: ['Masaje Shiatsu', 'Masaje Thai', 'Reflexología'],
      pricing: {
        hourlyRate: 1000,
        serviceRate: 2000,
        currency: 'MXN',
      },
    },
  },
  {
    email: 'laura.vip@ejemplo.com',
    password: '$2a$10$abcdefghijklmnopqrstuvwxyz123456789',
    profile: {
      name: 'Laura Martínez',
      age: 27,
      gender: 'Mujer',
      whatsapp: '+52 55 4444 3333',
      description: 'Acompañante VIP para viajes de negocios, conferencias internacionales y eventos exclusivos.',
      photos: [
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800',
        'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=800',
      ],
      location: {
        country: 'México',
        state: 'CDMX',
        city: 'Ciudad de México',
        zone: 'Reforma',
      },
      services: ['Viajes de Negocios', 'Conferencias', 'Eventos VIP'],
      pricing: {
        hourlyRate: 2000,
        serviceRate: 5000,
        currency: 'MXN',
      },
    },
  },
];

async function seedProfiles() {
  try {
    console.log('🌱 Iniciando seed de perfiles de ejemplo...\n');

    // Conectar a MongoDB
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI no está definida en .env.local');
    }

    console.log('📡 Conectando a MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');

    // Limpiar datos existentes (opcional)
    console.log('🧹 Verificando datos existentes...');
    const existingProfilesCount = await Profile.countDocuments();
    console.log(`   Perfiles existentes: ${existingProfilesCount}\n`);

    // Crear perfiles de ejemplo
    console.log('👤 Creando perfiles de ejemplo...\n');

    for (const data of exampleProfiles) {
      try {
        // Verificar si el usuario ya existe
        let user = await User.findOne({ email: data.email });

        if (!user) {
          // Crear usuario
          user = await User.create({
            email: data.email,
            password: data.password,
            role: 'user',
          });
          console.log(`   ✅ Usuario creado: ${data.email}`);
        } else {
          console.log(`   ℹ️  Usuario existente: ${data.email}`);
        }

        // Verificar si el perfil ya existe
        let profile = await Profile.findOne({ userId: user._id });

        if (!profile) {
          // Crear perfil
          profile = await Profile.create({
            userId: user._id,
            ...data.profile,
            verification: {
              isVerified: true,
              verifiedAt: new Date(),
            },
            status: {
              isActive: true,
            },
            isPublished: true,
            stats: {
              views: Math.floor(Math.random() * 500) + 50,
              whatsappClicks: Math.floor(Math.random() * 100) + 10,
              favorites: Math.floor(Math.random() * 50) + 5,
            },
          });
          console.log(`   ✅ Perfil creado: ${data.profile.name}`);
        } else {
          console.log(`   ℹ️  Perfil existente: ${data.profile.name}`);
        }

        console.log('');
      } catch (error: any) {
        console.error(`   ❌ Error con ${data.email}:`, error.message);
        console.log('');
      }
    }

    // Mostrar resumen
    const totalProfiles = await Profile.countDocuments();
    const publishedProfiles = await Profile.countDocuments({ isPublished: true });
    const verifiedProfiles = await Profile.countDocuments({ 'verification.isVerified': true });

    console.log('\n📊 RESUMEN:');
    console.log(`   Total de perfiles: ${totalProfiles}`);
    console.log(`   Perfiles publicados: ${publishedProfiles}`);
    console.log(`   Perfiles verificados: ${verifiedProfiles}`);
    console.log('\n✅ Seed completado exitosamente!');
    console.log('\n🌐 Ahora puedes ver estos perfiles en: http://localhost:3000\n');

    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Error en el seed:', error);
    process.exit(1);
  }
}

// Ejecutar el seed
seedProfiles();
