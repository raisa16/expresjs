const reservationService = require("../services/reservationService");

exports.createReservation = async (req, res) => {
  try {
    const reservation = await reservationService.createReservation(req.body);
    res.status(201).json(reservation);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getReservation = async (req, res) => {
  try {
    const reservation = await reservationService.getReservation(req.params.id);
    if (!reservation) {
      res.status(404).json({ error: "Reservation not found" });
    }
    res.json(reservation);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
exports.updateReservation = async (req, res) => {
  try {
    const reservation = await reservationService.update(
      req.body,
      req.params.id
    );
    if (!reservation)
      return res.status(404).json({ error: "Reservation not found" });

    res.json(reservation);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
exports.deleteReservation = async (req, res) => {
  try {
    const reservation = await reservationService.deleteReservation(
      req.params.id
    );
    if (!reservation) {
      return res.status(404).json({ error: "Reservation not found" });
    }
    reservation.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
