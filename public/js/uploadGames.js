function handleFileSelect(evt) {
    if ( !(evt.target && evt.target.files && evt.target.files[0]) ) {
        return;
    }    
    Papa.parse(evt.target.files[0], {
        header: true,
        dynamicTyping: true,
        complete: function (results) {
            debugDataset(results);
            renderDataset(results);
        }
    });
}

function debugDataset(dataset) {
    var formatted = JSON.stringify(dataset, null, 2);
    $("<div class='parse'></div>").text(formatted).appendTo(".graphcontainer");
}

function renderDataset(dataset) {
    // render code here...
    console.log(dataset)
}

$(function () {
    $("#csv-file").change(handleFileSelect);
});