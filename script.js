// In the fetchPrayerTimes function, modify the date handling:
function fetchPrayerTimes(city, country, latitude, longitude, date = new Date()) {
  const method = 2;
  const school = localStorage.getItem('asrMethod') === 'hanafi' ? 1 : 0;
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  
  let url;
  if (latitude && longitude) {
    url = `https://api.aladhan.com/v1/calendar?latitude=${latitude}&longitude=${longitude}&method=${method}&school=${school}&month=${month}&year=${year}`;
  } else {
    url = `https://api.aladhan.com/v1/calendarByCity?city=${city}&country=${country}&method=${method}&school=${school}&month=${month}&year=${year}`;
  }

  fetch(url)
    .then(res => res.json())
    .then(data => {
      if (data.code === 200 && data.data) {
        // Process only valid dates
        prayerTimesForDays = data.data.filter(day => {
          try {
            return !isNaN(parseApiDate(day.date.gregorian.date).getTime());
          } catch (e) {
            return false;
          }
        }).slice(0, 5);
        
        if (prayerTimesForDays.length > 0) {
          displayPrayerTimes();
          saveLocation(city, country, latitude, longitude);
          
          if (latitude && longitude) {
            calculateQiblaDirection(latitude, longitude);
          }
        } else {
          throw new Error('No valid prayer times data received');
        }
      } else {
        throw new Error('Invalid prayer times data received');
      }
    })
    .catch(err => {
      console.error('Failed to fetch prayer times:', err);
      timeContainerEl.innerHTML = '<p>Error loading prayer times. Please try again.</p>';
    });
}

// Add this helper function to parse API dates correctly
function parseApiDate(dateStr) {
  // API returns dates in "DD-MM-YYYY" format
  const [day, month, year] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

// Update the displayPrayerTimes function:
function displayPrayerTimes() {
  timeContainerEl.innerHTML = '';
  dayIndicatorEl.innerHTML = '';
  
  prayerTimesForDays.forEach((dayData, index) => {
    try {
      const date = parseApiDate(dayData.date.gregorian.date);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
      const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      const dayCard = document.createElement('div');
      dayCard.className = 'day-card';
      dayCard.innerHTML = `
        <h3>${dayName}, ${formattedDate}</h3>
        <div class="times-container"></div>
      `;
      
      const timesContainer = dayCard.querySelector('.times-container');
      
      Object.entries(prayerIcons).forEach(([name, icon]) => {
        const timeStr = dayData.timings[name].split(' ')[0];
        const row = document.createElement('div');
        row.className = 'time-row';
        row.innerHTML = `
          <span class="time-label"><span class="icon">${icon}</span>${name}</span>
          <span>${to12Hour(timeStr)}</span>
        `;
        timesContainer.appendChild(row);
      });
      
      timeContainerEl.appendChild(dayCard);
      
      const dot = document.createElement('div');
      dot.className = `day-dot ${index === 0 ? 'active' : ''}`;
      dayIndicatorEl.appendChild(dot);
    } catch (e) {
      console.error('Error displaying prayer times for day:', e);
    }
  });
  
  // Set current date display
  try {
    if (prayerTimesForDays[0]) {
      const date = parseApiDate(prayerTimesForDays[0].date.gregorian.date);
      datesEl.textContent = date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric' 
      });
    }
  } catch (e) {
    console.error('Error setting current date:', e);
    datesEl.textContent = new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    });
  }
}