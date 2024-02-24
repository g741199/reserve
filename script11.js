let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth();
let holidays = [];
let consultationDays = []; // 「診察日」のデータを格納する配列

// 祝祭日のデータを取得する関数
function fetchHolidays() {
    var scriptUrl = 'https://script.google.com/macros/s/AKfycbyut7-WiBaTkkCK2eknLgqYAhWtKQvz_AlHGXhG2IppUY8ml3KlQhKV1dhSdCZLyKyxKw/exec'; // 祝祭日データを取得するGASのURL ver2
    return fetch(scriptUrl)
        .then(response => response.json())
        .then(data => {
            holidays = data;
        });
}

// 「診察日」のデータを取得する関数
function fetchConsultationDays() {
    var scriptUrl = 'https://script.google.com/macros/s/AKfycbzSvgVK38JhZPoQm0AwYF71ZQ6Sx6Is7vNN1vj9SZer-wucGBALR3KiokY-oOhx2iob/exec'; // 「診察日」データを取得するGASのURL ver4
    return fetch(scriptUrl)
        .then(response => response.json())
        .then(data => {
            consultationDays = data;
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
        if (holidays.includes(dateString)) {
            dayCell.classList.add('holiday');
        }
        if (consultationDays.includes(dateString)) {
            dayCell.classList.add('consultation-day');
        }
        dayCell.addEventListener('click', function() {
            if (this.classList.contains('consultation-day') || this.classList.contains('holiday')) {
                document.querySelectorAll('.date-cell').forEach(cell => {
                    cell.classList.remove('selected');
                    cell.style.color = '';
                });
                this.classList.add('selected');
                this.style.color = 'white';
            }
        });
        //const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;


        /*dayCell.addEventListener('click', function() {
            if (this.classList.contains('consultation-day')) {
                document.querySelectorAll('.date-cell').forEach(cell => {
                    cell.classList.remove('selected');
                    cell.style.color = '';
                });
                this.classList.add('selected');
                this.style.color = 'white';
            }
        });*/

        dateRow.appendChild(dayCell);
    }
    calendar.appendChild(dateRow);
}

// 祝祭日と「診察日」のデータを読み込んだ後にカレンダーを生成する
Promise.all([fetchHolidays(), fetchConsultationDays()]).then(() => {
    document.getElementById('loading').style.display = 'none';
    document.querySelector('.calendar-container').style.display = 'block';
    generateCalendar(currentYear, currentMonth);
});

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
