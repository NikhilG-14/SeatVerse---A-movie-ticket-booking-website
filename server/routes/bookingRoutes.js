import express from 'express';
import { createBooking, getOccupiedSeats, regeneratePaymentLink } from '../controllers/bookingController.js';

const bookingRouter = express.Router();


bookingRouter.post('/create', createBooking);
bookingRouter.get('/seats/:showId', getOccupiedSeats);
bookingRouter.post('/regenerate-payment-link', regeneratePaymentLink);
bookingRouter.get('/test', (req, res) => {
  res.json({ message: 'Booking router is working' });
});

export default bookingRouter;
