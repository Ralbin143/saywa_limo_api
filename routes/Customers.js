const express = require("express");
const router = express.Router();

const {
  signUpWithEmail,
  signUpWithGoogle,
  updateUserPhone,
  newSignature,
  findCustomer,
  updateCustomer,
  adminCustomerList,
  liveSearch,
  liveCustomersCount,
  adminSignUpWithEmail,
  updateCustomerModal,
  checkExistonDB,
  walletBalance,
} = require("../controllers/customers/Customers");

router.post("/signup_with_email", signUpWithEmail);
router.post("/admin_signup_with_email", adminSignUpWithEmail);
router.post("/checkexist_db", checkExistonDB);
router.post("/signup_with_google", signUpWithGoogle);
router.post("/update_user_phone", updateUserPhone);
router.post("/new_signature", newSignature);
router.post("/find_customer", findCustomer);
router.post("/client-update", updateCustomer);
router.post("/update_customer_profile", updateCustomerModal);
router.post("/list_customers", adminCustomerList);
router.post("/live_search_customers", liveSearch);
router.get("/live-customers-count", liveCustomersCount);
router.post("/get-wallet-balance", walletBalance);

module.exports = router;
