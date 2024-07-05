const express = require("express");
const router = express.Router();
const apiController = require("../controllers/apiController");
const authMiddleware = require("../middlewares/authMiddleware");

router.get("/question", apiController.getQuestions);

router.post("/data", apiController.postData);

router.get("/data", authMiddleware.requireSignInMiddleware, authMiddleware.requireManagerMiddleware, apiController.getData);

router.get("/deleted-data", authMiddleware.requireSignInMiddleware, authMiddleware.requireManagerMiddleware, apiController.getDeletedData);

router.patch("/data/:id", authMiddleware.requireSignInMiddleware, authMiddleware.requireManagerMiddleware, apiController.deleteData);

router.patch("/restore-data/:id", authMiddleware.requireSignInMiddleware, authMiddleware.requireManagerMiddleware, apiController.restoreData);

router.get("/blue-ratio", apiController.getBlueRatio);

router.get("/score-record", authMiddleware.requireSignInMiddleware, apiController.getScoreRecord);

router.get("/deleted-score-record", authMiddleware.requireSignInMiddleware, authMiddleware.requireManagerMiddleware, apiController.getDeletedScoreRecord);

router.post("/score-record", authMiddleware.requireSignInMiddleware, apiController.postScoreRecord);

router.patch("/score-record/:id", authMiddleware.requireSignInMiddleware, authMiddleware.requireManagerMiddleware, apiController.deleteScoreRecord);

router.patch("/restore-score-record/:id", authMiddleware.requireSignInMiddleware, authMiddleware.requireManagerMiddleware, apiController.restoreScoreRecord);

router.get("/total-score", apiController.getTotalScore);

router.get("/sign-in-history", authMiddleware.requireSignInMiddleware, authMiddleware.requireManagerMiddleware, apiController.getSignInHistory);

router.get("/user/active", authMiddleware.requireSignInMiddleware, authMiddleware.requireManagerMiddleware, apiController.getActiveUsers);

router.get("/user/pending", authMiddleware.requireSignInMiddleware, authMiddleware.requireManagerMiddleware, apiController.getPendingUsers);

router.get("/user/banned", authMiddleware.requireSignInMiddleware, authMiddleware.requireManagerMiddleware, apiController.getBannedUsers);

router.post("/user/ban/:id", authMiddleware.requireSignInMiddleware, authMiddleware.requireManagerMiddleware, apiController.banUser);

router.post("/user/approve/:id", authMiddleware.requireSignInMiddleware, authMiddleware.requireManagerMiddleware, apiController.approveUser);

router.post("/user/unban/:id", authMiddleware.requireSignInMiddleware, authMiddleware.requireManagerMiddleware, apiController.unbanUser);

module.exports = router;
