import './style.css'
import { initMap, loadMapTiler } from './api/maps'
import { fetchWeather } from './api/weather'
import { calculateTravelCost } from './api/costEstimator'

// --- State ---
let map;
let routeLayers = [];
let activeRoutes = [];

// --- Initialization ---
async function initializeApplication() {
  const mapElement = document.getElementById('map');
  if (mapElement) {
    try {
      map = await initMap(mapElement);
      // Bind UI Events
      document.getElementById('find-routes-btn').addEventListener('click', calculateRoutes);
    } catch (error) {
      console.error("Map initialization failed:", error);
    }
  }
}

// Ensure initMap and Auth are processed when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
    // --- AUTHENTICATION LOGIC ---
    const splashScreen = document.getElementById('splash-screen');
    const authScreen = document.getElementById('auth-screen');
    const authForm = document.getElementById('login-form');
    
    // Auto-login if data exists (persisted session) - skip both splash and login
    if (localStorage.getItem('userProfileData')) {
        if (splashScreen) splashScreen.style.display = 'none';
        if (authScreen)   authScreen.classList.add('hidden');
    }

    if (authForm) {
        authForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const email = document.getElementById('auth-email').value;
            const password = document.getElementById('auth-password').value;
            
            // Seed standard profile login details
            const profileData = {
                name: "Admin User", 
                email: email,
                password: password,
                phone: ""
            };
            localStorage.setItem('userProfileData', JSON.stringify(profileData));
            
            // Animate Button
            const btn = authForm.querySelector('button[type="submit"]');
            const originalHTML = btn.innerHTML;
            btn.innerHTML = `<span>Authenticating...</span>`;
            btn.style.opacity = '0.8';
            
            setTimeout(() => {
                authScreen.style.opacity = '0';
                authScreen.style.transition = 'opacity 0.5s ease';
                setTimeout(() => {
                    authScreen.classList.add('hidden');
                    authScreen.style.display = 'none';
                    btn.innerHTML = originalHTML;
                    btn.style.opacity = '1';
                }, 500);
            }, 800);
        });
    }

    // --- CORE SYSTEM INITIALIZATION ---
    initializeApplication();
});

// --- Logic ---

async function geocode(address) {
  try {
    const maptilersdk = await loadMapTiler();
    const result = await maptilersdk.geocoding.forward(address);
    if (result && result.features && result.features.length > 0) {
      return result.features[0].center; // [lng, lat]
    }
  } catch(e) {
    console.error("Geocoding failed", e);
  }
  return null;
}

async function calculateRoutes() {
  const originAddr = document.getElementById('origin-input').value;
  const destAddr = document.getElementById('destination-input').value;

  if (!originAddr || !destAddr) {
    alert("Please enter both origin and destination.");
    return;
  }
  
  const btn = document.getElementById('find-routes-btn');
  const ogText = btn.querySelector('span').innerText;
  btn.querySelector('span').innerText = "Analyzing Risks...";

  // 1. Geocode both locations using MapTiler Geocoding
  const originCoords = await geocode(originAddr);
  const destCoords = await geocode(destAddr);

  if (!originCoords || !destCoords) {
    alert("Could not accurately locate one or both locations. Try adding a city/country.");
    btn.querySelector('span').innerText = ogText;
    return;
  }

  // 2. Fetch driving routes using Open Source Routing Machine (OSRM)
  // Format: lon,lat;lon,lat
  const url = `https://router.project-osrm.org/route/v1/driving/${originCoords[0]},${originCoords[1]};${destCoords[0]},${destCoords[1]}?alternatives=3&geometries=geojson&overview=full`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.code === 'Ok' && data.routes.length > 0) {
      await processRoutes(data.routes);
    } else {
      alert("No routes found between these locations.");
    }
  } catch(e) {
    console.error("Routing request failed: ", e);
    alert("Error fetching routes.");
  } finally {
    btn.querySelector('span').innerText = ogText;
  }
}

