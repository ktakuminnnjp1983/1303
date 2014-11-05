var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  // console.log(req.cookie);
  console.log(req.session);
  req.session.hoge = "boke";
  // console.log(req.signedCookies["testsess"]);

  res.render('index', { title: 'Express' });
});

module.exports = router;
