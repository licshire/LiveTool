;(function () {
	JS.namespace("component");
	
	var Logger = JS.include("logger.Logger");
	
	component.Component = function () {
		var self = this;
		
		var _startPoint = { x : 0, y : 0 };
		var _endPoint = { x : 0, y : 0 };
		var _GUID;
		var _connection;
		var _type;
        var _eventHandler = {};
		
		function generateGUID() {
			_GUID = parseInt(Math.random() * 0xEFFF + 0x1000, 10) + "-" +
					parseInt(Math.random() * 0xEFFF + 0x1000, 10) + "-" +
					parseInt(Math.random() * 0xEFFF + 0x1000, 10) + "-" +
					parseInt(Math.random() * 0xEFFF + 0x1000, 10) + "-" + 
					parseInt(Math.random() * 0xEFFF + 0x1000, 10) + "-"
		}
		
		generateGUID();

        // Base implementation of the serializable of a component //
		self.serialize = function () {
			var tempObject = $.extend(true, {}, self, {
				"type" : self.type(),
				"startPoint" : self.startPoint(),
				"endPoint" : self.endPoint(),
				"GUID" : self.GUID()
			});
			
			return JSON.stringify(tempObject);
		};

        // Base implementation of the deserializable of a component //
		self.unserialize = function (drawZone, str) {
			var obj = JSON.parse(str);
			var comp = (new component[obj.type]()).createObject(drawZone);
			
			comp.type(obj.type);
			comp.startPoint(obj.startPoint);
			comp.endPoint(obj.endPoint);
			comp.GUID(obj.GUID);
			
			return comp;
		};

        // Base implementation of the update of a component //
        self.update = function (newComponent) {
            self.type(newComponent.type());
            self.startPoint(newComponent.startPoint());
			self.endPoint(newComponent.endPoint());
			self.GUID(newComponent.GUID());
            
            self.redraw();
        };

        // Base implementation of the destroy //
        self.destroy = function () {
            // Check if the element exist in first place
            if (self.element()) {
                var element =  self.element().node;

                element.parentNode.removeChild(element);
            }
        };
		
		self.GUID = function (GUID) {
			if (!GUID) return _GUID;
			_GUID = GUID;
		};
		
		self.type = function (type) {
			if (!type) return _type;
			_type = type;
		};

        /* Event handling for the components */

        // Trigger an event //
        self.trigger = function (eventName, args) {
            args = [].slice.call(arguments, 1, arguments.length);

            // Check if there are any listener for that event first //
            if (_eventHandler[eventName] && _eventHandler[eventName].length > 0) {

                // Call all the listener //
                for (var i=0, len = _eventHandler[eventName].length; i<len; i++) {
                    try {
                        _eventHandler[eventName][i].apply(null, args);
                    } catch (e) {
                        // Make sure an error won't break everything, but log the error at least //
                        Logger.error(e);
                    }
                }
            }
        };

        // Add a listener  //
        // You can specify multiple event name by using the following synthax : //
        // obj.bind("click, mousedown, mouseup", function () {}); //
        self.bind = function (eventName, callback) {
            if (typeof callback !== "function") {
                throw new TypeError("Callback must be a function");
            }

            var names = eventName.split(", ");

            for (var i=0, len=names.length; i<len; i++) {
                eventName = names[i];

                if (!_eventHandler[eventName]) {
                    _eventHandler[eventName] = [];
                }

                _eventHandler[eventName].push(callback);
            }
        }

        // Remove a listener //
        self.unbind = function (eventName, callback) {
            
            // Checks if there is are event handler for that event //
            if (_eventHandler[eventName]) {
                for (var i=0, len = _eventHandler[eventName].length; i< len; i++) {

                    // When we find the event handler we remove it //
                    if (_eventHandler[eventName][i] === callback) {
                        _eventHandler[eventName].splice(i, 1);
                    }
                }
            }
        };
		
		// Allow generic event binding //
		var _supportedEvent = ["click", "mouseup", "mousedown", "mousemove", "dblclick"];

        function addEventSupport(event) {
            self[event] = function (fnct) {
                self.bind(event, fnct);
            };
        }

        function bindSupportedEvent(element) {
            for (var i=0; i<_supportedEvent.length; i++) {
                (function (event) {
                    element[event](function () {
                        var args = [].splice.call(arguments, 0); // Convert "arguments" fake-array to real-array

                        self.trigger.apply(null, [event].concat(args));
                    });
                }(_supportedEvent[i]));
            }
        }

		for (var i=0; i<_supportedEvent.length; i++) {
			addEventSupport(_supportedEvent[i]);
		}
		
		// Define/Read the start point of the element  //
		self.startPoint = function (startPoint) {
			if (!startPoint) return _startPoint;
			_startPoint = startPoint;
		};
		
		// Define/Read the end point of the element //
		self.endPoint = function (endPoint) {
			if (!endPoint) return _endPoint;
			_endPoint = endPoint;
		};
		
		// Define the connection object that we use to notify update //
		self.connection = function (connection) {
			if (!connection) return _connection;
			_connection = connection;
		};

        self.bind("elementChanged", function () {
            // Rebind the events //
            bindSupportedEvent(self.element());
        });
	};
})();