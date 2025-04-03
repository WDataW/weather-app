/*
 * getDayName takes a dateString like '2025-4-23' and returns the day name like 'Wednesday'
 * @param {string} dateString - represents a date like '2024-4-23'
 * @returns {string} - represents the day name to the specified date
 */
export function getDayName(dateString) {
  const date = new Date(dateString);
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return days[date.getDay()];
}

/*
 * getTextDate takes a dateString like '2025-4-23' and returns the text-date like 'April 23'
 * @param {string} dateString - represents a date like '2024-4-23'
 * @returns {string} - represents the text-date to the specified date
 */
export function getTextDate(dateString) {
  const date = new Date(dateString);
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return `${months[date.getMonth()]} ${date.getDate()}`;
}

/*
 * getLocalTime adds using utc_offset_seconds to utc-time and yields a new time
 * @param {object} weather - contains contains weather data based on a specific location
 * @returns {string} - contains utc-time after adding the offset to it (representing local-time)
 */
let secondsTillNextMinute; // will be used later to track the time to keep it updating every new minute
export function getLocalTime(weather) {
  /*
   * convertSecondToOffset takes seconds and converts them to hours, minutes, seconds to prepare them to be added to utc-time later
   * @param {number} seconds - resembles utc_offset_seconds
   * @returns {object} - has distinct properties representing 'seconds' after being converted into hour, minute, second
   */
  function convertSecondToOffset(seconds) {
    let minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    minutes = Math.floor(minutes % 60);
    const second = seconds - minutes * 60 - hours * 3600;
    return {hourOffset: hours, minuteOffset: minutes, secondOffset: second};
  }

  const date = new Date();
  const timeOffset = convertSecondToOffset(weather["utc_offset_seconds"]);

  let utcHour = date.getUTCHours();
  utcHour += timeOffset["hourOffset"]; // applying offset

  let utcMinute = date.getUTCMinutes();
  utcMinute += timeOffset["minuteOffset"]; // applying offset

  secondsTillNextMinute =
    59 - (date.getUTCSeconds() + timeOffset["secondOffset"]); // applying offset

  let AMPM; // using 12hours system
  AMPM = utcHour >= 12 ? "PM" : "AM"; // 12 and over is PM
  if (utcHour > 12) {
    utcHour -= 12; // to ensure time stays 12 or lower, as in the 12hrs system it goes 12pm 1 2 3... 11pm -> 12am
  } else if (utcHour == 0) {
    utcHour += 12;
  }

  return `${utcHour}:${String(utcMinute).padStart(2, "0")} ${AMPM}`;
}

let passMinuteInterval; // to be able to clear interval later
/*
 * trackTime initiates the process of updating time each minute
 * @param {string} time - represents current time, formatted 'hour:minute(padded with 0) AMPM'
 * @returns {void}
 */
export function trackTime(time) {
  passMinuteInterval = setTimeout(() => {
    passMinute(time);
  }, secondsTillNextMinute * 1000);
}
/*
 * passMinute updates the time after each minute passes
 * @param {string} time - represents current time, formatted 'hour:minute(padded with 0) AMPM'
 * @returns {void}
 */
let intervalFlag = true; // to invoke setInterval only once
import {updateLocalTime} from "./ui.js";

function passMinute(time) {
  let hour = Number(time.slice(0, time.indexOf(":"))); // cuts the hour part of 'time'
  let minute = Number(time.slice(time.indexOf(":") + 1, time.indexOf(" "))); // cuts the minute part of 'time'
  let AMPM = time.slice(time.indexOf(" ") + 1);
  if (minute == 59) {
    minute = 0;
    // new hour
    if (hour == 12) {
      // instead of going to 13 go back to 1
      hour = 1;
    } else {
      if (hour == 11) {
        // this means we are going from 11 to 12 and this switches the AM to PM and vice versa
        AMPM = AMPM === "AM" ? "PM" : "AM";
      }
      hour += 1;
    }
  } else if (minute <= 58) {
    minute += 1; // not a new hour, just add another minute
  }

  secondsTillNextMinute = 59; // will be used to add a minute each 59000 milliseconds
  updateLocalTime(`${hour}:${String(minute).padStart(2, "0")} ${AMPM}`); // updates the HTML element that holds the local-time

  if (intervalFlag) {
    setInterval(
      () => passMinute(getDisplayedWeather()), // uses the current local-time and adds a minute to it after 59000 milliseconds
      secondsTillNextMinute * 1000
    );
    intervalFlag = false; // to only setInterval once
  }
}

function stopTrackingTime() {
  // will be used later for some purposes, until then it will be of no use
  clearInterval(passMinuteInterval);
  intervalFlag = true;
}

import {select} from "./ui.js";
function getDisplayedWeather() {
  return select(".local-time .value").textContent;
}
export function convert12To24() {
  const time = getDisplayedWeather();
  let hour = Number(time.slice(0, time.indexOf(":")));
  let AMPM = time.slice(time.indexOf(" ") + 1);
  if (hour == 12) {
    hour = AMPM == "AM" ? 0 : 12;
  } else {
    hour = AMPM == "AM" ? hour : hour + 12;
  }
  return hour;
}
