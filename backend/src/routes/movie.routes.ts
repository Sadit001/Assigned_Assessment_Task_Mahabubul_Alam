import { Router } from 'express';
import { movieController } from '../controllers/movie.controller.js';

const router = Router();

// Mandatory Endpoints
router.post('/', (req, res, next) => movieController.createMovie(req, res, next));
router.get('/', (req, res, next) => movieController.getAllMovies(req, res, next));
router.patch('/:id', (req, res, next) => movieController.updateMovie(req, res, next));
router.get('/:id/rewatch-order', (req, res, next) => movieController.getRewatchOrder(req, res, next));

// Additional convenience endpoints
router.get('/:id', (req, res, next) => movieController.getMovieById(req, res, next));
router.delete('/:id', (req, res, next) => movieController.deleteMovie(req, res, next));

export default router;
