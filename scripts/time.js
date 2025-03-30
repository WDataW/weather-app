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
