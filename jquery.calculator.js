/* http://keith-wood.name/calculator.html
   Calculator field entry extension for jQuery v1.2.5.
   Written by Keith Wood (kbwood{at}iinet.com.au) October 2008.
   Dual licensed under the GPL (http://dev.jquery.com/browser/trunk/jquery/GPL-LICENSE.txt) and 
   MIT (http://dev.jquery.com/browser/trunk/jquery/MIT-LICENSE.txt) licenses. 
   Please attribute the author if you use it. */
   
(function($) { // hide the namespace

var PROP_NAME = 'calculator';

/* Calculator manager.
   Use the singleton instance of this class, $.calculator, to interact with the plugin.
   Settings for calculator fields are maintained in instance objects,
   allowing multiple different settings on the same page. */
function Calculator() {
	this._curInst = null; // The current instance in use
	this._disabledFields = []; // List of calculator inputs that have been disabled
	this._showingCalculator = false; // True if the popup panel is showing , false if not
	this._showingKeystrokes = false; // True if showing keystrokes for calculator buttons
	/* The definitions of the buttons that may appear on the calculator.
	   Key is ID. Fields are display text, button type, function,
	   class(es), field name, keystroke, keystroke name. */
	this._keyDefs = {
		'_0': ['0', this.digit, null, '', '0', '0'],
		'_1': ['1', this.digit, null, '', '1', '1'],
		'_2': ['2', this.digit, null, '', '2', '2'],
		'_3': ['3', this.digit, null, '', '3', '3'],
		'_4': ['4', this.digit, null, '', '4', '4'],
		'_5': ['5', this.digit, null, '', '5', '5'],
		'_6': ['6', this.digit, null, '', '6', '6'],
		'_7': ['7', this.digit, null, '', '7', '7'],
		'_8': ['8', this.digit, null, '', '8', '8'],
		'_9': ['9', this.digit, null, '', '9', '9'],
		'_A': ['A', this.digit, null, 'hex-digit', 'A', 'a'],
		'_B': ['B', this.digit, null, 'hex-digit', 'B', 'b'],
		'_C': ['C', this.digit, null, 'hex-digit', 'C', 'c'],
		'_D': ['D', this.digit, null, 'hex-digit', 'D', 'd'],
		'_E': ['E', this.digit, null, 'hex-digit', 'E', 'e'],
		'_F': ['F', this.digit, null, 'hex-digit', 'F', 'f'],
		'_.': ['.', this.digit, null, 'decimal', 'DECIMAL', '.'],
		'_+': ['+', this.binary, this._add, 'arith add', 'ADD', '+'],
		'_-': ['-', this.binary, this._subtract, 'arith subtract', 'SUBTRACT', '-'],
		'_*': ['*', this.binary, this._multiply, 'arith multiply', 'MULTIPLY', '*'],
		'_/': ['/', this.binary, this._divide, 'arith divide', 'DIVIDE', '/'],
		'_%': ['%', this.unary, this._percent, 'arith percent', 'PERCENT', '%'],
		'_=': ['=', this.unary, this._equals, 'arith equals', 'EQUALS', '='],
		'+-': ['±', this.unary, this._plusMinus, 'arith plus-minus', 'PLUS_MINUS', '#'],
		'PI': ['pi', this.unary, this._pi, 'pi', 'PI', 'p'],
		'1X': ['1/x', this.unary, this._inverse, 'fn inverse', 'INV', 'i'],
		'LG': ['log', this.unary, this._log, 'fn log', 'LOG', 'l'],
		'LN': ['ln', this.unary, this._ln, 'fn ln', 'LN', 'n'],
		'EX': ['eⁿ', this.unary, this._exp, 'fn exp', 'EXP', 'E'],
		'SQ': ['x²', this.unary, this._sqr, 'fn sqr', 'SQR', '@'],
		'SR': ['√', this.unary, this._sqrt, 'fn sqrt', 'SQRT', '!'],
		'XY': ['x^y', this.binary, this._power, 'fn power', 'POWER', '^'],
		'RN': ['rnd', this.unary, this._random, 'random', 'RANDOM', '?'],
		'SN': ['sin', this.unary, this._sin, 'trig sin', 'SIN', 's'],
		'CS': ['cos', this.unary, this._cos, 'trig cos', 'COS', 'o'],
		'TN': ['tan', this.unary, this._tan, 'trig tan', 'TAN', 't'],
		'AS': ['asin', this.unary, this._asin, 'trig asin', 'ASIN', 'S'],
		'AC': ['acos', this.unary, this._acos, 'trig acos', 'ACOS', 'O'],
		'AT': ['atan', this.unary, this._atan, 'trig atan', 'ATAN', 'T'],
		'MC': ['#memClear', this.unary, this._memClear, 'memory mem-clear', 'MEM_CLEAR', 'x'],
		'MR': ['#memRecall', this.unary, this._memRecall, 'memory mem-recall', 'MEM_RECALL', 'r'],
		'MS': ['#memStore', this.unary, this._memStore, 'memory mem-store', 'MEM_STORE', 'm'],
		'M+': ['#memAdd', this.unary, this._memAdd, 'memory mem-add', 'MEM_ADD', '>'],
		'M-': ['#memSubtract', this.unary, this._memSubtract, 'memory mem-subtract', 'MEM_SUBTRACT', '<'],
		'BB': ['#base2', this.control, this._base2, 'base base2', 'BASE_2', 'B'],
		'BO': ['#base8', this.control, this._base8, 'base base8', 'BASE_8', 'C'],
		'BD': ['#base10', this.control, this._base10, 'base base10', 'BASE_10', 'D'],
		'BH': ['#base16', this.control, this._base16, 'base base16', 'BASE_16', 'H'],
		'DG': ['#degrees', this.control, this._degrees, 'angle degrees', 'DEGREES', 'G'],
		'RD': ['#radians', this.control, this._radians, 'angle radians', 'RADIANS', 'R'],
		'BS': ['#backspace', this.control, this._undo, 'undo', 'UNDO', 8, 'BSp'], // backspace
		'CE': ['#clearError', this.control, this._clearError, 'clear-error', 'CLEAR_ERROR', 36, 'Hom'], // home
		'CA': ['#clear', this.control, this._clear, 'clear', 'CLEAR', 35, 'End'], // end
		'@X': ['#close', this.control, this._close, 'close', 'CLOSE', 27, 'Esc'], // escape
		'@U': ['#use', this.control, this._use, 'use', 'USE', 13, 'Ent'], // enter
		'@E': ['#erase', this.control, this._erase, 'erase', 'ERASE', 46, 'Del'], // delete
		'  ': ['', this.space, null, 'space', 'SPACE'],
		'_ ': ['', this.space, null, 'half-space', 'HALF_SPACE'],
		'??': ['??', this.unary, this._noOp]
	};
	this._keyCodes = {};
	this._keyChars = {};
	for (var code in this._keyDefs) {
		if (this._keyDefs[code][4]) {
			this[this._keyDefs[code][4]] = code;
		}
		if (this._keyDefs[code][5]) {
			if (typeof this._keyDefs[code][5] == 'number') {
				this._keyCodes[this._keyDefs[code][5]] = code;
			}
			else {
				this._keyChars[this._keyDefs[code][5]] = code;
			}
		}
	}
	this.regional = []; // Available regional settings, indexed by language code
	this.regional[''] = { // Default regional settings
		decimalChar: '.', // Character for the decimal point
		buttonText: '...', // Display text for trigger button
		buttonStatus: 'Open the calculator', // Status text for trigger button
		closeText: 'Close', // Display text for close link
		closeStatus: 'Close the calculator', // Status text for close link
		useText: 'Use', // Display text for use link
		useStatus: 'Use the current value', // Status text for use link
		eraseText: 'Erase', // Display text for erase link
		eraseStatus: 'Erase the value from the field', // Status text for erase link
		backspaceText: 'BS', // Display text for backspace link
		backspaceStatus: 'Erase the last digit', // Status text for backspace link
		clearErrorText: 'CE', // Display text for clear error link
		clearErrorStatus: 'Erase the last number', // Status text for clear error link
		clearText: 'CA', // Display text for clear link
		clearStatus: 'Reset the calculator', // Status text for clear link
		memClearText: 'MC', // Display text for memory clear link
		memClearStatus: 'Clear the memory', // Status text for memory clear link
		memRecallText: 'MR', // Display text for memory recall link
		memRecallStatus: 'Recall the value from memory', // Status text for memory recall link
		memStoreText: 'MS', // Display text for memory store link
		memStoreStatus: 'Store the value in memory', // Status text for memory store link
		memAddText: 'M+', // Display text for memory add link
		memAddStatus: 'Add to memory', // Status text for memory add link
		memSubtractText: 'M-', // Display text for memory subtract link
		memSubtractStatus: 'Subtract from memory', // Status text for memory subtract link
		base2Text: 'Bin', // Display text for base 2 link
		base2Status: 'Switch to binary', // Status text for base 2 link
		base8Text: 'Oct', // Display text for base 8 link
		base8Status: 'Switch to octal', // Status text for base 8 link
		base10Text: 'Dec', // Display text for base 10 link
		base10Status: 'Switch to decimal', // Status text for base 10 link
		base16Text: 'Hex', // Display text for base 16 link
		base16Status: 'Switch to hexadecimal', // Status text for base 16 link
		degreesText: 'Deg', // Display text for degrees link
		degreesStatus: 'Switch to degrees', // Status text for degrees link
		radiansText: 'Rad', // Display text for radians link
		radiansStatus: 'Switch to radians', // Status text for radians link
		isRTL: false // True if right-to-left language, false if left-to-right
	};
	this._defaults = { // Global defaults for all the calculator instances
		showOn: 'focus', // 'focus' for popup on focus, 'button' for trigger button,
			// 'both' for either, 'operator' for non-numeric character entered,
			// 'opbutton' for operator/button combination
		buttonImage: '', // URL for trigger button image
		buttonImageOnly: false, // True if the image appears alone, false if it appears on a button
		isOperator: null, // Call back function to determine if a keystroke opens the calculator
		showAnim: 'show', // Name of jQuery animation for popup
		showOptions: {}, // Options for enhanced animations
		duration: 'normal', // Duration of display/closure
		appendText: '', // Display text following the input box, e.g. showing the format
		calculatorClass: '', // Additional CSS class for the calculator for an instance
		prompt: '', // Text across the top of the calculator
		layout: this.standardLayout, // Layout of keys
		value: 0, // The initial value for inline calculators
		base: 10, // The numeric base for calculations
		precision: 10, // The number of digits of precision to use in rounding for display
		useDegrees: false, // True to use degress for trigonometric functions, false for radians
		constrainInput: true, // True to restrict typed characters to numerics, false to allow anything
		onOpen: null, // Define a callback function before the panel is opened
		onButton: null, // Define a callback function when a button is activated
		onClose: null // Define a callback function when the panel is closed
	};
	$.extend(this._defaults, this.regional['']);
	this.mainDiv = $('<div id="' + this._mainDivId + '" style="display: none;"></div>').
		click(this._focusEntry);
}

$.extend(Calculator.prototype, {
	/* Class name added to elements to indicate already configured with calculator. */
	markerClassName: 'hasCalculator',

	digit: 'd', // Indicator of a digit key
	binary: 'b', // Indicator of a binary operation key
	unary: 'u', // Indicator of a unary operation key
	control: 'c', // Indicator of a control key
	space: 's', // Indicator of a space
	
	_mainDivId: 'calculator-div', // The ID of the main calculator division
	_inlineClass: 'calculator-inline', // The name of the inline marker class
	_appendClass: 'calculator-append', // The name of the appended text marker class
	_triggerClass: 'calculator-trigger', // The name of the trigger marker class
	_disableClass: 'calculator-disabled', // The name of the disabled covering marker class
	_inlineEntryClass: 'calculator-keyentry', // The name of the inline entry marker class
	_resultClass: 'calculator-result', // The name of the calculator result marker class
	_focussedClass: 'calculator-focussed', // The name of the focussed marker class
	_keystrokeClass: 'calculator-keystroke', // The name of the keystroke marker class
	_coverClass: 'calculator-cover', // The name of the IE select cover marker class

	/* The standard calculator layout with simple operations. */
	standardLayout: ['  BSCECA', '_1_2_3_+@X', '_4_5_6_-@U', '_7_8_9_*@E', '_0_._=_/'],
	/* The extended calcualtor layout with common scientific operations. */
	scientificLayout: ['@X@U@E  BSCECA', 'DGRD    _ MC_ _7_8_9_+', 'SNASSRLG_ MR_ _4_5_6_-',
		'CSACSQLN_ MS_ _1_2_3_*', 'TNATXYEX_ M+_ _0_.+-_/', 'PIRN1X  _ M-_   _%_='],

	/* Override the default settings for all instances of calculator. 
	   @param  settings  (object) the new settings to use as defaults
	   @return  (object) the calculator object for chaining further calls */
	setDefaults: function(settings) {
		extendRemove(this._defaults, settings || {});
		return this;
	},

	/* Add a new key definition.
	   @param  code       (string) the two-character code for this key
	   @param  label      (string) the display label for this key
	   @param  type       (boolean) true if this is a binary operator,
	                      false if a unary operator, or (string) key type - use
	                      constants ($.calculator.) digit, binary, unary, space, control
	   @param  func       (function) the function that applies this key -
	                       it is expected to take a parameter of the current instance
	   @param  style      (string, optional) any additional CSS styles for this key
	   @param  constant   (string, optional) the name of a constant to create for this key
	   @param  keystroke  (char or number) the character or key code of the keystroke for this key
	   @param  keyName    (string) the name of the keystroke for this key
	   @return  (object) the calculator object for chaining further calls */
	addKeyDef: function(code, label, type, func, style, constant, keystroke, keyName) {
		this._keyDefs[code] = [label, (typeof type == 'boolean' ?
			(type ? this.binary : this.unary) : type), func, style, constant, keystroke, keyName];
		if (constant) {
			this[constant] = code;
		}
		if (keystroke) {
			if (typeof keystroke == 'number') {
				this._keyCodes[keystroke] = code;
			}
			else {
				this._keyChars[keystroke] = code;
			}
		}
		return this;
	},

	/* Attach the calculator to a jQuery selection.
	   @param  target    (element) the target input field or division/span
	   @param  settings  (object) the new settings to use for this instance */
	_attachCalculator: function(target, settings) {
		var $target = $(target);
		var inline = target.nodeName.toLowerCase() != 'input';
		var keyEntry = (!inline ? $target :
			$('<input type="text" class="' + this._inlineEntryClass + '"/>'));
		var inst = {_input: keyEntry, _inline: inline,
			_mainDiv: (inline ? $('<div class="' + this._inlineClass + '"></div>') :
			this.mainDiv)};
		inst.settings = $.extend({}, settings || {}); 
		this._connectCalculator(target, inst);
		if (inline) {
			$target.append(keyEntry).append(inst._mainDiv).
				bind('click.calculator', function() { keyEntry.focus(); });
			this._reset(inst, '0', true);
			this._setValue(inst);
			this._updateCalculator(inst);
		}
	},

	/* Attach the calculator to an input field or division/span.
	   @param  target  (element) the target control
	   @param  inst    (object) the instance settings */
	_connectCalculator: function(target, inst) {
		var control = $(target);
		if (control.hasClass(this.markerClassName)) {
			return;
		}
		var appendText = this._get(inst, 'appendText');
		var isRTL = this._get(inst, 'isRTL');
		if (appendText) {
			control[isRTL ? 'before' : 'after'](
				'<span class="' + this._appendClass + '">' + appendText + '</span>');
		}
		if (!inst._inline) {
			var showOn = this._get(inst, 'showOn');
			if (showOn == 'focus' || showOn == 'both') { // pop-up calculator when in the marked field
				control.focus(this._showCalculator);
			}
			if (showOn == 'button' || showOn == 'both' || showOn == 'opbutton') { // pop-up calculator when button clicked
				var buttonText = this._get(inst, 'buttonText');
				var buttonStatus = this._get(inst, 'buttonStatus');
				var buttonImage = this._get(inst, 'buttonImage');
				var trigger = $(this._get(inst, 'buttonImageOnly') ? 
					$('<img/>').attr(
						{src: buttonImage, alt: buttonStatus, title: buttonStatus}) :
					$('<button type="button" title="' + buttonStatus + '"></button>').
						html(buttonImage == '' ? buttonText :
						$('<img/>').attr({src: buttonImage})));
				control[isRTL ? 'before' : 'after'](trigger);
				trigger.addClass(this._triggerClass).click(function() {
					if ($.calculator._showingCalculator && $.calculator._lastInput == target) {
						$.calculator._hideCalculator();
					}
					else {
						$.calculator._showCalculator(target);
					}
					return false;
				});
			}
		}
		inst._input.keydown(this._doKeyDown).keyup(this._doKeyUp).keypress(this._doKeyPress);
		if (inst._inline) {
			inst._mainDiv.keydown(this._doKeyDown).keyup(this._doKeyUp).
				keypress(this._doKeyPress);
			inst._input.focus(function() {
				if (!$.calculator._isDisabledCalculator(control[0])) {
					inst._focussed = true;
					$('.' + $.calculator._resultClass, inst._mainDiv).
						addClass($.calculator._focussedClass);
				}
			}).blur(function() {
				inst._focussed = false;
				$('.' + $.calculator._resultClass, inst._mainDiv).
					removeClass($.calculator._focussedClass);
			});
		}
		control.addClass(this.markerClassName).
			bind("setData.calculator", function(event, key, value) {
				inst.settings[key] = value;
			}).bind("getData.calculator", function(event, key) {
				return this._get(inst, key);
			});
		$.data(target, PROP_NAME, inst);
		$.data(inst._input[0], PROP_NAME, inst);
	},

	/* Detach calculator from its control.
	   @param  target  (element) the target input field or division/span */
	_destroyCalculator: function(target) {
		var control = $(target);
		if (!control.hasClass(this.markerClassName)) {
			return;
		}
		var inst = $.data(target, PROP_NAME);
		inst._input.unbind('keydown', this._doKeyDown).
			unbind('keyup', this._doKeyUp).
			unbind('keypress', this._doKeyPress);
		control.siblings('.' + this._appendClass).remove().end().
			siblings('.' + this._triggerClass).remove().end().
			prev('.' + this._inlineEntryClass).remove().end().
			removeClass(this.markerClassName).
			unbind('focus', this._showCalculator).
			unbind('click.calculator').empty();
		$.removeData(inst._input[0], PROP_NAME);
		$.removeData(target, PROP_NAME);
	},

	/* Enable the calculator for a jQuery selection.
	   @param  target  (element) the target input field or division/span */
	_enableCalculator: function(target) {
		var control = $(target);
		if (!control.hasClass(this.markerClassName)) {
			return;
		}
		var nodeName = target.nodeName.toLowerCase();
		if (nodeName == 'input') {
			target.disabled = false;
			control.siblings('button.' + this._triggerClass).
				each(function() { this.disabled = false; }).end().
				siblings('img.' + this._triggerClass).
				css({opacity: '1.0', cursor: ''});
		}
		else if (nodeName == 'div' || nodeName == 'span') {
			control.find('.' + this._inlineEntryClass + ',button').attr('disabled', '').end().
				children('.' + this._disableClass).remove();
		}
		this._disabledFields = $.map(this._disabledFields,
			function(value) { return (value == target ? null : value); }); // delete entry
	},

	/* Disable the calculator for a jQuery selection.
	   @param  target  (element) the target input field or division/span */
	_disableCalculator: function(target) {
		var control = $(target);
		if (!control.hasClass(this.markerClassName)) {
			return;
		}
		var nodeName = target.nodeName.toLowerCase();
		if (nodeName == 'input') {
			target.disabled = true;
			control.siblings('button.' + this._triggerClass).
				each(function() { this.disabled = true; }).end().
				siblings('img.' + this._triggerClass).
				css({opacity: '0.5', cursor: 'default'});
		}
		else if (nodeName == 'div' || nodeName == 'span') {
			var inline = control.children('.' + this._inlineClass);
			var offset = inline.offset();
			var relOffset = {left: 0, top: 0};
			inline.parents().each(function() {
				if ($(this).css('position') == 'relative') {
					relOffset = $(this).offset();
					return false;
				}
			});
			control.find('.' + this._inlineEntryClass + ',button').attr('disabled', 'disabled').end().
				prepend('<div class="' + this._disableClass + '" style="width: ' +
				inline.outerWidth() + 'px; height: ' + inline.outerHeight() +
				'px; left: ' + (offset.left - relOffset.left) +
				'px; top: ' + (offset.top - relOffset.top) + 'px;"></div>');
		}
		this._disabledFields = $.map(this._disabledFields,
			function(value) { return (value == target ? null : value); }); // delete entry
		this._disabledFields[this._disabledFields.length] = target;
	},

	/* Is the input field or division/span disabled as a calculator?
	   @param  target  (element) the target control
	   @return  (boolean) true if disabled, false if enabled */
	_isDisabledCalculator: function(target) {
		return (target && $.inArray(target, this._disabledFields) > -1);
	},

	/* Update the settings for calculator attached to an input field or division/span.
	   @param  target  (element) the target control
	   @param  name    (object) the new settings to update or
	                   (string) the name of the setting to change
	   @param  value   (any) the new value for the setting (omit if above is an object) */
	_changeCalculator: function(target, name, value) {
		var settings = name || {};
		if (typeof name == 'string') {
			settings = {};
			settings[name] = value;
		}
		var inst = $.data(target, PROP_NAME);
		if (inst) {
			if (this._curInst == inst) {
				this._hideCalculator();
			}
			extendRemove(inst.settings, settings);
			if (inst._inline) {
				this._setValue(inst);
			}
			this._updateCalculator(inst);
		}
	},

	/* Pop-up the calculator for a given input field or division/span.
	   @param  input  (element) the control attached to the calculator or
	                  (event) if triggered by focus */
	_showCalculator: function(input) {
		input = input.target || input;
		if ($.calculator._isDisabledCalculator(input) ||
				$.calculator._lastInput == input) { // already here
			return;
		}
		var inst = $.data(input, PROP_NAME);
		$.calculator._hideCalculator(null, '');
		$.calculator._lastInput = input;
		$.calculator._pos = $.calculator._findPos(input);
		$.calculator._pos[1] += input.offsetHeight; // add the height
		var isFixed = false;
		$(input).parents().each(function() {
			isFixed |= $(this).css('position') == 'fixed';
			return !isFixed;
		});
		if (isFixed && $.browser.opera) { // correction for Opera when fixed and scrolled
			$.calculator._pos[0] -= document.documentElement.scrollLeft;
			$.calculator._pos[1] -= document.documentElement.scrollTop;
		}
		var offset = {left: $.calculator._pos[0], top: $.calculator._pos[1]};
		$.calculator._pos = null;
		// determine sizing offscreen
		inst._mainDiv.css({position: 'absolute', display: 'block', top: '-1000px',
			width: ($.browser.opera ? '1000px' : 'auto')});
		// callback before calculator opening		
		var onOpen = $.calculator._get(inst, 'onOpen');
		if (onOpen) {
			onOpen.apply((inst._input ? inst._input[0] : null),  // trigger custom callback
				[(inst._inline ? inst.curValue : inst._input.val()), inst]);
		}
		$.calculator._reset(inst, inst._input.val(), true);
		$.calculator._updateCalculator(inst);
		// and adjust position before showing
		offset = $.calculator._checkOffset(inst, offset, isFixed);
		inst._mainDiv.css({position: (isFixed ? 'fixed' : 'absolute'), display: 'none',
			left: offset.left + 'px', top: offset.top + 'px'});
		var showAnim = $.calculator._get(inst, 'showAnim');
		var duration = $.calculator._get(inst, 'duration');
		duration = (duration == 'normal' && $.ui && $.ui.version >= '1.8' ? '_default' : duration);
		var postProcess = function() {
			$.calculator._showingCalculator = true;
			var borders = $.calculator._getBorders(inst._mainDiv);
			inst._mainDiv.find('iframe.' + $.calculator._coverClass). // IE6- only
				css({left: -borders[0], top: -borders[1],
					width: inst._mainDiv.outerWidth(), height: inst._mainDiv.outerHeight()});
		};
		if ($.effects && $.effects[showAnim]) {
			inst._mainDiv.show(showAnim, $.calculator._get(inst, 'showOptions'),
				duration, postProcess);
		}
		else {
			inst._mainDiv[showAnim || 'show']((showAnim ? duration : ''), postProcess);
		}
		if (!showAnim) {
			postProcess();
		}
		if (inst._input[0].type != 'hidden') {
			inst._input[0].focus();
		}
		$.calculator._curInst = inst;
	},

	/* Reinitialise the calculator.
	   @param  inst      (object) the instance settings
	   @param  value     (number) the starting value
	   @param  clearMem  (boolean) true to clear memory */
	_reset: function(inst, value, clearMem) {
		var base = this._get(inst, 'base');
		var decimalChar = this._get(inst, 'decimalChar');
		value = '' + (value || 0);
		value = (decimalChar != '.' ? value.replace(new RegExp(decimalChar), '.') : value);
		inst.curValue = (base == 10 ? parseFloat(value) : parseInt(value, base)) || 0;
		inst.dispValue = this._setDisplay(inst);
		inst.prevValue = inst._savedValue = 0;
		inst.memory = (clearMem ? 0 : inst.memory);
		inst._pendingOp = inst._savedOp = this._noOp;
		inst._newValue = true;
	},

	/* Set the initial value for display.
	   @param  inst  (object) the instance settings */
	_setValue: function(inst) {
		inst.curValue = this._get(inst, 'value') || 0;
		inst.dispValue = this._setDisplay(inst);
	},

	/* Generate the calculator content.
	   @param  inst  (object) the instance settings */
	_updateCalculator: function(inst) {
		var borders = this._getBorders(inst._mainDiv);
		inst._mainDiv.html(this._generateHTML(inst)).
			find('iframe.' + this._coverClass). // IE6- only
			css({left: -borders[0], top: -borders[1],
				width: inst._mainDiv.outerWidth(), height: inst._mainDiv.outerHeight()});
		inst._mainDiv.removeClass().addClass(this._get(inst, 'calculatorClass') + ' ' +
			(this._get(inst, 'isRTL') ? 'calculator-rtl ' : '') +
			(inst._inline ? this._inlineClass : ''));
		if (this._curInst == inst) {
			inst._input.focus();
		}
	},

	/* Retrieve the size of left and top borders for an element.
	   @param  elem  (jQuery object) the element of interest
	   @return  (number[2]) the left and top borders */
	_getBorders: function(elem) {
		var convert = function(value) {
			var extra = ($.browser.msie ? 1 : 0);
			return {thin: 1 + extra, medium: 3 + extra, thick: 5 + extra}[value] || value;
		};
		return [parseFloat(convert(elem.css('border-left-width'))),
			parseFloat(convert(elem.css('border-top-width')))];
	},

	/* Check positioning to remain on screen.
	   @param  inst    (object) the instance settings
	   @param  offset  (object) the current offset
	   @param  isFixed  (boolean) true if the input field is fixed in position
	   @return  (object) the updated offset */
	_checkOffset: function(inst, offset, isFixed) {
		var pos = inst._input ? this._findPos(inst._input[0]) : null;
		var browserWidth = window.innerWidth || document.documentElement.clientWidth;
		var browserHeight = window.innerHeight || document.documentElement.clientHeight;
		var scrollX = document.documentElement.scrollLeft || document.body.scrollLeft;
		var scrollY = document.documentElement.scrollTop || document.body.scrollTop;
		if (($.browser.msie && parseInt($.browser.version, 10) < 7) || $.browser.opera) {
			// recalculate width as otherwise set to 100%
			var width = 0;
			$('.calculator-row', inst._mainDiv).find('button:last').each(function() {
				width = Math.max(width, this.offsetLeft + this.offsetWidth +
					parseInt($(this).css('margin-right'), 10));
			});
			inst._mainDiv.css('width', width);
		}
		// reposition calculator panel horizontally if outside the browser window
		if (this._get(inst, 'isRTL') ||
				(offset.left + inst._mainDiv.outerWidth() - scrollX) > browserWidth) {
			offset.left = Math.max((isFixed ? 0 : scrollX),
				pos[0] + (inst._input ? inst._input.outerWidth() : 0) -
				(isFixed ? scrollX : 0) - inst._mainDiv.outerWidth() -
				(isFixed && $.browser.opera ? document.documentElement.scrollLeft : 0));
		}
		else {
			offset.left -= (isFixed ? scrollX : 0);
		}
		// reposition calculator panel vertically if outside the browser window
		if ((offset.top + inst._mainDiv.outerHeight() - scrollY) > browserHeight) {
			offset.top = Math.max((isFixed ? 0 : scrollY),
				pos[1] - (isFixed ? scrollY : 0) - inst._mainDiv.outerHeight() -
				(isFixed && $.browser.opera ? document.documentElement.scrollTop : 0));
		}
		else {
			offset.top -= (isFixed ? scrollY : 0);
		}
		return offset;
	},

	/* Find an object's position on the screen.
	   @param  obj  (element) the element to find the position for
	   @return  (int[2]) the element's position */
	_findPos: function(obj) {
        while (obj && (obj.type == 'hidden' || obj.nodeType != 1)) {
            obj = obj.nextSibling;
        }
        var position = $(obj).offset();
	    return [position.left, position.top];
	},

	/* Hide the calculator from view.
	   @param  input     (element) the control attached to the calculator
	   @param  duration  (string) the duration over which to close the calculator */
	_hideCalculator: function(input, duration) {
		var inst = this._curInst;
		if (!inst || (input && inst != $.data(input, PROP_NAME))) {
			return;
		}
		if (this._showingCalculator) {
			duration = (duration != null ? duration : this._get(inst, 'duration'));
			duration = (duration == 'normal' && $.ui && $.ui.version >= '1.8' ? '_default' : duration);
			var showAnim = this._get(inst, 'showAnim');
			if ($.effects && $.effects[showAnim]) {
				inst._mainDiv.hide(showAnim, this._get(inst, 'showOptions'), duration);
			}
			else {
				inst._mainDiv[(showAnim == 'slideDown' ? 'slideUp' :
					(showAnim == 'fadeIn' ? 'fadeOut' : 'hide'))](showAnim ? duration : '');
			}
		}
		var onClose = this._get(inst, 'onClose');
		if (onClose) {
			onClose.apply((inst._input ? inst._input[0] : null),  // trigger custom callback
				[(inst._inline ? inst.curValue : inst._input.val()), inst]);
		}
		if (this._showingCalculator) {
			this._showingCalculator = false;
			this._lastInput = null;
		}
		this._curInst = null;
	},

	/* Close calculator if clicked elsewhere.
	   @param  event  (event) the mouseclick details */
	_checkExternalClick: function(event) {
		if (!$.calculator._curInst) {
			return;
		}
		var target = $(event.target);
		if (!target.parents().andSelf().is('#' + $.calculator._mainDivId) &&
				!target.hasClass($.calculator.markerClassName) &&
				!target.parents().andSelf().hasClass($.calculator._triggerClass) &&
				$.calculator._showingCalculator) {
			$.calculator._hideCalculator(null, '');
		}
	},

	/* Focus back onto the input field. */
	_focusEntry: function() {
		if ($.calculator._curInst && $.calculator._curInst._input) {
			$.calculator._curInst._input.focus();
		}
	},

	/* Handle keystrokes.
	   @param  e  (event) the key event */
	_doKeyDown: function(e) {
		var handled = false;
		var inst = $.data(e.target, PROP_NAME);
		var div = (inst && inst._inline ? $(e.target).parent()[0] : null);
		if (e.keyCode == 9) { // tab
			$.calculator.mainDiv.stop(true, true);
			$.calculator._hideCalculator(null, '');
			if (inst && inst._inline) {
				inst._input.blur();
			}
		}
		else if ($.calculator._showingCalculator ||
				(div && !$.calculator._isDisabledCalculator(div))) {
			if (e.keyCode == 18) { // alt - show keystrokes
				if (!$.calculator._showingKeystrokes) {
					inst._mainDiv.find('.' + $.calculator._keystrokeClass).show();
					$.calculator._showingKeystrokes = true;
				}
				handled = true;
			}
			else {
				var code = $.calculator._keyCodes[e.keyCode];
				if (code) {
					$('button[keystroke=' + code + ']', inst._mainDiv).not(':disabled').click();
					handled = true;
				}
			}
		}
		else if (e.keyCode == 36 && e.ctrlKey && inst && !inst._inline) {
			$.calculator._showCalculator(this); // display the date picker on ctrl+home
		}
		if (handled) {
			e.preventDefault();
			e.stopPropagation();
		}
		return !handled;
	},

	/* Hide keystrokes, if showing.
	   @param  e  (event) the key event */
	_doKeyUp: function(e) {
		if ($.calculator._showingKeystrokes) {
			var inst = $.data(e.target, PROP_NAME);
			inst._mainDiv.find('.' + $.calculator._keystrokeClass).hide();
			$.calculator._showingKeystrokes = false;
		}
	},

	/* Convert characters into button clicks.
	   @param  e  (event) the key event
	   @return  true if keystroke allowed, false if not */
	_doKeyPress: function(e) {
		var inst = $.data(e.target, PROP_NAME);
		if (!inst) {
			return true;
		}
		var div = (inst && inst._inline ? $(e.target).parent()[0] : null);
		var ch = String.fromCharCode(e.charCode == undefined ? e.keyCode : e.charCode);
		var base = $.calculator._get(inst, 'base');
		var decimalChar = $.calculator._get(inst, 'decimalChar');
		var showOn = $.calculator._get(inst, 'showOn');
		var isOperator = $.calculator._get(inst, 'isOperator') || $.calculator._isOperator;
		if (!$.calculator._showingCalculator && !div &&
				(showOn == 'operator' || showOn == 'opbutton') && 
				isOperator.apply(inst._input, [ch, e, inst._input.val(), base, decimalChar])) {
			$.calculator._showCalculator(this); // display the date picker on operator usage
			$.calculator._showingCalculator = true;
		}
		if ($.calculator._showingCalculator ||
				(div && !$.calculator._isDisabledCalculator(div))) {
			var code = $.calculator._keyChars[ch == decimalChar ? '.' : ch];
			if (code) {
				$('button[keystroke=' + code + ']', inst._mainDiv).not(':disabled').click();
			}
			return false;
		}
		if (ch >= ' ' && $.calculator._get(inst, 'constrainInput')) {
			var pattern = new RegExp('^-?' + (base == 10 ? '[0-9]*(\\' + decimalChar + '[0-9]*)?' :
				'[' + '0123456789abcdef'.substring(0, base) + ']*') + '$');
			return (inst._input.val() + ch).toLowerCase().match(pattern) != null;
		}
		return true;
	},

	/* Determine whether or not a keystroke is a trigger for opening the calculator.
	   @param  ch           (char) the current character
	   @param  event        (KeyEvent) the entire key event
	   @param  value        (string) the current input value
	   @param  base         (number) the current number base
	   @param  decimalChar  (char) the current decimal character
	   @return  true if a trigger, false if not */
	_isOperator: function(ch, event, value, base, decimalChar) {
		return ch > ' ' && !(ch == '-' && value == '') &&
			('0123456789abcdef'.substr(0, base) + '.' + decimalChar).indexOf(ch.toLowerCase()) == -1;
	},

	/* Get a setting value, defaulting if necessary.
	   @param  inst  (object) the instance settings
	   @param  name  (string) the name of the setting
	   @return  (any) the value of the setting, or its default if not set explicitly */
	_get: function(inst, name) {
		return inst.settings[name] !== undefined ?
			inst.settings[name] : this._defaults[name];
	},

	/* Generate the HTML for the current state of the calculator.
	   @param  inst  (object) the instance settings
	   @return  (string) the HTML for this calculator */
	_generateHTML: function(inst) {
		var isRTL = this._get(inst, 'isRTL');
		var prompt = this._get(inst, 'prompt');
		var layout = this._get(inst, 'layout');
		var base = this._get(inst, 'base');
		var useDegrees = this._get(inst, 'useDegrees');
		var html = (!prompt ? '' :
			'<div class="calculator-prompt">' + prompt + '</div>') +
			'<div class="calculator-result' + (inst._focussed ? ' ' + this._focussedClass: '') +
			'"><span>' + inst.dispValue + '</span></div>';
		for (var i = 0; i < layout.length; i++) {
			html += '<div class="calculator-row">';
			for (var j = 0; j < layout[i].length; j += 2) {
				var code = layout[i].substr(j, 2);
				var def = this._keyDefs[code] || this._keyDefs['??'];
				var label = (def[0].charAt(0) == '#' ? this._get(inst, def[0].substr(1) + 'Text') : def[0]);
				var status = (def[0].charAt(0) == '#' ? this._get(inst, def[0].substr(1) + 'Status') : '');
				var styles = (def[3] ? def[3].split(' ') : []);
				for (var k = 0; k < styles.length; k++) {
					styles[k] = 'calculator-' + styles[k];
				}
				styles = styles.join(' ');
				html += (def[1] == this.space ? '<span class="calculator-' + def[3] + '"></span>' :
					(inst._inline && (def[2] == '._close' || def[2] == '._erase') ? '' :
					'<button type="button" keystroke="' + code + '"' +
					// Control buttons
					(def[1] == this.control ? ' class="calculator-ctrl' +
					(def[0].replace(/^#base/, '') == base ? ' calculator-base-active' : '') +
					(def[0] == '#degrees' && useDegrees ? ' calculator-angle-active' : '') +
					(def[0] == '#radians' && !useDegrees ? ' calculator-angle-active' : '') :
					// Digits
					(def[1] == this.digit ? (parseInt(def[0], 16) >= base || (base != 10 && def[0] == '.') ?
					' disabled="disabled"' : '') + ' class="calculator-digit' :
					// Binary operations
					(def[1] == this.binary ? ' class="calculator-oper' :
					// Unary operations
					' class="calculator-oper' +
					(def[0].match(/^#mem(Clear|Recall)$/) && !inst.memory ? ' calculator-mem-empty' : '')))) +
					// Common
					(styles ? ' ' + styles : '') + '" ' + (status ? 'title="' + status + '"' : '') + '>' +
					(code == '_.' ? this._get(inst, 'decimalChar') : label) +
					// Keystrokes
					(def[5] && def[5] != def[0] ? '<span class="' + this._keystrokeClass +
					(def[6] ? ' calculator-keyname' : '') + '">' + (def[6] || def[5]) + '</span>' : '') +
					'</button>'));
			}
			html += '</div>';
		}
		html += '<div style="clear: both;"></div>' + 
			(!inst._inline && $.browser.msie && parseInt($.browser.version, 10) < 7 ? // IE6- only
			'<iframe src="javascript:false;" class="' + this._coverClass + '"></iframe>' : '');
		html = $(html);
		html.find('button').mousedown(function() { $(this).addClass('calculator-key-down'); }).
			mouseup(function() { $(this).removeClass('calculator-key-down'); }).
			mouseout(function() { $(this).removeClass('calculator-key-down'); }).
			click(function() { $.calculator._handleButton(inst, $(this)); });
		return html;
	},

	/* Generate the display value.
	   Tidy the result to avoid JavaScript rounding errors.
	   @param  inst   (object) the instance settings
	   @return  (string) the rounded and formatted display value */
	_setDisplay: function(inst) {
		var precision = this._get(inst, 'precision');
		var fixed = new Number(inst.curValue).toFixed(precision).valueOf(); // Round to 14 digits precision
		var exp = fixed.replace(/^.+(e.+)$/, '$1').replace(/^[^e].*$/, ''); // Extract exponent
		if (exp) {
			fixed = new Number(fixed.replace(/e.+$/, '')).toFixed(precision).valueOf(); // Round mantissa
		}
		return parseFloat(fixed.replace(/0+$/, '') + exp). // Recombine
			toString(this._get(inst, 'base')).toUpperCase().
			replace(/\./, this._get(inst, 'decimalChar'));
	},

	/* Send notification of a button activation.
	   @param  inst   (object) the instance settings
	   @param  label  (string) the label from the button */
	_sendButton: function(inst, label) {
		var onButton = this._get(inst, 'onButton');
		if (onButton) {
			onButton.apply((inst._input ? inst._input[0] : null),
				[label, inst.dispValue, inst]);  // trigger custom callback
		}
	},

	/* Handle a button press.
	   @param  inst    (object) the current instance settings
	   @param  button  (jQuery) the button pressed */
	_handleButton: function(inst, button) {
		var keyDef = this._keyDefs[button.attr('keystroke')];
		if (!keyDef) {
			return;
		}
		var label = button.text().substr(0, button.text().length -
			button.children('.calculator-keystroke').text().length);
		switch (keyDef[1]) {
			case this.control:
				keyDef[2].apply(this, [inst, label]); break;
			case this.digit:
				this._digit(inst, label); break;
			case this.binary:
				this._binaryOp(inst, keyDef[2], label); break;
			case this.unary:
				this._unaryOp(inst, keyDef[2], label); break;
		}
		if ($.calculator._showingCalculator || inst._inline) {
			inst._input.focus();
		}
	},

	/* Do nothing. */
	_noOp: function(inst) {
	},

	/* Add a digit to the number in the calculator.
	   @param  inst   (object) the instance settings
	   @param  digit  (string) the digit to append */
	_digit: function(inst, digit) {
		var decimalChar = this._get(inst, 'decimalChar');
		inst.dispValue = (inst._newValue ? '' : inst.dispValue);
		if (digit == decimalChar && inst.dispValue.indexOf(digit) > -1) {
			return;
		}
		inst.dispValue = (inst.dispValue + digit).replace(/^0(\d)/, '$1').
			replace(new RegExp('^(-?)([\\.' + decimalChar + '])'), '$10$2');
		if (decimalChar != '.') {
			inst.dispValue = inst.dispValue.replace(new RegExp('^' + decimalChar), '0.');
		}
		var base = this._get(inst, 'base');
		var value = (decimalChar != '.' ?
			inst.dispValue.replace(new RegExp(decimalChar), '.') : inst.dispValue);
		inst.curValue = (base == 10 ? parseFloat(value) : parseInt(value, base));
		inst._newValue = false;
		this._sendButton(inst, digit);
		this._updateCalculator(inst);
	},

	/* Save a binary operation for later use.
	   @param  inst   (object) the instance settings
	   @param  op     (function) the binary function
	   @param  label  (string) the button label */
	_binaryOp: function(inst, op, label) {
		if (!inst._newValue && inst._pendingOp) {
			inst._pendingOp(inst);
			var base = this._get(inst, 'base');
			inst.curValue = (base == 10 ? inst.curValue : Math.floor(inst.curValue));
			inst.dispValue = this._setDisplay(inst);
		}
		inst.prevValue = inst.curValue;
		inst._newValue = true;
		inst._pendingOp = op;
		this._sendButton(inst, label);
		this._updateCalculator(inst);
	},

	_add: function(inst) {
		inst.curValue = inst.prevValue + inst.curValue;
	},

	_subtract: function(inst) {
		inst.curValue = inst.prevValue - inst.curValue;
	},

	_multiply: function(inst) {
		inst.curValue = inst.prevValue * inst.curValue;
	},

	_divide: function(inst) {
		inst.curValue = inst.prevValue / inst.curValue;
	},

	_power: function(inst) {
		inst.curValue = Math.pow(inst.prevValue, inst.curValue);
	},

	/* Apply a unary operation to the calculator.
	   @param  inst   (object) the instance settings
	   @param  op     (function) the unary function
	   @param  label  (string) the button label */
	_unaryOp: function(inst, op, label) {
		inst._newValue = true;
		op.apply(this, [inst]);
		var base = this._get(inst, 'base');
		inst.curValue = (base == 10 ? inst.curValue : Math.floor(inst.curValue));
		inst.dispValue = this._setDisplay(inst);
		this._sendButton(inst, label);
		this._updateCalculator(inst);
	},

	_plusMinus: function(inst) {
		inst.curValue = -1 * inst.curValue;
		inst.dispValue = this._setDisplay(inst);
		inst._newValue = false;
	},

	_pi: function(inst) {
		inst.curValue = Math.PI;
	},

	/* Perform a percentage calculation.
	   @param  inst  (object) the instance settings */
	_percent: function(inst) {
		if (inst._pendingOp == this._add) {
			inst.curValue = inst.prevValue * (1 + inst.curValue / 100);
		}
		else if (inst._pendingOp == this._subtract) {
			inst.curValue = inst.prevValue * (1 - inst.curValue / 100);
		}
		else if (inst._pendingOp == this._multiply) {
			inst.curValue = inst.prevValue * inst.curValue / 100;
		}
		else if (inst._pendingOp == this._divide) {
			inst.curValue = inst.prevValue / inst.curValue * 100;
		}
		inst._savedOp = inst._pendingOp;
		inst._pendingOp = this._noOp;
	},

	/* Apply a pending binary operation.
	   @param  inst  (object) the instance settings */
	_equals: function(inst) {
		if (inst._pendingOp == this._noOp) {
			if (inst._savedOp != this._noOp) {
				// Following x op y =: =, z =
				inst.prevValue = inst.curValue;
				inst.curValue = inst._savedValue;
				inst._savedOp(inst);
			}
		}
		else {
			// Normal: x op y =
			inst._savedOp = inst._pendingOp;
			inst._savedValue = inst.curValue;
			inst._pendingOp(inst);
			inst._pendingOp = this._noOp;
		}
	},

	_memAdd: function(inst) {
		inst.memory += inst.curValue;
	},

	_memSubtract: function(inst) {
		inst.memory -= inst.curValue;
	},

	_memStore: function(inst) {
		inst.memory = inst.curValue;
	},

	_memRecall: function(inst) {
		inst.curValue = inst.memory;
	},

	_memClear: function(inst) {
		inst.memory = 0;
	},

	_sin: function(inst) {
		this._trig(inst, Math.sin);
	},

	_cos: function(inst) {
		this._trig(inst, Math.cos);
	},

	_tan: function(inst) {
		this._trig(inst, Math.tan);
	},

	_trig: function(inst, op) {
		var useDegrees = this._get(inst, 'useDegrees');
		inst.curValue = op(inst.curValue * (useDegrees ? Math.PI / 180 : 1));
	},

	_asin: function(inst) {
		this._atrig(inst, Math.asin);
	},

	_acos: function(inst) {
		this._atrig(inst, Math.acos);
	},

	_atan: function(inst) {
		this._atrig(inst, Math.atan);
	},

	_atrig: function(inst, op) {
		inst.curValue = op(inst.curValue);
		if (this._get(inst, 'useDegrees')) {
			inst.curValue = inst.curValue / Math.PI * 180;
		}
	},

	_inverse: function(inst) {
		inst.curValue = 1 / inst.curValue;
	},

	_log: function(inst) {
		inst.curValue = Math.log(inst.curValue) / Math.log(10);
	},

	_ln: function(inst) {
		inst.curValue = Math.log(inst.curValue);
	},

	_exp: function(inst) {
		inst.curValue = Math.exp(inst.curValue);
	},

	_sqr: function(inst) {
		inst.curValue *= inst.curValue;
	},

	_sqrt: function(inst) {
		inst.curValue = Math.sqrt(inst.curValue);
	},

	_random: function(inst) {
		inst.curValue = Math.random();
	},

	_base2: function(inst, label) {
		this._changeBase(inst, label, 2);
	},

	_base8: function(inst, label) {
		this._changeBase(inst, label, 8);
	},

	_base10: function(inst, label) {
		this._changeBase(inst, label, 10);
	},

	_base16: function(inst, label) {
		this._changeBase(inst, label, 16);
	},

	/* Change the number base for the calculator.
	   @param  inst     (object) the instance settings
	   @param  label    (string) the button label
	   @param  newBase  (number) the new number base */
	_changeBase: function(inst, label, newBase) {
		inst.settings.base = newBase;
		inst.curValue = (newBase == 10 ? inst.curValue : Math.floor(inst.curValue));
		inst.dispValue = this._setDisplay(inst);
		inst._newValue = true;
		this._sendButton(inst, label);
		this._updateCalculator(inst);
	},

	_degrees: function(inst, label) {
		this._degreesRadians(inst, label, true);
	},

	_radians: function(inst, label) {
		this._degreesRadians(inst, label, false);
	},

	/* Swap between degrees and radians for trigonometric functions.
	   @param  inst        (object) the instance settings
	   @param  label       (string) the button label
	   @param  useDegrees  (boolean) true to use degrees, false for radians */
	_degreesRadians: function(inst, label, useDegrees) {
		inst.settings.useDegrees = useDegrees;
		this._sendButton(inst, label);
		this._updateCalculator(inst);
	},

	/* Erase the last digit entered.
	   @param  inst   (object) the instance settings
	   @param  label  (string) the button label */
	_undo: function(inst, label) {
		inst.dispValue = inst.dispValue.substr(0, inst.dispValue.length - 1) || '0';
		var base = this._get(inst, 'base');
		inst.curValue = (base == 10 ? parseFloat(inst.dispValue) : parseInt(inst.dispValue, base));
		this._sendButton(inst, label);
		this._updateCalculator(inst);
	},

	/* Erase the last number entered.
	   @param  inst   (object) the instance settings
	   @param  label  (string) the button label */
	_clearError: function(inst, label) {
		inst.dispValue = '0';
		inst.curValue = 0;
		inst._newValue = true;
		this._sendButton(inst, label);
		this._updateCalculator(inst);
	},

	/* Reset the calculator.
	   @param  inst   (object) the instance settings
	   @param  label  (string) the button label */
	_clear: function(inst, label) {
		this._reset(inst, 0, false);
		this._sendButton(inst, label);
		this._updateCalculator(inst);
	},

	/* Close the calculator without changing the value.
	   @param  inst   (object) the instance settings
	   @param  label  (string) the button label */
	_close: function(inst, label) {
		this._finished(inst, label, inst._input.val());
	},

	/* Copy the current value and close the calculator.
	   @param  inst   (object) the instance settings
	   @param  label  (string) the button label */
	_use: function(inst, label) {
		if (inst._pendingOp != this._noOp) {
			this._unaryOp(inst, this._equals, label);
		}
		this._finished(inst, label, inst.dispValue);
	},

	/* Erase the field and close the calculator.
	   @param  inst   (object) the instance settings
	   @param  label  (string) the button label */
	_erase: function(inst, label) {
		this._reset(inst, 0, false);
		this._updateCalculator(inst);
		this._finished(inst, label, '');
	},

	/* Finish with the calculator.
	   @param  inst   (object) the instance settings
	   @param  label  (string) the button label
	   @param  value  (string) the new field value */
	_finished: function(inst, label, value) {
		if (inst._inline) {
			this._curInst = inst;
		}
		else {
			inst._input.val(value);
		}
		this._sendButton(inst, label);
		this._hideCalculator(inst._input[0]);
	}
});

/* jQuery extend now ignores nulls!
   @param  target  (object) the object to extend
   @param  props   (object) the new settings
   @return  (object) the updated target */
function extendRemove(target, props) {
	$.extend(target, props);
	for (var name in props) {
		if (props[name] == null || props[name] == undefined) {
			target[name] = props[name];
		}
	}
	return target;
}

/* Invoke the calculator functionality.
   @param  options  (string) a command, optionally followed by additional parameters or
                    (object) settings for attaching new calculator functionality
   @return  (object) the jQuery object */
$.fn.calculator = function(options) {
	var otherArgs = Array.prototype.slice.call(arguments, 1);
	if (options == 'isDisabled') {
		return $.calculator['_' + options + 'Calculator'].
			apply($.calculator, [this[0]].concat(otherArgs));
	}
	return this.each(function() {
		typeof options == 'string' ?
			$.calculator['_' + options + 'Calculator'].
				apply($.calculator, [this].concat(otherArgs)) :
			$.calculator._attachCalculator(this, options);
	});
};

$.calculator = new Calculator(); // singleton instance

// Add the calculator division and external click check
$(function() {
	$(document.body).append($.calculator.mainDiv).
		mousedown($.calculator._checkExternalClick);
});

})(jQuery);
