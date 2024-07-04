const express = require("express");
const router = express.Router();
const apiController = require("../controllers/apiController");
const checkSessionMiddleware = require("../middlewares/authMiddleware");

router.get("/question", apiController.getQuestion);

router.post("/data", apiController.postData);

router.get("/data", checkSessionMiddleware, apiController.getData);

router.patch("/data/:id", checkSessionMiddleware, apiController.deleteData);

router.get("/blue-ratio", apiController.getBlueRatio);

router.get("/score-record", checkSessionMiddleware, apiController.getScoreRecord);

router.post("/score-record", checkSessionMiddleware, apiController.postScoreRecord);

router.patch("/score-record/:id", checkSessionMiddleware, apiController.deleteScoreRecord);

router.get("/total-score", apiController.getTotalScore);

router.get("/sign-in-history", checkSessionMiddleware, apiController.getSignInHistory);

module.exports = router;
