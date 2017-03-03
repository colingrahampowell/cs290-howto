		
var key = "Jmdgeaox1rWq9gAe3Xl7qRVy91iFXWjwodqOGlWT";

var photoReq = new XMLHttpRequest();
var rootUrl = "https://api.nasa.gov/EPIC/api/";
var imgType = "natural";

photoReq.open("GET", rootUrl + imgType + "?api_key=" + key, true);
		
photoReq.addEventListener("load", function loadPhotos() {

	if(photoReq.status >= 200 && photoReq.status < 400) {

		var response = JSON.parse(photoReq.responseText);
		var photoUrl = "https://api.nasa.gov/EPIC/archive/";

		for(var i = 0; i < response.length; i++) {
			var imgSource = response[i].image;
			var date = response[i].date;
			date = date.slice(0, date.indexOf(" ")).split("-");

			console.log(photoUrl + imgType + "/" + date[0] + "/" + date[1] + "/" + date[2] + 
				"/jpg/" + imgSource + ".jpg" + "?api_key=" + key);
		}
	}
	else {
		console.log("Error - something went wrong: " + photoReq.statusText);
	}

});

photoReq.send(null);
