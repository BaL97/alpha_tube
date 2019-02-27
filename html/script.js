var site = "http://site1840.tw.cs.unibo.it/";
var starter_list;
var search_list;
var cronology = new Array();
var timer;
var player;
var added=false;
var counter=0;
var recommender='starter';
var global_pop = new Array();
var h_state = false;

function navHandler(){
	h_state = true;
	if(history.state)	loadvideo(history.state);
}

window.addEventListener("popstate", navHandler, false);

function setRec(rec){
	recommender=rec;
}

function onYouTubePlayerAPIReady(){
	player = new YT.Player('iframe', {
                events: {
                        'onStateChange': onPlayerStateChange
                }
        });
}

function deleteHistory(){
	localStorage.setItem('watching', 'ubUdtowLIZo');
	localStorage.removeItem('cronology');
	cronology = [];
	printCronology(cronology, '#rec');
}

function onPlayerStateChange(event){
        if (event.data==1){
                timer = setInterval(function(){
                        if(player.getCurrentTime()>=15) {
                                if(counter==0){
					//add to cronology
					addToCronology(localStorage.getItem('watching'));
					printCronology(cronology, '#rec');
					}
				counter++;
                        }
                }, 1000);
        }
}
		
function isInCronology(v){
	for (var i=0; i<cronology.length; i++){
		if (v.videoId==cronology[i].videoId){
			cronology.splice(i,1);
			cronology.unshift(v);
			return true;
			}
		}
		return false;
}
		
function addToCronology(video){
			var date = new Date();
			var gmtdate = date.toGMTString();
			var object = {
				"videoId": video,
				"timesWatched": 1,
				"prevalentReason": recommender,
				"lastSelected": gmtdate
			}
			 /* Managing local cronology*/
			if(!localStorage.getItem('cronology'))
				cronology=[];
                        if(!isInCronology(object)){
                                if (cronology.length==20) var a = cronology.pop();
                        	cronology.unshift(object);
			}
			localStorage.setItem('cronology', JSON.stringify(cronology));
			//Add to server cronology
			$.get(site+"localPop/"+object.videoId+"/"+object.timesWatched+"/"+object.prevalentReason+"/"+object.lastSelected, function(data){
				printCronology(data, '#LPA');
			});
		}

		function loadvideo(video){
			$("#GPA").html('Loading...');
			if(localStorage.getItem('cronology')){
				cronology = JSON.parse(localStorage.getItem('cronology'));
				printCronology(cronology, '#rec');
			}
			localStorage.setItem('watching', video);
			//updateWatching(video);
			counter=0;
			player.loadVideoById(localStorage.getItem('watching'));
			if(!h_state)	history.pushState(localStorage.getItem('watching'), "");
			$.get(site+"listvideos/"+video, function(data){
				$("#titVid").html('<h4 id="titVid" class="card-title">'+data.items[0].snippet.title+'</h4>');			//VIDEO TITLE
				$("#descVid").html('<p id="descVid" class="card-text">'+data.items[0].snippet.description+'</p>');		//VIDEO DESC 
				$('#commVid').html('Attendere il caricamento...');		//WAIT FOR COMMENTS...
				search_wiki(data.items[0].snippet.title);	
			});
			
			$.get(site+"getstat/"+localStorage.getItem('watching'), function(data){
			$("#info").html('<p>'+'VIEW: '+ data.statistics.viewCount  +'</p>'+'<p>'+'LIKE: '+ data.statistics.likeCount  +'</p>'+'<p>'+'DISLIKE: '+ data.statistics.dislikeCount +'</p>');
			});


			 $.get(site+"getcomments/"+localStorage.getItem('watching'), function(data){      		//ASK SERVER FOR COMMENTS TO watching VIDEO
            			$('#commVid').html('');
            			for (i in data){
            				$('#commVid').append('<p><b>' + data[i].snippet.topLevelComment.snippet.authorDisplayName + '</b><br><br>' + data[i].snippet.topLevelComment.snippet.textDisplay + '</p><hr>');
            			}
			});
			related();
			fvitali();
			globalPopularity();
			h_state = false;
		}		
		


		function printVideos(j, section){  
			var i;
			var api = "'";			
			$("#"+section).html('<div class="container">');
			for(i=0; i<j.length; i++){
  				$.get(site+"listvideos/"+j[i].videoID, function(data){
                        	$("#"+section).append('<div class="row my-1">'+'<div class="col-sm-4" onclick="loadvideo('+ api +data.items[0].id + api+ ')">'+
                                                         '<img class="img-fluid" src=" '+data.items[0].snippet.thumbnails.medium.url +'">'+
                                	                 '</div>'+
                                         		 '<div class="col-md-8">'  +
						  	'<p>'+data.items[0].snippet.title+'</p>' + '</div>'+'</div>');
			}); 
			}
			$("#"+section).append('</div>');
		}

		function starter(){
			if(localStorage.getItem('watching'))
				loadvideo(localStorage.getItem('watching'));
			else	
				loadvideo('ubUdtowLIZo');			
			$.get(site+"localPop/default/1/starter/date", function(data){
				printCronology(data,'#LPA');
                        });

			jQuery.ajax({
				type: "GET",
				url: "http://site1825.tw.cs.unibo.it/video.json",
				dataType: "json",
				success: function(res){
					starter_list=res;
					printVideos(starter_list, 'start');
				},
				error: function(){
					alert('error');}
				});
			}

		function starterList(){
			printVideos(starter_list, 'starter');
		}
	
		function fvitali(){
			var url= "http://site1825.tw.cs.unibo.it/TW/globpop?id="+localStorage.getItem('watching');
			jQuery.ajax({
				type: "GET",
				url: url,
				dataType: "json",
				success: function(res){
					printVideos(res.recommended, 'fv');
				},
				error: function(){
					alert('error');}
				});
		}
	
		function printSearch(list, section){
			var i=0;
                        var api = "'";
                        $("#"+section).html('<div class="container">');
                        for(i in list){
                                $("#"+section).append('<div class="row my-1">'+'<div class="col-sm-4" onclick="loadvideo('+ api +list[i].id.videoId + api+ ')">'+'<img class="img-fluid" src=" '+ list[i].snippet.thumbnails.medium.url +'">'+'</div>'+
                                                         '<div class="col-md-8">'  +
                                                        '<p>'+list[i].snippet.title+'</p>' + '</div>'+'</div>');
                        }
                        $("#"+section).append('</div>');
                        i=0;

		}
		
		function searchVideos(q, section){
			if(!section) section='search';
			if(q){
					jQuery.ajax({
                                	type: "GET",
                                	url: site+"ytsearch/"+q,
                                	dataType: "json",
                                	success: function(res){
						search_list=res;
						printSearch(search_list, section);
                                	},
                               		 error: function(){
                                        	alert('error');}
                               	 	});
			}
		}

		function printCronology(items, section){
                        var api = "'";
                        $(section).html('<div class="container">');
			jQuery.ajaxSetup({async:false});
			for(i=0; i<items.length; i++){
                                $.get(site+"listvideos/"+items[i].videoId, function(data){
                                $(section).append('<div class="row my-1">'+'<div class="col-sm-4" onclick="loadvideo('+ api +data.items[0].id + api+ ')">'+
                                                         '<img class="img-fluid" src=" '+data.items[0].snippet.thumbnails.medium.url +'">'+
                                                         '</div>'+
                                                         '<div class="col-md-8">'  +
                                                        '<p>'+data.items[0].snippet.title+'</p>' + '</div>'+'</div>');
                        });
                        }
                        $(section).append('</div>');
			jQuery.ajaxSetup({async:true});
		}

		
		function rand(){
	  		var text;
	  		var possible = "abcdefghijklmnopqrstuvwxyz0123456789";
	    		text = possible.charAt(Math.floor(Math.random() * possible.length));
			searchVideos(text, 'rand');
		}

		function related(){
			jQuery.ajax({
			type: "GET",
			url: site+"related/"+localStorage.getItem('watching'),
			dataType: "json",
			success: function(res){
				printSearch(res, 'rel');
			},
			error: function(){
				alert('error');}
			});
		}


