const { Router } = require("express");
const UserController = require("../controllers/UserController");
const CaregiverProfilesController = require("../controllers/CaregiverProfilesController");
const AvailabilityController = require("../controllers/AvailabilityController");
const AppointmentsController = require("../controllers/AppointmentsController");
const PaymentsController = require("../controllers/PaymentsController");
const ReviewsController = require("../controllers/ReviewsController");
const ConversationsController = require("../controllers/ConversationsController");
const MessagesController = require("../controllers/MessagesController");
const authMiddleware = require("../middleware/auth");

const routes = new Router();

routes.post("/api/register", UserController.create);
routes.post("/api/login", UserController.login);

//Authenticated
routes.use(authMiddleware);

routes.get("/api/me", UserController.show);

// Caregivers
routes.get("/api/caregivers", CaregiverProfilesController.index);
routes.get("/api/caregivers/me", CaregiverProfilesController.showMe);
routes.get("/api/caregivers/:id", CaregiverProfilesController.show);
routes.patch("/api/caregivers/me", CaregiverProfilesController.updateMe);

// Availability
routes.get(
  "/api/caregivers/me/availability/weekly",
  AvailabilityController.getWeekly,
);
routes.post(
  "/api/caregivers/me/availability/weekly",
  AvailabilityController.storeWeekly,
);
routes.put(
  "/api/caregivers/me/availability/weekly/:id",
  AvailabilityController.updateWeekly,
);
routes.delete(
  "/api/caregivers/me/availability/weekly/:id",
  AvailabilityController.deleteWeekly,
);

routes.get(
  "/api/caregivers/me/availability/blocks",
  AvailabilityController.getBlocks,
);
routes.post(
  "/api/caregivers/me/availability/blocks",
  AvailabilityController.storeBlock,
);
routes.put(
  "/api/caregivers/me/availability/blocks/:id",
  AvailabilityController.updateBlock,
);
routes.delete(
  "/api/caregivers/me/availability/blocks/:id",
  AvailabilityController.deleteBlock,
);

// Appointments
routes.post("/api/appointments", AppointmentsController.store);
routes.get("/api/appointments", AppointmentsController.index);
routes.get("/api/appointments/:id", AppointmentsController.show);
routes.patch("/api/appointments/:id/confirm", AppointmentsController.confirm);
routes.patch("/api/appointments/:id/refuse", AppointmentsController.refuse);
routes.patch("/api/appointments/:id/cancel", AppointmentsController.cancel);
routes.delete("/api/appointments/:id", AppointmentsController.delete);

// Payments
routes.post("/api/payments", PaymentsController.store);
routes.get("/api/payments", PaymentsController.index);
routes.get("/api/payments/stats/daily", PaymentsController.stats);

// Reviews
routes.post("/api/reviews", ReviewsController.store);
routes.get("/api/caregivers/:id/reviews", ReviewsController.listByCaregiver);

// Conversations & Messages
routes.post("/api/conversations/direct", ConversationsController.direct);
routes.get("/api/conversations", ConversationsController.index);
routes.get("/api/conversations/:id", ConversationsController.show);
routes.get("/api/conversations/:id/messages", MessagesController.index);
routes.post("/api/conversations/:id/messages", MessagesController.store);
routes.patch("/api/conversations/:id/read", MessagesController.read);

module.exports = routes;
