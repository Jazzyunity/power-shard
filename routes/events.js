const express = require("express");
const router = express.Router();
const {
  getEvent,
  getEvents,
  createEvent,
  eventsFeed,
  addFavoriteEvent,
  deleteFavoriteEvent,
  deleteEvent,
  updateEvent,
} = require("../controllers/events");
const { protect } = require("../middlewares/auth");

router
  .route("/events")
  .get(protect, getEvents)
  .post(protect, createEvent);
router.route("/events/feed").get(protect, eventsFeed);
router
  .route("/events/:slug")
  .get(protect, getEvent)
  .put(protect, updateEvent)
  .delete(protect, deleteEvent);
router
  .route("/events/:slug/favorite")
  .post(protect, addFavoriteEvent)
  .delete(protect, deleteFavoriteEvent);

module.exports = router;
