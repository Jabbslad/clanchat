(function($) {
	window.Message = Backbone.Model.extend({});
	
	window.Messages = Backbone.Collection.extend({
		model: Message,
		url: window.location.href + 'msgs'
	});
	
	window.messages = new Messages();
	
	$(document).ready(function() {
		
		window.MessageView = Backbone.View.extend({
			template: _.template($('#message-template').html()),
			tagName: 'li',
			className: 'message',
			
			initialize: function() {
				_.bindAll(this, 'render');
			},
			
			render: function() {
				$(this.el).html(this.template(this.model.toJSON()));
				return this;
			}
		})
		
		window.MessagesListView = Backbone.View.extend({
			template: _.template($('#message-list-template').html()),
			
			initialize: function() {
				_.bindAll(this, 'render', 'addMessage');
				this.collection.on('reset', this.render);
				this.collection.on('add', this.addMessage);
			},
			
			render: function() {
				var $messages
				  , $this = this
				  , collection = this.collection;
				$(this.el).html(this.template({}));
				$messages = this.$('.messages');
				this.collection.each(function(message) {
					$this.addMessage(message);
				});
				return this;
			},
			
			addMessage: function(message) {
				$messages = this.$('.messages');
				var view = new MessageView({
					model: message,
					collection: this.collection
				});
				$messages.append(view.render().el);
				var objDiv = document.getElementById('messagearea');
				objDiv.scrollTop = objDiv.scrollHeight;
			}
		});
		
		window.ClanChat = Backbone.Router.extend({
			routes: {
				'': 'home'
			},
			
			initialize: function() {
				this.messagesListView = new MessagesListView({
					collection: window.messages
				})
			},
			
			home: function() {
				$('#messagearea').empty();
				$('#messagearea').append(this.messagesListView.render().el);
			}
		});
		
		window.App = new ClanChat();
		Backbone.history.start();
		
		var socket = io.connect('http://' + window.location.hostname);

		socket.on('typing', function(typing) {
			$('#typing').text(typing.text);
		});


		socket.on('msg', function(msg) {
			window.messages.add(new Message(msg));
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
			if(e.keyCode === 13) {
				sumbitMsg();
			}
		});

		function sumbitMsg () {
			var text = $('#msg').val().trim();
			if(text.length > 0) {
				var msg = {text: text, sent: new Date()};
				socket.emit('msg', msg, function() {
					window.messages.add(new Message(msg));
					$('#msg').val("");
					typing = false;
					socket.emit('typing', {typing: typing});
				});
			}
		}
	})
})(jQuery);
