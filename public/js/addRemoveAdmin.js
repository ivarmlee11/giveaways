$(function() {

$('#removeAdmin').on('click', function() {
  var dataObj = {};
  var adminName = $('#adminNameGive').val();
  var selected = $('input[name=auth]:checked').val();
  dataObj['adminName'] = adminName;
  dataObj['auth'] = selected;
  console.log(dataObj);
  $.ajax({
    method: 'POST',
    url: '/admin/adminListRemove',
    data: dataObj
  }).done(function(data) {
  });
});

});