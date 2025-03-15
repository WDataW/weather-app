
/* 
* fetchWeather fetches a weather object from api.open-meteo.com using a location.
* @param {object} location - it contains the lat and lon needed to specify the location
* @returns {object} - it contains weather data relative to the specified location.
*/
export async function fetchWeather(location) {
    try {
      const weatherResponse =
        await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${location["lat"]}&longitude=${location["lon"]}&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,wind_direction_10m,is_day&daily=temperature_2m_min,temperature_2m_max,sunset,sunrise&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,rain,visibility,wind_direction_10m,wind_speed_10m`);
      if(!weatherResponse.ok){
        throw new Error("An Error Occured While Fetching The Weather.");
      } 
      const weatherData= await weatherResponse.json();
      return weatherData;
    }catch(error){
      console.error(error);  
    }
}
  