let heatmapLayer;
let isHeatmapVisible = false;

let globeInstance;
let is3DView = false;

// NOC to country name mapping
const noc_to_country = {
  'USA': 'United States', 
  'URS': 'Soviet Union',
  'GER': 'Germany',
  'GBR': 'United Kingdom',
  'FRA': 'France',
  'ITA': 'Italy',
  'SWE': 'Sweden',
  'CAN': 'Canada',
  'AUS': 'Australia',
  'RUS': 'Russia',
  'HUN': 'Hungary',
  'NED': 'Netherlands',
  'NOR': 'Norway',
  'GDR': 'East Germany',
  'CHN': 'China',
  'JPN': 'Japan',
  'FIN': 'Finland',
  'SUI': 'Switzerland',
  'ROU': 'Romania',
  'KOR': 'South Korea',
  'FRG': 'West Germany',
  'POL': 'Poland',
  'ESP': 'Spain',
  'TCH': 'Czechoslovakia',
  'BRA': 'Brazil',
  'BEL': 'Belgium',
  'AUT': 'Austria',
  'CUB': 'Cuba',
  'YUG': 'Yugoslavia',
  'BUL': 'Bulgaria',
  'EUN': 'Unified Team',
  'ARG': 'Argentina',
  'GRE': 'Greece',
  'NZL': 'New Zealand',
  'UKR': 'Ukraine',
  'IND': 'India',
  'JAM': 'Jamaica',
  'CRO': 'Croatia',
  'CZE': 'Czech Republic',
  'BLR': 'Belarus',
  'RSA': 'South Africa',
  'PAK': 'Pakistan',
  'MEX': 'Mexico',
  'KEN': 'Kenya',
  'NGR': 'Nigeria',
  'TUR': 'Turkey',
  'SRB': 'Serbia',
  'KAZ': 'Kazakhstan',
  'IRI': 'Iran'
  // Add more as needed
};

// Add this function to create the 3D globe
/*function createGlobe(heatmapData) {
    // Convert heatmap data to globe.gl format
    const globeData = Object.entries(heatmapData).map(([countryCode, data]) => ({
        lat: data.lat,
        lng: data.lng,
        size: data.count / 100, // Scale down for better visualization
        color: ['red', 'white', 'blue', 'green', 'yellow'][Math.floor(Math.random() * 5)], // Random Olympic colors
        country: noc_to_country[countryCode] || countryCode,
        medals: data.count
    }));

    // Clear previous globe if exists
    const container = document.getElementById('globe');
    if (globeInstance) {
        globeInstance.removeChild(container.children[0]);
    }

    // Create new globe instance
    globeInstance = Globe()
        .globeImageUrl('//unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
        .bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png')
        .backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png')
        .showAtmosphere(true)
        .atmosphereColor('rgba(0, 102, 179, 0.5)') // Olympic blue
        .atmosphereAltitude(0.25)
        .hexBinPointWeight('size')
        .hexAltitude(d => d.size * 0.5) // Height of the bars
        .hexBinResolution(4)
        .hexTopColor(d => d.color)
        .hexSideColor(d => d3.color(d.color).darker(0.5))
        .hexBinMerge(true)
        .enablePointerInteraction(true)
        .hexLabel(d => {
            const total = d.points.reduce((sum, pt) => sum + pt.size, 0);
            return `
            <div style="text-align: center;">
                <b>${d.points[0].country}</b>
                <div>Medals: <b>${Math.round(total * 50)}</b></div>
            </div>
            `;
        })
        (container);

    // Add data to the globe
    globeInstance.hexBinPoints(globeData);

    // Auto-rotate
    globeInstance.controls().autoRotate = true;
    globeInstance.controls().autoRotateSpeed = 0.5;

    return globeInstance;
}*/

function createGlobe(heatmapData) {
    console.log(heatmapData)

    // Convert heatmap data to globe.gl format
    const globeData = Object.entries(heatmapData).map(([countryCode, data]) => ({
        lat: data.lat,
        lng: data.lng,
        weight: data.count / 1000, // Scale down the medal count for better visualization
        country: noc_to_country[countryCode] || countryCode,
        medals: data.count
    }));

    // Clear previous globe if exists
    const container = document.getElementById('globe');
    if (globeInstance) {
        globeInstance.removeChild(container.children[0]);
    }

    globeInstance = new Globe(document.getElementById('globe'))
      .globeImageUrl('//unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
      .bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png')
      .backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png')
      .width(container.offsetWidth)
      .height(container.offsetHeight)
      .showAtmosphere(true)
      .heatmapsData([globeData])
      .heatmapPointLat('lat')
      .heatmapPointLng('lng')
      .heatmapPointWeight('medals')
      .heatmapTopAltitude(0.5)
      .heatmapsTransitionDuration(3000)
      .enablePointerInteraction(false);
    
    // Handle window resize
    window.addEventListener('resize', () => {
        globeInstance.width(container.offsetWidth)
                     .height(container.offsetHeight);
    });
}

// Add this function to toggle between 2D and 3D views
function toggle3DView() {
    is3DView = !is3DView;
    
    if (is3DView) {
        document.getElementById('map').style.display = 'none';
        document.getElementById('globe').style.display = 'block';
        document.getElementById('toggle-3d-btn').textContent = 'Switch to 2D View';
        
        // Initialize globe if not already done
        if (!globeInstance && window.heatmapData) {
            globeInstance = createGlobe(window.heatmapData);
        }
    } else {
        document.getElementById('map').style.display = 'block';
        document.getElementById('globe').style.display = 'none';
        document.getElementById('toggle-3d-btn').textContent = 'Switch to 3D View';
    }
}

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

        // Initialize the globe (but keep it hidden)
        createGlobe(window.heatmapData);

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
                        //document.getElementById('enlarged-country-info').innerText = `You clicked on ${countryName}. Olympic stats coming soon!`;
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
    const toggle3DBtn = document.getElementById('toggle-3d-btn');

    /*fullscreenBtn.addEventListener('click', () => {
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
    });*/

    // New fullscreen functionality: lead user to index.html in fullscreen_map folder
    fullscreenBtn.addEventListener('click', () => {
        // Redirect to the fullscreen map page
        window.location.href = 'fullscreen_map/index.html';
    });

    /*exitFullscreenBtn.addEventListener('click', () => {
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
    });*/

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

    toggle3DBtn.addEventListener('click', () => {
        toggle3DView();
    });
});
