// Define size of map group. Full world map is 2:1 ratio. 
// Using 12:5 because we will crop top and bottom of map
w = 3000;
h = 1250;
// variables for min and max zoom factors
var minZoom;
var maxZoom;

// DEFINE FUNCTIONS/OBJECTS
// Define map projection
var projection = d3
    .geoEquirectangular()
    .center([0, 15]) // set centre to further North as we are cropping more off bottom of map
    .scale([w / (2 * Math.PI)]) // scale to fit group width
    .translate([w / 2, h / 2]); // ensure centred in group;

// Define map path
var path = d3.geoPath().projection(projection);

// Create function to apply zoom to countriesGroup
function zoomed() {
    t = d3.event.transform;
    countriesGroup.attr("transform","translate(" + [t.x, t.y] + ")scale(" + t.k + ")");
}

// Define map zoom behaviour
var zoom = d3.zoom().on("zoom", zoomed);

function getTextBox(selection) {
    selection.each(function(d) {
        d.bbox = this.getBBox();
    });
}

// Function that calculates zoom/pan limits and sets zoom to default value 
function initiateZoom() {

    // Define a "minzoom" whereby the "Countries" is as small possible without leaving white space at top/bottom or sides
    minZoom = Math.max($("#map-holder").width() / w, $("#map-holder").height() / h);

    // set max zoom to a suitable factor of this value
    maxZoom = 20 * minZoom;

    // set extent of zoom to chosen values
    // set translate extent so that panning can't cause map to move out of viewport
    zoom.scaleExtent([minZoom, maxZoom]).translateExtent([[0, 0], [w, h]]);

    // define X and Y offset for centre of map to be shown in centre of holder
    midX = ($("#map-holder").width() - minZoom * w) / 2;
    midY = ($("#map-holder").height() - minZoom * h) / 2;

    // change zoom transform to min zoom and centre offsets
    svg.call(zoom.transform, d3.zoomIdentity.translate(midX, midY).scale(minZoom));
}

// zoom to show a bounding box, with optional additional padding as percentage of box size
function boxZoom(box, centroid, paddingPerc) {
    minXY = box[0];
    maxXY = box[1];

    // find size of map area defined
    zoomWidth = Math.abs(minXY[0] - maxXY[0]);
    zoomHeight = Math.abs(minXY[1] - maxXY[1]);

    // find midpoint of map area defined
    zoomMidX = centroid[0];
    zoomMidY = centroid[1];

    // increase map area to include padding
    zoomWidth = zoomWidth * (1 + paddingPerc / 100);
    zoomHeight = zoomHeight * (1 + paddingPerc / 100);

    // find scale required for area to fill svg
    maxXscale = $("svg").width() / zoomWidth;
    maxYscale = $("svg").height() / zoomHeight;
    zoomScale = Math.min(maxXscale, maxYscale);

    // handle some edge cases
    // limit to max zoom (handles tiny countries)
    zoomScale = Math.min(zoomScale, maxZoom);

    // limit to min zoom (handles large countries and countries that span the date line)
    zoomScale = Math.max(zoomScale, minZoom);

    // Find screen pixel equivalent once scaled
    offsetX = zoomScale * zoomMidX;
    offsetY = zoomScale * zoomMidY;

    // Find offset to centre, making sure no gap at left or top of holder
    dleft = Math.min(0, $("svg").width() / 2 - offsetX);
    dtop = Math.min(0, $("svg").height() / 2 - offsetY);

    // Make sure no gap at bottom or right of holder
    dleft = Math.max($("svg").width() - w * zoomScale, dleft);
    dtop = Math.max($("svg").height() - h * zoomScale, dtop);

    // set zoom
    svg.transition().duration(500).call(
        zoom.transform,
        d3.zoomIdentity.translate(dleft, dtop).scale(zoomScale)
    );
}

// on window resize
$(window).resize(function() {
    // Resize SVG
    svg.attr("width", $("#map-holder").width()).attr("height", $("#map-holder").height());
    initiateZoom();
});

// create an SVG
var svg = d3
    .select("#map-holder")
    .append("svg")
    // set to the same size as the "map-holder" div
    .attr("width", $("#map-holder").width())
    .attr("height", $("#map-holder").height())
    // add zoom functionality
    .call(zoom);

