var express = require('express');
var router = express.Router();
const Data = require('../models/DataModel');

router.post('/data', async (req, res) => {
  try {
    const data = new Data(req.body);
    await data.save();
    res.status(201).json(data);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get('/data', async (req, res) => {
  try {
    const datas = await Data.find().sort({time: -1});
    res.json(datas);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/counter', async (req, res) => {
  try {
    const count = await Data.countDocuments();
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/blueRatio', async (req, res) => {
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
});

module.exports = router;
