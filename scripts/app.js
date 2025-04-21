initWeather();

/*
 * initWeather initializes the displayed weather info in index.html when the user first enters the page
 * @returns {void}
 */
import {generatePage} from "./ui.js";
import {getDefaultWeather} from "./weather.js";
async function initWeather() {
  try {
    const defaultWeather = await getDefaultWeather();
    generatePage(defaultWeather);

    startUpdatingWeather(defaultWeather);
  } catch (error) {
    console.error(error);
  }
}

/*
 * displayNewWeather erases previous weather then displays a new weather selected by the user
 * @param {object} location - contains info about a specific location. Like lat, lon...
 * @returns {void}
 */
import {getWeather} from "./weather.js";
import {erasePageContents} from "./ui.js";
export async function displayNewWeather(location) {
  const weather = await getWeather(location);
  erasePageContents();
  generatePage(weather);

  startUpdatingWeather(weather);
}

/*
 * updateWeather updates the page contents with new weather data but using the same location as the previous weather
 * @param {object} previousWeather - contains contains weather data based on a specific location
 * @returns {void}
 */
import {msTillNextUpdate} from "./time.js";
async function updateWeather(previousWeather) {
  const location = {
    lat: previousWeather["latitude"],
    lon: previousWeather["longitude"],
  };
  const weather = await getWeather(location);
  weather["locationName"] = previousWeather["locationName"];
  erasePageContents();
  generatePage(weather);
}

/*
 * startUpdatingWeather initiates the interval that updates the weather every 15 minutes
 * @param {object} previousWeather - contains contains weather data based on a specific location
 * @returns {void}
 */
let updateInterval;
function startUpdatingWeather(previousWeather) {
  clearInterval(updateInterval);
  updateInterval = setInterval(() => {
    updateWeather(previousWeather);
  }, msTillNextUpdate());
}
