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
}
