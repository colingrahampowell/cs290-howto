/*
** Colin Powell (powelcol)
** CS290: NASA Mars Rover How-To:
** 2/11/17
*/

/*
**	PROJECT 1:
**	Making a call to the Mars Rover API, generate all images from the
**	a given camera for a specific date.
*/

var key = "Jmdgeaox1rWq9gAe3Xl7qRVy91iFXWjwodqOGlWT";

// API ADDRESS URL EXAMPLE
/*  https://api.nasa.gov/mars-photos/api/v1/rovers/ */
/*  https://api.nasa.gov/mars-photos/api/v1/manifests/[rover-name]?api_key=DEMO_KEY */

document.addEventListener("DOMContentLoaded", bindSubmit);

function bindSubmit() {
	document.getElementById("submit-search").addEventListener("click", onClick);
}

function onClick(event) {
	// clear any existing text content from last search
	document.getElementById("results-header").textContent = "";
	document.getElementById("error-message").textContent = "";
	document.getElementById("results").textContent = "";

	var manifestReq = new XMLHttpRequest();
	var manUrl = "https://api.nasa.gov/mars-photos/api/v1/manifests/opportunity?api_key=";

	var sol = document.getElementById("sol").value;

	// get camera to display
	var camList = document.getElementsByName("cameras");
	var camera;
	for (var i = 0; i < camList.length; i++) {
		if(camList[i].checked) {
			camera = camList[i].value;
		}
	}

	//open manifests request
	manifestReq.open("GET", manUrl + key, true);
	manifestReq.addEventListener("load", function checkManifest() {

		document.getElementById("results-header").textContent = "Search Results:";

		if(manifestReq.status >= 200 && manifestReq.status < 400) {
			var response = JSON.parse(manifestReq.responseText);
			console.log(response);	// for debugging
			console.log(manifestReq.statusText);

			photoList = response.photo_manifest.photos;

			// check if an image exists on that day with that camera
			// find and return index matching sol. If no match found, return -1.
			var solIndex = findSol(photoList, sol);
			if(solIndex >= 0) {

				if( photoList[solIndex].cameras.indexOf(camera) >= 0 ) {
					getPhotos(camera, sol);
				}
				else {
					document.getElementById("error-message").textContent = 
						"Images exist for that date, but only with cameras " +
						photoList[solIndex].cameras.join(", ") + ".";
				}
			}
			else {
				document.getElementById("error-message").textContent = 
					"Sorry, no images exist on that date.";
			}
		}
		else {
			console.log("Error in request: " + photoReq.statusText);
		}
	});

	manifestReq.send();
	event.preventDefault();

}

function getPhotos(camera, sol) {

	var photoReq = new XMLHttpRequest();
	var photoUrl = "https://api.nasa.gov/mars-photos/api/v1/rovers/opportunity/photos?";

	// open request
	photoReq.open("GET", photoUrl + "sol=" + sol +
		"&camera=" + camera + "&api_key=" + key, true);

	// add load event listener
	photoReq.addEventListener("load", function loadPhotos() {

		if(photoReq.status >= 200 && photoReq.status < 400) {
			var response = JSON.parse(photoReq.responseText);
			console.log(response);	// for debugging
			console.log(photoReq.statusText);

			var resultsDisplay = document.getElementById("results");

			for(photo in response.photos) {

				var imgSource = response.photos[photo].img_src;
				var roverImage = document.createElement("img");
				roverImage.setAttribute("src", imgSource);

				roverImage.style.margin = "5px";
				roverImage.style.width = "150px";

				var imgLink = document.createElement("a");
				imgLink.setAttribute("href", imgSource);
				imgLink.setAttribute("target", "_blank");
			
				imgLink.appendChild(roverImage);
				resultsDisplay.appendChild(imgLink);
			}
		}
		else {
			console.log("Error in request: " + photoReq.statusText);
		}
	});

	photoReq.send();
}

/*
**	helper function to search through manifest and find correct index of data
**	for target sol
*/

function findSol(photoList, targetSol) {

	var count = 0;
	// while we are at an index less than the max possible for the target sol:
	while( photoList[count].sol <= targetSol  ) {
		if(photoList[count].sol == targetSol) {
			return count;
		}
		count++;
	}
	return -1;	// failed search just returns -1
}
