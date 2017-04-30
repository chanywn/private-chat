const 
	fs   = require('fs'),
	url  = require('url'),
	path = require('path'),
	http = require('http'),
	
	hostname = '127.0.0.1',
	port = 3000;

var defaultPage = ['index.html','default.html','index.htm','default.htm'];

var fsroot = path.join(path.resolve(process.argv[2] || '.'),'/www');

const server = http.createServer((request, response) => {
	//获得URL的path
    var pathname = url.parse(request.url).pathname;

    // 获得对应的本地文件路径
    var filepath = path.join(fsroot, pathname);
    
    //默认首页index.html
    if(pathname == '/') {
    	for(var i=0;i<defaultPage.length;i++){
			tempfilepath = path.join(filepath, '/'+defaultPage[i]);
			var stats = fs.statSync(tempfilepath);
			if(stats.isFile()) {
				filepath = tempfilepath;
				console.log('default page: '+filepath);
				break; 
			}
    	}
    }

	fs.stat(filepath, (err,stats) => {
		if(!err && stats.isFile()){
			//file
			console.log(request.method +' 200 ' + request.url);
    		response.statusCode = 200;
			fs.createReadStream(filepath).pipe(response);
		}else{
			console.log(request.method +' 404 ' + request.url);
			response.statusCode = 404;
			response.setHeader('Content-Type', 'text/plain');
			response.end('404 Not Found');
		}
	});
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

const io = require('socket.io')(server);

//JSON.stringify();
var usocket = {},user = [];

io.on('connection', (socket) => {
	//成员对象数组

	socket.on('new user', (username) => {
		if(!(username in usocket)) {
			socket.username = username;
			usocket[username] = socket;
			user.push(username);
			socket.emit('login',user);
			socket.broadcast.emit('user joined',username,(user.length-1));
			console.log(user);
		}
	})

	socket.on('send private message', function(res){
		console.log(res);
		if(res.recipient in usocket) {
			usocket[res.recipient].emit('receive private message', res);
		}
	});

	socket.on('disconnect', function(){
		//移除
		if(socket.username in usocket){
			delete(usocket[socket.username]);
			user.splice(user.indexOf(socket.username), 1);
		}
		console.log(user);
		socket.broadcast.emit('user left',socket.username)
	})

});
