const moment = require("moment-timezone");
const mongoose = require("mongoose");

const LoginSchema = new mongoose.Schema({
  username: {
    type: String,
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
        _id: ret._id,
        username: ret.username,
        time: moment(ret.time).tz("Asia/Taipei").format("YYYY-MM-DDTHH:mm:ss.SSSZ")
      };
    }
  }
});

const Login = mongoose.model("Login", LoginSchema);

module.exports = Login;
