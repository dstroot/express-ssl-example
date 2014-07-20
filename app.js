/**
 * Module Dependencies
 */

var fs            = require('fs');                      // http://nodejs.org/docs/v0.10.25/api/fs.html
var path          = require('path');
var debug         = require('debug')('my-application');  // Added
var logger        = require('morgan');
var express       = require('express');
var favicon       = require('static-favicon');
var bodyParser    = require('body-parser');
var cookieParser  = require('cookie-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

/**
 * Create Express HTTPS (SSL) Server
 */

// Since our application has signup, login, etc. forms these should be protected
// with encryption.  We should be using SSL encryption so the data cannot be sniffed.
// In production, SSL termination is handled by Nodejitsu so we only need the SSL
// server for development/testing.

var credentials = {
  key: fs.readFileSync('sslkeys/privatekey.pem'),
  cert: fs.readFileSync('sslkeys/certificate.pem')
};

var sslserver = require('https').createServer(credentials, app);

/**
For reference here are the commands to create a self-signed certificate for
development purposes:

$ openssl genrsa -out privatekey.pem 1024
$ openssl req -new -key privatekey.pem -out certrequest.csr
$ openssl x509 -req -in certrequest.csr -signkey privatekey.pem -out certificate.pem
$ rm -rf certrequest.csr

NOTE: In the second command, when prompted for "Common Name (e.g. server FQDN or YOUR name) []:",
do *not* give your name. Enter your domain name. Probably "localhost" for development.
Not giving your domain name will result in "domain mismatch" errors.
*/

/**
 * Configure Express
 */

app.set('port', process.env.PORT || 3000);               // Added

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ 'extended': true }));
app.use(cookieParser());


app.use('/', routes);
app.use('/users', users);

// Static *after* routes
app.use(express.static(path.join(__dirname, 'public')));

/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

sslserver.listen(app.get('port'), function() {          // Added
  console.log('Express server listening on https://localhost:' + sslserver.address().port);
});

module.exports = app;
