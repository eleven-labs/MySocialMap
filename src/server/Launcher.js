var express = require('express');
var bodyParser     = require('body-parser');
var methodOverride = require('method-override');
var multipart = require('connect-multiparty');
var mongoose = require('mongoose');
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
var io = require('socket.io')(server);
mongoose.connect('mongodb://localhost/testtest');
// Schemas
var Schema = mongoose.Schema;
var imgSchema = new Schema({
    latitude:  String,
    longitude: String,
    icon:      String
});
var Img = mongoose.model('img', imgSchema);

//Socket IO
io.sockets.on('connection', function (socket) {
    socket.on('upload', function (data) {
        io.sockets.emit('update-markers', {id: data.id, lat: data.lat, lon: data.lon, icon: data.icon });
    });
});

// Use for angular routing
app.get('/', function(req, res){
  var file = path.resolve(__dirname + '/../views/index.html');
  res.sendfile(file);
});

app.get('/partials/:name', function (req, res) {
  var file = path.resolve(__dirname + '/../views/partials/' + req.params.name );
  res.sendfile(file);
});

app.get('/usersList', function(req, res) {
    Img.find({}, function (err, imgs) {
        var imgMap = [];
        imgs.forEach(function(img) {
            imgMap.push(img);
        });
        
        res.json(200, {'data': imgMap});
   });
});

app.post('/save-point', function (req, res) {
    var img = new Img({ 
        latitude: req.body.latitude,
        longitude: req.body.longitude,
        icon: req.body.icon
    });

    img.save(function (err) {
      if (err) // ...
        console.log('meow');
    });
});

app.post('/file-upload', multipartMiddleware, function(req, res) {
    var tmp_path = req.files.file.path;
    var target_path = path.resolve(__dirname + '/../web/images/' + req.files.file.originalFilename);

    fs.rename(tmp_path, target_path, function(err) {
        if (err) console.log(err);
        // delete the temporary file, so that the explicitly set temporary upload dir does not get filled with unwanted files
        fs.unlink(tmp_path, function() {
            if (err) throw err;

            gm(target_path)
                .resize(75, 75)
                .write(target_path, function(err) {
                    if (!err) {
                        res.send(req.files.file.originalFilename);
                    } else {
                        console.log(err);
                    }
                });
        });
    });
});

// redirect all others to the index (HTML5 history)
app.get('*', function(req, res){
});

server.listen(9595);