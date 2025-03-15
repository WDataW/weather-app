import { fetchLocations } from "./location.js";
import { displayLocations } from "./ui.js"

const getLocations = document.querySelector(".fetch-location");
const locationField = document.querySelector(".specify-location");

/* after writing the location name and clicking the button: */
getLocations.addEventListener("click", async function () {
  try {
    const locationName=locationField.value;
    if(locationName!==""){/* to check that the locationField isn't empty */
    const locations = await fetchLocations(locationName);
    displayLocations(locations);

    }
  } catch (error) {
    console.error(error);
  }
});
