var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  console.log("##### root access #####");
  console.log(req.session.hoge);
  console.log(req.signedCookies);

  res.render('index', { title: 'Express' });
});

module.exports = router;
