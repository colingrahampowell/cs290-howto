/*
** Colin Powell (powelcol)
** CS290: NASA Epic How-To: Example API calls - Image
** 2/11/17
*/

var key = "Jmdgeaox1rWq9gAe3Xl7qRVy91iFXWjwodqOGlWT";

// API ADDRESS URL EXAMPLE
/* https://api.nasa.gov/EPIC/api/natural/date/2015-10-31?api_key=DEMO_KEY */

// IMAGE ADDRESS URL EXAMPLE
/* https://api.nasa.gov/EPIC/archive/enhanced/2016/12/04/png/epic_RBG_20161204003633_01.png?api_key=DEMO_KEY */

document.addEventListener("DOMContentLoaded", bindSubmit);

function bindSubmit() {
	document.getElementById("submit-search").addEventListener("click", function(event) {

		document.getElementById("search-results").textContent = "";
	
		var req = new XMLHttpRequest();
		var rootUrl = "https://api.nasa.gov/EPIC/api/";

		/* make string for image type */
		var imgType;
		if(document.getElementById("natural").checked) { imgType = "natural"; }
		else if (document.getElementById("enhanced").checked){ imgType = "enhanced" }

		/* make string for date property */
		var year = document.getElementById("year").value;

		var month = document.getElementById("month").value;
		if(month.length === 1) {
			month = "0" + month;
		}

		var day = document.getElementById("day").value;
		if(day.length === 1) {
			day = "0" + day;
		}

		var date = year + "-" + month + "-" + day;

		req.open("GET", rootUrl + imgType + "/" + "date/"+ date + "?api_key=" + key, true);

		req.addEventListener("load", function() {

			var results = document.getElementById("search-results");
			var response = JSON.parse(req.responseText);

			console.log(response);
		
			for(var i = 0; i < response.length; i++) {
				var imgLocation = response[i].image;
				var imgRoot = "https://epic.gsfc.nasa.gov/archive/";

				var img = document.createElement("img");
				img.setAttribute("display", "block");
				img.style.margin = "5px";
				img.style.width = "250px";

				img.setAttribute("src", imgRoot + imgType + "/" + year + "/" + month + "/" + day + 
					"/jpg/" + imgLocation + ".jpg" + "?api_key=" + key);

				results.appendChild(img);
				console.log("loaded");

				console.log(img.getAttribute("src"));
			}
		});

	req.send(null);
	event.preventDefault();

	});
}

function getImage(response) {

	var imgLocation = response[0].image;
	var imgRoot = "https://api.nasa.gov/EPIC/archive/";

	var img = document.createElement("img");
	img.setAttribute("display", "block");
	img.style.border = "5px";
	img.style.width = "250px";

	img.setAttribute("src", imgRoot + imgType + "/" + year + "/" + month + "/" + day + 
		"/jpg/" + imgLocation + ".jpg" + "?api_key=" + key);

	img.addEventListener("load", function(event) {
		results.appendChild(img);
	});

	console.log(img.getAttribute("src"));
/*
	var imgReq = new XMLHttpRequest();
//	var resourceUrl = ;
	imgReq.open("GET", resourceUrl, true);

	console.log("in image")

	var img = document.createElement("img");
	img.setAttribute("display", "block");
	img.style.width = "150px";

	imgReq.addEventListener("load", function() {
		var imgResp = JSON.parse(imgReq.responseText);
	//	img.setAttribute("src", );
		console.log(imgResp);
	});

	imgReq.send(null);

	return img;
	*/
}
