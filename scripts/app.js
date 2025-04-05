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
