/**
 * MapTiler API Integration Module
 * Powered by MapTiler SDK for high-performance logistics visualization
 */

let maptilerPromise = null;

/**
 * Dynamically loads MapTiler SDK and its required CSS
 * @returns {Promise} Resolves with the maptilersdk object
 */
export const loadMapTiler = () => {
    if (maptilerPromise) return maptilerPromise;

    const apiKey = import.meta.env.VITE_MAPTILER_API_KEY;

    if (!apiKey) {
        console.error('MapTiler API key is missing or not configured in .env');
        return Promise.reject('API Key Missing');
    }

    maptilerPromise = new Promise((resolve, reject) => {
        // Check if already loaded
        if (typeof window.maptilersdk !== 'undefined') {
            resolve(window.maptilersdk);
            return;
        }

        // Add MapTiler CSS
        const link = document.createElement('link');
        link.href = 'https://cdn.maptiler.com/maptiler-sdk-js/v2.0.3/maptiler-sdk.css';
        link.rel = 'stylesheet';
        document.head.appendChild(link);

        // Add MapTiler SDK JS
        const script = document.createElement('script');
        script.src = 'https://cdn.maptiler.com/maptiler-sdk-js/v2.0.3/maptiler-sdk.umd.min.js';
        script.async = true;

        script.onload = () => {
            window.maptilersdk.config.apiKey = apiKey;
            resolve(window.maptilersdk);
        };

        script.onerror = (error) => {
            console.error('MapTiler SDK failed to load:', error);
            reject(error);
        };

        document.head.appendChild(script);
    });

    return maptilerPromise;
};

// Export as loadMapbox for minor compatibility during transition if needed
export const loadMapbox = loadMapTiler;

/**
 * Initialize a MapTiler map on a given element
 * @param {HTMLElement} element 
 * @param {Object} options 
 */
export const initMap = async (element, options = {}) => {
    const maptilersdk = await loadMapTiler();
    
    const defaultOptions = {
        container: element,
        style: maptilersdk.MapStyle.DATAVIZ.DARK, // Premium dark logistics theme
        center: [78.9629, 20.5937], // [lng, lat]
        zoom: 4,
        terrain: true, // Enable 3D terrain
        navigationControl: 'top-right'
    };
    
    const map = new maptilersdk.Map({ ...defaultOptions, ...options });

    return map;
};
