/*
 * getDefaultWeather gets the weather for the IP location retrieved by getIpLocation
 * @returns {object} defaultWeather - contains weather data based on the user's IP location.
 */
import {getIpLocation} from "./location.js";
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
      `https://api.open-meteo.com/v1/forecast?latitude=${location["lat"]}&longitude=${location["lon"]}&current=weather_code,cloud_cover,rain,snowfall,temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,wind_direction_10m,is_day&daily=weather_code,precipitation_probability_max,temperature_2m_min,temperature_2m_max,sunset,sunrise,rain_sum,snowfall_sum&hourly=weather_code,precipitation_probability,temperature_2m,relative_humidity_2m,apparent_temperature,rain,snowfall,wind_direction_10m,wind_speed_10m&timezone=auto`
    );
    if (!weatherResponse.ok) {
      throw new Error("An Error Occured While Fetching The Weather.");
    }
    const weatherData = await weatherResponse.json();
    processWeather(weatherData);
    return weatherData;
  } catch (error) {
    console.error(error);
  }
}

/*
 * processWeather prepares the weather object to be used in other functions. It deletes unecessary properties, rounds up numbers, reformats time
 * @param {object} weather - contains contains weather data based on a specific location
 * @returns {void}
 */
import {getDayName} from "./time.js";
import {getTextDate} from "./time.js";
function processWeather(weather) {
  /*
   * deleteProperties deleted properties from weather
   * @param {object} keys - array of the properties' keys that we want to delete
   * @returns {void}
   */
  function deleteProperties(keys) {
    // stage 1: delete unnecessary properties
    for (const key of keys) {
      delete weather[key];
    }
  }
  /*
   * roundNumbers rounds every number that exists in 'current', 'hourly', 'daily' in weather
   * @returns {void}
   */
  function roundNumbers() {
    // stage 2: round up every number in weather
    for (let outerKey in weather) {
      const outerElement = weather[outerKey];
      if (outerKey === "current") {
        // 'current' doesn't contain objects so we set the values directly no need for looping inside
        for (const innerKey in outerElement) {
          if (isNaN(Number(outerElement[innerKey]))) {
            // make sure it is a number
            continue;
          }
          outerElement[innerKey] = Math.round(outerElement[innerKey]); // round the number
          continue;
        }
      }
      if (outerKey === "daily" || outerKey === "hourly") {
        for (const innerKey in outerElement) {
          // they contain objects, so we need to loop through their properties
          let innerElement = outerElement[innerKey]; // stores the array that we are going to loop through next
          if (isNaN(innerElement[0])) {
            // make sure it is a number. If the first element is a number then all elements are numhers
            continue;
          }
          outerElement[innerKey] = innerElement.map((x) => Math.round(x)); // now round all the numbers inside 'innerElement'
        }
      }
    }
  }
  /*
   * formatTime format the time to include only the hour
   * @returns {void}
   */
  function formatTime() {
    // stage 3: give the time a user-friendly format
    const time = weather["hourly"]["time"];
    for (let i = 0; i < time.length; i++) {
      time[i] = time[i].slice(time[i].indexOf("T") + 1); // only include the hour
      if (time[i].startsWith("0")) {
        // if it starts with '0' then remove the '0'
        time[i] = time[i].slice(1);
      }
    }
  }
  /*
   * addDayName adds an array of days to weather["daily"]. This array hold the names of days like ["Sunday","Monday",...]
   * @returns {void}
   *
   */
  function addDayName() {
    weather["daily"]["day_name"] = [];
    const daily = weather["daily"];
    for (let i = 0; i < 7; i++) {
      weather["daily"]["day_name"].push(getDayName(daily["time"][i]));
    }
  }
  /*
   * addTextDate adds an array of text-dates to weather["daily"]. This array holds text-dates like ["April 3","April 4",...]
   * @returns {void}
   */
  function addTextDate() {
    weather["daily"]["text_date"] = [];
    const daily = weather["daily"];
    for (let i = 0; i < 7; i++) {
      weather["daily"]["text_date"].push(`${getTextDate(daily["time"][i])}`); // send the date like '2025-2-23' and get text-date in return
    }
  }

  const keysToDelete = [
    "hourly_units",
    "current_units",
    "daily_units",
    "elevation",
    "generationtime_ms",
  ];
  deleteProperties(keysToDelete);

  roundNumbers();

  formatTime();

  addDayName();

  addTextDate();
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

/*
 * getCurrentStats gathers 6 stats in one array that will be used later to display those stats
 * @param {object} weather - contains weather data based on a specific location
 * @returns {object} stats - represents all the 5 stats in one array
 */
export function getCurrentStats(weather) {
  const statsText = [
    // the stats we are gathering
    "precipitation_probability_max",
    "relative_humidity_2m",
    "wind_speed_10m",
    "cloud_cover",
    "rain",
    "snowfall",
  ];
  const statsKeys = [
    "Precipitation",
    "Humidity",
    "Wind-Speed",
    "Cloud-Cover",
    "Rain",
    "Snowfall",
  ];
  const stats = {};
  for (let i = 0; i < 6; i++) {
    if (i === 0) {
      stats[statsKeys[i]] = weather["daily"][statsText[i]][i];
      continue;
    }
    stats[statsKeys[i]] = weather["current"][statsText[i]];
  }
  console.log(stats);
  return stats;
}

/* these two will be needed later */
export function getHourlyStats() {}
export function getDailyStats() {}
