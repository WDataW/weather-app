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
 * displayWeather sets the textContent of all the HTML elements displaying weather info
 * @param {object} weather - contains contains weather data based on a specific location
 * @returns {void}
 */
const pageElements = getAllElements();
export function displayWeather(weather) {
  for (const outerKey in pageElements) {
    // refers to locationName, current, daily, hourly
    const pageOuterElement = pageElements[outerKey]; // refers to the current outer-element of pageElements
    const weatherOuterElement = weather[outerKey]; // refers to the current outer-element of weather
    if (typeof weatherOuterElement !== "object") {
      // if weather's outer-element is not an object then set the value directly no need for loops
      setTextContent(pageOuterElement, weatherOuterElement);
      continue;
    }
    for (const innerKey in pageOuterElement) {
      // if the weather's outer-element is an object; loop through the page's outer-element's inner-elements
      const pageInnerElement = pageOuterElement[innerKey]; // refers to the current inner-element of the current outer-element of pageElements
      const weatherInnerElement = weatherOuterElement[innerKey]; // refers to the current inner-element of the current outer-element of weather
      if (typeof weatherInnerElement === "object") {
        // if the weather current inner-element is also an object loop through its elements
        for (let i = 0; i < pageInnerElement.length; i++) {
          if (outerKey === "daily") {
            setTextContent(pageInnerElement[i], weatherInnerElement[i + 1]); // sets the page inner-element's elements to their corresponding values in weather's inner-element's elements
            continue;
          }
          setTextContent(pageInnerElement[i], weatherInnerElement[i]); // sets the page inner-element's elements to their corresponding values in weather's inner-element's elements
        }
        continue;
      }
      setTextContent(pageInnerElement, weatherInnerElement); // if weather's inner-element is not an object then set the value directly no need for loops
    }
  }
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
 * getAllElements gets all the HTML elements that display any weather info, and structures them in an object to be accessed easily later and have their textContent values updated
 * @returns {object} elements - it contains references to the HTML elements
 */
function getAllElements() {
  const elements = {
    locationName: document.querySelector(".location"),
    current: {
      temperature_2m: document.querySelector(".current"),
      apparent_temperature: document.querySelector(".apparent"),
    },
    /*  relative_humidity_2m: document
        .querySelector(".humidity")
        .querySelector(".value"),
      wind_speed_10m: document
        .querySelector(".wind-speed")
        .querySelector(".value"),
      cloud_cover: document
        .querySelector(".cloud-cover")
        .querySelector(".value"),
      rain: document.querySelector(".rain").querySelector(".value"),
      snowfall: document.querySelector(".snowfall").querySelector(".value"),
    }, */
    daily: {
      temperature_2m_max: document.querySelectorAll(".max"),
      temperature_2m_min: document.querySelectorAll(".min"),
    }, // the below lines are commented since their functionality is no longer needed. They may be deleted later
    /*  hourly: {
      temperature_2m: document.querySelectorAll(".temperature"),
      time: document.querySelectorAll(".time"),
    }, */
  };
  return elements;
}

/*
 * createHourlyWeather generates 24 HTML elements representing the weather at each hour of a specified day. Each one contains many other HTML elements
 * @param {object} weather - contains weather data based on a specific location
 * @param {number} dayIndex - represents the day which the 24 hours belong to. 0 means today, 1 means tomorrow... max is 6
 * @returns {void}
 */
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

  const hourlyContainer = document.querySelector(".hourly-weather"); // main container
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
    weatherImg.src = "images/weather-icons/day/clear.svg"; // temporary until it becomes dynamic later
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
  const statsContainer = document.querySelector(".stats"); // could be changed later to specify another container

  for (const key in stats) {
    const statHTML = createElement("div"); // create the container
    addClass(statHTML, key.toLowerCase()); // key = css class. helps display the correct icon to match the stat
    statHTML.setAttribute("title", key);

    const icon = createElement("span"); // the icon of the stat
    addClass(icon, "icon");
    statHTML.appendChild(icon);

    const value = createElement("span");
    addClass(value, "value");
    setTextContent(value, stats[key]); // displaying the value of the stat
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
  const targetContainer = document.querySelector(
    ".time-stats > div:first-child"
  ); // the container of local-time
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
  const localTime = document.querySelector(".local-time .value");
  setTextContent(localTime, time);
}
