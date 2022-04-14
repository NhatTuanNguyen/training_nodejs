var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const pathConfig = require('./path');

const validator = require('express-validator');

// define path
global.__base = __dirname + '/';
global.__path_app = __base + pathConfig.folder_app + '/';
global.__path_configs = __path_app + pathConfig.folder_configs + '/';
global.__path_helpers = __path_app + pathConfig.folder_helpers + '/';
global.__path_routes = __path_app + pathConfig.folder_routes + '/';
global.__path_schemas = __path_app + pathConfig.folder_schemas + '/';
global.__path_validators = __path_app + pathConfig.folder_validators + '/';

global.__path_views = __path_app + pathConfig.folder_views + '/';
global.__path_views_admin = __path_views + pathConfig.folder_module_admin + '/';
global.__path_views_blog = __path_views + pathConfig.folder_module_blog + '/';

global.__path_models = __path_app + pathConfig.folder_models + '/';
global.folder_public = __base + pathConfig.folder_public + '/';
global.folder_uploads = folder_public + pathConfig.folder_uploads + '/';

var systemConfig = require(__path_configs + 'system');

var expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const flash = require('express-flash-notification');
const session = require('express-session');
var moment = require('moment');  


// connect mongodb
main().catch(err => console.log('err'));
async function main() {
  // await mongoose.connect('mongodb://localhost:27017/trainingNodejs');
  await mongoose.connect('mongodb+srv://nhattuannguyen12c6:nhattuan12c6@cluster0.t6pff.mongodb.net/trainingNodejs');
  console.log('connect success');
}



var app = express();
app.use(cookieParser());
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
}));
app.use(flash(app,{
  viewName:__path_views_admin + 'flash',
}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('layout', __path_views_admin + 'backend');

// app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.locals.systemConfig = systemConfig;
app.locals.moment = moment;

app.use('/', require(__path_routes + 'frontend/index'));
app.use(`/${systemConfig.prefixAdmin}`, require(__path_routes + 'backEnd/index'));


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render(__path_views_admin + 'pages/error',{pageTitle:'Page Not Found'});
});

module.exports = app;
