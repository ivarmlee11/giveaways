function handleFileSelect(evt) {
  if ( !(evt.target && evt.target.files && evt.target.files[0]) ) {
    return
  }    
  Papa.parse(evt.target.files[0], {
    complete: function (results) {
      sendData(results)
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