let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth();
let holidays = [];
let consultationDays = []; // 「診察日」のデータを格納する配列
// クリックされた日付を取得するための変数
let selectedDate = '';

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

// 特定の日付のイベントを取得する関数
function fetchEvents() {
    //var date = document.getElementById('datePicker').value;
//    console.log(selectedDate); // 選択された日付をコンソールに表示（デバッグ用）
    var date = selectedDate;
    if (date) {
        var scriptUrl = 'https://script.google.com/macros/s/AKfycbxYKUOix3dY5J30yQ8Os5F4rdu5TPrplzgjYrGvgXvFkPOP0daxMX0QK0in1y8UtW0z/exec'; // 「〇×△」データ管理するGASのURL　ver4

        showLoader();//ローディング表示
        // ここで時間枠の表示をクリア
        var timeslotContainer = document.getElementById('timeslots');
        timeslotContainer.innerHTML = '';
        fetch(scriptUrl + '?date=' + date)
            .then(response => response.json())
            .then(events => {
                displayEvents(events);
            })
            .catch(error => {
                console.error('Error:', error);
                alert('予定を取得できませんでした。');
            })
            .finally(() => {
                hideLoader();//ローディング非表示
            });
    } else {
        alert('日付を選択してください。');
    }
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
        // dayCellを作成
        const dayCell = document.createElement('td');
        dayCell.classList.add('date-cell');
        if (dayOfWeek === 0) dayCell.classList.add('sunday');
        if (dayOfWeek === 6) dayCell.classList.add('saturday');
        dayCell.textContent = day; // ここでdayとdayCellが紐づいている

        // Check if the day is a holiday
        const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const holiday = holidays.find(holiday => holiday.date === dateString);
        if (holiday) {
            dayCell.classList.add('holiday');
            dayCell.innerHTML += `<br><span class="holiday-title">${holiday.title}</span>`;
        }

        if (consultationDays.includes(dateString)) {

            //---------------------------------------------------
            // 診療可能日のクリック時の処理、ここで診療可能な時間枠を表示する
            //---------------------------------------------------
            dayCell.addEventListener('click', function() {
                // Remove selection from other date cells
                document.querySelectorAll('.date-cell').forEach(cell => {
                    cell.classList.remove('selected');
                    cell.style.color = ''; // Reset text color to default
                    const holidayTitle = cell.querySelector('.holiday-title');
                    if (holidayTitle) {
                        holidayTitle.style.color = 'red'; // Reset holiday title color to red
                    }
                });
                // Add selection to clicked date cell
                this.classList.add('selected');
                this.style.color = 'white'; // Change text color to white
                const holidayTitle = this.querySelector('.holiday-title');
                if (holidayTitle) {
                    holidayTitle.style.color = 'white'; // Change holiday title color to white
                }

                //----------------------------------------------------------------
                //
                // 診療可能日のクリック時の処理、ここで診療可能な時間枠を表示する
                //
                //----------------------------------------------------------------
                if (!document.getElementById('appointment-form').classList.contains('hidden')) {
                    document.getElementById('appointment-form').classList.add('hidden');
                    document.getElementById('new-patient-form').classList.add('hidden');
                    document.getElementById('returning-patient-form').classList.add('hidden');
                    document.getElementById('online-returning-patient-form').classList.add('hidden');
                }

                // 選択日の時間枠表示処理
                selectedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                //console.log(selectedDate); // 選択された日付をコンソールに表示（デバッグ用）
                fetchEvents();
            });

        } else {
            dayCell.classList.add('non-consultation-day'); // クリック不可のクラスを追加
        }

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

    // 時間枠コンテナを隠す
    if (!document.getElementById('timeslots').classList.contains('hidden')) {
        document.getElementById('timeslots').classList.add('hidden');
    }
    generateCalendar(currentYear, currentMonth);

    // ここで初診再診オンライン再診ボタン以下を非表示
    if (!document.getElementById('appointment-form').classList.contains('hidden')) {
        document.getElementById('appointment-form').classList.add('hidden');
        document.getElementById('new-patient-form').classList.add('hidden');
        document.getElementById('returning-patient-form').classList.add('hidden');
        document.getElementById('online-returning-patient-form').classList.add('hidden');
    }

}

document.getElementById('next-month').addEventListener('click', () => navigateMonth('next'));
document.getElementById('previous-month').addEventListener('click', () => navigateMonth('previous'));

