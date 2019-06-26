## leaflet-easyPrint
A simple [leaflet](http://www.leafletjs.com) plugin which adds an icon to print or export a map.

This fork of [rowanwins/leaflet-easyPrint](https://github.com/rowanwins/leaflet-easyPrint) concentrates on the mapbounds and the dpi to export.

## Features
* Supports resizing to predefined sizes (A4 Landscape & Portrait) as well as custom sizes
* Supports saving to png, as well as printing
* Compatible with both Leaflet v1+ and 0.7
* Tested on Chrome, Firefox
  * Incompatible with IE & Edge due to `dom-to-image` dependency

Check out the [demo](http://rowanwins.github.com/leaflet-easyPrint/).

### Download
You can either download this repo directly or install via NPM.
````
npm install leaflet-easyprint
````

### Options
You can pass a number of options to the plugin to control various settings.

| Option        | Type         | Default      | Description   |
| ------------- |--------------|--------------|---------------|
| title | string | 'Print map' | Sets the text which appears as the tooltip of the print/export button |
| position | [Leaflet control position](http://leafletjs.com/reference-1.1.0.html#controls) | 'topleft' | Positions the print button |
| sizeModes | array | `Current` | Options available include `Current`, `A4Portrait`, `A4Landscape` or a [custom size object](#custom-print-sizes) |
| defaultSizeTitles | object | `{Current: 'Current Size', A4Landscape: 'A4 Landscape', A4Portrait: 'A4 Portrait'}`| button tooltips for the default page sizes |
| exportOnly | Boolean | `false` | If set to `true` the map is exported to a png file |
| tileLayer | [Leaflet tile layer](http://leafletjs.com/reference-1.1.0.html#tilelayer) | `null` | A tile layer that you can wait for to draw (helpful when resizing) |
| tileWait | Integer | 500 | How long to wait for the tiles to draw (helpful when resizing) |
| filename | string | 'map' | Name of the file if export only option set to true |
| hidden | Boolean | false | Set to true if you don't want to display the toolbar. Instead you can create your own buttons or fire print events programmatically. You still need to call `addTo(map)` to set the leaflet map context. |
| hideControlContainer | Boolean | true | Hides the leaflet controls like the zoom buttons and the attribution on the print out. |
| hideClasses | array | [] | Hides classes on the print out. Use an array of strings as follow : ['div1', 'div2'] |
| customWindowTitle | string | Defaults to title of map window. | A title for the print window which will get added the printed paper. |
| spinnerBgColor | string | '#0DC5C1' | A valid css colour for the spinner background color. |
| customSpinnerClass | string | 'epLoader' | A class for a custom css spinner to use while waiting for the print. |
| dpi | Integer | 300 | This value is for calculating the correct export pixel resolution  |


### Example
````
L.easyPrint({
    dpi: 600,
    [...]
}).addTo(map);
````

### Acknowledgements
Many thanks to Rowan Winsemius for [rowanwins/leaflet-easyPrint](https://github.com/rowanwins/leaflet-easyPrint)!

Huge hats off go to [mourner](https://github.com/mourner) and all the [contributors](https://github.com/Leaflet/Leaflet/graphs/contributors) to the leaflet.js project, it's an amazing piece of open source software!

Also uses [dom-to-image](https://github.com/tsayen/dom-to-image) and [FileSaver](https://github.com/eligrey/FileSaver.js) under the hood.
