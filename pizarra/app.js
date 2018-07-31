var aplicacion = require('http').createServer(controlador);
var	socketio = require('socket.io').listen(aplicacion);
var nodejsstatic = require('node-static');

var ServidorFicheros = new nodejsstatic.Server('public/');

aplicacion.listen(8080);

function controlador (req, res) {
	req.addListener('end', function () {
        ServidorFicheros.serve(req, res);
    });
    req.resume();
}
socketio.set('log level', 1);

socketio.sockets.on('connection', function (socket) {
	socket.on('mousemove', function (data) {
		socket.broadcast.emit('moving', data);
	});
});