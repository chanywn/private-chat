// 默认没有名字
var name = false;
var socket;
// 要求写一个名字
smalltalk.prompt('身份验证', '你的名字?', '').then(function(name) {
	socket = io.connect('ws://127.0.0.1:3000');
	$('h1').text(name);

	// 正在连接
	socket.on('connecting', function () {
		console.log('connecting');
	});

	// 连接上
	socket.on('connect', function () {
		console.log('connect');
		// 请求加入
		if(name){
			socket.emit('new user', name);
		}
	});

	// 第一次登陆接收其它成员信息
	socket.on('login', function (user) {
		if(user.length>=1){
			for(var i =0;i<user.length;i++){
				incomeHtml(user[i],'src/img/head.jpg');
			}
		}
	});
	// 监听中途的成员加入
	socket.on('user joined', function (tname, index) {
		incomeHtml(tname,'src/img/head.jpg');
		console.log(tname+'加入');
		showNotice('src/img/head.jpg',tname,"上线了");
	});
	// 接收私聊信息
	socket.on('receive private message', function (data) {
		$('#ding')[0].play();
		if(data.addresser == data.recipient) return;
		var head = 'src/img/head.jpg';
		$('#'+hex_md5(data.addresser)+' .chat-msg').append('<li><img src="'+head+'"><span class="speak">'+data.body+'</span></li>');
		if(document.hidden){
			showNotice(head,data.addresser,data.body);
		}
		scrollToBottom(hex_md5(data.addresser));
	});
	// 监听中途的成员离开
	socket.on('user left', function (data) {
		console.log(data+'离开');
		$('#'+hex_md5(data)).remove();
		$('#li'+hex_md5(data)).remove();
	});

	// 连接失败
	socket.on('disconnect', function () {
		$('.outline').css('display','block');
		$('#session').children().remove();
		$('#chat').children().remove();
		console.log('you have been disconnected');
	});

	// 重连
	socket.on('reconnect', function () {
		console.log('you have been reconnected');
		$('.outline').css('display','none');
		//继续用原来的name todo
	});

	// 监听重连错误 会多次尝试
	socket.on('reconnect_error', function () {
		console.log('attempt to reconnect has failed');
	});

	//sendMessage
	$(document).on('click','.chat-active .send',function(){
		var recipient = $('.chat-active').attr('data-n');
		var val = $('.chat-active input').val();
		if(val == '') return;
		sendMessage('src/img/head.jpg',val);
		//call
		var req = {
			'addresser':name,
			'recipient':recipient,
			'type':'plain',
			'body':val
		}
		socket.emit('send private message', req);
		$('.chat-active input').val('');
		scrollToBottom(hex_md5(recipient));
	});

	document.onkeydown = function(e){ 
	    if(e && e.keyCode == 13) {
			var recipient = $('.chat-active').attr('data-n');
			var val = $('.chat-active input').val();
			if(val == '') return;
			sendMessage('src/img/head.jpg',val);
			//call
			var req = {
				'addresser':name,
				'recipient':recipient,
				'type':'plain',
				'body':val
			}
			socket.emit('send private message', req);
			$('.chat-active input').val('');
			scrollToBottom(hex_md5(recipient));
	    }
	}

	//active li
	$(document).on('click','#session li',function(){
		$('.active').removeClass('active');
		$(this).addClass('active');
		var index = $(this).index();
		$('.chat-active').removeClass('chat-active');
		$('.chat:eq('+index+')').addClass('chat-active');
	});

	$(document).on('click','.chat-active .emoji',function(){
		$('#emoji').css('display','block');
	});

	function incomeHtml(tname,head){
		$('#session').append('<li id="li'+hex_md5(tname)+'"><img src="'+head+'"><span class="nick-name">'+tname+'</span></li>');
		var html = '';
		html+='<div id="'+hex_md5(tname)+'" data-n="'+tname+'" class="chat"><div class="main">';
		html+='<div class="message"><div class="head"><p>'+tname+'</p></div>';
		html+='<div class="body"><ul class="chat-msg"></ul></div></div>';
		html+='<div class="footer"><div class="box"><div class="head">';
		html+='<svg class="icon emoji" style="" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4692" xmlns:xlink="http://www.w3.org/1999/xlink"><defs></defs><path d="M520.76544 767.05792c-99.14368 0-180.30592-73.65632-193.78176-169.09312l-49.22368 0c13.78304 122.624 116.61312 218.29632 242.91328 218.29632S749.81376 720.5888 763.5968 597.9648l-49.0496 0C701.0816 693.4016 619.90912 767.05792 520.76544 767.05792zM512 0C229.23264 0 0 229.2224 0 512c0 282.75712 229.23264 512 512 512 282.76736 0 512-229.24288 512-512C1024 229.2224 794.76736 0 512 0zM511.95904 972.78976C257.46432 972.78976 51.1488 766.48448 51.1488 512c0-254.49472 206.30528-460.81024 460.81024-460.81024 254.48448 0 460.8 206.30528 460.8 460.81024C972.75904 766.48448 766.44352 972.78976 511.95904 972.78976zM655.57504 456.92928c31.06816 0 56.24832-25.1904 56.24832-56.24832 0-31.06816-25.18016-56.24832-56.24832-56.24832-31.06816 0-56.25856 25.18016-56.25856 56.24832C599.31648 431.73888 624.49664 456.92928 655.57504 456.92928zM362.73152 456.92928c31.06816 0 56.24832-25.1904 56.24832-56.24832 0-31.06816-25.1904-56.24832-56.24832-56.24832-31.0784 0-56.25856 25.18016-56.25856 56.24832C306.47296 431.73888 331.65312 456.92928 362.73152 456.92928z" p-id="4693"></path></svg>';
		html+='</div><div class="body"><input type="text" class="input" /></div>';
		html+='<div class="foot"><a class="send" href="javascript:void(0)">发送(Enter)</a></div></div></div></div></div>';
		$('#chat').append(html);
	}

	function sendMessage(head, val){
		$('.chat-active .chat-msg').append('<li><img class="mehead" src="'+head+'"><span class="mespeak">'+val+'</span></li>');
	}

	// function receiveMessage(head,val){
	// 	$('.chat-active .chat-msg').append('<li><img src="'+head+'"><span class="speak">'+val+'</span></li>');
	// }
	
	function scrollToBottom(root){
		$('#'+root+' .body').scrollTop($('#'+root+' .chat-msg').height());
	}

	$('#emoji span').click(function(){
		var val = $('.chat-active input[type=text]').val();
		$('.chat-active input[type=text]').val(val+$(this).text()); 
		$('#emoji').css('display','none');
	});

	function showNotice(head,title,msg){
	    var Notification = window.Notification || window.mozNotification || window.webkitNotification;
	    if(Notification){
	        Notification.requestPermission(function(status){
	            //status默认值'default'等同于拒绝 'denied' 意味着用户不想要通知 'granted' 意味着用户同意启用通知
	            if("granted" != status){
	                return;
	            }else{
	                var tag = "sds"+Math.random();
	                var notify = new Notification(
	                    title,
	                    {
	                        dir:'auto',
	                        lang:'zh-CN',
	                        tag:tag,//实例化的notification的id
	                        icon:'/'+head,//通知的缩略图,//icon 支持ico、png、jpg、jpeg格式
	                        body:msg //通知的具体内容
	                    }
	                );
	                notify.onclick=function(){
	                    //如果通知消息被点击,通知窗口将被激活
	                    window.focus();
	                },
	                notify.onerror = function () {
	                    console.log("HTML5桌面消息出错！！！");
	                };
	                notify.onshow = function () {
	                    setTimeout(function(){
	                        notify.close();
	                    },2000)
	                };
	                notify.onclose = function () {
	                    console.log("HTML5桌面消息关闭！！！");
	                };
	            }
	        });
	    }else{
	        console.log("您的浏览器不支持桌面消息");
	    }
	};

}, function() {
    document.write('刷新重连');
});




