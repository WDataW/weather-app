initWeather();
/* 
* updateWeather updates the displayed weather info in index.html
* @param {object} weather - contains contains weather data based on a specific location
* @returns {void}
 */
import { displayWeather } from "./ui.js";
function updateWeather(weather) {
  displayWeather(weather);
}

/* 
* initWeather initializes the displayed weather info in index.html when the user first enters the page
* @returns {void}
*/
import { getDefaultWeather } from "./weather.js";
async function initWeather() {
  try {
    const defaultWeather = await getDefaultWeather();
    updateWeather(defaultWeather);
  } catch (error) {
    console.error(error);
  }
}

  