$(function() { 

var $thumbNail = $('#thumbNail'),
    $thumbMessage = $('#thumbMessage'),
					 id = $('#sentFromId').text(),
					 url = '/avatar/aviget/' + id

$.ajax({
  url: url,
  type: 'GET',
  success: function(user) {
  	if(!user.cloudinary) {
  		$thumbNail.html('<img src="../img/guesswho.png"/>')
      $thumbMessage.html('No thumbnail change submitted yet. Upload an image.')
    } else if((user.cloudinary) && (user.approvedThumb === null)) {
      $thumbNail.html('<img src="' + user.cloudinary + '"/>')  
      $thumbMessage.html('Awaiting mod approval for this image.')
    } else if ((user.cloudinary.length > 0) && (!user.approvedThumb)) {
      $thumbNail.html('<img src="../img/guesswho.png"/>')
      $thumbMessage.html('The last thumbnail you suggested was rejected.')
  	} else {
			$thumbNail.html('<img src="' + user.cloudinary + '"/>')  
      $thumbMessage.html('This thumbnail will appear on stream when you win a giveaway.') 
  	}
  }
})

}); 