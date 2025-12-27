import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { query, pool } from '../config/database.js';

/**
 * Script para crear las cuentas de administrador
 * - Fuyi (super_admin): Programador con acceso total y comisiones del 12%
 * - Walmer (admin): Dueño del local, puede gestionar productos y pedidos
 */

async function seedAdmins() {
  console.log('🌱 Iniciando seed de administradores...\n');

  const admins = [
    {
      email: 'fuyi@melosportt.com',
      password: 'Fuyi123!*',
      fullName: 'Fuyi Desarrollador',
      role: 'super_admin',
      description: 'Programador - Acceso total, comisión 12% por venta',
    },
    {
      email: 'walmer@melosportt.com',
      password: 'Walmer123!*',
      fullName: 'Walmer Admin',
      role: 'admin',
      description: 'Dueño del local - Gestión de productos y pedidos',
    },
  ];

  for (const admin of admins) {
    try {
      // Verificar si ya existe
      const existing = await query('SELECT id, email FROM users WHERE email = $1', [admin.email]);

      if (existing.rows.length > 0) {
        console.log(`⚠️  Usuario ${admin.email} ya existe, actualizando...`);

        // Actualizar contraseña y rol
        const hashedPassword = await bcrypt.hash(admin.password, 12);
        await query(
          'UPDATE users SET password_hash = $1, role = $2, full_name = $3, updated_at = NOW() WHERE email = $4',
          [hashedPassword, admin.role, admin.fullName, admin.email]
        );

        console.log(`✅ Usuario ${admin.email} actualizado como ${admin.role}`);
      } else {
        // Crear nuevo usuario
        const userId = uuidv4();
        const hashedPassword = await bcrypt.hash(admin.password, 12);

        await query(
          `INSERT INTO users (id, email, full_name, password_hash, role, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
          [userId, admin.email, admin.fullName, hashedPassword, admin.role]
        );

        console.log(`✅ Usuario creado: ${admin.email}`);
        console.log(`   Rol: ${admin.role}`);
        console.log(`   ${admin.description}\n`);
      }
    } catch (error) {
      console.error(`❌ Error con ${admin.email}:`, error);
    }
  }

  console.log('\n📋 Resumen de roles:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('SUPER_ADMIN (Fuyi):');
  console.log('  • Acceso total al sistema');
  console.log('  • Ver todas las ventas y comisiones (12%)');
  console.log('  • Gestionar usuarios y administradores');
  console.log('  • Configuración del sistema');
  console.log('  • Analytics y reportes completos');
  console.log('');
  console.log('ADMIN (Walmer):');
  console.log('  • Gestionar productos (crear, editar, eliminar)');
  console.log('  • Ver y gestionar pedidos');
  console.log('  • Gestionar inventario');
  console.log('  • Ver analytics básicos de ventas');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  await pool.end();
  console.log('✨ Seed completado!');
}

seedAdmins().catch(console.error);
