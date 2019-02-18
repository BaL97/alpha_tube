var apiKey_yt = 'AIzaSyA0NwqdqMCpS9JbXNaCYIyjwnrs8diZcU8' ;   // apiKey YouTube di gruppo

var titleParsed = "" ;
var titleParsedWeak = "" ;
var artist = "" ;
var track = "" ;

var idVid_corrente ;

/*
*	Description: Funzione che interroga DBPedia per sapere se la stringa passata corrisponde al nome di un artista o band
*
*	Parameters:
*	- "headtail": array di tringhe
*	- "index": indice dell'array
*	- "check": oggetto per il controllo dei risultati
*/
function DBPediaIsArtist(headtail, index, check){
	var found = false;
	var url = 'http://dbpedia.org/sparql';
	var query = [
		'ASK',
		'WHERE {',
			'?author <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://dbpedia.org/ontology/MusicalArtist>.',
			'?author <http://xmlns.com/foaf/0.1/name> ?name.',
			'FILTER regex(?name, "' + headtail[index] + '", "i")',
		'}'
	].join(' ');
	var queryUrl = url+"?query="+ encodeURIComponent(query) +"&format=json";

	$.ajax({
		url: queryUrl,
		success: function(response){
			if(response.boolean){
				console.log(headtail[index] + " is artist " + response.boolean);
				check.isArtist = response.boolean;
				check.artistCheck = true;
				if(check.trackCheck){
					DBPediaDataCheck(headtail, index, check);
				}
			}
			else{
				var query = [
					'ASK',
					'WHERE {',
						'?band <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://dbpedia.org/ontology/Band>.',
						'?band <http://xmlns.com/foaf/0.1/name> ?name.',
						'FILTER regex(?name, "' + headtail[index] + '", "i")',
					'}'
				].join(' ');
				var queryUrl = url+"?query="+ encodeURIComponent(query) +"&format=json";
				$.ajax({
					url: queryUrl,
					success: function(response){
						console.log(headtail[index] + " is artist " + response.boolean);
						check.isArtist = response.boolean;
						check.artistCheck = true;
						if(check.trackCheck){
							DBPediaDataCheck(headtail, index, check);
						}
					},
					error: function(response){
						console.log('ERROR on retrive DBPedia artist query');
					}
				});
			}
		},
		error: function(response){
			console.log('ERROR on retrive DBPedia artist query');
		}
	});
}

/*
*	Description: Funzione che interroga DBPedia per sapere se la stringa passata corrisponde al titolo di una canzone
*
* 	Parameters:
*	- "headtail": array di tringhe
*	- "index": indice dell'array
*	- "check": oggetto per il controllo dei risultati
*/
function DBPediaIsTrack(headtail, index, check){
	var found = false;
	var url = 'http://dbpedia.org/sparql';
	var query = [
		'ASK',
		'WHERE {',
			'?track <http://dbpedia.org/ontology/musicalArtist> ?artist.',
			'?track <http://xmlns.com/foaf/0.1/name> ?title.',
			'FILTER regex(?title, "' + headtail[index] + '", "i")',
		'}'
	].join(' ');
	var queryUrl = url+"?query="+ encodeURIComponent(query) +"&format=json";

	$.ajax({
		url: queryUrl,
		success: function(response){
			console.log(headtail[index] + ' is track ' + response.boolean);
			check.isTrack = response.boolean;
			check.trackCheck = true;
			if(check.artistCheck){
				DBPediaDataCheck(headtail, index, check);
			}
		},
		error: function(response){
			console.log('ERROR on retrive DBPedia track query');
		}
	});
}

/*
*	Description: Funzione che interpreta i dati contenuti nelloggetto di controllo e determina titolo e artista della canzone
*
* 	Parameters:
*	- "headtail": array di tringhe
*	- "index": indice dell'array
*	- "check": oggetto per il controllo dei risultati
*/
function DBPediaDataCheck(headtail, index, check){
	//se i dati sono utilizzabili allora viene salvato il tutto
	if(check.isArtist ^ check.isTrack){
		if(check.isArtist){
			if(index == 0 || index == 2){
				artist = headtail[index];
				track = headtail[index + 1];
			}
			else{
				artist = headtail[index];
				track = headtail[index - 1];
			}
		}
		else{
			if(index == 0 || index == 2){
				track = headtail[index];
				artist = headtail[index + 1];
			}
			else{
				track = headtail[index];
				artist = headtail[index - 1];
			}
		}
		//DBPDataToggle = true;

		console.log("Artist: " + artist);
		console.log("Track: " + track);

		//wikiSearch();
		
		//avvio della compilazione della lista del similarity recommender
		//if(simToggle){
			artistSimilarity();
		//}

		genreFind();
	}
	else{
		if(index < 3){
			//reset dell'oggetto di controllo
			check.artistCheck = false;
			check.trackCheck = false;
			check.isArtist = false;
			check.isTrack = false;
			//nuovo controllo dei dati
			DBPediaIsArtist(headtail, index + 1, check)
			DBPediaIsTrack(headtail, index + 1, check);
		}
		else{
			console.log('ERROR on retrive DBPedia query');
			
			//DBPDataToggle = true;
			
			//wikiSearch();
			
			//if(simToggle){
				artistSimilarity();
			//}

			genreFind();
		}
	}
}

