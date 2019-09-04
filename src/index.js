var domtoimage = require('dom-to-image');
var fileSaver = require('file-saver');

L.Control.EasyPrint = L.Control.extend({
  options: {
    title: 'Print map',
    position: 'topleft',
    sizeModes: ['A4Landscape', 'A4Portrait', 'A3Landscape', 'A3Portrait', 'A2Landscape', 'A2Portrait'],
    filename: 'map',
    shouldExport: false,
    saveIntern: true,
    hidden: false,
    tileWait: 1000,
    hideControlContainers: ['leaflet-top leaflet-left', 'leaflet-top leaflet-right', 'leaflet-bottom leaflet-left'],
    hideClasses: [],
    customWindowTitle: window.document.title,
    spinnerBgCOlor: '#0DC5C1',
    customSpinnerClass: 'epLoader',
    defaultSizeTitles: {
      Current: 'Current Size',
      A4Landscape: 'A4 Landscape',
      A4Portrait: 'A4 Portrait',
      A3Landscape: 'A3 Landscape',
      A3Portrait: 'A3 Portrait',
      A2Landscape: 'A2 Landscape',
      A2Portrait: 'A2 Portrait'
    },
    dpi: 150,
    referenceDOMHeader: null,
    referenceDOMLayers: null,
    referenceDOMFooter: null
  },

  gridContainer: null,
  layersAreLoading: 0,
  renderAreLoading: false,

  resultBlob: new Blob(),

  onAdd: function () {
    this.mapContainer = this._map.getContainer();
    this.options.sizeModes = this.options.sizeModes.map( sizeMode => this.produceSizeModeObject(sizeMode), this);

    var container = L.DomUtil.create('div', 'leaflet-control-easyPrint leaflet-bar leaflet-control');
    if (!this.options.hidden) {

      L.DomEvent.addListener(container, 'mouseover', this._togglePageSizeButtons, this);
      L.DomEvent.addListener(container, 'mouseout', this._togglePageSizeButtons, this);

      var btnClass = 'leaflet-control-easyPrint-button';

      this.link = L.DomUtil.create('a', btnClass, container);
      this.link.id = "leafletEasyPrint";
      this.link.title = this.options.title;
      this.holder = L.DomUtil.create('ul', 'easyPrintHolder', container);

      this.options.sizeModes.forEach(function (sizeMode) {
        var btn = L.DomUtil.create('li', 'easyPrintSizeMode', this.holder);
        btn.title = sizeMode.name;
        var link = L.DomUtil.create('a', sizeMode.className, btn);
        L.DomEvent.addListener(btn, 'click', this.printMap, this);
      }, this);

      L.DomEvent.disableClickPropagation(container);
    }
    return container;
  },

  produceSizeModeObject: function(sizeMode) {
    if (sizeMode === 'Current') {
      return {
        height: this.getPixelsByPixelAndDPI(this._map.getSize().y),
        width: this.getPixelsByPixelAndDPI(this._map.getSize().x),
        name: this.options.defaultSizeTitles.Current,
        className: 'CurrentSize'
      }
    }
    if (sizeMode === 'A4Landscape') {
      return {
        height: this.getPixelsByMetricAndDPI(this._a4PageSize.width),
        width: this.getPixelsByMetricAndDPI(this._a4PageSize.height),
        name: this.options.defaultSizeTitles.A4Landscape,
        className: 'A4Landscape page'
      }
    }
    if (sizeMode === 'A4Portrait') {
      return {
        height: this.getPixelsByMetricAndDPI(this._a4PageSize.height),
        width: this.getPixelsByMetricAndDPI(this._a4PageSize.width),
        name: this.options.defaultSizeTitles.A4Portrait,
        className: 'A4Portrait page'
      }
    }
    if (sizeMode === 'A3Landscape') {
      return {
        height: this.getPixelsByMetricAndDPI(this._a3PageSize.width),
        width: this.getPixelsByMetricAndDPI(this._a3PageSize.height),
        name: this.options.defaultSizeTitles.A3Landscape,
        className: 'A3Landscape page'
      }
    }
    if (sizeMode === 'A3Portrait') {
      return {
        height: this.getPixelsByMetricAndDPI(this._a3PageSize.height),
        width: this.getPixelsByMetricAndDPI(this._a3PageSize.width),
        name: this.options.defaultSizeTitles.A3Portrait,
        className: 'A3Portrait page'
      }
    }
    if (sizeMode === 'A2Landscape') {
      return {
        height: this.getPixelsByMetricAndDPI(this._a2PageSize.width),
        width: this.getPixelsByMetricAndDPI(this._a2PageSize.height),
        name: this.options.defaultSizeTitles.A2Landscape,
        className: 'A2Landscape page'
      }
    }
    if (sizeMode === 'A2Portrait') {
      return {
        height: this.getPixelsByMetricAndDPI(this._a2PageSize.height),
        width: this.getPixelsByMetricAndDPI(this._a2PageSize.width),
        name: this.options.defaultSizeTitles.A2Portrait,
        className: 'A2Portrait page'
      }
    };
    return sizeMode;
  },

  getPixelsByMetricAndDPI: function(size, dpi = this.options.dpi){
    return dpi / 25.4 * size;
  },

  getPixelsByPixelAndDPI: function(size, dpi = this.options.dpi){
    return (dpi / 100) * size;
  },

  printMap: function (event, filename) {
    if (filename) {
      this.options.filename = filename
    }

    this.originalState = {
      mapWidth: this.mapContainer.style.width,
      widthWasAuto: false,
      heightWasAuto: false,
      widthWasPercentage: false,
      heightWasPercentage: false,
      mapHeight: this.mapContainer.style.height,
      zoom: this._map.getZoom(),
      center: this._map.getCenter(),
      bounds: this._map.getBounds(),
      completeStyle: this.mapContainer.style
    };
    if (this.originalState.mapWidth === 'auto' || !this.originalState.mapWidth) {
      this.originalState.mapWidth = this._map.getSize().x  + 'px'
      this.originalState.widthWasAuto = true
    } else if (this.originalState.mapWidth.includes('%')) {
      this.originalState.percentageWidth = this.originalState.mapWidth
      this.originalState.widthWasPercentage = true
      this.originalState.mapWidth = this._map.getSize().x  + 'px'
    }

    if (this.originalState.mapHeight === 'auto' || !this.originalState.mapHeight || this.originalState.mapHeight.includes('%')) {
      this.originalState.mapHeight = this._map.getSize().y  + 'px';
      this.originalState.heightWasAuto = true;
    } else if (this.originalState.mapHeight.includes('%')) {
      this.originalState.percentageHeight = this.originalState.mapHeight
      this.originalState.heightWasPercentage = true
      this.originalState.mapHeight = this._map.getSize().y  + 'px'
    }

    this._map.fire("easyPrint-start", { event: event });

    var sizeMode = typeof event !== 'string' ? event.target.className : event;

    this._addCss();

    this._createImagePlaceholder(sizeMode);
  },

  _createImagePlaceholder: function (sizeMode) {
    var plugin = this;
    domtoimage.toPng(this.mapContainer, {
      width: parseInt(this.originalState.mapWidth.replace('px')),
      height: parseInt(this.originalState.mapHeight.replace('px'))
    })
        .then(function (dataUrl) {
          plugin.blankDiv = document.createElement("div");
          var blankDiv = plugin.blankDiv;
          plugin.mapContainer.parentNode.insertBefore(blankDiv, plugin.mapContainer);
          blankDiv.className = 'epHolder';
          blankDiv.style.backgroundImage = 'url("' + dataUrl + '")';
          blankDiv.style.position = 'absolute';
          blankDiv.style.zIndex = 1011;
          blankDiv.style.display = 'initial';
          blankDiv.style.width = plugin.originalState.mapWidth;
          blankDiv.style.height = plugin.originalState.mapHeight;

          plugin.outerContainer = plugin._createOuterContainer(plugin.mapContainer);
          if (plugin.originalState.widthWasAuto) {
            plugin.outerContainer.style.width = plugin.originalState.mapWidth
          }
          if (plugin.originalState.heightWasAuto) {
            plugin.outerContainer.style.height = plugin.originalState.mapHeight
          }

          plugin._resizeAndPrintMap(sizeMode);
        })
        .catch(function (error) {
          console.error('oops, something went wrong!', error);
        });
  },

  _resizeAndPrintMap: function (sizeMode) {

    var plugin = this;
    this._map.eachLayer(function(layer) {
      layer.on("loading", function() {
        plugin.layersAreLoading++;
      });
      layer.on("load", function() {
        plugin.layersAreLoading--;
      });
    });

    if (!this.options.hidden) {
      this._togglePageSizeButtons({type: null});
    }
    if (this.options.hideControlContainers.length) {
      this._toggleControls();
    }
    if (this.options.hideClasses) {
      this._toggleClasses(this.options.hideClasses);
    }

    this.outerContainer.style.opacity = 0;
    var pageSize = this.produceSizeModeObject(sizeMode);

    this.outerContainer.style.width = pageSize.width + 'px';
    this.outerContainer.style.height = pageSize.height + 'px';

    this.gridContainer.style.width = this.outerContainer.style.width;
    this.gridContainer.style.height = this.outerContainer.style.height;

    this.mapContainer.style.width = 'auto';
    this.mapContainer.style.height = 'auto';



    this._map.invalidateSize();
    this._map.fitBounds(this.originalState.bounds);
    this._map.invalidateSize();

    if (this.layersAreLoading > 0) {
      this._pausePrint(sizeMode)
    } else {
      this._printOpertion(sizeMode);
    }
  },

  _pausePrint: function (sizeMode) {
    var plugin = this;
    var loadingTest = setInterval(function () {
      if(plugin.layersAreLoading === 0) {
        clearInterval(loadingTest);
        setTimeout(() => plugin._printOpertion(sizeMode), plugin.options.tileWait * 2);
      }
    }, plugin.options.tileWait);
  },

  _printOpertion: function (sizemode) {
    var plugin = this;
    domtoimage.toPng(plugin.gridContainer, {
      width: parseInt(plugin.gridContainer.style.width.replace('px')),
      height: parseInt(plugin.gridContainer.style.height.replace('px'))
    })
        .then(function (dataUrl) {
          var blob = plugin._dataURItoBlob(dataUrl);

          if (plugin.options.shouldExport) {
            fileSaver.saveAs(blob, plugin.options.filename + '.png');
          }
          if (plugin.options.saveIntern) {
            plugin.resultBlob = blob;
          }

          plugin._toggleControls(true);
          plugin._toggleClasses(plugin.options.hideClasses, true);

          if (plugin.outerContainer) {
            if (plugin.originalState.widthWasAuto) {
              plugin.mapContainer.style.width = 'auto'
            } else if (plugin.originalState.widthWasPercentage) {
              plugin.mapContainer.style.width = plugin.originalState.percentageWidth
            }
            else {
              plugin.mapContainer.style.width = plugin.originalState.mapWidth;
            }
            if (plugin.originalState.heightWasAuto) {
              plugin.mapContainer.style.height = 'auto'
            } else if (plugin.originalState.heightWasPercentage) {
              plugin.mapContainer.style.height = plugin.originalState.percentageHeight
            }
            else {
              plugin.mapContainer.style.height = plugin.originalState.mapHeight;
            }
            plugin._removeOuterContainer(plugin.mapContainer, plugin.outerContainer, plugin.blankDiv);
            plugin._map.invalidateSize();
            plugin._map.setView(plugin.originalState.center);
            plugin._map.setZoom(plugin.originalState.zoom);

          }
          plugin._removeCss();
          plugin._map.fire("easyPrint-finished");
        })
        .catch(function (error) {
          console.error('Print operation failed', error);
        });
  },

  _createOuterContainer: function (mapDiv) {
    var outerContainer = document.createElement('div');
    var gridContainer = document.createElement('div');
    gridContainer.className = 'gridContainer';

    outerContainer.appendChild(gridContainer);

    mapDiv.classList.add('map');
    mapDiv.parentNode.insertBefore(outerContainer, mapDiv);
    mapDiv.parentNode.removeChild(mapDiv);
    gridContainer.appendChild(mapDiv);

    if(this.options.referenceDOMHeader){
      var header = document.createElement('div');
      header.className = 'header';
      header.appendChild(this.options.referenceDOMHeader.cloneNode(true));
      gridContainer.appendChild(header);
    }
    if(this.options.referenceDOMLayers){
      var layers = document.createElement('div');
      layers.className = 'layers';
      gridContainer.appendChild(layers);
      layers.appendChild(this.options.referenceDOMLayers.cloneNode(true));
      mapDiv.style.gridColumnStart = '2';
    }
    if(this.options.referenceDOMFooter) {
      var footer = document.createElement('div');
      footer.className = 'footer';
      footer.appendChild(this.options.referenceDOMFooter.cloneNode(true));
      gridContainer.appendChild(footer);
    }

    gridContainer.style.width = mapDiv.style.width;
    gridContainer.style.height = mapDiv.style.height;

    this.gridContainer = gridContainer;

    return outerContainer;
  },

  _removeOuterContainer: function (mapDiv, outerContainer, blankDiv) {
    if (outerContainer.parentNode) {
      outerContainer.parentNode.insertBefore(mapDiv, outerContainer);
      outerContainer.parentNode.removeChild(blankDiv);
      outerContainer.parentNode.removeChild(outerContainer);
    }
    mapDiv.style.gridColumnStart = null;
  },

  _addCss: function () {
    var head = document.head || document.getElementsByTagName('head')[0];
    var style = document.createElement('style');
    style.type = 'text/css';
    head.appendChild(style);
    var css = `
    .leaflet-control-easyPrint-button { 
      background-image: url(data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTYuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgd2lkdGg9IjE2cHgiIGhlaWdodD0iMTZweCIgdmlld0JveD0iMCAwIDUxMiA1MTIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMiA1MTI7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4KPGc+Cgk8cGF0aCBkPSJNMTI4LDMyaDI1NnY2NEgxMjhWMzJ6IE00ODAsMTI4SDMyYy0xNy42LDAtMzIsMTQuNC0zMiwzMnYxNjBjMCwxNy42LDE0LjM5OCwzMiwzMiwzMmg5NnYxMjhoMjU2VjM1Mmg5NiAgIGMxNy42LDAsMzItMTQuNCwzMi0zMlYxNjBDNTEyLDE0Mi40LDQ5Ny42LDEyOCw0ODAsMTI4eiBNMzUyLDQ0OEgxNjBWMjg4aDE5MlY0NDh6IE00ODcuMTk5LDE3NmMwLDEyLjgxMy0xMC4zODcsMjMuMi0yMy4xOTcsMjMuMiAgIGMtMTIuODEyLDAtMjMuMjAxLTEwLjM4Ny0yMy4yMDEtMjMuMnMxMC4zODktMjMuMiwyMy4xOTktMjMuMkM0NzYuODE0LDE1Mi44LDQ4Ny4xOTksMTYzLjE4Nyw0ODcuMTk5LDE3NnoiIGZpbGw9IiMwMDAwMDAiLz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8L3N2Zz4K);
      background-size: 16px 16px; 
      cursor: pointer; 
      display: none;
    }
    .leaflet-control-easyPrint-button-export { 
      background-image: url(data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTYuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgd2lkdGg9IjE2cHgiIGhlaWdodD0iMTZweCIgdmlld0JveD0iMCAwIDQzMy41IDQzMy41IiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA0MzMuNSA0MzMuNTsiIHhtbDpzcGFjZT0icHJlc2VydmUiPgo8Zz4KCTxnIGlkPSJmaWxlLWRvd25sb2FkIj4KCQk8cGF0aCBkPSJNMzk1LjI1LDE1M2gtMTAyVjBoLTE1M3YxNTNoLTEwMmwxNzguNSwxNzguNUwzOTUuMjUsMTUzeiBNMzguMjUsMzgyLjV2NTFoMzU3di01MUgzOC4yNXoiIGZpbGw9IiMwMDAwMDAiLz4KCTwvZz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8L3N2Zz4K);
      background-size: 16px 16px; 
      cursor: pointer; 
    }
    .easyPrintHolder a {
      background-size: 16px 16px;
      cursor: pointer;
    }
    .easyPrintHolder .CurrentSize{
      background-image: url(data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCFET0NUWVBFIHN2ZyBQVUJMSUMgIi0vL1czQy8vRFREIFNWRyAxLjEvL0VOIiAiaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkIj4KPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iMTZweCIgdmVyc2lvbj0iMS4xIiBoZWlnaHQ9IjE2cHgiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZW5hYmxlLWJhY2tncm91bmQ9Im5ldyAwIDAgNjQgNjQiPgogIDxnPgogICAgPGcgZmlsbD0iIzFEMUQxQiI+CiAgICAgIDxwYXRoIGQ9Ik0yNS4yNTUsMzUuOTA1TDQuMDE2LDU3LjE0NVY0Ni41OWMwLTEuMTA4LTAuODk3LTIuMDA4LTIuMDA4LTIuMDA4QzAuODk4LDQ0LjU4MiwwLDQ1LjQ4MSwwLDQ2LjU5djE1LjQwMiAgICBjMCwwLjI2MSwwLjA1MywwLjUyMSwwLjE1NSwwLjc2N2MwLjIwMywwLjQ5MiwwLjU5NCwwLjg4MiwxLjA4NiwxLjA4N0MxLjQ4Niw2My45NDcsMS43NDcsNjQsMi4wMDgsNjRoMTUuNDAzICAgIGMxLjEwOSwwLDIuMDA4LTAuODk4LDIuMDA4LTIuMDA4cy0wLjg5OC0yLjAwOC0yLjAwOC0yLjAwOEg2Ljg1NWwyMS4yMzgtMjEuMjRjMC43ODQtMC43ODQsMC43ODQtMi4wNTUsMC0yLjgzOSAgICBTMjYuMDM5LDM1LjEyMSwyNS4yNTUsMzUuOTA1eiIgZmlsbD0iIzAwMDAwMCIvPgogICAgICA8cGF0aCBkPSJtNjMuODQ1LDEuMjQxYy0wLjIwMy0wLjQ5MS0wLjU5NC0wLjg4Mi0xLjA4Ni0xLjA4Ny0wLjI0NS0wLjEwMS0wLjUwNi0wLjE1NC0wLjc2Ny0wLjE1NGgtMTUuNDAzYy0xLjEwOSwwLTIuMDA4LDAuODk4LTIuMDA4LDIuMDA4czAuODk4LDIuMDA4IDIuMDA4LDIuMDA4aDEwLjU1NmwtMjEuMjM4LDIxLjI0Yy0wLjc4NCwwLjc4NC0wLjc4NCwyLjA1NSAwLDIuODM5IDAuMzkyLDAuMzkyIDAuOTA2LDAuNTg5IDEuNDIsMC41ODlzMS4wMjctMC4xOTcgMS40MTktMC41ODlsMjEuMjM4LTIxLjI0djEwLjU1NWMwLDEuMTA4IDAuODk3LDIuMDA4IDIuMDA4LDIuMDA4IDEuMTA5LDAgMi4wMDgtMC44OTkgMi4wMDgtMi4wMDh2LTE1LjQwMmMwLTAuMjYxLTAuMDUzLTAuNTIyLTAuMTU1LTAuNzY3eiIgZmlsbD0iIzAwMDAwMCIvPgogICAgPC9nPgogIDwvZz4KPC9zdmc+Cg==)
    }
    .easyPrintHolder .page {
      background-image: url(data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTguMS4xLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDQ0NC44MzMgNDQ0LjgzMyIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgNDQ0LjgzMyA0NDQuODMzOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSIgd2lkdGg9IjUxMnB4IiBoZWlnaHQ9IjUxMnB4Ij4KPGc+Cgk8Zz4KCQk8cGF0aCBkPSJNNTUuMjUsNDQ0LjgzM2gzMzQuMzMzYzkuMzUsMCwxNy03LjY1LDE3LTE3VjEzOS4xMTdjMC00LjgxNy0xLjk4My05LjM1LTUuMzgzLTEyLjQ2N0wyNjkuNzMzLDQuNTMzICAgIEMyNjYuNjE3LDEuNywyNjIuMzY3LDAsMjU4LjExNywwSDU1LjI1Yy05LjM1LDAtMTcsNy42NS0xNywxN3Y0MTAuODMzQzM4LjI1LDQzNy4xODMsNDUuOSw0NDQuODMzLDU1LjI1LDQ0NC44MzN6ICAgICBNMzcyLjU4MywxNDYuNDgzdjAuODVIMjU2LjQxN3YtMTA4LjhMMzcyLjU4MywxNDYuNDgzeiBNNzIuMjUsMzRoMTUwLjE2N3YxMzAuMzMzYzAsOS4zNSw3LjY1LDE3LDE3LDE3aDEzMy4xNjd2MjI5LjVINzIuMjVWMzR6ICAgICIgZmlsbD0iIzAwMDAwMCIvPgoJPC9nPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+Cjwvc3ZnPgo=);
    }
    .easyPrintHolder .A4Landscape, .easyPrintHolder .A3Landscape , .easyPrintHolder .A2Landscape{ 
      transform: rotate(-90deg);
    }
    .leaflet-control-easyPrint-button{
      display: inline-block;
    }
    .easyPrintHolder{
      margin-top:-31px;
      margin-bottom: -5px;
      margin-left: 30px;
      padding-left: 0px;
      display: none;
    }
    .easyPrintSizeMode {
      display: inline-block;
    }
    .easyPrintHolder .easyPrintSizeMode a {
      border-radius: 0px;
    }
    .easyPrintHolder .easyPrintSizeMode:last-child a{
      border-top-right-radius: 2px;
      border-bottom-right-radius: 2px;
      margin-left: -1px;
    }
    .easyPrintPortrait:hover, .easyPrintLandscape:hover{
      background-color: #757570;
      cursor: pointer;
    }
    
    * {box-sizing: border-box;}
    
    .gridContainer {
      margin: 0 auto;
      display: inline-block;
      overflow: hidden;
      background-color: white;
    }
    .gridContainer > div {
      padding: 0;
      margin: 0;
      color: black;
     }
    .gridContainer {
      display: grid;
      grid-auto-columns: min-content auto;
      grid-auto-rows: min-content auto min-content;
     }
     .header {
      grid-column-start: 1;
      grid-column-end: 4;
      grid-row-start: 1;
      grid-row-end: 1;
     }
     .layers {
      grid-column-start: 1;
      grid-column-end: 2;
      grid-row-start: 2;
      grid-row-end: 2;
     }
     .map {
      grid-column-start: 1;
      grid-column-end: 4;
      grid-row-start: 2;
      grid-row-end: 2;
    }
    .footer {
      grid-column-start: 1;
      grid-column-end: 4;
      grid-row-start: 3;
      grid-row-end: 4;
    }`;

    if (style.styleSheet){
      // This is required for IE8 and below.
      style.styleSheet.cssText = css;
    } else {
      style.appendChild(document.createTextNode(css));
    }

    this.styleNode = style;
  },

  _removeCss: function () {
    var head = document.head || document.getElementsByTagName('head')[0];
    head.removeChild(this.styleNode);
  },

  _dataURItoBlob: function (dataURI) {
    var byteString = atob(dataURI.split(',')[1]);
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    var ab = new ArrayBuffer(byteString.length);
    var dw = new DataView(ab);
    for(var i = 0; i < byteString.length; i++) {
      dw.setUint8(i, byteString.charCodeAt(i));
    }
    return new Blob([ab], {type: mimeString});
  },

  _togglePageSizeButtons: function (e) {
    var holderStyle = this.holder.style
    var linkStyle = this.link.style
    if (e.type === 'mouseover') {
      holderStyle.display = 'block';
      linkStyle.borderTopRightRadius = '0'
      linkStyle.borderBottomRightRadius = '0'
    } else {
      holderStyle.display = 'none';
      linkStyle.borderTopRightRadius = '2px'
      linkStyle.borderBottomRightRadius = '2px'
    }
  },

  _toggleControls: function (show) {
    var controlContainers = [];

    // get all containers to hide from options
    this.options.hideControlContainers.forEach(containerToHide => {
      controlContainers.push(document.getElementsByClassName(containerToHide)[0]);
    });

    // show or hide all selected containers
    controlContainers.forEach(container => {
      container.style.display = show ? 'block' : 'none';
    });
  },
  _toggleClasses: function (classes, show) {
    classes.forEach(function (className) {
      var div = document.getElementsByClassName(className)[0];
      if (show) return div.style.display = 'block';
      div.style.display = 'none';
    });
  },

  // A4 210mm x 297mm
  _a4PageSize: {
    height: 297,
    width: 210
  },

  // A3	297mm x 420mm
  _a3PageSize: {
    height: 420,
    width: 297
  },

  // A2	420mm x 594mm
  _a2PageSize: {
    height: 594,
    width: 420
  }
});

L.easyPrint = function(options) {
  return new L.Control.EasyPrint(options);
};
