require("dotenv").config();
const bcrypt = require("bcrypt");
const Admin = require("../models/AdminModel");
const Login = require("../models/LoginModel");

exports.signUpPage = (req, res) => {
  res.render("admin/sign-up", { title: "Admin Signup" });
};

exports.signUp = async (req, res) => {
  const { username, password } = req.body;

  if (username.length < 4) {
    return res.status(400).json({ message: "Username must be at least 4 characters long." });
  }

  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({ message: "Password must be at least 8 characters long and contain both letters and numbers." });
  }

  try {
    const existingUser = await Admin.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username is already taken." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const admin = new Admin({
      username,
      password: hashedPassword
    });

    await admin.save();

    res.redirect("/admin/sign-in");
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.signInPage = (req, res) => {
  res.render("admin/sign-in", { title: "Admin Login" });
};

exports.signIn = async (req, res) => {
  const { username, password } = req.body;

  try {
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(400).json({ message: "Username or password is incorrect." });
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Username or password is incorrect." });
    }

    req.session.username = username;

    const login = new Login({ username });
    await login.save();

    res.redirect("/admin");
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred during the sign-in process." });
  }
};

exports.dashboard = (req, res) => {
  res.render("admin/dashboard", { title: "Admin Dashboard" });
};

exports.competition = (req, res) => {
  res.render("admin/competition", { title: "Competition Form" });
};

exports.data = (req, res) => {
  res.render("admin/data", { title: "User Data" });
};

exports.score = (req, res) => {
  res.render("admin/score", { title: "Score Submit Log" });
};

exports.signInHistory = (req, res) => {
  res.render("admin/sign-in-history", { title: "Signin History" });
};

exports.signOut = (req, res, next) => {
  req.session.destroy(err => {
    if (err) {
      return next(err);
    }
    res.redirect("/admin/sign-in");
  });
};
