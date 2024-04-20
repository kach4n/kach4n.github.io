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
    try {
        var jsonParquet = []
        const parquetConverter = await new ParquetConverter('world-parquet.parquet')
        await parquetConverter.convertAndReturnJSON()
        .then(json => {
            console.log(json)
            jsonParquet = json
            addSource('jsonParquet', jsonParquet)
            addLayer('jsonParquetLayer', 'jsonParquet')
            addClickLayer('jsonParquetLayer')
        })
        .catch(error => {
            console.error('Erro durante a conversão:', error);
        });

        map.on('mouseenter', 'jsonParquetLayer', () => {
            map.getCanvas().style.cursor = 'pointer';
        });
        
        map.on('mouseleave', 'jsonParquetLayer', () => {
            map.getCanvas().style.cursor = '';
        });
        console.log(`aparently allright`)

}catch (error) {
    console.error('Error loading and processing zip file:', error);
}});

function addSource(name, geojson){
    map.addSource(name, {
        type: 'geojson',
        data: geojson // Use the parsed JSON data
    });
}

function addLayer(name, source){
    map.addLayer({
        id: name,
        type: 'fill',
        source: source,
        paint: {
            'fill-color': 'orange', // Initial fill color (blue)
            'fill-opacity': 0.9,
            'fill-outline-color': 'black', // Border color (black)
            'fill-outline-width': 1 // Border width (in pixels)
        }
        
    });
}

function addClickLayer(layer){
    map.on('click', layer, (e) => {
        // Get the first feature from the clicked layer
        const feature = e.features[0];

        // Extract properties from the clicked feature
        const properties = feature.properties;

        // Create HTML content for the popup
        const popupContent = `<h3>${properties.name}</h3>
                              <p><strong>País:</strong> ${properties.admin}</p>`;

        // Create a popup and display it on the map
        new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(popupContent)
            .addTo(map);
    });
}
function goHome(){
    window.location.href = '/';
}