
function to12Hour(time24) {
  const [hourStr, minute] = time24.split(':');
  let hour = parseInt(hourStr);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12 || 12;
  return `${hour}:${minute} ${ampm}`;
}

function fetchPrayerTimes() {
  const city = 'Arlington';
  const country = 'US';
  const method = 2;
  const url = `https://api.aladhan.com/v1/timingsByCity?city=${city}&country=${country}&method=${method}`;
  
  fetch(url)
    .then(res => res.json())
    .then(data => {
      const times = data.data.timings;
      const timesDiv = document.getElementById('times');
      timesDiv.innerHTML = '';
      const keys = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"];
      for (const key of keys) {
        const row = document.createElement('div');
        row.className = 'time-row';
        row.textContent = `${key}: ${to12Hour(times[key])}`;
        timesDiv.appendChild(row);
      }
    })
    .catch(err => {
      document.getElementById('times').innerHTML = 'Failed to fetch prayer times.';
      console.error(err);
    });
}

document.getElementById('toggle-dark').addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
});

fetchPrayerTimes();
