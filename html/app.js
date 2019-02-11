var express = require('express');
var app = express();
var path = require("path");
var fs = require('fs');
var google = require('googleapis');
var morgan = require('morgan');
var cors = require('cors');
var jsdom = require('jsdom');
const { JSDOM } = jsdom;
const { window } = new JSDOM();
var $ = require('jquery')(window);
var ytApiKey = "AIzaSyA0NwqdqMCpS9JbXNaCYIyjwnrs8diZcU8";


app.use(morgan('timy'));
app.use(cors()); 
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
	/*see there, log into youtube API with API KEY, then looking for videos with query in request ID
	//obtain json file, then parse it and show in browser app
	//const youtube = google.youtube({
  	//	version: 'v3'
	});*/	
	 res.send('Cerca su youtube il video: ' + req.params.query);
});

/* Load and parse the json file on fvitali api
 */
app.get('/listvideos/:id', function(req, res){
	$.get("https://www.googleapis.com/youtube/v3/videos?part=snippet&id=" + req.params.id + "&key=" + ytApiKey, function(data) {
        res.send(data);
        });
});   

/* Middleware handling Not found errors*/
function notFound(req, res, next){
	res.status(404);
	const error = new Error('Not Found');
	next(error);
}

/* Middleware erroHandler*/
function errorHandler(error, req, res, next){
	res.status(res.statusCode || 500);
	res.json({
		message:error.message
	});
}

app.use(notFound);
app.use(errorHandler);

app.listen(8000);
console.log('Running at Port 8000');
