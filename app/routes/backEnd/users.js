var express = require('express');

const { body, validationResult } = require('express-validator');
var router = express.Router();

const util = require('util');
var usersModel = require(__path_models + 'users');
var groupsModel = require(__path_models + 'groups');
const validatorUsers = require(__path_validators + 'users');
const ultilsHelper = require(__path_helpers + 'ultils');
const paramsHelper = require(__path_helpers + 'Params');
const fileHelper = require(__path_helpers + 'file');
var systemConfig = require(__path_configs + 'system');
var notify = require(__path_configs + 'notify');
let linkIndex = `/${systemConfig.prefixAdmin}/users`;

const pageTitleIndex = 'Users Management';
const pageTitleAdd = pageTitleIndex + ' - Add';
const pageTitleEdit = pageTitleIndex + ' - Edit';
const folderView = __path_views + 'pages/users/';
uploadAvatar = fileHelper.upload('avatar');

/* GET users listing. */
router.get('(/status/:status)?', async (req, res, next) => {

  let params = {};
  params.keyword = paramsHelper.getParams(req.query, 'keyword', "");
  params.currentStatus = paramsHelper.getParams(req.params, 'status', 'all');
  let statusFilter = await ultilsHelper.createFilterStatus(params.currentStatus, 'users');
  params.sortField = paramsHelper.getParams(req.session, 'sort_field', 'ordering');
  params.sortType = paramsHelper.getParams(req.session, 'sort_type', 'asc');
  params.groupId = paramsHelper.getParams(req.session, 'group_id', 'novalue');

  params.paginations = {
    totalItems: 1,
    totalItemPerPage: 5,
    currentPage: 1,
    pageRanges: 3,
  };


  await groupsModel.listItemsInSelecbox().then((items) => {
    params.groupItems = items;
    params.groupItems.unshift({ _id: '', name: 'All group' })
  });

  params.paginations.currentPage = parseInt(paramsHelper.getParams(req.query, 'page', 1));

  await usersModel.countItems(params).then((data) => {
    params.paginations.totalItems = data
  });

  usersModel.listItems(params)
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

  usersModel.changeStatus(currentStatus, id).then(() => {
    req.flash('success', notify.CHANGE_STATUS_SUCCESS, false);
    res.redirect(linkIndex);
  });
});

// change multiple status
router.post('/changeStatus/:status', function (req, res, next) {
  let currentStatus = paramsHelper.getParams(req.params, 'status', 'active');

  usersModel.changeStatus(currentStatus, req.body.cid, 'updateMutiple').then((result) => {
    req.flash('success', util.format(notify.CHANGE_STATUS_MULTI_SUCCESS, result.matchedCount), false);
    res.redirect(linkIndex);
  });
});

// delete
router.get('/delete/:id', function (req, res, next) {
  let id = paramsHelper.getParams(req.params, 'id', '');

  usersModel.deleteItems(id).then(() => {
    req.flash('success', notify.DELETE_SUCCESS, false);
    res.redirect(linkIndex);
  });
});

// delete multiple users
router.post('/delete', function (req, res, next) {
  usersModel.deleteItems(req.body.cid, 'deleteMutiple').then(() => {
    req.flash('success', notify.DELETE_MULTI_SUCCESS, false);
    res.redirect(linkIndex);
  });
});

// change ordering
router.post('/changeOrdering', function (req, res, next) {
  let cids = req.body.cid;
  let orderings = req.body.ordering;

  usersModel.changeOrdering(orderings, cids).then(() => {
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
  await groupsModel.listItemsInSelecbox().then((items) => {
    params.groupItems = items;
    params.groupItems.unshift({ _id: '', name: 'Choose group' })
  });

  if (id === '') {//ADD
    res.render(`${folderView}form`, { pageTitle: pageTitleAdd, item, errors, params });
  } else {//EDIT
    usersModel.getItems(id).then((item) => {
      item.group_id = item.group.id;
      item.group_name = item.group.name;
      res.render(`${folderView}form`, { pageTitle: pageTitleEdit, item, errors, params });
    });
  }
});

// Save
router.post('/save',
  (req, res, next) => {
    uploadAvatar(req, res, async function (err) {
      const errors = validationResult(req);
      // console.log('err '+err);
      let item = Object.assign(req.body);
      let taskCurrent = (typeof item !== 'undefined' && item.id !== "") ? 'edit' : 'add';

      if (err) {
        if (err.code == 'LIMIT_FILE_SIZE') err = notify.ERROR_FILE_LIMIT
        errors.errors.push({ param: 'avatar', msg: err });
      } else if (req.file == undefined && taskCurrent == 'add') {
        errors.errors.push({ param: 'avatar', msg: notify.ERROR_FILE_REQUIRE });
      }
      // console.log(req.body);
      // console.log(errors.errors);
      let params = {};

      if (errors.isEmpty()) {
        let message = taskCurrent == 'add' ? notify.ADD_SUCCESS : notify.EDIT_SUCCESS;
        if (req.file == undefined) {
          item.avatar = item.image_old;
        } else {
          item.avatar = req.file.filename;
          if(taskCurrent == 'edit') {
            fileHelper.remove('public/uploads/users/',item.image_old);
          }
        }
        usersModel.saveItems(item, taskCurrent).then(() => {
          req.flash('success', message, false);
          res.redirect(linkIndex);
        });
      } else {
        let pageTitle = taskCurrent == 'add' ? pageTitleAdd : pageTitleEdit;
        await groupsModel.listItemsInSelecbox().then((items) => {
          params.groupItems = items;
          params.groupItems.unshift({ _id: '', name: 'All group' });
        });
        if (taskCurrent == 'edit') item.avatar = item.image_old;
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
router.get('/filter-group/:group_id', function (req, res, next) {
  req.session.group_id = paramsHelper.getParams(req.params, 'group_id', '');

  res.redirect(linkIndex);
});

module.exports = router;
