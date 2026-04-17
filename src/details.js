import './style.css';
import './details.css';
import { initMap, loadMapTiler } from './api/maps';

document.addEventListener('DOMContentLoaded', async () => {
    const rawData = localStorage.getItem('selectedRouteData');

    if (!rawData) {
        const title = document.getElementById('route-title');
        if (title) title.innerText = 'ERROR: No Data Found';
        return;
    }

    let routeData;
    try {
        routeData = JSON.parse(rawData);
    } catch (error) {
        const title = document.getElementById('route-title');
        if (title) title.innerText = 'ERROR: Invalid Route Data';
        console.error('Invalid selectedRouteData:', error);
        return;
    }

    const title = document.getElementById('route-title');
    const scoreValue = document.getElementById('risk-score-value');
    const badge = document.getElementById('risk-level-badge');
    const distance = document.getElementById('val-distance');
    const duration = document.getElementById('val-duration');
    const cost = document.getElementById('val-cost');
    const weatherIcon = document.getElementById('val-weather-icon');
    const weatherType = document.getElementById('val-weather-type');
    const weatherTemp = document.getElementById('val-weather-temp');
    const weatherDesc = document.getElementById('val-weather-desc');

    if (title) title.innerText = `Intelligence Report: ${routeData.summary || 'Route'}`;
    if (scoreValue) scoreValue.innerText = routeData.riskScore ?? '--';

    const riskLevel = routeData.riskLevel || 'Low';
    let mainColor = '#10b981';
    if (riskLevel === 'Medium') mainColor = '#f59e0b';
    if (riskLevel === 'High') mainColor = '#ef4444';

    document.documentElement.style.setProperty('--risk-color', mainColor);

    if (badge) {
        badge.innerText = `${riskLevel.toUpperCase()} RISK WARNING`;
        badge.style.color = mainColor;
    }

    if (distance) distance.innerText = routeData.distance || '--';
    if (duration) duration.innerText = routeData.duration || '--';
    if (cost) cost.innerText = `₹${routeData.cost?.totalCost ?? '--'}`;

    if (weatherIcon) weatherIcon.innerText = routeData.weather?.icon || '--';
    if (weatherType) weatherType.innerText = `${routeData.weather?.type || '--'} Conditions`;
    if (weatherTemp) weatherTemp.innerText = routeData.weather?.temp || '--';
    if (weatherDesc) weatherDesc.innerText = routeData.riskReason || 'No weather insight available.';

    const mapElement = document.getElementById('isolated-map');

    if (mapElement) {
        try {
            const map = await initMap(mapElement, {
                zoom: 12,
                interactive: false
            });

            map.on('load', async () => {
                const maptilersdk = await loadMapTiler();

                if (routeData.route?.geometry) {
                    const geojson = routeData.route.geometry;

                    map.addSource('route', {
                        type: 'geojson',
                        data: {
                            type: 'Feature',
                            properties: {},
                            geometry: geojson
                        }
                    });

                    map.addLayer({
                        id: 'route',
                        type: 'line',
                        source: 'route',
                        layout: {
                            'line-join': 'round',
                            'line-cap': 'round'
                        },
                        paint: {
                            'line-color': mainColor,
                            'line-width': 6,
                            'line-opacity': 0.9
                        }
                    });

                    const coords = geojson.coordinates || [];

                    if (coords.length > 0) {
                        const start = coords[0];
                        const end = coords[coords.length - 1];

                        new maptilersdk.Marker({ color: '#10b981' })
                            .setLngLat(start)
                            .addTo(map);

                        new maptilersdk.Marker({ color: '#ef4444' })
                            .setLngLat(end)
                            .addTo(map);

                        const bounds = coords.reduce(
                            (bounds, coord) => bounds.extend(coord),
                            new maptilersdk.LngLatBounds(coords[0], coords[0])
                        );

                        map.fitBounds(bounds, { padding: 40 });
                    }
                }
            });
        } catch (error) {
            console.error('Map initialization failed:', error);
        }
    }

    const closeBtn = document.getElementById('close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            window.location.href = './index.html';
        });
    }

    const printBtn = document.getElementById('print-btn');
    if (printBtn) {
        printBtn.addEventListener('click', () => {
            window.print();
        });
    }
});
