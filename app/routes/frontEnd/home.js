var express = require('express');
var router = express.Router();

const folderView = __path_views_blog + 'pages/home/';
const layoutBlog = __path_views_blog + 'frontend';

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render(`${folderView}index`,{
    layout:layoutBlog,
    top_post:true,
  });
});


module.exports = router;
