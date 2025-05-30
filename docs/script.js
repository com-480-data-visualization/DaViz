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

    let medalData = {};

    // Загружаем данные из JSON файла
    fetch('data/output.json') // Укажите правильный путь к вашему JSON файлу
        .then(response => response.json())
        .then(data => {
            medalData = data;
        });
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
                        const countryName = feature.properties.name;
                        document.getElementById('country-info').innerText = `Loading stats for ${countryName}...`;
                        const medalDataByCountry = medalData[countryName];

                        if (!medalDataByCountry) {
                            document.getElementById('country-info').innerText = `No Olympic stats available for ${countryName}.`;
                            document.getElementById('medal-charts-container').classList.add('d-none');
                            return;
                        }

                        // Show tabs and charts container
                        document.getElementById('medal-charts-container').classList.remove('d-none');

                        // Prepare datasets
                        const seasons = { Summer: {}, Winter: {} };
                        for (const event in medalDataByCountry) {
                            const [year, season] = event.split(" ");
                            const medals = medalDataByCountry[event];
                            if (!seasons[season]) continue;
                            seasons[season][event] = {
                                Gold: medals["Gold"] || 0,
                                Silver: medals["Silver"] || 0,
                                Bronze: medals["Bronze"] || 0
                            };
                        }

                        // Update or create charts
                        updateOrCreateChart('summerMedalsChart', seasons['Summer'], 'Summer');
                        updateOrCreateChart('winterMedalsChart', seasons['Winter'], 'Winter');

                        // Render tables
                        renderMedalTable('summerMedalsTable', seasons['Summer']);
                        renderMedalTable('winterMedalsTable', seasons['Winter']);

                        // Final message with total medals
                        const totalMedals = Object.values(medalDataByCountry).reduce((acc, medals) => {
                            acc.Gold += medals["Gold"] || 0;
                            acc.Silver += medals["Silver"] || 0;
                            acc.Bronze += medals["Bronze"] || 0;
                            return acc;
                        }, { Gold: 0, Silver: 0, Bronze: 0 });

                        document.getElementById('country-info').innerText =
                            `${countryName}: ${totalMedals.Gold} Gold, ${totalMedals.Silver} Silver, ${totalMedals.Bronze} Bronze`;
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

    function renderMedalTable(containerId, data) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';
        if (Object.keys(data).length === 0) {
            container.innerHTML = '<p class="text-muted">No medal data available.</p>';
            return;
        }

        const table = document.createElement('table');
        table.className = 'table table-striped table-bordered';

        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        ['Year', 'Gold', 'Silver', 'Bronze'].forEach(text => {
            const th = document.createElement('th');
            th.textContent = text;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);

        const tbody = document.createElement('tbody');

        Object.entries(data).forEach(([year, medals]) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                    <td>${year}</td>
                    <td class="gold-cell">${medals['Gold'] || 0}</td>
                    <td class="silver-cell">${medals['Silver'] || 0}</td>
                    <td class="bronze-cell">${medals['Bronze'] || 0}</td>
                `;
            tbody.appendChild(row);
        });

        table.appendChild(tbody);
        container.appendChild(table);
    }

    function updateOrCreateChart(canvasId, data, season) {
        const ctx = document.getElementById(canvasId).getContext('2d');
        // Clear previous chart if exists
        const chartInstance = Chart.getChart(ctx);
        if (chartInstance) {
            chartInstance.destroy();
        }

        const years = Object.keys(data).sort();
        const gold = years.map(y => data[y].Gold);
        const silver = years.map(y => data[y].Silver);
        const bronze = years.map(y => data[y].Bronze);

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: years,
                datasets: [
                    {
                        label: 'Gold',
                        data: gold,
                        borderColor: '#FFD700',
                        backgroundColor: '#FFD700', // Непрозрачный
                        tension: 0.3,
                        pointRadius: 4,
                        fill: false // Можно true, если нужна заливка
                    },
                    {
                        label: 'Silver',
                        data: silver,
                        borderColor: '#C0C0C0',
                        backgroundColor: '#C0C0C0',
                        tension: 0.3,
                        pointRadius: 4,
                        fill: false
                    },
                    {
                        label: 'Bronze',
                        data: bronze,
                        borderColor: '#CD7F32',
                        backgroundColor: '#CD7F32',
                        tension: 0.3,
                        pointRadius: 4,
                        fill: false
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false, // Важно для мобильных
                plugins: {
                    title: {
                        display: true,
                        text: `${season === 'summer' ? 'Summer' : 'Winter'} Olympics Medals Over Time`,
                        color: '#000'
                    },
                    legend: {
                        position: 'top',
                        labels: {
                            color: '#000'
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1,
                            color: '#000'
                        },
                        grid: {
                            color: '#ccc'
                        }
                    },
                    x: {
                        ticks: {
                            color: '#000'
                        },
                        grid: {
                            color: '#ccc'
                        }
                    }
                }
            }
        });
    }

    const fullscreenBtn = document.getElementById('fullscreen-btn');
    const exitFullscreenBtn = document.getElementById('exit-fullscreen-btn');
    const mapContainer = document.getElementById('map');
    const mapOverlay = document.getElementById('map-overlay');
    const enlargedMap = document.getElementById('enlarged-map');
    const countryInfo = document.getElementById('country-info');
    const enlargedCountryInfo = document.getElementById('enlarged-country-info');
    const toggleHeatmapBtn = document.getElementById('toggle-heatmap-btn');
    const toggle3DBtn = document.getElementById('toggle-3d-btn');



    // New fullscreen functionality: lead user to index.html in fullscreen_map folder
    fullscreenBtn.addEventListener('click', () => {
        // Redirect to the fullscreen map page
        window.location.href = 'fullscreen_map/index.html';
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

    toggle3DBtn.addEventListener('click', () => {
        toggle3DView();
    });
});

// Save scroll position before leaving main page
window.addEventListener('beforeunload', () => {
    localStorage.setItem('mainScrollPosition', window.scrollY);
});

// Restore scroll position when returning
window.addEventListener('load', () => {
    // Check URL parameter first
    const urlParams = new URLSearchParams(window.location.search);
    console.log("URL Parameters:", urlParams.toString());
    const urlScrollPos = urlParams.get('scroll');

    if (urlScrollPos) {
        setTimeout(() => {
            window.scrollTo(0, parseInt(urlScrollPos, 10));
            // Clean URL without reloading
            history.replaceState(null, '', window.location.pathname);
        }, 50);
    }

    const savedPosition = localStorage.getItem('mainScrollPosition');
    if (savedPosition) {
        setTimeout(() => {
            window.scrollTo(0, parseInt(savedPosition, 10));
            localStorage.removeItem('mainScrollPosition'); // Clean up
        }, 50);
    }
});
