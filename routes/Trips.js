const express = require("express");
const router = express.Router();
const {
  newTrip,
  getTrip,
  unAssignedTrips,
  getAllTrips,
  getSingleTrips,
  updateDriver,
  cancelTrip,
  driverTripData,
  updateDriverTripData,
  updateCompleteDriverTrip,
  verifyContent,
  tripCount,
  update_driver_state,
  getClientData,
  newTripPayment,
  filteredTripData,
  updateTripStatus,
  newAdminTrip,
  lastFiveTrips,
  totalTripCount,
  updateStatus,
  sendPaymentLink,
  updatePaymentInfo,
  downloadInvoice,
  newUnAssignedTripsForAdminCard,
} = require("../controllers/trips/Trips");
const { deleteUser } = require("../controllers/customers/Customers");

router.post("/new_admin_trips", newAdminTrip);
router.post("/newtrip", newTrip);
router.post("/new_trip", newTripPayment);
router.post("/cancel-trip", cancelTrip);
router.post("/driver_trip_data", driverTripData);
router.post("/get_trip", getTrip);
router.post("/get_unassigned_trips", unAssignedTrips);
router.post("/get_unassigned_trips_new", newUnAssignedTripsForAdminCard);
router.post("/get_all_trips", getAllTrips);
router.post("/get_client_trips", getClientData);
router.post("/get_single_trips", getSingleTrips);
router.post("/update_driver", updateDriver);
router.post("/update_driver_state", update_driver_state);
router.post("/update_driver_trip_data", updateDriverTripData);
router.post("/update_complete_driver_trip_data", updateCompleteDriverTrip);
// router.post("/send_status", verifyContent);
router.post("/trip-count", tripCount);
router.get("/last-five-trips", lastFiveTrips);

// Filtered Data
router.post("/un-assigned-trips", filteredTripData);
router.post("/update-trips", updateTripStatus);

router.get("/trips-count", totalTripCount);

router.post("/send-status", updateStatus);

router.post("/send-payment-link", sendPaymentLink);

router.post("/update-payment", updatePaymentInfo);

router.post("/delete-user", deleteUser);

router.post("/download-invoice", downloadInvoice);

module.exports = router;
