document.addEventListener("DOMContentLoaded", () => {
  // Load Chart.js from CDN
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
  script.onload = initializeCharts;
  document.head.appendChild(script);
});

window.addEventListener('scroll', () => {
  const navbar = document.getElementById('mainNav');
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
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
    // Check if the element with the given ID exists
    const ctx = document.getElementById(elementId).getContext('2d');
    
    // Display legend when needed
    var displayLegend = false;
    if (elementId === 'genderChart' || elementId === 'medalChart') {
        displayLegend = true;
    }

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
                    display: displayLegend,
                    position: 'bottom',
                }
            }
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const map = L.map('map', {
        center: [20, 0],
        zoom: 2,
        minZoom: 2,
        maxZoom: 5,
        worldCopyJump: false, // This prevents the infinite horizontal dragging
        maxBounds: L.latLngBounds(L.latLng(-90, -180), L.latLng(90, 180)) // This restricts panning to one world
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        noWrap: true // Prevents tile repetition
    }).addTo(map);

    // Load GeoJSON with country shapes
    fetch('https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json')
        .then(response => response.json())
        .then(geojson => {
        L.geoJSON(geojson, {
            style: {
            color: "#0066B3",
            weight: 1,
            fillColor: "#cce5ff",
            fillOpacity: 0.6
            },
            onEachFeature: (feature, layer) => {
            const countryName = feature.properties.name;
            layer.on('click', () => {
                document.getElementById('country-info').innerText = `You clicked on ${countryName}. Olympic stats coming soon!`;
            });
            layer.on('mouseover', () => {
                layer.setStyle({ fillOpacity: 0.9 });
            });
            layer.on('mouseout', () => {
                layer.setStyle({ fillOpacity: 0.6 });
            });
            }
        }).addTo(map);
    });
});
