var express = require('express');
var app = express();
var path = require("path");

//Load index.html
app.get('/', function(req, res) {
	res.sendFile(path.join(__dirname+'/index.html'));
	});

app.listen(8000);
console.log('Running at Port 8000');
