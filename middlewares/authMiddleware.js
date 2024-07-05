const Admin = require("../models/AdminModel");

exports.requireSignInMiddleware = async (req, res, next) => {
  try {
    if (req.session.username) {
      const { status } = await Admin.findOne({ username: req.session.username }, { status: 1 });
      if (status === "active") {
        return next();
      }
    }
    res.redirect("/admin/sign-in");
  } catch (error) {
    console.error("Error checking admin status:", error);
    res.redirect("/admin/sign-in");
  }
};

exports.requireManagerMiddleware = (req, res, next) => {
  if (req.session.permission === "manager") {
    return next();
  }
  res.json({ code: "1001", message: "您沒有足夠的權限進行此操作。", data: null });
};