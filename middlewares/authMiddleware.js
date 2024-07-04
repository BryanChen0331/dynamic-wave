const checkSessionMiddleware = (req, res, next) => {
  console.log(req.session.username);
  if (req.session.username) {
    return next();
  }
  res.redirect("/admin/sign-in");
};

module.exports = checkSessionMiddleware;