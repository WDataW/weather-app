/*
 * display locations displays the locations returned by geocoding-open-moteo api in the results-container
 * @param {object} locationsArray - holds the locations matched with the search query
 * @returns {void}
 */
import {constructLocationName} from "./location.js";
import {displayNewWeather} from "./app.js";
export function displayLocations(locationsArray) {
  const resultsContainer = select(".results-container");
  eraseResults(); // erase previous results to display new results
  if (locationsArray.length == 0) {
    // if no results were found
    resultsContainer.appendChild(createMessageDiv("No Results Found."));
    return;
  }
  for (const location of locationsArray) {
    // if results found
    const locationContainer = createElement("button"); // a container for each result
    addClass(locationContainer, "result");

    locationContainer.addEventListener("blur", () => {
      setTimeout(() => {
        // to allow focusing on the results
        if (
          document.activeElement.classList[0] !== "result" &&
          document.activeElement.classList[0] !== "use-location"
        ) {
          collapseSearch();
        }
      }, 105);
    });

    locationContainer.addEventListener("click", (event) => {
      displayNewWeather(location);
      setTimeout(() => collapseSearch(), 105);
    });

    const countryFlag = createElement("img"); // country flag
    let countryCode = location["country_code"].toLowerCase();
    countryFlag.src = `https://flagcdn.com/${countryCode}.svg`;
    locationContainer.appendChild(countryFlag);

    const locationName = createElement("div"); // to display the name of the location
    addClass(locationName, "location-name");

    const city = location["name"]; // name such as 'London'
    const name = createElement("h3");
    setTextContent(name, city);
    locationName.appendChild(name);

    const nameDetails = createElement("p");
    let details = constructLocationName(
      locationsArray,
      locationsArray.indexOf(location)
    ); // details such as 'Ontario, CA'
    setTextContent(nameDetails, details);
    locationName.appendChild(nameDetails);

    locationContainer.appendChild(locationName);

    resultsContainer.appendChild(locationContainer);
  }
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
export function createHourlyWeather(weather, dayIndex, container) {
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

  const hourlyContainer = select(container); // main container
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
    const currentIndex = i + propertiesOffset;

    const hour = createElement("div");
    addClass(hour, "hour");
    addClass(hour, "extendable");

    const hourBox = createElement("div"); // to hover/click each hour
    addClass(hourBox, "hour-box");
    hourBox.setAttribute("id", `D${dayIndex}H${i + propertiesOffset}`);
    hourBox.addEventListener("click", (event) => {
      processHourClick(weather, event);
    });
    hour.appendChild(hourBox);

    // temperature
    const temperature = createElement("p");
    addClass(temperature, "temperature");
    addClass(temperature, "celesius");
    setHourlyContent(temperature, "temperature_2m", currentIndex);
    hour.appendChild(temperature);

    // icon
    const icon = createElement("div");
    addClass(icon, "mini-icon");

    const weatherImg = createElement("img");

    weatherImg.src = interpretWeatherCode(
      weather["hourly"]["weather_code"][currentIndex],
      getIsDay(i, weather, dayIndex)
    )[1]; // temporary until it becomes dynamic later
    icon.appendChild(weatherImg);
    hour.appendChild(icon);

    // exact hour
    const time = createElement("p");
    addClass(time, "time");
    setHourlyContent(time, "time", currentIndex);
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
export function createWeatherStats(stats, container) {
  const statsContainer = select(container); // could be changed later to specify another container
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

function removeClass(target, Class) {
  target.classList.remove(Class);
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
  createWeatherStats(getCurrentStats(weather), ".stats"); // stats section like humidity,sunrise,sunset...
  createHourlyWeather(weather, 0, ".hourly-weather"); //hourly-weather hour by hour weather from 0-23
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
  const dailyContainer = select(".daily-weather"); // selecting the container
  const dailyWeather = weather["daily"];
  const dates = dailyWeather["time"]; // contains the dates for today+the next 6 days
  const interpreations = dailyWeather["weather_code"].map((code) => {
    // interpretes every weather-code in 'weather_code' array
    return interpretWeatherCode(code);
  });
  for (let i = 1; i < dailyWeather["time"].length; i++) {
    // to create the next 6 days. each is created in an iteration
    const day = createElement("div"); // container of day's contents
    addClass(day, "day");
    const dayBox = createElement("div");
    addClass(dayBox, "day-box");
    dayBox.setAttribute("id", `D${i}`);
    dayBox.addEventListener("click", (event) => {
      processDayClick(weather, event);
    });
    day.appendChild(dayBox);
    const dayName = createElement("div"); // day-name like 'Sun', 'Mon'
    addClass(dayName, "name");
    const filteredName = getDayName(dates[i]).slice(0, 3); // only first three letters
    setTextContent(dayName, filteredName);
    const arrow = createElement("div");
    addClass(arrow, "day-arrow");
    dayName.appendChild(arrow);
    day.appendChild(dayName);

    const icon = createElement("div");
    addClass(icon, "mini-icon");

    const img = createElement("img");
    img.src = interpreations[i][1]; // set the src to the url in the array which is element at index 1

    icon.appendChild(img);
    day.appendChild(icon);

    const temperatureRange = createElement("div"); // highest and lowest temps
    addClass(temperatureRange, "temperature-range");
    const maxTemp = createElement("span"); // highest temp for the day
    addClass(maxTemp, "max");
    addClass(maxTemp, "celesius");
    setTextContent(maxTemp, dailyWeather["temperature_2m_max"][i]);
    temperatureRange.appendChild(maxTemp);

    const minTemp = createElement("span"); // lowest temp for the day
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
 * @param {string} container - a query to be selected to get the HTML container
 * @returns {void}
 */
function createWeatherCondition(weatherCode, container) {
  const targetContainer = select(container); // the container of weather-condition

  const weatherCondition = createElement("div"); // container of 'value'
  addClass(weatherCondition, "weather-condition");

  const value = createElement("span"); // to hold the description text
  setTextContent(value, interpretWeatherCode(weatherCode)[0]); // the element representing the weather-condition in text is always at index 0
  weatherCondition.appendChild(value);

  targetContainer.appendChild(weatherCondition);
}

/*
 * createTimeStats fills the time-stats container with weather-condition and local-time
 * @param {object} weather - contains weather data based on a specific location
 * returns {void}
 */
function createTimeNStats(weather) {
  createWeatherCondition(
    weather["current"]["weather_code"],
    ".time-stats > div:first-child"
  );
  createLocalTime(weather);
}

/*
 * createHourStats creates the ui component the displays the stats for a chosen hour
 * @param {object} weather - contains weather data based on a specific location
 * @param {MouseEvent} event - it holds the click event when an hour is clicked
 * @returns {void}
 */
import {convert24to12} from "./time.js";
import {getHourStats} from "./weather.js";
function createHourStats(weather, event) {
  const parent = event.target.parentElement;

  const ID = event.target.id;
  const hourIndex = Number(
    // the id holds the hour index you just extract it
    ID.slice(ID.indexOf("H") + 1)
  );
  //the id also holds the day index you just extract it    (hour and day index are used to find the exact hour among 7 days and 160+ hours)
  const dayIndex = Number(ID.slice(ID.indexOf("D") + 1, ID.indexOf("H")));

  const container = dayIndex == 0 ? ".hour-stats" : ".daily-hour-stats"; // two possible containers, one is for the today's hours and one for the next 6 days
  createWeatherCondition(
    weather["hourly"]["weather_code"][hourIndex],
    `${container} > div:first-child`
  );

  let time = parent.querySelector(".time").textContent;
  time = time; // honestly I forgot if this even does anything but Iam afraid to remove it
  createHourlyTime(`${container}  > div:first-child`, time);

  //create stats
  let hour = Number(ID.slice(ID.indexOf("H") + 1));

  createWeatherStats(
    getHourStats(weather, hour),
    `${container} >div:last-child`
  );
}

/*
 * closeHourStats removes the hour's stats component
 * @param {string} container - a query to be selected to get the HTML container
 * @returns {void}
 */
function closeHourStats(container) {
  const hourStatsContainer = select(container);
  removeClass(hourStatsContainer, "container"); // reseting it to its original state
  removeClass(hourStatsContainer, "time-stats");
}

/*
 * createHourlyTime creates the component that shows the time for a stats container. like '1:00 AM'
 * @param {string} Container - a query to be selected to get the HTML container
 * @param {string} time - represents the time to be displayed like '4:00 AM'
 * @returns {void}
 */
export function createHourlyTime(Container, time) {
  const targetContainer = select(Container); // the container of local-time
  const container = createElement("div"); // the container of the icon and the value of local-time
  addClass(container, "local-time");

  const icon = createElement("span"); // the icon of time (a clock)
  addClass(icon, "icon");
  container.appendChild(icon);

  const value = createElement("span"); // the value of time, like '4:00 PM'
  addClass(value, "value");
  setTextContent(value, time);
  container.appendChild(value);

  targetContainer.appendChild(container);
}

/*
 * processHourClick handles when a specific hour is clicked and takes the suitable action
 * @param {object} weather - contains weather data based on a specific location
 * @param {MouseEvent} event - it holds the click event when an hour is clicked
 * @returns {void}
 */
function processHourClick(weather, event) {
  const parent = event.target.parentElement;
  const ID = parent.querySelector(".hour-box").id; // will help us find the hour info from the weather object , we have the specific day and the exact hour in that day
  const dayIndex = Number(ID.slice(ID.indexOf("D") + 1, ID.indexOf("H"))); // same as the line above

  const grandParent = dayIndex == 0 ? ".current-hourly" : ".daily-hours"; // there is two possible containers that the stats component will be appended to
  const container = dayIndex == 0 ? ".hour-stats" : ".daily-hour-stats"; // extends the line above

  const lastClickedHour = select(`${grandParent} .picked`);
  const currentClickedHour = parent.querySelector(".hour>div:last-child");

  if (lastClickedHour) {
    // if there is an already picked hour, reset the 'picked' status, to allow for a new hour to be displayed
    unPick(lastClickedHour, container);

    if (currentClickedHour == lastClickedHour) {
      // means if the clicked hour is the lastHour itself then the container should be closed (first click opens and the other hides it)
      closeHourStats(container);
      return;
    }
  }
  pick(currentClickedHour, container);
  createHourStats(weather, event); // creates the stats component
}

/*
 * unPick unpicks an hour to allow for another to be picked
 * @param {HTMLElement} lastClickedHour - represents the previously picked hour element
 * @param {string} container - a query to be selected to get the HTML container
 * @returns {void}
 */
function unPick(lastClickedHour, container) {
  const hourStatsContainer = select(container); // stats container

  const timeNDescription = hourStatsContainer.querySelector("div");
  setTextContent(timeNDescription, ""); // erase its content
  const statsContainer = hourStatsContainer.querySelector("div:last-child");
  setTextContent(statsContainer, ""); // erase its content
  removeClass(statsContainer, "stats"); // reset its classes to the way it was before

  if (lastClickedHour) {
    // to avoid errors
    removeClass(lastClickedHour, "picked");
  }
}

/*
 * pick is used to pick a specific hour to display its stats
 * @param {HTMLElement} currentClickedHour - represents the currently picked hour element
 * @param {string} container - a query to be selected to get the HTML container
 * @returns {void}
 */
function pick(currentClickedHour, container) {
  addClass(currentClickedHour, "picked"); // make container visible
  const hourStatsContainer = select(container);
  addClass(hourStatsContainer, "time-stats"); // add the necessary classes to make it look like a stats container
  addClass(hourStatsContainer, "container");
  addClass(hourStatsContainer.querySelector("div:last-child"), "stats");
}

/*
 * processHourClick handles when a specific day is clicked and takes the suitable action
 * @param {object} weather - contains weather data based on a specific location
 * @param {MouseEvent} event - it holds the click event when a day is clicked
 * @returns {void}
 */
function processDayClick(weather, event) {
  const lastClickedDay = select(".daily-weather .picked");
  const currentClickedDay =
    event.target.parentElement.querySelector(".day-arrow");
  if (lastClickedDay) {
    // if there is an already picked hour, reset the 'picked' status
    unPickDay(lastClickedDay, event);

    if (currentClickedDay == lastClickedDay) {
      // means if the clicked day is the last day itself then the container should be closed (first click opens and the other hides it)
      closeDayStats();
      return;
    }
  }
  pickDay(currentClickedDay); //else: pick the clicked day and display its hours
  createDailyHours(weather, event);
}

/*
 * createDailyHours creates a list of 24 hours for a chosen day
 * @param {object} weather - contains weather data based on a specific location
 * @param {MouseEvent} event - it holds the click event when a day is clicked
 * @returns {void}
 */
function createDailyHours(weather, event) {
  const targetContainer = ".daily-hours";
  const dayIndex = Number(event.target.id.slice(1));
  createHourlyWeather(weather, dayIndex, targetContainer);
}

/*
 * unPickDay unPicks a day to allow for another to be picked
 * @param {HTMLElement} lastClickedDay - represents the previously picked day element
 * @param {MouseEvent} event - it holds the click event when a day is clicked
 * @returns {void}
 */
function unPickDay(lastClickedDay, event) {
  removeClass(lastClickedDay, "picked");

  const dailyHoursContainer = select(".daily-hours");
  setTextContent(dailyHoursContainer, ""); // erase its contents

  const dayIndex = Number(event.target.id.slice(1));
  const grandParent = dayIndex == 0 ? ".current-hourly" : ".daily-hours"; // two possible containers based on dayIndex

  const lastClickedHour = select(`${grandParent} .picked`);
  const container = dayIndex == 0 ? ".hour-stats" : ".daily-hour-stats"; // two possible containers based on dayIndex

  closeHourStats(container);
  unPick(lastClickedHour, container);
}

/*
 * pickDay picks a day after it being clicked to display its hours
 * @param {HTMLElement} currentClickedDay - represents the currently picked day element
 * @returns {void}
 */
function pickDay(currentClickedDay) {
  addClass(currentClickedDay, "picked"); // make container visible
  const dailyHoursContainer = select(".daily-hours");
  addClass(dailyHoursContainer, "container");
  addClass(dailyHoursContainer, "hourly-weather");
}

/*
 * closeDayStats closes the container that holds 24 hours for a specific day
 * @returns {void}
 */
function closeDayStats() {
  const dailyHoursContainer = select(".daily-hours");
  removeClass(dailyHoursContainer, "container");
  removeClass(dailyHoursContainer, "hourly-weather");
}

const searchContainer = select(".search-container");
const searchIput = select(".search-container input");
searchIput.addEventListener("focus", () => {
  const useLocation = select(".use-location");
  if (useLocation) {
  } else {
    console.log(useLocation);
    expandSearch();
  } // when the search input is focused then expand the search component to allow for displaying search results etc...
});

import {fetchLocations} from "./location.js";
const searchBox = select(".search-container input");
let debounceTimer; // is used to make sure the search happens when the user is done typing(instead of it occuring after every letter)
let currentLocations;
searchBox.addEventListener("input", async function (event) {
  // if the user types in the search field
  clearTimeout(debounceTimer); // clear it and start a new one
  debounceTimer = setTimeout(async function (event) {
    const searchQuery = searchBox.value;
    if (searchQuery == "") {
      // nothing is written
      eraseResults(); // then don't display any results
      return;
    } else if (searchQuery.length < 2) {
      // too short search query (the api handled 2 or more letter only)
      eraseResults(); // don't display any results
      currentLocations = [];
      const resultsContainer = select(".results-container");
      resultsContainer.appendChild(createMessageDiv("Too Short!")); // inform the user that the query is too short
      return;
    }
    currentLocations = await fetchLocations(searchQuery); // if the validation is done and the execution reaches this line them fetch the locations based on the search query
    displayLocations(currentLocations); // display the search results
  }, 1000);
});

/*
 * expandSearch expands the search components to allow for displaying search results
 * @returns {void}
 */
function expandSearch() {
  addClass(searchIput, "unround-bottom-corners"); // to make it look like the two containers are connected

  const resultsContainer = createElement("div");
  addClass(resultsContainer, "results-container"); // display the results in this container
  searchContainer.appendChild(resultsContainer);

  resultsContainer.appendChild(createUseCurrrentLocation());

  const input = searchContainer.querySelector("input");

  if (input.value.length == 1) {
    // if it is expanded while there is text in the search box then handle it
    resultsContainer.appendChild(createMessageDiv("Too Short!"));
  } else if (input.value !== "") {
    displayLocations(currentLocations); // display the locations based on what's written in the search box when the search is expanded
  }
}

/*
 * collapseSearch collapses the search component hiding the results
 * @returns {void}
 */
function collapseSearch() {
  removeClass(searchIput, "unround-bottom-corners"); // go back to normal
  const resultsContainer = select(".results-container");
  resultsContainer.remove();
}

searchIput.addEventListener("blur", () => {
  // if the search box is unfocused then wait 105ms (to register where the click landed)
  setTimeout(() => {
    // to allow focusing on the results
    if (
      document.activeElement.classList[0] !== "result" &&
      document.activeElement.classList[0] !== "use-location"
    ) {
      collapseSearch();
    }
  }, 105);
});

/*
 * createUseCurrentLocation creates a button to allow the user to pick their exact location
 * @returns {HTMLElement} container - is the button with its children
 */
function createUseCurrrentLocation() {
  const container = createElement("button");
  addClass(container, "use-location");
  container.addEventListener("blur", () => {
    // if the search box is unfocused then wait 105ms (to register where the click landed)
    setTimeout(() => {
      if (
        // to allow focusing on the results
        document.activeElement.classList[0] !== "result" &&
        document.activeElement.classList[0] !== "search-input"
      ) {
        collapseSearch();
      }
    }, 105);
  });

  const icon = createElement("span"); //icon. Looks like target icon
  addClass(icon, "use-location-icon");

  const text = createElement("span"); // 'use my location'
  addClass(text, "use-location-text");
  setTextContent(text, "use my location");

  container.appendChild(icon);
  container.appendChild(text);

  return container;
}

/*
 * eraseResults erases the displayed results in results-container
 * @returns {void}
 */
function eraseResults() {
  const resultsContainer = select(".results-container");
  setTextContent(resultsContainer, "");
  resultsContainer.appendChild(createUseCurrrentLocation());
}

/*
 * createMessageDiv creates a div HTMLElement with an h2 element inside of it to display a message
 * @param {string} message - represents the message to be displayed
 * @returns {HTMLElement} container - is a div with an h2 child representing the specified message
 */
function createMessageDiv(message) {
  const container = createElement("div");
  addClass(container, "no-result");

  const h2 = createElement("h2");
  setTextContent(h2, message);

  container.appendChild(h2);
  return container;
}

/*
 * erasePageContents resets the page contents to allow for displaying new content
 * @returns {void}
 */
import {stopTrackingTime} from "./time.js";
export function erasePageContents() {
  stopTrackingTime(); // stop updating the local time
  eraseCurrentStats(); // erase current stats which is displayed right after main-info
  eraseCurrentHourly(); // erase the 24 hours of today
  eraseHourStats(); // erase the stats of the picked hour from today's hours
  eraseDailyWeather(); // erase the content displaying the next 6 days info
  eraseDailyHours(); // erase the 24 hours of the picked day from the daily-weather
  eraseDailyHourStats(); // if an hour is picked from the hours of a picked day from daily-weather then erase it
}

/*
 * eraseCurrentStats erases current-stats section
 * @returns {void}
 */
function eraseCurrentStats() {
  const timeNDescription = select(".current-stats >div");
  setTextContent(timeNDescription, "");

  const stats = select(".current-stats .stats");
  setTextContent(stats, "");
}

/*
 * eraseCurrentHourly erases current-hourly section
 * @returns {void}
 */
function eraseCurrentHourly() {
  const currentHourly = select(".current-hourly");
  setTextContent(currentHourly, "");
}

/*
 * eraseHourStats erases hour-stats section
 * @returns {void}
 */
function eraseHourStats() {
  const hourStats = document.querySelectorAll(".hour-stats div");
  hourStats.forEach((div) => {
    setTextContent(div, "");
  });

  const stats = select(".hour-stats .stats");
  if (stats) {
    //reset classes
    removeClass(stats, "stats");
    removeClass(stats.parentElement, "time-stats");
    removeClass(stats.parentElement, "container");
  }
}

/*
 * eraseDailyWeather erases daily-weather section
 * @returns {void}
 */
function eraseDailyWeather() {
  const days = document.querySelectorAll(".day");
  days.forEach((day) => {
    day.remove();
  });
}

/*
 * eraseDailyHours erases daily-hours section
 * @returns {void}
 */
function eraseDailyHours() {
  const dailyHours = select(".daily-hours");
  setTextContent(dailyHours, "");
  //reset classes
  removeClass(dailyHours, "container");
  removeClass(dailyHours, "hourly-weather");
}

/*
 * eraseDailyHourStats erases daily-hour-stats section
 * @returns {void}
 */
function eraseDailyHourStats() {
  const hourStats = document.querySelectorAll(".daily-hour-stats div");
  hourStats.forEach((div) => {
    setTextContent(div, "");
  });

  const stats = select(".daily-hour-stats .stats");
  if (stats) {
    //reset classes
    removeClass(stats, "stats");
    removeClass(stats.parentElement, "time-stats");
    removeClass(stats.parentElement, "container");
  }
}
