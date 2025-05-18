document.addEventListener("DOMContentLoaded", () => {
  // Load Chart.js from CDN
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
  script.onload = initializeCharts;
  document.head.appendChild(script);
});

function initializeCharts() {
  fetch('docs/olympic_data.json')
    .then(response => response.json())
    .then(data => {
        console.log("Medal Efficiency Data:", data.medal_efficiency);

        createChart('genderChart', 'doughnut', {...data.gender, backgroundColor: ['#0066B3', '#F11C22']});
        createChart('sportsChart', 'bar', {...data.sports, backgroundColor: ['#4E79A7', '#F28E2B', '#E15759', '#76B7B2', '#59A14F']});
        createChart('medalChart', 'pie', {...data.medals, backgroundColor: ['#FFD700', '#C0C0C0', '#CD7F32']});
        createChart('countryChart', 'bar', {...data.countries, backgroundColor: ['#4E79A7', '#F28E2B', '#E15759', '#76B7B2', '#59A14F']});
        createChart('ageChart', 'bar', {...data.age, backgroundColor: ['#D4E6F1', '#A9CCE3', '#7FB3D5', '#5499C7', '#2980B9']});
        createChart('heightChart', 'bar', {...data.height, backgroundColor: ['#E8DAEF', '#D2B4DE', '#BB8FCE', '#A569BD', '#8E44AD']});
        createChart('weightChart', 'bar', {...data.weight, backgroundColor: ['#FAD7A0', '#F8C471', '#F5B041', '#F39C12', '#D68910']});
        createChart('efficiencyChart', 'bar', {...data.medal_efficiency, backgroundColor: ['#88C0D0', '#81A1C1', '#5E81AC', '#4C566A', '#2E3440']});
        
    });
}

function createChart(elementId, type, data) {
  const ctx = document.getElementById(elementId).getContext('2d');
  new Chart(ctx, {
      type: type,
      data: {
          labels: data.labels,
          datasets: [{
              data: data.data,
              backgroundColor: data.backgroundColor,
              borderWidth: 1
          }]
      },
      options: {
          responsive: true,
      }
  });
}