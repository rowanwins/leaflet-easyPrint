##leaflet-easyPrint


A simple [leaflet](http://www.leafletjs.com) plugin which adds an icon to print the map. The resulting print page will strip ot the other content on the page and only print the leaflet map div.

Check out the [demo](http://rowanwins.github.com/leaflet-easyPrint/).

### Usage
Step 1. Include the required js and css files in your document (make sure the js file is listed after the leaflet.js!!!).
```html
   	<link rel="stylesheet" href="dist/easyPrint.css"/>
   	<script src="dist/leaflet.easyPrint.js"></script>
```

Step 2. Ensure your map div id is set to 'map', for example
```html
 <div id="map"></div>
```
If you've set your map div id as something else you'll just need to tweak the css file accordingly.

Step 3. Add the following line of code to your map script

``` js
L.easyPrint().addTo(map)
```

Step 4. Sit back and relax!

###Acknowledgements
Huge hats off go to [mourner](https://github.com/mourner) and all the [contributors](https://github.com/Leaflet/Leaflet/graphs/contributors) to the leaflet project, it's an amazing piece of open source software!