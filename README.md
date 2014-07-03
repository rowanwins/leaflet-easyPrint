##leaflet-easyPrint


A simple [leaflet](http://www.leafletjs.com) plugin which adds an icon to print the map. The resulting print page will strip ot the other content on the page and only print the leaflet map div.

Check out the [demo](http://rowanwins.github.com/leaflet-easyPrint/).


### Usage
#####Step 1. Include the required js and css files in your document. 

**Note** This plugin relies on jQuery as well as an additional jQuery plugin so there will need to added accordingly.
```html
   	<link rel="stylesheet" href="dist/easyPrint.css"/>
	<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js"></script>
	<script src="dist/jQuery.print.js"></script>
   	<script src="dist/leaflet.easyPrint.js"></script>
```
**Note:** The easyPrint.js and easyPrint.css need to be stored in the same folder, although you can tweak the leaflet.easyPrint.js file if you need to store the css in another location.

#####Step 2. Ensure your map div id is set to 'map', for example
```html
 <div id="map"></div>
```
**Note:** If you've set your map div id as something else you'll just need to tweak the leaflet.easyPrint.js file accordingly.

#####Step 3. Add the following line of code to your map script

``` js
L.easyPrint().addTo(map)
```

#####Step 4. Sit back and relax!

###Acknowledgements
Huge hats off go to [mourner](https://github.com/mourner) and all the [contributors](https://github.com/Leaflet/Leaflet/graphs/contributors) to the leaflet project, it's an amazing piece of open source software!

Thanks also to the [jquery](http://jquery.com) team and the [jQuery Print Plugin](https://github.com/DoersGuild/jQuery.print).

And finally thanks to [IcoMoon](http://icomoon.io/) for the print icon.