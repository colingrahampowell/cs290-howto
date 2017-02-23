/*
** Colin Powell (powelcol)
** CS290: NASA Epic How-To: Example API calls - Image
** 2/11/17
*/

var key = "Jmdgeaox1rWq9gAe3Xl7qRVy91iFXWjwodqOGlWT";

var MAX_DEC = 23.45;
var MIN_DEC = -23.45;
var DAY_TO_ORBITAL_POS = 360/365;
var DATE_RANGE = 7;
var YEAR = 2016;

// API ADDRESS URL EXAMPLE
/* https://api.nasa.gov/EPIC/api/natural/date/2015-10-31?api_key=DEMO_KEY */

// IMAGE ADDRESS URL EXAMPLE
/* https://api.nasa.gov/EPIC/archive/enhanced/2016/12/04/png/epic_RBG_20161204003633_01.png?api_key=DEMO_KEY */

document.addEventListener("DOMContentLoaded", bindSubmit);

function bindSubmit() {
	document.getElementById("submit-search").addEventListener("click", function(event) {

		document.getElementById("search-results").textContent = "";
	
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

				response = filterUnique(response);
			//	console.log(response);

				var	targetDay;

				// filter by solar declination angle (angle of sun above/below equator)
				if (lat > MAX_DEC) {
					//select dates around summer solstice
					targetDay = declinationToDay(MAX_DEC, YEAR);
				}
				else if (lat < MIN_DEC) {
					//select dates around winter solstice
					targetDay = declinationToDay(MIN_DEC, YEAR);
				}
				else {
					// calculate day at that declination
					targetDay = declinationToDay(lat, YEAR);
				}

				// filter dates such that only those two weeks prior and two weeks after target date are included
				response = filterDates(response, targetDay);
				// for debugging
			//	console.log(response);
				// proceed to next step - get image data for each candidate date
				getImageData(response, imgType, lat, lon);

			}
			else {
				console.log("Error: " + dateReq.status);
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
		var func = function (i) {
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
					console.log("Error fetching data for: " + dates[i].date
						+ ": " + imgReq.statusText);
				}

				completed++;						
				// callback once we're  finished
				if(completed == dates.length) {
					console.log(imageData);
					findClosest(imageData, imgType, lat, lon);
				}

			});

			imgReq.send();
			event.preventDefault();

		}(i);
	}

}

function findClosest(imageData, imgType, targetLat, targetLon) {

	// corvallis
	//var targetLat = 44.0;
	//var targetLon = -123.0;

	var closest = imageData[0];
	// process each coordinates object
	var coords = imageData[0].coords
	coords = coords.slice(0, imageData[0].coords.length - 1);
	coords = JSON.parse(coords).centroid_coordinates;

	var closestDistance = calcDistance(targetLat, targetLon, coords.lat, coords.lon);

	for(var image = 1; image < imageData.length; image++) {

		// process each coordinates object
		var coords = imageData[image].coords
		coords = coords.slice(0, imageData[image].coords.length - 1);
		coords = JSON.parse(coords).centroid_coordinates;

		console.log("lat: " + coords.lat + " " + "lon: " + coords.lon, "dist: " + calcDistance(targetLat, targetLon, coords.lat, coords.lon));

		var testDistance = calcDistance(targetLat, targetLon, coords.lat, coords.lon);

		if(testDistance < closestDistance) {
			closest = imageData[image];
			closestDistance = testDistance;
		}

	}

	console.log(closest);
	displayImage(closest, imgType);

}

function displayImage(imageData, imgType) {

	var results = document.getElementById("search-results");

	var imgLocation = imageData.image;
	var imgRoot = "https://epic.gsfc.nasa.gov/archive/";

	/* parse to find year, month, day */
	var date = imageData.date.slice(0, imageData.date.indexOf(" "));
	
	//example date string: 20xx-yy-zz
	var year = date.slice(0, 4);
	var month = date.slice(5, 7);
	var day = date.slice(8, 10);

	var img = document.createElement("img");
	img.setAttribute("display", "block");
	img.style.border = "5px";
	img.style.width = "500px";

	img.setAttribute("src", imgRoot + imgType + "/" + year + "/" + month + "/" + day + 
		"/png/" + imgLocation + ".png"/* + "?api_key=" + key*/);

	img.addEventListener("load", function(event) {
		results.appendChild(img);
	});

	console.log(img.getAttribute("src"));

}


function calcDistance(targetLat, targetLon, testLat, testLon) {

	return Math.sqrt( Math.pow((targetLat - testLat), 2) + Math.pow((targetLon - testLon), 2) );

}

function declinationToDay(latitude, year) {

	// calculate day number (from 1) where declination = latitude
	var dayNum = (toDegrees((Math.acos( latitude / MIN_DEC ) / DAY_TO_ORBITAL_POS)) -  10);

	var dateOf = new Date(year, 0);
	dateOf.setDate(dayNum);	
	dateOf.setHours(0);

	return dateOf;

}

function toDegrees(rad) {  return ((rad) * 360) / (2 * Math.PI); }

function filterDates(dates, targetDay) {

	var filteredArray = [];

	var min = new Date(targetDay);
	min.setDate( min.getDate() - DATE_RANGE);

	var max = new Date(targetDay);
	max.setDate( max.getDate() + DATE_RANGE);

	for(day in dates) {

		// Days are zero-indexed, set midnight as base time
		var candidate = new Date(dates[day]);
		candidate.setDate( candidate.getDate() + 1);
		candidate.setHours(0);

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

