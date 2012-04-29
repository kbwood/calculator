/* http://keith-wood.name/calculator.html
   Calculator field entry extension for jQuery v1.0.1.
   Written by Keith Wood (kbwood@virginbroadband.com.au) October 2008.
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
	this._disabledInputs = []; // List of calculator inputs that have been disabled
	this._calculatorShowing = false; // True if the popup panel is showing , false if not
	this._mainDivId = 'calculator-div'; // The ID of the main calculator division
	this._appendClass = 'calculator-append'; // The name of the append marker class
	this._triggerClass = 'calculator-trigger'; // The name of the trigger marker class
	this._coverClass = 'calculator-cover'; // The name of the IE select cover marker class
	this._uuid = new Date().getTime();
	this.digit = 'd';
	this.binary = 'b';
	this.unary = 'u';
	this.control = 'c';
	this.space = 's';
	this._keyDefs = {
		'_0': ['0', this.digit, '', '', '0', '0'],
		'_1': ['1', this.digit, '', '', '1', '1'],
		'_2': ['2', this.digit, '', '', '2', '2'],
		'_3': ['3', this.digit, '', '', '3', '3'],
		'_4': ['4', this.digit, '', '', '4', '4'],
		'_5': ['5', this.digit, '', '', '5', '5'],
		'_6': ['6', this.digit, '', '', '6', '6'],
		'_7': ['7', this.digit, '', '', '7', '7'],
		'_8': ['8', this.digit, '', '', '8', '8'],
		'_9': ['9', this.digit, '', '', '9', '9'],
		'_A': ['A', this.digit, '', 'hex-digit', 'A', 'a'],
		'_B': ['B', this.digit, '', 'hex-digit', 'B', 'b'],
		'_C': ['C', this.digit, '', 'hex-digit', 'C', 'c'],
		'_D': ['D', this.digit, '', 'hex-digit', 'D', 'd'],
		'_E': ['E', this.digit, '', 'hex-digit', 'E', 'e'],
		'_F': ['F', this.digit, '', 'hex-digit', 'F', 'f'],
		'_.': ['.', this.digit, '', 'decimal', 'DECIMAL', '.'],
		'_+': ['+', this.binary, '._add', 'arith add', 'ADD', '+'],
		'_-': ['-', this.binary, '._subtract', 'arith subtract', 'SUBTRACT', '-'],
		'_*': ['*', this.binary, '._multiply', 'arith multiply', 'MULTIPLY', '*'],
		'_/': ['/', this.binary, '._divide', 'arith divide', 'DIVIDE', '/'],
		'_%': ['%', this.unary, '._percent', 'arith percent', 'PERCENT', '%'],
		'_=': ['=', this.unary, '._equals', 'arith equals', 'EQUALS', '='],
		'PI': ['pi', this.unary, '._pi', 'pi', 'PI', 'p'],
		'+-': ['±', this.unary, '._plusMinus', 'arith plus-minus', 'PLUS_MINUS', '#'],
		'1X': ['1/x', this.unary, '._inverse', 'inverse', 'INV', 'i'],
		'LG': ['log', this.unary, '._log', 'log', 'LOG', 'l'],
		'LN': ['ln', this.unary, '._ln', 'ln', 'LN', 'n'],
		'EX': ['eⁿ', this.unary, '._exp', 'exp', 'EXP', 'E'],
		'SQ': ['x²', this.unary, '._sqr', 'sqr', 'SQR', '@'],
		'SR': ['√', this.unary, '._sqrt', 'sqrt', 'SQRT', '!'],
		'XY': ['x^y', this.binary, '._power', 'power', 'POWER', '^'],
		'RN': ['rnd', this.unary, '._random', 'random', 'RANDOM', '?'],
		'SN': ['sin', this.unary, '._sin', 'trig sin', 'SIN', 's'],
		'CS': ['cos', this.unary, '._cos', 'trig cos', 'COS', 'o'],
		'TN': ['tan', this.unary, '._tan', 'trig tan', 'TAN', 't'],
		'AS': ['asin', this.unary, '._asin', 'trig asin', 'ASIN', 'S'],
		'AC': ['acos', this.unary, '._acos', 'trig acos', 'ACOS', 'O'],
		'AT': ['atan', this.unary, '._atan', 'trig atan', 'ATAN', 'T'],
		'MC': ['#memClear', this.unary, '._memClear', 'memory mem-clear', 'MEM_CLEAR', 'x'],
		'MR': ['#memRecall', this.unary, '._memRecall', 'memory mem-recall', 'MEM_RECALL', 'r'],
		'MS': ['#memStore', this.unary, '._memStore', 'memory mem-store', 'MEM_STORE', 'm'],
		'M+': ['#memAdd', this.unary, '._memAdd', 'memory mem-add', 'MEM_ADD', '>'],
		'M-': ['#memSubtract', this.unary, '._memSubtract', 'memory mem-subtract', 'MEM_SUBTRACT', '<'],
		'BB': ['#base2', this.control, '._base2', 'base base2', 'BASE_2', 'B'],
		'BO': ['#base8', this.control, '._base8', 'base base8', 'BASE_8', 'C'],
		'BD': ['#base10', this.control, '._base10', 'base base10', 'BASE_10', 'D'],
		'BH': ['#base16', this.control, '._base16', 'base base16', 'BASE_16', 'H'],
		'DG': ['#degrees', this.control, '._degrees', 'angle degrees', 'DEGREES', 'G'],
		'RD': ['#radians', this.control, '._radians', 'angle radians', 'RADIANS', 'R'],
		'BS': ['#backspace', this.control, '._undo', 'undo', 'UNDO', 8], // backspace
		'CE': ['#clearError', this.control, '._clearError', 'clear-error', 'CLEAR_ERROR', 36], // home
		'CA': ['#clear', this.control, '._clear', 'clear', 'CLEAR', 35], // end
		'@X': ['#close', this.control, '._close', 'close', 'CLOSE', 27], // escape
		'@U': ['#use', this.control, '._use', 'use', 'USE', 13], // enter
		'@E': ['#erase', this.control, '._erase', 'erase', 'ERASE', 46], // delete
		'  ': ['', this.space, '', 'space', 'SPACE'],
		'_ ': ['', this.space, '', 'half-space', 'HALF_SPACE'],
		'??': ['??', this.unary, '._noOp']
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
	this.standardLayout = ['  BSCECA', '_1_2_3_+@X', '_4_5_6_-@U', '_7_8_9_*@E', '_0_._=_/'];
	this.scientificLayout = ['@X@U@E  BSCECA', 'DGRD    _ MC_ _7_8_9_+', 'SNASSRLG_ MR_ _4_5_6_-',
		'CSACSQLN_ MS_ _1_2_3_*', 'TNATXYEX_ M+_ _0_.+-_/', 'PIRN1X  _ M-_   _%_='];
	this.regional = []; // Available regional settings, indexed by language code
	this.regional[''] = { // Default regional settings
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
		showOn: 'focus', // 'focus' for popup on focus,
			// 'button' for trigger button, or 'both' for either
		buttonImage: '', // URL for trigger button image
		buttonImageOnly: false, // True if the image appears alone, false if it appears on a button
		showAnim: 'show', // Name of jQuery animation for popup
		showOptions: {}, // Options for enhanced animations
		duration: 'normal', // Duration of display/closure
		appendText: '', // Display text following the input box, e.g. showing the format
		calculatorClass: '', // Additional CSS class for the calculator for an instance
		prompt: '', // Text across the top of the calculator
		layout: this.standardLayout, // Layout of keys
		base: 10, // The numeric base for calculations
		precision: 10, // The number of digits of precision to use in rounding for display
		useDegrees: false, // True to use degress for trigonometric functions, false for radians
		onButton: null, // Define a callback function when a button is activated
		onClose: null // Define a callback function when the panel is closed
	};
	$.extend(this._defaults, this.regional['']);
	this.mainDiv = $('<div id="' + this._mainDivId + '" style="display: none;"></div>');
}

$.extend(Calculator.prototype, {
	/* Class name added to elements to indicate already configured with calculator. */
	markerClassName: 'hasCalculator',

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
	   @param  func       (string) the full name of the function that applies this key
	                       it is expected to take a parameter of the current instance
	   @param  style      (string, optional) any additional CSS styles for this key
	   @param  constant   (string, optional) the name of a constant to create for this key
	   @param  keystroke  (char or number) the character or key code of the keystroke for this key
	   @return  (object) the calculator object for chaining further calls */
	addKeyDef: function(code, label, type, func, style, constant, keystroke) {
		this._keyDefs[code] = [label, (typeof type == 'boolean' ?
			(type ? this.binary : this.unary) : type), func, style, constant, keystroke];
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
	   @param  target    (element) the target input field
	   @param  settings  (object) the new settings to use for this instance */
	_attachCalculator: function(target, settings) {
		if (!target.id) {
			target.id = 'ca' + ++this._uuid;
		}
		var id = target.id.replace(/([:\[\]\.])/g, '\\\\$1'); // escape jQuery meta chars
		var inst = {_id: id, _input: $(target), _mainDiv: $.calculator.mainDiv};
		inst.settings = $.extend({}, settings || {}); 
		this._connectCalculator(target, inst);
	},

	/* Attach the calculator to an input field.
	   @param  target  (element) the target input field
	   @param  inst    (object) the instance settings */
	_connectCalculator: function(target, inst) {
		var input = $(target);
		if (input.hasClass(this.markerClassName)) {
			return;
		}
		var appendText = this._get(inst, 'appendText');
		var isRTL = this._get(inst, 'isRTL');
		if (appendText) {
			input[isRTL ? 'before' : 'after'](
				'<span class="' + this._appendClass + '">' + appendText + '</span>');
		}
		var showOn = this._get(inst, 'showOn');
		if (showOn == 'focus' || showOn == 'both') { // pop-up calculator when in the marked field
			input.focus(this._showCalculator);
		}
		if (showOn == 'button' || showOn == 'both') { // pop-up calculator when button clicked
			var buttonText = this._get(inst, 'buttonText');
			var buttonStatus = this._get(inst, 'buttonStatus');
			var buttonImage = this._get(inst, 'buttonImage');
			var trigger = $(this._get(inst, 'buttonImageOnly') ? 
				$('<img/>').attr(
					{src: buttonImage, alt: buttonStatus, title: buttonStatus}) :
				$('<button type="button" title="' + buttonStatus + '"></button>').
					html(buttonImage == '' ? buttonText :
					$('<img/>').attr({src: buttonImage})));
			input[isRTL ? 'before' : 'after'](trigger);
			trigger.addClass(this._triggerClass).click(function() {
				if ($.calculator._calculatorShowing && $.calculator._lastInput == target) {
					$.calculator._hideCalculator();
				}
				else {
					$.calculator._showCalculator(target);
				}
				return false;
			});
		}
		input.addClass(this.markerClassName).
			keydown(this._doKeyDown).keypress(this._doKeyPress).
			bind("setData.calculator", function(event, key, value) {
				inst.settings[key] = value;
			}).bind("getData.calculator", function(event, key) {
				return this._get(inst, key);
			});
		$.data(target, PROP_NAME, inst);
	},

	/* Detach calculator from its control.
	   @param  target  (element) the target input field */
	_destroyCalculator: function(target) {
		var $target = $(target);
		if (!$target.hasClass(this.markerClassName)) {
			return;
		}
		var inst = $.data(target, PROP_NAME);
		$target.siblings('.' + this._appendClass).remove().end().
			siblings('.' + this._triggerClass).remove().end().
			removeClass(this.markerClassName).
			unbind('focus', this._showCalculator).
			unbind('keydown', this._doKeyDown).
			unbind('keypress', this._doKeyPress);
		$.removeData(target, PROP_NAME);
	},

	/* Enable the calculator for a jQuery selection.
	   @param  target  (element) the target input field */
	_enableCalculator: function(target) {
		var $target = $(target);
		if (!$target.hasClass(this.markerClassName)) {
			return;
		}
		target.disabled = false;
		$target.siblings('button.' + this._triggerClass).
		each(function() { this.disabled = false; }).end().
			siblings('img.' + this._triggerClass).
			css({opacity: '1.0', cursor: ''});
		this._disabledInputs = $.map(this._disabledInputs,
			function(value) { return (value == target ? null : value); }); // delete entry
	},

	/* Disable the calculator for a jQuery selection.
	   @param  target  (element) the target input field */
	_disableCalculator: function(target) {
		var $target = $(target);
		if (!$target.hasClass(this.markerClassName)) {
			return;
		}
		target.disabled = true;
		$target.siblings('button.' + this._triggerClass).
			each(function() { this.disabled = true; }).end().
			siblings('img.' + this._triggerClass).
			css({opacity: '0.5', cursor: 'default'});
		this._disabledInputs = $.map(this._disabledInputs,
			function(value) { return (value == target ? null : value); }); // delete entry
		this._disabledInputs[this._disabledInputs.length] = target;
	},

	/* Is the input field disabled as a calculator?
	   @param  target  (element) the target input field
	   @return  (boolean) true if disabled, false if enabled */
	_isDisabledCalculator: function(target) {
		return (target && $.inArray(target, this._disabledInputs) > -1);
	},

	/* Update the settings for calculator attached to an input field
	   @param  target  (element) the target input field
	   @param  name    (object) the new settings to update or
	                   (string) the name of the setting to change or
	   @param  value   (any) the new value for the setting (omit if above is an object) */
	_changeCalculator: function(target, name, value) {
		var settings = name || {};
		if (typeof name == 'string') {
			settings = {};
			settings[name] = value;
		}
		if (inst = $.data(target, PROP_NAME)) {
			if (this._curInst == inst) {
				this._hideCalculator(null);
			}
			extendRemove(inst.settings, settings);
			this._updateCalculator(inst);
		}
	},

	/* Pop-up the calculator for a given input field.
	   @param  input  (element) the input field attached to the calculator or
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
		$.calculator._reset(inst, inst._input.val(), true);
		$.calculator._updateCalculator(inst);
		// and adjust position before showing
		offset = $.calculator._checkOffset(inst, offset, isFixed);
		inst._mainDiv.css({position: (isFixed ? 'fixed' : 'absolute'), display: 'none',
			left: offset.left + 'px', top: offset.top + 'px'});
		var showAnim = $.calculator._get(inst, 'showAnim') || 'show';
		var duration = $.calculator._get(inst, 'duration');
		var postProcess = function() {
			$.calculator._calculatorShowing = true;
			if ($.browser.msie && parseInt($.browser.version) < 7) { // fix IE < 7 select problems
				$('iframe.' + $.calculator._coverClass).css({
					width: inst._mainDiv.width() + 4, height: inst._mainDiv.height() + 4});
			}
		};
		if ($.effects && $.effects[showAnim]) {
			inst._mainDiv.show(showAnim, $.calculator._get(inst, 'showOptions'), duration, postProcess);
		}
		else {
			inst._mainDiv[showAnim](duration, postProcess);
		}
		if (duration == '') {
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
		inst.curValue = (base == 10 ? parseFloat(value) : parseInt(value, base)) || 0;
		inst.dispValue = inst.curValue.toString(base).toUpperCase();
		inst.prevValue = 0;
		inst.memory = (clearMem ? 0 : inst.memory);
		inst._pendingOp = this._noOp;
		inst._savedOp = this._noOp;
		inst._savedValue = 0;
		inst._newValue = true;
	},

	/* Generate the calculator content.
	   @param  inst  (object) the instance settings */
	_updateCalculator: function(inst) {
		var dims = {width: inst._mainDiv.width() + 4,
			height: inst._mainDiv.height() + 4};
		inst._mainDiv.html(this._generateHTML(inst)).
			find('iframe.' + $.calculator._coverClass).
			css({width: dims.width, height: dims.height});
		inst._mainDiv.removeClass().addClass(this._get(inst, 'calculatorClass') +
			(this._get(inst, 'isRTL') ? ' calculator-rtl' : ''));
		if (this._curInst == inst) {
			inst._input.focus();
		}
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
		if ($.browser.opera) { // recalculate width as otherwise set to 100%
			var width = 0;
			$('.calculator-row', inst._mainDiv).find('button:last').each(function() {
				width = Math.max(width, this.offsetLeft + this.offsetWidth +
					parseInt($(this).css('margin-right')));
			});
			inst._mainDiv.css('width', width);
		}
		// reposition calculator panel horizontally if outside the browser window
		if (this._get(inst, 'isRTL') || (offset.left + inst._mainDiv.width() - scrollX) > browserWidth) {
			offset.left = Math.max((isFixed ? 0 : scrollX),
				pos[0] + (inst._input ? inst._input.width() : 0) - (isFixed ? scrollX : 0) - inst._mainDiv.width() -
				(isFixed && $.browser.opera ? document.documentElement.scrollLeft : 0));
		}
		else {
			offset.left -= (isFixed ? scrollX : 0);
		}
		// reposition calculator panel vertically if outside the browser window
		if ((offset.top + inst._mainDiv.height() - scrollY) > browserHeight) {
			offset.top = Math.max((isFixed ? 0 : scrollY),
				pos[1] - (isFixed ? scrollY : 0) - (this._inDialog ? 0 : inst._mainDiv.height()) -
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
	   @param  input     (element) the input field attached to the calculator
	   @param  duration  (string) the duration over which to close the calculator */
	_hideCalculator: function(input, duration) {
		var inst = this._curInst;
		if (!inst || (input && inst != $.data(input, PROP_NAME))) {
			return;
		}
		if (this._calculatorShowing) {
			duration = (duration != null ? duration : this._get(inst, 'duration'));
			var showAnim = this._get(inst, 'showAnim');
			if (duration != '' && $.effects && $.effects[showAnim]) {
				inst._mainDiv.hide(showAnim, $.calculator._get(inst, 'showOptions'),
					duration);
			}
			else {
				inst._mainDiv[(duration == '' ? 'hide' : (showAnim == 'slideDown' ? 'slideUp' :
					(showAnim == 'fadeIn' ? 'fadeOut' : 'hide')))](duration);
			}
			var onClose = this._get(inst, 'onClose');
			if (onClose) {
				onClose.apply((inst._input ? inst._input[0] : null),
					[inst._input.val(), inst]);  // trigger custom callback
			}
			this._calculatorShowing = false;
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
		if (target[0].id != $.calculator._mainDivId &&
				target.parents('#' + $.calculator._mainDivId).length == 0 &&
				!target.hasClass($.calculator.markerClassName) &&
				!target.hasClass($.calculator._triggerClass) &&
				$.calculator._calculatorShowing) {
			$.calculator._hideCalculator(null, '');
		}
	},

	/* Handle keystrokes. */
	_doKeyDown: function(e) {
		var handled = false;
		if ($.calculator._calculatorShowing) {
			var inst = $.data(e.target, this.PROP_NAME);
			var code = $.calculator._keyCodes[e.keyCode];
			if (code) {
				$('button[keystroke=' + code + ']', inst._mainDiv).not(':disabled').click();
				handled = true;
			}
		}
		else if (e.keyCode == 36 && e.ctrlKey) { // display the date picker on ctrl+home
			$.calculator._showCalculator(this);
		}
		if (handled) {
			e.preventDefault();
			e.stopPropagation();
		}
	},

	/* Convert characters into button clicks.
	   @param  e  (event) the key event
	   @return  true if keystroke allowed, false if not */
	_doKeyPress: function(e) {
		if ($.calculator._calculatorShowing) {
			var chr = String.fromCharCode(e.charCode || e.keyCode);
			var inst = $.data(e.target, this.PROP_NAME);
			var code = $.calculator._keyChars[chr];
			if (code) {
				$('button[keystroke=' + code + ']', inst._mainDiv).not(':disabled').click();
			}
			return false;
		}
		return true;
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
			'<div class="calculator-result">' + inst.dispValue + '</div>';
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
					'<button type="button" keystroke="' + code + '" ' +
					'onmousedown="jQuery(this).addClass(\'calculator-key-down\')" ' +
					'onmouseup="jQuery(this).removeClass(\'calculator-key-down\')" ' +
					'onmouseout="jQuery(this).removeClass(\'calculator-key-down\')" onclick="' +
					// Control buttons
					(def[1] == this.control ? (def[2].charAt(0) == '.' ? '$.calculator' : '') + def[2] +
					'(\'' + inst._id + '\', \'' + label + '\')" class="calculator-ctrl' +
					(def[0].replace(/^#base/, '') == base ? ' calculator-base-active' : '') +
					(def[0] == '#degrees' && useDegrees ? ' calculator-angle-active' : '') +
					(def[0] == '#radians' && !useDegrees ? ' calculator-angle-active' : '') :
					// Digits
					(def[1] == this.digit ? '$.calculator._digit(\'' +
					inst._id + '\', \'' + def[0] + '\')"' +
					(parseInt(def[0], 16) >= base || (base != 10 && def[0] == '.') ?
					' disabled="disabled"' : '') + ' class="calculator-digit' :
					// Binary operations
					(def[1] == this.binary ? '$.calculator._binaryOp(\'' + inst._id + '\', ' +
					(def[2].charAt(0) == '.' ? '$.calculator' : '') + def[2] + ', \'' +
					label + '\')" class="calculator-oper' :
					// Unary operations
					'$.calculator._unaryOp(\'' + inst._id + '\', ' +
					(def[2].charAt(0) == '.' ? '$.calculator' : '') + def[2] + ', \'' +
					label + '\')" class="calculator-oper' +
					(def[0].match(/^#mem(Clear|Recall)$/) && !inst.memory ? ' calculator-mem-empty' : '')))) +
					// Common
					(styles ? ' ' + styles : '') + '" ' + (status ? 'title="' + status + '"' : '') +
					'>' + label + '</button>');
			}
			html += '</div>';
		}
		html += '<div style="clear: both;"></div>' + 
			($.browser.msie && parseInt($.browser.version) < 7 ? 
			'<iframe src="javascript:false;" class="' + $.calculator._coverClass + '"></iframe>' : '');
		return html;
	},

	/* Retrieve the instance settings for a calculator.
	   @param  inst  (string) the id of the calculator input field or
	                 (object) the actual instance object
	   @return  (object) the instance object */
	_getInst: function(inst) {
		return (typeof inst == 'object' ? inst : $.data($('#' + inst)[0], PROP_NAME));
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

	_noOp: function(inst) {
	},

	/* Add a digit to the number in the calculator.
	   @param  inst   (object) the instance settings
	   @param  digit  (string) the digit to append */
	_digit: function(inst, digit) {
		inst = $.calculator._getInst(inst);
		if (digit == '.' && inst.dispValue.indexOf(digit) > -1) {
			return;
		}
		inst.dispValue = ((inst._newValue ? '' : inst.dispValue) + digit).
			replace(/^0(\d)/, '$1').replace(/^\./, '0.');
		var base = $.calculator._get(inst, 'base');
		inst.curValue = (base == 10 ? parseFloat(inst.dispValue) : parseInt(inst.dispValue, base));
		inst._newValue = false;
		$.calculator._sendButton(inst, digit);
		$.calculator._updateCalculator(inst);
	},

	/* Tidy the result to avoid JavaScript rounding errors.
	   @param  value      (number) the number to tidy
	   @param  precision  (number) the number of digits of precision to use */
	_tidy: function(value, precision) {
		var fixed = new Number(value).toFixed(precision).valueOf(); // Round to 14 digits precision
		var exp = fixed.replace(/^.+(e.+)$/, '$1').replace(/^[^e].*$/, ''); // Extract exponent
		if (exp) {
			fixed = new Number(fixed.replace(/e.+$/, '')).toFixed(precision).valueOf(); // Round mantissa
		}
		return parseFloat(fixed.replace(/0+$/, '') + exp); // Recombine
	},

	/* Save a binary operation for later use.
	   @param  inst   (object) the instance settings
	   @param  op     (function) the binary function
	   @param  label  (string) the button label */
	_binaryOp: function(inst, op, label) {
		inst = $.calculator._getInst(inst);
		if (!inst._newValue && inst._pendingOp) {
			inst._pendingOp(inst);
			var base = $.calculator._get(inst, 'base');
			inst.curValue = (base == 10 ? inst.curValue : Math.floor(inst.curValue));
			inst.dispValue = $.calculator._tidy(inst.curValue,
				$.calculator._get(inst, 'precision')).toString(base).toUpperCase();
		}
		inst.prevValue = inst.curValue;
		inst._newValue = true;
		inst._pendingOp = op;
		$.calculator._sendButton(inst, label);
		$.calculator._updateCalculator(inst);
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
		inst = $.calculator._getInst(inst);
		inst._newValue = true;
		op(inst);
		var base = $.calculator._get(inst, 'base');
		inst.curValue = (base == 10 ? inst.curValue : Math.floor(inst.curValue));
		inst.dispValue = $.calculator._tidy(inst.curValue,
			$.calculator._get(inst, 'precision')).toString(base).toUpperCase();
		$.calculator._sendButton(inst, label);
		$.calculator._updateCalculator(inst);
	},

	_plusMinus: function(inst) {
		inst.curValue = -1 * inst.curValue;
		inst.dispValue = inst.curValue.
			toString($.calculator._get(inst, 'base')).toUpperCase();
		inst._newValue = false;
	},

	_pi: function(inst) {
		inst.curValue = Math.PI;
	},

	/* Perform a percentage calculation.
	   @param  inst  (object) the instance settings */
	_percent: function(inst) {
		if (inst._pendingOp == $.calculator._add) {
			inst.curValue = inst.prevValue * (1 + inst.curValue / 100);
		}
		else if (inst._pendingOp == $.calculator._subtract) {
			inst.curValue = inst.prevValue * (1 - inst.curValue / 100);
		}
		else if (inst._pendingOp == $.calculator._multiply) {
			inst.curValue = inst.prevValue * inst.curValue / 100;
		}
		else if (inst._pendingOp == $.calculator._divide) {
			inst.curValue = inst.prevValue / inst.curValue * 100;
		}
		inst._savedOp = inst._pendingOp;
		inst._pendingOp = $.calculator._noOp;
	},

	/* Apply a pending binary operation.
	   @param  inst  (object) the instance settings */
	_equals: function(inst) {
		if (inst._pendingOp == $.calculator._noOp) {
			if (inst._savedOp != $.calculator._noOp) {
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
			inst._pendingOp = $.calculator._noOp;
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
		$.calculator._trig(inst, Math.sin);
	},

	_cos: function(inst) {
		$.calculator._trig(inst, Math.cos);
	},

	_tan: function(inst) {
		$.calculator._trig(inst, Math.tan);
	},

	_trig: function(inst, op) {
		var useDegrees = $.calculator._get(inst, 'useDegrees');
		inst.curValue = op(inst.curValue * (useDegrees ? Math.PI / 180 : 1));
	},

	_asin: function(inst) {
		$.calculator._atrig(inst, Math.asin);
	},

	_acos: function(inst) {
		$.calculator._atrig(inst, Math.acos);
	},

	_atan: function(inst) {
		$.calculator._atrig(inst, Math.atan);
	},

	_atrig: function(inst, op) {
		inst.curValue = op(inst.curValue);
		if ($.calculator._get(inst, 'useDegrees')) {
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
		$.calculator._changeBase(inst, label, 2);
	},

	_base8: function(inst, label) {
		$.calculator._changeBase(inst, label, 8);
	},

	_base10: function(inst, label) {
		$.calculator._changeBase(inst, label, 10);
	},

	_base16: function(inst, label) {
		$.calculator._changeBase(inst, label, 16);
	},

	/* Change the number base for the calculator.
	   @param  inst     (object) the instance settings
	   @param  label    (string) the button label
	   @param  newBase  (number) the new number base */
	_changeBase: function(inst, label, newBase) {
		inst = $.calculator._getInst(inst);
		inst.settings.base = newBase;
		inst.curValue = (newBase == 10 ? inst.curValue : Math.floor(inst.curValue));
		inst.dispValue = inst.curValue.toString(newBase).toUpperCase();
		inst._newValue = true;
		$.calculator._sendButton(inst, label);
		$.calculator._updateCalculator(inst);
	},

	_degrees: function(inst, label) {
		$.calculator._degreesRadians(inst, label, true);
	},

	_radians: function(inst, label) {
		$.calculator._degreesRadians(inst, label, false);
	},

	/* Swap between degrees and radians for trigonometric functions.
	   @param  inst        (object) the instance settings
	   @param  label       (string) the button label
	   @param  useDegrees  (boolean) true to use degrees, false for radians */
	_degreesRadians: function(inst, label, useDegrees) {
		inst = $.calculator._getInst(inst);
		inst.settings.useDegrees = useDegrees;
		$.calculator._sendButton(inst, label);
		$.calculator._updateCalculator(inst);
	},

	/* Erase the last digit entered.
	   @param  inst   (object) the instance settings
	   @param  label  (string) the button label */
	_undo: function(inst, label) {
		inst = $.calculator._getInst(inst);
		inst.dispValue = inst.dispValue.substr(0, inst.dispValue.length - 1) || '0';
		var base = $.calculator._get(inst, 'base');
		inst.curValue = (base == 10 ? parseFloat(inst.dispValue) : parseInt(inst.dispValue, base));
		$.calculator._sendButton(inst, label);
		$.calculator._updateCalculator(inst);
	},

	/* Erase the last number entered.
	   @param  inst   (object) the instance settings
	   @param  label  (string) the button label */
	_clearError: function(inst, label) {
		inst = $.calculator._getInst(inst);
		inst.dispValue = '0';
		inst.curValue = 0;
		inst._newValue = true;
		$.calculator._sendButton(inst, label);
		$.calculator._updateCalculator(inst);
	},

	/* Reset the calculator.
	   @param  inst   (object) the instance settings
	   @param  label  (string) the button label */
	_clear: function(inst, label) {
		inst = $.calculator._getInst(inst);
		$.calculator._reset(inst, 0, false);
		$.calculator._sendButton(inst, label);
		$.calculator._updateCalculator(inst);
	},

	/* Close the calculator without changing the value.
	   @param  inst   (object) the instance settings
	   @param  label  (string) the button label */
	_close: function(inst, label) {
		inst = $.calculator._getInst(inst);
		$.calculator._finished(inst, label, inst._input.val());
	},

	/* Copy the current value and close the calculator.
	   @param  inst   (object) the instance settings
	   @param  label  (string) the button label */
	_use: function(inst, label) {
		inst = $.calculator._getInst(inst);
		$.calculator._finished(inst, label, inst.dispValue);
	},

	/* Erase the field and close the calculator.
	   @param  inst   (object) the instance settings
	   @param  label  (string) the button label */
	_erase: function(inst, label) {
		inst = $.calculator._getInst(inst);
		$.calculator._finished(inst, label, '');
	},

	/* Finish with the calculator.
	   @param  inst   (object) the instance settings
	   @param  label  (string) the button label
	   @param  value  (string) the new field value */
	_finished: function(inst, label, value) {
		inst._input.val(value);
		$.calculator._sendButton(inst, label);
		$.calculator._hideCalculator(inst._input[0]);
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
};

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
