/*
** Colin Powell (powelcol)
** CS290: NASA Epic How-To: Example API calls - Image
** 2/11/17
*/

var key = "Jmdgeaox1rWq9gAe3Xl7qRVy91iFXWjwodqOGlWT";

var MAX_DEC = 23.45;
var MIN_DEC = -23.45;
var DAY_TO_ORBITAL_POS = 360/365;
var EARTH_RADIUS_KM = 6371;
var DATE_RANGE = 7;
var YEAR = 2016;

document.addEventListener("DOMContentLoaded", bindSubmit);

function bindSubmit() {
	document.getElementById("submit-search").addEventListener("click", function(event) {

		clearResults();
		displayWaitMessage();

		var dateReq = new XMLHttpRequest();
		var rootUrl = "https://api.nasa.gov/EPIC/api/";

		// make string for image type
		var imgType;
		if(document.getElementById("natural").checked) { imgType = "natural"; }
		else if (document.getElementById("enhanced").checked) { imgType = "enhanced" }

		var lat = document.getElementById("lat").value;
		var lon = document.getElementById("lon").value;

		// obtain available imagery dates 

		dateReq.open("GET", rootUrl + imgType + "/available?api_key=" + key, true);

		dateReq.addEventListener("load", function() {
			if(dateReq.status >= 200 && dateReq.status < 400) {
				var response = JSON.parse(dateReq.responseText);

				console.log(response);
				response = filterUnique(response);

				var	targetDay;

				// filter by solar declination angle (angle of sun above/below equator)
				if (lat > MAX_DEC) {
					targetDay = declinationToDay(MAX_DEC, YEAR);	//select dates around summer solstice
				}
				else if (lat < MIN_DEC) {
					targetDay = declinationToDay(MIN_DEC, YEAR);	//select dates around winter solstice
				}
				else {
					targetDay = declinationToDay(lat, YEAR);		// calculate day at that declination
				}

				// filter dates such that only those two weeks prior and two weeks after target date are included
				response = filterDates(response, targetDay, DATE_RANGE);
				// proceed to next step - get image data for each candidate date
				getImageData(response, imgType, lat, lon);
			}
			else {
				console.log("Error in request: " + dateReq.status);
				clearResults();
			}
		});

	dateReq.send();
	event.preventDefault();

	});
}

function getImageData(dates, imgType, lat, lon) {

	var imageData = [];
	var completed = 0;
	var rootUrl = "https://api.nasa.gov/EPIC/api/";

	for(var i = 0; i < dates.length; i++) {
		
		// create different closure for each date
		(function (i) {
			var imgReq = new XMLHttpRequest();

			imgReq.open("GET", rootUrl + imgType + "/date/" 
				+ dates[i] + "?api_key=" + key, true);

			imgReq.addEventListener("load", function() {
				
				if(imgReq.status >= 200 && imgReq.status < 400) {	
			
					var response = JSON.parse(imgReq.responseText);

					// "flatten" response into 1-D array
					for(var j = 0; j < response.length; j++) {
						imageData.push(response[j]);
					}
				}
				else {
					console.log("Error fetching data for " + dates[i].date
						+ ": " + imgReq.statusText);
				}

				completed++;	
				// callback once we're finished
				if(completed == dates.length) {
					if(imageData.length > 0) {
						findClosest(imageData, imgType, lat, lon);
					}
					else {	// no images to display.
						clearResults();
					}
				}

			});

			imgReq.send(null);
			event.preventDefault();

		})(i);
	}
}

function findClosest(imageData, imgType, targetLat, targetLon) {

	var closest = imageData[0];
	var coords = imageData[0].centroid_coordinates;

	var closestDistance = haversineDistance(targetLat, targetLon, coords.lat, coords.lon);

	for(var image = 1; image < imageData.length; image++) {

		coords = imageData[image].centroid_coordinates;
		var testDistance = haversineDistance(targetLat, targetLon, coords.lat, coords.lon);

		if(testDistance < closestDistance) {
			closest = imageData[image];
			closestDistance = testDistance;
		}
	}

	displayImage(closest, imgType);
}

function displayImage(imageData, imgType) {

	clearResults();
	var results = document.getElementById("search-results");

	var imgLocation = imageData.image;
	var imgRoot = "https://epic.gsfc.nasa.gov/archive/";

	// parse to find year, month, day 
	var date = imageData.date;
	date = date.slice(0, date.indexOf(" ")).split("-");

	var img = document.createElement("img");

	img.setAttribute("src", imgRoot + imgType + "/" + date[0] + "/" + date[1] + "/" + date[2] + 
		"/png/" + imgLocation + ".png");

	var resultsHeader = document.createElement("h2");
	resultsHeader.textContent = "Your Result:";

	results.appendChild(resultsHeader);
	results.appendChild(img);
}

function haversineDistance(targetLat, targetLon, testLat, testLon) {

	var lat1 = toRad(targetLat);
	var lat2 = toRad(testLat);
	delta_lat = toRad(targetLat - testLat);
	delta_lon = toRad(targetLon - testLon);

	var lon1 = toRad(targetLon);
	var lon2 = toRad(testLon);

	var hav_lat = Math.sin(delta_lat / 2) * Math.sin(delta_lat / 2);
	var hav_lon = Math.sin(delta_lon / 2) * Math.sin(delta_lon / 2);
	var a = hav_lat + Math.cos(lat1) * Math.cos(lat2) * hav_lon;
	
	return 2 * EARTH_RADIUS_KM * Math.asin( Math.sqrt(a) );
}

function declinationToDay(latitude, year) {

	// calculate day number (from 0) where declination = latitude
	var dayNum = toDeg(Math.acos( (latitude / MIN_DEC) )) / DAY_TO_ORBITAL_POS - 10;

	var dateOf = new Date(year, 0);
	dateOf.setDate(dayNum);	
	dateOf.setHours(0);

	return dateOf;
}

function toDeg(rad) {  return ((rad) * 360) / (2 * Math.PI); }
function toRad(deg) { return (deg * Math.PI / 180); }

function filterDates(dates, targetDay, dateRange) {

	var filteredArray = [];

	var min = new Date(targetDay);
	min.setDate( min.getDate() - dateRange );

	var max = new Date(targetDay);
	max.setDate( max.getDate() + dateRange );

	for(day in dates) {

		var dayArray = dates[day].split("-");	// returns array with [year, month, day]
		// Months are zero-indexed
		var candidate = new Date(dayArray[0], dayArray[1] - 1, dayArray[2]);

		console.log("day1a: " + dates[day] + " day1b: " + candidate.toString());

		if( (candidate.getTime() >= min.getTime()) 
			&& candidate.getTime() <= max.getTime()) {
			filteredArray.push(dates[day]);
		}
	}

	return filteredArray;
}

function filterUnique(dates) {

	var filteredArray = [];

	for(day in dates) {
		if(filteredArray.indexOf(dates[day]) === -1) {
			filteredArray.push(dates[day]);
		} 
	}

	return filteredArray;
}

function clearResults() {
	document.getElementById("search-results").textContent = "";
}

function displayWaitMessage() {
	var searchnote = document.createElement("h2");
	searchnote.textContent = "Just A Moment...";
	document.getElementById("search-results").appendChild(searchnote);
}

