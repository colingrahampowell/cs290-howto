		
var key = "Jmdgeaox1rWq9gAe3Xl7qRVy91iFXWjwodqOGlWT";

document.addEventListener("DOMContentLoaded", bindSubmit);

function bindSubmit() {

	document.getElementById("get-images").addEventListener("click", function(event) {

		document.getElementById("image-container").textContent = "";

		var photoReq = new XMLHttpRequest();
		var rootUrl = "https://api.nasa.gov/EPIC/api/";
		var imgType = "enhanced";

		photoReq.open("GET", rootUrl + imgType + "?api_key=" + key, true);
				
		photoReq.addEventListener("load", function loadPhotos() {

			if(photoReq.status >= 200 && photoReq.status < 400) {
				var response = JSON.parse(photoReq.responseText);

				var photoUrl = "https://api.nasa.gov/EPIC/archive/";
				var resultsDisplay = document.getElementById("image-container");
				for(img in response) {	// display images
					var imgSource = response[img].image;

					var date = response[img].date;
					date = date.slice(0, date.indexOf(" ")).split("-");	// results in array of [year,month,day]

					var earthImage = document.createElement("img");
					earthImage.setAttribute("src", photoUrl + imgType + "/" + date[0] + "/" + date[1] + "/" + date[2] + 
						"/png/" + imgSource + ".png?api_key=" + key);
					
					// set styling
					earthImage.style.margin = "10px";
					earthImage.style.width = "150px";

					resultsDisplay.appendChild(earthImage);
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