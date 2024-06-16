var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  // res.render('index', { title: 'Express' });
  res.redirect("/game");
});

router.get("/game", (resq, res) => {
  res.render("game");
})

module.exports = router;
