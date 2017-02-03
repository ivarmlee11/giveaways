$(function() {

var form = $('#uploadForm'),
    uploadGameData = $('#uploadGameData'),
    uploadButton = $('#uploadButton')

form.submit(function(){

var formData = new FormData($(this)[0]);
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