$(function(){
  var csvData = [];
  $.ajax({
    type: "GET",
    url: "/chart/data/test.csv",
    dataType: "text",
    success: function(csv) {
      csvData = $.csv.toObjects(csv);
      alert(csvData[0].Date+'/'+csvData[0].SBL+'/'+csvData[0].SBL_S+'/'+csvData[0].Price);
    },
    error: function(r){
      alert('error');
    }
  });
});

const ctx = $("#myChart");

const labels = ['一月份', '二月份', '三月份','四月份', '五月份', '六月份', '七月份'];  // 设置 X 轴上对应的标签
const data = {
  labels: labels,
  datasets: [{
    label: '我的第一个折线图',
    data: [65, 59, 80, 81, 56, 55, 40],
    fill: false,
    borderColor: 'rgb(75, 192, 192)', // 设置线的颜色
    tension: 0.1
  }]
};
const config = {
  type: 'line', // 设置图表类型
  data: data,
};
const myChart = new Chart(ctx, config);