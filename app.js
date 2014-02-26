var http = require('http');
var path = require('path');
var logfmt = require('logfmt');
var express = require('express');
var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);

var users = [];
app.configure( function () {

		app.set('port', process.env.PORT || 3000);
		//parses request body and populates request.body
    app.use( express.bodyParser() );

		app.use(logfmt.requestLogger());
		
    //checks request.body for HTTP method overrides
    app.use( express.methodOverride() );

    //perform route lookup based on url and HTTP method
    app.use( app.router );

    //Show all errors in development
    app.use( express.errorHandler({ dumpExceptions: true, showStack: true }));	

		//Serve static files
		app.use(express.static(path.join(__dirname, 'public')));
});

app.get('/', function (req, res) {
	res.sendfile(__dirname + '/public/index.html');
});

io.sockets.on('connection', function (socket) {
	var updateUsers = function () {
		socket.emit('userlist', users);
		socket.broadcast.emit('userlist', users);
	};
	socket.on('join', function (name, callback) {
		if (!callback) return;
		var isNewUser = users.indexOf(name) === -1;
		if (isNewUser) {
			socket.nickname = name;
			users.push(socket.nickname);
			updateUsers();
			callback(true);
		} else {
			callback(false);
		}
	});
	socket.on('message', function (data) {
		var msgObj = {nickname: socket.nickname, message: data};
		socket.emit('new message', msgObj);
		socket.broadcast.emit('new message', msgObj);
	});
	socket.on('disconnect', function (data) {
		users.splice(users.indexOf(socket.nickname), 1);
		updateUsers();
	});
});

server.listen(app.get('port'), function () {
	console.log('Server listening on port ' + app.get('port'));
});
