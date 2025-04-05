/*
 *displayLocations displays locations returned by nominatim.openstreetmap api as options.
 *@param {object} locations - the array that contains the different locations returned by nominatim.openstreetmap api
 *@returns {object} - contains all the buttons in locationContainer.
 *it simply displays the elements as buttons for the user to choose from.
 */
import {constructLocationName} from "./location.js";
export function displayLocations(locationsArray) {
  const locationsContainer = createElement("div");
  if (locationsArray.length === 0) {
    // if no locations found then there is no results.
    locationsContainer.appendChild(createParagraph("No Results Found."));
  }
  for (let i = 0; i < locationsArray.length; i++) {
    // loop through locations and display them.
    const button = createElement("button");
    button.textContent = constructLocationName(locationsArray, i);
    button.setAttribute("id", i);
    locationsContainer.appendChild(button);
  }
  document.body.appendChild(locationsContainer);
  return locationsContainer;
}

/*
 * createParagraph creates a <p> element then sets it textContent to 'text'.
 * @param {string} text - contains the text we are trying to display.
 * @returns {HTMLElement} paragraph - it is the <p> element holding the text.
 */
function createParagraph(text) {
  const paragraph = createElement("p");
  paragraph.textContent = text;
  return paragraph;
}

/*
 * setTextContent sets the textContent of an HTML element
 * @param {HTMLElement} target - refers the to HTML element that will have its textContent set
 * @param {any} value - refers to the value that will be assigned to target's textContent.
 * @returns {void}
 */
function setTextContent(target, value) {
  target.textContent = value;
}

/*
 * createHourlyWeather generates 24 HTML elements representing the weather at each hour of a specified day. Each one contains many other HTML elements
 * @param {object} weather - contains weather data based on a specific location
 * @param {number} dayIndex - represents the day which the 24 hours belong to. 0 means today, 1 means tomorrow... max is 6
 * @returns {void}
 */
import {getIsDay} from "./weather.js";
export function createHourlyWeather(weather, dayIndex) {
  /*
   * setHourlyContent sets the textContent of a specefic HTML element. The value is always an element of an array in weather["hourly"]
   * @param {HTMLElement} target - refers the to HTML element that will have its textContent set
   * @param {string} property - refers to the key of the property inside weather["hourly"]
   * @param {number} index - represents the index of the element we are trying to access inside the array in weather["hourly"][property]
   * @returns {void}
   */
  function setHourlyContent(target, property, index) {
    setTextContent(target, weather["hourly"][property][index]);
  }

  const hourlyContainer = select(".hourly-weather"); // main container
  // header creation
  const header = createElement("div");
  addClass(header, "header");

  const day = createElement("span");
  setTextContent(day, weather["daily"]["day_name"][dayIndex]); // like 'Sunday'...
  header.appendChild(day);

  const date = createElement("span");
  addClass(date, "date");
  setTextContent(date, weather["daily"]["text_date"][dayIndex]); // like 'March 22'
  header.appendChild(date);

  hourlyContainer.appendChild(header);

  // hours creation
  const hoursContainer = createElement("div"); // to contain every 'hour'
  addClass(hoursContainer, "hours");
  const propertiesOffset = dayIndex * 24; // each array in weather["hourly"] has 168 elements. 0-23 = today, 24-47 = tomorrow... this offset helps specify which day we are tageting
  for (let i = 0; i < 24; i++) {
    const hour = createElement("div");
    addClass(hour, "hour");
    addClass(hour, "extendable");

    // temperature
    const temperature = createElement("p");
    addClass(temperature, "temperature");
    addClass(temperature, "celesius");
    setHourlyContent(temperature, "temperature_2m", i + propertiesOffset);
    hour.appendChild(temperature);

    // icon
    const icon = createElement("div");
    addClass(icon, "mini-icon");

    const weatherImg = createElement("img");

    weatherImg.src = interpretWeatherCode(
      weather["hourly"]["weather_code"][i + propertiesOffset],
      getIsDay(i, weather, dayIndex)
    )[1]; // temporary until it becomes dynamic later
    icon.appendChild(weatherImg);
    hour.appendChild(icon);

    // exact hour
    const time = createElement("p");
    addClass(time, "time");
    setHourlyContent(time, "time", i + propertiesOffset);
    hour.appendChild(time);

    // arrow icon, will be used later to display more info when clicked
    const arrowIcon = createElement("div");
    hour.appendChild(arrowIcon);

    // append hour to the hours container
    hoursContainer.appendChild(hour);
  }
  // append hours container to the main container
  hourlyContainer.appendChild(hoursContainer);
}

