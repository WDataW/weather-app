/*
 *fetchLocations fetches an array of locations from open-moteo geocoding API.
 *@param {string} locationName - the location name entered by the user.
 *@returns {array} locationsData - it contains the locations that matches the locationName.
 */

export async function fetchLocations(locationName) {
  try {
    const locationResponse = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${locationName}&count=10`
    );
    if (!locationResponse.ok) {
      throw new Error("An Error Occured While Fetching The Location.");
    }
    const locationsData = await locationResponse.json();
    const filteredArray = filterLocationsArray(locationsData["results"]);
    return filteredArray;
  } catch (error) {
    console.error(error);
  }
}

/*
 * filterLocationsArray filters an array containing locations and returns an array containing only cities or towns.
 * @param {array} locationsArray - array containg the locations (each location is an object).
 * @returns {array} filteredArray - contains the filtered locations.
 */
function filterLocationsArray(locationsArray) {
  if (!locationsArray) {
    return [];
  }
  let filteredArray = locationsArray.filter((location) => {
    return ["PPL", "PPLA", "PPLA2", "PPLA3", "PPLC"].includes(
      location["feature_code"]
    ); // to make sure it is a low-level location like a city and unlike a country
  });
  filteredArray.forEach((location) => {
    location["country_code"] =
      location["country_code"] == "IL" ? "PS" : location["country_code"];
    location["country"] =
      location["country"] == "Israel" ? "Palestine" : location["country"];
    location["lat"] = location["latitude"]; // to make it compatible with other functions
    location["lon"] = location["longitude"]; // to make it compatible with other functions

    delete location["latitude"]; // not needed anymore
    delete location["longitude"]; // not needed anymore
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
  let locationName = "";
  for (let i = 1; i < 3; i++) {
    if (location[`admin${i}`]) {
      locationName += `${location[`admin${i}`]}, `;
    }
  }

  locationName += `${location["country_code"]}`;

  locationName = locationName.endsWith(",")
    ? locationName.slice(0, locationName.length - 1)
    : locationName;
  return locationName;
}

/*
 * getIpLocation gets the user location based on their IP address
 * @returns {object} data - contains the user's IP location info
 */
export async function getIpLocation() {
  /*
   * getUserIp gets the user IP address
   * @returns {string} - the user's IP address
   */
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