function search_wiki(str){
	$('#wikiVid').html("Attendere il caricamento...");
	$.ajax({
		url: "https://en.wikipedia.org/w/api.php",
		method: 'GET',
		dataType: "jsonp",
		data: {
			action : "query",
			list: "search",
			srsearch: str,
			format: "json"
			},
		success: function(ris){
			search_wiki_content(ris.query.search[0].title);
		},
		error: function(err){
			$('#wikiVid').html('No document was founs');
		}
	});
}

function search_wiki_content(titolo_pagina){
	$.ajax({
		url: "https://en.wikipedia.org/w/api.php",
		method: 'GET',
		dataType: "jsonp",
		data: {
			action: "parse",
			page: titolo_pagina,
			format: "json"
		},
		success: function(ris){
			$('#wikiVid').html(ris.parse.text['*']);
		},
		error: function(err){
			$('#wikiVid').html('No document was found');
		}
	});
}

function isInGlobal(videoId){
	for(var i in global_pop){
		if(global_pop[i].videoId==videoId)
			return true;
	}
	return false;
}

function addToGlobalPop(video){
	//esclude chi restituisce un json con campi non conformi alle specifiche
	if(video[0].videoId){
		var flag = false;
		while((!flag)&&(video)&&(video.length!=0)){
			var object = video.shift();
			if(!isInGlobal(object.videoId)){
				global_pop.push(object);
				flag=true;
			}
		}
	}
}

function relativeApiRequest(site){
	var APIurl = "http://site"+site+".tw.cs.unibo.it/globpop?id="+localStorage.getItem('watching');
	$.ajax({
		type: "GET",
		url: APIurl,
		success: function(res){
                        addToGlobalPop(res.recommended);
                },
		error: function(err){
                        console.log('Errore di richiesta API: '+err);
                }
	});
}

function apiRequest(site){
        var APIurl = "http://site"+site+".tw.cs.unibo.it/globpop?id=YYYYYY";
        $.ajax({
                type: "GET",
                url: APIurl,
                success: function(res){
                        addToGlobalPop(res.recommended);
                },
                error: function(err){
                        console.log('Errore di richiesta API: '+err);
                }
        });
}

function fillGlobalPop(){
	var i = 0;
	$.get(site+"getCronology", function (data){
	while((global_pop.length<20)&&(i<data.length)){
		if(!isInGlobal(data[i].videoId)){
			global_pop.push(data[i]);
		}
		i++;
	}
	printCronology(global_pop, '#GPA');
	});
}

function globalPopularity(){
	global_pop = [];
	$.when(
                apiRequest('1823'),
                //apiRequest('1906'), stringa non JSON
                //apiRequest('1901'), stringa non json
                apiRequest('1828'),
                apiRequest('1838'),
                apiRequest('1839'),
                apiRequest('1846'),
                apiRequest('1847'),
                apiRequest('1831'),
                apiRequest('1827'),
                apiRequest('1848'),
                apiRequest('1849'),
                apiRequest('1851'),
                apiRequest('1863'),
                apiRequest('1834'),
                apiRequest('1904'),
                apiRequest('1862'),
                apiRequest('1905')
                //apiRequest('1864') STRINGA NON JSON
		).then(function(){
			setTimeout(function (){
				fillGlobalPop();
			}, 5000);
		});
}
