const { Router } = require('express');
const reservationController = require('../controllers/reservationController');
const authenticationToken = require('../middlewares/auth');

const router = Router();

router.get('/:id', authenticationToken, reservationController.getReservation);
router.post('/', authenticationToken, reservationController.createReservation);
router.put('/:id', authenticationToken, reservationController.updateReservation);
router.delete('/:id', authenticationToken, reservationController.deleteReservation);

module.exports = router;