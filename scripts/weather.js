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
      `https://api.open-meteo.com/v1/forecast?latitude=${location["lat"]}&longitude=${location["lon"]}&current=weather_code,cloud_cover,temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,wind_direction_10m,is_day&daily=weather_code,temperature_2m_min,temperature_2m_max,sunset,sunrise&hourly=weather_code,cloud_cover,precipitation_probability,temperature_2m,relative_humidity_2m,apparent_temperature,wind_direction_10m,wind_speed_10m&timezone=auto`
    );
    if (!weatherResponse.ok) {
      throw new Error("An Error Occured While Fetching The Weather.");
    }
    const weatherData = await weatherResponse.json();
    processWeather(weatherData, location);
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
function processWeather(weather, location) {
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
    const hourlyTime = weather["hourly"]["time"];
    for (let i = 0; i < hourlyTime.length; i++) {
      hourlyTime[i] = hourlyTime[i].slice(hourlyTime[i].indexOf("T") + 1); // only include the hour
      if (hourlyTime[i].startsWith("0")) {
        // if it starts with '0' then remove the '0'
        hourlyTime[i] = hourlyTime[i].slice(1);
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

  function addLocationName() {
    weather["locationName"] = `${location["name"]}, ${location["country"]}`;
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

  addLocationName();
}

// used to translate from weather_code to words.
const weatherCodeInterpretation = {
  // Clouds
  0: ["Clear Sky", "clear.svg"],
  1: ["Mainly clear", "clear.svg"],
  2: ["Partly Cloudy", "partly-cloudy.svg"],
  3: ["Cloudy", "cloudy.svg"],

  // Fog
  45: ["Foggy", "fog.svg"],
  48: ["Freezing Fog", "fog.svg"],

  // Drizzle
  51: ["Light Drizzle", "drizzle.svg"],
  53: ["Moderate Drizzle", "drizzle.svg"],
  55: ["Heavy Drizzle", "drizzle.svg"],

  // Freezing drizzle
  56: ["Light Freezing Drizzle", "drizzle.svg"],
  57: ["Heavy Freezing Drizzle", "drizzle.svg"],

  // Rain
  61: ["Slight Rain", "light-rain.svg"],
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
  80: ["Slight Rain Showers", "light-rain.svg"],
  81: ["Moderate Rain Showers", "light-rain.svg"],
  82: ["Heavy Rain Showers", "heavy-rain.svg"],

  // Snow showers
  85: ["Slight Snow Showers", "snow.svg"],
  86: ["Heavy Snow Showers", "snow.svg"],

  // Thunderstorm
  95: ["Thunderstorms", "thunderstorm.svg"],

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
 * @returns {object} stats - represents all the 7 stats in one array
 */
import {convert12To24} from "./time.js";
import {getDisplayedTime} from "./time.js";
export function getCurrentStats(weather) {
  const statsText = [
    // the stats we are gathering
    "sunrise",
    "sunset",
    "precipitation_probability",
    "relative_humidity_2m",
    "wind_speed_10m",
    "wind_direction_10m",
    "cloud_cover",
  ];
  const statsKeys = [
    "Sunrise",
    "Sunset",
    "Precipitation",
    "Humidity",
    "Wind-Speed",
    "Wind-Direction",
    "Cloud-Cover",
  ];
  const hour = convert12To24(getDisplayedTime());
  const stats = {};
  for (let i = 0; i < 6; i++) {
    // 8 stats
    if (i === 0 || i === 1) {
      // first two are times of sunset/sunrise
      let time = weather["daily"][statsText[i]][0];
      time = time.slice(time.indexOf("T") + 1); // only cut the time. ignore the date
      if (time.startsWith("0")) {
        // to convert time from '0H:mm' to "H:mm"
        time = time.slice(1);
      }
      stats[statsKeys[i]] = time.slice(time.indexOf("T") + 1); // if it doesn't start with '0'
      continue;
    }
    if (i === 2) {
      // get the precipation for the hour matching the current hour in local-time
      stats[statsKeys[i]] = weather["hourly"][statsText[i]][hour];
      continue;
    }
    stats[statsKeys[i]] = weather["current"][statsText[i]];
  }
  return stats;
}

/*
 * getHourStats returns the stats for a specific hour. like humidity etc...
 * @param {object} weather - contains weather data based on a specific location
 * @param {number} hour - represents the index of the hour in the stats arrays
 * @returns {object} stats - contains the stats for a specific hour
 */
export function getHourStats(weather, hour) {
  const statsText = [
    "apparent_temperature",
    "precipitation_probability",
    "relative_humidity_2m",
    "wind_speed_10m",
    "wind_direction_10m",
    "cloud_cover",
  ];
  const statsKeys = [
    "Apparent-Temperature",
    "Precipitation",
    "Humidity",
    "Wind-Speed",
    "Wind-Direction",
    "Cloud-Cover",
  ];
  const stats = {};
  for (let i = 0; i < 5; i++) {
    stats[statsKeys[i]] = weather["hourly"][statsText[i]][hour];
  }
  return stats;
}

/*
 * interpretWeatherCode takes weatherCode and returns the text description with an icon url
 * @param {number} weatherCode - a number used for describing the weather condition
 * @param {boolean} isDay - true = day / false = night
 * @returns {object} interpretation - an array holding the text description and icon for every weatherCode
 */
export function interpretWeatherCode(weatherCode, isDay = 1) {
  if (typeof weatherCode !== "object") {
    const interpreation = weatherCodeInterpretation[weatherCode].slice();
    let weatherIcon = interpreation[1]; // the url of the weather icon
    if (
      // to get the directories right
      weatherIcon.includes("heavy-rain") ||
      weatherIcon.includes("snow") ||
      weatherIcon.includes("thunderstorm") ||
      weatherIcon.includes("fog") ||
      weatherIcon.includes("drizzle")
    ) {
      weatherIcon = `images/weather-icons/${weatherIcon}`; // the previous three exist in this directory
      interpreation[1] = weatherIcon;
    } else {
      const dayNight = isDay == 1 ? "day" : "night";
      weatherIcon = `images/weather-icons/${dayNight}/${weatherIcon}`; // others exist in different directories based on day or night
      interpreation[1] = weatherIcon;
    }
    return interpreation;
  }
}

/*
 * getIsDay take the day, hour of that day, and returns 1 if the hour is within day-time else returns 0
 * @param {number} hour - represents the hour of a specific day
 * @param {object} weather - contains weather data based on a specific location
 * @param {number} dayIndex - represents a day (0 means today, 1 tomorrow...) max-value = 6
 * @returns {number} - 0 stands for night, 1 stands for day
 */
export function getIsDay(hour, weather, dayIndex) {
  let sunset = weather["daily"]["sunset"][dayIndex]; // sunsent time

  let minutes = Number(sunset.indexOf(":")); // if minutes!==0 then Add 1 to sunset(weather is displayed hour by hour, so if sunset is at 6:15 the 'night' status should show at 7:00 not 6:00)
  sunset = Number(sunset.slice(sunset.indexOf("T") + 1, sunset.indexOf(":")));
  if (minutes !== 0) {
    sunset++;
  }

  let sunrise = weather["daily"]["sunrise"][dayIndex]; // sunrise time

  minutes = Number(sunrise.indexOf(":")); // if minutes!==0 then Add 1 to sunrise(weather is displayed hour by hour, so if sunrise is at 6:15 the 'day' status should show at 7:00 not 6:00)
  sunrise = Number(
    sunrise.slice(sunrise.indexOf("T") + 1, sunrise.indexOf(":"))
  );
  if (minutes !== 0) {
    sunrise++;
  }
  if (hour < sunset && hour >= sunrise) {
    // if the hour is higher or equal to sunrise and lower than sunset then the hour is at day-time(sunrise...'day'...sunset...'night'...sunrise)
    return 1; // means day
  }
  return 0; // means night
}
