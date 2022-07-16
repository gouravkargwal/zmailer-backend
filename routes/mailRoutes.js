const express = require("express");
const multer = require("multer");
const contactController = require("../controller/contactController");
const userController = require("../controller/userController");
const mailController = require("../controller/mailController");
const trackingController = require("../controller/trackingController");
const authController = require("../controller/authController");
const domainController = require("../controller/domainController");
const { requireSignin } = require("../middleware/mailMiddleware");

const router = express.Router();

const fileStorageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./csv");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + ".csv");
  },
});
const upload = multer({ storage: fileStorageEngine });

const dkimKeyStorageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./keys");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + ".pem");
  },
});
const dkimKey = multer({ storage: dkimKeyStorageEngine });

//Contact Routes
router.get("/contact", requireSignin, contactController.getContact);
router.delete("/contact", contactController.deleteContact);
router.post("/contact", upload.single("file"), contactController.addContact);

//Mailing Route
router.post("/sendmail", mailController.sendMail);
router.post("/sendtestmail", mailController.sendTestMail);

//User Routes
router.post("/user", userController.addUser);
router.delete("/user", userController.deleteUser);
router.get("/user", userController.getUser);

//Domain Routes
router.post("/domain", dkimKey.single("file"), domainController.addDomain);
router.delete("/domain", domainController.deleteDomain);
router.get("/domain", domainController.getDomain);

router.get("/group", mailController.getGroup);

//Tracking Routes
router.get("/tracking", trackingController.trackingData);
// router.post("/tracking", upload2.single("file"), trackingController.tracking);

router.get("/campaign", mailController.getCampaign);
router.get("/recentcampaign", mailController.getRecentCampaign);
router.get("/campaign/:campid", mailController.getSpecificCampaign);

//Unsubscribe Routes
router.get("/unsubscribe", mailController.unsubscribe);

//Authentication Routes
router.post("/login", authController.login);
router.post("/register", authController.register);

module.exports = router;
