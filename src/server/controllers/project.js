var addProject = function (req, res) {
    var project = new Project({
        name: req.body.name,
        username: req.body.username
    });

    project.save(function (err) {
      if (err) // ...
        console.log('meow');
    });
};

var projectList = function(req, res) {
    var username = req.query.username || '';

    Project.find({username: username}, function (err, projects) {
        var projectList = [];
        projects.forEach(function(project) {
            projectList.push(project);
        });

        res.json(200, {'data': projectList});
   });
};
