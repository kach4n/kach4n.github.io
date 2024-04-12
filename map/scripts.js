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

map.on('load', () => {
    //map.setFog({});
    map.addControl(nav, 'top-right')
});

function goHome(){
    window.location.href = '/';
}