const moment = require("moment-timezone");
const mongoose = require("mongoose");

const ScoreSchema = new mongoose.Schema({
  submittedBy: {
    type: String,
    required: true
  },
  competition: {
    type: String,
    required: true
  },
  team: {
    type: String,
    required: true,
    enum: ["blue", "yellow"]
  },
  score: {
    type: Number,
    required: true
  },
  time: {
    type: Date,
    default: Date.now
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  toJSON: {
    transform: (doc, ret) => {
      return {
        _id: ret._id,
        submittedBy: ret.submittedBy,
        competition: ret.competition,
        team: ret.team,
        score: ret.score,
        time: moment(ret.time).tz("Asia/Taipei").format("YYYY-MM-DDTHH:mm:ss.SSSZ"),
        isDeleted: ret.isDeleted
      };
    }
  }
});

const Score = mongoose.model("Score", ScoreSchema);

module.exports = Score;
