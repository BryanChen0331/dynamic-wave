const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const checkSessionMiddleware = require("../middlewares/authMiddleware");

router.get("/sign-up", adminController.signUpPage);

router.post("/sign-up", adminController.signUp);

router.get("/sign-in", adminController.signInPage);

router.post("/sign-in", adminController.signIn);

router.get("/", checkSessionMiddleware, adminController.dashboard);

router.get("/competition", checkSessionMiddleware, adminController.competition);

router.get("/data", checkSessionMiddleware, adminController.data);

router.get("/score", checkSessionMiddleware, adminController.score);

router.get("/sign-in-history", checkSessionMiddleware, adminController.signInHistory);

router.post("/sign-out", checkSessionMiddleware, adminController.signOut);

module.exports = router;
