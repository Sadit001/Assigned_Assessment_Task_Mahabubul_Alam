import { createApp } from './app.js';
import { ENV } from './config/env.js';
import { getDatabase } from './config/database.js';

async function bootstrap() {
  const app = createApp();
  const db = await getDatabase();

  const isPrisma = db.isPrisma();
  console.log(`[Database] Initialized using storage engine: ${isPrisma ? 'PostgreSQL (Prisma)' : 'Persistent Storage'}`);

  const server = app.listen(ENV.PORT, () => {
    console.log(`===============================================`);
    console.log(`  DOOMSDAY READY API is running!`);
    console.log(`  Port: http://localhost:${ENV.PORT}`);
    console.log(`  Environment: ${ENV.NODE_ENV}`);
    console.log(`===============================================`);
  });

  const shutdown = async () => {
    console.log('\nShutting down gracefully...');
    server.close(() => {
      console.log('HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

bootstrap().catch(err => {
  console.error('Fatal error starting server:', err);
  process.exit(1);
});
