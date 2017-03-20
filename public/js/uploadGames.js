$(function () {

  function handleFileSelect(evt) {
    if(evt.target.files[0].type !== 'text/csv') {
      $('#message').html('That was not a csv file. Try again')
      return
    }
    if ( !(evt.target && evt.target.files && evt.target.files[0]) ) {
      return
    }    
    Papa.parse(evt.target.files[0], {
      complete: function (results) {
        console.log(results)
        sendData(results)
        $('#message').html('File uploaded.')
      }
    })
  }

  function sendData(dataset) {
    $.ajax({
      url: '/game/uploadGameData',
      type: 'POST',
      data: dataset,
      success: function() {
      }
    })
  }

  $("#csv-file").change(handleFileSelect)
})