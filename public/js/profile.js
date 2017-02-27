$(function() { 

var $thumbNail = $('#thumbNail'),
    $thumbMessage = $('#thumbMessage'),
					 id = $('#sentFromId').text(),
					 url = '/avatar/aviget/' + id

$.ajax({
  url: url,
  type: 'GET',
  success: function(profilePic) {
    console.log('D'+ profilePic + 'D' + ' profile pic')
    console.log(typeof profilePic)
    console.log(profilePic.length)
  	if(profilePic === "") {
  		$thumbNail.html('<img src="../img/guesswho.png"/>')
      $thumbMessage.html('No thumbnail change submitted yet. Upload an image.')
    } else if (profilePic === false) {
      $thumbNail.html('<img src="../img/guesswho.png"/>')
      $thumbMessage.html('The last thumbnail you suggested was rejected.')
  	} else {
			$thumbNail.html('<img src="' + profilePic + '"/>')   
  	}
  }
})

}); 