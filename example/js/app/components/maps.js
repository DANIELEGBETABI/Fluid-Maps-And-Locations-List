/* A require.js module that injects a fluid google maps
 * widget into '#map_canvas' and a retailers list into '#right_content'. 
 * Height and width is determined by canvas dimensions, and retailers 
 * list is populated from JSON. Retailers list interacts with canvas and 
 * vise-versa. This widget is dependent on jQuery, so make sure to set the 
 * order of dependencies to reflect this in config > shim.
 */

define(['jquery'], function($){
 	 	
	var 	 map
	   	,retailersArray = []
	  	,settings = {}
	   	,jsonURL = 'http://domain.com/config.json'
	   	,jsonID = 'json123'
	   	,mapsAPIURL = 'http://maps.googleapis.com/maps/api/js?key=123456&sensor=false&callback=mapsOnLoad'

	
	//calls JSON and populates arrays with response.
	function initJSONRequest(){
		try{
			/* Cross-domain hack for getting IE to retrieve JSON from AWS S3.
			* For this to work you need to give a JSON file an ID that is the same as
			* the callback name to create a static JSONP file.
			*/
			$.ajax({url: jsonURL
			       ,dataType: jsonp
			       ,jsonpCallback: jsonID /* Unique function name */
			       ,success: function(data){
					console.log("JSON loaded")
					$.each(data.locations, function(key, value) {
						retailersArray.push({
							 name: value.name 
							,address' : value.address 
							,city' : value.city
							,state' : value.state
							,zip' : value.zip
							,phone' : value.phone
							,website' : value.website
						});	
					});
					
					settings = {
						 center_latitude: data.config.center_latitude
						,center_longitude: data.config.center_longitude
						,zoom: data.config.zoom
					};

					loadScript();
				}	
			});
		}
		catch(error){
			alert("JSON failed to load: " + error);
		}
	}
	
	//callback function that listens at top level for response
	window.mapsOnLoad = function(){
		initializeGoogleMaps();
	}
	
	//Appends google map reference to global name-space, where the googleMapsAPI will be looking for the callback
	function loadScript() {
		var script = document.createElement("script");
		script.type = "text/javascript";
		script.src = mapsAPIURL;
		$("head").append(script);
	}
	
	//sends the configuration to google and sets the results to element
	function initializeGoogleMaps() {
	  var mapOptions = {
	    	zoom: settings.zoom,
	    	center: new google.maps.LatLng(settings.center_latitude, settings.center_longitude),
	   		mapTypeId: google.maps.MapTypeId.TERRAIN
	  }
	  
	  map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);
	  
	  convertAddressToLongLat();
	  populateAddressList();
	 
	}
	
	//converts addresses to latitude and longitude coordinates
	function convertAddressToLongLat(){
		
		geocoder = new google.maps.Geocoder();
		
		for(var i = 0; i < retailersArray.length; i++){
			//create the markers with the returned longitude and latitude coordinates
			geocoder.geocode({'address': retailersArray[i].address + ' ' + retailersArray[i].city + ', ' + retailersArray[i].state + ' ' + retailersArray[i].zip}, createMarker);
		}	
	}
	
	
	//sets the markers up with the returned coordinates
	var markerIndex = 0;
	function createMarker(results, status) {
		
		//add latitude and longitude to retailers array for later comparison		
		retailersArray[markerIndex].latitude = results[0].geometry.location.Ya;
		retailersArray[markerIndex].longitude = results[0].geometry.location.Za;
		
		//creates marker from returned geometry object
		var marker = new google.maps.Marker({map: map, position: results[0].geometry.location, title: retailersArray[markerIndex ].name, animation: google.maps.Animation.DROP});  

		var infoWindow = new google.maps.InfoWindow();
		
		var infoWindowContent = '<article class="info_window_contents">' + 
						'<h1 >' + retailersArray[markerIndex].name + '</h1>' + 
						'<p>' + retailersArray[markerIndex].address + '</p>' + 
						'<p>' + retailersArray[markerIndex].city + ', ' + retailersArray[markerIndex].state + ' ' + retailersArray[markerIndex].zip + '</p>' + 
						'<h2>' + retailersArray[markerIndex].phone + '</h2>' +
						'<a href="' + retailersArray[markerIndex].website + '">website</a>' +  
					'</article>';
		
		infoWindow.setContent(infoWindowContent);
		
		retailersArray[markerIndex].marker = marker;
		retailersArray[markerIndex].infoWindow = infoWindow;
		
		//add listeners to markers
		google.maps.event.addListener(marker, 'mouseover', function(event){	
			var currentMarkerIndex = getMarkerIndex(event.latLng.Ya, event.latLng.Za);
			$('#right_content>article:nth-child(' + (currentMarkerIndex + 1) + ')').css('background', '#333333');
			$('#address' + currentMarkerIndex + '>div').css('background', '#b4694e');
		});
		
		google.maps.event.addListener(marker, 'mouseout', function(event){
			//var currentMarkerIndex = getMarkerIndex(event.latLng.Ya, event.latLng.Za);
			$('#right_content>article').css('background', '#252323');
			$('div#list_circle').css('background', '#5f5959');
		});
		
		google.maps.event.addListener(marker, 'click', function(event) {
			var currentMarkerIndex = getMarkerIndex(event.latLng.Ya, event.latLng.Za);
		    retailersArray[currentMarkerIndex].infoWindow.open(map, retailersArray[currentMarkerIndex].marker);
		});
		
		markerIndex ++;
	}
	
	//since there is no index given, we need to lookup our target by the only values returned from a marker event: latitude and longitude
	function getMarkerIndex(lat, lon){
		for(var i = 0; i < retailersArray.length; i++){
			if(retailersArray[i].latitude === lat && retailersArray[i].longitude === lon){
				return i;
			}
		}
	}
	
	function populateAddressList(){
		
		$.each(retailersArray, function(index, key, value){	
			$('#right_content').append(
				'<article id="address' + index + '" class="list_contents">' + 
					'<div id="list_circle"></div><h1><span class="maps_list_title">' + retailersArray[index].name + '</span></h1>' + 
					'<p>' + retailersArray[index].address + '</p>' + 
					'<p>' + retailersArray[index].city + ', ' + retailersArray[index].state + ' ' + retailersArray[index].zip + '</p>' + 
					'<h2>' + retailersArray[index].phone + '</h2>' +
					'<a href="' + retailersArray[index].website + '">website</a>' +  
				'</article>'
			);
			
			$('#address' + index).hover(
				function(event) {

					toggleBounce(retailersArray[index].marker);
					$('#address' + index + '>div').css('background', '#b4694e');
				}, 
				function(event){
					toggleBounce(retailersArray[index].marker);
					$('#address' + index + '>div').css('background', '#5f5959');
			});
		});	
	}
	
	//sets marker animation on/off
	function toggleBounce(marker) {
		if (marker.getAnimation() != null)
	  		marker.setAnimation(null);
	  	else
			marker.setAnimation(google.maps.Animation.BOUNCE);
	}

	$(document).ready(initJSONRequest);
});