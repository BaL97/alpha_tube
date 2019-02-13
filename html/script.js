var watching="ubUdtowLIZo";
var site = "http://davide.balestra2.tw.cs.unibo.it/";
var starter_list;
var search_list;
var cronology = new Array();
		
		function isInCronology(v){
			var index = cronology.indexOf(v);
			if (index!=-1){
				cronology.splice(index, 1);
				cronology.unshift(v);
				return true;
			}
			else return false;
		}

		function loadvideo(video){
			/* Managing local cronology*/
			watching=video;
			if(!isInCronology(video)){
				if (cronology.length==20) var a = cronology.pop();
			cronology.unshift(video);}
	
			$("#ytplayer").html('<iframe class="embed-responsive-item" src="https://www.youtube.com/embed/'+video+'?rel=0" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>');	//ASK FOR VIDEO TITLE AND DESCRIPTION TO SERVER
			$.get(site+"listvideos/"+video, function(data){
				$("#titVid").html('<h4 id="titVid" class="card-title">'+data.items[0].snippet.title+'</h4>');			//VIDEO TITLE
				$("#descVid").html('<p id="descVid" class="card-text">'+data.items[0].snippet.description+'</p>');		//VIDEO DESC 
				$('#commVid').html('Attendere il caricamento...');		//WAIT FOR COMMENTS...
			});


			$.get(site+"getstat/"+watching, function(data){
			$("#titVid").append('<p>'+'VIEW: '+ data.statistics.viewCount  +'</p>'+'<p>'+'LIKE: '+ data.statistics.likeCount  +'</p>'+'<p>'+'DISLIKE: '+ data.statistics.dislikeCount +'</p>');
			});


			 $.get(site+"getcomments/"+watching, function(data){      		//ASK SERVER FOR COMMENTS TO watching VIDEO
            			$('#commVid').html('');
            			for (i in data){
            				$('#commVid').append('<p><b>' + data[i].snippet.topLevelComment.snippet.authorDisplayName + '</b><br><br>' + data[i].snippet.topLevelComment.snippet.textDisplay + '</p><hr>');
            			}
			});
		}		
		


		function printVideos(j){  
			var i=0;
			var api = "'";			
			$("#loadvideos").html('<div class="container">');
			for(i in j){
  				$.get(site+"listvideos/"+j[i].videoID, function(data){
                        	$("#loadvideos").append('<div class="row my-1">'+'<div class="col-sm-4">'+'<a href="#video" onclick="loadvideo('+ api +data.items[0].id + api+ ')">'+
                                                         '<img class="img-fluid" src=" '+data.items[0].snippet.thumbnails.medium.url +'">'+
                                	                 '</a>'+
                                        	         '</div>'+
                                         		 '<div class="col-md-8">'  +
						  	'<p>'+data.items[0].snippet.title+'</p>' + '</div>'+'</div>');
			});               			
			}
			$("#loadvideos").append('</div>');
			i=0;
		}

		function starter(){
			loadvideo(watching);			
			jQuery.ajax({
				type: "GET",
				url: "http://site1825.tw.cs.unibo.it/video.json",
				dataType: "json",
				success: function(res){
					starter_list=res;
					printVideos(starter_list);
				},
				error: function(){
					alert('error');}
				});
			}

		function starterList(){
			printVideos(starter_list);
		}
	

		function fvitali(){
			var url= "http://site1825.tw.cs.unibo.it/TW/globpop?id="+watching;
			jQuery.ajax({
				type: "GET",
				url: url,
				dataType: "json",
				success: function(res){
					printVideos(res.recommended);
				},
				error: function(){
					alert('error');}
				});
		}
	
		function printSearch(list){
			var i=0;
                        var api = "'";
                        $("#loadvideos").html('<div class="container">');
                        for(i in list){
                                $("#loadvideos").append('<div class="row my-1">'+'<div class="col-sm-4">'+'<a href="#video" onclick="loadvideo('+ api +list[i].id.videoId + api+ ')">'+'<img class="img-fluid" src=" '+ list[i].snippet.thumbnails.medium.url +'">'+
                                                         '</a>'+
                                                         '</div>'+
                                                         '<div class="col-md-8">'  +
                                                        '<p>'+list[i].snippet.title+'</p>' + '</div>'+'</div>');
                        }
                        $("#loadvideos").append('</div>');
                        i=0;

		}
		
		function searchVideos(q){
			if(q){
					jQuery.ajax({
                                	type: "GET",
                                	url: site+"ytsearch/"+q,
                                	dataType: "json",
                                	success: function(res){
						search_list=res;
						printSearch(search_list);
                                	},
                               		 error: function(){
                                        	alert('error');}
                               	 	});
			}
		}

		function recent(){
			var i=0;
                        var api = "'";
                        $("#loadvideos").html('<div class="container">');
                        for(i in cronology){
                                $.get(site+"listvideos/"+cronology[i], function(data){
                                $("#loadvideos").append('<div class="row my-1">'+'<div class="col-sm-4">'+'<a href="#video" onclick="loadvideo('+ api +data.items[0].id + api+ ')">'+
                                                         '<img class="img-fluid" src=" '+data.items[0].snippet.thumbnails.medium.url +'">'+
                                                         '</a>'+
                                                         '</div>'+
                                                         '<div class="col-md-8">'  +
                                                        '<p>'+data.items[0].snippet.title+'</p>' + '</div>'+'</div>');
                        });
                        }
                        $("#loadvideos").append('</div>');
                        i=0;

		}
		
		function rand(){
	  		var text;
	  		var possible = "abcdefghijklmnopqrstuvwxyz0123456789";
	    		text = possible.charAt(Math.floor(Math.random() * possible.length));
			searchVideos(text);
		}

		function related(){
			jQuery.ajax({
			type: "GET",
			url: site+"related/"+watching,
			dataType: "json",
			success: function(res){
				printSearch(res);
			},
			error: function(){
				alert('error');}
			});
		}
