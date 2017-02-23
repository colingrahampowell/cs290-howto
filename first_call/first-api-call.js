		
var key = "Jmdgeaox1rWq9gAe3Xl7qRVy91iFXWjwodqOGlWT";


document.addEventListener("DOMContentLoaded", bindSubmit);

function bindSubmit() {

	document.getElementById("get-images").addEventListener("click", function(event) {

		var photoReq = new XMLHttpRequest();
		var photoUrl = "https://api.nasa.gov/mars-photos/api/v1/rovers/";

		var camera = "fhaz";	// front hazard avoidance
		var rover = "opportunity";
		var sol = 12;			// 12 days after landing

		photoReq.open("GET", photoUrl + rover + "/photos?sol=" 
			+ sol + "&camera=" + camera + "&api_key=" + key, true);
				
		photoReq.addEventListener("load", function loadPhotos() {

			if(photoReq.status >= 200 && photoReq.status < 400) {
				var response = JSON.parse(photoReq.responseText);

					var resultsDisplay = document.getElementById("image-container");

				// display first three images

				for(photo in response.photos) {

					var imgSource = response.photos[photo].img_src;

					var roverImage = document.createElement("img");
					roverImage.setAttribute("src", imgSource);

					// set styling
					roverImage.style.margin = "10px";
					roverImage.style.width = "250px";

					resultsDisplay.appendChild(roverImage);
				}
			}
			else {
				console.log("Error - something went wrong: " + photoReq.statusText);
			}
		});

		photoReq.send(null);
		event.preventDefault();

	});	
}