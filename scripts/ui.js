/* 
*displayLocations displays locations returned by nominatim.openstreetmap api as options.
*@param {array} locations - it is the array that contains the different locations returned by nominatim.openstreetmap api
*@returns {array} - it contains all the buttons in locationContainer.
*it simply displays the elements as buttons for the user to choose from.
*/
import {constructLocationName} from "./location.js"
export function displayLocations(locationsArray){
    const locationsContainer= document.createElement("div");
    for(let i=0;i<locationsArray.length;i++){
        const button=document.createElement("button");
        button.textContent=constructLocationName(locationsArray,i);
        button.setAttribute("id",i);
        locationsContainer.appendChild(button);    
    }
    document.body.appendChild(locationsContainer);
    return locationsContainer;
}


