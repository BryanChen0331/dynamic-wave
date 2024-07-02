var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render("home");
});

router.get("/game", (resq, res) => {
  res.render("game");
})

module.exports = router;