/*
 * createWeatherStats creates HTML elements that represent weather stats like humidity...
 * @param {object} stats - Each property represent a stat to be displayed
 * @returns {void}
 */
export function createWeatherStats(stats) {
  const statsContainer = select(".stats"); // could be changed later to specify another container
  for (let key in stats) {
    const statHTML = createElement("div"); // create the container
    addClass(statHTML, key.toLowerCase()); // key = css-class. helps display the correct icon to match the stat

    const icon = createElement("span"); // the icon of the stat
    addClass(icon, "icon");
    statHTML.appendChild(icon);

    const value = createElement("span");
    addClass(value, "value");
    setTextContent(value, stats[key]); // displaying the value of the stat
    if (key == "Sunrise" || key == "Sunset") {
      key += " (24h-format)";
    }
    statHTML.setAttribute("title", key);
    statHTML.appendChild(value);

    statsContainer.appendChild(statHTML);
  }
}
/*
 * createElement creates a new HTML element of a specific type
 * @param {string} type - refers to the type of the HTML element
 * @returns {HTMLElement} - the HTMLElement of the specified type
 */
function createElement(type) {
  return document.createElement(type);
}

/*
 * addClass adds a class to an HTMLElement
 * @param {HTMLElement} target - is the HTMLElement we are adding the class to
 * @param {string} Class - represents the name of the class we are adding to 'target'
 */
function addClass(target, Class) {
  target.classList.add(Class);
}

/*
 * createLocalTime creates the HTML structure to display local-time
 * @param {object} weather - contains weather data based on a specific location
 * @returns {void}
 */
import {trackTime} from "./time.js";
import {getLocalTime} from "./time.js";
export function createLocalTime(weather) {
  const targetContainer = select(".time-stats > div:first-child"); // the container of local-time
  const container = createElement("div"); // the container of the icon and the value of local-time
  addClass(container, "local-time");

  const icon = createElement("span"); // the icon of time (a clock)
  addClass(icon, "icon");
  container.appendChild(icon);

  const value = createElement("span"); // the value of time, like '4:34 PM'
  addClass(value, "value");
  setTextContent(value, getLocalTime(weather));
  trackTime(value.textContent); // to start updating the time every minute
  container.appendChild(value);

  targetContainer.appendChild(container);
}

/*
 * updateLocalTime updates the textContent of .local-time .value
 * @param {string} time - represents time to be displayed, formatted 'hour:minute(padded with 0) AMPM'
 * @returns {void}
 */
export function updateLocalTime(time) {
  const localTime = select(".local-time .value");
  setTextContent(localTime, time);
}

/*
 * generatePage invokes all the main functions to construct the weather page
 * @param {object} weather - contains weather data based on a specific location
 * @returns {void}
 */
import {getCurrentStats} from "./weather.js";
export function generatePage(weather) {
  setLocation(weather); // displays the location 
  setMainInfo(weather); // large weather-icon and temperatures: current, apparent
  createTimeNStats(weather); // time-stats section contains the local-time and weather-description
  createWeatherStats(getCurrentStats(weather)); // stats section like humidity,sunrise,sunset...
  createHourlyWeather(weather, 0); //hourly-weather hour by hour weather from 0-23
  createDailyWeather(weather); //  daily-weather displays the weather for the next 6 days
}

/*
 * setWeatherIcon sets the icon for a target based on weatherCode and isDay
 * @param {HTMLElement} target - represents the img element that will display the icon
 * @param {number} weatherCode - a number used for describing the weather condition
 * @param {boolean} isDay - true = day / false = night
 * @returns {void}
 */
import {interpretWeatherCode} from "./weather.js";
function setWeatherIcon(target, weatherCode, isDay) {
  const interpreation = interpretWeatherCode(weatherCode, isDay);
  target.src = interpreation[1]; // assigning a url of the icon representing the weather condition
}

/*
 * setMainInfo sets the main-info section in index.html, including weather-icon,  temperatures
 * @param {object} weather - contains weather data based on a specific location
 * @returns {void}
 */
