/**
 * Seed local para desarrollo.
 * Crea: admin@hannahlab.com y betondecken@hannahlab.com (contraseña: 12345678)
 * + proyectos, módulos, tareas, tickets y reuniones ficticias.
 *
 * Ejecutar con: pnpm seed:local
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DataSource } from 'typeorm';
import { getDataSourceToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const ds = app.get<DataSource>(getDataSourceToken());

  console.log('🌱 Iniciando seed local...');

  const usuariosRepo  = ds.getRepository('usuarios');
  const proyectosRepo = ds.getRepository('proyectos');
  const implRepo      = ds.getRepository('implementaciones');
  const tareaRepo     = ds.getRepository('tareas_kanban');
  const ticketsRepo   = ds.getRepository('tickets');
  const reunionesRepo = ds.getRepository('reuniones');

  const PASSWORD = await bcrypt.hash('12345678', 12);

  // ── Usuarios ──────────────────────────────────────────────────────
  const upsert = async (data: Record<string, any>) => {
    const existing = await usuariosRepo.findOne({ where: { email: data.email } });
    if (existing) { console.log(`ℹ️  Ya existe: ${data.email}`); return existing; }
    const u = await usuariosRepo.save(usuariosRepo.create({ ...data, password: PASSWORD, activo: true }));
    console.log(`✅ Creado: ${data.email} (${data.rol})`);
    return u;
  };

  const admin   = await upsert({ nombre: 'Admin Hannah Lab', email: 'admin@hannahlab.com',       rol: 'admin',    empresa: 'Hannah Lab' });
  const jair    = await upsert({ nombre: 'Jair Quispe',      email: 'jair.quispe@hannahlab.com', rol: 'subadmin', empresa: 'Hannah Lab' });
  const juan    = await upsert({ nombre: 'Juan Cueto',       email: 'juan.cueto@hannahlab.com',  rol: 'subadmin', empresa: 'Hannah Lab' });
  const cliente = await upsert({ nombre: 'Betondecken GmbH', email: 'betondecken@hannahlab.com', rol: 'cliente',  empresa: 'Betondecken GmbH', telefono: '+43 1 234 5678' });

  // ── Proyecto 1: App Web Betondecken ───────────────────────────────
  let p1: any = await proyectosRepo.findOne({ where: { nombre: 'App Web Betondecken' } });
  if (!p1) {
    p1 = await proyectosRepo.save(proyectosRepo.create({
      nombre: 'App Web Betondecken',
      descripcion: 'Plataforma web para gestión de proyectos de construcción con losas de hormigón. Incluye cotizador, panel de clientes y módulo de cálculo estructural.',
      estado: 'en_progreso',
      progreso: 55,
      fechaInicio: new Date('2026-02-15'),
      fechaEntrega: new Date('2026-07-31'),
      cliente,
      encargados: [jair, juan],
    }));
    console.log('✅ Proyecto 1 creado: App Web Betondecken');
  } else { console.log('ℹ️  Proyecto 1 ya existe'); }

  // Módulos del proyecto 1
  const implExiste = await implRepo.findOne({ where: { nombre: 'Diseño UI/UX' } });
  if (!implExiste) {
    const m1 = await implRepo.save(implRepo.create({
      nombre: 'Diseño UI/UX',
      descripcion: 'Wireframes, sistema de diseño y prototipo en Figma.',
      tipo: 'proyecto_web',
      estado: 'completado',
      proyecto: p1,
    }));
    await tareaRepo.save([
      tareaRepo.create({ titulo: 'Wireframes principales', columna: 'completado', prioridad: 'alta', orden: 0, implementacion: m1, responsables: [jair] }),
      tareaRepo.create({ titulo: 'Sistema de colores y tipografía', columna: 'completado', prioridad: 'media', orden: 1, implementacion: m1, responsables: [jair] }),
      tareaRepo.create({ titulo: 'Componentes UI en Figma', columna: 'completado', prioridad: 'alta', orden: 2, implementacion: m1, responsables: [jair] }),
      tareaRepo.create({ titulo: 'Prototipo interactivo', columna: 'completado', prioridad: 'media', orden: 3, implementacion: m1, responsables: [jair] }),
    ]);

    const m2 = await implRepo.save(implRepo.create({
      nombre: 'Frontend Next.js',
      descripcion: 'Implementación del frontend con Next.js 15 y Tailwind CSS.',
      tipo: 'proyecto_web',
      estado: 'en_progreso',
      proyecto: p1,
    }));
    await tareaRepo.save([
      tareaRepo.create({ titulo: 'Setup proyecto y arquitectura de carpetas', columna: 'completado', prioridad: 'alta', orden: 0, implementacion: m2, responsables: [juan] }),
      tareaRepo.create({ titulo: 'Layout principal y navegación', columna: 'completado', prioridad: 'alta', orden: 1, implementacion: m2, responsables: [juan] }),
      tareaRepo.create({ titulo: 'Página de inicio y hero section', columna: 'en_revision', prioridad: 'alta', orden: 0, implementacion: m2, responsables: [juan], fechaLimite: new Date('2026-05-10') }),
      tareaRepo.create({ titulo: 'Cotizador de losas', columna: 'en_progreso', prioridad: 'alta', orden: 0, implementacion: m2, responsables: [juan], fechaLimite: new Date('2026-05-20') }),
      tareaRepo.create({ titulo: 'Panel del cliente', columna: 'por_hacer', prioridad: 'media', orden: 0, implementacion: m2, responsables: [juan], fechaLimite: new Date('2026-06-15') }),
      tareaRepo.create({ titulo: 'Módulo de cálculo estructural', columna: 'por_hacer', prioridad: 'alta', orden: 1, implementacion: m2, fechaLimite: new Date('2026-06-30') }),
    ]);

    const m3 = await implRepo.save(implRepo.create({
      nombre: 'Backend API',
      descripcion: 'API REST con NestJS, autenticación JWT y base de datos PostgreSQL.',
      tipo: 'proyecto_web',
      estado: 'en_progreso',
      proyecto: p1,
    }));
    await tareaRepo.save([
      tareaRepo.create({ titulo: 'Setup NestJS + TypeORM', columna: 'completado', prioridad: 'alta', orden: 0, implementacion: m3, responsables: [jair] }),
      tareaRepo.create({ titulo: 'Módulo de autenticación', columna: 'completado', prioridad: 'alta', orden: 1, implementacion: m3, responsables: [jair] }),
      tareaRepo.create({ titulo: 'CRUD de proyectos de construcción', columna: 'en_progreso', prioridad: 'alta', orden: 0, implementacion: m3, responsables: [jair], fechaLimite: new Date('2026-05-25') }),
      tareaRepo.create({ titulo: 'Endpoint de cotización automática', columna: 'por_hacer', prioridad: 'alta', orden: 0, implementacion: m3, fechaLimite: new Date('2026-06-10') }),
      tareaRepo.create({ titulo: 'Integración con sistema de pagos', columna: 'por_hacer', prioridad: 'media', orden: 1, implementacion: m3, fechaLimite: new Date('2026-07-01') }),
    ]);

    console.log('✅ Módulos y tareas del proyecto 1 creados');
  }

  // ── Proyecto 2: Automatización de Presupuestos ────────────────────
  let p2: any = await proyectosRepo.findOne({ where: { nombre: 'Automatización de Presupuestos' } });
  if (!p2) {
    p2 = await proyectosRepo.save(proyectosRepo.create({
      nombre: 'Automatización de Presupuestos',
      descripcion: 'Sistema automatizado para generación de presupuestos de obra basado en parámetros técnicos. Integra Excel, PDF y correo automático.',
      estado: 'pendiente',
      progreso: 10,
      fechaInicio: new Date('2026-05-01'),
      fechaEntrega: new Date('2026-09-30'),
      cliente,
      encargados: [jair],
    }));
    console.log('✅ Proyecto 2 creado');

    const m4 = await implRepo.save(implRepo.create({
      nombre: 'Análisis y diseño del flujo',
      descripcion: 'Relevamiento del proceso actual y diseño del flujo automatizado.',
      tipo: 'automatizacion',
      estado: 'en_progreso',
      proyecto: p2,
    }));
    await tareaRepo.save([
      tareaRepo.create({ titulo: 'Entrevistas con el equipo de Betondecken', columna: 'completado', prioridad: 'alta', orden: 0, implementacion: m4, responsables: [jair] }),
      tareaRepo.create({ titulo: 'Mapeo del proceso actual (AS-IS)', columna: 'en_progreso', prioridad: 'alta', orden: 0, implementacion: m4, responsables: [jair], fechaLimite: new Date('2026-05-15') }),
      tareaRepo.create({ titulo: 'Diseño del proceso futuro (TO-BE)', columna: 'por_hacer', prioridad: 'media', orden: 0, implementacion: m4, fechaLimite: new Date('2026-05-30') }),
    ]);
    console.log('✅ Módulo del proyecto 2 creado');
  }

  // ── Tickets ───────────────────────────────────────────────────────
  const ticketExiste = await ticketsRepo.findOne({ where: { titulo: 'Error en el cotizador de losas' } });
  if (!ticketExiste) {
    await ticketsRepo.save([
      ticketsRepo.create({
        titulo: 'Error en el cotizador de losas',
        descripcion: 'Cuando ingreso un área mayor a 500m² el cotizador muestra un resultado incorrecto (NaN). Probado en Chrome y Firefox.',
        tipo: 'bug',
        prioridad: 'alta',
        estado: 'en_progreso',
        cliente,
        proyecto: p1,
        asignadoA: juan,
      }),
      ticketsRepo.create({
        titulo: 'Cambiar colores del botón principal',
        descripcion: 'El botón "Solicitar cotización" debería ser verde oscuro (#1a4731) en lugar del gris actual. Es parte del branding de Betondecken.',
        tipo: 'comentario',
        prioridad: 'baja',
        estado: 'abierto',
        cliente,
        proyecto: p1,
      }),
      ticketsRepo.create({
        titulo: 'Agregar campo de descripción en el formulario de contacto',
        descripcion: 'Necesitamos un campo de texto libre para que el cliente pueda describir su proyecto antes de que le cotizemos.',
        tipo: 'aporte',
        prioridad: 'media',
        estado: 'resuelto',
        respuesta: 'El campo fue agregado en la versión 0.4.2. Ya está disponible en producción.',
        cliente,
        proyecto: p1,
        asignadoA: jair,
      }),
      ticketsRepo.create({
        titulo: 'Problema con la descarga del PDF de presupuesto',
        descripcion: 'El PDF generado tiene los caracteres acentuados mal codificados (Ã en lugar de Á). Afecta a todos los presupuestos.',
        tipo: 'incidencia',
        prioridad: 'critica',
        estado: 'abierto',
        cliente,
        proyecto: p1,
        asignadoA: juan,
      }),
    ]);
    console.log('✅ Tickets creados');
  }

  // ── Reuniones ─────────────────────────────────────────────────────
  const reunionExiste = await reunionesRepo.findOne({ where: { titulo: 'Kickoff App Web Betondecken' } });
  if (!reunionExiste) {
    await reunionesRepo.save([
      // Pasadas
      reunionesRepo.create({
        titulo: 'Kickoff App Web Betondecken',
        tipo: 'kickoff',
        fecha: new Date('2026-02-15T10:00:00'),
        duracionMinutos: 90,
        linkMeet: 'https://meet.google.com/abc-defg-hij',
        descripcion: 'Presentación del equipo, alcance del proyecto y definición de entregables.',
        cliente,
        proyecto: p1,
      }),
      reunionesRepo.create({
        titulo: 'Revisión de wireframes y diseño UI',
        tipo: 'revision',
        fecha: new Date('2026-03-10T15:00:00'),
        duracionMinutos: 60,
        linkMeet: 'https://meet.google.com/klm-nopq-rst',
        descripcion: 'Presentación y aprobación de los diseños en Figma.',
        cliente,
        proyecto: p1,
      }),
      reunionesRepo.create({
        titulo: 'Seguimiento quincenal — Sprint 3',
        tipo: 'seguimiento',
        fecha: new Date('2026-04-14T11:00:00'),
        duracionMinutos: 45,
        linkMeet: 'https://meet.google.com/uvw-xyz1-234',
        descripcion: 'Revisión del avance del frontend y demo del módulo de navegación.',
        cliente,
        proyecto: p1,
      }),
      // Próximas
      reunionesRepo.create({
        titulo: 'Demo del cotizador de losas',
        tipo: 'revision',
        fecha: new Date('2026-05-08T14:00:00'),
        duracionMinutos: 60,
        linkMeet: 'https://meet.google.com/567-890a-bcd',
        descripcion: 'Presentación del cotizador funcionando. Cliente validará los cálculos con su equipo técnico.',
        cliente,
        proyecto: p1,
      }),
      reunionesRepo.create({
        titulo: 'Kickoff Automatización de Presupuestos',
        tipo: 'kickoff',
        fecha: new Date('2026-05-05T10:00:00'),
        duracionMinutos: 90,
        linkMeet: 'https://meet.google.com/efg-hijk-lmn',
        descripcion: 'Inicio del segundo proyecto. Presentación del equipo y relevamiento inicial del proceso.',
        cliente,
        proyecto: p2,
      }),
      reunionesRepo.create({
        titulo: 'Seguimiento mensual — Mayo',
        tipo: 'seguimiento',
        fecha: new Date('2026-05-20T11:00:00'),
        duracionMinutos: 30,
        linkMeet: 'https://meet.google.com/opq-rstu-vwx',
        descripcion: 'Estado general de ambos proyectos.',
        cliente,
      }),
    ]);
    console.log('✅ Reuniones creadas');
  }

  console.log('\n🎉 Seed local completado!');
  console.log('─────────────────────────────────────────');
  console.log('Admin:   admin@hannahlab.com       / 12345678');
  console.log('Cliente: betondecken@hannahlab.com / 12345678');
  console.log('─────────────────────────────────────────');

  await app.close();
}

seed().catch((err) => {
  console.error('❌ Error en seed:', err.message);
  process.exit(1);
});
