var express = require('express');
var router = express.Router();


router.get('/', function(req, res, next) {
  res.render(__path_views_admin + 'pages/dashboard', { pageTitle: 'dashboard' });
});

module.exports = router;
