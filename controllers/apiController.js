const Data = require("../models/DataModel");
const Score = require("../models/ScoreModel");
const Admin = require("../models/AdminModel");
const SignIn = require("../models/SignInModel");

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
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.postData = async (req, res) => {
  try {
    const newData = new Data(req.body);
    await newData.save();
    res.status(201).json(newData);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getData = async (req, res) => {
  try {
    const datas = await Data.find({ isDeleted: false }).sort({ time: -1 });
    res.json(datas);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getDeletedData = async (req, res) => {
  try {
    const datas = await Data.find({ isDeleted: true }).sort({ time: -1 });
    res.json(datas);
  } catch (error) {
    res.status(500).json({ message: '獲取已刪除資料時發生錯誤', error });
  }
};

exports.deleteData = async (req, res) => {
  const { id } = req.params;
  try {
    const updatedData = await Data.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
    if (!updatedData) {
      return res.status(404).json({ message: "Data not found" });
    }
    res.json(updatedData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

exports.restoreData = async (req, res) => {
  try {
    const data = await Data.findByIdAndUpdate(req.params.id, { isDeleted: false }, { new: true });
    if (data) {
      res.json({ message: '資料已復原', data });
    } else {
      res.status(404).json({ message: '找不到該資料' });
    }
  } catch (error) {
    res.status(500).json({ message: '復原資料時發生錯誤', error });
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
    res.json({ blueRatio: blueRatio.toFixed(2) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getScoreRecord = async (req, res) => {
  try {
    const scores = await Score.find({ isDeleted: false }).sort({ time: -1 });
    res.json(scores);
  } catch (error) {
    res.status(500).json({ message: error.message });
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

    res.status(201).json({ message: "Score submitted successfully!", score: newScore });
  } catch (error) {
    console.error("Error saving score:", error);
    res.status(500).json({ message: "Failed to submit score", error });
  }
};

exports.getDeletedScoreRecord = async (req, res) => {
  try {
    const scores = await Score.find({ isDeleted: true }).sort({ time: -1 });
    res.json({ data: scores });
  } catch (error) {
    res.status(500).json({ message: "獲取已刪除積分記錄時發生錯誤", error });
  }
}

exports.deleteScoreRecord = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(req.params);
    const updatedScore = await Score.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
    if (updatedScore) {
      res.status(200).json({ message: "Score deleted successfully" });
    } else {
      res.status(404).json({ message: "Score not found" });
    }
  } catch (error) {
    console.error("Error deleting score record:", error);
    res.status(500).json({ message: "Error deleting score record" });
  }
};

exports.restoreScoreRecord = async (req, res) => {
  try {
    const score = await Score.findByIdAndUpdate(req.params.id, { isDeleted: false }, { new: true });
    if (score) {
      res.json({ message: "積分記錄已復原", data: score });
    } else {
      res.status(404).json({ message: "找不到該積分記錄" });
    }
  } catch (error) {
    res.status(500).json({ message: "復原積分記錄時發生錯誤", error });
  }
};

exports.getTotalScore = async (req, res) => {
  try {
    const totalScores = await getLatestTotals();
    res.json(totalScores);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getSignInHistory = async (req, res) => {
  try {
    const SignIns = await SignIn.find().sort({ time: -1 });
    res.json(SignIns);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPendingUsers = async (req, res) => {
  try {
    const users = await Admin.find({ status: "pending" }, { password: 0 }).sort({ time: -1 });
    res.json({ code: "0000", message: "成功", data: users });
  } catch (error) {
    console.error("獲取用戶列表時發生錯誤:", error);
    res.json({ code: "2001", message: "獲取用戶列表時發生錯誤", data: null });
  }
};

exports.getActiveUsers = async (req, res) => {
  try {
    const users = await Admin.find({ status: "active" }, { password: 0 }).sort({ time: -1 });
    res.json({ code: "0000", message: "成功", data: users });
  } catch (error) {
    console.error("獲取用戶列表時發生錯誤:", error);
    res.json({ code: "2001", message: "獲取用戶列表時發生錯誤", data: null });
  }
};

exports.getBannedUsers = async (req, res) => {
  try {
    const users = await Admin.find({ status: "banned" }, { password: 0 }).sort({ time: -1 });
    res.json({ code: "0000", message: "成功", data: users });
  } catch (error) {
    console.error("獲取用戶列表時發生錯誤:", error);
    res.json({ code: "2001", message: "獲取用戶列表時發生錯誤", data: null });
  }
};

exports.approveUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await Admin.findById(id);
    if (!user) {
      return res.json({ code: "1001", message: "用戶不存在", data: null });
    }
    user.status = "active";
    await user.save();
    res.json({ code: "0000", message: "用戶審核通過", data: null });
  } catch (error) {
    console.error("審核用戶時發生錯誤:", error);
    res.json({ code: "2002", message: "審核用戶時發生錯誤", data: null });
  }
};

exports.banUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await Admin.findById(id);
    if (!user) {
      return res.json({ code: "1001", message: "用戶不存在", data: null });
    }
    user.status = "banned";
    await user.save();
    res.json({ code: "0000", message: "用戶已被封禁", data: null });
  } catch (error) {
    console.error("封禁用戶時發生錯誤:", error);
    res.json({ code: "2002", message: "封禁用戶時發生錯誤", data: null });
  }
};

exports.unbanUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await Admin.findById(id);
    if (!user) {
      return res.json({ code: "1001", message: "用戶不存在", data: null });
    }
    user.status = "active";
    await user.save();
    res.json({ code: "0000", message: "用戶已被解禁", data: null });
  } catch (error) {
    console.error("解禁用戶時發生錯誤:", error);
    res.json({ code: "2002", message: "解禁用戶時發生錯誤", data: null });
  }
};