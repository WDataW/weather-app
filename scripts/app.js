import { fetchLocations } from "./location.js";
import { displayLocations } from "./ui.js"
import { fetchWeather } from "./weather.js"
const getLocations = document.querySelector(".fetch-location");
const locationField = document.querySelector(".specify-location");

/* after writing the location name and clicking the button: */
getLocations.addEventListener("click", async function () {
  try {
    const locationName=locationField.value;
    if(locationName.trim()){/* to check that the locationField isn't empty */
      const locations = await fetchLocations(locationName);
      const locationOptions= displayLocations(locations);
      let chosenLocation;
      locationOptions.addEventListener("click", async function (event) {
        try{
          if(event.target.tagName==="BUTTON"){
            const indexOfLocation=Number(event.target.id);/* refers to the index in the locations array */
            chosenLocation= locations[indexOfLocation];
            const weatherData=await fetchWeather(chosenLocation);
          }
        }catch(error){
          console.error(error);
        }
      });
    }
  }catch(error){
    console.error(error);
  }
});
