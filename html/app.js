var express = require('express');
var app = express();
var path = require("path");


/* Main request, load index.html file, identified as
 * Request → site1840.tw.cs.unibo.it/
 */
app.get('/', function(req, res) {
	res.sendFile(path.join(__dirname+'/index.html'));
	});


/* Search video on youtube based on search field
 * Request → site1840.tw.cs.unibo.it/search_videos/$query
 */
app.get('/search_videos/:query', function(req, res){
	
	res.send("Hello, you're looking for "+req.params.query);
	});

app.listen(8000);
console.log('Running at Port 8000');
