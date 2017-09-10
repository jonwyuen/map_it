let fullLocation, latitude, longitude, zoomLevel, locationData, typedLocation;
let currTimezone = "Local Timezone";
let timezoneOffset = 0;
let $current_user = $('#user').val();
let queryObj = parseQuery(window.location.search);
let initZoom = checkQuery() ? +queryObj.zoom : 3;

setInterval(initClock, 1000);
initMap(+queryObj.lat, +queryObj.long, initZoom);

$('#search-box').draggable({ cancel: '#show-location' }) 
$('#info-panel').draggable({ cancel: '#loc-msg, #weather-msg' }) 
$('#digital-clock').draggable();

$('#input-location').on('keyup', function(e) {
	$('#info-panel').css("visibility", "hidden")
	$('#search-box').css("visibility", "visible")
	if($('#input-location').val() !== '') {
		let $inputLocationVal = $('#input-location').val()
		typedLocation = $inputLocationVal
		let selectedLocation = encodeURIComponent($inputLocationVal);
		$.ajax({
			method: "GET",
			url: `https://maps.googleapis.com/maps/api/geocode/json?address=${selectedLocation}&key=AIzaSyCq7BzFiy1D0t2BD3_K9eRHqK8I5uatyxg`
		}).then(function(data){
			if(data['status'] === 'OK') {
				locationData = data;
				$('#search-list').empty();
				data['results'].forEach(function(val, idx){
					$('#search-list').append(`<li id=${idx}>${val['formatted_address']}</li>`);
				})
			};
		})
	};
});

$('#search-list').on('click', function(e) {
	let liId = e.target.id;
	let result = locationData['results'][liId]
	fullLocation = result['formatted_address'];
	latitude = result['geometry']['location']['lat'];
	longitude = result['geometry']['location']['lng'];
	zoomLevel = result['address_components'].length * 3;
	if(result['address_components'].length <= 2) zoomLevel = 7;
	if(result['types'].includes("country")) zoomLevel = 6;
	if(result['types'].includes("locality")) zoomLevel = 12;
	initNewMap();
	$('#input-location').val('');
});

$('#loc-msg').on('click', ".glyphicon", function(e) {

	if($(e.target).hasClass("glyphicon-heart-empty")){
		$(e.target).toggleClass("glyphicon-heart-empty")
		$(e.target).toggleClass("glyphicon-heart")

		let $current_user = $('#user').val()
		let $csrf_token = $('#csrf_token').val()
		let $latStrong = +$('.lat-strong').data('lat')
		let $longStrong = +$('.long-strong').data('long')

		$.ajax({
			method: "POST", 
			url: `/users/${$current_user}/favorites/`,
			data:  {
				'csrf_token': $csrf_token,
				'location': fullLocation,
				'latitude': $latStrong,
				'longitude': $longStrong,
				'zoom': +zoomLevel
			},
			dataType: 'json',
		})
	}
})

if(checkQuery()){
	$('#info-panel').css("visibility", "visible")
	getTimeZoneOffset(queryObj.lat, queryObj.long).then(function(timeData){
			timezoneOffset = (timeData["rawOffset"] + timeData["dstOffset"]) * 1000;
			currTimezone = timeData["timeZoneName"];
	});
	getUserFavorites($current_user).then(function(favoritesList){
		queryObj.loc = queryObj.loc.replace(/([+])/g, " ")
		getFavLocHtml(favoritesList, queryObj.loc, latitude, +queryObj.lat, longitude, +queryObj.long)
		getWeatherData();
	})	
}

function initNewMap() {
	$('#info-panel').css("visibility", "visible")
	$('#search-box').css("visibility", "hidden")

	initMap(latitude, longitude, zoomLevel)

	getTimeZoneOffset(latitude, longitude).then(function(timeData){
			timezoneOffset = (timeData["rawOffset"] + timeData["dstOffset"]) * 1000;
			currTimezone = timeData["timeZoneName"];
	});
	getUserFavorites($current_user).then(function(favoritesList){
			getFavLocHtml(favoritesList, fullLocation, latitude, latitude, longitude, longitude)
			getWeatherData();
	})
};

function getWeatherData() {
	latitude = +queryObj.lat || latitude
	longitude = +queryObj.long || longitude
	$.ajax({
		url: `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=imperial&appid=4a0118cae1472d927f59a66fa9bdc135`,
		type: "GET"
	}).then(function(weatherData){
			let description = weatherData['weather'][0]['description'];
			let temp = parseInt(weatherData['main']['temp']);
			let minTemp = parseInt(weatherData['main']['temp_min']);
			let maxTemp = parseInt(weatherData['main']['temp_max']);
			let humidity = parseInt(weatherData['main']['humidity']);
			let windSpeed = parseInt(weatherData['wind']['speed']);

			$("#weather-msg").html(`<div class="alert alert-info" role="alert">The temperature is currently <strong>${temp}&degF</strong> 
				ranging from <strong>${minTemp}&deg;F</strong> to <strong>${maxTemp}&deg;F</strong> with <strong>${description}</strong>. 
				The wind speed is <strong>${windSpeed} mph</strong> with a relative humidity of <strong>${humidity}%</strong>.`);
	});
};

function initClock() {

	const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
	let offset = timezoneOffset !== 0;
	let offsetTime = new Date().getTime() + timezoneOffset;
	let displayTime = offset ? new Date(offsetTime) : new Date();
	let year = offset ? displayTime.getUTCFullYear() : displayTime.getFullYear();
	let month = offset ? displayTime.getUTCMonth() : displayTime.getMonth();
	let date = offset ? displayTime.getUTCDate() : displayTime.getDate();
	let day = offset ? displayTime.getUTCDay() : displayTime.getDay();
	let hours = offset ? displayTime.getUTCHours() : displayTime.getHours();
	let minutes = offset ? displayTime.getUTCMinutes() : displayTime.getMinutes();
	let seconds = offset ? displayTime.getUTCSeconds() : displayTime.getSeconds();
  let amPm = (hours < 12) ? "AM" : "PM";

  hours = (hours === 0) ? 12 : hours;
  hours = (hours > 12) ? hours - 12 : hours;

  hours = addZero(hours);
  minutes = addZero(minutes);
  seconds = addZero(seconds);

  $("#clock").html(`${hours}:${minutes}<span id='seconds'>${seconds}</span> <span id='ampm'>${amPm}</span>`);
  $("#date").html(`${days[day]}, ${date} ${months[month]} ${year}`);
  $("#timezone").html(`${currTimezone}`);
}