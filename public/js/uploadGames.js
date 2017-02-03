$(function() {

var form = $('#uploadForm'),
    uploadGameData = $('#uploadGameData'),
    uploadButton = $('#uploadButton')

form.on('submit', function(e) {
  e.preventDefault();
  var file = uploadGameData.files[0],
      formData = new FormData()

  formData.append(uploadGameData, file, file.name)

  $.ajax({
    url: '/game/uploadGameData',
    type: 'POST',
    data: formData,
    success: function() {
    }
  })


})