import { scaleSequentialSqrt } from 'https://esm.sh/d3-scale';
import { interpolateYlOrRd } from 'https://esm.sh/d3-scale-chromatic';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';

function createLegend(colorScale, maxMedals) {
    const legend = document.getElementById('legend');
    legend.innerHTML = '<b>Medals received (until 2016)</b><br>';

    const steps = 10;
    for (let i = 0; i <= steps; i++) {
        const value = (i / steps) * maxMedals;
        const color = colorScale(value);
        const legendItem = document.createElement('div');
        legendItem.innerHTML = `<span class="color-box" style="background:${color}"></span>${Math.round(value)} medals`;
        legend.appendChild(legendItem);
    }
}

// Function to create a bar chart for medal counts by year
function createBarChart(data, containerId) {
    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    const barWidth = 40; // Fixed width for each bar
    const width = Math.max(data.length * barWidth, 600) - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Clear any existing chart
    d3.select(`#${containerId}`).selectAll('*').remove();

    const svg = d3.select(`#${containerId}`)
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // Set up scales
    const x = d3.scaleBand()
        .domain(data.map(d => d.year))
        .range([0, width])
        .padding(0.1);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.count)])
        .nice()
        .range([height, 0]);

    // Add axes
    svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x).tickFormat(d3.format('d')));

    svg.append('g')
        .call(d3.axisLeft(y));

    // Add bars with animation
    svg.selectAll('.bar')
        .data(data)
        .enter().append('rect')
        .attr('class', 'bar')
        .attr('x', d => x(d.year))
        .attr('y', height) // Start at the bottom
        .attr('width', x.bandwidth())
        .attr('height', 0) // Start with height 0
        .attr('fill', '#ffcc00') // Olympic gold color
        .transition() // Add animation
        .duration(800)
        .attr('y', d => y(d.count))
        .attr('height', d => height - y(d.count));

    // Make the chart scrollable if it overflows
    d3.select(`#${containerId}`).style('overflow-x', 'auto');
    d3.select(`#${containerId} svg`).style('min-width', `${width + margin.left + margin.right}px`);
}

function createPieChart(data, containerId) {
    const width = 300; // Adjusted width
    const height = 300; // Adjusted height
    const radius = Math.min(width, height) / 2;

    // Clear any existing chart
    d3.select(`#${containerId}`).selectAll('*').remove();

    const svg = d3.select(`#${containerId}`)
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .style('background', '#f9f9f9') // Add background for visibility
        .append('g')
        .attr('transform', `translate(${width / 2},${height / 2})`);

    const color = d3.scaleOrdinal()
        .domain(Object.keys(data))
        .range(['#ffd700', '#c0c0c0', '#cd7f32']);

    const pie = d3.pie()
        .value(d => d.value);

    //data's format is [{}, {}, {}]
    // Convert data to the format expected by d3.pie
    // Ensure data is in the correct format for d3.pie
    const data_ready = pie(data.map(d => ({ key: d.year, value: d.count })));

    const arc = d3.arc()
        .innerRadius(0)
        .outerRadius(radius);

    svg.selectAll('path')
        .data(data_ready)
        .enter()
        .append('path')
        .attr('d', arc)
        .attr('fill', d => color(d.data.key))
        .attr('stroke', 'white')
        .style('stroke-width', '2px')
        .style('opacity', 0.8);

    // Add labels to ensure visibility
    svg.selectAll('text')
        .data(data_ready)
        .enter()
        .append('text')
        .text(d => `${d.data.key}: ${d.data.value}`)
        .attr('transform', d => `translate(${arc.centroid(d)})`)
        .style('text-anchor', 'middle')
        .style('font-size', '12px')
        .style('fill', '#333');

    console.log('Data ready for pie chart:', data_ready); // Debugging log
}

