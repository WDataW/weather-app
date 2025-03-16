
/* 
*fetchLocations fetches an array of locations from nominatim.openstreetmap api.
*@param {string} locationName - the location name entered by the user.
*@returns {array} locationsData - it contains the locations that matches the locationName.
*/
export async function fetchLocations(locationName) {
  try {
    const locationResponse = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${locationName}&addressdetails=1&format=jsonv2&limit=10`
    );
    if (!locationResponse.ok) {
      throw new Error("An Error Occured While Fetching The Location.");
    }
    const locationsData = await locationResponse.json();
    return locationsData;
  }catch(error){
    console.error(error);
  }
}

/* 
* constructLocationName creates the location name to be displayed to the user.
* @param {array} locationsArray - it contains all the locations fetched by fetchLocations function. 
* @param {number} indexOfLocation - it represents the index of a specific location in the array. 
* @returns {string} locationName - it represents the constructed name of the location.
*/
export function constructLocationName(locationsArray,indexOfLocation){
  const location=locationsArray[indexOfLocation];
  const locationAddress=location["address"];
  let locationName="";
  for(const key in locationAddress){
    if(key=="town" || key=="city" || key=="county" || key=="state" ||key=="province" || key=="country"){
    locationName+=`${locationAddress[key]}, `
    }
  }
  locationName=`${locationName.slice(0,locationName.length-2)}.`;
  return locationName;
}