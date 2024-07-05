const Data = require("../models/DataModel");
const Score = require("../models/ScoreModel");
const Admin = require("../models/AdminModel");
const SignIn = require("../models/SignInModel");

const ResponseCodes = {
  SUCCESS: "0000",
  VALIDATION_ERROR: "1001",
  AUTH_ERROR: "1002",
  NOT_FOUND: "1003",
  PERMISSION_ERROR: "1004",
  OPERATION_FAILED: "1005",
  SERVER_ERROR: "2001"
};

function createResponse(code, message, data = null) {
  return { code, message, data };
}

const getLatestTotals = async () => {
  const totals = await Score.aggregate([
    {
      $facet: {
        blueTotal: [
          { $match: { team: "blue", isDeleted: false } },
          { $group: { _id: null, total: { $sum: "$score" } } },
          { $project: { _id: 0, total: 1 } }
        ],
        yellowTotal: [
          { $match: { team: "yellow", isDeleted: false } },
          { $group: { _id: null, total: { $sum: "$score" } } },
          { $project: { _id: 0, total: 1 } }
        ]
      }
    }
  ]);

  return {
    blueTotal: totals[0].blueTotal.length > 0 ? totals[0].blueTotal[0].total : 0,
    yellowTotal: totals[0].yellowTotal.length > 0 ? totals[0].yellowTotal[0].total : 0
  };
};

const sendSSEUpdate = (req, data) => {
  if (req.app.locals.sseClients) {
    req.app.locals.sseClients.forEach(client => {
      client.write(`data: ${JSON.stringify(data)}\n\n`);
    });
  }
};

exports.getQuestions = async (req, res) => {
  try {
    const questions = require("../public/json/questions.json");
    res.json(createResponse(ResponseCodes.SUCCESS, "成功獲取問題", questions));
  } catch (error) {
    console.error("獲取問題時發生錯誤:", error);
    res.status(500).json(createResponse(ResponseCodes.SERVER_ERROR, "獲取問題時發生錯誤"));
  }
};

exports.postData = async (req, res) => {
  try {
    const newData = new Data(req.body);
    await newData.save();
    res.status(201).json(createResponse(ResponseCodes.SUCCESS, "數據保存成功", newData));
  } catch (error) {
    console.error("保存數據時發生錯誤:", error);
    res.status(400).json(createResponse(ResponseCodes.VALIDATION_ERROR, "數據驗證失敗"));
  }
};

exports.getData = async (req, res) => {
  try {
    const datas = await Data.find({ isDeleted: false }).sort({ time: -1 });
    res.json(createResponse(ResponseCodes.SUCCESS, "成功獲取數據", datas));
  } catch (error) {
    console.error("獲取數據時發生錯誤:", error);
    res.status(500).json(createResponse(ResponseCodes.SERVER_ERROR, "獲取數據時發生錯誤"));
  }
};

exports.getDeletedData = async (req, res) => {
  try {
    const datas = await Data.find({ isDeleted: true }).sort({ time: -1 });
    res.json(createResponse(ResponseCodes.SUCCESS, "成功獲取已刪除數據", datas));
  } catch (error) {
    console.error("獲取已刪除數據時發生錯誤:", error);
    res.status(500).json(createResponse(ResponseCodes.SERVER_ERROR, "獲取已刪除數據時發生錯誤"));
  }
};

exports.deleteData = async (req, res) => {
  const { id } = req.params;
  try {
    const updatedData = await Data.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
    if (!updatedData) {
      return res.status(404).json(createResponse(ResponseCodes.NOT_FOUND, "數據不存在"));
    }
    res.json(createResponse(ResponseCodes.SUCCESS, "數據刪除成功", updatedData));
  } catch (error) {
    console.error("刪除數據時發生錯誤:", error);
    res.status(500).json(createResponse(ResponseCodes.SERVER_ERROR, "刪除數據時發生錯誤"));
  }
};

