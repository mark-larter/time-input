/*!
 * TimeInput jquery.ui plugin 
 *  - Time entry with validation, and optional popup timepicker UI. 
 *  - Popup timepicker UI provided by jquery.ui.timepicker.js plugin.
 *  - User input validated by sugarjs. 
 *
 * Author:      @marklarter - Mark Larter
 *
 * Copyright:   Copyright 2012-, Freeheel Group LLC, http://freeheelgroup.com.
 *
 * License:     MIT, GPL2
 * 
 * Depends:     jquery.core.js     
 *              jquery.ui.core.js,
 *              jquery.ui.timepicker.js - http://fgelinas.com/code/timepicker/
 *              sugar.js - http://sugarjs.com
 *
 * Notes:       Follows pattern guidance from "Essential jQuery Plugin Patterns" by Addy Osmani (et al),
 *              especially "Namespacing and Nested Namespacing" and "jQuery UI Widget Factory Bridge", at
 *              http://coding.smashingmagazine.com/2011/10/11/essential-jquery-plugin-patterns/
 */
 
// The semicolon before this function invocation protects against concatenated 
// scripts or other plugins that are not closed properly.
;(function($, window, document, undefined) {
    // Set up freeheelGroup namespace.
    if (!$.freeheelGroup) {
        $.freeheelGroup = {};
    };
    
    $.timeInput.timeInput pluginName = "timeInput",
        defaults = $.extend({
            "isRequired": false,
            "hasPicker": false,
            "hasButtons": false
        };
    
    // The plugin constructor.
    var timeInput = function(options, element) {
        this.options = $.extend({}, defaults, options || {});
        this.element = element;
        
        this._defaults = defaults;
        this._name = pluginName;
		
		this._time = null;
		this._timeMessage = "";
			
        this.init();
    }
    
    TimeInput.prototype = {
        _create: function() {
        },
        
		_init: function() {
			if (this.options.hasPicker) {
				var hasButtons = this.options.hasButtons;
				$('#timeInput').timepicker({
					showCloseButton: hasButtons,
					showNowButton: hasButtons,
					showDeselectButton: hasButtons && !this.options.isRequired,
					onClose: function (time, inst) {
						_setTime(time);
					}
				});
			}
			else {
				$('#timeInput').on('blur',
					function(event) {
						_setTime($('#timeInput').val());
					}
				);
			}
		},
		
		_getIsValid: function () {
			var isValid = false;
			if (this.options.isRequired && (_time === null)) { _timeMessage = "Time is required"; }
			else if (isNaN(_time)) { _timeMessage = "Invalid time"; }
			else {
				isValid = true;
				_timeMessage = (_time === null) ? "Null time" : _time.format("{Weekday} {Month} {ord}, {year} {HH}:{mm}:{ss}.{fff}");
			}
			
			$('#timeValue').text(_timeMessage);

			return isValid;
		},
		
        _setTime: function(timeToSet) {
			if (timeToSet === "") {
				_time = null;
				if (this.options.hasPicker) $('#timeInput').timepicker('setTime', timeToSet);
			}
			else {
				_time = Date.create(timeToSet);
				if (_time.isValid()) {
					if (this.options.hasPicker) { $('#timeInput').timepicker('setTime', _time.format("{HH}:{mm}")); }
					else { $('#timeInput').val(_time.format("{HH}:{mm}")); }
				}
			}

			_getIsValid();
        }
    
		option: function(key, value) {
		},
    };
})(jQuery);