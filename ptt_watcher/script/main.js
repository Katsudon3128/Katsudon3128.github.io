$(function(){
    $.ajaxSetup({ cache: false });

    $.ajax({
        type: "POST",
        url: "http://localhost:5000/api",
        contentType: 'application/json',
        success: function(r) {
            var labels = [];
            var data = [];

            for(var i in r)
            {
                labels.push(r[i].board);
                data.push(r[i].nums);
            }

            createChart(labels, data);
        },
        error: function(r){
          alert('error');
        }
      });    
});

function createChart(labels, datas){
    const ctx = $("#board_chart");
    const data = {
        labels: labels,
        datasets: [{
          data: datas
        }]
      };
    const option = {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: 'ptt board Pie Chart'
          }
        }
      };
    const config = {
        type: 'pie',
        data: data,
        options: option
      };
    const boardChart = new Chart(ctx, config);
}