fetch('../docs/olympic_data.json').then(res => res.json()).then(olympicData => {
    const colorScale = scaleSequentialSqrt(interpolateYlOrRd);

    // Map medal data to country ISO codes from the heatmap section
    const medalData = Object.entries(olympicData.medal_counts_all).reduce((acc, [isoCode, data]) => {
        acc[isoCode] = data.count;
        // For special cases like URS = RUS, VIE = VNM
        if (isoCode === 'URS') {
            acc['RUS'] = data.count; // Map URS to RUS
        } else if (isoCode === 'VIE') {
            acc['VNM'] = data.count; // Map VIE to VNM
        } else if (isoCode === 'PHI') {
            acc['PHL'] = data.count; // Map PHI to PHL
        }
        return acc;
    }, {});

    console.log('Medal Data (Heatmap):', medalData);

    fetch('./ne_110m_admin_0_countries.geojson').then(res => res.json()).then(countries => {
        // Get the maximum medal count for the color scale
        const maxMedals = Math.max(...Object.values(medalData));
        colorScale.domain([0, maxMedals]);

        createLegend(colorScale, maxMedals);

        // Updated globe and background to be more bright and cheerful
        const world = new Globe(document.getElementById('globeViz'))
            .globeImageUrl('//cdn.jsdelivr.net/npm/three-globe/example/img/earth-day.jpg') // Changed to a brighter day image
            .backgroundImageUrl('//cdn.jsdelivr.net/npm/three-globe/example/img/night-sky.png') // Changed to a cheerful sky image
            .lineHoverPrecision(0)
            .polygonsData(countries.features.filter(d => d.properties.ISO_A2 !== 'AQ'))
            .polygonAltitude(0.06)
            .polygonCapColor(feat => '#f0f0f0') // Brighter cap color
            .polygonSideColor(() => 'rgba(0, 150, 0, 0.3)') // Brighter side color
            .polygonStrokeColor(() => '#333')
            .polygonLabel(({ properties: d }) => `
            <b>${d.ADMIN} (${d.ADM0_A3}):</b> <br />
            Medals: <i>${medalData[d.ADM0_A3] || 0}</i>
            `)
            .onPolygonHover(hoverD => world
                .polygonAltitude(d => d === hoverD ? 0.12 : 0.06)
                .polygonCapColor(d => {
                    const isoCode = d.properties.ADM0_A3;
                    const medalCount = medalData[isoCode] || 0; // Default to 0 if no data
                    if (heatmapEnabled) {
                        return d === hoverD ? 'gold' : colorScale(medalCount); // Highlight with gold
                    } else {
                        return d === hoverD ? 'gold' : '#f0f0f0'; // Default bright color when heatmap is disabled
                    }
                })
            )
            .polygonsTransitionDuration(300);

        // Full-screen popup overlay for country statistics
        const popup = document.createElement('div');
        popup.id = 'country-popup';
        popup.style.display = 'none';
        popup.style.position = 'fixed';
        popup.style.top = '0';
        popup.style.left = '0';
        popup.style.width = '100%';
        popup.style.height = '100%';
        popup.style.background = 'rgba(0, 0, 0, 0.8)';
        popup.style.color = 'white';
        popup.style.zIndex = '1000';
        popup.style.overflow = 'auto';
        document.body.appendChild(popup);

        const popupContent = document.createElement('div');
        popupContent.style.position = 'relative';
        popupContent.style.margin = '50px auto';
        popupContent.style.padding = '20px';
        popupContent.style.background = '#ffffff';
        popupContent.style.color = '#333';
        popupContent.style.fontFamily = '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif';
        popupContent.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
        popupContent.style.borderRadius = '10px';
        popupContent.style.width = '80%';
        popupContent.style.maxWidth = '800px';
        popup.appendChild(popupContent);

        // Adjusted styles to place the country name on the same line as the close button
        const popupHeader = document.createElement('div');
        popupHeader.style.display = 'flex';
        popupHeader.style.justifyContent = 'space-between';
        popupHeader.style.alignItems = 'center';

        const popupCountryName = document.createElement('h2');
        popupCountryName.id = 'popup-country-name';
        popupCountryName.innerText = 'Country Name';
        popupCountryName.style.margin = '0';
        popupCountryName.style.color = '#ffcc00'; // Olympic gold
        popupCountryName.style.fontWeight = 'bold';
        popupCountryName.style.fontSize = '1.5em';
        popupHeader.appendChild(popupCountryName);

        const closeButton = document.createElement('button');
        closeButton.id = 'close-popup';
        closeButton.innerText = 'Close';
        closeButton.style.background = '#ff0000'; // Olympic red
        closeButton.style.color = '#ffffff';
        closeButton.style.fontWeight = 'bold';
        closeButton.style.border = 'none';
        closeButton.style.padding = '5px 10px';
        closeButton.style.cursor = 'pointer';
        closeButton.style.borderRadius = '5px';
        popupHeader.appendChild(closeButton);

        popupContent.appendChild(popupHeader);

        const popupMedalCount = document.createElement('p');
        popupMedalCount.id = 'popup-medal-count';
        popupMedalCount.innerText = 'Medals: 0';
        popupMedalCount.style.color = '#333';
        popupMedalCount.style.fontSize = '1.2em';
        popupContent.appendChild(popupMedalCount);

        // Adjust the layout of the popup-charts container to display charts side by side
        const popupCharts = document.createElement('div');
        popupCharts.id = 'popup-charts';
        popupCharts.style.display = 'flex'; // Use flexbox for layout
        popupCharts.style.justifyContent = 'space-between'; // Add spacing between charts
        popupCharts.style.alignItems = 'flex-start'; // Align charts at the top
        popupCharts.style.marginTop = '20px';
        popupCharts.style.color = '#666';
        popupContent.appendChild(popupCharts);

        // Create separate containers for the bar chart and pie chart
        const barChartContainer = document.createElement('div');
        barChartContainer.id = 'popup-bar-chart';
        barChartContainer.style.flex = '1'; // Allow the bar chart to take up equal space
        barChartContainer.style.marginRight = '10px'; // Add spacing between the charts
        popupCharts.appendChild(barChartContainer);

        const pieChartContainer = document.createElement('div');
        pieChartContainer.id = 'popup-pie-chart';
        pieChartContainer.style.flex = '1'; // Allow the pie chart to take up equal space
        pieChartContainer.style.marginLeft = '100px'; // Add spacing between the charts
        pieChartContainer.style.marginTop = '80px'; // Set a fixed width for the pie chart
        popupCharts.appendChild(pieChartContainer);

        // Add click event to display country statistics in the popup
        world.onPolygonClick(clickedD => {
            const isoCode = clickedD.properties.ADM0_A3;
            const countryName = clickedD.properties.ADMIN;
            const medalCount = medalData[isoCode] || 0;

            document.getElementById('popup-country-name').textContent = countryName;
            document.getElementById('popup-medal-count').textContent = `Total Medals: ${medalCount}`;
            document.getElementById('popup-charts').innerHTML = '<i>Future D3.js charts will go here.</i>';
            document.getElementById('popup-pie-chart').innerHTML = '<i>Future D3.js pie chart will go here.</i>';

            popup.style.display = 'block';
        });

        // Add event listener to close the popup
        closeButton.addEventListener('click', () => {
            popup.style.display = 'none';
        });

        let heatmapEnabled = false; // Set heatmap to be off by default

        document.getElementById('toggle-color').addEventListener('click', () => {
            heatmapEnabled = !heatmapEnabled;
            world.polygonCapColor(feat => {
            if (heatmapEnabled) {
                const isoCode = feat.properties.ADM0_A3;
                const medalCount = medalData[isoCode] || 0; // Default to 0 if no data
                return colorScale(medalCount);
            } else {
                return '#cccccc'; // Default gray color
            }
            });

            // Toggle legend visibility
            const legend = document.getElementById('legend');
            legend.style.display = heatmapEnabled ? 'block' : 'none';
        });

        // Hide the legend by default
        const legend = document.getElementById('legend');
        legend.style.display = 'none';

        // Load and process the CSV data
        d3.csv('../data/athlete_events.csv').then(csvData => {
            world.onPolygonClick(clickedD => {
                const isoCode = clickedD.properties.ADM0_A3;

                const countryName = clickedD.properties.ADMIN;

                // Filter data for the selected country
                const countryData = csvData.filter(d => (d.Team === countryName || d.NOC === isoCode) && d.Medal !== 'NA');

                // Aggregate medal counts by year
                const medalCounts = d3.rollups(
                    countryData,
                    v => v.length,
                    d => +d.Year
                ).map(([year, count]) => ({ year, count }));

                // Sort by year
                medalCounts.sort((a, b) => a.year - b.year);

                // Update popup content
                document.getElementById('popup-country-name').textContent = countryName;
                document.getElementById('popup-medal-count').textContent = `Total Medals: ${countryData.length}`;

                // Create the bar chart
                createBarChart(medalCounts, 'popup-bar-chart');

                // Create the pie chart that shows how many bronze, silver, and gold medals were won by the country
                const medalTypes = ['Gold', 'Silver', 'Bronze'];
                const pieData = medalTypes.map(type => {
                    const count = countryData.filter(d => d.Medal === type).length;
                    return { year: type, count };
                });
                
                createPieChart(pieData, 'popup-pie-chart');

                popup.style.display = 'block';
            });
        });
    });
});