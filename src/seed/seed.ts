import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DataSource } from 'typeorm';
import { getDataSourceToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const ds = app.get<DataSource>(getDataSourceToken());

  console.log('🌱 Iniciando seed...');

  // ── Usuarios ─────────────────────────────────────────────────────
  const usuariosRepo = ds.getRepository('usuarios');

  const adminExiste = await usuariosRepo.findOne({ where: { email: 'admin@hannahweb.com' } });
  if (!adminExiste) {
    await usuariosRepo.save(
      usuariosRepo.create({
        nombre: 'Admin Hannah',
        email: 'admin@hannahweb.com',
        password: await bcrypt.hash('admin123', 12),
        rol: 'admin',
        empresa: 'Hannah Web',
        activo: true,
      }),
    );
    console.log('✅ Admin creado: admin@hannahweb.com / admin123');
  } else {
    console.log('ℹ️  Admin ya existe');
  }

  const clienteExiste = await usuariosRepo.findOne({ where: { email: 'cliente@empresa.com' } });
  let cliente = clienteExiste;
  if (!clienteExiste) {
    cliente = await usuariosRepo.save(
      usuariosRepo.create({
        nombre: 'Carlos Mendoza',
        email: 'cliente@empresa.com',
        password: await bcrypt.hash('cliente123', 12),
        rol: 'cliente',
        empresa: 'Empresa Demo S.A.',
        telefono: '+51 999 888 777',
        activo: true,
      }),
    );
    console.log('✅ Cliente creado: cliente@empresa.com / cliente123');
  } else {
    console.log('ℹ️  Cliente ya existe');
  }

  // ── Proyectos ─────────────────────────────────────────────────────
  const proyectosRepo = ds.getRepository('proyectos');
  const proyectoExiste = await proyectosRepo.findOne({ where: { nombre: 'Rediseño Web Corporativo' } });

  let proyecto: any = proyectoExiste;
  if (!proyectoExiste) {
    proyecto = await proyectosRepo.save(
      proyectosRepo.create({
        nombre: 'Rediseño Web Corporativo',
        descripcion: 'Rediseño completo del sitio web de Empresa Demo con nueva identidad visual, sistema de reservas y panel de administración.',
        estado: 'en_progreso',
        progreso: 65,
        fechaInicio: new Date('2026-03-01'),
        fechaEntrega: new Date('2026-06-30'),
        cliente,
      }),
    );
    console.log('✅ Proyecto creado');
  } else {
    console.log('ℹ️  Proyecto ya existe');
  }

  // ── Implementaciones + Kanban ─────────────────────────────────────
  const implRepo = ds.getRepository('implementaciones');
  const tareaRepo = ds.getRepository('tareas_kanban');

  const implExiste = await implRepo.findOne({ where: { nombre: 'Diseño UI/UX' } });
  if (!implExiste) {
    const impl1 = await implRepo.save(
      implRepo.create({
        nombre: 'Diseño UI/UX',
        descripcion: 'Diseño de pantallas en Figma y sistema de componentes.',
        tipo: 'proyecto_web',
        estado: 'completado',
        proyecto,
      }),
    );

    await tareaRepo.save([
      tareaRepo.create({ titulo: 'Wireframes homepage', columna: 'completado', prioridad: 'alta', orden: 0, implementacion: impl1 }),
      tareaRepo.create({ titulo: 'Diseño sistema de colores', columna: 'completado', prioridad: 'media', orden: 1, implementacion: impl1 }),
      tareaRepo.create({ titulo: 'Componentes UI en Figma', columna: 'completado', prioridad: 'alta', orden: 2, implementacion: impl1 }),
    ]);

    const impl2 = await implRepo.save(
      implRepo.create({
        nombre: 'Desarrollo Frontend',
        descripcion: 'Implementación en Next.js siguiendo el diseño aprobado.',
        tipo: 'proyecto_web',
        estado: 'en_progreso',
        proyecto,
      }),
    );

    await tareaRepo.save([
      tareaRepo.create({ titulo: 'Setup proyecto Next.js', columna: 'completado', prioridad: 'alta', orden: 0, implementacion: impl2 }),
      tareaRepo.create({ titulo: 'Navbar y Footer', columna: 'completado', prioridad: 'media', orden: 1, implementacion: impl2 }),
      tareaRepo.create({ titulo: 'Página de inicio', columna: 'en_revision', prioridad: 'alta', orden: 0, implementacion: impl2 }),
      tareaRepo.create({ titulo: 'Página de servicios', columna: 'en_progreso', prioridad: 'alta', orden: 0, implementacion: impl2 }),
      tareaRepo.create({ titulo: 'Sistema de reservas', columna: 'por_hacer', prioridad: 'alta', orden: 0, implementacion: impl2 }),
      tareaRepo.create({ titulo: 'Panel de administración', columna: 'por_hacer', prioridad: 'media', orden: 1, implementacion: impl2 }),
    ]);

    console.log('✅ Implementaciones y tareas Kanban creadas');
  } else {
    console.log('ℹ️  Implementaciones ya existen');
  }

  // ── Facturas ─────────────────────────────────────────────────────
  const facturasRepo = ds.getRepository('facturas');
  const facturaExiste = await facturasRepo.findOne({ where: { numero: 'FAC-2026-001' } });
  if (!facturaExiste) {
    await facturasRepo.save([
      facturasRepo.create({ numero: 'FAC-2026-001', concepto: 'Anticipo 50% - Rediseño Web', monto: 2500, moneda: 'USD', estado: 'pagada', fechaEmision: new Date('2026-03-01'), fechaVencimiento: new Date('2026-03-15'), cliente }),
      facturasRepo.create({ numero: 'FAC-2026-002', concepto: 'Segundo pago 30% - Rediseño Web', monto: 1500, moneda: 'USD', estado: 'pendiente', fechaEmision: new Date('2026-04-01'), fechaVencimiento: new Date('2026-04-30'), cliente }),
      facturasRepo.create({ numero: 'FAC-2026-003', concepto: 'Saldo final 20% - Rediseño Web', monto: 1000, moneda: 'USD', estado: 'pendiente', fechaEmision: new Date('2026-06-01'), fechaVencimiento: new Date('2026-06-30'), cliente }),
    ]);
    console.log('✅ Facturas creadas');
  } else {
    console.log('ℹ️  Facturas ya existen');
  }

  // ── Tickets ─────────────────────────────────────────────────────
  const ticketsRepo = ds.getRepository('tickets');
  const ticketExiste = await ticketsRepo.findOne({ where: { titulo: 'Error en formulario de contacto' } });
  if (!ticketExiste) {
    await ticketsRepo.save([
      ticketsRepo.create({ titulo: 'Error en formulario de contacto', descripcion: 'El formulario no envía correctamente los datos en mobile.', prioridad: 'alta', estado: 'resuelto', respuesta: 'Corregido en el PR #23. Ya está desplegado.', cliente }),
      ticketsRepo.create({ titulo: 'Cambio de logo en el header', descripcion: 'Necesitamos usar la versión oscura del logo para el header.', prioridad: 'baja', estado: 'abierto', cliente }),
    ]);
    console.log('✅ Tickets creados');
  } else {
    console.log('ℹ️  Tickets ya existen');
  }

  // ── Reuniones ─────────────────────────────────────────────────────
  const reunionesRepo = ds.getRepository('reuniones');
  const reunionExiste = await reunionesRepo.findOne({ where: { titulo: 'Kickoff del proyecto' } });
  if (!reunionExiste) {
    await reunionesRepo.save([
      reunionesRepo.create({ titulo: 'Kickoff del proyecto', tipo: 'kickoff', fecha: new Date('2026-03-03T10:00:00'), duracionMinutos: 60, linkMeet: 'https://meet.google.com/abc-defg', cliente }),
      reunionesRepo.create({ titulo: 'Revisión diseño UI', tipo: 'revision', fecha: new Date('2026-03-20T15:00:00'), duracionMinutos: 45, linkMeet: 'https://meet.google.com/hij-klmn', cliente }),
      reunionesRepo.create({ titulo: 'Seguimiento semana 7', tipo: 'seguimiento', fecha: new Date('2026-04-25T11:00:00'), duracionMinutos: 30, linkMeet: 'https://meet.google.com/opq-rstu', cliente }),
    ]);
    console.log('✅ Reuniones creadas');
  } else {
    console.log('ℹ️  Reuniones ya existen');
  }

  // ── Documentos ───────────────────────────────────────────────────
  const docsRepo = ds.getRepository('documentos');
  const docExiste = await docsRepo.findOne({ where: { nombre: 'Contrato de servicios' } });
  if (!docExiste) {
    await docsRepo.save([
      docsRepo.create({ nombre: 'Contrato de servicios', categoria: 'contrato', url: 'https://storage.hannahweb.com/docs/contrato-2026.pdf', tamanio: '245 KB', cliente }),
      docsRepo.create({ nombre: 'Propuesta técnica', categoria: 'propuesta', url: 'https://storage.hannahweb.com/docs/propuesta-web.pdf', tamanio: '1.2 MB', cliente }),
      docsRepo.create({ nombre: 'Entregable v1 - Diseños Figma', categoria: 'entregable', url: 'https://storage.hannahweb.com/docs/disenos-v1.pdf', tamanio: '8.5 MB', cliente }),
    ]);
    console.log('✅ Documentos creados');
  } else {
    console.log('ℹ️  Documentos ya existen');
  }

  console.log('\n🎉 Seed completado!');
  console.log('─────────────────────────────────');
  console.log('Admin:   admin@hannahweb.com  / admin123');
  console.log('Cliente: cliente@empresa.com  / cliente123');
  console.log('─────────────────────────────────');

  await app.close();
}

seed().catch((err) => {
  console.error('❌ Error en seed:', err);
  process.exit(1);
});
