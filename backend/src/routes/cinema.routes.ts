import { Router } from 'express';
import { cinemaController } from '../controllers/cinema.controller.js';

const router = Router();

// Mandatory Endpoints
router.post('/', (req, res, next) => cinemaController.createCinema(req, res, next));
router.get('/', (req, res, next) => cinemaController.getAllCinemas(req, res, next));
router.get('/:id/booking', (req, res, next) => cinemaController.getBookingQuote(req, res, next));

// Additional convenience endpoints
router.get('/:id', (req, res, next) => cinemaController.getCinemaById(req, res, next));
router.delete('/:id', (req, res, next) => cinemaController.deleteCinema(req, res, next));

export default router;
