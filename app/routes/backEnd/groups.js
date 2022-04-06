var express = require('express');
const { body, validationResult } = require('express-validator');
var router = express.Router();
const util = require('util');
var groupsModel = require(__path_models + 'groups');
var usersModel = require(__path_models + 'users');
const validatorGroups = require(__path_validators + 'groups');
const ultilsHelper = require(__path_helpers + 'ultils');
const paramsHelper = require(__path_helpers + 'Params');
var systemConfig = require(__path_configs + 'system');
var notify = require(__path_configs + 'notify');
let linkIndex = `/${systemConfig.prefixAdmin}/groups`;

const pageTitleIndex = 'Groups Management';
const pageTitleAdd = pageTitleIndex + ' - Add';
const pageTitleEdit = pageTitleIndex + ' - Edit';
const folderView = __path_views + 'pages/groups/'

/* GET users listing. */
router.get('(/status/:status)?', async (req, res, next) => {

  let params = {};
  params.keyword = paramsHelper.getParams(req.query, 'keyword', "");
  params.currentStatus = paramsHelper.getParams(req.params, 'status', 'all');
  let statusFilter = await ultilsHelper.createFilterStatus(params.currentStatus, 'groups');
  params.sortField = paramsHelper.getParams(req.session, 'sort_field', 'ordering');
  params.sortType = paramsHelper.getParams(req.session, 'sort_type', 'asc');

  params.paginations = {
    totalItems: 1,
    totalItemPerPage: 5,
    currentPage: 1,
    pageRanges: 3,
  };

  params.paginations.currentPage = parseInt(paramsHelper.getParams(req.query, 'page', 1));

  await groupsModel.countItems(params).then((data) => {
    params.paginations.totalItems = data
  });

  groupsModel.listItems(params)
  .then((items) => {
    res.render(`${folderView}list`, {
      pageTitle: 'pageTitleIndex',
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
 
  groupsModel.changeStatus(currentStatus, id).then(() => {
    req.flash('success', notify.CHANGE_STATUS_SUCCESS, false);
    res.redirect(linkIndex);
  });
});

// change GroupAcp
router.get('/changeGroupAcp/:id/:group_acp', function (req, res, next) {
  let currentGroupAcp = paramsHelper.getParams(req.params, 'group_acp', 'yes');
  let id = paramsHelper.getParams(req.params, 'id', '');

  groupsModel.changeGroupAcp(currentGroupAcp,id).then(()=> {
    req.flash('success', notify.CHANGE_GROUPACP_SUCCESS, false);
    res.redirect(linkIndex);
  });
});

// change multiple status
router.post('/changeStatus/:status', function (req, res, next) {
  let currentStatus = paramsHelper.getParams(req.params, 'status', 'active');

  groupsModel.changeStatus(currentStatus, req.body.cid, 'updateMutiple').then((result) => {
    req.flash('success', util.format(notify.CHANGE_STATUS_MULTI_SUCCESS, result.matchedCount), false);
    res.redirect(linkIndex);
  });
});

// delete
router.get('/delete/:id', function (req, res, next) {
  let id = paramsHelper.getParams(req.params, 'id', '');

  groupsModel.deleteItems(id).then(() => {
    req.flash('success', notify.DELETE_SUCCESS, false);
    res.redirect(linkIndex);
  });
});

// delete multiple groups
router.post('/delete', function (req, res, next) {
  groupsModel.deleteItems(req.body.cid, 'deleteMutiple').then(() => {
    req.flash('success', notify.DELETE_MULTI_SUCCESS, false);
    res.redirect(linkIndex);
  });
});

// change ordering
router.post('/changeOrdering', function (req, res, next) {
  let cids = req.body.cid;
  let orderings = req.body.ordering;

  groupsModel.changeOrdering(orderings, cids).then(() => {
    req.flash('success', notify.CHANGE_ORDERING, false);
    res.redirect(linkIndex);
  });
});

// Form
router.get('/form(/:id)?', function (req, res, next) {
  let id = paramsHelper.getParams(req.params, 'id', '');
  let item = { name: '', ordering: 1, status: 'novalue' };
  let errors = null;

  if (id === '') {//ADD
    res.render(`${folderView}form`, { pageTitle: pageTitleAdd, item, errors });
  } else {//EDIT
    groupsModel.getItems(id).then((item) => {
      res.render(`${folderView}form`, { pageTitle: pageTitleEdit, item, errors });
    });
  }
});

// Save
router.post('/save',validatorGroups.validator(),
  (req, res, next) => {
    const errors = validationResult(req);
    let item = Object.assign(req.body);
    let taskCurrent = (typeof item !== 'undefined' && item.id !== "") ? 'edit':'add';

    if (errors.isEmpty()) {
      let message = taskCurrent == 'add' ? notify.ADD_SUCCESS:notify.EDIT_SUCCESS;
      groupsModel.saveItems(item, taskCurrent).then(() => {
        if (taskCurrent == 'add') {
          req.flash('success', message, false);
          res.redirect(linkIndex);
        } else {
          usersModel.saveItems(item, 'changeGroupName').then(() => {
            req.flash('success', notify.EDIT_SUCCESS, false);
            res.redirect(linkIndex);
          });
        }
      });
    } else {
      let pageTitle = taskCurrent == 'add' ? pageTitleAdd:pageTitleEdit;
      res.render(`${folderView}form`, { pageTitle: pageTitle, item, errors });
    }
});

router.get('/sort/:sort_field/:sort_type', function (req, res, next) {
  req.session.sort_field = paramsHelper.getParams(req.params, 'sort_field', 'ordering');
  req.session.sort_type = paramsHelper.getParams(req.params, 'sort_type', 'asc');

  res.redirect(linkIndex);
});

module.exports = router;