exports.restoreData = async (req, res) => {
  try {
    const data = await Data.findByIdAndUpdate(req.params.id, { isDeleted: false }, { new: true });
    if (data) {
      res.json(createResponse(ResponseCodes.SUCCESS, "數據恢復成功", data));
    } else {
      res.status(404).json(createResponse(ResponseCodes.NOT_FOUND, "找不到該數據"));
    }
  } catch (error) {
    console.error("恢復數據時發生錯誤:", error);
    res.status(500).json(createResponse(ResponseCodes.SERVER_ERROR, "恢復數據時發生錯誤"));
  }
};

exports.getBlueRatio = async (req, res) => {
  try {
    const totalScores = await Data.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          blueCount: {
            $sum: {
              $cond: [{ $eq: ["$team", "blue"] }, 1, 0]
            }
          }
        }
      }
    ]);

    const { total, blueCount } = totalScores[0] || { total: 0, blueCount: 0 };
    const blueRatio = total > 0 ? (blueCount / total) : 0.5;
    res.json(createResponse(ResponseCodes.SUCCESS, "成功獲取藍隊比例", { blueRatio: blueRatio.toFixed(2) }));
  } catch (error) {
    console.error("計算藍隊比例時發生錯誤:", error);
    res.status(500).json(createResponse(ResponseCodes.SERVER_ERROR, "計算藍隊比例時發生錯誤"));
  }
};

exports.getScoreRecord = async (req, res) => {
  try {
    const scores = await Score.find({ isDeleted: false }).sort({ time: -1 });
    res.json(createResponse(ResponseCodes.SUCCESS, "成功獲取積分記錄", scores));
  } catch (error) {
    console.error("獲取積分記錄時發生錯誤:", error);
    res.status(500).json(createResponse(ResponseCodes.SERVER_ERROR, "獲取積分記錄時發生錯誤"));
  }
};

exports.postScoreRecord = async (req, res) => {
  try {
    const newScore = new Score({
      submittedBy: req.session.username,
      ...req.body
    });
    await newScore.save();

    const latestTotals = await getLatestTotals();
    sendSSEUpdate(req, latestTotals);

    res.status(201).json(createResponse(ResponseCodes.SUCCESS, "積分提交成功", newScore));
  } catch (error) {
    console.error("保存積分時發生錯誤:", error);
    res.status(500).json(createResponse(ResponseCodes.SERVER_ERROR, "保存積分時發生錯誤"));
  }
};

exports.getDeletedScoreRecord = async (req, res) => {
  try {
    const scores = await Score.find({ isDeleted: true }).sort({ time: -1 });
    res.json(createResponse(ResponseCodes.SUCCESS, "成功獲取已刪除積分記錄", scores));
  } catch (error) {
    console.error("獲取已刪除積分記錄時發生錯誤:", error);
    res.status(500).json(createResponse(ResponseCodes.SERVER_ERROR, "獲取已刪除積分記錄時發生錯誤"));
  }
};

exports.deleteScoreRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedScore = await Score.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
    if (updatedScore) {
      const latestTotals = await getLatestTotals();
      sendSSEUpdate(req, latestTotals);

      res.json(createResponse(ResponseCodes.SUCCESS, "積分記錄刪除成功"));
    } else {
      res.status(404).json(createResponse(ResponseCodes.NOT_FOUND, "找不到該積分記錄"));
    }
  } catch (error) {
    console.error("刪除積分記錄時發生錯誤:", error);
    res.status(500).json(createResponse(ResponseCodes.SERVER_ERROR, "刪除積分記錄時發生錯誤"));
  }
};

exports.restoreScoreRecord = async (req, res) => {
  try {
    const score = await Score.findByIdAndUpdate(req.params.id, { isDeleted: false }, { new: true });
    if (score) {
      const latestTotals = await getLatestTotals();
      sendSSEUpdate(req, latestTotals);

      res.json(createResponse(ResponseCodes.SUCCESS, "積分記錄恢復成功", score));
    } else {
      res.status(404).json(createResponse(ResponseCodes.NOT_FOUND, "找不到該積分記錄"));
    }
  } catch (error) {
    console.error("恢復積分記錄時發生錯誤:", error);
    res.status(500).json(createResponse(ResponseCodes.SERVER_ERROR, "恢復積分記錄時發生錯誤"));
  }
};

