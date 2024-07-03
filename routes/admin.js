const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const checkSessionMiddleware = require("../middlewares/authMiddleware");

router.get("/login", adminController.loginPage);

router.post("/login", adminController.login);

router.get("/", checkSessionMiddleware, adminController.dashboard);

router.get("/competition", checkSessionMiddleware, adminController.competition);

router.get("/data", checkSessionMiddleware, adminController.data);

router.get("/log", checkSessionMiddleware, adminController.log);

router.post("/logout", checkSessionMiddleware, adminController.logout);

module.exports = router;
