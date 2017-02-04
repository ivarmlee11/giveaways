$(function() {

var form = $('#uploadForm'),
    uploadGameData = $('#uploadGameData'),
    uploadButton = $('#uploadButton')

form.submit(function(e){

e.preventDefault();

console.log(uploadGameData.files)

});
})