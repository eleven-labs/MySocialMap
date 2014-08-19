var io = require('socket.io')(server);

//Socket IO
io.sockets.on('connection', function (socket) {
    socket.on('upload', function (data) {
        io.sockets.emit('update-markers', {id: data.id, lat: data.lat, lon: data.lon, icon: data.icon, username: data.username, real: data.real });
    });
});