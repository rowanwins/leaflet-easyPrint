var domtoimage = require('dom-to-image');
var FileSaver = require('file-saver');

L.Control.EasyPrint = L.Control.extend({
  options: {
    title: 'Print map',
    position: 'topleft',
    sizeModes: 'native',
    filename: 'mymap'
  },

  onAdd: function () {
    this.addCss()

    var container = L.DomUtil.create('div', 'leaflet-control-easyPrint leaflet-bar leaflet-control');

    L.DomEvent.addListener(container, 'mouseover', this.displayPageSizeButtons, this);
    L.DomEvent.addListener(container, 'mouseout', this.hidePageSizeButtons, this);

    this.link = L.DomUtil.create('a', 'leaflet-control-easyPrint-button', container);
    this.link.id = "leafletEasyPrint";
    this.link.title = this.options.title;

    this.holder = L.DomUtil.create('ul', 'easyPrintHolder', container );

    this.options.sizeModes.forEach(function (sizeMode){
      var btn = L.DomUtil.create('li', 'easyPrintSizeMode', this.holder);
      btn.title = sizeMode
      var link = L.DomUtil.create('a', 'easyPrint' + sizeMode, btn);
      L.DomEvent.addListener(btn, 'click', this.printPage, this);      
    }, this);

    L.DomEvent.disableClickPropagation(container);

    return container;
  },

  createOuterContainer: function (mapDiv) {
    var wrapper = document.createElement('div'); 
    mapDiv.parentNode.insertBefore(wrapper, mapDiv); 
    mapDiv.parentNode.removeChild(mapDiv);
    wrapper.appendChild(mapDiv);
    wrapper.style.width = mapDiv.style.width;
    wrapper.style.height = mapDiv.style.height;
    wrapper.style.display = 'inline-block'
    wrapper.style.overflow = 'hidden';
    return wrapper;
  },

  removeOuterContainer: function (mapDiv, outerContainer, blankDiv) {
    outerContainer.parentNode.insertBefore(mapDiv, outerContainer);
    outerContainer.parentNode.removeChild(blankDiv);
    outerContainer.parentNode.removeChild(outerContainer);
  },

  printPage: function (event) {
    this._map.fire("beforePrint");
    this.hidePageSizeButtons()
    this.mapContainer = this._map.getContainer();
    if (event.target.className === 'easyPrintCurrentSize'){
      this.printOpertion();
      return;
    }    
    this.outerContainer = this.createOuterContainer(this.mapContainer)

    this.createImagePlaceholder(event.target.className)
  },

  createImagePlaceholder: function (printSize) {
    var plugin = this;
    domtoimage.toPng(this.mapContainer) 
      .then(function (dataUrl) {
        plugin.blankDiv = document.createElement("div");
        var blankDiv = plugin.blankDiv
        plugin.outerContainer.parentElement.insertBefore(blankDiv, plugin.outerContainer)
        blankDiv.className = 'epHolder'
        blankDiv.style.backgroundImage = 'url("' + dataUrl + '")';
        blankDiv.style.position = 'absolute';
        blankDiv.style.zIndex = 1011;
        blankDiv.style.display = 'initial'
        blankDiv.style.width = plugin.mapContainer.style.width;
        blankDiv.style.height = plugin.mapContainer.style.height;
        plugin.resizeAndPrintMap(printSize);
      })
      .catch(function (error) {
          console.error('oops, something went wrong!', error);
      });
  },

  resizeAndPrintMap: function (printSize) {
    var pageSize = {
      height: '715px',
      width: '1045px'
    }
    var map = this.mapContainer;
    this.originalMapWidth = map.style.width;
    this.originalMapHeight = map.style.height;
    this.origCenter = this._map.getCenter();
    this.origZoom = this._map.getZoom(); 
    this.outerContainer.style.opacity = 0;
    if (printSize === 'easyPrintA4Landscape'){
      map.style.width = pageSize.width;
      map.style.height = pageSize.height;      
    }
    if (printSize === 'easyPrintA4Portrait') {
      map.style.width = pageSize.height;
      map.style.height = pageSize.width;          
    }
    this._map.setView(this.origCenter);
    this._map.setZoom(this.origZoom);
    this._map.invalidateSize();
    var plugin = this;
    var loadingTest = setInterval(function () { 
      if(!plugin.options.tileLayer.isLoading()) {
        clearInterval(loadingTest);
        plugin.printOpertion()
      }
    }, 500);
  },

  printOpertion: function () {
    var plugin = this;
    domtoimage.toPng(plugin.mapContainer, {
        width: parseInt(plugin.mapContainer.style.width.replace('px')),
        height: parseInt(plugin.mapContainer.style.height.replace('px'))
      })
      .then(function (dataUrl) {
          var blob = plugin.dataURItoBlob(dataUrl);
          window.FileSaver.saveAs(blob, plugin.options.filename + '.png');
          plugin._map.fire("afterPrint");
          plugin.mapContainer.style.width = plugin.originalMapWidth;
          plugin.mapContainer.style.height = plugin.originalMapHeight;
          if (plugin.outerContainer) {
            plugin.removeOuterContainer(plugin.mapContainer, plugin.outerContainer, plugin.blankDiv)
            plugin._map.invalidateSize();
            plugin._map.setView(plugin.origCenter);
            plugin._map.setZoom(plugin.origZoom);
          }
      })
      .catch(function (error) {
          console.error('Print operation failed', error);
      }); 
  },

  addCss: function () {
    var css = document.createElement("style");
    css.type = "text/css";
    css.innerHTML = `.leaflet-control-easyPrint a { 
      background-image: url(data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTYuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgd2lkdGg9IjE2cHgiIGhlaWdodD0iMTZweCIgdmlld0JveD0iMCAwIDUxMiA1MTIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMiA1MTI7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4KPGc+Cgk8cGF0aCBkPSJNMTI4LDMyaDI1NnY2NEgxMjhWMzJ6IE00ODAsMTI4SDMyYy0xNy42LDAtMzIsMTQuNC0zMiwzMnYxNjBjMCwxNy42LDE0LjM5OCwzMiwzMiwzMmg5NnYxMjhoMjU2VjM1Mmg5NiAgIGMxNy42LDAsMzItMTQuNCwzMi0zMlYxNjBDNTEyLDE0Mi40LDQ5Ny42LDEyOCw0ODAsMTI4eiBNMzUyLDQ0OEgxNjBWMjg4aDE5MlY0NDh6IE00ODcuMTk5LDE3NmMwLDEyLjgxMy0xMC4zODcsMjMuMi0yMy4xOTcsMjMuMiAgIGMtMTIuODEyLDAtMjMuMjAxLTEwLjM4Ny0yMy4yMDEtMjMuMnMxMC4zODktMjMuMiwyMy4xOTktMjMuMkM0NzYuODE0LDE1Mi44LDQ4Ny4xOTksMTYzLjE4Nyw0ODcuMTk5LDE3NnoiIGZpbGw9IiMwMDAwMDAiLz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8L3N2Zz4K);
      background-size: 16px 16px; 
      cursor: pointer; 
    }
    .easyPrintHolder .easyPrintA4Landscape { 
      background-image: url(data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTcuMS4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDQ0MiA0NDIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDQ0MiA0NDI7IiB4bWw6c3BhY2U9InByZXNlcnZlIiB3aWR0aD0iMTZweCIgaGVpZ2h0PSIxNnB4Ij4KPHBhdGggZD0iTTM3Ni45NzcsMTA0LjIwOWMtMC4wMjQtMC4yNDUtMC4wNjYtMC40ODQtMC4xMDgtMC43MjRjLTAuMDE0LTAuMDgyLTAuMDIxLTAuMTY1LTAuMDM4LTAuMjQ2ICBjLTAuMDU4LTAuMjktMC4xMzItMC41NzQtMC4yMTUtMC44NTRjLTAuMDA5LTAuMDMtMC4wMTQtMC4wNjEtMC4wMjMtMC4wOTFjLTAuMDg3LTAuMjg1LTAuMTg5LTAuNTYzLTAuMy0wLjgzOCAgYy0wLjAxMS0wLjAyNi0wLjAxOS0wLjA1NS0wLjAzLTAuMDgxYy0wLjEwOC0wLjI2LTAuMjMxLTAuNTEzLTAuMzYtMC43NjFjLTAuMDIxLTAuMDQxLTAuMDM4LTAuMDgzLTAuMDYtMC4xMjUgIGMtMC4xMjEtMC4yMjUtMC4yNTUtMC40NDEtMC4zOTItMC42NTVjLTAuMDM5LTAuMDYyLTAuMDczLTAuMTI2LTAuMTE0LTAuMTg3Yy0wLjEzMi0wLjE5Ny0wLjI3Ny0wLjM4My0wLjQyMi0wLjU3ICBjLTAuMDU2LTAuMDcxLTAuMTA1LTAuMTQ3LTAuMTYzLTAuMjE3Yy0wLjE4MS0wLjIyLTAuMzc0LTAuNDI5LTAuNTczLTAuNjMzYy0wLjAyOS0wLjAyOS0wLjA1My0wLjA2Mi0wLjA4Mi0wLjA5MUwyNzguODkyLDIuOTI5ICBjLTAuMDI2LTAuMDI2LTAuMDU1LTAuMDQ4LTAuMDgyLTAuMDc0Yy0wLjIwNi0wLjIwMi0wLjQxOS0wLjM5OC0wLjY0Mi0wLjU4MmMtMC4wNy0wLjA1OC0wLjE0Ni0wLjEwNy0wLjIxOC0wLjE2MyAgYy0wLjE4Ni0wLjE0NS0wLjM3My0wLjI5LTAuNTY5LTAuNDIxYy0wLjA2My0wLjA0Mi0wLjEyOS0wLjA3Ny0wLjE5My0wLjExN2MtMC4yMTItMC4xMzYtMC40MjYtMC4yNjktMC42NDktMC4zODggIGMtMC4wNDQtMC4wMjQtMC4wOTEtMC4wNDItMC4xMzUtMC4wNjVjLTAuMjQ1LTAuMTI3LTAuNDk0LTAuMjQ4LTAuNzUtMC4zNTRjLTAuMDMxLTAuMDEzLTAuMDYzLTAuMDIyLTAuMDk0LTAuMDM0ICBjLTAuMjctMC4xMDktMC41NDQtMC4yMS0wLjgyNS0wLjI5NmMtMC4wMzQtMC4wMS0wLjA2OC0wLjAxNi0wLjEwMi0wLjAyNmMtMC4yNzctMC4wODEtMC41NTctMC4xNTUtMC44NDMtMC4yMTIgIGMtMC4wODQtMC4wMTctMC4xNy0wLjAyNC0wLjI1NC0wLjAzOWMtMC4yMzctMC4wNDEtMC40NzQtMC4wODMtMC43MTYtMC4xMDdDMjcyLjQ4OCwwLjAxNywyNzIuMTU1LDAsMjcxLjgyLDBINzQuOTczICBjLTUuNTIzLDAtMTAsNC40NzctMTAsMTB2NDIyYzAsNS41MjMsNC40NzcsMTAsMTAsMTBoMjkyLjA1NWM1LjUyMiwwLDEwLTQuNDc3LDEwLTEwVjEwNS4yMDcgIEMzNzcuMDI3LDEwNC44NzMsMzc3LjAxLDEwNC41NCwzNzYuOTc3LDEwNC4yMDl6IE0yODEuODIsMzQuMTQzbDYxLjA2NSw2MS4wNjRIMjgxLjgyVjM0LjE0M3ogTTg0Ljk3Myw0MjJWMjBIMjYxLjgydjg1LjIwNyAgYzAsNS41MjMsNC40NzgsMTAsMTAsMTBoODUuMjA3VjQyMkg4NC45NzN6IiBmaWxsPSIjMDAwMDAwIi8+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+Cjwvc3ZnPgo);
      background-size: 16px 16px;
      cursor: pointer;
      transform: rotate(-90deg);
    }
    .easyPrintHolder .easyPrintA4Portrait { 
      background-image: url(data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTcuMS4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDQ0MiA0NDIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDQ0MiA0NDI7IiB4bWw6c3BhY2U9InByZXNlcnZlIiB3aWR0aD0iMTZweCIgaGVpZ2h0PSIxNnB4Ij4KPHBhdGggZD0iTTM3Ni45NzcsMTA0LjIwOWMtMC4wMjQtMC4yNDUtMC4wNjYtMC40ODQtMC4xMDgtMC43MjRjLTAuMDE0LTAuMDgyLTAuMDIxLTAuMTY1LTAuMDM4LTAuMjQ2ICBjLTAuMDU4LTAuMjktMC4xMzItMC41NzQtMC4yMTUtMC44NTRjLTAuMDA5LTAuMDMtMC4wMTQtMC4wNjEtMC4wMjMtMC4wOTFjLTAuMDg3LTAuMjg1LTAuMTg5LTAuNTYzLTAuMy0wLjgzOCAgYy0wLjAxMS0wLjAyNi0wLjAxOS0wLjA1NS0wLjAzLTAuMDgxYy0wLjEwOC0wLjI2LTAuMjMxLTAuNTEzLTAuMzYtMC43NjFjLTAuMDIxLTAuMDQxLTAuMDM4LTAuMDgzLTAuMDYtMC4xMjUgIGMtMC4xMjEtMC4yMjUtMC4yNTUtMC40NDEtMC4zOTItMC42NTVjLTAuMDM5LTAuMDYyLTAuMDczLTAuMTI2LTAuMTE0LTAuMTg3Yy0wLjEzMi0wLjE5Ny0wLjI3Ny0wLjM4My0wLjQyMi0wLjU3ICBjLTAuMDU2LTAuMDcxLTAuMTA1LTAuMTQ3LTAuMTYzLTAuMjE3Yy0wLjE4MS0wLjIyLTAuMzc0LTAuNDI5LTAuNTczLTAuNjMzYy0wLjAyOS0wLjAyOS0wLjA1My0wLjA2Mi0wLjA4Mi0wLjA5MUwyNzguODkyLDIuOTI5ICBjLTAuMDI2LTAuMDI2LTAuMDU1LTAuMDQ4LTAuMDgyLTAuMDc0Yy0wLjIwNi0wLjIwMi0wLjQxOS0wLjM5OC0wLjY0Mi0wLjU4MmMtMC4wNy0wLjA1OC0wLjE0Ni0wLjEwNy0wLjIxOC0wLjE2MyAgYy0wLjE4Ni0wLjE0NS0wLjM3My0wLjI5LTAuNTY5LTAuNDIxYy0wLjA2My0wLjA0Mi0wLjEyOS0wLjA3Ny0wLjE5My0wLjExN2MtMC4yMTItMC4xMzYtMC40MjYtMC4yNjktMC42NDktMC4zODggIGMtMC4wNDQtMC4wMjQtMC4wOTEtMC4wNDItMC4xMzUtMC4wNjVjLTAuMjQ1LTAuMTI3LTAuNDk0LTAuMjQ4LTAuNzUtMC4zNTRjLTAuMDMxLTAuMDEzLTAuMDYzLTAuMDIyLTAuMDk0LTAuMDM0ICBjLTAuMjctMC4xMDktMC41NDQtMC4yMS0wLjgyNS0wLjI5NmMtMC4wMzQtMC4wMS0wLjA2OC0wLjAxNi0wLjEwMi0wLjAyNmMtMC4yNzctMC4wODEtMC41NTctMC4xNTUtMC44NDMtMC4yMTIgIGMtMC4wODQtMC4wMTctMC4xNy0wLjAyNC0wLjI1NC0wLjAzOWMtMC4yMzctMC4wNDEtMC40NzQtMC4wODMtMC43MTYtMC4xMDdDMjcyLjQ4OCwwLjAxNywyNzIuMTU1LDAsMjcxLjgyLDBINzQuOTczICBjLTUuNTIzLDAtMTAsNC40NzctMTAsMTB2NDIyYzAsNS41MjMsNC40NzcsMTAsMTAsMTBoMjkyLjA1NWM1LjUyMiwwLDEwLTQuNDc3LDEwLTEwVjEwNS4yMDcgIEMzNzcuMDI3LDEwNC44NzMsMzc3LjAxLDEwNC41NCwzNzYuOTc3LDEwNC4yMDl6IE0yODEuODIsMzQuMTQzbDYxLjA2NSw2MS4wNjRIMjgxLjgyVjM0LjE0M3ogTTg0Ljk3Myw0MjJWMjBIMjYxLjgydjg1LjIwNyAgYzAsNS41MjMsNC40NzgsMTAsMTAsMTBoODUuMjA3VjQyMkg4NC45NzN6IiBmaWxsPSIjMDAwMDAwIi8+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+Cjwvc3ZnPgo);
      background-size: 16px 16px;
      cursor: pointer;
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
    }

    .easyPrintPortrait:hover, .easyPrintLandscape:hover{
      background-color: #757570;
      cursor: pointer;
    }`;
    document.body.appendChild(css);
  },

  dataURItoBlob: function (dataURI) {
    var byteString = atob(dataURI.split(',')[1]);
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    var ab = new ArrayBuffer(byteString.length);
    var dw = new DataView(ab);
    for(var i = 0; i < byteString.length; i++) {
        dw.setUint8(i, byteString.charCodeAt(i));
    }
    return new Blob([ab], {type: mimeString});
  },

  displayPageSizeButtons: function () {
    this.holder.style.display = 'block';
    this.link.style.borderTopRightRadius = '0'
    this.link.style.borderBottomRightRadius = '0'
  },

  hidePageSizeButtons: function () {
    this.holder.style.display = 'none';
    this.link.style.borderTopRightRadius = '2px'
    this.link.style.borderBottomRightRadius = '2px'
  }

});

L.easyPrint = function(options) {
  return new L.Control.EasyPrint(options);
};
