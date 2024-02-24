let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth();
let holidays = [];

function fetchHolidays() {
    var scriptUrl = 'https://script.google.com/macros/s/AKfycbyut7-WiBaTkkCK2eknLgqYAhWtKQvz_AlHGXhG2IppUY8ml3KlQhKV1dhSdCZLyKyxKw/exec'; // GAS カレンダー連携（休日）ver2のデプロイ
    fetch(scriptUrl)
        .then(response => response.json())
        .then(data => {
            holidays = data;
            document.getElementById('loading').style.display = 'none';
            document.querySelector('.calendar-container').style.display = 'block';
            generateCalendar(currentYear, currentMonth);
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('loading').textContent = '読み込みに失敗しました。';
        });
}

function generateCalendar(year, month) {
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const calendarCaption = document.getElementById('calendar-caption');
    calendarCaption.textContent = `${year}年 ${month + 1}月`;

    const calendar = document.getElementById('calendar');
    calendar.innerHTML = '';
    const daysOfWeek = ['日', '月', '火', '水', '木', '金', '土'];

    let headerRow = document.createElement('tr');
    daysOfWeek.forEach((day, index) => {
        const th = document.createElement('th');
        th.className = `${index === 0 ? 'sunday' : index === 6 ? 'saturday' : ''}`;
        th.textContent = day;
        headerRow.appendChild(th);
    });
    calendar.appendChild(headerRow);

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

        const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const holiday = holidays.find(holiday => holiday.date === dateString);
        if (holiday) {
            dayCell.classList.add('holiday');
            dayCell.innerHTML += `<br><span class="holiday-title">${holiday.title}</span>`;
        }

        dayCell.addEventListener('click', function() {
            document.querySelectorAll('.date-cell').forEach(cell => {
                cell.classList.remove('selected');
                cell.style.color = '';
            });
            this.classList.add('selected');
            this.style.color = 'white';
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

fetchHolidays();
