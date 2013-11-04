var is = {
	func: function (value) {
		return typeof value === 'function';
	},
	number: function (value) {
		return typeof value === 'number';
	},
	string: function (value) {
		return typeof value === 'string';
	},
	boolean: function (value) {
		return typeof value === 'boolean';
	},
	array: function (value) {
		return Object.prototype.toString.apply(value) === '[object Array]';
	},
	object: function (value) {
		return typeof value === 'object' && value && ! this.array(value);
	},
	null: function (value) {
		return value === null;
	}
};

Function.prototype.method = function (name, func) {
	if( ! this.prototype[name] ) {
		this.prototype[name] = func;
		return this;
	}
};

Function.method('bind', function (that) {
	var method = this,
		slice = Array.prototype.slice,
		args = slice.apply(arguments, [1]);

	return function () {
		return method.apply(that,
			args.concat(slice.apply(arguments,
				[0])));
	};
});

Function.method('delay', function (delay) {
	delay = is.number(delay) ? delay : 1000;
	var timeOut = 0;
	var that = this;
	return function() {
		var args = Array.prototype.slice.apply(arguments);
		clearTimeout(timeOut);
		timeOut = setTimeout(function () {
			that.apply(null, args);
		}, delay);
	};
});

Object.method('create', function (obj) {
	var Func = function () {};

	Func.prototype = obj;
	return new Func();
});

Object.method('forEach', function (handler) {
	var k;

	for(k in this) {
		if(this.hasOwnProperty(k)) {
			if(is.func(handler)) handler.apply(this, [this[k], k]);
		}
	}

	return this;
});

Array.method('forEach', function (handler) {
	var i, len = this.length;

	for (i = 0; i < len; i++) {
		if(is.func(handler)) handler.apply(this, [this[i], i]);
	}

	return this;
});

Number.method('integer', function () {
	return Math[this < 0 ? 'ceil' : 'floor'](this);
});

RegExp.method('test', function (string) {
	return this.exec(string) !== null;
});

String.method('trim', function () {
	return this.replace(/^\s+|\s+$/g, '');
});

String.method('toInt', function (radix) {
	radix = is.number(radix) ? radix : 10;
	return parseInt(this, radix);
});

String.method('toProperCase', function () {
	return this.replace(/\w\S*/g, function (txt) {
		return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
	});
});


var by = function (name) {
	var minor, order, caseSensitive;

	minor = is.func(arguments[1]) ?
		arguments[1] : null;
	order = is.string(arguments[1]) ?
		arguments[1] : is.string(arguments[2]) ?
		arguments[2] : 'asc';
	caseSensitive = is.boolean(arguments[1]) ?
		arguments[1] : is.boolean(arguments[2]) ?
		arguments[2] : is.boolean(arguments[3]) ?
		arguments[3] : false;

	if(order !== 'asc' && order !== 'desc') {
		throw {
			name: 'Error',
			message: 'Expected \'asc\' or \'desc\' for sorting direction'
		};
	}

	return function (o, p) {
		var a, b;
		if(o && p && typeof o === 'object' && typeof p === 'object') {
			a = typeof o[name] !== 'string' ?
				o[name] : caseSensitive ?
				o[name] : o[name].toLowerCase();
			b = typeof p[name] !== 'string' ?
				p[name] : caseSensitive ?
				p[name] : p[name].toLowerCase();

			if(a === b) {
				return is.func(minor) ? minor(o, p) : 0;
			}

			if(typeof a === typeof b) {
				if(order === 'asc') {
					return a < b ? -1 : 1;
				} else {
					return a < b ? 1 : -1;
				}
			}

			if(order === 'asc') {
				return typeof a < typeof b ? -1 : 1;
			} else {
				return typeof a < typeof b ? 1 : -1;
			}
		} else {
			throw {
				name: 'Error',
				message: 'Expected an object when sorting by ' + name
			};
		}
	};
};