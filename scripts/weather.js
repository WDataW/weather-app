/* 
* getDefaultWeather gets the weather for the IP location retrieved by getIpLocation 
* @returns {object} defaultWeather - contains weather data based on the user's IP location.
*/
import { getIpLocation } from "./location.js";
export async function getDefaultWeather() {
  try {
    const defaultLocation = await getIpLocation();
    const defaultWeather = await getWeather(defaultLocation);
    defaultWeather.locationName = `${defaultLocation["city"]}, ${defaultLocation["country"]}`;
    return defaultWeather;
  } catch (error) {
    console.error(error);
  }
}

/*
 * fetchWeather fetches a weather object from api.open-meteo.com using a location.
 * @param {object} location - contains the lat and lon needed to specify the location
 * @returns {object} - contains weather data based on the specified location.
 */
export async function getWeather(location) {
  try {
    const weatherResponse = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${location["lat"]}&longitude=${location["lon"]}&current=weather_code,cloud_cover,rain,snowfall,temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,wind_direction_10m,is_day&daily=weather_code,temperature_2m_min,temperature_2m_max,sunset,sunrise,rain_sum,snowfall_sum&hourly=weather_code,temperature_2m,relative_humidity_2m,apparent_temperature,rain,snowfall,wind_direction_10m,wind_speed_10m&timezone=auto`
    );
    if (!weatherResponse.ok) {
      throw new Error("An Error Occured While Fetching The Weather.");
    }
    const weatherData = await weatherResponse.json();
    return weatherData;
  } catch (error) {
    console.error(error);
  }
}

// used to translate from weather_code to words.
const weatherCodeInterpretation = {
  // Clouds
  0: "Clear Sky",
  1: "Mainly clear",
  2: "Partly Cloudy,",
  3: "Cloudy",

  // Fog
  45: "Fog",
  48: "Freezing Fog",

  // Drizzle
  51: "Light Drizzle",
  53: "Moderate Drizzle",
  55: "Heavy Drizzle",

  // Freezing drizzle
  56: "Light Freezing Drizzle",
  57: "Heavy Freezing Drizzle",

  // Rain
  61: "SLight Rain",
  63: "Moderate Rain",
  65: "Heavy Rain",

  // Freezing rain
  66: "Light Freezing Rain",
  67: "Heavy Freezing Rain",

  // Snowfall
  71: "Slight Snowfall",
  73: "Moderate Snowfall",
  75: "Heavy Snowfall",

  // Snow grains
  77: "Snow grains",

  // Rain showers
  80: "Slight Rain Showers",
  81: "Moderate Rain Showers",
  82: "Heavy Rain Showers",

  // Snow showers
  85: "Slight Snow Showers",
  86: "Heavy Snow Showers",

  // Thunderstorm
  95: "Thunder Storms",

  // Thunderstorm with hail. NOTE: available in Central Europe only.
  96: "Thunderstorm With Slight Hail",
  99: "Thunderstorm With Heavy Hail",
};

/*
 * getWeatherDescription converts weather_code(an integer) into understandable words.
 * @param {number} weatherCode - represents the weather_code included in the weather object.
 * @returns {string} - represents the meaning of the weather_code in words.
 */
export function getWeatherDescription(weatherCode) {
  return weatherCodeInterpretation[weatherCode] || "Unknown Weather Condition.";
}

