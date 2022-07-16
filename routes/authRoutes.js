const express = require("express");
const router = express.Router();
const authController = require("../controller/authController");
const authValidator = require("../middleware/authMiddleware");

router.post(
  "/register",
  authValidator.registerMiddleware,
  authController.register
);
router.post("/login", authValidator.loginMiddleware, authController.login);
router.post("/google-login", authController.googleLogin);

router.post("/account-activation", authController.accountActivation);

router.put(
  "/forgot-password",
  authValidator.forgetPasswordMiddleware,
  authController.forgotPassword
);

router.put(
  "/reset-password",
  authValidator.resetPasswordMiddleware,
  authController.resetPassword
);

module.exports = router;
