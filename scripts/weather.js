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
  0: ["Clear Sky", "clear.svg"],
  1: ["Mainly clear", "clear.svg"],
  2: ["Partly Cloudy", "partly-cloudy.svg"],
  3: ["Cloudy", "cloudy.svg"],

  // Fog
  45: ["Fog", "cloudy.svg"],
  48: ["Freezing Fog", "cloudy.svg"],

  // Drizzle
  51: ["Light Drizzle", "light-rain.svg"],
  53: ["Moderate Drizzle", "light-rain.svg"],
  55: ["Heavy Drizzle", "light-rain.svg"],

  // Freezing drizzle
  56: ["Light Freezing Drizzle", "light-rain.svg"],
  57: ["Heavy Freezing Drizzle", "light-rain.svg"],

  // Rain
  61: ["SLight Rain", "light-rain.svg"],
  63: ["Moderate Rain", "light-rain.svg"],
  65: ["Heavy Rain", "heavy-rain.svg"],

  // Freezing rain
  66: ["Light Freezing Rain", "light-rain.svg"],
  67: ["Heavy Freezing Rain", "heavy-rain.svg"],

  // Snowfall
  71: ["Slight Snowfall", "snow.svg"],
  73: ["Moderate Snowfall", "snow.svg"],
  75: ["Heavy Snowfall", "snow.svg"],

  // Snow grains
  77: ["Snow grains", "snow.svg"],

  // Rain showers
  80: ["Slight Rain Showers", "heavy-rain.svg"],
  81: ["Moderate Rain Showers", "heavy-rain.svg"],
  82: ["Heavy Rain Showers", "heavy-rain.svg"],

  // Snow showers
  85: ["Slight Snow Showers", "snow.svg"],
  86: ["Heavy Snow Showers", "snow.svg"],

  // Thunderstorm
  95: ["Thunder Storms", "thunderstorm.svg"],

  // Thunderstorm with hail. NOTE: available in Central Europe only.
  96: ["Thunderstorm With Slight Hail", "thunderstorm.svg"],
  99: ["Thunderstorm With Heavy Hail", "thunderstorm.svg"],
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
import {convert12To24} from "./time.js";
export function getCurrentStats(weather) {
  const statsText = [
    // the stats we are gathering
    "precipitation_probability",
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
  const hour = convert12To24();
  const stats = {};
  for (let i = 0; i < 6; i++) {
    if (i === 0) {
      stats[statsKeys[i]] = weather["hourly"][statsText[i]][hour];
      continue;
    }
    stats[statsKeys[i]] = weather["current"][statsText[i]];
  }
  return stats;
}

/* these two will be needed later */
export function getHourlyStats() {}
export function getDailyStats() {}
/*
 * interpretWeatherCode takes weatherCode and returns the text description with an icon url
 * @param {number} weatherCode - a number used for describing the weather condition
 * @param {boolean} isDay - true = day / false = night
 * @returns {object} interpretation - an array holding the text description and icon for every weatherCode
 */
export function interpretWeatherCode(weatherCode, isDay) {
  if (typeof weatherCode !== "object") {
    const interpreation = weatherCodeInterpretation[weatherCode];
    let weatherIcon = interpreation[1]; // the url of the weather icon
    if (
      // to get the directories right
      weatherIcon.includes("heavy-rain") ||
      weatherIcon.includes("snow") ||
      weatherIcon.includes("thunderstorm")
    ) {
      weatherIcon = `images/weather-icons/${weatherIcon}`; // the previous three exist in this directory
      interpreation[1] = weatherIcon;
    } else {
      const dayNight = isDay ? "day" : "night";
      weatherIcon = `images/weather-icons/${dayNight}/${weatherIcon}`; // others exist in different directories based on day or night
      interpreation[1] = weatherIcon;
    }
    return interpreation;
  }
}
