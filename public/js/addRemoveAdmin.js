$(function() {

$('#removeAdmin').on('click', function(e) {
  // e.preventDefault();
  var dataObj = {};
  var adminName = $('#adminNameGive').val();
  var selected = $('input[name=auth]:checked').val();
  console.log(adminName);
  console.log(selected);
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