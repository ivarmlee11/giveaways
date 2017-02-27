$(function() { 

var thumbNail = $('#thumbNail'),
					 id = $('#sentFromId').text()
					 url = '/avatar/aviget/' + id

$.ajax({
  url: url,
  type: 'GET',
  success: function(profilePic) {
  	if(profilePic === 'Not approved') {
  		thumbNail.html('<img src="../img/guesswho.png"/>') 
  	} else {
			thumbNail.html('<img src="' + profilePic + '"/>')   
  	}
  }
})

}); 