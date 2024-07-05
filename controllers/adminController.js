require("dotenv").config();
const bcrypt = require("bcrypt");
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

exports.signUpPage = (req, res) => {
  res.render("admin/sign-up");
};

exports.signUp = async (req, res) => {
  const { username, password } = req.body;

  if (username.length < 4) {
    return res.status(400).json(createResponse(ResponseCodes.VALIDATION_ERROR, "用戶名至少要有4個字元。"));
  }

  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json(createResponse(ResponseCodes.VALIDATION_ERROR, "密碼必須至少有8個字元，並包含英文字母和數字。"));
  }

  try {
    const existingUser = await Admin.findOne({ username });
    if (existingUser) {
      return res.status(409).json(createResponse(ResponseCodes.AUTH_ERROR, "用戶名已被使用。"));
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const admin = new Admin({
      username,
      password: hashedPassword
    });

    await admin.save();

    res.status(201).json(createResponse(ResponseCodes.SUCCESS, "註冊成功，請等待管理員審核。"));
  } catch (error) {
    console.error(error);
    res.status(500).json(createResponse(ResponseCodes.SERVER_ERROR, "註冊過程中發生錯誤。"));
  }
};

exports.signInPage = (req, res) => {
  res.render("admin/sign-in");
};

exports.signIn = async (req, res) => {
  const { username, password } = req.body;

  try {
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(404).json(createResponse(ResponseCodes.NOT_FOUND, "用戶名不存在"));
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json(createResponse(ResponseCodes.AUTH_ERROR, "密碼錯誤"));
    }

    if (admin.status === "pending") {
      return res.status(403).json(createResponse(ResponseCodes.PERMISSION_ERROR, "帳號審核中"));
    }

    if (admin.status === "banned") {
      return res.status(403).json(createResponse(ResponseCodes.PERMISSION_ERROR, "帳號已被封禁"));
    }

    req.session.username = username;
    req.session.permission = admin.permission;

    const signIn = new SignIn({ username });
    await signIn.save();

    res.status(200).json(createResponse(ResponseCodes.SUCCESS, "登入成功"));
  } catch (error) {
    console.error(error);
    res.status(500).json(createResponse(ResponseCodes.SERVER_ERROR, "登入過程中發生錯誤"));
  }
};

exports.dashboard = (req, res) => {
  res.render("admin/dashboard", { permission: req.session.permission });
};

exports.competition = (req, res) => {
  res.render("admin/competition");
};

exports.data = (req, res) => {
  res.render("admin/data");
};

exports.deletedData = (req, res) => {
  res.render("admin/deleted-data");
};

exports.score = (req, res) => {
  res.render("admin/score", { permission: req.session.permission });
};

exports.deletedScore = (req, res) => {
  res.render("admin/deleted-score");
};

exports.signInHistory = (req, res) => {
  res.render("admin/sign-in-history");
};

exports.activeUser = (req, res) => {
  res.render("admin/user/active-user");
};

exports.pendingUser = (req, res) => {
  res.render("admin/user/pending-user");
};

exports.bannedUser = (req, res) => {
  res.render("admin/user/banned-user");
};

exports.signOut = (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json(createResponse(ResponseCodes.SERVER_ERROR, "登出過程中發生錯誤"));
    }
    res.redirect("/admin/sign-in");
  });
};