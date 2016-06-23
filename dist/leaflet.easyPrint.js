L.Control.EasyPrint = L.Control.extend({
	options: {
		title: 'Print map',
		position: 'topleft',
		bodyPrintClass: 'leaflet-print'
	},

	onAdd: function () {
		var container = L.DomUtil.create('div', 'leaflet-control-easyPrint leaflet-bar leaflet-control');

		this.link = L.DomUtil.create('a', 'leaflet-control-easyPrint-button leaflet-bar-part', container);
		this.link.id = "leafletEasyPrint";
		this.link.title = this.options.title;

		L.DomEvent.addListener(this.link, 'click', printPage, this.options);

		return container;
	}

});

L.easyPrint = function(options) {
	return new L.Control.EasyPrint(options);
};

function printPage(){

	var bodyElement = document.querySelector("body");
	bodyElement.className = bodyElement.className + ' ' + this.bodyPrintClass;

	if (this.elementsToHide){
		var htmlElementsToHide = document.querySelectorAll(this.elementsToHide);  

		for (var i = 0; i < htmlElementsToHide.length; i++) {
			htmlElementsToHide[i].className = htmlElementsToHide[i].className + ' _epHidden';
		}
	}
	window.print();

	bodyElement.className = bodyElement.className.replace(' ' + this.bodyPrintClass,'');

	if (this.elementsToHide){
		var htmlElementsToHide = document.querySelectorAll(this.elementsToHide);  

		for (var i = 0; i < htmlElementsToHide.length; i++) {
			htmlElementsToHide[i].className = htmlElementsToHide[i].className.replace(' _epHidden','');
		}
	}
	
}