/*
*	Description: Funzione che data una stringa fa il parsing e determina artista e titolo della canzone, se questo è possibile
*				 In caso di successo salva il nome dell'artista o band in 'artist' e il titolo della canzone in 'track', altrimenti questi rimangono vuoti
*	Parameters:
*	-"str": titolo del video di youtube da parsare
*/
function puliziaTitolo(str){

	var headtail = [];

	var check = {
		artistCheck: false,
		trackCheck: false,
		isArtist: false,
		isTrack: false
	};

	//weak parse
	str = str.replace(new RegExp(/\s*\([^\)]*\)/g), "");			//parentesi tonde
	str = str.replace(new RegExp(/\s*\[[^\]]*\]/g), "");			//parentesi quadre
	str = str.replace(new RegExp(/\s*\{[^\}]*\}/g), "");			//parentesi graffe
	str = str.replace(new RegExp(/\s*\"/g), "");					//virgolette moleste
	str = str.replace(new RegExp(/\s*1080p?/i), "");				//definizioni video
	str = str.replace(new RegExp(/\s*720p?/i), "");
	str = str.replace(new RegExp(/\s*hd/i), "");					//definizioni audio/video
	str = str.replace(new RegExp(/\s*full hd/i), "");
	str = str.replace(new RegExp(/\s*hq/i), "");

	//weak parse split
	headtail[3] = String(new RegExp(/\s*-+.*/).exec(str));
	headtail[2] = String(str.replace(headtail[3], ""));
	headtail[3] = String(headtail[3].replace(new RegExp(/\s*-+\s*/), ""));
	headtail[3] = String(headtail[3].replace(String((new RegExp(/\s*-+.*/)).exec(headtail[3])), ""));
	headtail[2] = String(headtail[2].replace(new RegExp(/\s*ft\..*/i), ""));
	headtail[2] = String(headtail[2].replace(new RegExp(/\s*feat\..*/i), ""));
	headtail[2] = String(headtail[2].replace(new RegExp(/\s*featuring\..*/i), ""));
	headtail[3] = String(headtail[3].replace(new RegExp(/\s*ft\..*/i), ""));
	headtail[3] = String(headtail[3].replace(new RegExp(/\s*feat\..*/i), ""));
	headtail[3] = String(headtail[3].replace(new RegExp(/\s*featuring\..*/i), ""));

	//full parse
	str = str.replace(new RegExp(/\s*u?o?fficiale?/i), "");			//parole che potrebbero essere decontestualizate
	str = str.replace(new RegExp(/\s*video/i), "");
	str = str.replace(new RegExp(/\s*clip/i), "");
	str = str.replace(new RegExp(/\s*originale?/i), "");
	str = str.replace(new RegExp(/\s*lyrics?/i), "");

	//full parse split
	headtail[1] = String(new RegExp(/\s*-+.*/).exec(str));
	headtail[0] = String(str.replace(headtail[1], ""));
	headtail[1] = String(headtail[1].replace(new RegExp(/\s*-+\s*/), ""));
	headtail[1] = String(headtail[1].replace(String((new RegExp(/\s*-+.*/)).exec(headtail[1])), ""));
	headtail[0] = String(headtail[0].replace(new RegExp(/\s*ft\..*/i), ""));
	headtail[0] = String(headtail[0].replace(new RegExp(/\s*feat\..*/i), ""));
	headtail[0] = String(headtail[0].replace(new RegExp(/\s*featuring\..*/i), ""));
	headtail[0] = String(headtail[0].replace(new RegExp(/\s*,.*/i), ""));
	headtail[1] = String(headtail[1].replace(new RegExp(/\s*ft\..*/i), ""));
	headtail[1] = String(headtail[1].replace(new RegExp(/\s*feat\..*/i), ""));
	headtail[1] = String(headtail[1].replace(new RegExp(/\s*featuring\..*/i), ""));
	headtail[1] = String(headtail[1].replace(new RegExp(/\s*,.*/i), ""));

	titleParsed = headtail[0] + " " + headtail[1];
	titleParsedWeak = headtail[2] + " " + headtail[3];

	console.log("titleParsed: " + titleParsed);
	console.log("headtail[0]: " + headtail[0]);
	console.log("headtail[1]: " + headtail[1]);
	console.log("titleParsedWeak: " + titleParsedWeak);
	console.log("headtail[2]: " + headtail[2]);
	console.log("headtail[3]: " + headtail[3]);

	//ricerca
	DBPediaIsArtist(headtail, 0, check);
	DBPediaIsTrack(headtail, 0, check);
}

function artistSimilarity(){

	if(artist != ""){

		$.ajax({
            url: "https://www.googleapis.com/youtube/v3/search",
            method: 'GET',
            dataType: "json",
            data: {
                key: apiKey_yt,
                part: "snippet",
                q: artist,
                type: "video",
                videoCategoryId: "10"	// corrisponde a 'Music' per YouTube
            },
            success: function(risp){

            	for (i in risp.items){

            		if (risp.items[i].id.videoId == idVid_corrente){

            			risp.items.splice(i, 1);
            		}
            	}

            	return risp ;	// dalla risposta sono stati tolti i video uguali a quello corrente
            },
            error: function(err){

                alert('Richiesta del video YouTube fallita.');
            }
        });
	}
}

/*
* 	Description: Verifica se il genere che gli viene passato e' un genere musicale
*	Parametri:
*	- "code" e' una stringa che identifica un genere di un video YouTube.
*/
function codeToGenre(code) {

	var genre = '';

	switch(code)
	{
		case "/m/05fw6t":
			return "/m/05fw6t";
			break;
		case "/m/02mscn":
			return "/m/02mscn";
			break;
		case "/m/0ggq0m":
			return "/m/0ggq0m";
			break;
		case "/m/01lyv":
			return "/m/01lyv";
			break;
		case "/m/02lkt":
			return "/m/02lkt";
			break;
		case "/m/0glt670":
			return "/m/0glt670";
			break;
		case "/m/05rwpb":
			return "/m/05rwpb";
			break;
		case "/m/03_d0":
			return "/m/03_d0";
			break;
		case "/m/028sqc":
			return "/m/028sqc";
			break;
		case "/m/0g293":
			return "/m/0g293";
			break;
		case "/m/064t9":
			return "/m/064t9";
			break;
		case "/m/06cqb":
			return "/m/06cqb";
			break;
		case "/m/06j6l":
			return "/m/06j6l";
			break;
		case "/m/06by7":
			return "/m/06by7";
			break;
		case "/m/0gywn":
			return "/m/0gywn";
			break;
		default:
			break;
	}

	return '';
}

function genreFind(){

	var genreInfo = [];
	var genre = '';
	
	$.ajax({
		url: 'https://www.googleapis.com/youtube/v3/videos',
		data: {
			key: apiKey_yt,
			part: 'topicDetails',
			id: idVid_corrente
		},
		success: function(data){

			genreInfo = data.items[0].topicDetails.relevantTopicIds;
			$.each(genreInfo, function(index, object){
				genre = codeToGenre(object);
			});
			if(genre == '')
				genre = '/m/04rlf';

			genreSimilarity(genre);
		},
		error: function(data){

			alert('Something wrong happened\nPlease check your internet connection');
		}
	});
}

function genreSimilarity(genre_code){

	$.ajax({
        url: "https://www.googleapis.com/youtube/v3/search",
        method: 'GET',
        dataType: "json",
        data: {
            key: apiKey_yt,
            part: "snippet",
            q: "",					//(q)uery da cercare
            type: "video",
            videoCategoryId: "10",	// corrisponde a 'Music' per YouTube
            topicId: genre_code		// genere musicale
        },
        success: function(risp){

        	for (i in risp.items){

        		if (risp.items[i].id.videoId == idVid_corrente){

        			risp.items.splice(i, 1);
        		}

        		$('body').append('<br><iframe src="https://www.youtube.com/embed/' + risp.items[i].id.videoId + '" width="560" height="349" frameborder="0" allowfullscreen></iframe><br>');
        	}

        	return risp ;	// dalla risposta sono stati tolti i video uguali a quello corrente
        },
        error: function(err){

            alert('Richiesta del video YouTube fallita.');
        }
    });
}

// esempio d'uso
search("queen");
puliziaTitolo(risp.items[0].snippet.title);
