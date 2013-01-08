/*!
 * TimeInput jquery.ui plugin 
 *  - Time entry with validation, and optional popup timepicker UI. 
 *  - Popup timepicker UI provided by Francois Gelinas jquery.ui.timepicker.js plugin.
 *  - User input validated by sugarjs. 
 *
 * Author:      @marklarter - Mark Larter
 *
 * Copyright:   Copyright 2012-2013, Freeheel Group LLC, http://freeheelgroup.com.
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
	var pluginName = "timeInput",
        defaults = {
            "isRequired": false,
            "hasPicker": false,
            "hasButtons": false
        },
		timeRegex = /^((([0]?[1-9]|1[0-2])(:|\.)[0-5][0-9]((:|\.)[0-5][0-9])?( )?(AM|am|aM|Am|PM|pm|pM|Pm))|(([0]?[0-9]|1[0-9]|2[0-3])(:|\.)[0-5][0-9]((:|\.)[0-5][0-9])?))$/;
    
    // The plugin constructor.
    var timeInput = function(element, options) {
        this.options = $.extend({}, defaults, options || {});
        this.element = element;
        
        this._defaults = defaults;
        this._name = pluginName;
		
		this._timeRegex = timeRegex;
    
		this._timeValue = {
			isValid: false,
			message: null,
			timeDate: null
		};
			
        this._init();
    }
    
    timeInput.prototype = {
        _create: function() {
        },
        
		_init: function() {
			if (this.options.hasPicker) {
				var hasButtons = this.options.hasButtons;
				$(this.element).timepicker({
					showCloseButton: hasButtons,
					showNowButton: hasButtons,
					showDeselectButton: hasButtons && !this.options.isRequired,
					onClose: function (time, inst) {
						$(inst).timeInput("setTime", time);
					}
				});
			}
			else {
				$(this.element).on('blur', function(event) {
					$(this.element).timeInput("setTime", $(this).val());
				});
			}
		},
    
		option: function(key, value) {
            if ($.isPlainObject(key)) {
                this.options = $.extend(true, this.options, key);
            }
            else if (key && (typeof value == "undefined")) {
                return this.options[key];
            }
            else {
                this.options[key] = value;
            }
            
            return this;
		},
		
        // Private function.
		_validateTime: function(timeString) {
			var timeValue = {
				isValid: false,
				message: null,
				timeDate: null
			};
            
			if (this.options.isRequired && (timeString === null || timeString === "")) {
				timeValue.message = "Time is required";
			}
			else {
				var matches = timeString.match(_timeRegex);                        
				if (matches) {
					timeValue.isValid = true;
					var timeDate = Date.create(timeString);
					timeValue.timeDate = timeDate;
					timeValue.message = (timeDate === null) ? "Null time" : timeDate.format("{Weekday} {Month} {ord}, {year} {HH}:{mm}:{ss}.{fff}");
				}
				else {
					timeValue.message = "Invalid time";                   
				}
			}
				
			return timeValue;       
		},

        // Public function to set time.
        setTime: function(timeToSet) {
			this._timeValue = _validateTime(timeToSet);
			var timeValue = this._timeValue;
			$('#timeValue').text(timeValue.message);

			if (timeToSet === "") {
				if (this.options.hasPicker) { $(this.element).timepicker('setTime', timeToSet); }
				else { $(this.element).val(""); }
			}
			else {
				if (timeValue.isValid) {
					var formattedTime = timeValue.timeDate.format("{HH}:{mm}");
					if (this.options.hasPicker) { $(this.element).timepicker('setTime', formattedTime); }
					else { $(this.element).val(formattedTime); }
				}
			}
            
            return this;
        }
    };
    
    /*
    $.fn[pluginName] = function (options) {
        return this.each(function() {
            var pluginTag = "plugin_" + pluginName;
            if (!$.data(this, pluginTag)) { $.data(this, pluginTag, new timeInput(this, options)); }
        });
    };
    */
})(jQuery);

// Hook up to widget bridge.
$.widget.bridge("fg", timeInput);
