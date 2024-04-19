mapboxgl.accessToken = 'pk.eyJ1IjoibHVpemthY2hhbiIsImEiOiJjbGl0NTV1dDgwMG12M3FyMTk1aDFjNnZhIn0.aaInZpRhi9GhIMIfiacXVA';
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/satellite-streets-v12',
    zoom: 5,
    center: [-50.1, -22.3],
    projection: 'globe',
    attributionControl: false
});

const nav = new mapboxgl.NavigationControl({
    showCompass: false
})

map.on('load', async () => {
    //map.setFog({});
    map.addControl(nav, 'top-right')
    const zipFilePath = 'word-json.zip';
    try {
        // Fetch the zip file
        const response = await fetch(zipFilePath);
        if (!response.ok) {
            throw new Error('Failed to fetch zip file');
        }

        // Load the zip file using jszip
        const zip = await JSZip.loadAsync(await response.blob());

        // Extract the JSON file (assuming it's named data.json inside the zip)
        const jsonFile = await zip.file('ne_10m_admin_1_states_provinces_scale_rank.json').async('string');

        // Parse the JSON data
        const jsonData = JSON.parse(jsonFile);

        // Add the JSON data as a source to the map
        map.addSource('my-json-data', {
            type: 'geojson',
            data: jsonData // Use the parsed JSON data
        });

        // Add a layer to the map using the added source
        map.addLayer({
            id: 'my-json-layer',
            type: 'fill',
            source: 'my-json-data',
            paint: {
                'fill-color': 'orange', // Initial fill color (blue)
                'fill-opacity': 0.9,
                'fill-outline-color': 'black', // Border color (black)
                'fill-outline-width': 1 // Border width (in pixels)
            }
            
        });
        map.on('click', 'my-json-layer', (e) => {
            // Get the first feature from the clicked layer
            const feature = e.features[0];
    
            // Extract properties from the clicked feature
            const properties = feature.properties;
    
            // Create HTML content for the popup
            const popupContent = `<h3>${properties.name}</h3>
                                  <p><strong>País:</strong> ${properties.admin}</p>
                                  <p><strong>iza linda</strong> ${''}</p>`;
    
            // Create a popup and display it on the map
            new mapboxgl.Popup()
                .setLngLat(e.lngLat)
                .setHTML(popupContent)
                .addTo(map);
        });
        map.on('mouseenter', 'my-json-layer', () => {
            map.getCanvas().style.cursor = 'pointer';
        });
        
        // Change it back to the default cursor when no longer hovering
        map.on('mouseleave', 'my-json-layer', () => {
            map.getCanvas().style.cursor = '';
        });
        console.log(`aparently allright`)

}catch (error) {
    console.error('Error loading and processing zip file:', error);
}});


function goHome(){
    window.location.href = '/';
}