function displayEvents(events) {
    var timeslotContainer = document.getElementById('timeslots');
    timeslotContainer.innerHTML = ''; // Clear the container before adding new timeslots

    events.forEach(event => {
        var timeslotElement = document.createElement('div');
        timeslotElement.className = 'timeslot';

        var timeElement = document.createElement('div');
        timeElement.className = 'time';
        timeElement.textContent = event.time.split('-')[0]; // Display only the start time

        var statusElement = document.createElement('div');
        statusElement.className = 'status';

        // Determine the status based on the event title
        if (event.title.includes('〇')) {
            timeslotElement.classList.add('available');
            statusElement.textContent = '〇';
        } else if (event.title.includes('×')) {
            timeslotElement.classList.add('unavailable');
            statusElement.textContent = '×';
        } else if (event.title.includes('△')) {
            timeslotElement.classList.add('available');
            statusElement.textContent = '△';
        }

        timeslotElement.appendChild(timeElement);
        timeslotElement.appendChild(statusElement);
        timeslotContainer.appendChild(timeslotElement);
    });

    if (document.getElementById('timeslots').classList.contains('hidden')) {
        document.getElementById('timeslots').classList.remove('hidden');
    }
    // イベントを表示する関数の最後でこの関数を呼び出す
    addClickListenerToTimeslots();
    // 時間枠コンテナにスクロール
    timeslotContainer.scrollIntoView({ behavior: 'smooth' });

}

let selectedTimeslot = null; // 現在選択されている時間枠を追跡する変数

function addClickListenerToTimeslots() {
    var timeslots = document.querySelectorAll('.timeslot');
    timeslots.forEach(function(timeslot) {
        timeslot.addEventListener('click', function() {
            // "〇" または "△" の時間枠が選択可能かチェック
            if (this.classList.contains('available') || this.classList.contains('limited')) {
                // 以前に選択された時間枠があればリセットする
                if (selectedTimeslot) {
                    resetTimeslot(selectedTimeslot);
                }
                // 新しい時間枠を選択状態にする
                this.classList.add('selected');
                var statusElement = this.querySelector('.status');
                statusElement.textContent = '✓';
                selectedTimeslot = this; // 選択された時間枠を更新

                // ↓スタイルシートに入れてもいいかね
                document.getElementById('new-patient').style.display = 'inline-block';
                document.getElementById('returning-patient').style.display = 'inline-block';
                document.getElementById('online-returning-patient').style.display = 'inline-block';

                //-----------------------------------------
                //  時間枠（timeslot）クリック後、初診再診オンライン再診ボタンを表示する
                //-----------------------------------------
                document.getElementById('appointment-form').classList.remove('hidden');
//                fadeIn(document.getElementById('appointment-buttons'));
                document.getElementById('appointment-form').scrollIntoView({ behavior: 'smooth' })

                // 予約フォーム（初診、再診、オンライン再診）を非表示にする（フェードアウトではなく即時非表示）
                document.getElementById('new-patient-form').classList.add('hidden');
                document.getElementById('returning-patient-form').classList.add('hidden');
                document.getElementById('online-returning-patient-form').classList.add('hidden');
 
            }
        });
    });
}

function resetTimeslot(timeslot) {
    // 選択状態のクラスを削除
    timeslot.classList.remove('selected');
    // 状態表示要素を取得して元の記号に戻す
    var statusElement = timeslot.querySelector('.status');
    statusElement.textContent = timeslot.classList.contains('available') ? '〇' : '△';
}

function showLoader() {
    document.getElementById('loader').style.display = 'flex';
}
function hideLoader() {
    document.getElementById('loader').style.display = 'none';
}

//-----------------------------------------------------------------
//初診フォーム
document.getElementById('new-patient').addEventListener('click', function() {
    document.getElementById('new-patient-form').classList.remove('hidden');
    fadeIn(document.getElementById('new-patient-form'));


    document.getElementById('returning-patient').style.display = 'none';
    document.getElementById('online-returning-patient').style.display = 'none';
    //document.getElementById('datetime-display').textContent = selectedDate + ' ' + selectedTimeslot.querySelector('.time').textContent;
    let selectedDateTime = new Date(selectedDate);
    let selectedTime = selectedTimeslot.querySelector('.time').textContent;
    let year = selectedDateTime.getFullYear();
    let month = selectedDateTime.getMonth() + 1; // 月は0から始まるため、1を足す
    let day = selectedDateTime.getDate();
    let hour = selectedTime.split(':')[0]; // 「14:00」のような形式から時間を取得
    let minute = selectedTime.split(':')[1]; // 「14:00」のような形式から分を取得
    let dayOfWeek = selectedDateTime.getDay();
    // 曜日の名前を配列で定義
    let daysOfWeek = ['日', '月', '火', '水', '木', '金', '土'];
    // 曜日の名前を取得
    let dayName = daysOfWeek[dayOfWeek];

    document.getElementById('datetime-display').textContent = `◎初診◎　${year}年${month}月${day}日 (${dayName}) ${hour}時${minute}分`;
    document.getElementById('appointment-form').scrollIntoView({ behavior: 'smooth' })
});

