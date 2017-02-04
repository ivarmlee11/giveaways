$(function() {

var form = $('#uploadForm'),
    uploadGameData = $('#uploadGameData'),
    uploadButton = $('#uploadButton')

uploadButton.on('click', function(e){

e.preventDefault();

console.log(uploadGameData.files)

});
})