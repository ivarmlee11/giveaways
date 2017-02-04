function handleFileSelect(evt) {
  if ( !(evt.target && evt.target.files && evt.target.files[0]) ) {
    return
  }    
  Papa.parse(evt.target.files[0], {
    error: function (error) {
      if(error) {
        $('#message').html('Make sure your csv is in this format... game name,$,steam code,false')
      }
    },
    complete: function (results) {
      sendData(results)
      $('#message').html('File uploaded. Check your game database.')
    }
  })
}

function sendData(dataset) {
  // render code here...
  $.ajax({
    url: '/game/uploadGameData',
    type: 'POST',
    data: dataset,
    success: function() {
    }
  })
}

$(function () {
  $("#csv-file").change(handleFileSelect)
})