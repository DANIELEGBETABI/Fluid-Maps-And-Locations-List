Fluid-map-and-locations-list
=============================

A modular Google Maps application that dynamically populates itself from JSON. Additionally, there is a sibling 
container that lists each locations data. Map markers and location data do interact with each other for triggering 
visual cues. The map and list container are both fluid and ready to be given media-queries to become responsive. There 
is no need to add latitude and longitude coordinates, as google has a call that converts them from a street address.


#Dependencies: 
- require.js
- jQuery
- googleMapsAPI v3


notes:
  - Look in the examples folder to see a simplified implimentation.
  - Everything will be appended to '#map_canvas' and '#right_content.
