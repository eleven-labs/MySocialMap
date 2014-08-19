var logout = function(req, res) {
    if (req.user) {
        delete req.user;
        return res.send(200);
    } else {
        return res.send(401);
    }
};

var signin = function(req, res) {
    var username = req.body.username || '';
    var password = req.body.password || '';

    if (username === '' || password === '') {
        return res.send(401);
    }

    userModel.findOne({username: username}, function (err, user) {
        if (err) {
            console.log(err);
            return res.send(401);
        }

        if (user === undefined) {
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
};

var register = function(req, res) {
    var username = req.body.username || '';
    var password = req.body.password || '';
    var passwordConfirmation = req.body.passwordConfirmation || '';

    if (username === '' || password === '' || password != passwordConfirmation) {
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
};
