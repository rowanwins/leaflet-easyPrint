L.Control.EasyPrint = L.Control.extend({
	options: {
		title: 'Print map',
		position: 'topleft'
	},

	onAdd: function () {
		var container = L.DomUtil.create('div', 'leaflet-control-easyPrint leaflet-bar leaflet-control');

		this.link = L.DomUtil.create('a', 'leaflet-control-easyPrint-button leaflet-bar-part', container);
		this.link.id = "leafletEasyPrint";
		this.link.title = this.options.title;

		L.DomEvent.addListener(this.link, 'click', printPage, this);
		L.DomEvent.disableClickPropagation(container);

		return container;
	}

});

L.easyPrint = function(options) {
	return new L.Control.EasyPrint(options);
};

function printPage(){

	if (this.options.elementsToHide){
		var htmlElementsToHide = document.querySelectorAll(this.options.elementsToHide);  

		for (var i = 0; i < htmlElementsToHide.length; i++) {
			htmlElementsToHide[i].className = htmlElementsToHide[i].className + ' _epHidden';
		}
	}
	this._map.fire("beforePrint");
	window.print();
	this._map.fire("afterPrint");
	if (this.options.elementsToHide){
		var htmlElementsToHide = document.querySelectorAll(this.options.elementsToHide);  

		for (var i = 0; i < htmlElementsToHide.length; i++) {
			htmlElementsToHide[i].className = htmlElementsToHide[i].className.replace(' _epHidden','');
		}
	}


}