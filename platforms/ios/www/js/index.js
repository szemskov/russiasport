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


/* PubSyb jQuery template */
var o = $( {} );
$.each({
    on: 'subscribe',
    trigger: 'publish',
    off: 'unsubscribe'
}, function( key, api ) {
    $[api] = function() {
        o[key].apply( o, arguments );
    }
});

var DEBUG = false;
var tags = window.localStorage.getItem("tags");
if(!tags){
	tags = {
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
} else {
	tags = $.parseJSON(tags);
}

var sources = {
	"news" : {"ph":"#news",
		"url":"http://russiasport.ru/api.php?wall&format=json&uid=35&offset=:offset&count=:limit&tag_tids[]=:tids",
		"limit":12,
		"offset":0,
		"stop":false,
		"data": [],
		"callback":"app.onGetNews"},
	"video" : {"ph":"#video",
		"url":"http://russiasport.ru/api.php?video&format=json&proccess&offset=:offset&count=:limit&tag_tids[]=:tids",
		"limit":12,
		"offset":0,
		"stop":false,
		"data": [],
		"callback":"app.onGetVideo"},
	"live" : {"ph":"#live",
		"url":"http://russiasport.ru/api.php?video&format=json&proccess&hubs&offset=:offset&count=:limit&tag_tids[]=:tids",
		"limit":12,
		"offset":0,
		"stop":false,
		"data": [],
		"callback":"app.onGetLive"},
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
	if(DEBUG){
		//console.log('Received Event: ' + id);
	}
},
resetAppInits: function() { //сброс конфига по дефолту и удаление различных inner стилей и параметров, которые записываются при работе и могу помешать при повторной инициализации контента.
	for(var i in sources){
		if (sources[i].offset) sources[i].offset = 0;
		if (sources[i].stop) sources[i].stop = false;
		if (sources[i].data.length) sources[i].data = [];
		if (sources[i].ph && $(sources[i].ph)) $(sources[i].ph).removeAttr('style');
	}
	if (this.mySwipers) {
		for (i in this.mySwipers)
			if (this.mySwipers[i] instanceof Swiper) this.mySwipers[i].destroy();
	}
	delete this.mySwipers;
	$('.arrow-wrapper').removeAttr('style');
	return true;
},
initPanel: function() {
	/*if(DEBUG){
		for(var i in sources){
			sources[i]['url'] = sources[i]['url'].replace('russiasport.ru','russiasport.webta.ru');
		}
	}*/
	var panel = jQuery('#sport_types');
	i=0;
	for(var data_type in tags){
		panel.append('<div class="sport-icon-element sport-icon-element-'+(++i)+' '+data_type+(tags[data_type].active?' active':'')+'"><div data-type="'+data_type+'" class="icon"></div>'+tags[data_type].name+'</div>');
	}
	$('.icon-menu, #close').on('click', function() {
		$('body').toggleClass('panel-active');
	})
	/* Клик по кнопкам в левой панели */
	$('#sport_types').on('click.touch', '.sport-icon-element', function() {
						 /*вид спорта*/
						 var type = this.classList[2];
						 tags[type].active = this.classList.contains('active')?0:1;
						 window.localStorage.setItem("tags", $.toJSON(tags));
						 this.classList[ this.classList.contains('active') ? 'remove' : 'add' ]('active');
						 $('body').addClass('is_loading');
						 app.resetAppInits() && app.initContent();
						 });
	
	
	$('.icon.icon-menu').on('click', function() {
							$('#menu_icon').attr( 'checked', !$('#menu_icon').attr('checked') );
							});
	
	$('.icon-reload').on('click', function() {
						$('body').addClass('is_loading');
						 app.resetAppInits() && app.initContent();
						 });
	
},
initContent: function() {
	//remove old data and load from server
	for(var i in sources){
		$(sources[i]['ph']).empty();
		// $(sources[i]['ph']).append('<img src="./style/images/loader.gif" alt="" title="" />');
		this.__load(sources[i]);
	}
	(function(app) {
		if ( !$('body').hasClass('is_loading') ) return;
		var timer = setInterval(function() {
			var counter = 3,
				k = 0;
			for (var i in sources) {
				if ( sources.hasOwnProperty(i) && app.mySwipers &&  app.mySwipers['#'+i] && (app.mySwipers['#'+i] instanceof Swiper) ) k+=1;
				if (k===counter) $('body').removeClass('is_loading') && clearInterval(timer);
			}
		}, 1000);
	})(this);
	
},
updateSources: function(source, json_data) {
	if (arguments.length<2) throw new Error('Arguments.length<2');
	source.offset+=json_data.length;
	if (json_data.length<source.limit) {
		source.stop = true;
		return;
	}
},
onGetNews: function(json){
    var html = '';
    this.updateSources(sources['news'], json);
    for(var i in json){
        var news = json[i];
        html = '<li class="element swiper-slide">'+
        '<a href="article.html?nid='+news.nid+'">'+
        ((typeof(news.image)=='string')?'<img src="'+news.image480x360.replace('webta.','')+'" style="max-width:100%;" alt="" title="" />':'')+
        '<div class="element-text">'+
        '<p class="element-text-title">'+news.node_title+'</p>'+
        '<span class="element-text-time">'+news.time+'</span>'+
        '<span class="element-text-date">'+news.dt+'</span>'+
        '<p class="element-text-tiser">'+this.wrapText(news.teaser)+'</p>'+
        '<p class="element-comments">'+
        '<span class="icon icon-comments"></span>'+
        news.comment_count+
        '</p>'+
        '</div>'+
        '</a>'+
        '</li>';
		sources['news'].data.push( html );
	}
	if (!this.mySwipers || !this.mySwipers['#news']) {
		jQuery(sources['news']['ph']).append(  [].concat(sources['news'].data).splice(0, 8) );
		this.initSlider(sources['news']['ph']);
	}
},
onGetVideo: function(json){
    var html = '';
    this.updateSources(sources['video'], json);
    for(var i in json){
        var video = json[i];
        html='<li class="element swiper-slide">'+
        '<a href="#" onclick="node.onClickNode($(this).attr(\'data-nid\'),\'node.onGetVideo\')" data-nid="'+video.nid+'">'+
        '<div class="play">'+
        '<div class="triangle"></div>'+
        '<span class="text">cмотреть</span>'+
        '<div class="background"></div>'+
        '</div>'+
        '<img src="'+video.uri480x360.replace('webta.','')+'" alt="" title=""/>'+
        '<div class="element-text">'+
        '<p class="element-text-title">'+video.title+'</p>'+
        '<span class="element-text-time">'+video.time+'</span>'+
        '<span class="element-text-date">'+video.dt+'</span>'+
        '<p class="element-comments">'+
        '<span class="icon icon-comments"></span>'+
        video.comment_count+
        '</p>'+
        '</div>'+
        '</a>'+
        '</li>';
		sources['video'].data.push( html );
	}
	if (!this.mySwipers || !this.mySwipers['#video']) {
		jQuery(sources['video']['ph']).append( [].concat(sources['video'].data).splice(0, 8) );
		this.initSlider(sources['video']['ph']);
	}
},
onGetLive: function(json){
    var html = '';
    this.updateSources(sources['live'], json);
    for(var i in json){
        var video = json[i];
        
        html='<li class="element swiper-slide">'+
        '<a href="#" onclick="node.onClickNode($(this).attr(\'data-nid\'),\'node.onGetLive\')" data-nid="'+video.nid+'">'+
        '<div class="play">'+
        '<div class="triangle"></div>'+
        '<span class="text">cмотреть</span>'+
        '<div class="background"></div>'+
        '</div>'+
        '<img src="'+video.uri480x360.replace('webta.','')+'" alt="" title=""/>'+
        '<div class="element-text">'+
        '<p class="element-text-title">'+video.node_title+'</p>'+
        '<span class="element-text-time">'+video.time+'</span>'+
        '<span class="element-text-date">'+video.dt+'</span>'+
        '<p class="element-comments">'+
        '<span class="icon icon-comments"></span>'+
        video.comment_count+
        '</p>'+
        '</div>'+
        '</a>'+
        '</li>';
		 sources['live'].data.push( html );
	}
	if (!this.mySwipers || !this.mySwipers['#live']) {
		jQuery(sources['live']['ph']).append( [].concat(sources['live'].data).splice(0, 8) );
		this.initSlider(sources['live']['ph']);
	}
},
__load: function(source){
    if(navigator.onLine){
        url = app.prepareUrl(source);
        $.ajax({
               type: 'GET',
               url: url,
               contentType: "application/json",
               jsonpCallback: source.callback,
               dataType: 'jsonp',
               error: function(e) {
               //console.log(e.message);
               }
               });
    } else {
        //alert('Нет интернет соединения');
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
	
	//console.log('Connection type: ' + states[networkState]);
	return navigator.online;
},
prepareUrl: function(source) {
	var tids = this._getActiveTags();
	//init placeholders
	url = source.url.replace(':limit',source.limit)
	.replace(':offset',source.offset)
	.replace(':callback',source.callback)
	.replace(':tids',tids);
	return url;
},
_getActiveTags: function(){
	var tids = [];
	for(var i in tags){
		if(tags[i].active){
			tids.push(tags[i].tid);
		}
	}
	return tids.join('&tag_tids[]=');
},
onDeviceReady: function() {
	/*fix height ios 7*/
	if (/ios|iphone|ipod|ipad/i.test(navigator.userAgent) && /OS\s7_0/i.test(navigator.userAgent)) {
        alert(navigator.userAgent);
        $('body').addClass('ios7');
        $('html').addClass('ios7');
    }
	app.receivedEvent('deviceready');
	
	/*init panel*/
	app.initPanel();
	app.receivedEvent('initpanel');
	/*грузим контент*/
	app.initContent();

	app.receivedEvent('init content');
	app.innerWidth = window.innerWidth;
	var supportsOrientationChange = "onorientationchange" in window,
		orientationEvent = supportsOrientationChange ? "orientationchange" : "resize";
	window.addEventListener(orientationEvent, function() {
		var that = app;
		if (
			(orientationEvent==='orientationchange')
		||
			(orientationEvent==='resize' && (app.innerWidth<768 && window.innerWidth>768) || (app.innerWidth>768 && window.innerWidth<768) )
		) {
			app.innerWidth = window.innerWidth;
			if (app.mySwipers) {
				$.each(app.mySwipers, function(i, mySwiper) {
					var sourcesKey = i.substr(1, i.length-1);
					if (!app.mySwipers[i] || !(app.mySwipers[i] instanceof Swiper)) return true;
					var $this = $(i).closest('.line');
					app.mySwipers[i].destroy();
					$this.find('.slider.swiper-wrapper').removeAttr('style');
					app.mySwipers[i] = new Swiper( $this.find('.swiper-container')[0] ,{
						pagination: '.pagination',
						loop: false,
						mode: app.is_landscape() ? 'horizontal' : 'vertical',
						grabCursor: true,
						paginationClickable: true,
						slidesPerView: 'auto',
						onInit: function(swiper) {
							if ( swiper.slides.length>$(swiper.slides).filter('.swiper-slide-visible').length ) {
								$this.find('.arrow-wrapper-next').show();
							}
							if (app.mySwipers._positions[i]) swiper.swipeTo(app.mySwipers._positions[i]);
						},
						onSlideChangeStart: function(swiper) {
							var currentIndex = swiper.activeIndex,
								slidesLength = swiper.slides.length,
								slidesOffset = slidesLength-currentIndex,
								tempSlide = null;  //для хранения переменного слайда, который доабвляается в массив swiper.slides, иначе все добавления в $(swiper.wrapper) будут безрезультатны	;
							if ( slidesOffset<8 ) {
								if ( sources[sourcesKey].data[currentIndex+8] ) {
									$(swiper.wrapper).append( [].concat(sources[sourcesKey].data).splice(slidesLength, slidesLength+8).join('')   );
									temp = swiper.createSlide();
									swiper.appendSlide(tempSlide); swiper.removeLastSlide();
								} else if (sources[sourcesKey].stop!==true){
									that.__load(sources[sourcesKey]);
									setTimeout(function() {
										$(swiper.wrapper).append( [].concat(sources[sourcesKey].data).splice(slidesLength, slidesLength+8).join('')   );
										temp = swiper.createSlide();
										swiper.appendSlide(tempSlide); swiper.removeLastSlide();
									}, 500);
								}
							}
						},
						onSlideChangeEnd: function(swiper) {
							app.mySwipers._positions[i] = swiper.activeIndex;
						}
					});
					app.mySwipers[i].wrapperTransitionEnd(function(swiper) {
							var transition = swiper.getWrapperTranslate();
							if (transition===0) {
								$this.find('.arrow-wrapper-prev').hide();
							} else {
								$this.find('.arrow-wrapper-prev').show();
							}
							var grid = swiper.slidesGrid;
							var visible_count = parseInt(swiper[app.is_landscape()?'width':'height']/grid[1], 10);
							var pos = 0;
							for (var i=swiper.slidesGrid.length-1; i>=-1; i-=1) {
								if ( swiper.slidesGrid[i]<-transition ) {
									pos = i+1;
									if (grid.length-pos===visible_count) {
										$this.find('.arrow-wrapper-next').hide();
										break;
									} else {
										$this.find('.arrow-wrapper-next').show();
									}
								}
							}
						}, true)
					$this.find('.arrow-wrapper-prev').off('click.swipePrev').on('click.swipePrev', function(e){
						e.preventDefault();
						app.mySwipers[i].swipePrev();
					})

					$this.find('.arrow-wrapper-next').off('click.swipeNext').on('click.swipeNext', function(e){
						e.preventDefault();
						app.mySwipers[i].swipeNext();
					})
				})
			}
		}
		});
},
initSlider: function(element) {
	if (!this.mySwipers) this.mySwipers = {_positions: {}};
	var $this = $(element).closest('.line'),
		that = this,
		sourcesKey = element.substr(1, element.length-1);

	var mySwiper = new Swiper( $this.find('.swiper-container')[0] ,{
		pagination: '.pagination',
		loop: false,
		grabCursor: true,
		mode: app.is_landscape() ? 'horizontal' : 'vertical',
		paginationClickable: true,
		slidesPerView: 'auto',
		onInit: function(swiper) {
			if ( swiper.slides.length>$(swiper.slides).filter('.swiper-slide-visible').length ) {
				$this.find('.arrow-wrapper-next').show();
			}
		},
		onSlideChangeStart: function(swiper) {
			var currentIndex = swiper.activeIndex,
				slidesLength = swiper.slides.length,
				slidesOffset = slidesLength-currentIndex,
				tempSlide = null;  //для хранения переменного слайда, который доабвляается в массив swiper.slides, иначе все добавления в $(swiper.wrapper) будут безрезультатны;
			if ( slidesOffset<8 ) {
				if ( sources[sourcesKey].data[currentIndex+8] ) {
					$(swiper.wrapper).append( [].concat(sources[sourcesKey].data).splice(slidesLength, slidesLength+8).join('')   );
					temp = swiper.createSlide();
					swiper.appendSlide(tempSlide); swiper.removeLastSlide();
				} else if (sources[sourcesKey].stop!==true){
					that.__load(sources[sourcesKey]);
					setTimeout(function() {
						$(swiper.wrapper).append( [].concat(sources[sourcesKey].data).splice(slidesLength, slidesLength+8).join('')   );
						temp = swiper.createSlide();
						swiper.appendSlide(tempSlide); swiper.removeLastSlide();
					}, 500);
				}
			}
		},
		onSlideChangeEnd: function(swiper) {
			that.mySwipers._positions[element] = swiper.activeIndex;
		}
	});
	mySwiper.wrapperTransitionEnd(function(swiper) {
		var transition = swiper.getWrapperTranslate();
		if (transition===0) {
			$this.find('.arrow-wrapper-prev').hide();
		} else {
			$this.find('.arrow-wrapper-prev').show();
		}
		var grid = swiper.slidesGrid;
		var visible_count = parseInt(swiper[app.is_landscape()?'width':'height']/grid[1], 10);
		var pos = 0;
		for (var i=swiper.slidesGrid.length-1; i>=-1; i-=1) {
			if ( swiper.slidesGrid[i]<-transition ) {
				pos = i+1;
				if (grid.length-pos===visible_count) {
					$this.find('.arrow-wrapper-next').hide();
					break;
				} else {
					$this.find('.arrow-wrapper-next').show();
				}
			}
		}
	}, true)
	if (mySwiper) {
		this.mySwipers[element] = mySwiper
	}
	$this.find('.arrow-wrapper-prev').on('click.swipePrev', function(e){
		e.preventDefault();
		that.mySwipers[element].swipePrev();
	})
	
	$this.find('.arrow-wrapper-next').on('click.swipeNext', function(e){
		e.preventDefault();
		that.mySwipers[element].swipeNext();
	})
},
wrapText: function(text) {
	if (text.length>109) {
		text = text.split('').splice(0, 109).join('')+'&hellip;';
	}
	return text;
},
is_landscape: function is_landscape() {
	var uagent = navigator.userAgent.toLowerCase();
	if ( uagent.search('ipad') > -1 ) {
		var r = ( window.orientation == 90 || window.orientation == -90 );
	} else {
		var r = ( window.innerWidth>=768 && screen.width > screen.height );
	}
	return r;
},
is_portrait: function is_portrait() {
	var uagent = navigator.userAgent.toLowerCase();
	if ( uagent.search('ipad') > -1 ) {
		var r = ( window.orientation == 0 || window.orientation == 180 );
	} else {
		// var r = ( screen.width < screen.height);
		var r = ( window.innerWidth<768 );
	}
	return r;
}
};