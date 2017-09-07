// $(function(){

$('#search-box').draggable();
$('#info-panel').draggable();
$('#digital-clock').draggable();

var typedLocation;

function parseQuery(qstr) {
    var query = {};
    var a = (qstr[0] === '?' ? qstr.substr(1) : qstr).split('&');
    for (var i = 0; i < a.length; i++) {
        var b = a[i].split('=');
        query[decodeURIComponent(b[0])] = decodeURIComponent(b[1] || '');
    }
    return query;
}

// Setting global-variables
var fullLocation, latitude, longitude, zoomLevel, locationData, sunrise, sunset;
// var cityName = "Local";
var currTimezone = "Local Timezone";
var timezoneOffset = 0;

setInterval(initClock, 1000);

let queryObj = parseQuery(window.location.search)

// Initialize Map
function initMap() {

	// let queryObj = parseQuery(window.location.search)

	var map = new google.maps.Map($('#map')[0], {
		center: {
			lat: +queryObj.lat || 15,
			lng: +queryObj.long || -15,
		},
		zoom: window.location.search ? 12 : 3,
		mapTypeId: google.maps.MapTypeId.HYBRID,
		disableDefaultUI: true
	});
	map.setOptions({ minZoom: 3, maxZoom: 15 });
};

// Search for location
$('#input-location').on('keyup', function(e) {
	$('#info-panel').css("visibility", "hidden")
	$('#search-box').css("visibility", "visible")
	if(!$('#input-location').val() !== '') {
		$inputLocationVal = $('#input-location').val()
		typedLocation = $inputLocationVal
		var selectedLocation = encodeURIComponent($inputLocationVal);
		$.ajax({
			method: "GET",
			url: 'https://maps.googleapis.com/maps/api/geocode/json?address=' + selectedLocation + '&key=AIzaSyCq7BzFiy1D0t2BD3_K9eRHqK8I5uatyxg',
			dataType: "json"
		}).then(function(data){
			if(data['status'] === 'OK') {
				locationData = data;
				// Add items to search list
				$('#search-list').empty(); // start with an empty list

				data['results'].forEach(function(val, idx){
					$('#search-list').append('<li id=' + idx + '>' + val['formatted_address'] + '</li>');
				})
			};
		})
	};
});



// Click on list item
$('#search-list').on('click', function(e) {

	var li_id = e.target.id;
	fullLocation = locationData['results'][li_id]['formatted_address'];
	latitude = locationData['results'][li_id]['geometry']['location']['lat'];
	longitude = locationData['results'][li_id]['geometry']['location']['lng'];
	zoomLevel = locationData['results'][li_id]['address_components'].length * 3;
	if(locationData['results'][li_id]['address_components'].length <= 1) zoomLevel = 7
	initNewMap();
	$('#input-location').val('');
});

$('#loc-msg').on('click', ".glyphicon", function(e) {

	if($(e.target).hasClass("glyphicon-heart-empty")){
		$(e.target).toggleClass("glyphicon-heart-empty")
		$(e.target).toggleClass("glyphicon-heart")
		var $current_user = $('#user').val()
		var $csrf_token = $('#csrf_token').val()
		var $latStrong = +$('.lat-strong').data('lat') || queryObj.lat
		var $longStrong = +$('.long-strong').data('long') || queryObj.long
		$.ajax({
			method: "POST", 
			url: `/users/${$current_user}/favorites/`,
			data:  {
				'csrf_token': $csrf_token,
				'location': fullLocation,
				'latitude': $latStrong,
				'longitude': $longStrong
			},
			dataType: 'json',
		}).then(function(data){
			console.log(data);
		}).catch(function(err){
			console.log(err)
		})
	}
	// else if($(e.target).hasClass("glyphicon-heart")){
	// 	$(e.target).toggleClass("glyphicon-heart")
	// 	$(e.target).toggleClass("glyphicon-heart-empty")
	// }

})

function getUserFavorites(){
	var $current_user = $('#user').val()
	return $.ajax({
		method: "GET",
		url: `/users/${$current_user}/favorites/list`
	})
}


// Display searched locations map
function initNewMap() {
	$('#info-panel').css("visibility", "visible")
	$('#search-box').css("visibility", "hidden")
	var map = new google.maps.Map($('#map')[0], {
		center: {
			lat: latitude,
			lng: longitude,
		},
		zoom: zoomLevel,
		mapTypeId: google.maps.MapTypeId.HYBRID,
		disableDefaultUI: true
	});

	// Adjust timezone offsets
	// Run here and outside of the clock function to avoid google request calls every second
	$.ajax({
		url: "https://maps.googleapis.com/maps/api/timezone/json?location=" + latitude + "," + longitude + "&timestamp=" + (new Date().getTime() / 1000).toFixed(0) + "&key=AIzaSyD1tfXg009CO_oaKRZzJlSOyBj9AQEzcp8",
		type: "GET",
	}).then(function(timeData){
			timezoneOffset = (timeData["rawOffset"] + timeData["dstOffset"]) * 1000; // in milliseconds
			currTimezone = timeData["timeZoneName"];
	});
	// Display location details
	// make an ajax call
	getUserFavorites().then(function(favoritesList){
		let heartClass;
		let found = favoritesList.find(function(val){
			return val.loc === fullLocation
		})

		if(found){
			heartClass = 'glyphicon-heart'
		} else {
			heartClass = 'glyphicon-heart-empty'
		}

		let newHtml = `
			<div class="alert" role="alert">
				<strong><span id="fullLocation"> ${fullLocation}</span></strong>
				<span class="glyphicon ${heartClass}"></span>
			<br>
			Latitude: <strong class='lat-strong' data-lat=${latitude}> 
				${(latitude).toFixed(2)}
			</strong> 
			Longitude: <strong class="long-strong" data-long=${longitude}>  
				${(longitude).toFixed(2)}
			</strong>
	  `

		$("#loc-msg").html(newHtml)
			getWeatherData();
	})
	// get an array of previous favorites
	// change the heart icon if the location has been favorited

	
};




