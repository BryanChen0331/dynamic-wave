const express = require("express");
const router = express.Router();
const dataController = require("../controllers/dataController");
const checkSessionMiddleware = require("../middlewares/authMiddleware");

router.get("/questions", dataController.getQuestions);

router.post("/data", dataController.postData);

router.get("/data", checkSessionMiddleware, dataController.getData);

router.get("/counter", checkSessionMiddleware, dataController.getCounter);

router.get("/blueRatio", dataController.getBlueRatio);

router.get("/submit-log", checkSessionMiddleware, dataController.getSubmitLog);

router.post("/submit-log", checkSessionMiddleware, dataController.postSubmitLog);

router.get("/score", dataController.getScore);

module.exports = router;
