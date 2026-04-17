import './style.css';
import './details.css';
import { initMap, loadMapTiler } from './api/maps';

document.addEventListener("DOMContentLoaded", () => {
    // 1. Fetch data from localStorage
    const rawData = localStorage.getItem('selectedRouteData');
    
    if (!rawData) {
        document.getElementById('route-title').innerText = "ERROR: No Data Found";
        return;
    }

    const routeData = JSON.parse(rawData);
    
    // 2. Populate Header & Metrics
    document.getElementById('route-title').innerText = `Intelligence Report: ${routeData.summary}`;
    document.getElementById('risk-score-value').innerText = routeData.riskScore;
    
    const badge = document.getElementById('risk-level-badge');
    badge.innerText = `${routeData.riskLevel.toUpperCase()} RISK WARNING`;
    
    // Set colors based on risk
    let mainColor = '#10b981'; // low
    if (routeData.riskLevel === 'Medium') mainColor = '#f59e0b';
    if (routeData.riskLevel === 'High') mainColor = '#ef4444';
    
    document.documentElement.style.setProperty('--risk-color', mainColor);
    badge.style.color = mainColor;
    
    document.getElementById('val-distance').innerText = routeData.distance;
    document.getElementById('val-duration').innerText = routeData.duration;
    document.getElementById('val-cost').innerText = `₹${routeData.cost.totalCost}`;
    
    // 3. Populate Weather
    document.getElementById('val-weather-icon').innerText = routeData.weather.icon;
    document.getElementById('val-weather-type').innerText = routeData.weather.type + " Conditions";
    document.getElementById('val-weather-temp').innerText = routeData.weather.temp;
    document.getElementById('val-weather-desc').innerText = routeData.riskReason;

    // 4. Initialize Isolated Map View
    const mapElement = document.getElementById('isolated-map');
    if (mapElement) {
        initMap(mapElement, {
            zoom: 12,
            interactive: false // Disable interaction for reports
        }).then(map => {
            map.on('load', async () => {
                const maptilersdk = await loadMapTiler();
                
                // Draw Route
                if (routeData.route && routeData.route.geometry) {
                    const geojson = routeData.route.geometry;
                    
                    map.addSource('route', {
                        'type': 'geojson',
                        'data': {
                            'type': 'Feature',
                            'properties': {},
                            'geometry': geojson
                        }
                    });

                    map.addLayer({
                        'id': 'route',
                        'type': 'line',
                        'source': 'route',
                        'layout': {
                            'line-join': 'round',
                            'line-cap': 'round'
                        },
                        'paint': {
                            'line-color': mainColor,
                            'line-width': 6,
                            'line-opacity': 0.9
                        }
                    });

                    // Add markers
                    const coords = geojson.coordinates;
                    if (coords.length > 0) {
                        const start = coords[0];
                        const end = coords[coords.length - 1];

                        new maptilersdk.Marker({ color: '#10b981' })
                            .setLngLat(start)
                            .addTo(map);

                        new maptilersdk.Marker({ color: '#ef4444' })
                            .setLngLat(end)
                            .addTo(map);

                        // Fit bounds
                        const bounds = coords.reduce((bounds, coord) => {
                            return bounds.extend(coord);
                        }, new maptilersdk.LngLatBounds(coords[0], coords[0]));
                        
                        map.fitBounds(bounds, { padding: 40 });
                    }
                }
            });
        });
    }

    // 6. Bind Buttons
    document.getElementById('close-btn').addEventListener('click', () => {
        window.location.href = '/';
    });

    document.getElementById('print-btn').addEventListener('click', () => {
        window.print();
    });
});
