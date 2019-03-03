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
const apiKey = 'YOUR_API_KEY_HERE';
const {google} = require('googleapis');
const youtube = google.youtube({
	version: 'v3',
	auth: apiKey
});
var c = new Array();
var popRelLoc = new Array();

app.use(morgan('timy'));
app.use(cors()); 

function restrictCronology(){
	var restrict = new Array();
	var i = 0;
	while ((i<20)&&(i<c.length)){
		restrict[i]=c[i];
		i++;
	}
	return restrict;
}

function mostPopular(rec){
	for (var i=0; i<c.length; i++){
		if (c[i].prevalentReason==rec)
			return c[i];
	}
	return null;
}

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
		type: 'video',
		videoCategoryId: '10'}, function(err, ris){
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
		videoCategoryId: '10',
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

/* Adding videos to absolute cronology */
app.get('/localPop/:videoId/:timesWatched/:prevalentReason/:lastSelected', function(req, res){
	var newvideo = {
		"videoId": req.params.videoId,
		"timesWatched": req.params.timesWatched,
		"prevalentReason": req.params.prevalentReason,
		"lastSelected": req.params.lastSelected
	}
        var flag=false;
        var newcounter;
        if(req.params.videoId!='default'){
        if(c.length==0){
                c.push(newvideo);
        }
        else{
        for(var i in c){
                if(c[i].videoId==req.params.videoId){
                        flag=true;
                        c[i].timesWatched++;
                        newvideo=c[i];
                        c.splice(i,1);
                }
        }
        if(flag){
                if (c.length==0){
                        c.push(newvideo);}
                else{
                i=0;
                while((flag)&&(i<c.length)){
                        if(newvideo.timesWatched>=c[i].timesWatched){
                                c.splice(i, 0, newvideo);
                                flag=false;
                        }
                        i++;
                }
                if(flag) {c.push(newvideo);}
                }
        }
        else c.push(newvideo);
        }}
	res.send(restrictCronology())
        //res.send(c);
});

app.get('/getCronology', function(req,res){
	res.send(c);
});

app.get('/globpop', function (req,res){
	//create recommendations
	var recommender = new Array ();
        //Absolute Popularity
	if(req.query.id=='YYYYYY'){
		if(mostPopular('search'))
			recommender.push(mostPopular('search'));
		if(mostPopular('random'))
			recommender.push(mostPopular('random')); 
        	if(mostPopular('related'))
			recommender.push(mostPopular('related'));
       		if(mostPopular('video recent'))
			recommender.push(mostPopular('video recent'));
        	if(mostPopular('fvitali'))
			recommender.push(mostPopular('fvitali'));
        	if(mostPopular('Local Absolute'))
			recommender.push(mostPopular('Local Absolute'));
        	if(mostPopular('Local Relative'))
			recommender.push(mostPopular('Local Relative'));
		if(mostPopular('Artist Similarity'))
        		recommender.push(mostPopular('Artist Similarity'));
		if(mostPopular('Genre Similarity'))
			recommender.push(mostPopular('Genre Similarity'));
	}
	//Relative Popularity
	else{
		var found = false;
		for (i in popRelLoc){
			if(req.query.id==popRelLoc[i].id){
				found = true;
				res.send(popRelLoc[i].succ);
			}
		}
		if(!found){
			var empty = new Array();
			empty = [];
			res.send(empty);
		}
	}

	var data = new Date();
	var gmt = data.toGMTString();
        if(recommender.length==0){
                var nevergonna = {
                        "videoId": "dQw4w9WgXcQ",
                        "timesWatched": 10000,
                        "prevalentReason": "Global Popularity",
                        "lastSelected": gmt
                }
		recommender.push(nevergonna);
        }
	var response = {
		"site": "site1840.tw.cs.unibo.it", 
		"recommender": req.query.id,
		"lastWatched": gmt, 
		"recommended": recommender
	}
	res.send(response);
});

app.get('/addRelative/:idPred/:idSucc/:recommender', function (req, res){
	var idPred = req.params.idPred;
	var idSucc = req.params.idSucc;
	var recommender = req.params.recommender;
	var found_idPred = false ;
       	var found_idSucc = false ;
        var date = new Date();
        var gmtdate = date.toGMTString();
	for(i in popRelLoc){
        	if(popRelLoc[i].id == idPred){
                	found_idPred = true ;
                        for(j in popRelLoc[i].succ){
                        if(popRelLoc[i].succ[j].videoId == idSucc){
                        	found_idSucc = true ;
                                var incCount = popRelLoc[i].succ[j].timesWatched + 1 ;
                                var incElem = {
                                	"videoId": idSucc,
                                        "timesWatched": incCount,
                                        "prevalentReason": recommender,
                                        "lastSelected": gmtdate
                                          };
                                                                                popRelLoc[i].succ.splice(j, 1);
										var foundVideo = false;
                                                                                for(k in popRelLoc[i].succ){

                                                                                        if(popRelLoc[i].succ[k].timesWatched <= incCount){
												foundVideo = true;
                                                                                                popRelLoc[i].succ.splice(k, 0, incElem);
                                                                                        }
                                                                                }
										if(!foundVideo)
											popRelLoc[i].succ.push(incElem);
                                                                        }
                                                                }

                                                                if(!found_idSucc){
                                                                        var newElem_succ =      {
                                                                                                                        "videoId": idSucc,
                                                                                                                        "timesWatched": 1,
                                                                                                                        "prevalentReason": recommender,
                                                                                                                        "lastSelected": gmtdate
                                                                                                                } ;

                                                                        popRelLoc[i].succ.splice(popRelLoc[i].succ.length, 0, newElem_succ);
                                                                }
                                                        }
                                                }

       if(!found_idPred){
                                                
                                                        var newElem_pred =      {
                                                                                                        "id": idPred,
                                                                                                        "succ": [
                                                                                                                                {
                                                                                                                                        "videoId": idSucc,
                                                                                                                                        "timesWatched": 1,
                                                                                                                                        "prevalentReason": recommender,
                                                                                                                                        "lastSelected": gmtdate
                                                                                                                                        
                                                                                                                                }       
                                                                                                                        ]       
                                                                                                } ;                     
                                                                                                
                                                        popRelLoc.splice(popRelLoc.length, 0, newElem_pred);
                                                }  
	res.send("Request Successful");

});

app.get('/getRelatives/:id', function(req, res) {
	res.send(popRelLoc);
});

/* Chiamata a YouTube per ottenere il genere musicale associato ad un video */
app.get('/genreFind/:id', function(req, res){

	$.ajax({
		url: 'https://www.googleapis.com/youtube/v3/videos',
		method: 'GET',
		dataType: "json",
		data: {
			key: apiKey,
			part: 'topicDetails',
			id: req.params.id
		},
		success: function(data){
			res.send(data);
		},
		error: function(err){
			console.error('Error: ' + err);
		}
	});
});

/* Chiamata a YouTube per ottenere i video di un certo genere musicale */
app.get('/genreSim/:gen', function(req, res){

	var cod = '' ;

	switch(req.params.gen)
	{
		case "Children's music":
			cod = "/m/05fw6t";
			break;

		case "Christian music":
			cod = "/m/02mscn";
			break;

		case "Classical music":
			cod = "/m/0ggq0m";
			break;

		case "Country":
			cod = "/m/01lyv";
			break;

		case "Electronic music":
			cod = "/m/02lkt";
			break;

		case "Hip hop music":
			cod = "/m/0glt670";
			break;

		case "Independent music":
			cod = "/m/05rwpb";
			break;

		case "Jazz":
			cod = "/m/03_d0";
			break;

		case "Music of Asia":
			cod = "/m/028sqc";
			break;

		case "Music of Latin America":
			cod = "/m/0g293";
			break;

		case "Pop music":
			cod = "/m/064t9";
			break;

		case "Reggae":
			cod = "/m/06cqb";
			break;

		case "Rhythm and blues":
			cod = "/m/06j6l";
			break;

		case "Rock music":
			cod = "/m/06by7";
			break;

		case "Soul music":
			cod = "/m/0gywn";
			break;

		case "Music":
			cod = "/m/04rlf";
			break;

		default:
			break;
	}
	
	
	$.ajax({
		url: "https://www.googleapis.com/youtube/v3/search",
		method: 'GET',
		dataType: "json",
		data: {
			key: apiKey,
			part: "snippet",
			q: "",						//(q)uery da cercare
			maxResults: 20,
			type: "video",
			videoCategoryId: "10",		// corrisponde a 'Music' per YouTube
			topicId: cod				// genere musicale
		},
		success: function(data){

			res.send(data);
		},
		error: function(err){
			console.error('Error: ' + err);
		}
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
