jQuery(function ($) {
	
	var Chatter = {
		init: function () {
			//Establish socket connection
			this.socket = io.connect();
			this.sound = {
				onMsg: new Audio("../sounds/beep.mp3")
			};
			this.isWindowFocused = true;
			this.isUserJoined = false;
			this.cacheElements();
			this.bindEvents();
		},
		cacheElements: function () {
			this.$window = $(window);
			this.$joinBox = $('#join-box');
			this.$joinForm = this.$joinBox.find('#join-form');
			this.$nickInput = this.$joinBox.find('#nick-input');
			this.$infoBox = this.$joinBox.find('#info-box');

			this.$chatter = $('#chatter');
			this.$userList = this.$chatter.find('#user-list');
			this.$messagesBox = this.$chatter.find('#messages-box');
			this.$messageForm = this.$chatter.find('#message-form');
			this.$msgInput = this.$chatter.find('#msg-input');

		},
		bindEvents: function () {
			this.$window.on('focus', function () {Chatter.isWindowFocused = true;console.log('focused'+Chatter.isWindowFocused);});
			this.$window.on('blur', function () {Chatter.isWindowFocused = false;console.log('focused'+Chatter.isWindowFocused);});
			this.$joinForm.on('submit', this.joinChat);
			this.$messageForm.on('submit', this.sendMessage);

			this.socket.on('new message', this.insertMessage);
			this.socket.on('userlist', this.updateUserList);
		},
		joinChat: function (e) {
			e.preventDefault();	
			var nickname = Chatter.$nickInput.val();
			if (nickname.length > 2) {
				Chatter.socket.emit('join', nickname, function (joined) {
					if (joined) {
						Chatter.isUserJoined = joined;
						Chatter.$nickInput.val('');
						Chatter.$joinForm.removeClass('has-error');
						Chatter.$infoBox.text('');
						Chatter.$joinBox.hide();
						Chatter.$chatter.show();
						Chatter.$messagesBox.text('');
					} else {
						Chatter.$joinForm.addClass('has-error');
						Chatter.$infoBox.text('The nickname is already in use');
					}
				});
			} else {
				Chatter.$joinForm.addClass('has-error');
				Chatter.$infoBox.text('Choose a nickname with at least 3 character');
			}	
		},
		sendMessage: function (e) {
			e.preventDefault();
			var msg = Chatter.$msgInput.val();
			if(msg.length > 0) {
				Chatter.socket.emit('message', msg);
				Chatter.$msgInput.val('');
			}
		},
		insertMessage: function (data) {

			var $newMsg = $('<li class="user-message"><b>' + data.nickname + 
											':</b>' + data.message + '</li>');		
			Chatter.$messagesBox.append($newMsg);
			$newMsg[0].scrollIntoView();

			//Play a sound if the window is not focused
			if (!Chatter.isWindowFocused && Chatter.isUserJoined) {
				Chatter.sound.onMsg.play();
			}
		},
		updateUserList: function (data) {
			console.log("User list from server:\n");
			console.log(data);
			Chatter.$userList.text('');
			for ( var i = 0; i < data.length; i++ ) {
				Chatter.$userList.append('<li class="user-nickname ist-group-item"><b>' +
																	data[i] + '</b></li>');
			}
		}
	};
	Chatter.init();
});

