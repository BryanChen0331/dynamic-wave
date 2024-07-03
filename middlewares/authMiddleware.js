const checkSessionMiddleware = (req, res, next) => {
  console.log(req.session.username);
  if (req.session.username) {
    return next();
  }
  res.redirect("/admin/login");
};

module.exports = checkSessionMiddleware;