
/* 
*fetchLocations fetches an array of locations from nominatim.openstreetmap api.
*@param {string} locationName - the location name entered by the user.
*@returns {array} locationsData - it contains the locations that matches the locationName.
*/
export async function fetchLocations(locationName) {
  try {
    const locationResponse = await fetch(
      `https://nominatim.openstreetmap.org/search.php?q=${locationName}&format=jsonv2&limit=10`
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
