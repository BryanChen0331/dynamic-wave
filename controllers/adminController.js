exports.loginPage = (req, res) => {
  res.render("admin/login", { title: "Admin Login" });
};

exports.login = (req, res) => {
  const { username, password } = req.body;
  if (username === "admin" && password === "password") {
    req.session.username = "admin";
    res.redirect("/admin");
  } else {
    res.redirect("/admin/login");
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

exports.log = (req, res) => {
  res.render("admin/log", { title: "Score Submit Log" });
};

exports.logout = (req, res, next) => {
  req.session.destroy(err => {
    if (err) {
      return next(err);
    }
    res.redirect("/admin/login");
  });
};
