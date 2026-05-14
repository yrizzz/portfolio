/**
 * 📌 CONTOH 3: EXTERNAL API CALL
 * 
 * Use Case: Weather API yang fetch data dari external service
 * Method: GET
 * External: OpenWeatherMap API (example)
 * 
 * Test:
 * GET /api/execute/v1/data/weather?city=Jakarta
 */

export default {
  name: "weather",
  category: "data",
  path: "/v1/data/weather",
  accept: "application/json",
  method: "GET",
  
  params: [
    {
      mode: "query",
      name: "city",
      type: "string",
      required: true,
      description: "Nama kota (contoh: Jakarta, London, Tokyo)"
    },
    {
      mode: "query",
      name: "units",
      type: "string",
      default: "metric",
      required: false,
      description: "Unit: metric (Celsius), imperial (Fahrenheit), standard (Kelvin)"
    }
  ],
  
  description: "Get current weather information for a city using external weather API",
  
  example: `
const axios = require('axios').default;

const options = {
  method: 'GET',
  url: 'http://yourapi.com/api/execute/v1/data/weather',
  params: { 
    city: 'Jakarta',
    units: 'metric'
  }
};

try {
  const { data } = await axios.request(options);
  console.log(data);
} catch (error) {
  console.error(error);
}
`,

  code: async ({ city, units = "metric" }) => {
    try {
      // Validate input
      if (!city) {
        return {
          code: 400,
          status: false,
          message: "City parameter is required"
        };
      }

      const axios = require('axios');

      // Example: Using wttr.in (free weather API, no key needed)
      const url = `https://wttr.in/${encodeURIComponent(city)}?format=j1`;

      // Make external API call with timeout
      const response = await axios.get(url, {
        timeout: 10000, // 10 seconds timeout
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; WeatherAPI/1.0)'
        }
      });

      // Check if data exists
      if (!response.data || !response.data.current_condition) {
        return {
          code: 404,
          status: false,
          message: "City not found or weather data unavailable"
        };
      }

      const current = response.data.current_condition[0];
      const location = response.data.nearest_area[0];

      // Convert temperature based on units
      let temp = parseInt(current.temp_C);
      let tempUnit = '°C';
      
      if (units === 'imperial') {
        temp = parseInt(current.temp_F);
        tempUnit = '°F';
      } else if (units === 'standard') {
        temp = parseInt(current.temp_C) + 273.15;
        tempUnit = 'K';
      }

      // Return formatted response
      return {
        code: 200,
        status: true,
        message: "Weather data retrieved successfully",
        data: {
          location: {
            city: location.areaName[0].value,
            country: location.country[0].value,
            region: location.region[0].value,
            latitude: location.latitude,
            longitude: location.longitude
          },
          current: {
            temperature: temp,
            unit: tempUnit,
            feels_like: units === 'imperial' ? current.FeelsLikeF : current.FeelsLikeC,
            description: current.weatherDesc[0].value,
            humidity: current.humidity + '%',
            wind_speed: current.windspeedKmph + ' km/h',
            wind_direction: current.winddir16Point,
            pressure: current.pressure + ' mb',
            visibility: current.visibility + ' km',
            uv_index: current.uvIndex,
            cloud_cover: current.cloudcover + '%'
          },
          observation_time: current.observation_time,
          timestamp: new Date().toISOString()
        }
      };

    } catch (error) {
      // Handle different error types
      if (error.response) {
        // External API returned error
        return {
          code: error.response.status || 500,
          status: false,
          message: "External API error",
          error: error.response.data?.message || "Failed to fetch weather data"
        };
      } else if (error.code === 'ECONNABORTED') {
        // Timeout error
        return {
          code: 504,
          status: false,
          message: "Request timeout",
          error: "External API took too long to respond"
        };
      } else {
        // Other errors
        return {
          code: 500,
          status: false,
          message: "Internal server error",
          error: error.message
        };
      }
    }
  }
};
