$(function() {

var form = $('#uploadForm'),
    uploadGameData = $('#uploadGameData'),
    uploadButton = $('#uploadButton')

form.submit(function(e){

e.preventDefault();

var formData = new FormData(form[0]);
console.log(formData)
// $.ajax({
//     url: '/game/uploadGameData',
//     type: 'POST',
//     data: formData,
//     async: false,
//     success: function (data) {
//     },
//     cache: false,
//     contentType: false,
//     processData: false
// });

});

})