var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
let moment = require('moment');
let FUNC = require('./utils/functions');

var categoryRouter = require('./routes/category');
var productRouter = require('./routes/product');
var userRouter = require('./routes/users');
var loginRouter = require('./routes/login');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//middleware for see process of url
app.use(function (req, res, next) {
  //before url process
  let incomming = moment().format('YYYY-MM-DD HH:mm:ss') + ' incoming request uri :' + req.ip.split(':')[3] + ':' + req.socket.localPort + req.originalUrl;
  console.log(incomming);

  // processing url
  next();
});

/* authchecker */
app.use(FUNC.authChecker);

/* apis */
app.use('/', loginRouter);
app.use('/category', categoryRouter);
app.use('/product', productRouter);
app.use('/user', userRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