async function processRoutes(routes) {
  // Clear old layers
  routeLayers.forEach(id => {
    if (map.getLayer(id)) map.removeLayer(id);
    const sourceId = id.replace('route-', 'source-');
    if (map.getSource(sourceId)) map.removeSource(sourceId);
  });
  routeLayers = [];

  // Use Promise.all to fetch weather for all routes in parallel
  activeRoutes = await Promise.all(routes.map(async (route, index) => {
    const distanceMeter = route.distance;
    const durationSec = route.duration;
    const distanceKm = distanceMeter / 1000;
    
    // Get user defined parameters for cost estimation
    const vehicleType = document.getElementById('vehicle-type').value;
    const fuelPrice = parseFloat(document.getElementById('fuel-price').value) || 1.5;
    
    // Calculate Travel Cost
    const costData = calculateTravelCost(distanceKm, vehicleType, fuelPrice);
    
    // AI Risk Scoring logic (Simulated multi-factor based on route variant)
    const riskData = calculateRiskScore(distanceMeter, durationSec, index);
    
    // Convert metrics
    const distStr = (distanceMeter / 1000).toFixed(1) + " km";
    const durStr = Math.round(durationSec / 60) + " mins";
    
    // Get real weather for the destination or midpoint
    const midPoint = route.geometry.coordinates[Math.floor(route.geometry.coordinates.length / 2)];
    const weatherData = await getWeatherForRoute(index, midPoint[1], midPoint[0]);
    
    return {
      id: index,
      route: route, // raw geojson
      distance: distStr,
      duration: durStr,
      riskScore: riskData.score,
      riskLevel: riskData.level,
      riskReason: riskData.reason,
      weather: weatherData,
      cost: costData,
      summary: index === 0 ? 'Primary Route' : 'Alternative Route ' + index
    };
  }));

  // Sort by risk score (lowest first)
  activeRoutes.sort((a, b) => a.riskScore - b.riskScore);

  renderInsights(activeRoutes);
  
  // Draw primary path prominently, others faded
  if(activeRoutes.length > 1) {
      for(let i = activeRoutes.length - 1; i >= 0; i--) {
          drawRouteOnMap(activeRoutes[i].id, i === 0);
      }
  } else {
      drawRouteOnMap(activeRoutes[0].id, true);
  }
}

function calculateRiskScore(dist, dur, index) {
  // Simulating multi-factor AI risk scoring
  let baseScore = Math.floor(Math.random() * 70) + 20; 
  baseScore += (index * 10);

  let level = "Low";
  let reason = "Optimal conditions detected. Path geometry is clear.";

  if (baseScore > 65) {
    level = "High";
    reason = "Severe weather warnings and historical congestion detected along route.";
  } else if (baseScore > 40) {
    level = "Medium";
    reason = "Moderate crosswinds and light congestion reported ahead.";
  }

  return {
    score: Math.min(baseScore, 100),
    level: level,
    reason: reason
  };
}

async function getWeatherForRoute(index, lat, lon) {
  try {
    const data = await fetchWeather({ lat, lon });
    return {
      type: data.weather[0].main,
      temp: `${Math.round(data.main.temp)}°C`,
      icon: getWeatherIcon(data.weather[0].icon)
    };
  } catch (error) {
    console.warn("Falling back to simulated weather");
    return simulateWeather(index);
  }
}

function getWeatherIcon(iconCode) {
  const iconMap = {
    '01d': '☀️', '01n': '🌙',
    '02d': '⛅', '02n': '☁️',
    '03d': '☁️', '03n': '☁️',
    '04d': '☁️', '04n': '☁️',
    '09d': '🌧️', '09n': '🌧️',
    '10d': '🌦️', '10n': '🌦️',
    '11d': '⛈️', '11n': '⛈️',
    '13d': '❄️', '13n': '❄️',
    '50d': '🌫️', '50n': '🌫️'
  };
  return iconMap[iconCode] || '🌡️';
}

function simulateWeather(index) {
  const conditions = [
    { type: 'Clear', temp: '24°C', icon: '☀️' },
    { type: 'Rain', temp: '19°C', icon: '🌧️' },
    { type: 'Storm', temp: '18°C', icon: '⛈️' },
    { type: 'Cloudy', temp: '22°C', icon: '☁️' }
  ];
  return conditions[(index + Math.floor(Math.random()*2)) % conditions.length];
}

// --- UI Rendering ---