//再診フォーム
document.getElementById('returning-patient').addEventListener('click', function() {
    document.getElementById('returning-patient-form').classList.remove('hidden');
    fadeIn(document.getElementById('returning-patient-form'));


    document.getElementById('new-patient').style.display = 'none';
    document.getElementById('online-returning-patient').style.display = 'none';
    let selectedDateTime = new Date(selectedDate);
    let selectedTime = selectedTimeslot.querySelector('.time').textContent;
    let year = selectedDateTime.getFullYear();
    let month = selectedDateTime.getMonth() + 1; // 月は0から始まるので1を足す
    let day = selectedDateTime.getDate();
    let hour = selectedTime.split(':')[0]; // "14:00"のような形式から時間を抽出
    let minute = selectedTime.split(':')[1]; // "14:00"のような形式から分を抽出
    let dayOfWeek = selectedDateTime.getDay();
    // 曜日の名前を配列で定義
    let daysOfWeek = ['日', '月', '火', '水', '木', '金', '土'];
    // 曜日の名前を取得
    let dayName = daysOfWeek[dayOfWeek];
    document.getElementById('datetime-display-returning').textContent = `◎再診◎　${year}年${month}月${day}日 (${dayName}) ${hour}時${minute}分`;
    document.getElementById('returning-patient-form').scrollIntoView({ behavior: 'smooth' });
});

//オンライン再診フォーム
document.getElementById('online-returning-patient').addEventListener('click', function() {
    document.getElementById('online-returning-patient-form').classList.remove('hidden');
    fadeIn(document.getElementById('online-returning-patient-form'));

 
    document.getElementById('new-patient').style.display = 'none';
    document.getElementById('returning-patient').style.display = 'none';
    let selectedDateTime = new Date(selectedDate);
    let selectedTime = selectedTimeslot.querySelector('.time').textContent;
    let year = selectedDateTime.getFullYear();
    let month = selectedDateTime.getMonth() + 1;
    let day = selectedDateTime.getDate();
    let hour = selectedTime.split(':')[0];
    let minute = selectedTime.split(':')[1];
    let dayOfWeek = selectedDateTime.getDay();
    let daysOfWeek = ['日', '月', '火', '水', '木', '金', '土'];
    let dayName = daysOfWeek[dayOfWeek];
    document.getElementById('online-datetime-display-returning').textContent = `◎オンライン再診◎　${year}年${month}月${day}日 (${dayName}) ${hour}時${minute}分`;
    document.getElementById('online-returning-patient-form').scrollIntoView({ behavior: 'smooth' });
});

function fadeIn(element) {
    element.classList.add('fade-in');
}

// 初診予約フォームの入力欄のイベントリスナー
const inputs = document.querySelectorAll('#new-patient-form input');
const button = document.getElementById('proceed-button');

inputs.forEach(input => {
    input.addEventListener('input', function() {
        let name = document.getElementById('name').value;
        let email = document.getElementById('email').value;
        let phone = document.getElementById('phone').value;

        if (name && email.includes('@') && phone.match(/^\d{10,11}$/)) {
            button.disabled = false;
            button.classList.add('active');
        } else {
            button.disabled = true;
            button.classList.remove('active');
        }
    });
});

// 再診予約フォームの入力欄のイベントリスナー
const returningInputs = document.querySelectorAll('#returning-patient-form input');
const returningButton = document.getElementById('proceed-button-returning');

returningInputs.forEach(input => {
    input.addEventListener('input', function() {
        let name = document.getElementById('name-returning').value;
        let email = document.getElementById('email-returning').value;
        let phone = document.getElementById('phone-returning').value;

        if (name && email.includes('@') && phone.match(/^\d{10,11}$/)) {
            returningButton.disabled = false;
            returningButton.classList.add('active');
        } else {
            returningButton.disabled = true;
            returningButton.classList.remove('active');
        }
    });
});

// オンライン再診予約フォームの入力欄のイベントリスナー
const onlineInputs = document.querySelectorAll('#online-returning-patient-form input');
const onlineButton = document.getElementById('online-proceed-button');

onlineInputs.forEach(input => {
    input.addEventListener('input', function() {
        let name = document.getElementById('online-name').value;
        let email = document.getElementById('online-email').value;
        let phone = document.getElementById('online-phone').value;

        if (name && email.includes('@') && phone.match(/^\d{10,11}$/)) {
            onlineButton.disabled = false;
            onlineButton.classList.add('active');
        } else {
            onlineButton.disabled = true;
            onlineButton.classList.remove('active');
        }
    });
});