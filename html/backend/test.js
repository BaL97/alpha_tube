$(document).ready(function(){
   $.ajax({ 
       type: 'POST', 
       url: 'json/video.json', 
       data: { get_param: 'value' }, 
       dataType: 'json',
       success: function (data) { 
		   alert ('hello');
           //$( "#send" ).remove();
           //$.each(data, function(index, element) {
           //    $('body').append($('<div>', {
               
           //    }));
           //});
       }
   });
   });
