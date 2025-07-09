// src/pages/Weather.jsx (UPDATED with One Call API)
import { useState, useEffect, useCallback } from 'react';
import { 
    MapPinIcon, 
    MagnifyingGlassIcon,
    SunIcon, 
    CloudIcon, 
    BoltIcon,
} from '@heroicons/react/24/outline';

// IMPORTANT: You need a free API key from OpenWeatherMap
// The One Call API is available on the free plan.
const API_KEY = '517ebd554d1ef8598a3155591ca4a032';
const GEO_API_URL = 'https://api.openweathermap.org/geo/1.0';
const WEATHER_API_URL = 'https://api.openweathermap.org/data/3.0/onecall';

// --- Custom Icons (to avoid import errors) ---
const SnowIcon = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v20M2 12h20M4.929 4.929l14.142 14.142M4.929 19.071L19.071 4.929M2 12l3.429-6.071M22 12l-3.429-6.071M2 12l3.429 6.071M22 12l-3.429 6.071" />
    </svg>
);
const MistIcon = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
);
const RainIcon = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C13.18 7.061 14.285 7 15 7a4.5 4.5 0 014.5 4.5v.643" />
    </svg>
);

// --- Weather Icon Mapping ---
const getWeatherIcon = (iconCode, size = "h-24 w-24") => {
    const mainIcon = iconCode.slice(0, 2);
    const iconMap = {
        '01': <SunIcon className={`${size} text-yellow-500`} />,
        '02': <CloudIcon className={`${size} text-gray-400`} />,
        '03': <CloudIcon className={`${size} text-gray-500`} />,
        '04': <CloudIcon className={`${size} text-gray-600`} />,
        '09': <RainIcon className={`${size} text-blue-500`} />,
        '10': <RainIcon className={`${size} text-blue-400`} />,
        '11': <BoltIcon className={`${size} text-yellow-500`} />,
        '13': <SnowIcon className={`${size} text-blue-200`} />,
        '50': <MistIcon className={`${size} text-gray-400`} />,
    };
    return iconMap[mainIcon] || <SunIcon className={`${size} text-gray-400`} />;
};

