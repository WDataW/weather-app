/*
 *displayLocations displays locations returned by nominatim.openstreetmap api as options.
 *@param {object} locations - the array that contains the different locations returned by nominatim.openstreetmap api
 *@returns {object} - contains all the buttons in locationContainer.
 *it simply displays the elements as buttons for the user to choose from.
 */
import {constructLocationName} from "./location.js";
export function displayLocations(locationsArray) {
  const locationsContainer = document.createElement("div");
  if (locationsArray.length === 0) {
    // if no locations found then there is no results.
    locationsContainer.appendChild(createParagraph("No Results Found."));
  }
  for (let i = 0; i < locationsArray.length; i++) {
    // loop through locations and display them.
    const button = document.createElement("button");
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
  const paragraph = document.createElement("p");
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
  const header = document.createElement("div");
  header.classList.add("header");

  const day = document.createElement("span");
  setTextContent(day, weather["daily"]["day_name"][dayIndex]); // like 'Sunday'...
  header.appendChild(day);

  const date = document.createElement("span");
  date.classList.add("date");
  setTextContent(date, weather["daily"]["text_date"][dayIndex]); // like 'March 22'
  header.appendChild(date);

  hourlyContainer.appendChild(header);

  // hours creation
  const hoursContainer = document.createElement("div"); // to contain every 'hour'
  hoursContainer.classList.add("hours");
  const propertiesOffset = dayIndex * 24; // each array in weather["hourly"] has 168 elements. 0-23 = today, 24-47 = tomorrow... this offset helps specify which day we are tageting
  for (let i = 0; i < 24; i++) {
    const hour = document.createElement("div");
    hour.classList.add("hour", "extendable");

    // temperature
    const temperature = document.createElement("p");
    temperature.classList.add("temperature", "celesius");
    setHourlyContent(temperature, "temperature_2m", i + propertiesOffset);
    hour.appendChild(temperature);

    // icon
    const icon = document.createElement("div");
    icon.classList.add("mini-icon");

    const weatherImg = document.createElement("img");
    weatherImg.src = "images/weather-icons/day/clear.svg"; // temporary until it becomes dynamic later
    icon.appendChild(weatherImg);
    hour.appendChild(icon);

    // exact hour
    const time = document.createElement("p");
    time.classList.add("time");
    setHourlyContent(time, "time", i + propertiesOffset);
    hour.appendChild(time);

    // arrow icon, will be used later to display more info when clicked
    const arrowIcon = document.createElement("div");
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
    const statHTML = document.createElement("div"); // create the container
    statHTML.classList.add(key.toLowerCase()); // key = css class. helps display the correct icon to match the stat
    statHTML.setAttribute("title", key);

    const icon = document.createElement("span");
    icon.classList.add("icon");
    statHTML.appendChild(icon);

    const value = document.createElement("span");
    value.classList.add("value");
    setTextContent(value, stats[key]); // displaying the value of the stat
    statHTML.appendChild(value);

    statsContainer.appendChild(statHTML);
  }
}