function renderInsights(routes) {
  const container = document.getElementById('route-options-list');
  const panel = document.getElementById('insights-panel');
  const welcome = document.getElementById('welcome-card');
  
  if (welcome) welcome.classList.add('hidden');
  
  container.innerHTML = '';
  panel.classList.remove('hidden');
  panel.classList.add('animate-fade-in');

  routes.forEach((r, idx) => {
    const card = document.createElement('div');
    card.className = `route-card ${idx === 0 ? 'selected' : ''}`;
    card.innerHTML = `
      <div class="route-header">
        <span class="route-name">${r.summary}</span>
        <div style="display: flex; gap: 8px;">
          <span class="cost-badge" title="Est. Fuel: ${r.cost.fuelNeeded}L">💰 ₹${r.cost.totalCost}</span>
          <span class="risk-badge ${r.riskLevel.toLowerCase()}">${r.riskLevel} Risk</span>
        </div>
      </div>
      <div class="route-details">
        <div class="detail-item"><span>📏</span> ${r.distance}</div>
        <div class="detail-item"><span>⏱️</span> ${r.duration}</div>
        <div class="detail-item"><span>${r.weather.icon}</span> ${r.weather.type}</div>
        <div class="detail-item"><span>🌡️</span> ${r.weather.temp}</div>
      </div>
      <p style="font-size: 0.85rem; margin-top: 12px; opacity: 0.8; color: #94a3b8;">${r.riskReason}</p>
      ${idx === 0 ? `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 12px;">
          <div style="font-size: 0.85rem; color: #38bdf8; font-weight: 700; letter-spacing: 0.5px;">✨ RECOMMENDED</div>
          <button class="view-report-btn" onclick="window.location.href='/route-details.html'" style="background: rgba(56, 189, 248, 0.1); border: 1px solid rgba(56, 189, 248, 0.3); color: #38bdf8; padding: 4px 10px; border-radius: 6px; font-size: 0.75rem; cursor: pointer; font-weight: 600;">View Report</button>
        </div>
      ` : ''}
    `;
    
    card.addEventListener('click', () => {
      document.querySelectorAll('.route-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      
      // Clear and redraw routes based on new selection
      routeLayers.forEach(id => {
        if (map.getLayer(id)) map.removeLayer(id);
        const sourceId = id.replace('route-', 'source-');
        if (map.getSource(sourceId)) map.removeSource(sourceId);
      });
      routeLayers = [];
      
      activeRoutes.forEach(ar => {
          if (ar.id !== r.id) drawRouteOnMap(ar.id, false);
      });
      drawRouteOnMap(r.id, true);
      
      localStorage.setItem('selectedRouteData', JSON.stringify(r));
    });

    container.appendChild(card);
  });

  updateWeatherWidget(routes[0].weather);
  
  // Persist primary route for reports
  localStorage.setItem('selectedRouteData', JSON.stringify(routes[0]));
}

function updateWeatherWidget(weather) {
  const widget = document.getElementById('weather-widget');
  widget.classList.remove('hidden');
  widget.innerHTML = `
    <div style="font-size: 2.5rem;">${weather.icon}</div>
    <div class="weather-info">
      <h3>${weather.type} conditions</h3>
      <p>Predicted along current route</p>
    </div>
    <div class="weather-temp">${weather.temp}</div>
  `;
}

async function drawRouteOnMap(routeId, isPrimary) {
  const routeObj = activeRoutes.find(r => r.id === routeId);
  const color = getRiskColor(routeObj.riskLevel);
  const geojson = routeObj.route.geometry;
  
  const layerId = `route-${routeId}`;
  const sourceId = `source-${routeId}`;

  const maptilersdk = await loadMapTiler();

  map.addSource(sourceId, {
    'type': 'geojson',
    'data': {
      'type': 'Feature',
      'properties': {},
      'geometry': geojson
    }
  });

  map.addLayer({
    'id': layerId,
    'type': 'line',
    'source': sourceId,
    'layout': {
      'line-join': 'round',
      'line-cap': 'round'
    },
    'paint': {
      'line-color': color,
      'line-width': isPrimary ? 8 : 4,
      'line-opacity': isPrimary ? 0.9 : 0.4
    }
  });
  
  routeLayers.push(layerId);
  
  if (isPrimary) {
      const coordinates = geojson.coordinates;
      const bounds = coordinates.reduce((bounds, coord) => {
        return bounds.extend(coord);
      }, new maptilersdk.LngLatBounds(coordinates[0], coordinates[0]));
      
      map.fitBounds(bounds, { padding: 80, duration: 1000 });
  }
}

function getRiskColor(level) {
  switch(level) {
    case 'High': return '#ef4444';
    case 'Medium': return '#f59e0b';
    default: return '#10b981';
  }
}
