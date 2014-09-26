

L.Control.EasyPrint = L.Control.extend({
    options: {
        position: 'topleft',
        title: 'Print map',
    },

    onAdd: function () {
        var container = L.DomUtil.create('div', 'leaflet-control-easyPrint leaflet-bar leaflet-control');

        this.link = L.DomUtil.create('a', 'leaflet-control-easyPrint-button leaflet-bar-part', container);
        this.link.href = 'javascript:void(0)($("#map").print({stylesheet:"easyPrint.css"}))';

        return container;
    },
    
  
    _click: function (e) {
        L.DomEvent.stopPropagation(e);
        L.DomEvent.preventDefault(e);
    },
});

L.easyPrint = function() {
  return new L.Control.EasyPrint();
};

