var mongoose = require('mongoose');
var SALT_WORK_FACTOR = 10;
mongoose.connect('mongodb://localhost/testtest');

// Schemas
var Schema = mongoose.Schema;

// This is point on marker
var imgSchema = new Schema({
    latitude:  String,
    longitude: String,
    icon:      String,
    real:      String,
    username:  String,
    projectname:  String
});

// User schema
var User = new Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    is_admin: { type: Boolean, default: false },
    created: { type: Date, default: Date.now }
});

// Project Schemas
var ProjectSchema = new Schema({
    username: { type: String, required: true },
    name: { type: String, required: true }
});

//Password verification
User.methods.comparePassword = function(password, cb) {
    if (password == this.password) {
        cb(true);
    } else {
        cb(false);
    }
};

// Define Models
var Img = mongoose.model('img', imgSchema);
var userModel = mongoose.model('User', User);
var Project = mongoose.model('Project', ProjectSchema);

