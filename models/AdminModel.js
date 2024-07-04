const moment = require("moment-timezone");
const mongoose = require("mongoose");

const AdminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  permission: {
    type: String,
    enum: ["manager", "member"],
    default: "member"
  },
  status: {
    type: String,
    enum: ["pending", "active", "banned"],
    default: "pending"
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
        password: ret.password,
        permission: ret.permission,
        status: ret.status,
        time: moment(ret.time).tz("Asia/Taipei").format("YYYY-MM-DDTHH:mm:ss.SSSZ")
      };
    }
  }
});

const Admin = mongoose.model("Admin", AdminSchema);

module.exports = Admin;
