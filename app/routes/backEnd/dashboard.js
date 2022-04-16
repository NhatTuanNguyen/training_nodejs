var express = require('express');
var router = express.Router();

const itemsModel = require(__path_models + 'items');

router.get('/',async function(req, res, next) {
  let countItems = 0;
  let params = {};
  params.objWhere = {};
  await itemsModel.countItems(params).then((data) => {
    countItems = data
  });
  res.render(__path_views_admin + 'pages/dashboard',{ 
    pageTitle: 'dashboard',
    countItems
  });
});

module.exports = router;
