$(function() {

var form = $('#uploadForm'),
    uploadGameData = $('#uploadGameData'),
    uploadButton = $('#uploadButton')

form.submit(function(e){

e.preventDefault();
var request = new FormData();                   
$.each(context.prototype.fileData, function(i, obj) { request.append(i, obj.value.files[0]); });    
request.append('action', 'upload');
request.append('id', response.obj.id);
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