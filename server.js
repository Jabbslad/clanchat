var server = require('express').createServer()
  , io = require('socket.io').listen(server)
  , fs = require('fs')
  , util = require('util');

server.listen(8000);

msgs = [];

server.get('/*', function(req, res) {
	var filename = (req.url == '/' ? '/index.html' : req.url);
	var stream = fs.createReadStream(__dirname + filename, {
		'bufferSize': 4 * 1024
	});
	
	stream.on('open', function() {
		stream.pipe(res);
	});
	
	stream.on('error', function(err) {
		res.end('404: ' + req.url);
	});
});

io.sockets.on('connection', function(socket) {
	socket.emit('connect', msgs);
	
	socket.on('typing', function(msg) {
		var text;
		if(msg.typing) {
			text = socket.id + ' is typing...';
		} else {
			text = '';
		}
		var typing = {text: text}
		socket.broadcast.emit('typing', typing);
	});
	
	
	socket.on('msg', function(msg, cb) {
		msgs.push(msg);
		cb();
		socket.broadcast.emit('msg', msg);
	});
});