const Weather = () => {
    const [locationName, setLocationName] = useState('Guntur'); // Default location
    const [weatherData, setWeatherData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const fetchWeatherData = useCallback(async (lat, lon) => {
        setLoading(true);
        setError('');
        if (API_KEY === 'YOUR_OPENWEATHERMAP_API_KEY') {
            setError('IMPORTANT: Please add your OpenWeatherMap API key to the Weather.jsx file.');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${WEATHER_API_URL}?lat=${lat}&lon=${lon}&exclude=minutely,alerts&appid=${API_KEY}&units=metric`);
            if (!response.ok) throw new Error('Could not fetch weather data.');
            const data = await response.json();
            setWeatherData(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchCoordinatesAndWeather = useCallback(async (loc) => {
        setLoading(true);
        setError('');
        setLocationName(loc);
        try {
            const geoResponse = await fetch(`${GEO_API_URL}/direct?q=${loc}&limit=1&appid=${API_KEY}`);
            if (!geoResponse.ok) throw new Error('Could not find location.');
            const geoData = await geoResponse.json();
            if (geoData.length === 0) throw new Error('Location not found. Please try another.');
            const { lat, lon } = geoData[0];
            fetchWeatherData(lat, lon);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    }, [fetchWeatherData]);

    const getUserLocation = useCallback(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    try {
                        const response = await fetch(`${GEO_API_URL}/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`);
                        const data = await response.json();
                        const cityName = data[0]?.name || 'Your Location';
                        setLocationName(cityName);
                        fetchWeatherData(latitude, longitude);
                    } catch {
                        fetchCoordinatesAndWeather('Guntur'); // Fallback to default
                    }
                },
                () => fetchCoordinatesAndWeather('Guntur') // User denied
            );
        } else {
            fetchCoordinatesAndWeather('Guntur'); // Geolocation not supported
        }
    }, [fetchCoordinatesAndWeather, fetchWeatherData]);

    useEffect(() => {
        getUserLocation();
    }, [getUserLocation]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchTerm) {
            fetchCoordinatesAndWeather(searchTerm);
        }
    };
    
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-green-100 p-4 sm:p-6 lg:p-8">
            <div className="max-w-6xl mx-auto">
                <form onSubmit={handleSearch} className="mb-8 flex gap-2">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Enter a city name..."
                        className="flex-grow p-3 rounded-lg shadow-sm border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    />
                    <button type="submit" className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-700 transition flex items-center justify-center" title="Search">
                        <MagnifyingGlassIcon className="h-5 w-5" />
                    </button>
                    <button type="button" onClick={getUserLocation} className="bg-gray-600 text-white px-4 py-3 rounded-lg shadow-md hover:bg-gray-700 transition flex items-center justify-center" title="Get weather for my location">
                        <MapPinIcon className="h-5 w-5" />
                    </button>
                </form>

                {loading && (
                    <div className="text-center py-20">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto"></div>
                        <p className="mt-4 text-lg text-gray-600">Fetching weather data...</p>
                    </div>
                )}

                {error && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-6 rounded-lg shadow-md text-center">
                        <p className="font-bold">Error</p>
                        <p>{error}</p>
                    </div>
                )}

                {weatherData && (
                    <div className="animate-fade-in space-y-8">
                        {/* Current Weather Section */}
                        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-6 md:p-8 flex flex-col md:flex-row items-center justify-between">
                            <div className="flex-1 text-center md:text-left">
                                <h1 className="text-4xl md:text-5xl font-bold text-gray-800">{locationName}</h1>
                                <p className="text-lg text-gray-600 capitalize">{weatherData.current.weather[0].description}</p>
                                <p className="text-7xl md:text-8xl font-bold text-gray-900 my-4">{Math.round(weatherData.current.temp)}°C</p>
                                <p className="text-md text-gray-500">Feels like {Math.round(weatherData.current.feels_like)}°C</p>
                            </div>
                            <div className="flex-shrink-0">
                                {getWeatherIcon(weatherData.current.weather[0].icon, "h-32 w-32")}
                            </div>
                            <div className="w-full md:w-auto grid grid-cols-2 gap-x-8 gap-y-4 mt-6 md:mt-0 md:ml-8 text-sm">
                                <div className="font-semibold text-gray-800">High: <span className="font-normal text-gray-600">{Math.round(weatherData.daily[0].temp.max)}°C</span></div>
                                <div className="font-semibold text-gray-800">Low: <span className="font-normal text-gray-600">{Math.round(weatherData.daily[0].temp.min)}°C</span></div>
                                <div className="font-semibold text-gray-800">Humidity: <span className="font-normal text-gray-600">{weatherData.current.humidity}%</span></div>
                                <div className="font-semibold text-gray-800">Wind: <span className="font-normal text-gray-600">{weatherData.current.wind_speed} m/s</span></div>
                                <div className="font-semibold text-gray-800">UV Index: <span className="font-normal text-gray-600">{weatherData.current.uvi}</span></div>
                                <div className="font-semibold text-gray-800">Visibility: <span className="font-normal text-gray-600">{weatherData.current.visibility / 1000} km</span></div>
                            </div>
                        </div>

                        {/* Hourly Forecast */}
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Hourly Forecast</h2>
                            <div className="bg-white/60 backdrop-blur-sm rounded-xl shadow-md p-4 flex overflow-x-auto space-x-4">
                                {weatherData.hourly.slice(0, 24).map((hour, index) => (
                                    <div key={index} className="flex flex-col items-center flex-shrink-0 p-2 rounded-lg hover:bg-gray-200/50">
                                        <p className="text-sm font-medium text-gray-600">{new Date(hour.dt * 1000).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true })}</p>
                                        <div className="my-1">{getWeatherIcon(hour.weather[0].icon, "h-10 w-10")}</div>
                                        <p className="text-lg font-bold text-gray-800">{Math.round(hour.temp)}°</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Daily Forecast */}
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">8-Day Forecast</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                                {weatherData.daily.map((day, index) => (
                                    <div key={index} className="bg-white/60 backdrop-blur-sm rounded-xl shadow-md p-4 flex flex-col items-center text-center transition hover:shadow-lg hover:scale-105">
                                        <p className="font-bold text-lg text-gray-800">{new Date(day.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' })}</p>
                                        <div className="my-2">{getWeatherIcon(day.weather[0].icon, "h-16 w-16")}</div>
                                        <p className="text-2xl font-bold text-gray-900">{Math.round(day.temp.max)}°</p>
                                        <p className="text-md text-gray-500">{Math.round(day.temp.min)}°</p>
                                        <p className="text-sm text-gray-600 mt-2 capitalize">{day.weather[0].description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Weather;