// Get weather details
function getWeatherData() {
	// let queryObj = parseQuery(window.location.search)
	latitude = +queryObj.lat || latitude
	longitude = +queryObj.long || longitude
	$.ajax({



		url: "http://api.openweathermap.org/data/2.5/weather?lat=" + latitude + "&lon=" + longitude + "&units=imperial&appid=4a0118cae1472d927f59a66fa9bdc135",
		type: "GET"
	}).then(function(weatherData){
			var localWeather = weatherData['weather'][0]['description'];
			var temp = parseInt(weatherData['main']['temp']);
			var minTemp = parseInt(weatherData['main']['temp_min']);
			var maxTemp = parseInt(weatherData['main']['temp_max']);
			var relHumid = parseInt(weatherData['main']['humidity']);
			var windSpeed = parseInt(weatherData['wind']['speed']);

			$("#weather-msg").html('<div class="alert alert-info" role="alert">The temperature is currently <strong>' + temp + '&degF</strong> ranging from <strong>' + minTemp + '&deg;F</strong> to <strong>' + maxTemp + '&deg;F</strong> with <strong>' + localWeather + '</strong>. The wind speed is <strong>' + windSpeed + ' mph</strong> with a relative humidity of <strong>' + relHumid + '%</strong>.');
	});
};

if(window.location.search){
	$('#info-panel').css("visibility", "visible")
		$.ajax({
		url: "https://maps.googleapis.com/maps/api/timezone/json?location=" + queryObj.lat + "," + queryObj.long + "&timestamp=" + (new Date().getTime() / 1000).toFixed(0) + "&key=AIzaSyD1tfXg009CO_oaKRZzJlSOyBj9AQEzcp8",
		type: "GET",
	}).then(function(timeData){
			timezoneOffset = (timeData["rawOffset"] + timeData["dstOffset"]) * 1000; // in milliseconds
			currTimezone = timeData["timeZoneName"];
	});
	getUserFavorites().then(function(favoritesList){
		let heartClass;
		let found = favoritesList.find(function(val){
			return val.loc === fullLocation
		})

		if(found){
			heartClass = 'glyphicon-heart'
		} else {
			heartClass = 'glyphicon-heart-empty'
		}
		queryObj.loc = queryObj.loc.replace(/([+])/g, " ")
		let newHtml = `
			<div class="alert" role="alert">
				<strong><span id="fullLocation"> ${queryObj.loc}</span></strong>
				<span class="glyphicon ${heartClass}"></span>
			<br>
			Latitude: <strong class='lat-strong' data-lat=${latitude}> 
				${(+queryObj.lat).toFixed(2)}
			</strong> 
			Longitude: <strong class="long-strong" data-long=${longitude}>  
				${(+queryObj.long).toFixed(2)}
			</strong>
	  `
	  
		$("#loc-msg").html(newHtml)
			getWeatherData();
	})	
}

function initClock() {

	if (timezoneOffset !== 0) {
		var myTime = new Date().getTime() + timezoneOffset; // in milliseconds
		var displayTime = new Date(myTime);
		var year = displayTime.getUTCFullYear();
		var month = displayTime.getUTCMonth();
		var monthDay = displayTime.getUTCDate();
		var day = displayTime.getUTCDay();
		var hours = displayTime.getUTCHours();
		var minutes = displayTime.getUTCMinutes();
		var seconds = displayTime.getUTCSeconds();
	} else {
		var displayTime = new Date();
		var year = displayTime.getFullYear();
		var month = displayTime.getMonth();
		var monthDay = displayTime.getDate();
		var day = displayTime.getDay();
		var hours = displayTime.getHours();
		var minutes = displayTime.getMinutes();
		var seconds = displayTime.getSeconds();
	};

    var amPm = (hours < 12) ? "AM" : "PM";
    hours = (hours == 0) ? 12 : hours;
    hours = (hours > 12) ? hours - 12 : hours;
    //Add a zero in front of numbers<10
    hours = checkTime(hours);
    minutes = checkTime(minutes);
    seconds = checkTime(seconds);
    $("#clock").html(hours + ":" + minutes + "<span id='seconds'>" + seconds + "</span> <span id='ampm'>" + amPm + "</span>");
    
    var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    var days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    $("#date").html(days[day]+", "+monthDay+" "+months[month]+" "+year);
    $("#timezone").html(currTimezone);
}
function checkTime(i) {
    if (i < 10) {
        i = "0" + i;
    }
    return i;
}



