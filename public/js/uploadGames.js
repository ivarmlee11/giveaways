$(function() {

var form = $('#uploadForm'),
    uploadGameData = $('#uploadGameData'),
    uploadButton = $('#uploadButton')

form.submit(function(e){

e.preventDefault();
var request = new FormData();                   

console.log(this.val())
$.ajax({

    type        : 'POST',
    url     : '/game/uploadGameData',
    data        : request,
    processData : false,
    contentType : false,                        
    success     : function(r) {
        console.log(r);
        //if (errors != null) { } else context.close();

    },

    error       : function(r) { alert('jQuery Error'); }

});

});
})