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

						alert('Richiesta delle pagine Wikipedia fallita.');
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

						alert('Richiesta del contenuto della pagina Wikipedia fallita.');
					}
				});

			}

			search_wiki("I Want to Break Free");  // esempio di come contattare l'API di Wikipedia
