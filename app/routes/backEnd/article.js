var express = require('express');

const { body, validationResult } = require('express-validator');
var router = express.Router();

const util = require('util');
var articleModel = require(__path_models + 'article');
var categoryModel = require(__path_models + 'category');
const validatorArticle = require(__path_validators + 'article');
const ultilsHelper = require(__path_helpers + 'ultils');
const paramsHelper = require(__path_helpers + 'Params');
const fileHelper = require(__path_helpers + 'file');
var systemConfig = require(__path_configs + 'system');
var notify = require(__path_configs + 'notify');
let linkIndex = `/${systemConfig.prefixAdmin}/article`;

const pageTitleIndex = 'Article Management';
const pageTitleAdd = pageTitleIndex + ' - Add';
const pageTitleEdit = pageTitleIndex + ' - Edit';
const folderView = __path_views_admin + 'pages/article/';
uploadThumb = fileHelper.upload('thumb','article');

/* GET article listing. */
router.get('(/status/:status)?', async (req, res, next) => {

  let params = {};
  params.keyword = paramsHelper.getParams(req.query, 'keyword', "");
  params.currentStatus = paramsHelper.getParams(req.params, 'status', 'all');
  let statusFilter = await ultilsHelper.createFilterStatus(params.currentStatus, 'article');
  params.sortField = paramsHelper.getParams(req.session, 'sort_field', 'ordering');
  params.sortType = paramsHelper.getParams(req.session, 'sort_type', 'asc');
  params.categoryId = paramsHelper.getParams(req.session, 'category_id', 'novalue');

  params.paginations = {
    totalItems: 1,
    totalItemPerPage: 5,
    currentPage: 1,
    pageRanges: 3,
  };


  await categoryModel.listItemsInSelecbox().then((items) => {
    params.categoryItems = items;
    params.categoryItems.unshift({ _id: '', name: 'All category' })
  });

  params.paginations.currentPage = parseInt(paramsHelper.getParams(req.query, 'page', 1));

  await articleModel.countItems(params).then((data) => {
    params.paginations.totalItems = data
  });

  articleModel.listItems(params)
    .then((items) => {
      res.render(`${folderView}list`, {
        pageTitle: pageTitleIndex,
        items: items,
        statusFilter: statusFilter,
        params
      });
    });

});

// change status
router.get('/changeStatus/:id/:status', function (req, res, next) {
  let currentStatus = paramsHelper.getParams(req.params, 'status', 'active');
  let id = paramsHelper.getParams(req.params, 'id', '');

  articleModel.changeStatus(currentStatus, id).then(() => {
    req.flash('success', notify.CHANGE_STATUS_SUCCESS, false);
    res.redirect(linkIndex);
  });
});

// change multiple status
router.post('/changeStatus/:status', function (req, res, next) {
  let currentStatus = paramsHelper.getParams(req.params, 'status', 'active');

  articleModel.changeStatus(currentStatus, req.body.cid, 'updateMutiple').then((result) => {
    req.flash('success', util.format(notify.CHANGE_STATUS_MULTI_SUCCESS, result.matchedCount), false);
    res.redirect(linkIndex);
  });
});

// delete
router.get('/delete/:id', function (req, res, next) {
  let id = paramsHelper.getParams(req.params, 'id', '');

  articleModel.deleteItems(id).then(() => {
    req.flash('success', notify.DELETE_SUCCESS, false);
    res.redirect(linkIndex);
  });
});

// delete multiple article
router.post('/delete', function (req, res, next) {
  articleModel.deleteItems(req.body.cid, 'deleteMutiple').then(() => {
    req.flash('success', notify.DELETE_MULTI_SUCCESS, false);
    res.redirect(linkIndex);
  });
});

// change ordering
router.post('/changeOrdering', function (req, res, next) {
  let cids = req.body.cid;
  let orderings = req.body.ordering;

  articleModel.changeOrdering(orderings, cids).then(() => {
    req.flash('success', notify.CHANGE_ORDERING, false);
    res.redirect(linkIndex);
  });
});

// Form
router.get('/form(/:id)?', async function (req, res, next) {
  let id = paramsHelper.getParams(req.params, 'id', '');
  let item = { name: '', ordering: 0, status: 'novalue' };
  let errors = null;
  let params = {};
  await categoryModel.listItemsInSelecbox().then((items) => {
    params.categoryItems = items;
    params.categoryItems.unshift({ _id: '', name: 'Choose category' })
  });

  if (id === '') {//ADD
    res.render(`${folderView}form`, { pageTitle: pageTitleAdd, item, errors, params });
  } else {//EDIT
    articleModel.getItems(id).then((item) => {
      item.category_id = item.category.id;
      item.category_name = item.category.name;
      res.render(`${folderView}form`, { pageTitle: pageTitleEdit, item, errors, params });
    });
  }
});

// Save
router.post('/save',
  // validatorArticle.validator(),
  (req, res, next) => {
    uploadThumb(req, res, async function (err) {
      const errors = validationResult(req);
      // console.log('err '+err);
      let item = Object.assign(req.body);
      let taskCurrent = (typeof item !== 'undefined' && item.id !== "") ? 'edit' : 'add';

      if (err) {
        if (err.code == 'LIMIT_FILE_SIZE') err = notify.ERROR_FILE_LIMIT
        errors.errors.push({ param: 'thumb', msg: err });
      } else if (req.file == undefined && taskCurrent == 'add') {
        errors.errors.push({ param: 'thumb', msg: notify.ERROR_FILE_REQUIRE });
      }
      // console.log(req.body);
      // console.log(errors.errors);
      let params = {};

      if (errors.isEmpty()) {
        let message = taskCurrent == 'add' ? notify.ADD_SUCCESS : notify.EDIT_SUCCESS;
        if (req.file == undefined) {
          item.thumb = item.image_old;
        } else {
          item.thumb = req.file.filename;
          if(taskCurrent == 'edit') {
            fileHelper.remove('public/uploads/article/',item.image_old);
          }
        }
        articleModel.saveItems(item, taskCurrent).then(() => {
          req.flash('success', message, false);
          res.redirect(linkIndex);
        });
      } else {
        let pageTitle = taskCurrent == 'add' ? pageTitleAdd : pageTitleEdit;
        await categoryModel.listItemsInSelecbox().then((items) => {
          params.categoryItems = items;
          params.categoryItems.unshift({ _id: '', name: 'All category' });
        });
        if (taskCurrent == 'edit') item.thumb = item.image_old;
        res.render(`${folderView}form`, { pageTitle: pageTitle, params, item, errors });
      }
    })

  });

// Sort
router.get('/sort/:sort_field/:sort_type', function (req, res, next) {
  req.session.sort_field = paramsHelper.getParams(req.params, 'sort_field', 'ordering');
  req.session.sort_type = paramsHelper.getParams(req.params, 'sort_type', 'asc');

  res.redirect(linkIndex);
});

// Filter
router.get('/filter-category/:category_id', function (req, res, next) {
  req.session.category_id = paramsHelper.getParams(req.params, 'category_id', '');

  res.redirect(linkIndex);
});

module.exports = router;
