var express = require('express');
var bodyParser     = require('body-parser');
var methodOverride = require('method-override');
var expressjwt = require('express-jwt');
var jwt = require('jsonwebtoken');
var multipart = require('connect-multiparty');
var path = require('path');
var fs = require('fs');
var gm = require('gm').subClass({ imageMagick: true });
var app = express();
var uploadDir = path.resolve(__dirname + '/../web/upload');
var multipartMiddleware = multipart({ uploadDir: uploadDir });

app.use(bodyParser()); // pull information from html in POST
app.use(methodOverride()); // simulate DELETE and PUT
app.use('/js', express.static(__dirname + '/../web/js'));
app.use('/css', express.static(__dirname + '/../web/css'));
app.use('/images', express.static(__dirname + '/../web/images'));
app.use('/fonts', express.static(__dirname + '/../web/fonts'));

var server = require('http').Server(app);

// Use for angular routing
app.get('/', function(req, res){
  var file = path.resolve(__dirname + '/../views/index.html');
  res.sendfile(file);
});

app.get('/partials/:name', function (req, res) {
  var file = path.resolve(__dirname + '/../views/partials/' + req.params.name );
  res.sendfile(file);
});

app.get('/usersList', markerList);

app.post('/save-point', markerSave);

app.post('/file-upload', multipartMiddleware, markerUpload);

app.post('/add-project', expressjwt({secret: secretToken}), addProject);

app.get('/projectList', expressjwt({secret: secretToken}), projectList);

//Logout
app.get('/user/logout', expressjwt({secret: secretToken}), logout);

//Login
app.post('/user/signin', signin);

//Create a new user
app.post('/user/register', register);

// redirect all others to the index (HTML5 history)
app.get('*', function(req, res){
});

server.listen(9595);
