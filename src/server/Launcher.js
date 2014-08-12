var express = require('express');
var bodyParser     = require('body-parser');
var methodOverride = require('method-override');
var expressjwt = require('express-jwt');
var jwt = require('jsonwebtoken');
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
var SALT_WORK_FACTOR = 10;
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
// User schema
var User = new Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    is_admin: { type: Boolean, default: false },
    created: { type: Date, default: Date.now }
});


//Password verification
User.methods.comparePassword = function(password, cb) {
    if (password == this.password) {
        cb(true);
    } else {
        cb(false);
    }
};

var Img = mongoose.model('img', imgSchema);
var userModel = mongoose.model('User', User);

//Socket IO
io.sockets.on('connection', function (socket) {
    socket.on('upload', function (data) {
        io.sockets.emit('update-markers', {id: data.id, lat: data.lat, lon: data.lon, icon: data.icon });
    });
});

var secretToken = 'aMdoeb5ed87zorRdkD6greDML81DcnrzeSD648ferFejmplx';

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

app.post('/save-point', expressjwt({secret: secretToken}), function (req, res) {
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

app.post('/file-upload', expressjwt({secret: secretToken}), multipartMiddleware, function(req, res) {
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

//Logout
app.get('/user/logout', expressjwt({secret: secretToken}), function(req, res) {
    if (req.user) {
        delete req.user;
        return res.send(200);
    } else {
        return res.send(401);
    }
});

//Login
app.post('/user/signin', function(req, res) { 
    var username = req.body.username || '';
    var password = req.body.password || '';
    
    if (username == '' || password == '') { 
        return res.send(401); 
    }

    userModel.findOne({username: username}, function (err, user) {
        if (err) {
            console.log(err);
            return res.send(401);
        }

        if (user == undefined) {
            return res.send(401);
        }
        
        user.comparePassword(password, function(isMatch) {
            if (!isMatch) {
                console.log("Attempt failed to login with " + user.username + ' ' + isMatch);
                return res.send(401);
            }

            var token = jwt.sign({id: user._id}, secretToken, { expiresInMinutes: 60 });
            
            return res.json({token:token});
        });

    });
}); 

//Create a new user
app.post('/user/register', function(req, res) {
    var username = req.body.username || '';
    var password = req.body.password || '';
    var passwordConfirmation = req.body.passwordConfirmation || '';

    if (username == '' || password == '' || password != passwordConfirmation) {
        return res.send(400);
    }

    var user = new userModel();
    user.username = username;
    user.password = password;

    user.save(function(err) {
        if (err) {
            console.log(err);
            return res.send(500);
        }   
        
        userModel.count(function(err, counter) {
            if (err) {
                console.log(err);
                return res.send(500);
            }

            if (counter == 1) {
                userModel.update({username:user.username}, {is_admin:true}, function(err, nbRow) {
                    if (err) {
                        console.log(err);
                        return res.send(500);
                    }

                    console.log('First user created as an Admin');
                    return res.send(200);
                });
            } 
            else {
                return res.send(200);
            }
        });
    });
}); 

// redirect all others to the index (HTML5 history)
app.get('*', function(req, res){
});

server.listen(9595);