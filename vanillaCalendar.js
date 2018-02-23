/*
    hàm truyền dữ liệu vào php nằm trong hàm markClicked
*/
var vanillaCalendar = {
    month: document.querySelectorAll('[data-calendar-area="month"]')[0],
    next: document.querySelectorAll('[data-calendar-toggle="next"]')[0],
    previous: document.querySelectorAll('[data-calendar-toggle="previous"]')[0],
    label: document.querySelectorAll('[data-calendar-label="month"]')[0],
    activeDates: null,
    activePeriods: null,
    date: new Date(),
    todaysDate: new Date(),
    bookingStatus: [],
    bookingStatusThisMonth: [],
    dayoff: [],
    dayoffThisMonth: [],
    init: function (data = [], dayoff = []) {
        this.bookingStatus = data;
        this.dayoff = dayoff;
        this.date.setDate(1);
        this.createMonth();
        this.createListeners();
    },

    createListeners: function () {
        var _this = this;
        this.next.addEventListener("click", function () {
            _this.clearCalendar();
            var nextMonth = _this.date.getMonth() + 1;
            _this.date.setMonth(nextMonth);
            _this.createMonth();
        });
        // Clears the calendar and shows the previous month
        this.previous.addEventListener("click", function () {
            _this.clearCalendar();
            var prevMonth = _this.date.getMonth() - 1;
            _this.date.setMonth(prevMonth);
            _this.createMonth();
        });
    },

    createDay: function (num, day, year) {
        console.log(num + '-' + day + '-' + year);
        var newDay = document.createElement("div");
        var dateEl = document.createElement("div");
        var isDayoff = false;
        
        newDay.className = "vcal-date";
        // newDay.setAttribute("data-calendar-date", this.date);

        // if it's the first day of the month
        if (num === 1) {
            if (day === 6) {
                newDay.style.marginLeft = (6 * 14.28) + "%";
                console.log((6 * 14.28) + "%");
            } else {
                newDay.style.marginLeft = ((day - 0) * 14.28) + "%"; //thứ tự thứ trong tuần, +/- để tiến hoặc lùi
            }
        }
        if (day === 0) 
            isDayoff = true;
        if (this.dayoffThisMonth.length > 0) {
            for (var i in this.dayoffThisMonth) {
                var dataDate = new Date(this.dayoffThisMonth[i].Dayoff.dayoff);
                if (this.date.getDate() === dataDate.getDate()) {
                    console.log('ok');
                    newDay.classList.add("vcal-date--disabled");
                    isDayoff = true;
                    break;
                }
            }
        }
        
       
        if (isDayoff || this.date.getTime() <= this.todaysDate.getTime() - 1) {
            newDay.classList.add("vcal-date--disabled");
        } else {
            newDay.classList.add("vcal-date--active");
            newDay.setAttribute("data-calendar-status", "active");
        }
        

        if (this.date.toString() === this.todaysDate.toString()) {
            newDay.classList.add("vcal-date--today");
        }

        dateEl.innerHTML = num;
        dateEl.append(this.createMark(this.date, (newDay.classList.contains("vcal-date--disabled"))
            ));
        dateEl.className = "date-cell";
        
        newDay.appendChild(dateEl);
        this.month.appendChild(newDay);
    },

    createMark: function (date, is_disabled=false) { //tạo nút AM PM
        var tb = document.createElement("table"),
            n = document.createElement("tr"),
            am = document.createElement("td"),
            pm = document.createElement("td"),
            am_value = document.createElement("div"),
            pm_value = document.createElement("div");
        var scope = this;

        //hàm tạo 2 nút AM PM, dùng chung một hàm để ko duplicate
        function set_elem(period, child_elem, id_period) {

            //ghi tiêu đề
            var div_title = document.createElement("div");
            if (id_period == 0) {
                div_title.innerHTML = 'AM';
                period.classList.add('mark-am');
                period.setAttribute("data-mark-period", 'AM');
                date.setHours(9, 30, 0, 0);
            } else {
                div_title.innerHTML = 'PM';
                period.classList.add('mark-pm');
                period.setAttribute("data-mark-period", 'PM');
                date.setHours(13, 0, 0, 0);
            }
            div_title.className = "period-title"; //đặt class
            period.append(div_title); //xong, thêm tiêu đề vào nút

            //đánh dấu dựa trên data
            var stat;
            if (scope.bookingStatusThisMonth.length > 0 && !is_disabled) {
                for (var i in scope.bookingStatusThisMonth) { //xét từng phần tử trong những booking tháng này
                    var dataDate = new Date(scope.bookingStatusThisMonth[i].Info.booking_day);
                    var visitTime = scope.bookingStatusThisMonth[i].Info.time_to_come; //lấy thời gian đến để xác định sáng hay chiều
                    if (visitTime.length > 2)
                        visitTime = visitTime.substring(0, 2);
                    if (visitTime < 12) {
                        dataDate.setHours(9);
                        dataDate.setMinutes(30);
                    } else dataDate.setHours(13);
                    if (date.getTime() === dataDate.getTime()) {
                        stat = scope.bookingStatusThisMonth[i].Info.status;
                        break;
                    }
                    else stat = 'CL';
                }
            } else stat = 'CL';
            // if (scope.dayoffThisMonth.length > 0) {
            //     for (var i in scope.dayoffThisMonth) {
            //         var dataDate = new Date(scope.dayoffThisMonth[i].Dayoff.dayoff);
            //         if (date.getDate() === dataDate.getDate()                ) {
            //             console.log('ok');
            //             stat = 'OK';
            //         }
            //     }
            // }
            if (stat != 'OK' && !is_disabled) {
                period.classList.add("vcal-mark--active");
                period.setAttribute("data-mark-status", 'active');
            } else period.classList.add("vcal-date--disabled");

            switch (stat) {
                case 'CL': child_elem.innerHTML = '◯'; break;
                case 'NG': child_elem.innerHTML = '△'; break;
                case 'OK': child_elem.innerHTML = '☓';
                    child_elem.classList.add("disabled");
                    break;
            }
            child_elem.classList.add("period-mark");
            period.appendChild(child_elem);
            period.setAttribute("data-calendar-date", date);
            n.appendChild(period);
        }

        set_elem(am, am_value, 0);
        set_elem(pm, pm_value, 1);
        tb.appendChild(n);
        return tb;
    },

    markClicked: function () {
        var _this = this;
        this.activePeriods = document.querySelectorAll(
            '[data-mark-status="active"]'
        );
        for (var i = 0; i < this.activePeriods.length; i++) {
            this.activePeriods[i].addEventListener("click", function (event) {
                //chọn trường truyền dữ liệu vào ở đây - PASS VALUE
                var pickedPeriod = document.querySelectorAll( //tìm input đặt ngày
                    '[data-calendar-label="picked-period"]'
                )[0];
                var pickedDate = document.querySelectorAll(
                    '[data-calendar-label="picked-date"]'
                )[0];
                var inputTimeToCome = document.querySelectorAll( //tìm input đặt thời gian
                    '[id="InfoTimeToCome"]'
                )[0];
                // var date_var = valDate.getTimezoneOffset();
                // console.log(valDate);
                pickedPeriod.value = (this.dataset.markPeriod); //đặt AM/PM

                var valDate = new Date(this.dataset.calendarDate);
                var inputHour = valDate.getHours();
                inputTimeToCome.value = inputHour < 10 ? '09:30:00' : '13:00:00' //đặt giờ cho input time to come

                valDate.setUTCHours(valDate.getHours()); //đặt 0 giờ theo UTC để ko bị lỗi ngày do múi giờ
                pickedDate.valueAsDate = valDate; //đặt ngày

                $('html, body').animate({ //kéo xuống dưới
                    scrollTop: $("#basicinfo").offset().top
                }, 1000);
                _this.removeActivePeriodClass();
                this.classList.add("vcal-period--selected");
            });
        }
    },

    dateClicked: function () {
        var _this = this;
        this.activeDates = document.querySelectorAll(
            '[data-calendar-status="active"]'
        );
        for (var i = 0; i < this.activeDates.length; i++) {
            this.activeDates[i].addEventListener("click", function (event) {
                var picked = document.querySelectorAll(
                    '[data-calendar-label="picked"]'
                )[0];
                // picked.valueAsDate = new Date(this.dataset.calendarDate);
                // picked.innerHTML = this.dataset.calendarDate;
                _this.removeActiveClass();
                this.classList.add("vcal-date--selected");
            });
        }
    },

    createMonth: function () {
        var scope = this;
        //Lọc lấy những array của tháng này
        var currentMonth = this.date.getMonth();
        this.bookingStatusThisMonth = this.bookingStatus.filter(function (thismonth) {
            var bookdate = new Date(thismonth.Info.booking_day);
            return bookdate.getMonth() == currentMonth &&
                bookdate.getFullYear() == scope.date.getFullYear();
        });
        this.dayoffThisMonth = this.dayoff.filter(function (thismonth) {
            var dayoffdate = new Date(thismonth.Dayoff.dayoff);
            return dayoffdate.getMonth() == currentMonth &&
                dayoffdate.getFullYear() == scope.date.getFullYear();
        })
        while (this.date.getMonth() === currentMonth) {
            this.createDay(
                this.date.getDate(),
                this.date.getDay(),
                this.date.getFullYear()
            );
            this.date.setDate(this.date.getDate() + 1);
        }
        // while loop trips over and day is at 30/31, bring it back
        this.date.setDate(1);
        this.date.setMonth(this.date.getMonth() - 1);

        this.label.innerHTML =
            this.date.getFullYear() + '年' + (this.date.getMonth() + 1) + "月";
        // this.monthsAsString(this.date.getMonth()) + " " + this.date.getFullYear();
        // this.dateClicked();
        this.markClicked();
    },

    clearCalendar: function () {
        vanillaCalendar.month.innerHTML = "";
    },

    removeActiveClass: function () {
        for (var i = 0; i < this.activeDates.length; i++) {
            this.activeDates[i].classList.remove("vcal-date--selected");
        }
    },
    removeActivePeriodClass: function () {
        for (var i = 0; i < this.activePeriods.length; i++) {
            this.activePeriods[i].classList.remove("vcal-period--selected");
        }
    }
};