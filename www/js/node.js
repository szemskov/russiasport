/**
 * $.parseParams - parse query string paramaters into an object.
 */
(function($) {
    var re = /([^&=]+)=?([^&]*)/g;
    var decode = function(str) {
        return decodeURIComponent(str.replace(/\+/g, ' '));
    };
    $.parseParams = function(query) {
        var params = {}, e;
        if (query) {
            if (query.substr(0, 1) == '?') {
                query = query.substr(1);
            }

            while (e = re.exec(query)) {
                var k = decode(e[1]);
                var v = decode(e[2]);
                if (params[k] !== undefined) {
                    if (!$.isArray(params[k])) {
                        params[k] = [params[k]];
                    }
                    params[k].push(v);
                } else {
                    params[k] = v;
                }
            }
        }
        return params;
    };
})(jQuery);

var DEBUG = false;

var node = {
		nid: '',
		uri: '',
		initialize: function() {
		    this.bindEvents();
		},
		bindEvents: function() {
		    document.addEventListener('deviceready', this.onDeviceReady, true);
		},
		onGetVideo: function(node) {
            if(window.node.checkConnection()!='No network connection'){
                if (/ios|iphone|ipod|ipad/i.test(navigator.userAgent)) {
                    if(typeof(node.links.sd_video.hls)!='undefined') {
                        var ref = window.open(node.links.sd_video.hls, '_blank','location=no,toolbar=yes');
                    }
                } else {
                    if(typeof(node.links.sd_video.rtsp)!='undefined'){
                        window.plugins.videoPlayer.play(node.links.sd_video.rtsp);
                    }
                }
            } else {
                navigator.notification.alert('Для просмотра видео требуется соединение с интернетом',false,'ВНИМАНИЕ');
            }
			return false;
		},
		onGetLive: function(node) {
            //alert(window.node.checkConnection());
            //alert($.inArray(window.node.checkConnection(), Array('3G','4G','WiFi','Ethernet')));
            if($.inArray(window.node.checkConnection(), Array('3G','4G','WiFi','Ethernet'))!==false){
                if(!node.links.live){
                    var time = $( "a[data-nid='"+node.nid+"'] span.element-text-time").text();
                    var date = $( "a[data-nid='"+node.nid+"'] span.element-text-date").text();
                    navigator.notification.alert('Начало трансляции ' +date+ ' в '+time,false,'ВНИМАНИЕ');
                }
                
                if (/ios|iphone|ipod|ipad/i.test(navigator.userAgent)) {
                    if(typeof(node.links.live.hls)!='undefined'){
                        var ref = window.open(node.links.live.hls, '_blank','location=no,toolbar=yes');
                    }
                } else {
                    if(typeof(node.links.live.rtsp)!='undefined'){
                        window.plugins.videoPlayer.play(node.links.live.rtsp);
                    }
                }
                
            } else {
                navigator.notification.alert('Для просмотра трансляции требуется подключиться 3G или WiFi сети',false,'ВНИМАНИЕ');
            }
			return false;
		},
		onGetNode: function(node) {
			var content = '';
			var img = '';
			if(node.full.indexOf("img")>0){
				content = node.full.split('<br />');
				var z = $(content[0]).find('img').eq(0);
				if (z.length) img = '<p>'+z[0].outerHTML+'</p>';
				content.shift() ;
				content = content.join(' ');
			} else {
				content = node.full;
			}
			
			$('body').html(
			    '<div id="article"> '+
				    '<div class="header"><div class="three"></div><div class="three icon icon-logo"></div><div class="three"><a href="javascript:document.location.hash=\'\'; document.location.reload();"><div class="icon icon-reload"></div></a></div></div>'+
				     '<div class="popup popup-line clearfix">'+
				    	'<a href="index.html"><p class="navigate">Назад к новостям</p></a>'+
				    	'<p id="date" class="date">'+node.dt+'</p>'+
				    '</div>'+
				'</div>');
				
			$('body').append(
			   '<div class="inforamtion">'+
				'<div class="foreground-image">'+
					img+
					'<div class="wrapper popup">'+
						'<div class="parallelogram title">'+node.title+'</div><br />'+
					'</div>'+
				'</div>'+
				'<div class="under-line only"></div>'+
				'<div class="text">'+ content  +'</div>'+
			'</div>'+
			'<div class="under-line under-line-comments clearfix" id="comments-block">'+
				'<div class="two text">Комментарии</div><div class="two">'+
					'<a href="javascript:('+
						(function() {
							var href = document.location.pathname;
							href+=document.location.search ? document.location.search.split('&').splice(0,1).join('')+'&r=' : '?r';
							href+=new Date().getTime();
							href+='#comments-block';
							document.location.href = href;
						}).toString()+'()'+
					')"><div class="icon icon-reload"></div></a>'+
				'</div>'+
			'</div>'
			);
			
			if(typeof(node.comments)!='undefined'){
				var html = '';
				for(var i in node.comments){
					html+='<li class="clearfix">'+
								'<div class="avatar">'+
									'<img src="'+node.comments[i].avatar+'" alt="" title="" />'+
								'</div>'+
								'<span class="author">'+
									'<div class="name">'+node.comments[i].name+
									'</div>'+
								'</span>'+
								'<p class="text">'+node.comments[i].text+'</p>'+
							'</li>';
				}
				$('body').append('<ul class="comments">'+html+'</ul>');
			}
			var script = document.createElement('script');
			script.innerHTML = 'if (document.location.hash.length) document.location.href=document.location.hash';
			document.body.appendChild(script);
		},
		onClickNode: function(nid, callback){
            if(navigator.onLine){
                if(typeof(nid)!='undefined'){
                    this.nid = parseInt(nid);
                    this.__load(callback);
                }
            } else {
		        navigator.notification.alert('Требуется соединение с интернетом',false,'ВНИМАНИЕ');
		    }
            
		},
		__load: function(callback){
			if(typeof(callback)=='undefined'){
				callback = 'node.onGetNode';
			}
		    if(navigator.onLine){
		        url = 'http://russiasport.ru/api.php?post&format=json&proccess&nid='+node.nid;
			    /*if(DEBUG){
			    	url = url.replace('russiasport.ru','russiasport.webta.ru');
			    }*/
		        $.ajax({
		               type: 'GET',
		               url: url,
		               contentType: "application/json",
		               jsonpCallback: callback,
		               dataType: 'jsonp',
		               error: function(e) {
                        //navigator.notification.alert(e.message,false,'ВНИМАНИЕ');
                        //navigator.notification.alert('Не удалось загрузить контент',false,'ВНИМАНИЕ');
		               }
		               });
		    } else {
		        navigator.notification.alert('Требуется соединение с интернетом',false,'ВНИМАНИЕ');
		    }
		},
		onDeviceReady: function() {
			//clear content
			/*fix height ios 7*/
			if (/ios|iphone|ipod|ipad/i.test(navigator.userAgent) && /OS\s7_0/i.test(navigator.userAgent)) {
		        $('body').addClass('ios7');
		        $('html').addClass('ios7');
		    }
			
			$('body').empty();
			var params = $.parseParams(document.location.search);
			if(typeof(params.nid)!='undefined'){
				node.nid = params.nid;
				node.__load();
			}
			
		},
        checkConnection: function() {
            var networkState = navigator.connection.type;
	
            var states = {};
            states[Connection.UNKNOWN]  = 'Unknown connection';
            states[Connection.ETHERNET] = 'Ethernet';
            states[Connection.WIFI]     = 'WiFi';
            states[Connection.CELL_2G]  = '2G';
            states[Connection.CELL_3G]  = '3G';
            states[Connection.CELL_4G]  = '4G';
            states[Connection.CELL]     = 'Cell generic connection';
            states[Connection.NONE]     = 'No network connection';
	
            return states[networkState];
        }
};