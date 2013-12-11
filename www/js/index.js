/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

var tags = {
	    "biatlon": {"name":"Биатлон", "tid":190991, "active":0},
		"bobsplay": {"name":"Бобслей", "tid":190992, "active":0},
		"skeleton": {"name":"Горные лыжи", "tid":191005, "active":0},
		"kyorling": {"name":"Керлинг", "tid":190994, "active":0},
		"skiing_dvoeborie": {"name":"Лыжное двоеборье", "tid":191007, "active":0},
		"skiing_race": {"name":"Лыжные гонки", "tid":191006, "active":0},
		"prizhki": {"name":"Прыжки на лыжах с трамплина", "tid":191008, "active":0},
		"sanki": {"name":"Санный спорт", "tid":190996, "active":0},
		"skeleton": {"name":"Скелетон", "tid":190993, "active":0},
		"speed_konki": {"name":"Скоростной бег на коньках", "tid":190999, "active":0},
		"snowboarding": {"name":"Сноуборд", "tid":191010, "active":0},
		"figure": {"name":"Фигурное катание", "tid":190997, "active":0},
		"freestyle": {"name":"Фристайл", "tid":191009, "active":0},
		"hockey": {"name":"Хоккей", "tid":190995, "active":0},
		"short_track": {"name":"Шорт-трек", "tid":190998, "active":0}
};
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        document.addEventListener('pause', this.onPause, false);
        document.addEventListener('resume', this.onResume, false);
        document.addEventListener('online', this.onOnline, false);
        document.addEventListener('offline', this.onOffline, false);
        
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onPause: function() {
        app.receivedEvent('pause');
    },
    onResume: function() {
        app.receivedEvent('resume');
    },
    onOnline: function() {
        app.receivedEvent('online');
    },
    onOffline: function() {
        app.receivedEvent('offline');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        console.log('Received Event: ' + id);
    },
    initPanel: function() {
    	var panel = jQuery('#sport_types');
    	for(var data_type in tags){
    		
    		panel.append('<div class="sport-icon-element sport-icon-element-1 '+data_type+'"><div data-type="'+data_type+'" class="icon"></div>'+tags[data_type].name+'</div>');
    	}
    },
    checkConnection: function() {
        var networkState = navigator.connection.type;

        var states = {};
        states[Connection.UNKNOWN]  = 'Unknown connection';
        states[Connection.ETHERNET] = 'Ethernet connection';
        states[Connection.WIFI]     = 'WiFi connection';
        states[Connection.CELL_2G]  = 'Cell 2G connection';
        states[Connection.CELL_3G]  = 'Cell 3G connection';
        states[Connection.CELL_4G]  = 'Cell 4G connection';
        states[Connection.CELL]     = 'Cell generic connection';
        states[Connection.NONE]     = 'No network connection';

        console.log('Connection type: ' + states[networkState]);
        return navigator.online;
    },
    onDeviceReady: function() {
        //navigator.splashscreen.hide();
        app.receivedEvent('deviceready');
        app.initPanel();

        /* Клик по кнопкам в левой панели */
        var panel = document.getElementById('sport_types');
        buttons = document.querySelectorAll('.sport-icon-element');
        for (var i=0, length=buttons.length; i<length; i+=1) {
            buttons[i][ document.ontouchstart ? 'ontouchstart' : 'onclick' ] = function() {
                this.classList[ this.classList.contains('active') ? 'remove' : 'add' ]('active');
                //тут должна быть подгрзука видео данной категории
            }
        }
        
        /*if(!app.checkConnection()){
            console.log('online');
        } else {
            console.log('offline');
        }*/
    }
};
