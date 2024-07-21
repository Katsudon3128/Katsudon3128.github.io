$(function(){
  $.ajaxSetup({ cache: false });
  var stock = $('#stock').attr('value');
  var type = $('#tableType').attr('value');
  GetDataAndShowContent(stock+type+'.csv', '');  
});

function confirm(){
    var stock = $('#stock').attr('value');
    var queryDate = $('#QueryDate').val();
    var type = $('#tableType').attr('value');
    GetDataAndShowContent(stock+type+'.csv', queryDate);
}

function addDays(days){
  var stock = $('#stock').attr('value');
  var type = $('#tableType').attr('value');
  var fileName = stock+type+'.csv';
  var id = parseInt($('#rowId').val());
  id += days;
  
  var csvData = [];
  $.ajax({
    type: "GET",
    url: "/chart1/data/"+fileName,
    dataType: "text",
    success: function(csv) {
      csvData = $.csv.toObjects(csv);
      if(csvData[id] != undefined){
        $('#content').html(csvData[id].content);
        $('#rowId').val(id);
      }else{
        alert('查無資料')
      }
    },
    error: function(r){
      alert('error');
    }
  });
}

function GetDataAndShowContent(fileName, date){
  var csvData = [];
  $.ajax({
    type: "GET",
    url: "/chart1/data/"+fileName,
    dataType: "text",
    success: function(csv) {
      csvData = $.csv.toObjects(csv);
      if(date == ''){
        $('#content').html(csvData[csvData.length-1].content);
        $('#rowId').val(csvData.length-1);
      }
      else{
        var noData = true;
        for (let i = 0; i < csvData.length; ++i) {
          if(date == csvData[i].Date){
            $('#content').html(csvData[i].content);
            $('#rowId').val(i);
            noData = false;
            break;
          }
        }

        if(noData){
          $('#content').html('查無資料')
        }
      }
    },
    error: function(r){
      alert('error');
    }
  });
}

function changeStock(id, name){
  $('#stock').attr('value', id);
  $('#stock').html(name);
}

function changeType(type, text){
  $('#tableType').attr('value', type);
  $('#tableType').html(text);
}