const Data = require("../models/DataModel");
const Score = require("../models/ScoreModel");

const getLatestTotals = async () => {
  const totals = await Score.aggregate([
    {
      $facet: {
        blueTotal: [
          { $match: { team: "blue" } },
          { $group: { _id: null, total: { $sum: "$score" } } },
          { $project: { _id: 0, total: 1 } }
        ],
        yellowTotal: [
          { $match: { team: "yellow" } },
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
    const data = new Data(req.body);
    await data.save();
    res.status(201).json(data);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getData = async (req, res) => {
  try {
    const datas = await Data.find().sort({ time: -1 });
    res.json(datas);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getCounter = async (req, res) => {
  try {
    const count = await Data.countDocuments();
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getBlueRatio = async (req, res) => {
  try {
    const result = await Data.aggregate([
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

    const { total, blueCount } = result[0] || { total: 0, blueCount: 0 };
    const blueRatio = total > 0 ? (blueCount / total) : 0.5;
    res.json({ blueRatio: blueRatio.toFixed(2) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getSubmitLog = async (req, res) => {
  try {
    const scores = await Score.find().sort({ submittedAt: -1 });
    res.json(scores);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.postSubmitLog = async (req, res) => {
  const { competition, team, score } = req.body;

  try {
    const newScore = new Score({ competition, team, score });
    await newScore.save();

    const latestTotals = await getLatestTotals();
    sendSSEUpdate(req, latestTotals);

    res.status(201).json({ message: "Score submitted successfully!", score: newScore });
  } catch (error) {
    console.error("Error saving score:", error);
    res.status(500).json({ message: "Failed to submit score", error });
  }
};

exports.getScore = async (req, res) => {
  try {
    const result = await getLatestTotals();
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
