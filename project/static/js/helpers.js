function initMap(lat, long, zoom) {
  lat = lat || 15;
  long = long || -15
  let map = new google.maps.Map($('#map')[0], {
    center: {
      lat: lat,
      lng: long
    },
    zoom: zoom,
    mapTypeId: google.maps.MapTypeId.HYBRID,
    disableDefaultUI: true,
    zoomControl: true,
    streetViewControl: true
  });
  map.setOptions({ minZoom: 3, maxZoom: 15 });
};

function parseQuery(qstr) {
  let query = {};
  let a = (qstr[0] === '?' ? qstr.substr(1) : qstr).split('&');
  for (let i = 0; i < a.length; i++) {
    let b = a[i].split('=');
    query[decodeURIComponent(b[0])] = decodeURIComponent(b[1] || '');
  }
  return query;
}

function checkQuery(){
  return queryObj.loc && queryObj.lat && queryObj.long;
}

function getUserFavorites(user){
  return $.ajax({
    method: "GET",
    url: `/users/${user}/favorites/list`
  });
}

function getTimeZoneOffset(lat, long){
  return $.ajax({
    method: "GET",
    url: `//maps.googleapis.com/maps/api/timezone/json?location=${lat},${long}&timestamp=${(new Date().getTime() / 1000).toFixed(0)}&key=AIzaSyD1tfXg009CO_oaKRZzJlSOyBj9AQEzcp8`
  });
}

function addZero(i) {
  if (i < 10) {
    i = "0" + i;
  }
  return i;
}

function getFavLocHtml(favList, loc, dataLat, lat, dataLong, long){
  let heartClass;
  let found = favList.find(function(val){
    return val.loc === loc
  })
  if(found){
    heartClass = 'glyphicon-heart'
  } else {
    heartClass = 'glyphicon-heart-empty'
  }

 let newHtml = `
      <div class="alert" role="alert">
        <strong><span id="full-location">${loc}</span></strong>
        <span class="glyphicon ${heartClass}"></span>
      <br>
      Latitude: <strong class='lat-strong' data-lat=${dataLat}> 
        ${(lat).toFixed(2)}
      </strong> 
      Longitude: <strong class="long-strong" data-long=${dataLong}>  
        ${(long).toFixed(2)}
      </strong>
    `
  $("#loc-msg").html(newHtml)
}

