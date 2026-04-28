import { connectDB } from '../src/lib/db';
import { User } from '../src/models/User';
import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function createAdmin() {
  try {
    console.log('\n🔐 Crear Usuario Administrador\n');

    await connectDB();
    console.log('✅ Conectado a MongoDB\n');

    const email = await question('Email del administrador: ');
    const password = await question('Contraseña (mínimo 6 caracteres): ');

    if (!email || !password || password.length < 6) {
      console.error('\n❌ Email y contraseña válidos requeridos');
      process.exit(1);
    }

    // Verificar si ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.error('\n❌ Ya existe un usuario con ese email');
      process.exit(1);
    }

    // Crear admin
    const admin = new User({
      email,
      password,
      role: 'admin',
      isActive: true,
    });

    await admin.save();

    console.log('\n✅ ¡Administrador creado exitosamente!');
    console.log(`\n📧 Email: ${email}`);
    console.log('🔑 Rol: admin\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error al crear administrador:', error);
    process.exit(1);
  }
}

createAdmin();
