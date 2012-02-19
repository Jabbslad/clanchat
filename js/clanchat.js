$(document).ready(function() {
	var socket = io.connect('http://localhost');
				
	socket.on('connect', function(data) {
		if(typeof data != "undefined") {
			data.forEach(function(msg) {
				append(msg);
			});	
		}
	});
				
	socket.on('typing', function(typing) {
		$('#typing').text(typing.text);
	});
				
				
	socket.on('msg', function(msg) {
		append(msg);
	});
				
	$('#submit').click(function() {
		sumbitMsg();
	});
				
	var typing = false;
	$('#msg').keyup(function(e) {
		var len = $('#msg').val().trim().length;
		if (len > 0 && !typing || len == 0 && typing) {
			typing = !typing;
			socket.emit('typing', {typing: typing});
		}
	});
				
	$('#msg').keydown(function(e) {
		console.log(e);
		if(e.keyCode === 13) {
			sumbitMsg();
		}
	});
				
	function sumbitMsg () {
		var text = $('#msg').val().trim();
		if(text.length > 0) {
			var msg = {text: text};
			socket.emit('msg', msg, function() {
				append(msg);
				$('#msg').val("");
				typing = false;
				socket.emit('typing', {typing: typing});
			});
		}
	}
				
	function append (msg) {
		$('#chat').append('<li>' + msg.text + '</li>');
	}
});	
