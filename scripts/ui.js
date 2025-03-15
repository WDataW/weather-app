/* 
*displayLocations displays locations returned by nominatim.openstreetmap api as options.
*@param {array} locations - it is the array that contains the different locations returned by nominatim.openstreetmap api
*@returns {array} - it contains all the buttons in locationContainer.
*it simply displays the elements as buttons for the user to choose from.
*/
export function displayLocations(locations){
    const locationsContainer= document.createElement("div");
    for(const location of locations){
        const button=document.createElement("button");
        button.textContent=location["display_name"];
        button.setAttribute("id",locations.indexOf(location));
        locationsContainer.appendChild(button);    
    }
    document.body.appendChild(locationsContainer);
    return locationsContainer;
}