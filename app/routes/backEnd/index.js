var express = require('express');
var router = express.Router();

router.use('/dashboard',require('./dashboard'));
router.use('/items',require('./items'));
router.use('/category',require('./category'));
router.use('/groups',require('./groups'));
router.use('/users',require('./users'));
router.use('/article',require('./article'));

module.exports = router;
