const express = require('express');
const router = express.Router();

/* Admin login middleware */
function checkSessionMidleware(req, res, next) {
  console.log(req.session.username);
  if (req.session.username) {
    return next();
  }
  res.redirect('/admin/login');
}

/* GET admin login page. */
router.get('/login', function(req, res, next) {
  res.render('admin/login', { title: 'Admin Login' });
});

/* POST admin login page. */
router.post('/login', function(req, res, next) {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'password') {
    req.session.username = "admin";
    res.redirect('/admin');
  } else {
    res.redirect('/admin/login');
  }
});

/* Admin dashboard */
router.get('/', checkSessionMidleware, function(req, res, next) {
  res.render('admin/dashboard', { title: 'Admin Dashboard' });
});

/* GET competition page */
router.get('/competition', checkSessionMidleware, function(req, res, next) {
  res.render('admin/competition', { title: 'Competition' });
});

/* GET user query page */
router.get('/user-query', checkSessionMidleware, function(req, res, next) {
  res.render('admin/user-query', { title: 'User Query' });
});

module.exports = router;
