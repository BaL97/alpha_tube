		var watching="ubUdtowLIZo";
		var site = "http://davide.balestra2.tw.cs.unibo.it/";
		
		function loadvideo(video){
			watching=video;
			$("#ytplayer").html('<iframe width="560" height="315" src="https://www.youtube.com/embed/'+video+'?rel=0" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>');
			$.get(site+"listvideos/"+video, function(data){
				$("#titVid").html('<h4 id="titVid" class="card-title">'+data.items[0].snippet.title+'</h4>');
				$("#descVid").html('<p id="descVid" class="card-text">'+data.items[0].snippet.description+'</p>'); 
                        });
		}		
		
		function printVideos(j){  
			var i=0;
			var api = "'";			
			$("#loadvideos").html('<div class="container">');
			for(i;i<j.length;i++){
  				$.get(site+"listvideos/"+j[i].videoID, function(data){
                        	//alert(data.items[0].snippet.title);  
                        	$("#loadvideos").append('<div class="row my-1">'+'<div class="col-sm-4">'+'<a href="#video" onclick="loadvideo('+ api +data.items[0].id + api+ ')">'+
                                                         '<img class="img-fluid" src=" '+data.items[0].snippet.thumbnails.medium.url +'">'+
                                	                 '</a>'+
                                        	         '</div>'+
                                         		 '<div class="col-md-8">'  +
						  	'<p>'+data.items[0].snippet.title+'</p>' + '</div>'+'</div>');
			});               			
			}
				$("#loadvideos").append('</div>');
		}

		function starter(){
			loadvideo(watching);			
			jQuery.ajax({
				type: "GET",
				url: "http://site1825.tw.cs.unibo.it/video.json",
				dataType: "json",
				success: function(res){
					printVideos(res);
				},
				error: function(){
					alert('error');}
				});
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
