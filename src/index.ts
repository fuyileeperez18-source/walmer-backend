import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { env } from './config/env.js';
import { pool, query } from './config/database.js';
import routes from './routes/index.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

const app = express();

// Trust proxy for Render/Vercel (required for rate limiting behind reverse proxy)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());

// CORS configuration
const allowedOrigins = env.ALLOWED_ORIGINS
  ? env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : [env.FRONTEND_URL];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(env.RATE_LIMIT_WINDOW_MS),
  max: parseInt(env.RATE_LIMIT_MAX),
  message: { success: false, error: 'Too many requests, please try again later' },
});
app.use('/api', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'healthy', database: 'connected' });
  } catch {
    res.status(500).json({ status: 'unhealthy', database: 'disconnected' });
  }
});

// API routes
app.use('/api', routes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Función para ejecutar migraciones automáticamente
async function runAutoMigrations() {
  console.log('🔄 Verificando migraciones pendientes...');

  try {
    // Leer todas las migraciones disponibles
    const migrationsDir = join(process.cwd(), 'migrations');
    const migrationFiles = readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Ordenar alfabéticamente

    console.log(`📁 Encontradas ${migrationFiles.length} migraciones`);

    let executedCount = 0;

    // Ejecutar cada migración
    for (const file of migrationFiles) {
      const migrationName = file.replace('.sql', '');
      const migrationPath = join(migrationsDir, file);

      try {
        // Verificar si la migración ya se ejecutó (buscando una tabla específica de esa migración)
        let checkTable = '';
        if (migrationName === '000_initial_schema') checkTable = 'users';
        else if (migrationName === '004_add_commission_system') checkTable = 'team_members';

        if (checkTable) {
          const checkResult = await query(`
            SELECT EXISTS (
              SELECT 1
              FROM information_schema.tables
              WHERE table_schema = 'public'
              AND table_name = $1
            )
          `, [checkTable]);

          if (checkResult.rows[0].exists) {
            console.log(`⏭️  ${migrationName} ya aplicada`);
            continue;
          }
        }

        // Ejecutar la migración
        console.log(`📄 Ejecutando: ${migrationName}`);
        const sql = readFileSync(migrationPath, 'utf8');
        await query(sql);
        console.log(`✅ ${migrationName} completada`);
        executedCount++;

      } catch (error: any) {
        // Si es error de tabla ya existe, continuar
        if (error.message.includes('already exists') ||
            error.message.includes('ya existe') ||
            error.message.includes('duplicate key')) {
          console.log(`⚠️  ${migrationName} ya aplicada (error ignorado)`);
        } else {
          console.error(`❌ Error en ${migrationName}:`, error.message);
          // No fallar completamente, continuar con otras migraciones
        }
      }
    }

    if (executedCount > 0) {
      console.log(`🎉 Ejecutadas ${executedCount} migraciones nuevas`);
    } else {
      console.log('✅ Todas las migraciones ya están aplicadas');
    }

  } catch (error: any) {
    console.error('❌ Error ejecutando migraciones automáticas:', error.message);
    console.log('⚠️  Continuando con el inicio del servidor...');
  }
}

// Función para ejecutar seed automático
async function runAutoSeed() {
  console.log('🌱 Verificando usuarios administradores...');

  try {
    // Verificar si ya existen admins
    const adminCheck = await query(`
      SELECT COUNT(*) as admin_count
      FROM users
      WHERE role IN ('admin', 'super_admin')
    `);

    if (parseInt(adminCheck.rows[0].admin_count) === 0) {
      console.log('👤 Creando usuarios administradores...');

      // Ejecutar seed de admins
      const { execSync } = await import('child_process');
      execSync('npm run seed:admins', { stdio: 'inherit' });

      console.log('✅ Usuarios administradores creados');
    } else {
      console.log('✅ Usuarios administradores ya existen');
    }

  } catch (error: any) {
    console.error('❌ Error ejecutando seed automático:', error.message);
    console.log('⚠️  Continuando con el inicio del servidor...');
  }
}

// Start server
const PORT = parseInt(env.PORT);

// Ejecutar migraciones y seed automáticamente al iniciar
(async () => {
  await runAutoMigrations();
  await runAutoSeed();

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌍 Environment: ${env.NODE_ENV}`);
    console.log(`🔗 Frontend URL: ${env.FRONTEND_URL}`);
    console.log(`📊 Database: Connected`);
    console.log(`🔄 Auto-migrations: Enabled`);
  });
})();

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await pool.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await pool.end();
  process.exit(0);
});