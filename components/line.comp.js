;(function () {
	JS.namespace("component");

	var Logger = JS.include("logger.Logger");
    var BaseComponent = JS.include("component.BaseComponent");

	component.Line = function () {
		var self = this;
		
		self.image = "/images/line.png";
		self.createObject = function (drawZone) {
			return new component.LineElement(drawZone);
		};
	};
	
	component.LineElement = function (drawZone) {
		var self = this;
		var _element;
		
		// Parent constructor class //
		BaseComponent.call(self, drawZone);
		
		self.type("Line");
		
		self.redraw = self.preview = self.draw = function () {
			repaint();
		};
		
		/**
		 * Return a reference to the element that was draw
		 */
		self.element = function () {
			return _element;
		};
		
		// Repaint the element in the draw zone  //
		function repaint() {
			if (_element) {
				_element.remove();
			}
			
			_element = drawZone.path(
				"M" + self.startPoint().x + " " + self.startPoint().y + 
				"L" + self.endPoint().x +   " " + self.endPoint().y);
			_element.attr({ "stroke-width" : "4px", "stroke" : "#000000" });
            _element.node.style.pointerEvents = "visible";
            
            self.trigger("elementChanged");
		}
	};
})();