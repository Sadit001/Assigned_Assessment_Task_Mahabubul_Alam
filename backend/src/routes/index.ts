import { Router } from 'express';
import movieRoutes from './movie.routes.js';
import cinemaRoutes from './cinema.routes.js';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'DOOMSDAY READY API',
  });
});

// Mount resource routers
router.use('/movies', movieRoutes);
router.use('/cinemas', cinemaRoutes);

export default router;
