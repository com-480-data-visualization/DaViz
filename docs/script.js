/*document.addEventListener("DOMContentLoaded", () => {
    const dataDiv = document.getElementById("data-content");

    // Placeholder demo - replace with CSV parsing logic later
    dataDiv.innerHTML = `
      <h3>Sample Stats</h3>
      <div class="row">
        <div class="col-md-4">
          <div class="card text-white bg-primary mb-4">
            <div class="card-body">
              <h5 class="card-title">Total Athletes</h5>
              <p class="card-text"><strong>~135,000</strong></p>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card text-white bg-secondary mb-4">
            <div class="card-body">
              <h5 class="card-title">Countries Represented</h5>
              <p class="card-text"><strong>206</strong></p>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card text-white bg-success mb-4">
            <div class="card-body">
              <h5 class="card-title">Years Covered</h5>
              <p class="card-text"><strong>1896 – 2016</strong></p>
            </div>
          </div>
        </div>
      </div>
    `;
});*/

document.addEventListener("DOMContentLoaded", () => {
  // Load Chart.js from CDN
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
  script.onload = initializeCharts;
  document.head.appendChild(script);
});

function initializeCharts() {
  // Sample data processing (replace with actual CSV parsing)
  const athleteData = {
      gender: {
          labels: ['Male', 'Female'],
          data: [65, 35],
          backgroundColor: ['#0066B3', '#F11C22']
      },
      sports: {
          labels: ['Athletics', 'Swimming', 'Gymnastics', 'Fencing', 'Football'],
          data: [12000, 8500, 6000, 3500, 3000],
          backgroundColor: ['#0066B3', '#FFCC00', '#000000', '#009639', '#F11C22']
      },
      medals: {
          labels: ['Gold', 'Silver', 'Bronze'],
          data: [1200, 1000, 1000],
          backgroundColor: ['#FFD700', '#C0C0C0', '#CD7F32']
      },
      countries: {
          labels: ['USA', 'Russia', 'Germany', 'UK', 'China'],
          data: [2800, 2000, 1800, 1500, 1400],
          backgroundColor: ['#0066B3', '#F11C22', '#000000', '#009639', '#FFCC00']
      },
      age: {
          labels: ['Under 20', '20-25', '26-30', '31-35', 'Over 35'],
          data: [15, 35, 30, 15, 5],
          backgroundColor: ['#0066B3', '#FFCC00', '#000000', '#009639', '#F11C22']
      },
      height: {
          labels: ['Under 160cm', '160-170cm', '170-180cm', '180-190cm', 'Over 190cm'],
          data: [10, 25, 35, 25, 5],
          backgroundColor: ['#0066B3', '#FFCC00', '#000000', '#009639', '#F11C22']
      },
      weight: {
          labels: ['Under 60kg', '60-70kg', '70-80kg', '80-90kg', 'Over 90kg'],
          data: [20, 30, 25, 15, 10],
          backgroundColor: ['#0066B3', '#FFCC00', '#000000', '#009639', '#F11C22']
      }
  };

  // Create charts
  createChart('genderChart', 'doughnut', athleteData.gender);
  createChart('sportsChart', 'bar', athleteData.sports);
  createChart('medalChart', 'pie', athleteData.medals);
  createChart('countryChart', 'bar', athleteData.countries);
  createChart('ageChart', 'bar', athleteData.age);
  createChart('heightChart', 'bar', athleteData.height);
  createChart('weightChart', 'bar', athleteData.weight);
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
          plugins: {
              legend: {
                  position: 'bottom',
              }
          }
      }
  });
}