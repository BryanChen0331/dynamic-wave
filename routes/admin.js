const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const authMiddleware = require("../middlewares/authMiddleware");

router.get("/sign-up", adminController.signUpPage);

router.post("/sign-up", adminController.signUp);

router.get("/sign-in", adminController.signInPage);

router.post("/sign-in", adminController.signIn);

router.get("/", authMiddleware.requireSignInMiddleware, adminController.dashboard);

router.get("/competition", authMiddleware.requireSignInMiddleware, adminController.competition);

router.get("/data", authMiddleware.requireSignInMiddleware, authMiddleware.requireManagerMiddleware, adminController.data);

router.get("/deleted-data", authMiddleware.requireSignInMiddleware, authMiddleware.requireManagerMiddleware, adminController.deletedData);

router.get("/score", authMiddleware.requireSignInMiddleware, adminController.score);

router.get("/deleted-score", authMiddleware.requireSignInMiddleware, authMiddleware.requireManagerMiddleware, adminController.deletedScore);

router.get("/sign-in-history", authMiddleware.requireSignInMiddleware, authMiddleware.requireManagerMiddleware, adminController.signInHistory);

router.get("/user/active-user", authMiddleware.requireSignInMiddleware, authMiddleware.requireManagerMiddleware, adminController.activeUser);

router.get("/user/pending-user", authMiddleware.requireSignInMiddleware, authMiddleware.requireManagerMiddleware, adminController.pendingUser);

router.get("/user/banned-user", authMiddleware.requireSignInMiddleware, authMiddleware.requireManagerMiddleware, adminController.bannedUser);

router.post("/sign-out", authMiddleware.requireSignInMiddleware, adminController.signOut);

module.exports = router;
