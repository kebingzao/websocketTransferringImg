var WebSocket = require('faye-websocket'),
        fs = require('fs'),
        http      = require('http');

var server = http.createServer();

// 等待客户端连接上来
server.on('upgrade', function(request, socket, body) {
    if (WebSocket.isWebSocket(request)) {
        var ws = new WebSocket(request, socket, body);

        ws.on('open', function(event) {
            console.log("已经有客户端连接上来");
            ws.send(JSON.stringify({
                action: 1,
                data:'I am the server and I\'m listening!'
            }));
        });

        ws.on('message', function(event) {
            var data = JSON.parse(event.data);
            var msg = '';
            switch (data.action){
                case 1:
                    // 文本信息，原样返回
                    msg = "server return ==>: " + data.data;
                    ws.send(JSON.stringify({
                        action: data.action,
                        data: msg
                    }));
                    break;
                case 2:
                    // 请求图片信息，二进制文本格式
                    // 发送一张本地图片过去
                    var bitmap = fs.readFileSync(__dirname + "/images/1.jpg");
                    var buf = new Buffer(bitmap);
                    var json = JSON.stringify(buf);
                    console.log(json);
                    msg = json;
                    ws.send(JSON.stringify({
                        action: data.action,
                        data: msg
                    }));
                    break;
                case 3:
                    // 二进制流的方式
                    ws.send(fs.readFileSync(__dirname + "/images/2.png"));
                    break;
                case 4:
                    // 转化为base64 返回
                    var bitmap = fs.readFileSync(__dirname + "/images/3.png");
                    // 转化为16进制
                    ws.send(JSON.stringify({
                        action: data.action,
                        data: new Buffer(bitmap).toString("base64")
                    }));
                    break;
            }
        });

        ws.on('close', function(event) {
            console.log('close', event.code, event.reason);
            console.log("websocket 断开连接");
            ws = null;
        });
    }
});

server.listen(3001,function(){
    console.log("websocket server start")
});