require("dotenv").config();
const bcrypt = require("bcrypt");
const Admin = require("../models/AdminModel");
const SignIn = require("../models/SignInModel");

exports.signUpPage = (req, res) => {
  res.render("admin/sign-up");
};

exports.signUp = async (req, res) => {
  const { username, password } = req.body;

  if (username.length < 4) {
    return res.json({ code: "1001", message: "用戶名至少要有4個字元。", data: null });
  }

  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
  if (!passwordRegex.test(password)) {
    return res.json({ code: "1002", message: "密碼必須至少有8個字元，並包含英文字母和數字。", data: null });
  }

  try {
    const existingUser = await Admin.findOne({ username });
    if (existingUser) {
      return res.json({ code: "1003", message: "用戶名已被使用。", data: null });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const admin = new Admin({
      username,
      password: hashedPassword
    });

    await admin.save();

    res.json({ code: "0000", message: "註冊成功，請等待管理員審核。", data: null });
  } catch (error) {
    console.error(error);
    res.json({ code: "2001", message: "註冊過程中發生錯誤。", data: null });
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
      return res.json({ code: "1001", message: "用戶名不存在", data: null });
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.json({ code: "1002", message: "密碼錯誤", data: null });
    }

    if (admin.status === "pending") {
      return res.json({ code: "1003", message: "帳號審核中", data: null });
    }

    if (admin.status === "banned") {
      return res.json({ code: "1004", message: "帳號已被封禁", data: null });
    }

    req.session.username = username;
    req.session.permission = admin.permission;

    const signIn = new SignIn({ username });
    await signIn.save();

    res.json({ code: "0000", message: "登入成功", data: null });
  } catch (error) {
    console.error(error);
    res.json({ code: "2001", message: "登入過程中發生錯誤", data: null });
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

exports.signOut = (req, res, next) => {
  req.session.destroy(err => {
    if (err) {
      return next(err);
    }
    res.redirect("/admin/sign-in");
  });
};
