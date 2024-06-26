const moment = require('moment-timezone');
const mongoose = require('mongoose');

const ScoreSchema = new mongoose.Schema({
  competition: {
    type: String,
    required: true
  },
  team: {
    type: String,
    required: true,
    enum: ['blue', 'yellow']
  },
  score: {
    type: Number,
    required: true
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
}, {
    toJSON: {
      transform: (doc, ret) => {
        return {
          competition: ret.competition,
          team: ret.team,
          score: ret.score,
          submittedAt: moment(ret.submittedAt).tz('Asia/Taipei').format('YYYY-MM-DDTHH:mm:ss.SSSZ')
        };
      }
    }
  });

const Score = mongoose.model('Score', ScoreSchema);

module.exports = Score;