// (function(){
// 	var videopanal = false;
// 	var session = true;
// 	function id(id){
// 		return document.getElementById(id)
// 	}


// 	// id('input').onkeydown = function(e){
// 	// 	if(e && e.keyCode == 13){
// 	// 		var msg = id('input').value;
// 	// 		sendMessage(msg);
// 	// 	}
// 	// }

// 	function sendMessage(msg){
// 		id('chat-msg').innerHTML +='<li><img src="http://blog.w3cedu.net/public/upload/img/a31e38fccb19c249ecde795fc8323a31.jpg"><span class="speak">'+msg+'</span></li>';
// 		id('input').value ='';
// 	}

// 	id('btn-video').onclick = function(){
// 		if(videopanal){
// 			id('videopanal').style.display = 'none';
// 			videopanal = false;
// 		}else{
// 			id('videopanal').style.display = 'block';
// 			videopanal = true;
// 		}
// 	}

// 	id('btn-add').onclick = function(){
// 		if(addpanal){
// 			id('addpanal').style.display = 'none';
// 			addpanal = false;
// 		}else{
// 			id('addpanal').style.display = 'block';
// 			addpanal = true;
// 		}
// 	}

// 	id('btn-session').onclick = function(){
// 		if(!session){
// 			id('phone-book').style.display = 'none';
// 			id('session').style.display = 'block';
// 			id('btn-phone-book').setAttribute('class','');
// 			id('btn-session').setAttribute('class','active');
// 			session = true;
// 		}
// 	}
	

// 	var dom = {
// 		move:function(){
// 			var obj = document.getElementsByClassName('move');

// 			for(var i=0;i<obj.length;i++){
// 				this.drag(obj[i]);
// 			}
// 		},
// 		drag:function (obj){
// 			obj.onmousedown = function(e) {
// 				var x0 = e.clientX,
// 					y0 = e.clientY,
// 					offsetX=this.offsetLeft,
// 					offsetY=this.offsetTop;

// 				document.onmousemove = function(e){
// 					var	x1 = e.clientX,
// 						y1 = e.clientY,
// 						x = x1 - x0,
// 						y = y1 - y0;
						
// 					var	addX = offsetX+x,
// 						addY = offsetY+y;

// 					obj.style.left = addX+'px';
// 					obj.style.top  = addY+'px';
					
// 				}
// 				document.onmouseup = function(){
// 					this.onmousemove = null;	
// 				}
// 			}
// 		}
// 	}
// 	dom.move();

// })()