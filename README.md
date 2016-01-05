## leaflet-easyPrint

A simple [leaflet](http://www.leafletjs.com) plugin which adds an icon to print the map.

Check out the [demo](http://rowanwins.github.com/leaflet-easyPrint/).

### Usage
**Step 1.** Include the required js and css files in your document. 

```html
   	<link rel="stylesheet" href="dist/easyPrint.css"/>
   	<script src="dist/leaflet.easyPrint.js"></script>
```

**Step 2.** Add the following line of code to your map script

``` js
L.easyPrint().addTo(map)
```

**Step 3.**
You can pass a number of options to the plugin to control various settings.

| Option        | Type         | Default      | Description   |
| ------------- |--------------|--------------|---------------|
| title | string | 'Print map' | Sets the text which appears as the tooltip of the print button |
| position | [Leaflet control position](http://leafletjs.com/reference.html#control-positions) | 'topleft' | Position the print button |
| elementsToHide | string | none | Enables you to pass through a string of html elements to hide when the user prints the page |

Here's an example of passing through some options.
``` js
L.easyPrint({
	title: 'My awesome print button',
	position: 'bottomright',
	elementsToHide: 'p, h2'
}).addTo(map);
```

### Acknowledgements
Huge hats off go to [mourner](https://github.com/mourner) and all the [contributors](https://github.com/Leaflet/Leaflet/graphs/contributors) to the leaflet.js project, it's an amazing piece of open source software!

And finally thanks to [IcoMoon](http://icomoon.io/) for the print icon.