exports.getTotalScore = async (req, res) => {
  try {
    const totalScores = await getLatestTotals();
    res.json(createResponse(ResponseCodes.SUCCESS, "成功獲取總分", totalScores));
  } catch (error) {
    console.error("獲取總分時發生錯誤:", error);
    res.status(500).json(createResponse(ResponseCodes.SERVER_ERROR, "獲取總分時發生錯誤"));
  }
};

exports.getSignInHistory = async (req, res) => {
  try {
    const signIns = await SignIn.find().sort({ time: -1 });
    res.json(createResponse(ResponseCodes.SUCCESS, "成功獲取登入歷史", signIns));
  } catch (error) {
    console.error("獲取登入歷史時發生錯誤:", error);
    res.status(500).json(createResponse(ResponseCodes.SERVER_ERROR, "獲取登入歷史時發生錯誤"));
  }
};

exports.getPendingUsers = async (req, res) => {
  try {
    const users = await Admin.find({ status: "pending" }, { password: 0 }).sort({ time: -1 });
    res.json(createResponse(ResponseCodes.SUCCESS, "成功獲取待審核用戶列表", users));
  } catch (error) {
    console.error("獲取待審核用戶列表時發生錯誤:", error);
    res.status(500).json(createResponse(ResponseCodes.SERVER_ERROR, "獲取待審核用戶列表時發生錯誤"));
  }
};

exports.getActiveUsers = async (req, res) => {
  try {
    const users = await Admin.find({ status: "active" }, { password: 0 }).sort({ time: -1 });
    res.json(createResponse(ResponseCodes.SUCCESS, "成功獲取活躍用戶列表", users));
  } catch (error) {
    console.error("獲取活躍用戶列表時發生錯誤:", error);
    res.status(500).json(createResponse(ResponseCodes.SERVER_ERROR, "獲取活躍用戶列表時發生錯誤"));
  }
};

exports.getBannedUsers = async (req, res) => {
  try {
    const users = await Admin.find({ status: "banned" }, { password: 0 }).sort({ time: -1 });
    res.json(createResponse(ResponseCodes.SUCCESS, "成功獲取被封禁用戶列表", users));
  } catch (error) {
    console.error("獲取被封禁用戶列表時發生錯誤:", error);
    res.status(500).json(createResponse(ResponseCodes.SERVER_ERROR, "獲取被封禁用戶列表時發生錯誤"));
  }
};

exports.approveUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await Admin.findById(id);
    if (!user) {
      return res.status(404).json(createResponse(ResponseCodes.NOT_FOUND, "用戶不存在"));
    }
    user.status = "active";
    await user.save();
    res.json(createResponse(ResponseCodes.SUCCESS, "用戶審核通過"));
  } catch (error) {
    console.error("審核用戶時發生錯誤:", error);
    res.status(500).json(createResponse(ResponseCodes.SERVER_ERROR, "審核用戶時發生錯誤"));
  }
};

exports.banUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await Admin.findById(id);
    if (!user) {
      return res.status(404).json(createResponse(ResponseCodes.NOT_FOUND, "用戶不存在"));
    }
    user.status = "banned";
    await user.save();
    res.json(createResponse(ResponseCodes.SUCCESS, "用戶已被封禁"));
  } catch (error) {
    console.error("封禁用戶時發生錯誤:", error);
    res.status(500).json(createResponse(ResponseCodes.SERVER_ERROR, "封禁用戶時發生錯誤"));
  }
};

exports.unbanUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await Admin.findById(id);
    if (!user) {
      return res.status(404).json(createResponse(ResponseCodes.NOT_FOUND, "用戶不存在"));
    }
    user.status = "active";
    await user.save();
    res.json(createResponse(ResponseCodes.SUCCESS, "用戶已被解禁"));
  } catch (error) {
    console.error("解禁用戶時發生錯誤:", error);
    res.status(500).json(createResponse(ResponseCodes.SERVER_ERROR, "解禁用戶時發生錯誤"));
  }
};