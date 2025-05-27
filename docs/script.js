let heatmapLayer;
let isHeatmapVisible = false;


function generateHeatData(heatmapData) {
    const data = Object.values(heatmapData).map(entry => [
        entry.lat,
        entry.lng,
        entry.count
    ]);
    console.log("Generated heatmap data:", data);
    return data;
}

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
        // Store the heatmap data globally
        window.heatmapData = data.heatmap || {};

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
        maxZoom: 20,
        worldCopyJump: false,
        maxBounds: L.latLngBounds(L.latLng(-90, -180), L.latLng(90, 180))
    });
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        noWrap: true
    }).addTo(map);

    // Load GeoJSON data
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
                        document.getElementById('enlarged-country-info').innerText = `You clicked on ${countryName}. Olympic stats coming soon!`;
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

    const fullscreenBtn = document.getElementById('fullscreen-btn');
    const exitFullscreenBtn = document.getElementById('exit-fullscreen-btn');
    const mapContainer = document.getElementById('map');
    const mapOverlay = document.getElementById('map-overlay');
    const enlargedMap = document.getElementById('enlarged-map');
    const countryInfo = document.getElementById('country-info');
    const enlargedCountryInfo = document.getElementById('enlarged-country-info');
    const toggleHeatmapBtn = document.getElementById('toggle-heatmap-btn');

    fullscreenBtn.addEventListener('click', () => {
        // Disable body scroll
        document.body.classList.add('body-no-scroll');
        
        // Hide the original map (instead of cloning)
        countryInfo.style.display = 'none';
        
        // Show the overlay and enlarged map
        mapOverlay.style.display = 'block';
        
        // Initialize the enlarged map (only once)
        if (!window.enlargedMapInstance) {
            window.enlargedMapInstance = L.map('enlarged-map', {
                center: map.getCenter(),
                zoom: map.getZoom(),
                minZoom: 2,
                maxZoom: 20,
                worldCopyJump: false,
                maxBounds: L.latLngBounds(L.latLng(-90, -180), L.latLng(90, 180))
            });

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors',
                noWrap: true
            }).addTo(window.enlargedMapInstance);

            // Load GeoJSON data for the enlarged map
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
                        enlargedCountryInfo.innerText = `You clicked on ${countryName}. Olympic stats coming soon!`;
                        countryInfo.innerText = `You clicked on ${countryName}. Olympic stats coming soon!`;
                    });
                    layer.on('mouseover', () => {
                        layer.setStyle({ fillOpacity: 0.9 });
                    });
                    layer.on('mouseout', () => {
                        layer.setStyle({ fillOpacity: 0.6 });
                    });
                }
                }).addTo(window.enlargedMapInstance);
            });
        } else {
            // If enlarged map already exists, just sync its view
            window.enlargedMapInstance.setView(map.getCenter(), map.getZoom());
        }
    });

    exitFullscreenBtn.addEventListener('click', () => {
            // Re-enable body scroll
            document.body.classList.remove('body-no-scroll');
            
            // Hide the overlay
            mapOverlay.style.display = 'none';

            // Activate the country info
            countryInfo.style.display = 'block';
            
            // Show the original map
            mapContainer.style.display = 'block';
            
            // Sync the original map's view with the enlarged one
            if (window.enlargedMapInstance) {
                map.setView(window.enlargedMapInstance.getCenter(), window.enlargedMapInstance.getZoom());
            }

            // Reset the enlarged heatmap visibility state
            isEnlargedHeatmapVisible = false;
    });

    toggleHeatmapBtn.addEventListener('click', () => {
        console.log("Heatmap toggle clicked!");
        if (!heatmapLayer && window.heatmapData) {
            const heatData = generateHeatData(window.heatmapData);

            // Get all medal counts for normalization
            const counts = Object.values(window.heatmapData).map(entry => entry.count);
            const maxCount = Math.max(...counts);
            console.log("Max count for heatmap normalization:", maxCount);

            heatmapLayer = L.heatLayer(heatData, { radius: 40, blur: 0, maxZoom: 17, max: 1.0, gradient: {
                0.1: 'blue',    // Low medal count
                0.3: 'cyan',    // Medium-low
                0.5: 'lime',    // Medium
                0.7: 'yellow',  // Medium-high
                0.9: 'red'      // High medal count
            }}).addTo(map);
        }

        if (isHeatmapVisible) {
            map.removeLayer(heatmapLayer);
            toggleHeatmapBtn.innerText = 'Show Heatmap';
        } else {
            heatmapLayer.addTo(map);
            toggleHeatmapBtn.innerText = 'Hide Heatmap';
        }

        isHeatmapVisible = !isHeatmapVisible;
    });

});