// get map data
d3.json(
    "./custom50.json",
    function(json) {
        //Bind data and create one path per GeoJSON feature
        countriesGroup = svg.append("g").attr("id", "map");

        // Set rectangle background to fill the whole SVG
        countriesGroup
            .append("rect")
            .attr("class", "mapBackground")
            .attr("width", w)
            .attr("height", h)
            .attr("fill", "#2A2C39");

        // draw a path for each feature/country
        countries = countriesGroup
            .selectAll("path")
            .data(json.features)
            .enter()
            .append("path")
            .attr("d", path)
            .attr("id", function(d, i) {return "country" + d.properties.iso_a3;})
            .attr("class", "country")

            // add a mouseover action to show name label for feature/country
            .on("mouseover", function(d, i) {
                d3.select("#countryLabel" + d.properties.iso_a3).style("display", "block");
            })
            .on("mouseout", function(d, i) {
                d3.select("#countryLabel" + d.properties.iso_a3).style("display", "none");
            })
            // add an onclick action to zoom into clicked country
            .on("click", function(d, i) {
                d3.selectAll(".country").classed("country-on", false);
                d3.select(this).classed("country-on", true);
                boxZoom(path.bounds(d), path.centroid(d), 20);

                // Add click event to display country statistics in the popup
                console.log('Country clicked:', d.properties.admin); // Debugging log to check if the event is firing

                const countryName = d.properties.admin; // Adjust based on your GeoJSON structure
                const event = new CustomEvent("countrySelected", { detail: { countryName } });
                document.dispatchEvent(event);
                
                console.log('Event dispatched:', countryName); // Debugging log to check if the event is dispatched
            });
        
        // Add a label group to each feature/country. This will contain the country name and a background rectangle
        // Use CSS to have class "countryLabel" initially hidden
        countryLabels = countriesGroup
            .selectAll("g")
            .data(json.features)
            .enter()
            .append("g")
            .attr("class", "countryLabel")
            .attr("id", function(d) {return "countryLabel" + d.properties.iso_a3;})
            .attr("transform", function(d) {
                return (
                "translate(" + path.centroid(d)[0] + "," + path.centroid(d)[1] + ")"
                );
            })
            // add mouseover functionality to the label
            .on("mouseover", function(d, i) {
                d3.select(this).style("display", "block");
            })
            .on("mouseout", function(d, i) {
                    d3.select(this).style("display", "none");
            })
            // add an onlcick action to zoom into clicked country
            .on("click", function(d, i) {
                d3.selectAll(".country").classed("country-on", false);
                d3.select("#country" + d.properties.iso_a3).classed("country-on", true);
                boxZoom(path.bounds(d), path.centroid(d), 20);
            });
        
            // add the text to the label group showing country name
        countryLabels
            .append("text")
            .attr("class", "countryName")
            .style("text-anchor", "middle")
            .attr("dx", 0)
            .attr("dy", 0)
            .text(function(d) {return d.properties.name;})
            .call(getTextBox);

        // add a background rectangle the same size as the text
        countryLabels
            .insert("rect", "text")
            .attr("class", "countryLabelBg")
            .attr("transform", function(d) {return "translate(" + (d.bbox.x - 2) + "," + d.bbox.y + ")";})
            .attr("width", function(d) {return d.bbox.width + 4;})
            .attr("height", function(d) {return d.bbox.height;});

        initiateZoom();
    }
);

// Add a popup overlay for country statistics
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

const popupHeader = document.createElement('div');
popupHeader.style.display = 'flex';
popupHeader.style.justifyContent = 'space-between';
popupHeader.style.alignItems = 'center';

const popupCountryName = document.createElement('h2');
popupCountryName.id = 'popup-country-name';
popupCountryName.innerText = 'Country Name';
popupCountryName.style.margin = '0';
popupCountryName.style.color = '#ffcc00'; // Olympic gold
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
popupMedalCount.style.fontWeight = 'bold';
popupContent.appendChild(popupMedalCount);

// Add event listener to close the popup
closeButton.addEventListener('click', () => {
    popup.style.display = 'none';
});

// Modify the Collapse button to pass along scroll position
document.getElementById('collapse-button').addEventListener('click', () => {
    
    // Navigate back to main page with scroll position in URL
    window.location.href = `../index.html?scroll=${mainScrollPos}`;
});