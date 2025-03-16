import { fetchLocations } from "./location.js";
import { displayLocations } from "./ui.js"
import { fetchWeather } from "./weather.js"
import { displayCurrentWeather } from "./ui.js";
const getLocations = document.querySelector(".fetch-location");
const locationField = document.querySelector(".specify-location");

// after writing the location name and clicking the button: 
getLocations.addEventListener("click", async function () {
  try {
    const locationName=locationField.value;
    if(locationName.trim()){// to check that 'locationField' value isn't empty.
      const locations = await fetchLocations(locationName); // getting the locations matching 'locationName'.
      const locationOptions= displayLocations(locations); // displaying the locations to the user. LocationOptions refers to the container.
      locationOptions.addEventListener("click", async function (event) {
        try{
          if(event.target.tagName==="BUTTON"){
            const indexOfLocation=Number(event.target.id);// refers to the index in 'locations' array.
            const chosenLocation= locations[indexOfLocation];
            const weatherData=await fetchWeather(chosenLocation);// getting the weather data for the chosen location.
            displayCurrentWeather(weatherData["current"]); //diplaying the 'current weather' properties. NOTE: it will be changed later in the design stage.
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
