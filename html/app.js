var express = require('express');
var app = express();
var path = require("path");
var fs = require('fs');
var morgan = require('morgan');
var cors = require('cors');
var jsdom = require('jsdom');
const { JSDOM } = jsdom;
const { window } = new JSDOM();
var $ = require('jquery')(window);
const apiKey = 'AIzaSyA0NwqdqMCpS9JbXNaCYIyjwnrs8diZcU8';
const {google} = require('googleapis');
const youtube = google.youtube({
	version: 'v3',
	auth: apiKey
});

app.use(morgan('timy'));
app.use(cors()); 
/* Main request, load index.html file, identified as
 * Request → site1840.tw.cs.unibo.it/
 */
app.get('/', function(req, res) {
	res.sendFile(path.join(__dirname+'/index.html'));
	});


/* Function to res the js to client */
app.get('/script.js', function(req, res){
	res.sendFile(path.join(__dirname+'/script.js'));
});

/* Load and parse the json file on fvitali api
 */
app.get('/listvideos/:id', function(req, res){
	$.get("https://www.googleapis.com/youtube/v3/videos?part=snippet&id=" + req.params.id + "&key=" + apiKey, function(data) {
        res.send(data);
        });
}); 

/* Youtube Search */
app.get('/ytsearch/:query', function(req, res){
	youtube.search.list({
		part: 'snippet',
		q: req.params.query,
		maxResults: 20,
		type: 'video'}, function(err, ris){
			if (err) console.error('Error: '+err);
			if (ris) {res.send(ris.data.items);}
		});
});

/* Related Search */
app.get('/related/:id', function(req, res){
	youtube.search.list({
		part: 'snippet',
		maxResults: 20,
		type: 'video',
		relatedToVideoId: req.params.id}, function(err, ris){
			if(err) console.error('Error: '+err);
			if(ris) {res.send(ris.data.items);}
		});
	});

/* Get comments */
app.get('/getcomments/:id', function(req, res){
	$.ajax({
            		url: "https://www.googleapis.com/youtube/v3/commentThreads",
            		method: 'GET',
            		dataType: "json",
            		data: {
            			key: apiKey,
            			part: "snippet",
            			videoId: req.params.id
            		},
            		success: function(data){res.send(data.items);},
			error: function(err){
				console.error('Error: '+err);
			}
	});

});

/* Get video's stat. */
app.get('/getstat/:id', function(req, res){
	$.get("https://www.googleapis.com/youtube/v3/videos?part=statistics&id=" + req.params.id + "&key=" + apiKey, function(data) {
        	res.send(data.items[0]);
        });
});

/* Middleware handling not found error*/
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