function setMainInfo(weather) {
  const currentWeather = weather["current"];

  const temperature = select(".current"); // represents the current temperature
  setTextContent(temperature, currentWeather["temperature_2m"]);

  const apparent_temperature = select(".apparent"); // represents the current apparent temperature
  setTextContent(apparent_temperature, currentWeather["apparent_temperature"]);

  const weatherIcon = select(".weather-icon img"); // an icon representing the weather condition
  const weatherCode = currentWeather["weather_code"];
  const isDay = currentWeather["is_day"]; // a boolean indicating day or night
  setWeatherIcon(weatherIcon, weatherCode, isDay);
}

/*
 * select selects an HTMLElement based on a query (used to make the code cleaner)
 * @param {string} query - represents a way to identify the HTMLElement like name of class '.temperature'
 * @returns {HTMLElement} - the HTMLElement matching the query
 */
export function select(query) {
  return document.querySelector(query);
}

/*
 * setLocation sets the textContent of .location
 * @param {object} weather - contains weather data based on a specific location
 * @returns {void}
 */
function setLocation(weather) {
  const location = select(".location");
  setTextContent(location, weather["locationName"]);
}

/* 
  * createDailyWeather creates the daily-weather section which includes the next 6 days' weather
  * @param {object} weather - contains weather data based on a specific location
  * @returns {void}
*/
import {getDayName} from "./time.js";
function createDailyWeather(weather) {
  const dailyContainer = select(".daily-weather");// selecting the container
  const dailyWeather = weather["daily"]; 
  const dates = dailyWeather["time"]; // contains the dates for today+the next 6 days
  const interpreations = dailyWeather["weather_code"].map((code) => {  // interpretes every weather-code in 'weather_code' array
    return interpretWeatherCode(code);
  });
  for (let i = 1; i < dailyWeather["time"].length; i++) {// to create the next 6 days. each is created in an iteration
    const day = createElement("div"); // container of day's contents
    addClass(day, "day");

    const dayName = createElement("span");// day-name like 'Sun', 'Mon'
    addClass(dayName, "name");
    const filteredName = getDayName(dates[i]).slice(0, 3);// only first three letters
    setTextContent(dayName, filteredName);
    day.appendChild(dayName);

    const icon = createElement("div");
    addClass(icon, "mini-icon");

    const img = createElement("img");
    img.src = interpreations[i][1];// set the src to the url in the array which is element at index 1

    icon.appendChild(img);
    day.appendChild(icon);

    const temperatureRange = createElement("div"); // highest and lowest temps
    addClass(temperatureRange, "temperature-range");
    const maxTemp = createElement("span");// highest temp for the day
    addClass(maxTemp, "max");
    addClass(maxTemp, "celesius");
    setTextContent(maxTemp, dailyWeather["temperature_2m_max"][i]);
    temperatureRange.appendChild(maxTemp);

    const minTemp = createElement("span");// lowest temp for the day
    addClass(minTemp, "min");
    addClass(minTemp, "celesius");
    setTextContent(minTemp, dailyWeather["temperature_2m_min"][i]);
    temperatureRange.appendChild(minTemp);

    day.appendChild(temperatureRange);
    dailyContainer.appendChild(day);
  }
}

/* 
* createWeatherCondition creates the section where the weather-condition in text is displayed, like "Cloudy"
* @param {number} weatherCode - the code referring to a weather-condition. will be interpreted later like 0:"Clear"
* @returns {void}
*/
function createWeatherCondition(weatherCode) {
  const targetContainer = select(".time-stats > div:first-child"); // the container of weather-condition

  const weatherCondition = createElement("div"); // container of 'value'
  addClass(weatherCondition, "weather-condition");

  const value = createElement("span");// to hold the description text
  setTextContent(value, interpretWeatherCode(weatherCode)[0]);// the element representing the weather-condition in text is always at index 0
  weatherCondition.appendChild(value);

  targetContainer.appendChild(weatherCondition);
}


/* 
* createTimeStats fills the time-stats container with weather-condition and local-time
* @param {object} weather - contains weather data based on a specific location
* returns {void} 
*/
function createTimeNStats(weather) {
  createWeatherCondition(weather["current"]["weather_code"]);
  createLocalTime(weather);
}
