/*!
 * TimeInput jquery.ui plugin 
 *  - Time entry with validation, and optional popup timepicker UI. 
 *  - Popup timepicker UI provided by Francois Gelinas jquery.ui.timepicker.js plugin.
 *  - User input validated by regular expression. 
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
            showMessage: false,
            errorClass: "errorInput",
            timeDelimiter: ":",
            hasPicker: false,
            hasButtons: false,
            isRequired: false,
            hasSeconds: false,
            onComplete: null
        },
        timeRegex = /(?:^(0[0-9]|1[0-9]|2[0-3])([0-5][0-9])([0-5][0-9])?$)|(?:^([0]?[0-9]|1[0-9]|2[0-3])(?::|\.)([0-5][0-9])(?:(?::|\.)([0-5][0-9]))?$)/;
    
    // The plugin constructor.
    var timeInput = function(options, element) {
        this.options = $.extend({}, defaults, options || {});
        this.element = element;
        
        this._defaults = defaults;
        this._name = pluginName;
        
        // Test for the presence of the Microsoft Ajax library. This is necessary due to conflicting Date.format implementations between
        // the Microsoft Ajax library and the sugarjs library. This must wait until the constructor, rather than in global plugin definition,
        // because the plugin instance's environment is what must be tested.
        var isMsAjax = (typeof Sys !== "undefined");

        this._timeDisplayFormat = isMsAjax ? "HH:mm" : "{HH}:{mm}";
        this._fullDisplayFormat = isMsAjax ? "W MMM dd, yyyy HH:mm:ss" : "{Weekday} {Month} {ord}, {year} {HH}:{mm}:{ss}";
        
		this._timeRegex = timeRegex;
			
        this._init();
    }
    
    timeInput.prototype = {
        _create: function() {
            var self = this;
        },
        
        _init: function() {
            this._clearTime();
            var self = this, $element = $(this.element);
            var options = this.options;
            var onComplete = options.onComplete;
            if (options.hasPicker) {
                var hasButtons = options.hasButtons;
                $element.timepicker({
                    showCloseButton: hasButtons,
                    showNowButton: hasButtons,
                    showDeselectButton: hasButtons && !options.isRequired,
                    onClose: function (time, inst) {
                        var jqInst = $(this);
                        jqInst.timeInput("setTime", time);
                        if (onComplete) { onComplete.apply(jqInst.timeInput, [self._timeValue]); }
                    }
                });
            }
            else {
                $element.on('blur', function(event) {
                    var jqInst = $(this);
                    jqInst.timeInput("setTime", jqInst.val());
                    if (onComplete) { onComplete.apply(jqInst.timeInput, [self._timeValue]); }
                });
            }
            
            var initialValue = $element.val();
            if (initialValue && initialValue !== "") { this.setTime(initialValue); }
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

        _clearTime: function() {
            this._timeValue = {
                isValid: false,
                message: null,
                time: null,
                hours: null,
                minutes: null,
                seconds: null
            };
        },

        _showFeedback: function(timeValue) {
            var $element = $(this.element);
            if ($element && timeValue) {
                var options = this.options;
                if (timeValue.isValid) {
                    $element.removeClass("errorInput");
                    if (options.showMessage) { $element.attr('title', ""); }
                }
                else {
                    $element.addClass("errorInput");
                    if (options.showMessage) { $element.attr('title', timeValue.message); }
                }
            }
        },

        _formatValidTime: function(timeValue) {
            // Check for valid time.
            if (timeValue && timeValue.isValid) {
                // Format time. Zero pad hours. Concatenate time parts with delimiter.
                var timeDelimiter = this.options.timeDelimiter;
                if (timeValue.hours.length == 1) { timeValue.hours = "0" + timeValue.hours; }
                timeValue.time = timeValue.hours + timeDelimiter + timeValue.minutes
                if (timeValue.seconds) { timeValue.time = timeValue.time + timeDelimiter + timeValue.seconds; }
                timeValue.message = timeValue.time;
            }
        },
        
        _validateTime: function(timeString) {
            var timeValue = {
                isValid: false,
                message: null,
                time: null,
                hours: null,
                minutes: null,
                seconds: null
            };
            
            var options = this.options;
            if (options.isRequired && (timeString == null || timeString === "")) {
                timeValue.message = "Time is required";
            }
            else if (timeString == null || timeString === "") {
                timeValue.isValid = true;
                timeValue.message = "Time is empty";                   
            }
            else {
                if (typeof timeString !== "string") {
                    timeString = timeString.toString();
                }
                var matches = timeString.match(this._timeRegex);                        
                if (matches) {
                    timeValue.isValid = true;

                    // Test for non-delimited versus delimited time input, and set time parts accordingly.
                    if (matches[1]) {
                        // Non-delimited time input will have values in the first three match groups (1-3).
                        timeValue.hours = matches[1];
                        timeValue.minutes = matches[2];
                        timeValue.seconds = matches[3];
                    }
                    else { 
                        // Delimited time input will have values in the second three match groups (4-6).
                        timeValue.hours = matches[4];
                        timeValue.minutes = matches[5];
                        timeValue.seconds = matches[6];
                    }

                    // Format time.
                    this._formatValidTime(timeValue);

                }
                else { timeValue.message = "Time is invalid"; }
            }

            // Show feedback.
            this._showFeedback(timeValue);
                
            return timeValue;       
        },

        setTime: function(timeToSet) {
            this._timeValue = this._validateTime(timeToSet);

            var hasPicker = this.options.hasPicker;
            var $element = $(this.element);
            if (timeToSet == null || timeToSet === "") {
                if (hasPicker) { $element.timepicker('setTime', ""); }
                else { $element.val(""); }
            }
            else {
                var timeValue = this._timeValue;
                if (timeValue.isValid) {
                    var formattedTime = timeValue.time;
                    if (hasPicker) { $element.timepicker('setTime', formattedTime); }
                    else { $element.val(formattedTime); }
                }
            }
           
            return this;
        },

        clearTime: function() {
            this._clearTime();
        },
        
        getTimeValue: function() {
            return this._timeValue;
        }
    };

	// Hook up to widget bridge.
	$.widget.bridge("timeInput", timeInput);
})(jQuery, window, document);
