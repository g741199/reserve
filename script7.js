let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth();
let holidays = [];

function fetchHolidays() {
    var scriptUrl = 'https://script.google.com/macros/s/AKfycbyut7-WiBaTkkCK2eknLgqYAhWtKQvz_AlHGXhG2IppUY8ml3KlQhKV1dhSdCZLyKyxKw/exec'; // GAS のウェブアプリケーションの URL
    fetch(scriptUrl)
        .then(response => response.json())
        .then(data => {
            holidays = data;
            generateCalendar(currentYear, currentMonth);
        })
        .catch(error => console.error('Error:', error));
}

function generateCalendar(year, month) {
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const calendarCaption = document.getElementById('calendar-caption');
    calendarCaption.textContent = `${year}年 ${month + 1}月`;

    const calendar = document.getElementById('calendar');
    calendar.innerHTML = ''; // Clear the calendar before adding new dates
    const daysOfWeek = ['日', '月', '火', '水', '木', '金', '土'];

    // Add the header row for days of week
    let headerRow = document.createElement('tr');
    daysOfWeek.forEach((day, index) => {
        const th = document.createElement('th');
        th.className = `${index === 0 ? 'sunday' : index === 6 ? 'saturday' : ''}`;
        th.textContent = day;
        headerRow.appendChild(th);
    });
    calendar.appendChild(headerRow);

    // Add the dates of the month
    let dateRow = document.createElement('tr');
    for (let i = 0; i < firstDayOfMonth; i++) {
        dateRow.appendChild(document.createElement('td'));
    }
    for (let day = 1; day <= daysInMonth; day++) {
        if ((day + firstDayOfMonth - 1) % 7 === 0 && day > 1) {
            calendar.appendChild(dateRow);
            dateRow = document.createElement('tr');
        }
        const dayOfWeek = (day + firstDayOfMonth - 1) % 7;
        const dayCell = document.createElement('td');
        dayCell.classList.add('date-cell');
        if (dayOfWeek === 0) dayCell.classList.add('sunday');
        if (dayOfWeek === 6) dayCell.classList.add('saturday');
        dayCell.textContent = day;

        // Check if the day is a holiday
        const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const holiday = holidays.find(holiday => holiday.date === dateString);
        if (holiday) {
            dayCell.classList.add('holiday');
            dayCell.innerHTML += `<br><span class="holiday-title">${holiday.title}</span>`;
        }

        dayCell.addEventListener('click', function() {
            // Remove selection from other date cells
            document.querySelectorAll('.date-cell').forEach(cell => {
                cell.classList.remove('selected');
                cell.style.color = ''; // Reset text color to default
            });
            // Add selection to clicked date cell
            this.classList.add('selected');
            this.style.color = 'white'; // Change text color to white
        });
        

        dateRow.appendChild(dayCell);
    }
    calendar.appendChild(dateRow);
}

function navigateMonth(direction) {
    if (direction === 'next') {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
    } else if (direction === 'previous') {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
    }
    generateCalendar(currentYear, currentMonth);
}

document.getElementById('next-month').addEventListener('click', () => navigateMonth('next'));
document.getElementById('previous-month').addEventListener('click', () => navigateMonth('previous'));

// Initially fetch holidays and generate the current month's calendar
fetchHolidays();
