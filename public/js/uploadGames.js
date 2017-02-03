$(function() {

var form = $('#uploadForm'),
    uploadGameData = $('#uploadGameData'),
    uploadButton = $('#uploadButton')

form.submit(function(e){

e.preventDefault();

$(this).parse({
  config: {
    // base config to use for each file
  },
  before: function(file, inputElem)
  {
    // executed before parsing each file begins;
    // what you return here controls the flow
  },
  error: function(err, file, inputElem, reason)
  {
    // executed if an error occurs while loading the file,
    // or if before callback aborted for some reason
  },
  complete: function(file)
  {
    // executed after all files are complete
    console.log(file)
  }
});
});
})