/*
 *fetchLocations fetches an array of locations from nominatim.openstreetmap api.
 *@param {string} locationName - the location name entered by the user.
 *@returns {array} locationsData - it contains the locations that matches the locationName.
 */

export async function fetchLocations(locationName) {
  try {
    const locationResponse = await fetch(
      `https://nominatim.openstreetmap.org/search?city=${locationName}&featureType=city&addressdetails=1&format=jsonv2&limit=10`
    );
    if (!locationResponse.ok) {
      throw new Error("An Error Occured While Fetching The Location.");
    }
    const locationsData = await locationResponse.json();
    const filteredLocations = filterLocationsArray(locationsData);
    return filteredLocations;
  } catch (error) {
    console.error(error);
  }
}

/*
 * filterLocationsArray filters an array containing locations and returns an array containing only cities or towns.
 * @param {array} locationsArray - array containg the locations (each location is an object).
 * @returns {array} filteredArray - array containing cities or towns only.
 */
function filterLocationsArray(locationsArray) {
  const filteredArray = locationsArray.filter((location) => {
    return (
      location["addresstype"] === "city" ||
      location["addresstype"] === "town" ||
      location["addresstype"] === "province"
    );
  });
  return filteredArray;
}

/*
 * constructLocationName creates the location name to be displayed to the user.
 * @param {array} locationsArray - it contains all the locations fetched by fetchLocations function.
 * @param {number} indexOfLocation - it represents the index of a specific location in the array.
 * @returns {string} locationName - it represents the constructed name of the location.
 */
export function constructLocationName(locationsArray, indexOfLocation) {
  const location = locationsArray[indexOfLocation];
  const locationAddress = location["address"];
  let locationName = "";
  for (const key in locationAddress) {
    if (
      key == "town" ||
      key == "city" ||
      key == "county" ||
      key == "state" ||
      key == "province" ||
      key == "country"
    ) {
      locationName += `${locationAddress[key]}, `;
    }
  }
  locationName = `${locationName.slice(0, locationName.length - 2)}.`;
  return locationName;
}

export async function getIpLocation() {
  async function getUserIp() {
    try {
      const response = await fetch("http://edns.ip-api.com/json");
      if (!response.ok) {
        throw new Error("An Error Occured While Fetching User's IP address.");
      }
      const data = await response.json();
      return data["dns"]["ip"];
    } catch (error) {}
  }
  const IP = await getUserIp();
  const response = await fetch(`http://ip-api.com/json/${IP}`);
  const data = await response.json();
  return data;
}
