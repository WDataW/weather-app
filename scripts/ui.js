/*
 *displayLocations displays locations returned by nominatim.openstreetmap api as options.
 *@param {array} locations - it is the array that contains the different locations returned by nominatim.openstreetmap api
 *@returns {array} - it contains all the buttons in locationContainer.
 *it simply displays the elements as buttons for the user to choose from.
 */
import { constructLocationName } from "./location.js";
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
  for(const outerKey in pageElements){// refers to locationName, current, daily, hourly
    const pageOuterElement=pageElements[outerKey];// refers to the current outer-element of pageElements
    const weatherOuterElement=weather[outerKey];// refers to the current outer-element of weather
    if(typeof weatherOuterElement!=="object"){// if weather's outer-element is not an object then set the value directly no need for loops
      setTextContent(pageOuterElement,weatherOuterElement);
      continue;
    }
    for(const innerKey in pageOuterElement){// if the weather's outer-element is an object; loop through the page's outer-element's inner-elements 
      const pageInnerElement=pageOuterElement[innerKey];// refers to the current inner-element of the current outer-element of pageElements
      const weatherInnerElement=weatherOuterElement[innerKey];// refers to the current inner-element of the current outer-element of weather
      if(typeof weatherInnerElement==="object"){// if the weather current inner-element is also an object loop through its elements
        for(let i=0;i<pageInnerElement.length;i++){
          setTextContent(pageInnerElement[i],weatherInnerElement[i]);// sets the page inner-element's elements to their corresponding values in weather's inner-element's elements
        }
      continue;
      }
      setTextContent(pageInnerElement,weatherInnerElement);// if weather's inner-element is not an object then set the value directly no need for loops
    }
  }
}

/* 
* setTextContent sets the textContent of an HTML element 
* @param {HTMLElement} target - refers the to HTML element that will have its textContent set
* @param {any} value - refers to the value that will be assigned to target's textContent.
* @returns {void} 
 */
function setTextContent(target,value){
  target.textContent=value;
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
      relative_humidity_2m: document.querySelector(".humidity").querySelector(".value"),
      wind_speed_10m: document.querySelector(".wind-speed").querySelector(".value"),
      cloud_cover: document.querySelector(".cloud-cover").querySelector(".value"),
      rain: document.querySelector(".rain").querySelector(".value"),
      snowfall: document.querySelector(".snowfall").querySelector(".value"),
    },
    daily:{
      temperature_2m_max:document.querySelectorAll(".max"),
      temperature_2m_min:document.querySelectorAll(".min"),
    },
    hourly:{
      temperature_2m:document.querySelectorAll(".temperature"),
      time: document.querySelectorAll(".time"),
    }
  };
  return elements;
}
