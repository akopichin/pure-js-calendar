var Calendar = function(_opts){
    var _this = this;
    var debug = true;
    var DAY = 24 * 60 * 60 * 1000;
    // options
    _this.opts = {
        date             : new Date(),
        tblID            : 'cal-body',
        todayID          : 'today',
        dateTextID       : 'date-str',
        nextMonthID      : 'next-month',
        prevMonthID      : 'prev-month',
        addBtnID         : 'add-event-btn',
        addPopupID       : 'add-event-fast',
        addPopupCloseID  : 'close-fast-popup',
        createEventID    : 'add-event',
        createBtnID      : 'evt-text',
        fullEventID      : 'full-event',
        fullEventCloseID : 'close-full-event'
    }
    // set proposed opts
    for (var opt in _this.opts){
        if (_opts[opt]) _this.opts[opt] = _opts[opt];
    }

    _this.editedEventDate = "";
    _this.editedEventElement = null;
    _this.calBody = document.getElementById(_this.opts.tblID);

    var pad = function(num, pad){
        var s = "000" + num;
        return s.substr(s.length-pad);
    }
    var dayNames = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];
    var monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
    var monthNamesAdv = ['Января', 'Февраля', 'Марта', 'Апреля', 'Мая', 'Июня', 'Июля', 'Августа', 'Сентября', 'Октября', 'Ноября', 'Декабря'];

    // set curDate
    //_this.curDate = (opts.date) ? opts.date : new Date();
    _this.curDate = _this.opts.date;
    if (debug) console.log('**************** ' + _this.curDate);

    _this.hasClass = function(el,cls) {
        return el.className.match(new RegExp('(\\s|^)'+cls+'(\\s|$)'));
    }
    _this.addClass = function(el,cls) {
        if (!_this.hasClass(el,cls)) el.className += " "+cls;
    }
    _this.removeClass = function(el,cls) {
        if (_this.hasClass(el,cls)) {
            var reg = new RegExp('(\\s|^)'+cls+'(\\s|$)');
            el.className=el.className.replace(reg,' ');
        }
    }

    var isLeapYear = function(year){
        return ((year % 400 == 0) || ((year % 4 == 0) && (year % 100 !=0)));
    }

    _this.events = (localStorage && localStorage.getItem('calEvents')) ? JSON.parse(localStorage.getItem('calEvents')) : {};
    if (debug) console.log('events', _this.events);

    _this.cellsData = {};
    _this.removeSelection = function(){
        for (var c in _this.cellsData){
            _this.cellsData[c].unselect();
        }
    }

    this.setDateText = function(){
        if (_this.opts.dateTextID) {
            var el = document.getElementById(_this.opts.dateTextID);
            el.innerHTML = monthNames[_this.opts.date.getMonth()] + " " + _this.opts.date.getFullYear();
        }
    }

    this.showToday = function(){
        if (_this.opts.todayID){
            var el = document.getElementById(_this.opts.todayID);
            el.onclick = function(e){
                _this.opts.date = new Date();
                _this.init(_this.opts);
                return false;
            }
        }
    }

    this.initNextMonthButton = function(){
        if (_this.opts.nextMonthID){
            var el = document.getElementById(_this.opts.nextMonthID);
            el.onclick = function(e){
                var d = _this.opts.date;
                d.setMonth(d.getMonth()+1);
                _this.opts.date = d;
                _this.init(_this.opts);
                return false;
            }
        }
    }

    this.initPrevMonthButton = function(){
        if (_this.opts.prevMonthID){
            var el = document.getElementById(_this.opts.prevMonthID);
            el.onclick = function(e){
                var d = _this.opts.date;
                d.setMonth(d.getMonth()-1);
                _this.opts.date = d;
                _this.init(_this.opts);
                return false;
            }
        }
    }

    this.initAddEventButton = function(){
        if (_this.opts.addBtnID && _this.opts.addPopupID && _this.opts.addPopupCloseID){
            var el = document.getElementById(_this.opts.addBtnID);
            el.onclick = function(e){
                _this.addClass(el, 'active');
                var inp = document.getElementById(_this.opts.createBtnID);
                inp.value = "";
                var e = document.getElementById(_this.opts.addPopupID);
                e.style.display = 'block';
                document.getElementById(_this.opts.addPopupCloseID).onclick = function(_e){
                    _this.removeClass(el, 'active');
                    e.style.display = "none";
                }
                _this.initCreateEventButton();
                return false;
            }
        }
    }

    this.hidePopup = function(){
        var el = document.getElementById(_this.opts.addBtnID);
        _this.removeClass(el, 'active');
        var e = document.getElementById(_this.opts.addPopupID);
        e.style.display = "none";
    }

    this.initCreateEventButton = function(){
        if (_this.opts.createEventID){
            var el = document.getElementById(_this.opts.createEventID);
            el.onclick = function(e){
                var inp = document.getElementById(_this.opts.createBtnID);
                var val = inp.value;
                if (val.length > 5 && val.indexOf(',') != -1){
                    var evtArr = val.split(',');
                    var dt = evtArr[0].split(' ')[0];
                    var mon = parseInt(monthNamesAdv.indexOf(_this.capitalize(evtArr[0].split(' ')[1]))) + 1;
                    var _evt = {
                            name : evtArr[1],
                            participants : "",
                            description : ""
                        };
                    var hash = dt+'-'+mon+'-'+_this.opts.date.getFullYear();
                    var c = null;
                    if (_this.cellsData[hash]){
                        c = _this.cellsData[hash];
                        c.setEvent(_evt);
                    } else {
                        _this.events[hash] = _evt;
                    }
                    _this.hidePopup();
                    // go to this date
                    _this.opts.date = new Date(_this.opts.date.getFullYear(), (parseInt(mon)-1), dt);
                    _this.init(_this.opts);
                    _this.cellsData[hash].el.getElementsByTagName('div')[0].click();
                }
                return false;
            }
        }
    }

    this.capitalize = function(s){
        return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
    }

    this.fullPopupClose = function(){
        var fe = document.getElementById(_this.opts.fullEventID);
        fe.style.display = "none";
        _this.removeSelection();
    }

    this.showFullEvent = function(el){
        if (_this.opts.fullEventID){
            var pos = _this.findPos(el.parentNode);
            // fe - full-event
            var fe = document.getElementById(_this.opts.fullEventID);
            fe.style.display = "block";
            fe.style.left = (pos[0]+110)+'px';
            fe.style.top = ((pos[1])+(window.scrollY || 0)-38)+'px';

            // clear content
            var fec = document.getElementById('fe-content');
            fec.innerHTML = "";

            // close button
            document.getElementById(_this.opts.fullEventCloseID).onclick = function(e){
                _this.fullPopupClose();
            }

            // show fields
            var _evt = _this.events[el.parentNode.getAttribute('data-date-str')];
            var _cell = _this.cellsData[el.parentNode.getAttribute('data-date-str')];
            _this.editedEventDate = el.parentNode.getAttribute('data-date-str');
            //_this.editedEventElement = el.parentNode;
            if (_evt && _evt.name){
                var eventName = _this.createElement('h2', {id : 'event-name'});
                eventName.innerHTML = _evt.name;
            } else {
                var eventName = _this.createElement('input', {
                    id : 'event-name-input',
                    placeholder : 'Событие',
                    type : 'text'
                });
            }
            fec.appendChild(eventName);

            var _date = _this.createElement('div', {id:"date"}, 'field');
            _date.innerHTML = _cell.dt.getDate() + ' ' + monthNamesAdv[_cell.dt.getMonth()];
            fec.appendChild(_date);

            var p = _this.createElement('div', {id: 'participants'});
            if (_evt && _evt.participants){
                var capt = _this.createElement('p', null, 'caption');
                capt.innerText = 'Участники';
                p.appendChild(capt);
                var pText = _this.createElement('p', {id: 'p-text'}, 'field');
                pText.innerText = _evt.participants;
                p.appendChild(pText);
            } else {
                var pName = _this.createElement('input', {
                    id: 'p-name',
                    type: 'text',
                    placeholder: 'Имена участников'
                });
                p.appendChild(pName);
            }
            fec.appendChild(p);
            var descr = _this.createElement('p', {id: 'description'});
            if (_evt && _evt.description){
                var pDescr = _this.createElement('p', {id: 't-description'}, 'field');
                pDescr.innerText = _evt.description;
                descr.appendChild(pDescr);
            } else {
                var tDescr = _this.createElement('textarea', {
                    id: 't-description',
                    cols: 30,
                    rowd: 30,
                    placeholder: 'Описание'
                });
                descr.appendChild(tDescr);
            }
            fec.appendChild(descr);
            var feCtrl = _this.createElement('div', {id: 'full-event-controls'});
            var save = _this.createElement('a', {
                id: 'fec-save',
                href: '#'
            }, 'rnd-button');
            save.innerHTML = "Готово";
            save.onclick = function(e){
                _this.saveEventBtnClick(e);
                return false;
            }
            var remove = _this.createElement('a', {
                id: 'fec-remove',
                href: '#'
            }, 'rnd-button');
            remove.innerHTML = "Удалить";
            remove.onclick = function(e){
                _this.removeEventBtnClick(e);
                return false;
            }
            feCtrl.appendChild(save);
            feCtrl.appendChild(remove);
            fec.appendChild(feCtrl);
        }
    }

    this.saveEventBtnClick = function(_e){
        var e = _this.events[_this.editedEventDate] || {};
        e.name = (document.getElementById('event-name-input')) ? document.getElementById('event-name-input').value : e.name;
        e.participants = (document.getElementById('p-name')) ? document.getElementById('p-name').value : e.participants;
        e.description =(document.getElementById('t-description')) ? document.getElementById('t-description').value : e.description;
        //var el = _this.events[_this.editedEventElement];
        var _cell = _this.cellsData[_this.editedEventDate];
        _cell.setEvent(e);
        _this.editedEventDate = "";
        //_this.editedEventElement = null;
        _this.fullPopupClose();
    }
    this.removeEventBtnClick = function(_e){
        var _cell = _this.cellsData[_this.editedEventDate];
        _cell.unsetEvent();
        _this.editedEventDate = "";
        _this.editedEventElement = null;
        _this.fullPopupClose();
    }

    this.createElement = function(el, attrs, className){
        var _el = document.createElement(el);
        for (var attr in attrs){
            _el.setAttribute(attr, attrs[attr]);
        }
        if (className){
            _el.className = className;
        }
        return _el;
    }

    this.findPos = function(obj) {
        var curleft = 0;
        var curtop = 0;
        if(obj.offsetLeft) curleft += parseInt(obj.offsetLeft);
        if(obj.offsetTop) curtop += parseInt(obj.offsetTop);
        if(obj.scrollTop && obj.scrollTop > 0) curtop -= parseInt(obj.scrollTop);
        if(obj.offsetParent) {
            var pos = _this.findPos(obj.offsetParent);
            curleft += pos[0];
            curtop += pos[1];
        } else if(obj.ownerDocument) {
            var thewindow = obj.ownerDocument.defaultView;
            if(!thewindow && obj.ownerDocument.parentWindow)
                thewindow = obj.ownerDocument.parentWindow;
            if(thewindow) {
                if(thewindow.frameElement) {
                    var pos = _this.findPos(thewindow.frameElement);
                    curleft += pos[0];
                    curtop += pos[1];
                }
            }
        }

        return [curleft,curtop];
    }

    var Cell = function(_d, col, el, isFirstRow){
        var _cell = this;

        this.isToday = false;
        this.dateStr = "";
        this.evt = {
            name : "",
            participants : "",
            description : ""
        };
        this.dt = null;
        this.el = null;
        this._selected = false;
        this._hasEvent = false;
        this._isFirstLine = false;
        this._dayIdx = null;

        this.init = function(_d, col, el, isFirstRow){
            _cell.dt = _d;
            _cell._isFirstRow = isFirstRow;
            _cell._dayIdx = col - 1;
            _cell.dateStr = _d.getDate()+'-'+(_d.getMonth()+1)+'-'+_d.getFullYear();
            var div = document.createElement('div');
            var d = new Date();
            if (_cell.dateStr == (d.getDate()+'-'+(d.getMonth()+1)+'-'+d.getFullYear())) {
                _cell.isToday = true;
                div.className = "today";
            }
            //div.innerHTML = (isFirstRow) ? dayNames[col-1] + ', ' + _d.getDate() : _d.getDate().toString();
            div.innerHTML = _cell.getDate();
            el.appendChild(div);
            el.setAttribute('data-date-str', _cell.dateStr);
            _cell.setElement(el);
            _this.cellsData[_cell.dateStr] = _cell; 
            if (_this.events[_cell.dateStr]){
                _cell.setEvent(_this.events[_cell.dateStr]);
            }
        }

        this.getDate = function(){
            return (_cell._isFirstRow) ? dayNames[_cell._dayIdx] + ', ' + _cell.dt.getDate() : _cell.dt.getDate().toString();
        }

        this.onclick = function(e){
            // open event popup
            _this.removeSelection();
            _cell.select();
            _this.showFullEvent(e.target);
        }

        this.setElement = function(_el){
            this.el = _el;
            this.el.onclick = this.onclick;
        }

        this.select = function(){
            this._selected = true;
            _this.addClass(this.el.getElementsByTagName('div')[0], 'selected');
        }
        this.unselect = function(){
            if (this._selected){
                this._selected = false;
                _this.removeClass(this.el.getElementsByTagName('div')[0], 'selected');
            }
        }
        this.setEvent = function(e){
            _cell.evt = e;
            var html = _cell.getDate();
            //html += _cell.dt.getDate().toString();
            var div = _cell.el.getElementsByTagName('div')[0];
            var delim = '<br>';
            _this.events[_cell.dateStr] = e;
            if (e.name) html += delim + e.name;
            if (e.participants) html += delim + e.participants;
            if (e.description) html += delim + e.description;
            _this.addClass(div, 'has-event');
            div.innerHTML = html;
            _cell.saveEvents();
        }

        this.unsetEvent = function(){
            _cell.evt = null;
            _cell.el.getElementsByTagName('div')[0].innerHTML = _cell.getDate();
            _this.events[_cell.dateStr] = undefined;
            _this.removeClass(_cell.el.getElementsByTagName('div')[0], 'has-event');
            _cell.saveEvents();
        }

        this.saveEvents = function(){
            localStorage.setItem('calEvents', JSON.stringify(_this.events));
        }

        // init
        this.init(_d, col, el, isFirstRow);
    };

    var getPrevMonthDate = function(dt){
        var d = new Date(dt.getTime());
        d.setMonth(d.getMonth()-1);
        return d;
    }

    // dt's month's first day of week
    var getFirstMonthsDay = function(dt){
        return new Date(dt.getFullYear(), dt.getMonth(), 1).getDay();
        //return new Date((dt.getMonth()+1).toString()+'-01-'+dt.getFullYear().toString()).getDay();
    }
    // dt's month's first date
    var getFirstMonthsDate = function(dt){
        return new Date(dt.getFullYear(), dt.getMonth(), 1);
    }

    // dt's month's last day of week
    var getLastMonthsDay = function(dt){
        return new Date(new Date(dt.getFullYear(), dt.getMonth()+1, 1) - 1).getDay();
    }
    // last date in dt's month
    var getMonthsLastDate = function(dt){
        return new Date(new Date(dt.getFullYear(), dt.getMonth()+1, 1) - 1).getDate();
    }

    var getPrevMonthDaysCnt = function(dt){
        return (6 +  getFirstMonthsDay(dt)) % 7;
    }

    var getNextMonthDaysCnt = function(dt){
        /**
         * If we need always 6 rows, we can uncomment this
         * ie feb. 2021 - 28 days - 4 rows.
         */
        /*
        var lastLineDays = (7 * ((getPrevMonthDaysCnt(dt)==6)?0:1));
        var leapYearDays = 0;
        if (!isLeapYear(dt.getFullYear()) && getPrevMonthDaysCnt(dt)==0){
            leapYearDays = 7;
        }*/
        return (7 - getLastMonthsDay(dt)) % 7; //+ lastLineDays + leapYearDays;
    }

    if (debug){
        console.log('curMonth = ' + (_this.opts.date.getMonth()+1));
        console.log('daysBefore = ' + getPrevMonthDaysCnt(_this.opts.date));
        console.log('daysAfter = ' + getNextMonthDaysCnt(_this.opts.date));
        console.log('prevMonth = ' + getPrevMonthDate(_this.opts.date));
        console.log('lastDAY = ' + getMonthsLastDate(_this.opts.date));
    }

    // setup calendar
    this.init = function(o){
        var col = 1;
        var isFirstRow = true;
        var calStr = "Пн Вт Ср Чт Пт Сб Вс\n";
        var prevMonDaysCnt = getPrevMonthDaysCnt(o.date); 
        var curMonthDaysCnt = getMonthsLastDate(o.date);
        var nextMonDaysCnt = getNextMonthDaysCnt(o.date);

        // init buttons
        _this.setDateText();
        _this.showToday();
        _this.initNextMonthButton();
        _this.initPrevMonthButton();
        _this.initAddEventButton();
        //_this.initCreateEventButton();

        var tbl = _this.createElement('table', {id:'cal-tbl'});
        var tr = tbl.insertRow(-1);

        // add prev month dates
        for (var i=prevMonDaysCnt; i>0; i--){
            var td = tr.insertCell(-1);
            var _d = new Date(getFirstMonthsDate(o.date).getTime() - (DAY * i));
            //var _cell = new Cell(_d.getDate()+'-'+(_d.getMonth()+2)+'-'+_d.getFullYear());
            //createCell(_d, _cell, col, td);
            var _cell = new Cell(_d, col, td, isFirstRow);

            calStr += (col > 1) ? " " : "";
            calStr += pad(_d.getDate(), 2);
            col++;
            if (col == 8){
                var tr = tbl.insertRow(-1);
                col = 1;
                calStr += "\n";
                isFirstRow = false;
            }
        }

        // add cur month dates 
        for (var i=0; i<curMonthDaysCnt; i++){
            var td = tr.insertCell(-1);
            var _d = new Date(_this.opts.date.getFullYear(), _this.opts.date.getMonth(), i+1);
            //var _cell = new Cell(_d.getDate()+'-'+(_d.getMonth()+1)+'-'+_d.getFullYear());
            //createCell(_d, _cell, col, td);
            var _cell = new Cell(_d, col, td, isFirstRow);
            calStr += (col > 1) ? " " : "";
            calStr += pad(i+1, 2);
            col++;
            if (col == 8){
                var tr = tbl.insertRow(-1);
                col = 1;
                if (debug) calStr += "\n";
                isFirstRow = false;
            }
        }

        // add next moth dates
        for (var i=0; i<nextMonDaysCnt; i++){
            var td = tr.insertCell(-1);
            var _monthLastDate = new Date(_this.opts.date.getFullYear(), _this.opts.date.getMonth(), getMonthsLastDate(_this.opts.date));
            var _d = new Date(_monthLastDate.getTime() + (DAY * (i+1)));
            //var _cell = new Cell(_d.getDate()+'-'+(_d.getMonth()+1)+'-'+_d.getFullYear());
            //createCell(_d, _cell, col, td);
            var _cell = new Cell(_d, col, td, isFirstRow);

            calStr += (col > 1) ? " " : "";
            calStr += pad(i+1, 2);
            col++;
            if (col == 8){
                col = 1;
                calStr += "\n";
            }
        }

        _this.calBody.innerHTML = "";
        _this.calBody.appendChild(tbl);

        // show cal
        if (debug) console.log(calStr);
    }

    this.init(_this.opts);
}






























