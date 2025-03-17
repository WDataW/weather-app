/* 
*displayLocations displays locations returned by nominatim.openstreetmap api as options.
*@param {array} locations - it is the array that contains the different locations returned by nominatim.openstreetmap api
*@returns {array} - it contains all the buttons in locationContainer.
*it simply displays the elements as buttons for the user to choose from.
*/
import {constructLocationName} from "./location.js"
export function displayLocations(locationsArray){
    const locationsContainer= document.createElement("div");
    if(locationsArray.length===0){// if no locations found then there is no results.
        locationsContainer.appendChild(createParagraph("No Results Found."));
    }
    for(let i=0;i<locationsArray.length;i++){// loop through locations and display them.
        const button=document.createElement("button");
        button.textContent=constructLocationName(locationsArray,i);
        button.setAttribute("id",i);
        locationsContainer.appendChild(button);    
    }
    document.body.appendChild(locationsContainer);
    return locationsContainer;
}


/* 
* displayCurrentWeather displays the properties of the current weather.
* @param {object} currentWeather - it contains the current weather data. 
* @returns {void}.
* NOTE: this function is temporary it may be deleted later.
*/
import { getWeatherDescription } from "./weather.js"
export function displayCurrentWeather(currentWeather){
    const weatherContainer=document.createElement("div");
    const properties=["temperature_2m","apparent_temperature","wind_speed_10m","wind_direction_10m","relative_humidity_2m"];
    
    for(const property of properties){
        const propertyNode=createPropertyNode(currentWeather,property)
        weatherContainer.appendChild(propertyNode);
    }
    const weatherDescription=createParagraph(`Weather Description: ${getWeatherDescription(currentWeather["weather_code"])}`);
    weatherContainer.appendChild(weatherDescription);
    document.body.appendChild(weatherContainer);
}


/* 
* createPropertyNode creates a <p> element then sets its textContent to the property's key and value.
* @param {object} object - represents the object that holds the targeted property.
* @param {string} property - represents the key of the property.
* @returns {HTMLElement} propertyNode - it is the <p> element that holds the text describing the property.
*/
function createPropertyNode(object,property){
    const propertyNode= document.createElement("p");
    propertyNode.textContent=`${property}: ${object[property]}`;
    return propertyNode;
}

/* 
* createParagraph creates a <p> element then sets it textContent to 'text'.
* @param {string} text - contains the text we are trying to display.
* @returns {HTMLElement} paragraph - it is the <p> element holding the text.
*/
function createParagraph(text){
    const paragraph= document.createElement("p");
    paragraph.textContent=text;
    return paragraph;
}


