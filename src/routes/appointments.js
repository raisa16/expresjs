const {Router} = require('express');
const authenticationToken = require('../middlewares/auth');
const appointmentController = require('../controllers/appointmentController')
const router = Router();

router.get('/:id/appoinments', authenticationToken, appointmentController.getUserAppoinments);

module.exports = router;