$(function(){
  var stock = $('#stock').attr('value');
  createSblChart(stock+'.csv', parseInt($('#days').val()));
});

function confirm(){
  var days = parseInt($('#days').val());
  var maxDays = parseInt($('#days').attr('max'));
  var minDays = parseInt($('#days').attr('min'));
  if(days > maxDays || days < minDays){
    alert('天數超過查詢範圍');
  }
  else{
    var stock = $('#stock').attr('value');
    var sblChart = Chart.getChart('SblChart');
    sblChart.destroy();
    createSblChart(stock+'.csv', days);
  }
}

function createSblChart(fileName, days){
  var csvData = [];
  $.ajax({
    type: "GET",
    url: "/chart/data/"+fileName,
    dataType: "text",
    success: function(csv) {
      csvData = $.csv.toObjects(csv);

      const ctx = $("#SblChart");

      const labels = [];
      const SBL = [];
      const SBL_S = [];
      const Price = [];
      var startOffset = csvData.length - days;
      for (let i = startOffset; i < csvData.length; ++i) {
        labels.push(csvData[i].Date);
        SBL.push(csvData[i].SBL);
        SBL_S.push(csvData[i].SBL_S);
        Price.push(csvData[i].Price);
      }

      const data = {
        labels: labels,
        datasets: [
          {
            label: '股價',
            data: Price,
            fill: false,
            borderColor: 'rgb(255, 0, 0)',
            tension: 0.1,
            yAxisID: 'y2',
            pointBorderWidth: 5,
            pointHitRadius: 20,
            pointStyle: false
          },
          {
            label: '借券餘額',
            data: SBL,
            fill: false,
            borderColor: 'rgb(102, 204, 255)',
            tension: 0.1,
            yAxisID: 'y1',
            pointBorderWidth: 5,
            pointHitRadius: 20,
            pointStyle: false
          },
          {
            label: '借券賣餘額',
            data: SBL_S,
            fill: true,
            backgroundColor: 'rgb(255, 153, 51)',
            borderColor: 'rgb(255, 153, 51)',
            tension: 0.1,
            yAxisID: 'y1',
            pointBorderWidth: 5,
            pointHitRadius: 20,
            pointStyle: false
          }
        ]
      };

      const option = {
        //雙Y軸設定
        scales:
        {
            y1:
            {
                type: 'linear',
                display: true,
                position: 'left',
            },
            y2:
            {
                type: 'linear',
                display: true,
                position: 'right',
                grid:
                {
                    drawOnChartArea: false //不顯示grid
                }
            }
        }
      }

      const config = {
        type: 'line',
        data: data,
        options: option
      };
      const myChart = new Chart(ctx, config);
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