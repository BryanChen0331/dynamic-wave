const express = require('express');
const router = express.Router();

function checkSessionMiddleware(req, res, next) {
  console.log(req.session.username);
  if (req.session.username) {
    return next();
  }
  res.redirect('/admin/login');
}

router.get('/login', function(req, res, next) {
  res.render('admin/login', { title: 'Admin Login' });
});

router.post('/login', function(req, res, next) {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'password') {
    req.session.username = "admin";
    res.redirect('/admin');
  } else {
    res.redirect('/admin/login');
  }
});

router.get('/', checkSessionMiddleware, function(req, res, next) {
  res.render('admin/dashboard', { title: 'Admin Dashboard' });
});

router.get('/competition', checkSessionMiddleware, function(req, res, next) {
  res.render('admin/competition');
});

router.get('/data', checkSessionMiddleware, (req, res) => {
  res.render('admin/data');
});

router.get('/log', checkSessionMiddleware, function(req, res, next) {
  res.render('admin/log');
});

router.post('/logout', checkSessionMiddleware, function(req, res, next) {
  req.session.destroy(function(err) {
    if (err) {
      return next(err);
    }
    res.redirect('/admin/login');
  });
});

module.exports = router;
