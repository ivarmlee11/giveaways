$(function() {

var form = $('#uploadForm'),
    uploadGameData = $('#uploadGameData'),
    uploadButton = $('#uploadButton')

form.submit(function(e){

e.preventDefault();

Papa.parse(uploadGameData.files[0], {
  complete: function(results) {
    console.log(results);
  }
});

});
})