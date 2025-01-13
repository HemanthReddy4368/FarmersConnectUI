import { useState, useEffect } from 'react';
import api from '../api/axios';

const Weather = () => {
  const [weather, setWeather] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await api.get('/WeatherForecast');
        setWeather(response.data);
      } catch (err) {
        setError('Failed to fetch weather data');
        console.error('Error:', err);
      }
    };

    fetchWeather();
  }, []);

  if (error) {
    return <div className="text-red-600 p-4">{error}</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h2 className="text-2xl font-bold mb-4">Weather Forecast</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {weather.map((forecast, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-lg shadow-md"
          >
            <div className="text-gray-900">Date: {forecast.date}</div>
            <div className="text-gray-900">Temperature: {forecast.temperatureC}°C</div>
            <div className="text-gray-900">Summary: {forecast.summary}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Weather;