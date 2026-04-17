/**
 * Weather API Integration Module (OpenWeatherMap)
 */

const BASE_URL = 'https://api.openweathermap.org/data/2.5';

/**
 * Fetch current weather for a specific city or coordinates
 * @param {Object} params - { q: 'CityName' } or { lat, lon }
 */
export const fetchWeather = async (params) => {
    const apiKey = import.meta.env.VITE_WEATHER_API_KEY;

    if (!apiKey || apiKey === 'YOUR_OPENWEATHERMAP_API_KEY') {
        console.warn('Weather API key is missing or not configured in .env');
        throw new Error('API Key Missing');
    }

    const queryParams = new URLSearchParams({
        ...params,
        appid: apiKey,
        units: 'metric' // Default to metric
    });

    try {
        const response = await fetch(`${BASE_URL}/weather?${queryParams}`);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch weather data');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching weather:', error);
        throw error;
    }
};

/**
 * Fetch 5-day weather forecast
 * @param {Object} params - { q: 'CityName' } or { lat, lon }
 */
export const fetchForecast = async (params) => {
    const apiKey = import.meta.env.VITE_WEATHER_API_KEY;

    if (!apiKey) throw new Error('API Key Missing');

    const queryParams = new URLSearchParams({
        ...params,
        appid: apiKey,
        units: 'metric'
    });

    try {
        const response = await fetch(`${BASE_URL}/forecast?${queryParams}`);
        if (!response.ok) {
            throw new Error('Failed to fetch forecast data');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching forecast:', error);
        throw error;
    }
};
