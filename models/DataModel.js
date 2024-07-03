const moment = require("moment-timezone");
const mongoose = require("mongoose");

const DataSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true
  },
  options: {
    type: [Number],
    required: true
  },
  attributes: {
    adventure: {
      type: Number,
      required: true
    },
    social: {
      type: Number,
      required: true
    },
    creativity: {
      type: Number,
      required: true
    },
    strategy: {
      type: Number,
      required: true
    },
    emotion: {
      type: Number,
      required: true
    },
    intuition: {
      type: Number,
      required: true
    }
  },
  character: {
    type: String,
    required: true
  },
  team: {
    type: String,
    enum: ["blue", "yellow"],
    required: true
  },
  time: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: {
    transform: (doc, ret) => {
      return {
        userName: ret.userName,
        options: ret.options,
        attributes: ret.attributes,
        character: ret.character,
        team: ret.team,
        time: moment(ret.time).tz("Asia/Taipei").format("YYYY-MM-DDTHH:mm:ss.SSSZ")
      };
    }
  }
});

const Data = mongoose.model("Data", DataSchema);

module.exports = Data;
