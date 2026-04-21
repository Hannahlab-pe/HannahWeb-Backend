/**
 * Seed: Usuarios internos de Hannah Lab
 * Crea el admin principal y los subadmins (trabajadores).
 * Contraseña por defecto: 123456
 *
 * Ejecutar con: pnpm seed:hannahlab
 */

import { Client } from 'pg';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import { resolve } from 'path';

// Cargar .env manualmente (dotenv no está expuesto como dep directa en pnpm)
const envPath = resolve(__dirname, '../../.env');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx < 0) continue;
    const key = trimmed.slice(0, idx).trim();
    const val = trimmed.slice(idx + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
}

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL no encontrado en .env');
  process.exit(1);
}

const USUARIOS: { nombre: string; email: string; rol: string; empresa: string }[] = [
  {
    nombre: 'Admin Hannah Lab',
    email: 'admin@hannahlab.com',
    rol: 'admin',
    empresa: 'Hannah Lab',
  },
  {
    nombre: 'Jair Quispe',
    email: 'jair.quispe@hannahlab.com',
    rol: 'subadmin',
    empresa: 'Hannah Lab',
  },
  {
    nombre: 'Juan Cueto',
    email: 'juan.cueto@hannahlab.com',
    rol: 'subadmin',
    empresa: 'Hannah Lab',
  },
  {
    nombre: 'Eduardo Huarcaya',
    email: 'eduardo.huarcaya@hannahlab.com',
    rol: 'subadmin',
    empresa: 'Hannah Lab',
  },
  {
    nombre: 'Owen Pinedo',
    email: 'owen.pinedo@hannahlab.com',
    rol: 'subadmin',
    empresa: 'Hannah Lab',
  },
  {
    nombre: 'Alejandro Calyzaña',
    email: 'alejandro.calyzana@hannahlab.com',
    rol: 'subadmin',
    empresa: 'Hannah Lab',
  },
];

async function main() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  console.log('✅ Conectado a la base de datos Railway');

  // Asegurarse de que el valor 'subadmin' exista en el enum de PostgreSQL
  try {
    await client.query(`ALTER TYPE usuarios_rol_enum ADD VALUE IF NOT EXISTS 'subadmin'`);
    console.log('✅ Enum usuarios_rol_enum: valor "subadmin" verificado');
  } catch (err: any) {
    // Si el enum no se llama así, ignorar — TypeORM lo maneja con synchronize
    console.log(`ℹ️  Nota al alterar enum: ${err.message}`);
  }

  const PASSWORD_HASH = await bcrypt.hash('123456', 12);

  for (const u of USUARIOS) {
    const existing = await client.query(
      'SELECT id FROM usuarios WHERE email = $1',
      [u.email],
    );

    if (existing.rows.length > 0) {
      console.log(`ℹ️  Ya existe: ${u.email}`);
      continue;
    }

    await client.query(
      `INSERT INTO usuarios (id, nombre, email, password, rol, empresa, activo, "creadoEn", "actualizadoEn")
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, true, NOW(), NOW())`,
      [u.nombre, u.email, PASSWORD_HASH, u.rol, u.empresa],
    );

    console.log(`✅ Creado: ${u.email} (${u.rol})`);
  }

  await client.end();
  console.log('\n🎉 Seed completado. Usuarios Hannah Lab listos.');
}

main().catch((err) => {
  console.error('❌ Error en seed:', err);
  process.exit(1);
});
