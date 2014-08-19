var markerList = function(req, res) {
    var projectname = req.query.projectname || 'public';

    Img.find({projectname: projectname}, function (err, imgs) {
        var imgMap = [];
        imgs.forEach(function(img) {
            imgMap.push(img);
        });

        res.json(200, {'data': imgMap});
   });
};


var markerSave = function (req, res) {
    var img = new Img({
        latitude: req.body.latitude,
        longitude: req.body.longitude,
        icon: req.body.icon,
        real: req.body.real,
        username: req.body.username,
        projectname: req.body.projectname
    });

    img.save(function (err) {
      if (err) // ...
        console.log('meow');
    });
};

var markerUpload = function(req, res) {
    var tmp_path = req.files.file.path;
    var target_path = path.resolve(__dirname + '/../web/images/' + req.files.file.originalFilename);
    var resize_path = path.resolve(__dirname + '/../web/images/resize/' + req.files.file.originalFilename);

    fs.rename(tmp_path, target_path, function(err) {
        if (err) console.log(err);
        // delete the temporary file, so that the explicitly set temporary upload dir does not get filled with unwanted files
        fs.unlink(tmp_path, function() {
            if (err) throw err;

            gm(target_path)
                .resize(75, 75)
                .write(resize_path, function(err) {
                    if (!err) {
                        res.send(req.files.file.originalFilename);
                    } else {
                        console.log(err);
                    }
                });
        });
    });
};
