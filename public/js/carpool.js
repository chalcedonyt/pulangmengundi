webpackJsonp([1],{

/***/ 112:
/***/ (function(module, exports) {

/* (ignored) */

/***/ }),

/***/ 113:
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* jslint esnext: true */


var src$core$$ = __webpack_require__(114), src$en$$ = __webpack_require__(119);

src$core$$["default"].__addLocaleData(src$en$$["default"]);
src$core$$["default"].defaultLocale = 'en';

exports["default"] = src$core$$["default"];

//# sourceMappingURL=main.js.map

/***/ }),

/***/ 114:
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*
Copyright (c) 2014, Yahoo! Inc. All rights reserved.
Copyrights licensed under the New BSD License.
See the accompanying LICENSE file for terms.
*/

/* jslint esnext: true */


var src$utils$$ = __webpack_require__(52), src$es5$$ = __webpack_require__(115), src$compiler$$ = __webpack_require__(116), intl$messageformat$parser$$ = __webpack_require__(117);
exports["default"] = MessageFormat;

// -- MessageFormat --------------------------------------------------------

function MessageFormat(message, locales, formats) {
    // Parse string messages into an AST.
    var ast = typeof message === 'string' ?
            MessageFormat.__parse(message) : message;

    if (!(ast && ast.type === 'messageFormatPattern')) {
        throw new TypeError('A message must be provided as a String or AST.');
    }

    // Creates a new object with the specified `formats` merged with the default
    // formats.
    formats = this._mergeFormats(MessageFormat.formats, formats);

    // Defined first because it's used to build the format pattern.
    src$es5$$.defineProperty(this, '_locale',  {value: this._resolveLocale(locales)});

    // Compile the `ast` to a pattern that is highly optimized for repeated
    // `format()` invocations. **Note:** This passes the `locales` set provided
    // to the constructor instead of just the resolved locale.
    var pluralFn = this._findPluralRuleFunction(this._locale);
    var pattern  = this._compilePattern(ast, locales, formats, pluralFn);

    // "Bind" `format()` method to `this` so it can be passed by reference like
    // the other `Intl` APIs.
    var messageFormat = this;
    this.format = function (values) {
      try {
        return messageFormat._format(pattern, values);
      } catch (e) {
        if (e.variableId) {
          throw new Error(
            'The intl string context variable \'' + e.variableId + '\'' +
            ' was not provided to the string \'' + message + '\''
          );
        } else {
          throw e;
        }
      }
    };
}

// Default format options used as the prototype of the `formats` provided to the
// constructor. These are used when constructing the internal Intl.NumberFormat
// and Intl.DateTimeFormat instances.
src$es5$$.defineProperty(MessageFormat, 'formats', {
    enumerable: true,

    value: {
        number: {
            'currency': {
                style: 'currency'
            },

            'percent': {
                style: 'percent'
            }
        },

        date: {
            'short': {
                month: 'numeric',
                day  : 'numeric',
                year : '2-digit'
            },

            'medium': {
                month: 'short',
                day  : 'numeric',
                year : 'numeric'
            },

            'long': {
                month: 'long',
                day  : 'numeric',
                year : 'numeric'
            },

            'full': {
                weekday: 'long',
                month  : 'long',
                day    : 'numeric',
                year   : 'numeric'
            }
        },

        time: {
            'short': {
                hour  : 'numeric',
                minute: 'numeric'
            },

            'medium':  {
                hour  : 'numeric',
                minute: 'numeric',
                second: 'numeric'
            },

            'long': {
                hour        : 'numeric',
                minute      : 'numeric',
                second      : 'numeric',
                timeZoneName: 'short'
            },

            'full': {
                hour        : 'numeric',
                minute      : 'numeric',
                second      : 'numeric',
                timeZoneName: 'short'
            }
        }
    }
});

// Define internal private properties for dealing with locale data.
src$es5$$.defineProperty(MessageFormat, '__localeData__', {value: src$es5$$.objCreate(null)});
src$es5$$.defineProperty(MessageFormat, '__addLocaleData', {value: function (data) {
    if (!(data && data.locale)) {
        throw new Error(
            'Locale data provided to IntlMessageFormat is missing a ' +
            '`locale` property'
        );
    }

    MessageFormat.__localeData__[data.locale.toLowerCase()] = data;
}});

// Defines `__parse()` static method as an exposed private.
src$es5$$.defineProperty(MessageFormat, '__parse', {value: intl$messageformat$parser$$["default"].parse});

// Define public `defaultLocale` property which defaults to English, but can be
// set by the developer.
src$es5$$.defineProperty(MessageFormat, 'defaultLocale', {
    enumerable: true,
    writable  : true,
    value     : undefined
});

MessageFormat.prototype.resolvedOptions = function () {
    // TODO: Provide anything else?
    return {
        locale: this._locale
    };
};

MessageFormat.prototype._compilePattern = function (ast, locales, formats, pluralFn) {
    var compiler = new src$compiler$$["default"](locales, formats, pluralFn);
    return compiler.compile(ast);
};

MessageFormat.prototype._findPluralRuleFunction = function (locale) {
    var localeData = MessageFormat.__localeData__;
    var data       = localeData[locale.toLowerCase()];

    // The locale data is de-duplicated, so we have to traverse the locale's
    // hierarchy until we find a `pluralRuleFunction` to return.
    while (data) {
        if (data.pluralRuleFunction) {
            return data.pluralRuleFunction;
        }

        data = data.parentLocale && localeData[data.parentLocale.toLowerCase()];
    }

    throw new Error(
        'Locale data added to IntlMessageFormat is missing a ' +
        '`pluralRuleFunction` for :' + locale
    );
};

MessageFormat.prototype._format = function (pattern, values) {
    var result = '',
        i, len, part, id, value, err;

    for (i = 0, len = pattern.length; i < len; i += 1) {
        part = pattern[i];

        // Exist early for string parts.
        if (typeof part === 'string') {
            result += part;
            continue;
        }

        id = part.id;

        // Enforce that all required values are provided by the caller.
        if (!(values && src$utils$$.hop.call(values, id))) {
          err = new Error('A value must be provided for: ' + id);
          err.variableId = id;
          throw err;
        }

        value = values[id];

        // Recursively format plural and select parts' option — which can be a
        // nested pattern structure. The choosing of the option to use is
        // abstracted-by and delegated-to the part helper object.
        if (part.options) {
            result += this._format(part.getOption(value), values);
        } else {
            result += part.format(value);
        }
    }

    return result;
};

MessageFormat.prototype._mergeFormats = function (defaults, formats) {
    var mergedFormats = {},
        type, mergedType;

    for (type in defaults) {
        if (!src$utils$$.hop.call(defaults, type)) { continue; }

        mergedFormats[type] = mergedType = src$es5$$.objCreate(defaults[type]);

        if (formats && src$utils$$.hop.call(formats, type)) {
            src$utils$$.extend(mergedType, formats[type]);
        }
    }

    return mergedFormats;
};

MessageFormat.prototype._resolveLocale = function (locales) {
    if (typeof locales === 'string') {
        locales = [locales];
    }

    // Create a copy of the array so we can push on the default locale.
    locales = (locales || []).concat(MessageFormat.defaultLocale);

    var localeData = MessageFormat.__localeData__;
    var i, len, localeParts, data;

    // Using the set of locales + the default locale, we look for the first one
    // which that has been registered. When data does not exist for a locale, we
    // traverse its ancestors to find something that's been registered within
    // its hierarchy of locales. Since we lack the proper `parentLocale` data
    // here, we must take a naive approach to traversal.
    for (i = 0, len = locales.length; i < len; i += 1) {
        localeParts = locales[i].toLowerCase().split('-');

        while (localeParts.length) {
            data = localeData[localeParts.join('-')];
            if (data) {
                // Return the normalized locale string; e.g., we return "en-US",
                // instead of "en-us".
                return data.locale;
            }

            localeParts.pop();
        }
    }

    var defaultLocale = locales.pop();
    throw new Error(
        'No locale data has been added to IntlMessageFormat for: ' +
        locales.join(', ') + ', or the default locale: ' + defaultLocale
    );
};

//# sourceMappingURL=core.js.map

/***/ }),

/***/ 115:
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*
Copyright (c) 2014, Yahoo! Inc. All rights reserved.
Copyrights licensed under the New BSD License.
See the accompanying LICENSE file for terms.
*/

/* jslint esnext: true */


var src$utils$$ = __webpack_require__(52);

// Purposely using the same implementation as the Intl.js `Intl` polyfill.
// Copyright 2013 Andy Earnshaw, MIT License

var realDefineProp = (function () {
    try { return !!Object.defineProperty({}, 'a', {}); }
    catch (e) { return false; }
})();

var es3 = !realDefineProp && !Object.prototype.__defineGetter__;

var defineProperty = realDefineProp ? Object.defineProperty :
        function (obj, name, desc) {

    if ('get' in desc && obj.__defineGetter__) {
        obj.__defineGetter__(name, desc.get);
    } else if (!src$utils$$.hop.call(obj, name) || 'value' in desc) {
        obj[name] = desc.value;
    }
};

var objCreate = Object.create || function (proto, props) {
    var obj, k;

    function F() {}
    F.prototype = proto;
    obj = new F();

    for (k in props) {
        if (src$utils$$.hop.call(props, k)) {
            defineProperty(obj, k, props[k]);
        }
    }

    return obj;
};

exports.defineProperty = defineProperty, exports.objCreate = objCreate;

//# sourceMappingURL=es5.js.map

/***/ }),

/***/ 116:
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*
Copyright (c) 2014, Yahoo! Inc. All rights reserved.
Copyrights licensed under the New BSD License.
See the accompanying LICENSE file for terms.
*/

/* jslint esnext: true */


exports["default"] = Compiler;

function Compiler(locales, formats, pluralFn) {
    this.locales  = locales;
    this.formats  = formats;
    this.pluralFn = pluralFn;
}

Compiler.prototype.compile = function (ast) {
    this.pluralStack        = [];
    this.currentPlural      = null;
    this.pluralNumberFormat = null;

    return this.compileMessage(ast);
};

Compiler.prototype.compileMessage = function (ast) {
    if (!(ast && ast.type === 'messageFormatPattern')) {
        throw new Error('Message AST is not of type: "messageFormatPattern"');
    }

    var elements = ast.elements,
        pattern  = [];

    var i, len, element;

    for (i = 0, len = elements.length; i < len; i += 1) {
        element = elements[i];

        switch (element.type) {
            case 'messageTextElement':
                pattern.push(this.compileMessageText(element));
                break;

            case 'argumentElement':
                pattern.push(this.compileArgument(element));
                break;

            default:
                throw new Error('Message element does not have a valid type');
        }
    }

    return pattern;
};

Compiler.prototype.compileMessageText = function (element) {
    // When this `element` is part of plural sub-pattern and its value contains
    // an unescaped '#', use a `PluralOffsetString` helper to properly output
    // the number with the correct offset in the string.
    if (this.currentPlural && /(^|[^\\])#/g.test(element.value)) {
        // Create a cache a NumberFormat instance that can be reused for any
        // PluralOffsetString instance in this message.
        if (!this.pluralNumberFormat) {
            this.pluralNumberFormat = new Intl.NumberFormat(this.locales);
        }

        return new PluralOffsetString(
                this.currentPlural.id,
                this.currentPlural.format.offset,
                this.pluralNumberFormat,
                element.value);
    }

    // Unescape the escaped '#'s in the message text.
    return element.value.replace(/\\#/g, '#');
};

Compiler.prototype.compileArgument = function (element) {
    var format = element.format;

    if (!format) {
        return new StringFormat(element.id);
    }

    var formats  = this.formats,
        locales  = this.locales,
        pluralFn = this.pluralFn,
        options;

    switch (format.type) {
        case 'numberFormat':
            options = formats.number[format.style];
            return {
                id    : element.id,
                format: new Intl.NumberFormat(locales, options).format
            };

        case 'dateFormat':
            options = formats.date[format.style];
            return {
                id    : element.id,
                format: new Intl.DateTimeFormat(locales, options).format
            };

        case 'timeFormat':
            options = formats.time[format.style];
            return {
                id    : element.id,
                format: new Intl.DateTimeFormat(locales, options).format
            };

        case 'pluralFormat':
            options = this.compileOptions(element);
            return new PluralFormat(
                element.id, format.ordinal, format.offset, options, pluralFn
            );

        case 'selectFormat':
            options = this.compileOptions(element);
            return new SelectFormat(element.id, options);

        default:
            throw new Error('Message element does not have a valid format type');
    }
};

Compiler.prototype.compileOptions = function (element) {
    var format      = element.format,
        options     = format.options,
        optionsHash = {};

    // Save the current plural element, if any, then set it to a new value when
    // compiling the options sub-patterns. This conforms the spec's algorithm
    // for handling `"#"` syntax in message text.
    this.pluralStack.push(this.currentPlural);
    this.currentPlural = format.type === 'pluralFormat' ? element : null;

    var i, len, option;

    for (i = 0, len = options.length; i < len; i += 1) {
        option = options[i];

        // Compile the sub-pattern and save it under the options's selector.
        optionsHash[option.selector] = this.compileMessage(option.value);
    }

    // Pop the plural stack to put back the original current plural value.
    this.currentPlural = this.pluralStack.pop();

    return optionsHash;
};

// -- Compiler Helper Classes --------------------------------------------------

function StringFormat(id) {
    this.id = id;
}

StringFormat.prototype.format = function (value) {
    if (!value && typeof value !== 'number') {
        return '';
    }

    return typeof value === 'string' ? value : String(value);
};

function PluralFormat(id, useOrdinal, offset, options, pluralFn) {
    this.id         = id;
    this.useOrdinal = useOrdinal;
    this.offset     = offset;
    this.options    = options;
    this.pluralFn   = pluralFn;
}

PluralFormat.prototype.getOption = function (value) {
    var options = this.options;

    var option = options['=' + value] ||
            options[this.pluralFn(value - this.offset, this.useOrdinal)];

    return option || options.other;
};

function PluralOffsetString(id, offset, numberFormat, string) {
    this.id           = id;
    this.offset       = offset;
    this.numberFormat = numberFormat;
    this.string       = string;
}

PluralOffsetString.prototype.format = function (value) {
    var number = this.numberFormat.format(value - this.offset);

    return this.string
            .replace(/(^|[^\\])#/g, '$1' + number)
            .replace(/\\#/g, '#');
};

function SelectFormat(id, options) {
    this.id      = id;
    this.options = options;
}

SelectFormat.prototype.getOption = function (value) {
    var options = this.options;
    return options[value] || options.other;
};

//# sourceMappingURL=compiler.js.map

/***/ }),

/***/ 117:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports = module.exports = __webpack_require__(118)['default'];
exports['default'] = exports;


/***/ }),

/***/ 118:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports["default"] = (function() {
  "use strict";

  /*
   * Generated by PEG.js 0.9.0.
   *
   * http://pegjs.org/
   */

  function peg$subclass(child, parent) {
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
  }

  function peg$SyntaxError(message, expected, found, location) {
    this.message  = message;
    this.expected = expected;
    this.found    = found;
    this.location = location;
    this.name     = "SyntaxError";

    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, peg$SyntaxError);
    }
  }

  peg$subclass(peg$SyntaxError, Error);

  function peg$parse(input) {
    var options = arguments.length > 1 ? arguments[1] : {},
        parser  = this,

        peg$FAILED = {},

        peg$startRuleFunctions = { start: peg$parsestart },
        peg$startRuleFunction  = peg$parsestart,

        peg$c0 = function(elements) {
                return {
                    type    : 'messageFormatPattern',
                    elements: elements,
                    location: location()
                };
            },
        peg$c1 = function(text) {
                var string = '',
                    i, j, outerLen, inner, innerLen;

                for (i = 0, outerLen = text.length; i < outerLen; i += 1) {
                    inner = text[i];

                    for (j = 0, innerLen = inner.length; j < innerLen; j += 1) {
                        string += inner[j];
                    }
                }

                return string;
            },
        peg$c2 = function(messageText) {
                return {
                    type : 'messageTextElement',
                    value: messageText,
                    location: location()
                };
            },
        peg$c3 = /^[^ \t\n\r,.+={}#]/,
        peg$c4 = { type: "class", value: "[^ \\t\\n\\r,.+={}#]", description: "[^ \\t\\n\\r,.+={}#]" },
        peg$c5 = "{",
        peg$c6 = { type: "literal", value: "{", description: "\"{\"" },
        peg$c7 = ",",
        peg$c8 = { type: "literal", value: ",", description: "\",\"" },
        peg$c9 = "}",
        peg$c10 = { type: "literal", value: "}", description: "\"}\"" },
        peg$c11 = function(id, format) {
                return {
                    type  : 'argumentElement',
                    id    : id,
                    format: format && format[2],
                    location: location()
                };
            },
        peg$c12 = "number",
        peg$c13 = { type: "literal", value: "number", description: "\"number\"" },
        peg$c14 = "date",
        peg$c15 = { type: "literal", value: "date", description: "\"date\"" },
        peg$c16 = "time",
        peg$c17 = { type: "literal", value: "time", description: "\"time\"" },
        peg$c18 = function(type, style) {
                return {
                    type : type + 'Format',
                    style: style && style[2],
                    location: location()
                };
            },
        peg$c19 = "plural",
        peg$c20 = { type: "literal", value: "plural", description: "\"plural\"" },
        peg$c21 = function(pluralStyle) {
                return {
                    type   : pluralStyle.type,
                    ordinal: false,
                    offset : pluralStyle.offset || 0,
                    options: pluralStyle.options,
                    location: location()
                };
            },
        peg$c22 = "selectordinal",
        peg$c23 = { type: "literal", value: "selectordinal", description: "\"selectordinal\"" },
        peg$c24 = function(pluralStyle) {
                return {
                    type   : pluralStyle.type,
                    ordinal: true,
                    offset : pluralStyle.offset || 0,
                    options: pluralStyle.options,
                    location: location()
                }
            },
        peg$c25 = "select",
        peg$c26 = { type: "literal", value: "select", description: "\"select\"" },
        peg$c27 = function(options) {
                return {
                    type   : 'selectFormat',
                    options: options,
                    location: location()
                };
            },
        peg$c28 = "=",
        peg$c29 = { type: "literal", value: "=", description: "\"=\"" },
        peg$c30 = function(selector, pattern) {
                return {
                    type    : 'optionalFormatPattern',
                    selector: selector,
                    value   : pattern,
                    location: location()
                };
            },
        peg$c31 = "offset:",
        peg$c32 = { type: "literal", value: "offset:", description: "\"offset:\"" },
        peg$c33 = function(number) {
                return number;
            },
        peg$c34 = function(offset, options) {
                return {
                    type   : 'pluralFormat',
                    offset : offset,
                    options: options,
                    location: location()
                };
            },
        peg$c35 = { type: "other", description: "whitespace" },
        peg$c36 = /^[ \t\n\r]/,
        peg$c37 = { type: "class", value: "[ \\t\\n\\r]", description: "[ \\t\\n\\r]" },
        peg$c38 = { type: "other", description: "optionalWhitespace" },
        peg$c39 = /^[0-9]/,
        peg$c40 = { type: "class", value: "[0-9]", description: "[0-9]" },
        peg$c41 = /^[0-9a-f]/i,
        peg$c42 = { type: "class", value: "[0-9a-f]i", description: "[0-9a-f]i" },
        peg$c43 = "0",
        peg$c44 = { type: "literal", value: "0", description: "\"0\"" },
        peg$c45 = /^[1-9]/,
        peg$c46 = { type: "class", value: "[1-9]", description: "[1-9]" },
        peg$c47 = function(digits) {
            return parseInt(digits, 10);
        },
        peg$c48 = /^[^{}\\\0-\x1F \t\n\r]/,
        peg$c49 = { type: "class", value: "[^{}\\\\\\0-\\x1F\\x7f \\t\\n\\r]", description: "[^{}\\\\\\0-\\x1F\\x7f \\t\\n\\r]" },
        peg$c50 = "\\\\",
        peg$c51 = { type: "literal", value: "\\\\", description: "\"\\\\\\\\\"" },
        peg$c52 = function() { return '\\'; },
        peg$c53 = "\\#",
        peg$c54 = { type: "literal", value: "\\#", description: "\"\\\\#\"" },
        peg$c55 = function() { return '\\#'; },
        peg$c56 = "\\{",
        peg$c57 = { type: "literal", value: "\\{", description: "\"\\\\{\"" },
        peg$c58 = function() { return '\u007B'; },
        peg$c59 = "\\}",
        peg$c60 = { type: "literal", value: "\\}", description: "\"\\\\}\"" },
        peg$c61 = function() { return '\u007D'; },
        peg$c62 = "\\u",
        peg$c63 = { type: "literal", value: "\\u", description: "\"\\\\u\"" },
        peg$c64 = function(digits) {
                return String.fromCharCode(parseInt(digits, 16));
            },
        peg$c65 = function(chars) { return chars.join(''); },

        peg$currPos          = 0,
        peg$savedPos         = 0,
        peg$posDetailsCache  = [{ line: 1, column: 1, seenCR: false }],
        peg$maxFailPos       = 0,
        peg$maxFailExpected  = [],
        peg$silentFails      = 0,

        peg$result;

    if ("startRule" in options) {
      if (!(options.startRule in peg$startRuleFunctions)) {
        throw new Error("Can't start parsing from rule \"" + options.startRule + "\".");
      }

      peg$startRuleFunction = peg$startRuleFunctions[options.startRule];
    }

    function text() {
      return input.substring(peg$savedPos, peg$currPos);
    }

    function location() {
      return peg$computeLocation(peg$savedPos, peg$currPos);
    }

    function expected(description) {
      throw peg$buildException(
        null,
        [{ type: "other", description: description }],
        input.substring(peg$savedPos, peg$currPos),
        peg$computeLocation(peg$savedPos, peg$currPos)
      );
    }

    function error(message) {
      throw peg$buildException(
        message,
        null,
        input.substring(peg$savedPos, peg$currPos),
        peg$computeLocation(peg$savedPos, peg$currPos)
      );
    }

    function peg$computePosDetails(pos) {
      var details = peg$posDetailsCache[pos],
          p, ch;

      if (details) {
        return details;
      } else {
        p = pos - 1;
        while (!peg$posDetailsCache[p]) {
          p--;
        }

        details = peg$posDetailsCache[p];
        details = {
          line:   details.line,
          column: details.column,
          seenCR: details.seenCR
        };

        while (p < pos) {
          ch = input.charAt(p);
          if (ch === "\n") {
            if (!details.seenCR) { details.line++; }
            details.column = 1;
            details.seenCR = false;
          } else if (ch === "\r" || ch === "\u2028" || ch === "\u2029") {
            details.line++;
            details.column = 1;
            details.seenCR = true;
          } else {
            details.column++;
            details.seenCR = false;
          }

          p++;
        }

        peg$posDetailsCache[pos] = details;
        return details;
      }
    }

    function peg$computeLocation(startPos, endPos) {
      var startPosDetails = peg$computePosDetails(startPos),
          endPosDetails   = peg$computePosDetails(endPos);

      return {
        start: {
          offset: startPos,
          line:   startPosDetails.line,
          column: startPosDetails.column
        },
        end: {
          offset: endPos,
          line:   endPosDetails.line,
          column: endPosDetails.column
        }
      };
    }

    function peg$fail(expected) {
      if (peg$currPos < peg$maxFailPos) { return; }

      if (peg$currPos > peg$maxFailPos) {
        peg$maxFailPos = peg$currPos;
        peg$maxFailExpected = [];
      }

      peg$maxFailExpected.push(expected);
    }

    function peg$buildException(message, expected, found, location) {
      function cleanupExpected(expected) {
        var i = 1;

        expected.sort(function(a, b) {
          if (a.description < b.description) {
            return -1;
          } else if (a.description > b.description) {
            return 1;
          } else {
            return 0;
          }
        });

        while (i < expected.length) {
          if (expected[i - 1] === expected[i]) {
            expected.splice(i, 1);
          } else {
            i++;
          }
        }
      }

      function buildMessage(expected, found) {
        function stringEscape(s) {
          function hex(ch) { return ch.charCodeAt(0).toString(16).toUpperCase(); }

          return s
            .replace(/\\/g,   '\\\\')
            .replace(/"/g,    '\\"')
            .replace(/\x08/g, '\\b')
            .replace(/\t/g,   '\\t')
            .replace(/\n/g,   '\\n')
            .replace(/\f/g,   '\\f')
            .replace(/\r/g,   '\\r')
            .replace(/[\x00-\x07\x0B\x0E\x0F]/g, function(ch) { return '\\x0' + hex(ch); })
            .replace(/[\x10-\x1F\x80-\xFF]/g,    function(ch) { return '\\x'  + hex(ch); })
            .replace(/[\u0100-\u0FFF]/g,         function(ch) { return '\\u0' + hex(ch); })
            .replace(/[\u1000-\uFFFF]/g,         function(ch) { return '\\u'  + hex(ch); });
        }

        var expectedDescs = new Array(expected.length),
            expectedDesc, foundDesc, i;

        for (i = 0; i < expected.length; i++) {
          expectedDescs[i] = expected[i].description;
        }

        expectedDesc = expected.length > 1
          ? expectedDescs.slice(0, -1).join(", ")
              + " or "
              + expectedDescs[expected.length - 1]
          : expectedDescs[0];

        foundDesc = found ? "\"" + stringEscape(found) + "\"" : "end of input";

        return "Expected " + expectedDesc + " but " + foundDesc + " found.";
      }

      if (expected !== null) {
        cleanupExpected(expected);
      }

      return new peg$SyntaxError(
        message !== null ? message : buildMessage(expected, found),
        expected,
        found,
        location
      );
    }

    function peg$parsestart() {
      var s0;

      s0 = peg$parsemessageFormatPattern();

      return s0;
    }

    function peg$parsemessageFormatPattern() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = [];
      s2 = peg$parsemessageFormatElement();
      while (s2 !== peg$FAILED) {
        s1.push(s2);
        s2 = peg$parsemessageFormatElement();
      }
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c0(s1);
      }
      s0 = s1;

      return s0;
    }

    function peg$parsemessageFormatElement() {
      var s0;

      s0 = peg$parsemessageTextElement();
      if (s0 === peg$FAILED) {
        s0 = peg$parseargumentElement();
      }

      return s0;
    }

    function peg$parsemessageText() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      s1 = [];
      s2 = peg$currPos;
      s3 = peg$parse_();
      if (s3 !== peg$FAILED) {
        s4 = peg$parsechars();
        if (s4 !== peg$FAILED) {
          s5 = peg$parse_();
          if (s5 !== peg$FAILED) {
            s3 = [s3, s4, s5];
            s2 = s3;
          } else {
            peg$currPos = s2;
            s2 = peg$FAILED;
          }
        } else {
          peg$currPos = s2;
          s2 = peg$FAILED;
        }
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        while (s2 !== peg$FAILED) {
          s1.push(s2);
          s2 = peg$currPos;
          s3 = peg$parse_();
          if (s3 !== peg$FAILED) {
            s4 = peg$parsechars();
            if (s4 !== peg$FAILED) {
              s5 = peg$parse_();
              if (s5 !== peg$FAILED) {
                s3 = [s3, s4, s5];
                s2 = s3;
              } else {
                peg$currPos = s2;
                s2 = peg$FAILED;
              }
            } else {
              peg$currPos = s2;
              s2 = peg$FAILED;
            }
          } else {
            peg$currPos = s2;
            s2 = peg$FAILED;
          }
        }
      } else {
        s1 = peg$FAILED;
      }
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c1(s1);
      }
      s0 = s1;
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = peg$parsews();
        if (s1 !== peg$FAILED) {
          s0 = input.substring(s0, peg$currPos);
        } else {
          s0 = s1;
        }
      }

      return s0;
    }

    function peg$parsemessageTextElement() {
      var s0, s1;

      s0 = peg$currPos;
      s1 = peg$parsemessageText();
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c2(s1);
      }
      s0 = s1;

      return s0;
    }

    function peg$parseargument() {
      var s0, s1, s2;

      s0 = peg$parsenumber();
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = [];
        if (peg$c3.test(input.charAt(peg$currPos))) {
          s2 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c4); }
        }
        if (s2 !== peg$FAILED) {
          while (s2 !== peg$FAILED) {
            s1.push(s2);
            if (peg$c3.test(input.charAt(peg$currPos))) {
              s2 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s2 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c4); }
            }
          }
        } else {
          s1 = peg$FAILED;
        }
        if (s1 !== peg$FAILED) {
          s0 = input.substring(s0, peg$currPos);
        } else {
          s0 = s1;
        }
      }

      return s0;
    }

    function peg$parseargumentElement() {
      var s0, s1, s2, s3, s4, s5, s6, s7, s8;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 123) {
        s1 = peg$c5;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c6); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse_();
        if (s2 !== peg$FAILED) {
          s3 = peg$parseargument();
          if (s3 !== peg$FAILED) {
            s4 = peg$parse_();
            if (s4 !== peg$FAILED) {
              s5 = peg$currPos;
              if (input.charCodeAt(peg$currPos) === 44) {
                s6 = peg$c7;
                peg$currPos++;
              } else {
                s6 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c8); }
              }
              if (s6 !== peg$FAILED) {
                s7 = peg$parse_();
                if (s7 !== peg$FAILED) {
                  s8 = peg$parseelementFormat();
                  if (s8 !== peg$FAILED) {
                    s6 = [s6, s7, s8];
                    s5 = s6;
                  } else {
                    peg$currPos = s5;
                    s5 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s5;
                  s5 = peg$FAILED;
                }
              } else {
                peg$currPos = s5;
                s5 = peg$FAILED;
              }
              if (s5 === peg$FAILED) {
                s5 = null;
              }
              if (s5 !== peg$FAILED) {
                s6 = peg$parse_();
                if (s6 !== peg$FAILED) {
                  if (input.charCodeAt(peg$currPos) === 125) {
                    s7 = peg$c9;
                    peg$currPos++;
                  } else {
                    s7 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c10); }
                  }
                  if (s7 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s1 = peg$c11(s3, s5);
                    s0 = s1;
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parseelementFormat() {
      var s0;

      s0 = peg$parsesimpleFormat();
      if (s0 === peg$FAILED) {
        s0 = peg$parsepluralFormat();
        if (s0 === peg$FAILED) {
          s0 = peg$parseselectOrdinalFormat();
          if (s0 === peg$FAILED) {
            s0 = peg$parseselectFormat();
          }
        }
      }

      return s0;
    }

    function peg$parsesimpleFormat() {
      var s0, s1, s2, s3, s4, s5, s6;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 6) === peg$c12) {
        s1 = peg$c12;
        peg$currPos += 6;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c13); }
      }
      if (s1 === peg$FAILED) {
        if (input.substr(peg$currPos, 4) === peg$c14) {
          s1 = peg$c14;
          peg$currPos += 4;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c15); }
        }
        if (s1 === peg$FAILED) {
          if (input.substr(peg$currPos, 4) === peg$c16) {
            s1 = peg$c16;
            peg$currPos += 4;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c17); }
          }
        }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse_();
        if (s2 !== peg$FAILED) {
          s3 = peg$currPos;
          if (input.charCodeAt(peg$currPos) === 44) {
            s4 = peg$c7;
            peg$currPos++;
          } else {
            s4 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c8); }
          }
          if (s4 !== peg$FAILED) {
            s5 = peg$parse_();
            if (s5 !== peg$FAILED) {
              s6 = peg$parsechars();
              if (s6 !== peg$FAILED) {
                s4 = [s4, s5, s6];
                s3 = s4;
              } else {
                peg$currPos = s3;
                s3 = peg$FAILED;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
          if (s3 === peg$FAILED) {
            s3 = null;
          }
          if (s3 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c18(s1, s3);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parsepluralFormat() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 6) === peg$c19) {
        s1 = peg$c19;
        peg$currPos += 6;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c20); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse_();
        if (s2 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 44) {
            s3 = peg$c7;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c8); }
          }
          if (s3 !== peg$FAILED) {
            s4 = peg$parse_();
            if (s4 !== peg$FAILED) {
              s5 = peg$parsepluralStyle();
              if (s5 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$c21(s5);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parseselectOrdinalFormat() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 13) === peg$c22) {
        s1 = peg$c22;
        peg$currPos += 13;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c23); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse_();
        if (s2 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 44) {
            s3 = peg$c7;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c8); }
          }
          if (s3 !== peg$FAILED) {
            s4 = peg$parse_();
            if (s4 !== peg$FAILED) {
              s5 = peg$parsepluralStyle();
              if (s5 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$c24(s5);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parseselectFormat() {
      var s0, s1, s2, s3, s4, s5, s6;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 6) === peg$c25) {
        s1 = peg$c25;
        peg$currPos += 6;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c26); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse_();
        if (s2 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 44) {
            s3 = peg$c7;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c8); }
          }
          if (s3 !== peg$FAILED) {
            s4 = peg$parse_();
            if (s4 !== peg$FAILED) {
              s5 = [];
              s6 = peg$parseoptionalFormatPattern();
              if (s6 !== peg$FAILED) {
                while (s6 !== peg$FAILED) {
                  s5.push(s6);
                  s6 = peg$parseoptionalFormatPattern();
                }
              } else {
                s5 = peg$FAILED;
              }
              if (s5 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$c27(s5);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parseselector() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      s1 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 61) {
        s2 = peg$c28;
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c29); }
      }
      if (s2 !== peg$FAILED) {
        s3 = peg$parsenumber();
        if (s3 !== peg$FAILED) {
          s2 = [s2, s3];
          s1 = s2;
        } else {
          peg$currPos = s1;
          s1 = peg$FAILED;
        }
      } else {
        peg$currPos = s1;
        s1 = peg$FAILED;
      }
      if (s1 !== peg$FAILED) {
        s0 = input.substring(s0, peg$currPos);
      } else {
        s0 = s1;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$parsechars();
      }

      return s0;
    }

    function peg$parseoptionalFormatPattern() {
      var s0, s1, s2, s3, s4, s5, s6, s7, s8;

      s0 = peg$currPos;
      s1 = peg$parse_();
      if (s1 !== peg$FAILED) {
        s2 = peg$parseselector();
        if (s2 !== peg$FAILED) {
          s3 = peg$parse_();
          if (s3 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 123) {
              s4 = peg$c5;
              peg$currPos++;
            } else {
              s4 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c6); }
            }
            if (s4 !== peg$FAILED) {
              s5 = peg$parse_();
              if (s5 !== peg$FAILED) {
                s6 = peg$parsemessageFormatPattern();
                if (s6 !== peg$FAILED) {
                  s7 = peg$parse_();
                  if (s7 !== peg$FAILED) {
                    if (input.charCodeAt(peg$currPos) === 125) {
                      s8 = peg$c9;
                      peg$currPos++;
                    } else {
                      s8 = peg$FAILED;
                      if (peg$silentFails === 0) { peg$fail(peg$c10); }
                    }
                    if (s8 !== peg$FAILED) {
                      peg$savedPos = s0;
                      s1 = peg$c30(s2, s6);
                      s0 = s1;
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parseoffset() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 7) === peg$c31) {
        s1 = peg$c31;
        peg$currPos += 7;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c32); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse_();
        if (s2 !== peg$FAILED) {
          s3 = peg$parsenumber();
          if (s3 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c33(s3);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parsepluralStyle() {
      var s0, s1, s2, s3, s4;

      s0 = peg$currPos;
      s1 = peg$parseoffset();
      if (s1 === peg$FAILED) {
        s1 = null;
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse_();
        if (s2 !== peg$FAILED) {
          s3 = [];
          s4 = peg$parseoptionalFormatPattern();
          if (s4 !== peg$FAILED) {
            while (s4 !== peg$FAILED) {
              s3.push(s4);
              s4 = peg$parseoptionalFormatPattern();
            }
          } else {
            s3 = peg$FAILED;
          }
          if (s3 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c34(s1, s3);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parsews() {
      var s0, s1;

      peg$silentFails++;
      s0 = [];
      if (peg$c36.test(input.charAt(peg$currPos))) {
        s1 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c37); }
      }
      if (s1 !== peg$FAILED) {
        while (s1 !== peg$FAILED) {
          s0.push(s1);
          if (peg$c36.test(input.charAt(peg$currPos))) {
            s1 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c37); }
          }
        }
      } else {
        s0 = peg$FAILED;
      }
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c35); }
      }

      return s0;
    }

    function peg$parse_() {
      var s0, s1, s2;

      peg$silentFails++;
      s0 = peg$currPos;
      s1 = [];
      s2 = peg$parsews();
      while (s2 !== peg$FAILED) {
        s1.push(s2);
        s2 = peg$parsews();
      }
      if (s1 !== peg$FAILED) {
        s0 = input.substring(s0, peg$currPos);
      } else {
        s0 = s1;
      }
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c38); }
      }

      return s0;
    }

    function peg$parsedigit() {
      var s0;

      if (peg$c39.test(input.charAt(peg$currPos))) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c40); }
      }

      return s0;
    }

    function peg$parsehexDigit() {
      var s0;

      if (peg$c41.test(input.charAt(peg$currPos))) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c42); }
      }

      return s0;
    }

    function peg$parsenumber() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 48) {
        s1 = peg$c43;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c44); }
      }
      if (s1 === peg$FAILED) {
        s1 = peg$currPos;
        s2 = peg$currPos;
        if (peg$c45.test(input.charAt(peg$currPos))) {
          s3 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c46); }
        }
        if (s3 !== peg$FAILED) {
          s4 = [];
          s5 = peg$parsedigit();
          while (s5 !== peg$FAILED) {
            s4.push(s5);
            s5 = peg$parsedigit();
          }
          if (s4 !== peg$FAILED) {
            s3 = [s3, s4];
            s2 = s3;
          } else {
            peg$currPos = s2;
            s2 = peg$FAILED;
          }
        } else {
          peg$currPos = s2;
          s2 = peg$FAILED;
        }
        if (s2 !== peg$FAILED) {
          s1 = input.substring(s1, peg$currPos);
        } else {
          s1 = s2;
        }
      }
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c47(s1);
      }
      s0 = s1;

      return s0;
    }

    function peg$parsechar() {
      var s0, s1, s2, s3, s4, s5, s6, s7;

      if (peg$c48.test(input.charAt(peg$currPos))) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c49); }
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 2) === peg$c50) {
          s1 = peg$c50;
          peg$currPos += 2;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c51); }
        }
        if (s1 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c52();
        }
        s0 = s1;
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          if (input.substr(peg$currPos, 2) === peg$c53) {
            s1 = peg$c53;
            peg$currPos += 2;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c54); }
          }
          if (s1 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c55();
          }
          s0 = s1;
          if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            if (input.substr(peg$currPos, 2) === peg$c56) {
              s1 = peg$c56;
              peg$currPos += 2;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c57); }
            }
            if (s1 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c58();
            }
            s0 = s1;
            if (s0 === peg$FAILED) {
              s0 = peg$currPos;
              if (input.substr(peg$currPos, 2) === peg$c59) {
                s1 = peg$c59;
                peg$currPos += 2;
              } else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c60); }
              }
              if (s1 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$c61();
              }
              s0 = s1;
              if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                if (input.substr(peg$currPos, 2) === peg$c62) {
                  s1 = peg$c62;
                  peg$currPos += 2;
                } else {
                  s1 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c63); }
                }
                if (s1 !== peg$FAILED) {
                  s2 = peg$currPos;
                  s3 = peg$currPos;
                  s4 = peg$parsehexDigit();
                  if (s4 !== peg$FAILED) {
                    s5 = peg$parsehexDigit();
                    if (s5 !== peg$FAILED) {
                      s6 = peg$parsehexDigit();
                      if (s6 !== peg$FAILED) {
                        s7 = peg$parsehexDigit();
                        if (s7 !== peg$FAILED) {
                          s4 = [s4, s5, s6, s7];
                          s3 = s4;
                        } else {
                          peg$currPos = s3;
                          s3 = peg$FAILED;
                        }
                      } else {
                        peg$currPos = s3;
                        s3 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s3;
                      s3 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                  }
                  if (s3 !== peg$FAILED) {
                    s2 = input.substring(s2, peg$currPos);
                  } else {
                    s2 = s3;
                  }
                  if (s2 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s1 = peg$c64(s2);
                    s0 = s1;
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              }
            }
          }
        }
      }

      return s0;
    }

    function peg$parsechars() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = [];
      s2 = peg$parsechar();
      if (s2 !== peg$FAILED) {
        while (s2 !== peg$FAILED) {
          s1.push(s2);
          s2 = peg$parsechar();
        }
      } else {
        s1 = peg$FAILED;
      }
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c65(s1);
      }
      s0 = s1;

      return s0;
    }

    peg$result = peg$startRuleFunction();

    if (peg$result !== peg$FAILED && peg$currPos === input.length) {
      return peg$result;
    } else {
      if (peg$result !== peg$FAILED && peg$currPos < input.length) {
        peg$fail({ type: "end", description: "end of input" });
      }

      throw peg$buildException(
        null,
        peg$maxFailExpected,
        peg$maxFailPos < input.length ? input.charAt(peg$maxFailPos) : null,
        peg$maxFailPos < input.length
          ? peg$computeLocation(peg$maxFailPos, peg$maxFailPos + 1)
          : peg$computeLocation(peg$maxFailPos, peg$maxFailPos)
      );
    }
  }

  return {
    SyntaxError: peg$SyntaxError,
    parse:       peg$parse
  };
})();

//# sourceMappingURL=parser.js.map

/***/ }),

/***/ 119:
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// GENERATED FILE

exports["default"] = {"locale":"en","pluralRuleFunction":function (n,ord){var s=String(n).split("."),v0=!s[1],t0=Number(s[0])==n,n10=t0&&s[0].slice(-1),n100=t0&&s[0].slice(-2);if(ord)return n10==1&&n100!=11?"one":n10==2&&n100!=12?"two":n10==3&&n100!=13?"few":"other";return n==1&&v0?"one":"other"}};

//# sourceMappingURL=en.js.map

/***/ }),

/***/ 120:
/***/ (function(module, exports) {

/* (ignored) */

/***/ }),

/***/ 121:
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* jshint node:true */



var IntlRelativeFormat = __webpack_require__(122)['default'];

// Add all locale data to `IntlRelativeFormat`. This module will be ignored when
// bundling for the browser with Browserify/Webpack.
__webpack_require__(127);

// Re-export `IntlRelativeFormat` as the CommonJS default exports with all the
// locale data registered, and with English set as the default locale. Define
// the `default` prop for use with other compiled ES6 Modules.
exports = module.exports = IntlRelativeFormat;
exports['default'] = exports;


/***/ }),

/***/ 122:
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* jslint esnext: true */


var src$core$$ = __webpack_require__(123), src$en$$ = __webpack_require__(126);

src$core$$["default"].__addLocaleData(src$en$$["default"]);
src$core$$["default"].defaultLocale = 'en';

exports["default"] = src$core$$["default"];

//# sourceMappingURL=main.js.map

/***/ }),

/***/ 123:
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*
Copyright (c) 2014, Yahoo! Inc. All rights reserved.
Copyrights licensed under the New BSD License.
See the accompanying LICENSE file for terms.
*/

/* jslint esnext: true */


var intl$messageformat$$ = __webpack_require__(51), src$diff$$ = __webpack_require__(124), src$es5$$ = __webpack_require__(125);
exports["default"] = RelativeFormat;

// -----------------------------------------------------------------------------

var FIELDS = [
    'second', 'second-short',
    'minute', 'minute-short',
    'hour', 'hour-short',
    'day', 'day-short',
    'month', 'month-short',
    'year', 'year-short'
];
var STYLES = ['best fit', 'numeric'];

// -- RelativeFormat -----------------------------------------------------------

function RelativeFormat(locales, options) {
    options = options || {};

    // Make a copy of `locales` if it's an array, so that it doesn't change
    // since it's used lazily.
    if (src$es5$$.isArray(locales)) {
        locales = locales.concat();
    }

    src$es5$$.defineProperty(this, '_locale', {value: this._resolveLocale(locales)});
    src$es5$$.defineProperty(this, '_options', {value: {
        style: this._resolveStyle(options.style),
        units: this._isValidUnits(options.units) && options.units
    }});

    src$es5$$.defineProperty(this, '_locales', {value: locales});
    src$es5$$.defineProperty(this, '_fields', {value: this._findFields(this._locale)});
    src$es5$$.defineProperty(this, '_messages', {value: src$es5$$.objCreate(null)});

    // "Bind" `format()` method to `this` so it can be passed by reference like
    // the other `Intl` APIs.
    var relativeFormat = this;
    this.format = function format(date, options) {
        return relativeFormat._format(date, options);
    };
}

// Define internal private properties for dealing with locale data.
src$es5$$.defineProperty(RelativeFormat, '__localeData__', {value: src$es5$$.objCreate(null)});
src$es5$$.defineProperty(RelativeFormat, '__addLocaleData', {value: function (data) {
    if (!(data && data.locale)) {
        throw new Error(
            'Locale data provided to IntlRelativeFormat is missing a ' +
            '`locale` property value'
        );
    }

    RelativeFormat.__localeData__[data.locale.toLowerCase()] = data;

    // Add data to IntlMessageFormat.
    intl$messageformat$$["default"].__addLocaleData(data);
}});

// Define public `defaultLocale` property which can be set by the developer, or
// it will be set when the first RelativeFormat instance is created by
// leveraging the resolved locale from `Intl`.
src$es5$$.defineProperty(RelativeFormat, 'defaultLocale', {
    enumerable: true,
    writable  : true,
    value     : undefined
});

// Define public `thresholds` property which can be set by the developer, and
// defaults to relative time thresholds from moment.js.
src$es5$$.defineProperty(RelativeFormat, 'thresholds', {
    enumerable: true,

    value: {
        second: 45, 'second-short': 45,  // seconds to minute
        minute: 45, 'minute-short': 45, // minutes to hour
        hour  : 22, 'hour-short': 22, // hours to day
        day   : 26, 'day-short': 26, // days to month
        month : 11, 'month-short': 11 // months to year
    }
});

RelativeFormat.prototype.resolvedOptions = function () {
    return {
        locale: this._locale,
        style : this._options.style,
        units : this._options.units
    };
};

RelativeFormat.prototype._compileMessage = function (units) {
    // `this._locales` is the original set of locales the user specified to the
    // constructor, while `this._locale` is the resolved root locale.
    var locales        = this._locales;
    var resolvedLocale = this._locale;

    var field        = this._fields[units];
    var relativeTime = field.relativeTime;
    var future       = '';
    var past         = '';
    var i;

    for (i in relativeTime.future) {
        if (relativeTime.future.hasOwnProperty(i)) {
            future += ' ' + i + ' {' +
                relativeTime.future[i].replace('{0}', '#') + '}';
        }
    }

    for (i in relativeTime.past) {
        if (relativeTime.past.hasOwnProperty(i)) {
            past += ' ' + i + ' {' +
                relativeTime.past[i].replace('{0}', '#') + '}';
        }
    }

    var message = '{when, select, future {{0, plural, ' + future + '}}' +
                                 'past {{0, plural, ' + past + '}}}';

    // Create the synthetic IntlMessageFormat instance using the original
    // locales value specified by the user when constructing the the parent
    // IntlRelativeFormat instance.
    return new intl$messageformat$$["default"](message, locales);
};

RelativeFormat.prototype._getMessage = function (units) {
    var messages = this._messages;

    // Create a new synthetic message based on the locale data from CLDR.
    if (!messages[units]) {
        messages[units] = this._compileMessage(units);
    }

    return messages[units];
};

RelativeFormat.prototype._getRelativeUnits = function (diff, units) {
    var field = this._fields[units];

    if (field.relative) {
        return field.relative[diff];
    }
};

RelativeFormat.prototype._findFields = function (locale) {
    var localeData = RelativeFormat.__localeData__;
    var data       = localeData[locale.toLowerCase()];

    // The locale data is de-duplicated, so we have to traverse the locale's
    // hierarchy until we find `fields` to return.
    while (data) {
        if (data.fields) {
            return data.fields;
        }

        data = data.parentLocale && localeData[data.parentLocale.toLowerCase()];
    }

    throw new Error(
        'Locale data added to IntlRelativeFormat is missing `fields` for :' +
        locale
    );
};

RelativeFormat.prototype._format = function (date, options) {
    var now = options && options.now !== undefined ? options.now : src$es5$$.dateNow();

    if (date === undefined) {
        date = now;
    }

    // Determine if the `date` and optional `now` values are valid, and throw a
    // similar error to what `Intl.DateTimeFormat#format()` would throw.
    if (!isFinite(now)) {
        throw new RangeError(
            'The `now` option provided to IntlRelativeFormat#format() is not ' +
            'in valid range.'
        );
    }

    if (!isFinite(date)) {
        throw new RangeError(
            'The date value provided to IntlRelativeFormat#format() is not ' +
            'in valid range.'
        );
    }

    var diffReport  = src$diff$$["default"](now, date);
    var units       = this._options.units || this._selectUnits(diffReport);
    var diffInUnits = diffReport[units];

    if (this._options.style !== 'numeric') {
        var relativeUnits = this._getRelativeUnits(diffInUnits, units);
        if (relativeUnits) {
            return relativeUnits;
        }
    }

    return this._getMessage(units).format({
        '0' : Math.abs(diffInUnits),
        when: diffInUnits < 0 ? 'past' : 'future'
    });
};

RelativeFormat.prototype._isValidUnits = function (units) {
    if (!units || src$es5$$.arrIndexOf.call(FIELDS, units) >= 0) {
        return true;
    }

    if (typeof units === 'string') {
        var suggestion = /s$/.test(units) && units.substr(0, units.length - 1);
        if (suggestion && src$es5$$.arrIndexOf.call(FIELDS, suggestion) >= 0) {
            throw new Error(
                '"' + units + '" is not a valid IntlRelativeFormat `units` ' +
                'value, did you mean: ' + suggestion
            );
        }
    }

    throw new Error(
        '"' + units + '" is not a valid IntlRelativeFormat `units` value, it ' +
        'must be one of: "' + FIELDS.join('", "') + '"'
    );
};

RelativeFormat.prototype._resolveLocale = function (locales) {
    if (typeof locales === 'string') {
        locales = [locales];
    }

    // Create a copy of the array so we can push on the default locale.
    locales = (locales || []).concat(RelativeFormat.defaultLocale);

    var localeData = RelativeFormat.__localeData__;
    var i, len, localeParts, data;

    // Using the set of locales + the default locale, we look for the first one
    // which that has been registered. When data does not exist for a locale, we
    // traverse its ancestors to find something that's been registered within
    // its hierarchy of locales. Since we lack the proper `parentLocale` data
    // here, we must take a naive approach to traversal.
    for (i = 0, len = locales.length; i < len; i += 1) {
        localeParts = locales[i].toLowerCase().split('-');

        while (localeParts.length) {
            data = localeData[localeParts.join('-')];
            if (data) {
                // Return the normalized locale string; e.g., we return "en-US",
                // instead of "en-us".
                return data.locale;
            }

            localeParts.pop();
        }
    }

    var defaultLocale = locales.pop();
    throw new Error(
        'No locale data has been added to IntlRelativeFormat for: ' +
        locales.join(', ') + ', or the default locale: ' + defaultLocale
    );
};

RelativeFormat.prototype._resolveStyle = function (style) {
    // Default to "best fit" style.
    if (!style) {
        return STYLES[0];
    }

    if (src$es5$$.arrIndexOf.call(STYLES, style) >= 0) {
        return style;
    }

    throw new Error(
        '"' + style + '" is not a valid IntlRelativeFormat `style` value, it ' +
        'must be one of: "' + STYLES.join('", "') + '"'
    );
};

RelativeFormat.prototype._selectUnits = function (diffReport) {
    var i, l, units;
    var fields = FIELDS.filter(function(field) {
        return field.indexOf('-short') < 1;
    });

    for (i = 0, l = fields.length; i < l; i += 1) {
        units = fields[i];

        if (Math.abs(diffReport[units]) < RelativeFormat.thresholds[units]) {
            break;
        }
    }

    return units;
};

//# sourceMappingURL=core.js.map

/***/ }),

/***/ 124:
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*
Copyright (c) 2014, Yahoo! Inc. All rights reserved.
Copyrights licensed under the New BSD License.
See the accompanying LICENSE file for terms.
*/

/* jslint esnext: true */



var round = Math.round;

function daysToYears(days) {
    // 400 years have 146097 days (taking into account leap year rules)
    return days * 400 / 146097;
}

exports["default"] = function (from, to) {
    // Convert to ms timestamps.
    from = +from;
    to   = +to;

    var millisecond = round(to - from),
        second      = round(millisecond / 1000),
        minute      = round(second / 60),
        hour        = round(minute / 60),
        day         = round(hour / 24),
        week        = round(day / 7);

    var rawYears = daysToYears(day),
        month    = round(rawYears * 12),
        year     = round(rawYears);

    return {
        millisecond    : millisecond,
        second         : second,
        'second-short' : second,
        minute         : minute,
        'minute-short' : minute,
        hour           : hour,
        'hour-short'   : hour,
        day            : day,
        'day-short'    : day,
        week           : week,
        'week-short'   : week,
        month          : month,
        'month-short'  : month,
        year           : year,
        'year-short'   : year
    };
};

//# sourceMappingURL=diff.js.map

/***/ }),

/***/ 125:
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*
Copyright (c) 2014, Yahoo! Inc. All rights reserved.
Copyrights licensed under the New BSD License.
See the accompanying LICENSE file for terms.
*/

/* jslint esnext: true */

// Purposely using the same implementation as the Intl.js `Intl` polyfill.
// Copyright 2013 Andy Earnshaw, MIT License



var hop = Object.prototype.hasOwnProperty;
var toString = Object.prototype.toString;

var realDefineProp = (function () {
    try { return !!Object.defineProperty({}, 'a', {}); }
    catch (e) { return false; }
})();

var es3 = !realDefineProp && !Object.prototype.__defineGetter__;

var defineProperty = realDefineProp ? Object.defineProperty :
        function (obj, name, desc) {

    if ('get' in desc && obj.__defineGetter__) {
        obj.__defineGetter__(name, desc.get);
    } else if (!hop.call(obj, name) || 'value' in desc) {
        obj[name] = desc.value;
    }
};

var objCreate = Object.create || function (proto, props) {
    var obj, k;

    function F() {}
    F.prototype = proto;
    obj = new F();

    for (k in props) {
        if (hop.call(props, k)) {
            defineProperty(obj, k, props[k]);
        }
    }

    return obj;
};

var arrIndexOf = Array.prototype.indexOf || function (search, fromIndex) {
    /*jshint validthis:true */
    var arr = this;
    if (!arr.length) {
        return -1;
    }

    for (var i = fromIndex || 0, max = arr.length; i < max; i++) {
        if (arr[i] === search) {
            return i;
        }
    }

    return -1;
};

var isArray = Array.isArray || function (obj) {
    return toString.call(obj) === '[object Array]';
};

var dateNow = Date.now || function () {
    return new Date().getTime();
};

exports.defineProperty = defineProperty, exports.objCreate = objCreate, exports.arrIndexOf = arrIndexOf, exports.isArray = isArray, exports.dateNow = dateNow;

//# sourceMappingURL=es5.js.map

/***/ }),

/***/ 126:
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// GENERATED FILE

exports["default"] = {"locale":"en","pluralRuleFunction":function (n,ord){var s=String(n).split("."),v0=!s[1],t0=Number(s[0])==n,n10=t0&&s[0].slice(-1),n100=t0&&s[0].slice(-2);if(ord)return n10==1&&n100!=11?"one":n10==2&&n100!=12?"two":n10==3&&n100!=13?"few":"other";return n==1&&v0?"one":"other"},"fields":{"year":{"displayName":"year","relative":{"0":"this year","1":"next year","-1":"last year"},"relativeTime":{"future":{"one":"in {0} year","other":"in {0} years"},"past":{"one":"{0} year ago","other":"{0} years ago"}}},"year-short":{"displayName":"yr.","relative":{"0":"this yr.","1":"next yr.","-1":"last yr."},"relativeTime":{"future":{"one":"in {0} yr.","other":"in {0} yr."},"past":{"one":"{0} yr. ago","other":"{0} yr. ago"}}},"month":{"displayName":"month","relative":{"0":"this month","1":"next month","-1":"last month"},"relativeTime":{"future":{"one":"in {0} month","other":"in {0} months"},"past":{"one":"{0} month ago","other":"{0} months ago"}}},"month-short":{"displayName":"mo.","relative":{"0":"this mo.","1":"next mo.","-1":"last mo."},"relativeTime":{"future":{"one":"in {0} mo.","other":"in {0} mo."},"past":{"one":"{0} mo. ago","other":"{0} mo. ago"}}},"day":{"displayName":"day","relative":{"0":"today","1":"tomorrow","-1":"yesterday"},"relativeTime":{"future":{"one":"in {0} day","other":"in {0} days"},"past":{"one":"{0} day ago","other":"{0} days ago"}}},"day-short":{"displayName":"day","relative":{"0":"today","1":"tomorrow","-1":"yesterday"},"relativeTime":{"future":{"one":"in {0} day","other":"in {0} days"},"past":{"one":"{0} day ago","other":"{0} days ago"}}},"hour":{"displayName":"hour","relative":{"0":"this hour"},"relativeTime":{"future":{"one":"in {0} hour","other":"in {0} hours"},"past":{"one":"{0} hour ago","other":"{0} hours ago"}}},"hour-short":{"displayName":"hr.","relative":{"0":"this hour"},"relativeTime":{"future":{"one":"in {0} hr.","other":"in {0} hr."},"past":{"one":"{0} hr. ago","other":"{0} hr. ago"}}},"minute":{"displayName":"minute","relative":{"0":"this minute"},"relativeTime":{"future":{"one":"in {0} minute","other":"in {0} minutes"},"past":{"one":"{0} minute ago","other":"{0} minutes ago"}}},"minute-short":{"displayName":"min.","relative":{"0":"this minute"},"relativeTime":{"future":{"one":"in {0} min.","other":"in {0} min."},"past":{"one":"{0} min. ago","other":"{0} min. ago"}}},"second":{"displayName":"second","relative":{"0":"now"},"relativeTime":{"future":{"one":"in {0} second","other":"in {0} seconds"},"past":{"one":"{0} second ago","other":"{0} seconds ago"}}},"second-short":{"displayName":"sec.","relative":{"0":"now"},"relativeTime":{"future":{"one":"in {0} sec.","other":"in {0} sec."},"past":{"one":"{0} sec. ago","other":"{0} sec. ago"}}}}};

//# sourceMappingURL=en.js.map

/***/ }),

/***/ 127:
/***/ (function(module, exports) {

/* (ignored) */

/***/ }),

/***/ 128:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports = module.exports = __webpack_require__(129)['default'];
exports['default'] = exports;


/***/ }),

/***/ 129:
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*
Copyright (c) 2014, Yahoo! Inc. All rights reserved.
Copyrights licensed under the New BSD License.
See the accompanying LICENSE file for terms.
*/

/* jshint esnext: true */


var src$es5$$ = __webpack_require__(130);
exports["default"] = createFormatCache;

// -----------------------------------------------------------------------------

function createFormatCache(FormatConstructor) {
    var cache = src$es5$$.objCreate(null);

    return function () {
        var args    = Array.prototype.slice.call(arguments);
        var cacheId = getCacheId(args);
        var format  = cacheId && cache[cacheId];

        if (!format) {
            format = new (src$es5$$.bind.apply(FormatConstructor, [null].concat(args)))();

            if (cacheId) {
                cache[cacheId] = format;
            }
        }

        return format;
    };
}

// -- Utilities ----------------------------------------------------------------

function getCacheId(inputs) {
    // When JSON is not available in the runtime, we will not create a cache id.
    if (typeof JSON === 'undefined') { return; }

    var cacheId = [];

    var i, len, input;

    for (i = 0, len = inputs.length; i < len; i += 1) {
        input = inputs[i];

        if (input && typeof input === 'object') {
            cacheId.push(orderedProps(input));
        } else {
            cacheId.push(input);
        }
    }

    return JSON.stringify(cacheId);
}

function orderedProps(obj) {
    var props = [],
        keys  = [];

    var key, i, len, prop;

    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            keys.push(key);
        }
    }

    var orderedKeys = keys.sort();

    for (i = 0, len = orderedKeys.length; i < len; i += 1) {
        key  = orderedKeys[i];
        prop = {};

        prop[key] = obj[key];
        props[i]  = prop;
    }

    return props;
}

//# sourceMappingURL=memoizer.js.map

/***/ }),

/***/ 130:
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*
Copyright (c) 2014, Yahoo! Inc. All rights reserved.
Copyrights licensed under the New BSD License.
See the accompanying LICENSE file for terms.
*/

/* jslint esnext: true */

// Function.prototype.bind implementation from Mozilla Developer Network:
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind#Polyfill



var bind = Function.prototype.bind || function (oThis) {
    if (typeof this !== 'function') {
      // closest thing possible to the ECMAScript 5
      // internal IsCallable function
      throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
    }

    var aArgs   = Array.prototype.slice.call(arguments, 1),
        fToBind = this,
        fNOP    = function() {},
        fBound  = function() {
          return fToBind.apply(this instanceof fNOP
                 ? this
                 : oThis,
                 aArgs.concat(Array.prototype.slice.call(arguments)));
        };

    if (this.prototype) {
      // native functions don't have a prototype
      fNOP.prototype = this.prototype;
    }
    fBound.prototype = new fNOP();

    return fBound;
};

// Purposely using the same implementation as the Intl.js `Intl` polyfill.
// Copyright 2013 Andy Earnshaw, MIT License

var hop = Object.prototype.hasOwnProperty;

var realDefineProp = (function () {
    try { return !!Object.defineProperty({}, 'a', {}); }
    catch (e) { return false; }
})();

var es3 = !realDefineProp && !Object.prototype.__defineGetter__;

var defineProperty = realDefineProp ? Object.defineProperty :
        function (obj, name, desc) {

    if ('get' in desc && obj.__defineGetter__) {
        obj.__defineGetter__(name, desc.get);
    } else if (!hop.call(obj, name) || 'value' in desc) {
        obj[name] = desc.value;
    }
};

var objCreate = Object.create || function (proto, props) {
    var obj, k;

    function F() {}
    F.prototype = proto;
    obj = new F();

    for (k in props) {
        if (hop.call(props, k)) {
            defineProperty(obj, k, props[k]);
        }
    }

    return obj;
};

exports.bind = bind, exports.defineProperty = defineProperty, exports.objCreate = objCreate;

//# sourceMappingURL=es5.js.map

/***/ }),

/***/ 131:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
var _jsxFileName = '/Users/timteoh/TimCode/pulangmengundi/resources/assets/js/components/CarpoolOffer.js';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _reactDom = __webpack_require__(10);

var _reactDom2 = _interopRequireDefault(_reactDom);

var _api = __webpack_require__(24);

var _api2 = _interopRequireDefault(_api);

var _reactBootstrap = __webpack_require__(13);

var _HideOfferModal = __webpack_require__(549);

var _HideOfferModal2 = _interopRequireDefault(_HideOfferModal);

var _UnhideOfferModal = __webpack_require__(550);

var _UnhideOfferModal2 = _interopRequireDefault(_UnhideOfferModal);

var _reactIntl = __webpack_require__(17);

var _moment = __webpack_require__(1);

var _moment2 = _interopRequireDefault(_moment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var CarpoolOffer = function (_Component) {
  _inherits(CarpoolOffer, _Component);

  function CarpoolOffer(props) {
    _classCallCheck(this, CarpoolOffer);

    var _this = _possibleConstructorReturn(this, (CarpoolOffer.__proto__ || Object.getPrototypeOf(CarpoolOffer)).call(this, props));

    _this.state = {
      offer: props.offer,
      isOwner: props.isOwner || false,
      //the modal to hide the offer
      showHideModal: false,
      showUnhideModal: false
    };
    _this.handleOfferSuccess = _this.handleOfferSuccess.bind(_this);
    _this.handleUnhideOffer = _this.handleUnhideOffer.bind(_this);
    _this.handleCancelOffer = _this.handleCancelOffer.bind(_this);
    _this.setHideModal = _this.setHideModal.bind(_this);
    _this.setCancelModal = _this.setCancelModal.bind(_this);
    return _this;
  }

  _createClass(CarpoolOffer, [{
    key: 'handleOfferSuccess',
    value: function handleOfferSuccess() {
      var _this2 = this;

      _api2.default.offerSuccess(this.state.offer.id).then(function () {
        return _this2.props.onChange();
      });
    }
  }, {
    key: 'handleUnhideOffer',
    value: function handleUnhideOffer() {
      var _this3 = this;

      _api2.default.unhideOffer(this.state.offer.id).then(function () {
        return _this3.props.onChange();
      });
    }
  }, {
    key: 'handleCancelOffer',
    value: function handleCancelOffer() {
      var _this4 = this;

      _api2.default.cancelOffer(this.state.offer.id).then(function () {
        return _this4.props.onChange();
      });
    }
  }, {
    key: 'setHideModal',
    value: function setHideModal(showHideModal) {
      this.setState({
        showHideModal: showHideModal
      });
    }
  }, {
    key: 'setUnhideModal',
    value: function setUnhideModal(showUnhideModal) {
      this.setState({
        showUnhideModal: showUnhideModal
      });
    }
  }, {
    key: 'setCancelModal',
    value: function setCancelModal(showCancelModal) {
      this.setState({
        showCancelModal: showCancelModal
      });
    }
  }, {
    key: 'render',
    value: function render() {
      var _this5 = this;

      return _react2.default.createElement(
        _reactBootstrap.Panel,
        _defineProperty({
          __source: {
            fileName: _jsxFileName,
            lineNumber: 63
          },
          __self: this
        }, '__self', this),
        _react2.default.createElement(
          _reactBootstrap.Panel.Heading,
          _defineProperty({
            __source: {
              fileName: _jsxFileName,
              lineNumber: 64
            },
            __self: this
          }, '__self', this),
          _react2.default.createElement(
            _reactBootstrap.Row,
            _defineProperty({
              __source: {
                fileName: _jsxFileName,
                lineNumber: 65
              },
              __self: this
            }, '__self', this),
            _react2.default.createElement(
              _reactBootstrap.Col,
              _defineProperty({ md: 1, sm: 1, xs: 2, __source: {
                  fileName: _jsxFileName,
                  lineNumber: 66
                },
                __self: this
              }, '__self', this),
              _react2.default.createElement(_reactBootstrap.Image, _defineProperty({ className: 'listing-img', responsive: true, src: this.state.offer.user.avatar_url, __source: {
                  fileName: _jsxFileName,
                  lineNumber: 67
                },
                __self: this
              }, '__self', this))
            ),
            _react2.default.createElement(
              _reactBootstrap.Col,
              _defineProperty({ md: 9, mdOffset: 1, smOffset: 1, sm: 910, xs: 9, xsOffset: 1, __source: {
                  fileName: _jsxFileName,
                  lineNumber: 69
                },
                __self: this
              }, '__self', this),
              _react2.default.createElement(
                'h4',
                _defineProperty({
                  __source: {
                    fileName: _jsxFileName,
                    lineNumber: 70
                  },
                  __self: this
                }, '__self', this),
                this.state.offer.user.name
              )
            )
          )
        ),
        _react2.default.createElement(
          _reactBootstrap.Panel.Body,
          _defineProperty({
            __source: {
              fileName: _jsxFileName,
              lineNumber: 74
            },
            __self: this
          }, '__self', this),
          _react2.default.createElement(
            'div',
            _defineProperty({
              __source: {
                fileName: _jsxFileName,
                lineNumber: 75
              },
              __self: this
            }, '__self', this),
            _react2.default.createElement(
              'strong',
              _defineProperty({
                __source: {
                  fileName: _jsxFileName,
                  lineNumber: 76
                },
                __self: this
              }, '__self', this),
              _react2.default.createElement(_reactIntl.FormattedMessage, _defineProperty({
                id: 'request.travel-from-header',
                defaultMessage: 'Travelling from',
                __source: {
                  fileName: _jsxFileName,
                  lineNumber: 77
                },
                __self: this
              }, '__self', this)),
              ':'
            ),
            _react2.default.createElement(
              'p',
              _defineProperty({
                __source: {
                  fileName: _jsxFileName,
                  lineNumber: 82
                },
                __self: this
              }, '__self', this),
              this.state.offer.fromLocation.name,
              ', ',
              this.state.offer.fromLocation.state
            ),
            _react2.default.createElement(
              'strong',
              _defineProperty({
                __source: {
                  fileName: _jsxFileName,
                  lineNumber: 85
                },
                __self: this
              }, '__self', this),
              _react2.default.createElement(_reactIntl.FormattedMessage, _defineProperty({
                id: 'request.travel-to-header',
                defaultMessage: 'Travelling to',
                __source: {
                  fileName: _jsxFileName,
                  lineNumber: 86
                },
                __self: this
              }, '__self', this)),
              ':'
            ),
            _react2.default.createElement(
              'p',
              _defineProperty({
                __source: {
                  fileName: _jsxFileName,
                  lineNumber: 91
                },
                __self: this
              }, '__self', this),
              this.state.offer.toLocation.name,
              ', ',
              this.state.offer.toLocation.state
            ),
            _react2.default.createElement(
              'strong',
              _defineProperty({
                __source: {
                  fileName: _jsxFileName,
                  lineNumber: 94
                },
                __self: this
              }, '__self', this),
              _react2.default.createElement(_reactIntl.FormattedMessage, _defineProperty({
                id: 'request.travelling-time',
                defaultMessage: 'Time',
                __source: {
                  fileName: _jsxFileName,
                  lineNumber: 95
                },
                __self: this
              }, '__self', this)),
              ':'
            ),
            _react2.default.createElement(
              'p',
              _defineProperty({
                __source: {
                  fileName: _jsxFileName,
                  lineNumber: 100
                },
                __self: this
              }, '__self', this),
              this.state.offer.leave_at_formatted
            ),
            this.state.offer.gender_preference && _react2.default.createElement(
              'div',
              _defineProperty({
                __source: {
                  fileName: _jsxFileName,
                  lineNumber: 102
                },
                __self: this
              }, '__self', this),
              _react2.default.createElement(
                'strong',
                _defineProperty({
                  __source: {
                    fileName: _jsxFileName,
                    lineNumber: 103
                  },
                  __self: this
                }, '__self', this),
                _react2.default.createElement(_reactIntl.FormattedMessage, _defineProperty({
                  id: 'request.gender-pref',
                  defaultMessage: 'Gender preference',
                  __source: {
                    fileName: _jsxFileName,
                    lineNumber: 104
                  },
                  __self: this
                }, '__self', this)),
                ':'
              ),
              _react2.default.createElement(
                'p',
                _defineProperty({
                  __source: {
                    fileName: _jsxFileName,
                    lineNumber: 109
                  },
                  __self: this
                }, '__self', this),
                this.state.offer.gender_preference
              )
            ),
            this.state.offer.information && _react2.default.createElement(
              'div',
              _defineProperty({
                __source: {
                  fileName: _jsxFileName,
                  lineNumber: 112
                },
                __self: this
              }, '__self', this),
              _react2.default.createElement(
                'strong',
                _defineProperty({
                  __source: {
                    fileName: _jsxFileName,
                    lineNumber: 113
                  },
                  __self: this
                }, '__self', this),
                _react2.default.createElement(_reactIntl.FormattedMessage, _defineProperty({
                  id: 'request.additional-info',
                  defaultMessage: 'Additional information',
                  __source: {
                    fileName: _jsxFileName,
                    lineNumber: 114
                  },
                  __self: this
                }, '__self', this)),
                ':'
              ),
              _react2.default.createElement(
                'p',
                _defineProperty({
                  __source: {
                    fileName: _jsxFileName,
                    lineNumber: 119
                  },
                  __self: this
                }, '__self', this),
                this.state.offer.information
              )
            )
          )
        ),
        _react2.default.createElement(
          _reactBootstrap.Panel.Footer,
          _defineProperty({
            __source: {
              fileName: _jsxFileName,
              lineNumber: 123
            },
            __self: this
          }, '__self', this),
          this.state.isOwner && _react2.default.createElement(
            'div',
            _defineProperty({
              __source: {
                fileName: _jsxFileName,
                lineNumber: 125
              },
              __self: this
            }, '__self', this),
            this.state.offer.hidden == 0 && _react2.default.createElement(
              'div',
              _defineProperty({
                __source: {
                  fileName: _jsxFileName,
                  lineNumber: 127
                },
                __self: this
              }, '__self', this),
              _react2.default.createElement(
                _reactBootstrap.Button,
                _defineProperty({ bsStyle: 'info', onClick: function onClick(e) {
                    return _this5.setHideModal(true);
                  }, __source: {
                    fileName: _jsxFileName,
                    lineNumber: 128
                  },
                  __self: this
                }, '__self', this),
                _react2.default.createElement(_reactIntl.FormattedMessage, _defineProperty({
                  id: 'btn-close-offer',
                  defaultMessage: 'Close offer',
                  __source: {
                    fileName: _jsxFileName,
                    lineNumber: 129
                  },
                  __self: this
                }, '__self', this))
              )
            ),
            this.state.offer.hidden == 1 && _react2.default.createElement(
              'div',
              _defineProperty({
                __source: {
                  fileName: _jsxFileName,
                  lineNumber: 137
                },
                __self: this
              }, '__self', this),
              _react2.default.createElement(
                'p',
                _defineProperty({
                  __source: {
                    fileName: _jsxFileName,
                    lineNumber: 138
                  },
                  __self: this
                }, '__self', this),
                _react2.default.createElement(
                  'strong',
                  _defineProperty({
                    __source: {
                      fileName: _jsxFileName,
                      lineNumber: 139
                    },
                    __self: this
                  }, '__self', this),
                  _react2.default.createElement(_reactIntl.FormattedMessage, _defineProperty({
                    id: 'request.request-fulfilled',
                    defaultMessage: 'This offer was fulfilled!',
                    __source: {
                      fileName: _jsxFileName,
                      lineNumber: 140
                    },
                    __self: this
                  }, '__self', this))
                )
              ),
              _react2.default.createElement(
                _reactBootstrap.Button,
                _defineProperty({ bsStyle: 'success', onClick: function onClick(e) {
                    return _this5.setUnhideModal(true);
                  }, __source: {
                    fileName: _jsxFileName,
                    lineNumber: 145
                  },
                  __self: this
                }, '__self', this),
                _react2.default.createElement(_reactIntl.FormattedMessage, _defineProperty({
                  id: 'request.show-again',
                  defaultMessage: 'Show offer again',
                  __source: {
                    fileName: _jsxFileName,
                    lineNumber: 146
                  },
                  __self: this
                }, '__self', this))
              )
            )
          ),
          !this.state.isOwner && _react2.default.createElement(
            _reactBootstrap.Button,
            _defineProperty({ bsStyle: 'success', onClick: function onClick(e) {
                return _this5.props.onContact(_this5.state.offer.user);
              }, __source: {
                fileName: _jsxFileName,
                lineNumber: 156
              },
              __self: this
            }, '__self', this),
            _react2.default.createElement(_reactIntl.FormattedMessage, _defineProperty({
              id: 'btn-contact',
              defaultMessage: 'Contact',
              __source: {
                fileName: _jsxFileName,
                lineNumber: 157
              },
              __self: this
            }, '__self', this))
          ),
          _react2.default.createElement(_HideOfferModal2.default, _defineProperty({
            show: this.state.showHideModal,
            onOfferSuccess: this.handleOfferSuccess,
            onOfferCancel: this.handleCancelOffer,
            onCancel: function onCancel(e) {
              return _this5.setHideModal(false);
            },
            __source: {
              fileName: _jsxFileName,
              lineNumber: 163
            },
            __self: this
          }, '__self', this)),
          _react2.default.createElement(_UnhideOfferModal2.default, _defineProperty({ show: this.state.showUnhideModal, onOK: this.handleUnhideOffer, onCancel: function onCancel(e) {
              return _this5.setUnhideModal(false);
            }, __source: {
              fileName: _jsxFileName,
              lineNumber: 169
            },
            __self: this
          }, '__self', this))
        )
      );
    }
  }]);

  return CarpoolOffer;
}(_react.Component);

exports.default = CarpoolOffer;

/***/ }),

/***/ 132:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
var _jsxFileName = '/Users/timteoh/TimCode/pulangmengundi/resources/assets/js/components/CarpoolNeed.js';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _reactDom = __webpack_require__(10);

var _reactDom2 = _interopRequireDefault(_reactDom);

var _reactBootstrap = __webpack_require__(13);

var _CloseNeedModal = __webpack_require__(551);

var _CloseNeedModal2 = _interopRequireDefault(_CloseNeedModal);

var _reactIntl = __webpack_require__(17);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var CarpoolNeed = function (_Component) {
  _inherits(CarpoolNeed, _Component);

  function CarpoolNeed(props) {
    _classCallCheck(this, CarpoolNeed);

    var _this = _possibleConstructorReturn(this, (CarpoolNeed.__proto__ || Object.getPrototypeOf(CarpoolNeed)).call(this, props));

    _this.state = {
      showCloseModal: false
    };
    _this.setCloseModal = _this.setCloseModal.bind(_this);
    return _this;
  }

  _createClass(CarpoolNeed, [{
    key: 'setCloseModal',
    value: function setCloseModal(showCloseModal) {
      this.setState({
        showCloseModal: showCloseModal
      });
    }
  }, {
    key: 'render',
    value: function render() {
      var _this2 = this;

      return _react2.default.createElement(
        _reactBootstrap.Panel,
        _defineProperty({
          __source: {
            fileName: _jsxFileName,
            lineNumber: 25
          },
          __self: this
        }, '__self', this),
        _react2.default.createElement(
          _reactBootstrap.Panel.Heading,
          _defineProperty({
            __source: {
              fileName: _jsxFileName,
              lineNumber: 26
            },
            __self: this
          }, '__self', this),
          this.props.need && _react2.default.createElement(
            _reactBootstrap.Row,
            _defineProperty({
              __source: {
                fileName: _jsxFileName,
                lineNumber: 28
              },
              __self: this
            }, '__self', this),
            _react2.default.createElement(
              _reactBootstrap.Col,
              _defineProperty({ md: 1, sm: 1, xs: 2, __source: {
                  fileName: _jsxFileName,
                  lineNumber: 29
                },
                __self: this
              }, '__self', this),
              _react2.default.createElement(_reactBootstrap.Image, _defineProperty({ className: 'listing-img', responsive: true, src: this.props.need.user.avatar_url, __source: {
                  fileName: _jsxFileName,
                  lineNumber: 30
                },
                __self: this
              }, '__self', this))
            ),
            _react2.default.createElement(
              _reactBootstrap.Col,
              _defineProperty({ md: 9, mdOffset: 1, smOffset: 1, sm: 9, xs: 9, xsOffset: 1, __source: {
                  fileName: _jsxFileName,
                  lineNumber: 32
                },
                __self: this
              }, '__self', this),
              _react2.default.createElement(
                'h4',
                _defineProperty({
                  __source: {
                    fileName: _jsxFileName,
                    lineNumber: 33
                  },
                  __self: this
                }, '__self', this),
                this.props.need.user.name
              )
            )
          )
        ),
        _react2.default.createElement(
          _reactBootstrap.Panel.Body,
          _defineProperty({
            __source: {
              fileName: _jsxFileName,
              lineNumber: 38
            },
            __self: this
          }, '__self', this),
          this.props.need && _react2.default.createElement(
            'div',
            _defineProperty({
              __source: {
                fileName: _jsxFileName,
                lineNumber: 40
              },
              __self: this
            }, '__self', this),
            _react2.default.createElement(
              'strong',
              _defineProperty({
                __source: {
                  fileName: _jsxFileName,
                  lineNumber: 41
                },
                __self: this
              }, '__self', this),
              _react2.default.createElement(_reactIntl.FormattedMessage, _defineProperty({
                id: 'request.travel-from-header',
                defaultMessage: 'Travelling from',
                __source: {
                  fileName: _jsxFileName,
                  lineNumber: 42
                },
                __self: this
              }, '__self', this)),
              ':'
            ),
            _react2.default.createElement(
              'p',
              _defineProperty({
                __source: {
                  fileName: _jsxFileName,
                  lineNumber: 47
                },
                __self: this
              }, '__self', this),
              this.props.need.fromLocation.name,
              ', ',
              this.props.need.fromLocation.state
            ),
            _react2.default.createElement(
              'strong',
              _defineProperty({
                __source: {
                  fileName: _jsxFileName,
                  lineNumber: 48
                },
                __self: this
              }, '__self', this),
              _react2.default.createElement(_reactIntl.FormattedMessage, _defineProperty({
                id: 'request.voting-at-header',
                defaultMessage: 'Voting at',
                __source: {
                  fileName: _jsxFileName,
                  lineNumber: 49
                },
                __self: this
              }, '__self', this)),
              ':'
            ),
            _react2.default.createElement(
              'p',
              _defineProperty({
                __source: {
                  fileName: _jsxFileName,
                  lineNumber: 54
                },
                __self: this
              }, '__self', this),
              this.props.need.pollLocation.name,
              ', ',
              this.props.need.pollLocation.state
            ),
            _react2.default.createElement(
              'strong',
              _defineProperty({
                __source: {
                  fileName: _jsxFileName,
                  lineNumber: 55
                },
                __self: this
              }, '__self', this),
              _react2.default.createElement(_reactIntl.FormattedMessage, _defineProperty({
                id: 'request.gender-header',
                defaultMessage: 'Gender',
                __source: {
                  fileName: _jsxFileName,
                  lineNumber: 56
                },
                __self: this
              }, '__self', this)),
              ':'
            ),
            _react2.default.createElement(
              'p',
              _defineProperty({
                __source: {
                  fileName: _jsxFileName,
                  lineNumber: 61
                },
                __self: this
              }, '__self', this),
              this.props.need.gender
            ),
            _react2.default.createElement(
              'strong',
              _defineProperty({
                __source: {
                  fileName: _jsxFileName,
                  lineNumber: 62
                },
                __self: this
              }, '__self', this),
              'Information:'
            ),
            _react2.default.createElement(
              'p',
              _defineProperty({
                __source: {
                  fileName: _jsxFileName,
                  lineNumber: 63
                },
                __self: this
              }, '__self', this),
              this.props.need.information
            )
          )
        ),
        this.props.isOwner && this.props.need && !this.props.need.fulfilled && _react2.default.createElement(
          _reactBootstrap.Panel.Footer,
          _defineProperty({
            __source: {
              fileName: _jsxFileName,
              lineNumber: 68
            },
            __self: this
          }, '__self', this),
          _react2.default.createElement(
            _reactBootstrap.Button,
            _defineProperty({ bsStyle: 'info', href: '/need', __source: {
                fileName: _jsxFileName,
                lineNumber: 69
              },
              __self: this
            }, '__self', this),
            _react2.default.createElement(_reactIntl.FormattedMessage, _defineProperty({
              id: 'btn-edit',
              defaultMessage: 'Edit',
              __source: {
                fileName: _jsxFileName,
                lineNumber: 70
              },
              __self: this
            }, '__self', this))
          ),
          _react2.default.createElement(
            _reactBootstrap.Button,
            _defineProperty({ bsStyle: 'success', onClick: function onClick(e) {
                return _this2.setCloseModal(true);
              }, __source: {
                fileName: _jsxFileName,
                lineNumber: 75
              },
              __self: this
            }, '__self', this),
            _react2.default.createElement(_reactIntl.FormattedMessage, _defineProperty({
              id: 'request.btn-close-cancel',
              defaultMessage: 'Close/Cancel',
              __source: {
                fileName: _jsxFileName,
                lineNumber: 76
              },
              __self: this
            }, '__self', this))
          )
        ),
        this.props.isOwner && this.props.need && this.props.need.fulfilled == 1 && _react2.default.createElement(
          _reactBootstrap.Panel.Footer,
          _defineProperty({
            __source: {
              fileName: _jsxFileName,
              lineNumber: 84
            },
            __self: this
          }, '__self', this),
          _react2.default.createElement(
            _reactBootstrap.Button,
            _defineProperty({ bsStyle: 'success', __source: {
                fileName: _jsxFileName,
                lineNumber: 85
              },
              __self: this
            }, '__self', this),
            _react2.default.createElement(_reactIntl.FormattedMessage, _defineProperty({
              id: 'request.fulfilled',
              defaultMessage: 'Request fulfilled! :)',
              __source: {
                fileName: _jsxFileName,
                lineNumber: 86
              },
              __self: this
            }, '__self', this))
          )
        ),
        !this.props.isOwner && _react2.default.createElement(
          _reactBootstrap.Panel.Footer,
          _defineProperty({
            __source: {
              fileName: _jsxFileName,
              lineNumber: 94
            },
            __self: this
          }, '__self', this),
          _react2.default.createElement(
            _reactBootstrap.Button,
            _defineProperty({ bsStyle: 'success', onClick: function onClick(e) {
                return _this2.props.onContact(_this2.props.need.user);
              }, __source: {
                fileName: _jsxFileName,
                lineNumber: 95
              },
              __self: this
            }, '__self', this),
            _react2.default.createElement(_reactIntl.FormattedMessage, _defineProperty({
              id: 'btn-contact',
              defaultMessage: 'Contact',
              __source: {
                fileName: _jsxFileName,
                lineNumber: 96
              },
              __self: this
            }, '__self', this))
          )
        ),
        _react2.default.createElement(_CloseNeedModal2.default, _defineProperty({ show: this.state.showCloseModal, onNeedCancel: this.props.onNeedCancel, onNeedSuccess: this.props.onNeedSuccess, onCancel: function onCancel(e) {
            return _this2.setCloseModal(false);
          }, __source: {
            fileName: _jsxFileName,
            lineNumber: 103
          },
          __self: this
        }, '__self', this))
      );
    }
  }]);

  return CarpoolNeed;
}(_react.Component);

exports.default = CarpoolNeed;

/***/ }),

/***/ 133:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
var _jsxFileName = '/Users/timteoh/TimCode/pulangmengundi/resources/assets/js/components/ContactModal.js';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _reactDom = __webpack_require__(10);

var _reactDom2 = _interopRequireDefault(_reactDom);

var _api = __webpack_require__(24);

var _api2 = _interopRequireDefault(_api);

var _reactBootstrap = __webpack_require__(13);

var _reactGoogleRecaptcha = __webpack_require__(552);

var _reactGoogleRecaptcha2 = _interopRequireDefault(_reactGoogleRecaptcha);

var _reactIntl = __webpack_require__(17);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ContactModal = function (_Component) {
  _inherits(ContactModal, _Component);

  function ContactModal(props) {
    _classCallCheck(this, ContactModal);

    var _this = _possibleConstructorReturn(this, (ContactModal.__proto__ || Object.getPrototypeOf(ContactModal)).call(this, props));

    _this.state = {
      email: null,
      facebook: null,
      contact_number: null,
      hasRequested: false
    };
    _this.handleCaptchaSuccess = _this.handleCaptchaSuccess.bind(_this);
    return _this;
  }

  _createClass(ContactModal, [{
    key: 'handleCaptchaSuccess',
    value: function handleCaptchaSuccess() {
      var _this2 = this;

      _api2.default.getUser(this.props.user.uuid).then(function (_ref) {
        var facebook = _ref.facebook,
            email = _ref.email,
            contact_number = _ref.contact_number;

        _this2.setState({
          email: email,
          facebook: facebook,
          contact_number: contact_number,
          hasRequested: true
        });
      });
    }
  }, {
    key: 'render',
    value: function render() {
      return _react2.default.createElement(
        _reactBootstrap.Modal,
        _defineProperty({ show: this.props.show, onHide: this.props.onCancel, __source: {
            fileName: _jsxFileName,
            lineNumber: 36
          },
          __self: this
        }, '__self', this),
        _react2.default.createElement(
          _reactBootstrap.Modal.Header,
          _defineProperty({ closeButton: true, __source: {
              fileName: _jsxFileName,
              lineNumber: 37
            },
            __self: this
          }, '__self', this),
          _react2.default.createElement(
            _reactBootstrap.Modal.Title,
            _defineProperty({
              __source: {
                fileName: _jsxFileName,
                lineNumber: 38
              },
              __self: this
            }, '__self', this),
            'Contact ',
            this.props.user.name
          )
        ),
        _react2.default.createElement(
          _reactBootstrap.Modal.Body,
          _defineProperty({
            __source: {
              fileName: _jsxFileName,
              lineNumber: 40
            },
            __self: this
          }, '__self', this),
          _react2.default.createElement(
            'h4',
            _defineProperty({
              __source: {
                fileName: _jsxFileName,
                lineNumber: 41
              },
              __self: this
            }, '__self', this),
            _react2.default.createElement(_reactIntl.FormattedMessage, _defineProperty({
              id: 'contact.after-open-dialog-header',
              defaultMessage: 'What to do now',
              __source: {
                fileName: _jsxFileName,
                lineNumber: 42
              },
              __self: this
            }, '__self', this))
          ),
          !this.state.hasRequested && _react2.default.createElement(
            _reactBootstrap.Alert,
            _defineProperty({ bsStyle: 'info', __source: {
                fileName: _jsxFileName,
                lineNumber: 48
              },
              __self: this
            }, '__self', this),
            _react2.default.createElement(
              'form',
              _defineProperty({
                __source: {
                  fileName: _jsxFileName,
                  lineNumber: 49
                },
                __self: this
              }, '__self', this),
              _react2.default.createElement(
                'div',
                _defineProperty({
                  __source: {
                    fileName: _jsxFileName,
                    lineNumber: 50
                  },
                  __self: this
                }, '__self', this),
                _react2.default.createElement(
                  'p',
                  _defineProperty({
                    __source: {
                      fileName: _jsxFileName,
                      lineNumber: 51
                    },
                    __self: this
                  }, '__self', this),
                  _react2.default.createElement(_reactIntl.FormattedMessage, _defineProperty({
                    id: 'contact.click-to-show-text',
                    defaultMessage: 'Click here to show {name} contact information:',
                    values: {
                      name: _react2.default.createElement(
                        'strong',
                        _defineProperty({
                          __source: {
                            fileName: _jsxFileName,
                            lineNumber: 56
                          },
                          __self: this
                        }, '__self', this),
                        this.props.user.name,
                        '\'s'
                      )
                    },
                    __source: {
                      fileName: _jsxFileName,
                      lineNumber: 52
                    },
                    __self: this
                  }, '__self', this))
                ),
                _react2.default.createElement(
                  _reactBootstrap.Alert,
                  _defineProperty({ bsStyle: 'danger', __source: {
                      fileName: _jsxFileName,
                      lineNumber: 60
                    },
                    __self: this
                  }, '__self', this),
                  _react2.default.createElement(_reactIntl.FormattedMessage, _defineProperty({
                    id: 'contact.prevent-abuse',
                    defaultMessage: 'To prevent abuse, you will be blocked if you request too many profiles.',
                    __source: {
                      fileName: _jsxFileName,
                      lineNumber: 61
                    },
                    __self: this
                  }, '__self', this))
                )
              ),
              _react2.default.createElement(_reactGoogleRecaptcha2.default, _defineProperty({
                ref: 'recaptcha',
                sitekey: '6LcJuFIUAAAAAPro54ESMzsWQDPTp8iljIBhzJqr',
                onChange: this.handleCaptchaSuccess,
                __source: {
                  fileName: _jsxFileName,
                  lineNumber: 67
                },
                __self: this
              }, '__self', this))
            )
          ),
          this.state.hasRequested && _react2.default.createElement(
            _reactBootstrap.Panel,
            _defineProperty({ bsStyle: 'success', __source: {
                fileName: _jsxFileName,
                lineNumber: 76
              },
              __self: this
            }, '__self', this),
            _react2.default.createElement(
              _reactBootstrap.Panel.Body,
              _defineProperty({
                __source: {
                  fileName: _jsxFileName,
                  lineNumber: 77
                },
                __self: this
              }, '__self', this),
              _react2.default.createElement(
                'p',
                _defineProperty({
                  __source: {
                    fileName: _jsxFileName,
                    lineNumber: 78
                  },
                  __self: this
                }, '__self', this),
                _react2.default.createElement(_reactIntl.FormattedMessage, _defineProperty({
                  id: 'contact.after-show-1',
                  defaultMessage: 'Get in touch and arrange your trip! Some safety precautions below:',
                  __source: {
                    fileName: _jsxFileName,
                    lineNumber: 79
                  },
                  __self: this
                }, '__self', this))
              ),
              _react2.default.createElement(
                'ul',
                _defineProperty({
                  __source: {
                    fileName: _jsxFileName,
                    lineNumber: 84
                  },
                  __self: this
                }, '__self', this),
                _react2.default.createElement(
                  'li',
                  _defineProperty({
                    __source: {
                      fileName: _jsxFileName,
                      lineNumber: 85
                    },
                    __self: this
                  }, '__self', this),
                  _react2.default.createElement(_reactIntl.FormattedMessage, _defineProperty({
                    id: 'contact.after-show-2',
                    defaultMessage: 'Exchange contact details (e.g. phone numbers)',
                    __source: {
                      fileName: _jsxFileName,
                      lineNumber: 86
                    },
                    __self: this
                  }, '__self', this))
                ),
                _react2.default.createElement(
                  'li',
                  _defineProperty({
                    __source: {
                      fileName: _jsxFileName,
                      lineNumber: 91
                    },
                    __self: this
                  }, '__self', this),
                  _react2.default.createElement(_reactIntl.FormattedMessage, _defineProperty({
                    id: 'contact.after-show-3',
                    defaultMessage: 'Ensure the other users are real people (e.g. in a video call)',
                    __source: {
                      fileName: _jsxFileName,
                      lineNumber: 92
                    },
                    __self: this
                  }, '__self', this))
                ),
                _react2.default.createElement(
                  'li',
                  _defineProperty({
                    __source: {
                      fileName: _jsxFileName,
                      lineNumber: 97
                    },
                    __self: this
                  }, '__self', this),
                  _react2.default.createElement(_reactIntl.FormattedMessage, _defineProperty({
                    id: 'contact.after-show-4',
                    defaultMessage: 'Share the details of your trip and the details of the other ride-sharers with your friends and family',
                    __source: {
                      fileName: _jsxFileName,
                      lineNumber: 98
                    },
                    __self: this
                  }, '__self', this))
                )
              )
            )
          ),
          this.state.email && _react2.default.createElement(
            _reactBootstrap.Panel,
            _defineProperty({
              __source: {
                fileName: _jsxFileName,
                lineNumber: 108
              },
              __self: this
            }, '__self', this),
            _react2.default.createElement(
              _reactBootstrap.Panel.Heading,
              _defineProperty({
                __source: {
                  fileName: _jsxFileName,
                  lineNumber: 109
                },
                __self: this
              }, '__self', this),
              _react2.default.createElement(
                'h4',
                _defineProperty({
                  __source: {
                    fileName: _jsxFileName,
                    lineNumber: 110
                  },
                  __self: this
                }, '__self', this),
                _react2.default.createElement(_reactIntl.FormattedMessage, _defineProperty({
                  id: 'contact.header-email-address',
                  defaultMessage: '{name} email address',
                  values: {
                    name: _react2.default.createElement(
                      'span',
                      _defineProperty({
                        __source: {
                          fileName: _jsxFileName,
                          lineNumber: 115
                        },
                        __self: this
                      }, '__self', this),
                      this.props.user.name,
                      '\'s'
                    )
                  },
                  __source: {
                    fileName: _jsxFileName,
                    lineNumber: 111
                  },
                  __self: this
                }, '__self', this)),
                ':'
              )
            ),
            _react2.default.createElement(
              _reactBootstrap.Panel.Body,
              _defineProperty({
                __source: {
                  fileName: _jsxFileName,
                  lineNumber: 120
                },
                __self: this
              }, '__self', this),
              _react2.default.createElement(
                _reactBootstrap.Row,
                _defineProperty({
                  __source: {
                    fileName: _jsxFileName,
                    lineNumber: 121
                  },
                  __self: this
                }, '__self', this),
                _react2.default.createElement(
                  _reactBootstrap.Col,
                  _defineProperty({ md: 6, mdOffset: 3, __source: {
                      fileName: _jsxFileName,
                      lineNumber: 122
                    },
                    __self: this
                  }, '__self', this),
                  _react2.default.createElement(
                    _reactBootstrap.Button,
                    _defineProperty({ target: '_blank', __source: {
                        fileName: _jsxFileName,
                        lineNumber: 123
                      },
                      __self: this
                    }, '__self', this),
                    this.state.email
                  )
                )
              )
            )
          ),
          this.state.contact_number && _react2.default.createElement(
            _reactBootstrap.Panel,
            _defineProperty({
              __source: {
                fileName: _jsxFileName,
                lineNumber: 130
              },
              __self: this
            }, '__self', this),
            _react2.default.createElement(
              _reactBootstrap.Panel.Heading,
              _defineProperty({
                __source: {
                  fileName: _jsxFileName,
                  lineNumber: 131
                },
                __self: this
              }, '__self', this),
              _react2.default.createElement(
                'h4',
                _defineProperty({
                  __source: {
                    fileName: _jsxFileName,
                    lineNumber: 132
                  },
                  __self: this
                }, '__self', this),
                _react2.default.createElement(_reactIntl.FormattedMessage, _defineProperty({
                  id: 'contact.header-contact',
                  defaultMessage: '{name} contact number',
                  values: {
                    name: _react2.default.createElement(
                      'span',
                      _defineProperty({
                        __source: {
                          fileName: _jsxFileName,
                          lineNumber: 137
                        },
                        __self: this
                      }, '__self', this),
                      this.props.user.name,
                      '\'s'
                    )
                  },
                  __source: {
                    fileName: _jsxFileName,
                    lineNumber: 133
                  },
                  __self: this
                }, '__self', this)),
                ':'
              )
            ),
            _react2.default.createElement(
              _reactBootstrap.Panel.Body,
              _defineProperty({
                __source: {
                  fileName: _jsxFileName,
                  lineNumber: 142
                },
                __self: this
              }, '__self', this),
              _react2.default.createElement(
                _reactBootstrap.Row,
                _defineProperty({
                  __source: {
                    fileName: _jsxFileName,
                    lineNumber: 143
                  },
                  __self: this
                }, '__self', this),
                _react2.default.createElement(
                  _reactBootstrap.Col,
                  _defineProperty({ md: 6, mdOffset: 3, __source: {
                      fileName: _jsxFileName,
                      lineNumber: 144
                    },
                    __self: this
                  }, '__self', this),
                  _react2.default.createElement(
                    _reactBootstrap.Button,
                    _defineProperty({ target: '_blank', __source: {
                        fileName: _jsxFileName,
                        lineNumber: 145
                      },
                      __self: this
                    }, '__self', this),
                    this.state.contact_number
                  )
                )
              )
            )
          ),
          this.state.facebook && _react2.default.createElement(
            _reactBootstrap.Panel,
            _defineProperty({
              __source: {
                fileName: _jsxFileName,
                lineNumber: 152
              },
              __self: this
            }, '__self', this),
            _react2.default.createElement(
              _reactBootstrap.Panel.Heading,
              _defineProperty({
                __source: {
                  fileName: _jsxFileName,
                  lineNumber: 153
                },
                __self: this
              }, '__self', this),
              _react2.default.createElement(
                'h4',
                _defineProperty({
                  __source: {
                    fileName: _jsxFileName,
                    lineNumber: 154
                  },
                  __self: this
                }, '__self', this),
                _react2.default.createElement(_reactIntl.FormattedMessage, _defineProperty({
                  id: 'contact.header-fb-profile',
                  defaultMessage: '{name} Facebook profile link',
                  values: {
                    name: _react2.default.createElement(
                      'span',
                      _defineProperty({
                        __source: {
                          fileName: _jsxFileName,
                          lineNumber: 159
                        },
                        __self: this
                      }, '__self', this),
                      this.props.user.name,
                      '\'s'
                    )
                  },
                  __source: {
                    fileName: _jsxFileName,
                    lineNumber: 155
                  },
                  __self: this
                }, '__self', this)),
                ':'
              )
            ),
            _react2.default.createElement(
              _reactBootstrap.Panel.Body,
              _defineProperty({
                __source: {
                  fileName: _jsxFileName,
                  lineNumber: 164
                },
                __self: this
              }, '__self', this),
              _react2.default.createElement(
                _reactBootstrap.Row,
                _defineProperty({
                  __source: {
                    fileName: _jsxFileName,
                    lineNumber: 165
                  },
                  __self: this
                }, '__self', this),
                _react2.default.createElement(
                  _reactBootstrap.Col,
                  _defineProperty({ md: 6, mdOffset: 3, __source: {
                      fileName: _jsxFileName,
                      lineNumber: 166
                    },
                    __self: this
                  }, '__self', this),
                  _react2.default.createElement(
                    _reactBootstrap.Button,
                    _defineProperty({ href: this.state.facebook, target: '_blank', __source: {
                        fileName: _jsxFileName,
                        lineNumber: 167
                      },
                      __self: this
                    }, '__self', this),
                    _react2.default.createElement(_reactIntl.FormattedMessage, _defineProperty({
                      id: 'contact.btn-open-fb-profile',
                      defaultMessage: 'Profile (Opens new window)',
                      __source: {
                        fileName: _jsxFileName,
                        lineNumber: 168
                      },
                      __self: this
                    }, '__self', this))
                  )
                )
              ),
              _react2.default.createElement('br', _defineProperty({
                __source: {
                  fileName: _jsxFileName,
                  lineNumber: 175
                },
                __self: this
              }, '__self', this)),
              _react2.default.createElement(
                _reactBootstrap.Panel,
                _defineProperty({
                  __source: {
                    fileName: _jsxFileName,
                    lineNumber: 176
                  },
                  __self: this
                }, '__self', this),
                _react2.default.createElement(
                  _reactBootstrap.Panel.Body,
                  _defineProperty({
                    __source: {
                      fileName: _jsxFileName,
                      lineNumber: 177
                    },
                    __self: this
                  }, '__self', this),
                  _react2.default.createElement(
                    'h4',
                    _defineProperty({
                      __source: {
                        fileName: _jsxFileName,
                        lineNumber: 178
                      },
                      __self: this
                    }, '__self', this),
                    _react2.default.createElement(_reactIntl.FormattedMessage, _defineProperty({
                      id: 'contact.header-how-to-contact',
                      defaultMessage: 'How do I contact someone on Facebook?',
                      __source: {
                        fileName: _jsxFileName,
                        lineNumber: 179
                      },
                      __self: this
                    }, '__self', this))
                  ),
                  _react2.default.createElement(
                    'p',
                    _defineProperty({
                      __source: {
                        fileName: _jsxFileName,
                        lineNumber: 184
                      },
                      __self: this
                    }, '__self', this),
                    _react2.default.createElement(_reactIntl.FormattedMessage, _defineProperty({
                      id: 'contact.fb-blocks-msgs',
                      defaultMessage: 'Because Facebook blocks new Messages by default, try the following methods:',
                      __source: {
                        fileName: _jsxFileName,
                        lineNumber: 185
                      },
                      __self: this
                    }, '__self', this))
                  ),
                  _react2.default.createElement(
                    'h4',
                    _defineProperty({
                      __source: {
                        fileName: _jsxFileName,
                        lineNumber: 190
                      },
                      __self: this
                    }, '__self', this),
                    _react2.default.createElement(_reactIntl.FormattedMessage, _defineProperty({
                      id: 'contact.fb-step-1',
                      defaultMessage: '1. Send a Friend request.',
                      __source: {
                        fileName: _jsxFileName,
                        lineNumber: 191
                      },
                      __self: this
                    }, '__self', this))
                  ),
                  _react2.default.createElement('img', _defineProperty({ className: 'modal-img', src: '/img/FB1.jpg', __source: {
                      fileName: _jsxFileName,
                      lineNumber: 196
                    },
                    __self: this
                  }, '__self', this)),
                  _react2.default.createElement('br', _defineProperty({
                    __source: {
                      fileName: _jsxFileName,
                      lineNumber: 197
                    },
                    __self: this
                  }, '__self', this)),
                  _react2.default.createElement('br', _defineProperty({
                    __source: {
                      fileName: _jsxFileName,
                      lineNumber: 198
                    },
                    __self: this
                  }, '__self', this)),
                  _react2.default.createElement(
                    'h4',
                    _defineProperty({
                      __source: {
                        fileName: _jsxFileName,
                        lineNumber: 199
                      },
                      __self: this
                    }, '__self', this),
                    _react2.default.createElement(_reactIntl.FormattedMessage, _defineProperty({
                      id: 'contact.fb-step-2',
                      defaultMessage: '2. Send them a Facebook Message introducing yourself.',
                      __source: {
                        fileName: _jsxFileName,
                        lineNumber: 200
                      },
                      __self: this
                    }, '__self', this))
                  ),
                  _react2.default.createElement('img', _defineProperty({ className: 'modal-img', src: '/img/FB2.jpg', __source: {
                      fileName: _jsxFileName,
                      lineNumber: 205
                    },
                    __self: this
                  }, '__self', this)),
                  _react2.default.createElement('img', _defineProperty({ className: 'modal-img', src: '/img/FB3.jpg', __source: {
                      fileName: _jsxFileName,
                      lineNumber: 206
                    },
                    __self: this
                  }, '__self', this)),
                  _react2.default.createElement('br', _defineProperty({
                    __source: {
                      fileName: _jsxFileName,
                      lineNumber: 207
                    },
                    __self: this
                  }, '__self', this)),
                  _react2.default.createElement('br', _defineProperty({
                    __source: {
                      fileName: _jsxFileName,
                      lineNumber: 208
                    },
                    __self: this
                  }, '__self', this)),
                  _react2.default.createElement(
                    'h4',
                    _defineProperty({
                      __source: {
                        fileName: _jsxFileName,
                        lineNumber: 209
                      },
                      __self: this
                    }, '__self', this),
                    _react2.default.createElement(_reactIntl.FormattedMessage, _defineProperty({
                      id: 'contact.fb-step-3',
                      defaultMessage: 'They should see a notification in Facebook messenger with your introduction.',
                      __source: {
                        fileName: _jsxFileName,
                        lineNumber: 210
                      },
                      __self: this
                    }, '__self', this))
                  ),
                  _react2.default.createElement('img', _defineProperty({ className: 'modal-img', src: '/img/FB4.jpg', __source: {
                      fileName: _jsxFileName,
                      lineNumber: 215
                    },
                    __self: this
                  }, '__self', this))
                )
              )
            )
          )
        ),
        _react2.default.createElement(
          _reactBootstrap.Modal.Footer,
          _defineProperty({
            __source: {
              fileName: _jsxFileName,
              lineNumber: 222
            },
            __self: this
          }, '__self', this),
          _react2.default.createElement(
            _reactBootstrap.Button,
            _defineProperty({ onClick: this.props.onCancel, __source: {
                fileName: _jsxFileName,
                lineNumber: 223
              },
              __self: this
            }, '__self', this),
            _react2.default.createElement(_reactIntl.FormattedMessage, _defineProperty({
              id: 'contact.btn-close',
              defaultMessage: 'Close',
              __source: {
                fileName: _jsxFileName,
                lineNumber: 224
              },
              __self: this
            }, '__self', this))
          )
        )
      );
    }
  }]);

  return ContactModal;
}(_react.Component);

exports.default = ContactModal;

/***/ }),

/***/ 17:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "addLocaleData", function() { return addLocaleData; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "intlShape", function() { return intlShape; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "injectIntl", function() { return injectIntl; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "defineMessages", function() { return defineMessages; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "IntlProvider", function() { return IntlProvider; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "FormattedDate", function() { return FormattedDate; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "FormattedTime", function() { return FormattedTime; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "FormattedRelative", function() { return FormattedRelative; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "FormattedNumber", function() { return FormattedNumber; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "FormattedPlural", function() { return FormattedPlural; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "FormattedMessage", function() { return FormattedMessage; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "FormattedHTMLMessage", function() { return FormattedHTMLMessage; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__locale_data_index_js__ = __webpack_require__(112);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__locale_data_index_js___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__locale_data_index_js__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_intl_messageformat__ = __webpack_require__(51);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_intl_messageformat___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_intl_messageformat__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_intl_relativeformat__ = __webpack_require__(121);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_intl_relativeformat___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2_intl_relativeformat__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_prop_types__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_prop_types___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3_prop_types__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_react__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_react___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_4_react__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5_invariant__ = __webpack_require__(15);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5_invariant___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_5_invariant__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6_intl_format_cache__ = __webpack_require__(128);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6_intl_format_cache___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_6_intl_format_cache__);
/*
 * Copyright 2017, Yahoo Inc.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */









// GENERATED FILE
var defaultLocaleData = { "locale": "en", "pluralRuleFunction": function pluralRuleFunction(n, ord) {
    var s = String(n).split("."),
        v0 = !s[1],
        t0 = Number(s[0]) == n,
        n10 = t0 && s[0].slice(-1),
        n100 = t0 && s[0].slice(-2);if (ord) return n10 == 1 && n100 != 11 ? "one" : n10 == 2 && n100 != 12 ? "two" : n10 == 3 && n100 != 13 ? "few" : "other";return n == 1 && v0 ? "one" : "other";
  }, "fields": { "year": { "displayName": "year", "relative": { "0": "this year", "1": "next year", "-1": "last year" }, "relativeTime": { "future": { "one": "in {0} year", "other": "in {0} years" }, "past": { "one": "{0} year ago", "other": "{0} years ago" } } }, "month": { "displayName": "month", "relative": { "0": "this month", "1": "next month", "-1": "last month" }, "relativeTime": { "future": { "one": "in {0} month", "other": "in {0} months" }, "past": { "one": "{0} month ago", "other": "{0} months ago" } } }, "day": { "displayName": "day", "relative": { "0": "today", "1": "tomorrow", "-1": "yesterday" }, "relativeTime": { "future": { "one": "in {0} day", "other": "in {0} days" }, "past": { "one": "{0} day ago", "other": "{0} days ago" } } }, "hour": { "displayName": "hour", "relative": { "0": "this hour" }, "relativeTime": { "future": { "one": "in {0} hour", "other": "in {0} hours" }, "past": { "one": "{0} hour ago", "other": "{0} hours ago" } } }, "minute": { "displayName": "minute", "relative": { "0": "this minute" }, "relativeTime": { "future": { "one": "in {0} minute", "other": "in {0} minutes" }, "past": { "one": "{0} minute ago", "other": "{0} minutes ago" } } }, "second": { "displayName": "second", "relative": { "0": "now" }, "relativeTime": { "future": { "one": "in {0} second", "other": "in {0} seconds" }, "past": { "one": "{0} second ago", "other": "{0} seconds ago" } } } } };

/*
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */

function addLocaleData() {
  var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

  var locales = Array.isArray(data) ? data : [data];

  locales.forEach(function (localeData) {
    if (localeData && localeData.locale) {
      __WEBPACK_IMPORTED_MODULE_1_intl_messageformat___default.a.__addLocaleData(localeData);
      __WEBPACK_IMPORTED_MODULE_2_intl_relativeformat___default.a.__addLocaleData(localeData);
    }
  });
}

function hasLocaleData(locale) {
  var localeParts = (locale || '').split('-');

  while (localeParts.length > 0) {
    if (hasIMFAndIRFLocaleData(localeParts.join('-'))) {
      return true;
    }

    localeParts.pop();
  }

  return false;
}

function hasIMFAndIRFLocaleData(locale) {
  var normalizedLocale = locale && locale.toLowerCase();

  return !!(__WEBPACK_IMPORTED_MODULE_1_intl_messageformat___default.a.__localeData__[normalizedLocale] && __WEBPACK_IMPORTED_MODULE_2_intl_relativeformat___default.a.__localeData__[normalizedLocale]);
}

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};











var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();





var defineProperty = function (obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
};

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];

    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }

  return target;
};



var inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};









var objectWithoutProperties = function (obj, keys) {
  var target = {};

  for (var i in obj) {
    if (keys.indexOf(i) >= 0) continue;
    if (!Object.prototype.hasOwnProperty.call(obj, i)) continue;
    target[i] = obj[i];
  }

  return target;
};

var possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};



















var toConsumableArray = function (arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  } else {
    return Array.from(arr);
  }
};

/*
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */

var bool = __WEBPACK_IMPORTED_MODULE_3_prop_types___default.a.bool;
var number = __WEBPACK_IMPORTED_MODULE_3_prop_types___default.a.number;
var string = __WEBPACK_IMPORTED_MODULE_3_prop_types___default.a.string;
var func = __WEBPACK_IMPORTED_MODULE_3_prop_types___default.a.func;
var object = __WEBPACK_IMPORTED_MODULE_3_prop_types___default.a.object;
var oneOf = __WEBPACK_IMPORTED_MODULE_3_prop_types___default.a.oneOf;
var shape = __WEBPACK_IMPORTED_MODULE_3_prop_types___default.a.shape;
var any = __WEBPACK_IMPORTED_MODULE_3_prop_types___default.a.any;
var oneOfType = __WEBPACK_IMPORTED_MODULE_3_prop_types___default.a.oneOfType;

var localeMatcher = oneOf(['best fit', 'lookup']);
var narrowShortLong = oneOf(['narrow', 'short', 'long']);
var numeric2digit = oneOf(['numeric', '2-digit']);
var funcReq = func.isRequired;

var intlConfigPropTypes = {
  locale: string,
  formats: object,
  messages: object,
  textComponent: any,

  defaultLocale: string,
  defaultFormats: object
};

var intlFormatPropTypes = {
  formatDate: funcReq,
  formatTime: funcReq,
  formatRelative: funcReq,
  formatNumber: funcReq,
  formatPlural: funcReq,
  formatMessage: funcReq,
  formatHTMLMessage: funcReq
};

var intlShape = shape(_extends({}, intlConfigPropTypes, intlFormatPropTypes, {
  formatters: object,
  now: funcReq
}));

var messageDescriptorPropTypes = {
  id: string.isRequired,
  description: oneOfType([string, object]),
  defaultMessage: string
};

var dateTimeFormatPropTypes = {
  localeMatcher: localeMatcher,
  formatMatcher: oneOf(['basic', 'best fit']),

  timeZone: string,
  hour12: bool,

  weekday: narrowShortLong,
  era: narrowShortLong,
  year: numeric2digit,
  month: oneOf(['numeric', '2-digit', 'narrow', 'short', 'long']),
  day: numeric2digit,
  hour: numeric2digit,
  minute: numeric2digit,
  second: numeric2digit,
  timeZoneName: oneOf(['short', 'long'])
};

var numberFormatPropTypes = {
  localeMatcher: localeMatcher,

  style: oneOf(['decimal', 'currency', 'percent']),
  currency: string,
  currencyDisplay: oneOf(['symbol', 'code', 'name']),
  useGrouping: bool,

  minimumIntegerDigits: number,
  minimumFractionDigits: number,
  maximumFractionDigits: number,
  minimumSignificantDigits: number,
  maximumSignificantDigits: number
};

var relativeFormatPropTypes = {
  style: oneOf(['best fit', 'numeric']),
  units: oneOf(['second', 'minute', 'hour', 'day', 'month', 'year'])
};

var pluralFormatPropTypes = {
  style: oneOf(['cardinal', 'ordinal'])
};

/*
HTML escaping and shallow-equals implementations are the same as React's
(on purpose.) Therefore, it has the following Copyright and Licensing:

Copyright 2013-2014, Facebook, Inc.
All rights reserved.

This source code is licensed under the BSD-style license found in the LICENSE
file in the root directory of React's source tree.
*/

var intlConfigPropNames = Object.keys(intlConfigPropTypes);

var ESCAPED_CHARS = {
  '&': '&amp;',
  '>': '&gt;',
  '<': '&lt;',
  '"': '&quot;',
  "'": '&#x27;'
};

var UNSAFE_CHARS_REGEX = /[&><"']/g;

function escape(str) {
  return ('' + str).replace(UNSAFE_CHARS_REGEX, function (match) {
    return ESCAPED_CHARS[match];
  });
}

function filterProps(props, whitelist) {
  var defaults$$1 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  return whitelist.reduce(function (filtered, name) {
    if (props.hasOwnProperty(name)) {
      filtered[name] = props[name];
    } else if (defaults$$1.hasOwnProperty(name)) {
      filtered[name] = defaults$$1[name];
    }

    return filtered;
  }, {});
}

function invariantIntlContext() {
  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      intl = _ref.intl;

  __WEBPACK_IMPORTED_MODULE_5_invariant___default()(intl, '[React Intl] Could not find required `intl` object. ' + '<IntlProvider> needs to exist in the component ancestry.');
}

function shallowEquals(objA, objB) {
  if (objA === objB) {
    return true;
  }

  if ((typeof objA === 'undefined' ? 'undefined' : _typeof(objA)) !== 'object' || objA === null || (typeof objB === 'undefined' ? 'undefined' : _typeof(objB)) !== 'object' || objB === null) {
    return false;
  }

  var keysA = Object.keys(objA);
  var keysB = Object.keys(objB);

  if (keysA.length !== keysB.length) {
    return false;
  }

  // Test for A's keys different from B.
  var bHasOwnProperty = Object.prototype.hasOwnProperty.bind(objB);
  for (var i = 0; i < keysA.length; i++) {
    if (!bHasOwnProperty(keysA[i]) || objA[keysA[i]] !== objB[keysA[i]]) {
      return false;
    }
  }

  return true;
}

function shouldIntlComponentUpdate(_ref2, nextProps, nextState) {
  var props = _ref2.props,
      state = _ref2.state,
      _ref2$context = _ref2.context,
      context = _ref2$context === undefined ? {} : _ref2$context;
  var nextContext = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  var _context$intl = context.intl,
      intl = _context$intl === undefined ? {} : _context$intl;
  var _nextContext$intl = nextContext.intl,
      nextIntl = _nextContext$intl === undefined ? {} : _nextContext$intl;


  return !shallowEquals(nextProps, props) || !shallowEquals(nextState, state) || !(nextIntl === intl || shallowEquals(filterProps(nextIntl, intlConfigPropNames), filterProps(intl, intlConfigPropNames)));
}

/*
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */

// Inspired by react-redux's `connect()` HOC factory function implementation:
// https://github.com/rackt/react-redux

function getDisplayName(Component$$1) {
  return Component$$1.displayName || Component$$1.name || 'Component';
}

function injectIntl(WrappedComponent) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var _options$intlPropName = options.intlPropName,
      intlPropName = _options$intlPropName === undefined ? 'intl' : _options$intlPropName,
      _options$withRef = options.withRef,
      withRef = _options$withRef === undefined ? false : _options$withRef;

  var InjectIntl = function (_Component) {
    inherits(InjectIntl, _Component);

    function InjectIntl(props, context) {
      classCallCheck(this, InjectIntl);

      var _this = possibleConstructorReturn(this, (InjectIntl.__proto__ || Object.getPrototypeOf(InjectIntl)).call(this, props, context));

      invariantIntlContext(context);
      return _this;
    }

    createClass(InjectIntl, [{
      key: 'getWrappedInstance',
      value: function getWrappedInstance() {
        __WEBPACK_IMPORTED_MODULE_5_invariant___default()(withRef, '[React Intl] To access the wrapped instance, ' + 'the `{withRef: true}` option must be set when calling: ' + '`injectIntl()`');

        return this.refs.wrappedInstance;
      }
    }, {
      key: 'render',
      value: function render() {
        return __WEBPACK_IMPORTED_MODULE_4_react___default.a.createElement(WrappedComponent, _extends({}, this.props, defineProperty({}, intlPropName, this.context.intl), {
          ref: withRef ? 'wrappedInstance' : null
        }));
      }
    }]);
    return InjectIntl;
  }(__WEBPACK_IMPORTED_MODULE_4_react__["Component"]);

  InjectIntl.displayName = 'InjectIntl(' + getDisplayName(WrappedComponent) + ')';
  InjectIntl.contextTypes = {
    intl: intlShape
  };
  InjectIntl.WrappedComponent = WrappedComponent;


  return InjectIntl;
}

/*
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */

function defineMessages(messageDescriptors) {
  // This simply returns what's passed-in because it's meant to be a hook for
  // babel-plugin-react-intl.
  return messageDescriptors;
}

/*
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */

// This is a "hack" until a proper `intl-pluralformat` package is created.

function resolveLocale(locales) {
  // IntlMessageFormat#_resolveLocale() does not depend on `this`.
  return __WEBPACK_IMPORTED_MODULE_1_intl_messageformat___default.a.prototype._resolveLocale(locales);
}

function findPluralFunction(locale) {
  // IntlMessageFormat#_findPluralFunction() does not depend on `this`.
  return __WEBPACK_IMPORTED_MODULE_1_intl_messageformat___default.a.prototype._findPluralRuleFunction(locale);
}

var IntlPluralFormat = function IntlPluralFormat(locales) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  classCallCheck(this, IntlPluralFormat);

  var useOrdinal = options.style === 'ordinal';
  var pluralFn = findPluralFunction(resolveLocale(locales));

  this.format = function (value) {
    return pluralFn(value, useOrdinal);
  };
};

/*
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */

var DATE_TIME_FORMAT_OPTIONS = Object.keys(dateTimeFormatPropTypes);
var NUMBER_FORMAT_OPTIONS = Object.keys(numberFormatPropTypes);
var RELATIVE_FORMAT_OPTIONS = Object.keys(relativeFormatPropTypes);
var PLURAL_FORMAT_OPTIONS = Object.keys(pluralFormatPropTypes);

var RELATIVE_FORMAT_THRESHOLDS = {
  second: 60, // seconds to minute
  minute: 60, // minutes to hour
  hour: 24, // hours to day
  day: 30, // days to month
  month: 12 // months to year
};

function updateRelativeFormatThresholds(newThresholds) {
  var thresholds = __WEBPACK_IMPORTED_MODULE_2_intl_relativeformat___default.a.thresholds;
  thresholds.second = newThresholds.second;
  thresholds.minute = newThresholds.minute;
  thresholds.hour = newThresholds.hour;
  thresholds.day = newThresholds.day;
  thresholds.month = newThresholds.month;
}

function getNamedFormat(formats, type, name) {
  var format = formats && formats[type] && formats[type][name];
  if (format) {
    return format;
  }

  if (true) {
    console.error('[React Intl] No ' + type + ' format named: ' + name);
  }
}

function formatDate(config, state, value) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  var locale = config.locale,
      formats = config.formats;
  var format = options.format;


  var date = new Date(value);
  var defaults$$1 = format && getNamedFormat(formats, 'date', format);
  var filteredOptions = filterProps(options, DATE_TIME_FORMAT_OPTIONS, defaults$$1);

  try {
    return state.getDateTimeFormat(locale, filteredOptions).format(date);
  } catch (e) {
    if (true) {
      console.error('[React Intl] Error formatting date.\n' + e);
    }
  }

  return String(date);
}

function formatTime(config, state, value) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  var locale = config.locale,
      formats = config.formats;
  var format = options.format;


  var date = new Date(value);
  var defaults$$1 = format && getNamedFormat(formats, 'time', format);
  var filteredOptions = filterProps(options, DATE_TIME_FORMAT_OPTIONS, defaults$$1);

  if (!filteredOptions.hour && !filteredOptions.minute && !filteredOptions.second) {
    // Add default formatting options if hour, minute, or second isn't defined.
    filteredOptions = _extends({}, filteredOptions, { hour: 'numeric', minute: 'numeric' });
  }

  try {
    return state.getDateTimeFormat(locale, filteredOptions).format(date);
  } catch (e) {
    if (true) {
      console.error('[React Intl] Error formatting time.\n' + e);
    }
  }

  return String(date);
}

function formatRelative(config, state, value) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  var locale = config.locale,
      formats = config.formats;
  var format = options.format;


  var date = new Date(value);
  var now = new Date(options.now);
  var defaults$$1 = format && getNamedFormat(formats, 'relative', format);
  var filteredOptions = filterProps(options, RELATIVE_FORMAT_OPTIONS, defaults$$1);

  // Capture the current threshold values, then temporarily override them with
  // specific values just for this render.
  var oldThresholds = _extends({}, __WEBPACK_IMPORTED_MODULE_2_intl_relativeformat___default.a.thresholds);
  updateRelativeFormatThresholds(RELATIVE_FORMAT_THRESHOLDS);

  try {
    return state.getRelativeFormat(locale, filteredOptions).format(date, {
      now: isFinite(now) ? now : state.now()
    });
  } catch (e) {
    if (true) {
      console.error('[React Intl] Error formatting relative time.\n' + e);
    }
  } finally {
    updateRelativeFormatThresholds(oldThresholds);
  }

  return String(date);
}

function formatNumber(config, state, value) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  var locale = config.locale,
      formats = config.formats;
  var format = options.format;


  var defaults$$1 = format && getNamedFormat(formats, 'number', format);
  var filteredOptions = filterProps(options, NUMBER_FORMAT_OPTIONS, defaults$$1);

  try {
    return state.getNumberFormat(locale, filteredOptions).format(value);
  } catch (e) {
    if (true) {
      console.error('[React Intl] Error formatting number.\n' + e);
    }
  }

  return String(value);
}

function formatPlural(config, state, value) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  var locale = config.locale;


  var filteredOptions = filterProps(options, PLURAL_FORMAT_OPTIONS);

  try {
    return state.getPluralFormat(locale, filteredOptions).format(value);
  } catch (e) {
    if (true) {
      console.error('[React Intl] Error formatting plural.\n' + e);
    }
  }

  return 'other';
}

function formatMessage(config, state) {
  var messageDescriptor = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var values = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  var locale = config.locale,
      formats = config.formats,
      messages = config.messages,
      defaultLocale = config.defaultLocale,
      defaultFormats = config.defaultFormats;
  var id = messageDescriptor.id,
      defaultMessage = messageDescriptor.defaultMessage;

  // `id` is a required field of a Message Descriptor.

  __WEBPACK_IMPORTED_MODULE_5_invariant___default()(id, '[React Intl] An `id` must be provided to format a message.');

  var message = messages && messages[id];
  var hasValues = Object.keys(values).length > 0;

  // Avoid expensive message formatting for simple messages without values. In
  // development messages will always be formatted in case of missing values.
  if (!hasValues && "development" === 'production') {
    return message || defaultMessage || id;
  }

  var formattedMessage = void 0;

  if (message) {
    try {
      var formatter = state.getMessageFormat(message, locale, formats);

      formattedMessage = formatter.format(values);
    } catch (e) {
      if (true) {
        console.error('[React Intl] Error formatting message: "' + id + '" for locale: "' + locale + '"' + (defaultMessage ? ', using default message as fallback.' : '') + ('\n' + e));
      }
    }
  } else {
    if (true) {
      // This prevents warnings from littering the console in development
      // when no `messages` are passed into the <IntlProvider> for the
      // default locale, and a default message is in the source.
      if (!defaultMessage || locale && locale.toLowerCase() !== defaultLocale.toLowerCase()) {
        console.error('[React Intl] Missing message: "' + id + '" for locale: "' + locale + '"' + (defaultMessage ? ', using default message as fallback.' : ''));
      }
    }
  }

  if (!formattedMessage && defaultMessage) {
    try {
      var _formatter = state.getMessageFormat(defaultMessage, defaultLocale, defaultFormats);

      formattedMessage = _formatter.format(values);
    } catch (e) {
      if (true) {
        console.error('[React Intl] Error formatting the default message for: "' + id + '"' + ('\n' + e));
      }
    }
  }

  if (!formattedMessage) {
    if (true) {
      console.error('[React Intl] Cannot format message: "' + id + '", ' + ('using message ' + (message || defaultMessage ? 'source' : 'id') + ' as fallback.'));
    }
  }

  return formattedMessage || message || defaultMessage || id;
}

function formatHTMLMessage(config, state, messageDescriptor) {
  var rawValues = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

  // Process all the values before they are used when formatting the ICU
  // Message string. Since the formatted message might be injected via
  // `innerHTML`, all String-based values need to be HTML-escaped.
  var escapedValues = Object.keys(rawValues).reduce(function (escaped, name) {
    var value = rawValues[name];
    escaped[name] = typeof value === 'string' ? escape(value) : value;
    return escaped;
  }, {});

  return formatMessage(config, state, messageDescriptor, escapedValues);
}



var format = Object.freeze({
	formatDate: formatDate,
	formatTime: formatTime,
	formatRelative: formatRelative,
	formatNumber: formatNumber,
	formatPlural: formatPlural,
	formatMessage: formatMessage,
	formatHTMLMessage: formatHTMLMessage
});

/*
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */

var intlConfigPropNames$1 = Object.keys(intlConfigPropTypes);
var intlFormatPropNames = Object.keys(intlFormatPropTypes);

// These are not a static property on the `IntlProvider` class so the intl
// config values can be inherited from an <IntlProvider> ancestor.
var defaultProps = {
  formats: {},
  messages: {},
  textComponent: 'span',

  defaultLocale: 'en',
  defaultFormats: {}
};

var IntlProvider = function (_Component) {
  inherits(IntlProvider, _Component);

  function IntlProvider(props) {
    var context = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    classCallCheck(this, IntlProvider);

    var _this = possibleConstructorReturn(this, (IntlProvider.__proto__ || Object.getPrototypeOf(IntlProvider)).call(this, props, context));

    __WEBPACK_IMPORTED_MODULE_5_invariant___default()(typeof Intl !== 'undefined', '[React Intl] The `Intl` APIs must be available in the runtime, ' + 'and do not appear to be built-in. An `Intl` polyfill should be loaded.\n' + 'See: http://formatjs.io/guides/runtime-environments/');

    var intlContext = context.intl;

    // Used to stabilize time when performing an initial rendering so that
    // all relative times use the same reference "now" time.

    var initialNow = void 0;
    if (isFinite(props.initialNow)) {
      initialNow = Number(props.initialNow);
    } else {
      // When an `initialNow` isn't provided via `props`, look to see an
      // <IntlProvider> exists in the ancestry and call its `now()`
      // function to propagate its value for "now".
      initialNow = intlContext ? intlContext.now() : Date.now();
    }

    // Creating `Intl*` formatters is expensive. If there's a parent
    // `<IntlProvider>`, then its formatters will be used. Otherwise, this
    // memoize the `Intl*` constructors and cache them for the lifecycle of
    // this IntlProvider instance.

    var _ref = intlContext || {},
        _ref$formatters = _ref.formatters,
        formatters = _ref$formatters === undefined ? {
      getDateTimeFormat: __WEBPACK_IMPORTED_MODULE_6_intl_format_cache___default()(Intl.DateTimeFormat),
      getNumberFormat: __WEBPACK_IMPORTED_MODULE_6_intl_format_cache___default()(Intl.NumberFormat),
      getMessageFormat: __WEBPACK_IMPORTED_MODULE_6_intl_format_cache___default()(__WEBPACK_IMPORTED_MODULE_1_intl_messageformat___default.a),
      getRelativeFormat: __WEBPACK_IMPORTED_MODULE_6_intl_format_cache___default()(__WEBPACK_IMPORTED_MODULE_2_intl_relativeformat___default.a),
      getPluralFormat: __WEBPACK_IMPORTED_MODULE_6_intl_format_cache___default()(IntlPluralFormat)
    } : _ref$formatters;

    _this.state = _extends({}, formatters, {

      // Wrapper to provide stable "now" time for initial render.
      now: function now() {
        return _this._didDisplay ? Date.now() : initialNow;
      }
    });
    return _this;
  }

  createClass(IntlProvider, [{
    key: 'getConfig',
    value: function getConfig() {
      var intlContext = this.context.intl;

      // Build a whitelisted config object from `props`, defaults, and
      // `context.intl`, if an <IntlProvider> exists in the ancestry.

      var config = filterProps(this.props, intlConfigPropNames$1, intlContext);

      // Apply default props. This must be applied last after the props have
      // been resolved and inherited from any <IntlProvider> in the ancestry.
      // This matches how React resolves `defaultProps`.
      for (var propName in defaultProps) {
        if (config[propName] === undefined) {
          config[propName] = defaultProps[propName];
        }
      }

      if (!hasLocaleData(config.locale)) {
        var _config = config,
            locale = _config.locale,
            defaultLocale = _config.defaultLocale,
            defaultFormats = _config.defaultFormats;


        if (true) {
          console.error('[React Intl] Missing locale data for locale: "' + locale + '". ' + ('Using default locale: "' + defaultLocale + '" as fallback.'));
        }

        // Since there's no registered locale data for `locale`, this will
        // fallback to the `defaultLocale` to make sure things can render.
        // The `messages` are overridden to the `defaultProps` empty object
        // to maintain referential equality across re-renders. It's assumed
        // each <FormattedMessage> contains a `defaultMessage` prop.
        config = _extends({}, config, {
          locale: defaultLocale,
          formats: defaultFormats,
          messages: defaultProps.messages
        });
      }

      return config;
    }
  }, {
    key: 'getBoundFormatFns',
    value: function getBoundFormatFns(config, state) {
      return intlFormatPropNames.reduce(function (boundFormatFns, name) {
        boundFormatFns[name] = format[name].bind(null, config, state);
        return boundFormatFns;
      }, {});
    }
  }, {
    key: 'getChildContext',
    value: function getChildContext() {
      var config = this.getConfig();

      // Bind intl factories and current config to the format functions.
      var boundFormatFns = this.getBoundFormatFns(config, this.state);

      var _state = this.state,
          now = _state.now,
          formatters = objectWithoutProperties(_state, ['now']);


      return {
        intl: _extends({}, config, boundFormatFns, {
          formatters: formatters,
          now: now
        })
      };
    }
  }, {
    key: 'shouldComponentUpdate',
    value: function shouldComponentUpdate() {
      for (var _len = arguments.length, next = Array(_len), _key = 0; _key < _len; _key++) {
        next[_key] = arguments[_key];
      }

      return shouldIntlComponentUpdate.apply(undefined, [this].concat(next));
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      this._didDisplay = true;
    }
  }, {
    key: 'render',
    value: function render() {
      return __WEBPACK_IMPORTED_MODULE_4_react__["Children"].only(this.props.children);
    }
  }]);
  return IntlProvider;
}(__WEBPACK_IMPORTED_MODULE_4_react__["Component"]);

IntlProvider.displayName = 'IntlProvider';
IntlProvider.contextTypes = {
  intl: intlShape
};
IntlProvider.childContextTypes = {
  intl: intlShape.isRequired
};
 true ? IntlProvider.propTypes = _extends({}, intlConfigPropTypes, {
  children: __WEBPACK_IMPORTED_MODULE_3_prop_types___default.a.element.isRequired,
  initialNow: __WEBPACK_IMPORTED_MODULE_3_prop_types___default.a.any
}) : void 0;

/*
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */

var FormattedDate = function (_Component) {
  inherits(FormattedDate, _Component);

  function FormattedDate(props, context) {
    classCallCheck(this, FormattedDate);

    var _this = possibleConstructorReturn(this, (FormattedDate.__proto__ || Object.getPrototypeOf(FormattedDate)).call(this, props, context));

    invariantIntlContext(context);
    return _this;
  }

  createClass(FormattedDate, [{
    key: 'shouldComponentUpdate',
    value: function shouldComponentUpdate() {
      for (var _len = arguments.length, next = Array(_len), _key = 0; _key < _len; _key++) {
        next[_key] = arguments[_key];
      }

      return shouldIntlComponentUpdate.apply(undefined, [this].concat(next));
    }
  }, {
    key: 'render',
    value: function render() {
      var _context$intl = this.context.intl,
          formatDate = _context$intl.formatDate,
          Text = _context$intl.textComponent;
      var _props = this.props,
          value = _props.value,
          children = _props.children;


      var formattedDate = formatDate(value, this.props);

      if (typeof children === 'function') {
        return children(formattedDate);
      }

      return __WEBPACK_IMPORTED_MODULE_4_react___default.a.createElement(
        Text,
        null,
        formattedDate
      );
    }
  }]);
  return FormattedDate;
}(__WEBPACK_IMPORTED_MODULE_4_react__["Component"]);

FormattedDate.displayName = 'FormattedDate';
FormattedDate.contextTypes = {
  intl: intlShape
};
 true ? FormattedDate.propTypes = _extends({}, dateTimeFormatPropTypes, {
  value: __WEBPACK_IMPORTED_MODULE_3_prop_types___default.a.any.isRequired,
  format: __WEBPACK_IMPORTED_MODULE_3_prop_types___default.a.string,
  children: __WEBPACK_IMPORTED_MODULE_3_prop_types___default.a.func
}) : void 0;

/*
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */

var FormattedTime = function (_Component) {
  inherits(FormattedTime, _Component);

  function FormattedTime(props, context) {
    classCallCheck(this, FormattedTime);

    var _this = possibleConstructorReturn(this, (FormattedTime.__proto__ || Object.getPrototypeOf(FormattedTime)).call(this, props, context));

    invariantIntlContext(context);
    return _this;
  }

  createClass(FormattedTime, [{
    key: 'shouldComponentUpdate',
    value: function shouldComponentUpdate() {
      for (var _len = arguments.length, next = Array(_len), _key = 0; _key < _len; _key++) {
        next[_key] = arguments[_key];
      }

      return shouldIntlComponentUpdate.apply(undefined, [this].concat(next));
    }
  }, {
    key: 'render',
    value: function render() {
      var _context$intl = this.context.intl,
          formatTime = _context$intl.formatTime,
          Text = _context$intl.textComponent;
      var _props = this.props,
          value = _props.value,
          children = _props.children;


      var formattedTime = formatTime(value, this.props);

      if (typeof children === 'function') {
        return children(formattedTime);
      }

      return __WEBPACK_IMPORTED_MODULE_4_react___default.a.createElement(
        Text,
        null,
        formattedTime
      );
    }
  }]);
  return FormattedTime;
}(__WEBPACK_IMPORTED_MODULE_4_react__["Component"]);

FormattedTime.displayName = 'FormattedTime';
FormattedTime.contextTypes = {
  intl: intlShape
};
 true ? FormattedTime.propTypes = _extends({}, dateTimeFormatPropTypes, {
  value: __WEBPACK_IMPORTED_MODULE_3_prop_types___default.a.any.isRequired,
  format: __WEBPACK_IMPORTED_MODULE_3_prop_types___default.a.string,
  children: __WEBPACK_IMPORTED_MODULE_3_prop_types___default.a.func
}) : void 0;

/*
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */

var SECOND = 1000;
var MINUTE = 1000 * 60;
var HOUR = 1000 * 60 * 60;
var DAY = 1000 * 60 * 60 * 24;

// The maximum timer delay value is a 32-bit signed integer.
// See: https://mdn.io/setTimeout
var MAX_TIMER_DELAY = 2147483647;

function selectUnits(delta) {
  var absDelta = Math.abs(delta);

  if (absDelta < MINUTE) {
    return 'second';
  }

  if (absDelta < HOUR) {
    return 'minute';
  }

  if (absDelta < DAY) {
    return 'hour';
  }

  // The maximum scheduled delay will be measured in days since the maximum
  // timer delay is less than the number of milliseconds in 25 days.
  return 'day';
}

function getUnitDelay(units) {
  switch (units) {
    case 'second':
      return SECOND;
    case 'minute':
      return MINUTE;
    case 'hour':
      return HOUR;
    case 'day':
      return DAY;
    default:
      return MAX_TIMER_DELAY;
  }
}

function isSameDate(a, b) {
  if (a === b) {
    return true;
  }

  var aTime = new Date(a).getTime();
  var bTime = new Date(b).getTime();

  return isFinite(aTime) && isFinite(bTime) && aTime === bTime;
}

var FormattedRelative = function (_Component) {
  inherits(FormattedRelative, _Component);

  function FormattedRelative(props, context) {
    classCallCheck(this, FormattedRelative);

    var _this = possibleConstructorReturn(this, (FormattedRelative.__proto__ || Object.getPrototypeOf(FormattedRelative)).call(this, props, context));

    invariantIntlContext(context);

    var now = isFinite(props.initialNow) ? Number(props.initialNow) : context.intl.now();

    // `now` is stored as state so that `render()` remains a function of
    // props + state, instead of accessing `Date.now()` inside `render()`.
    _this.state = { now: now };
    return _this;
  }

  createClass(FormattedRelative, [{
    key: 'scheduleNextUpdate',
    value: function scheduleNextUpdate(props, state) {
      var _this2 = this;

      // Cancel and pending update because we're scheduling a new update.
      clearTimeout(this._timer);

      var value = props.value,
          units = props.units,
          updateInterval = props.updateInterval;

      var time = new Date(value).getTime();

      // If the `updateInterval` is falsy, including `0` or we don't have a
      // valid date, then auto updates have been turned off, so we bail and
      // skip scheduling an update.
      if (!updateInterval || !isFinite(time)) {
        return;
      }

      var delta = time - state.now;
      var unitDelay = getUnitDelay(units || selectUnits(delta));
      var unitRemainder = Math.abs(delta % unitDelay);

      // We want the largest possible timer delay which will still display
      // accurate information while reducing unnecessary re-renders. The delay
      // should be until the next "interesting" moment, like a tick from
      // "1 minute ago" to "2 minutes ago" when the delta is 120,000ms.
      var delay = delta < 0 ? Math.max(updateInterval, unitDelay - unitRemainder) : Math.max(updateInterval, unitRemainder);

      this._timer = setTimeout(function () {
        _this2.setState({ now: _this2.context.intl.now() });
      }, delay);
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      this.scheduleNextUpdate(this.props, this.state);
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(_ref) {
      var nextValue = _ref.value;

      // When the `props.value` date changes, `state.now` needs to be updated,
      // and the next update can be rescheduled.
      if (!isSameDate(nextValue, this.props.value)) {
        this.setState({ now: this.context.intl.now() });
      }
    }
  }, {
    key: 'shouldComponentUpdate',
    value: function shouldComponentUpdate() {
      for (var _len = arguments.length, next = Array(_len), _key = 0; _key < _len; _key++) {
        next[_key] = arguments[_key];
      }

      return shouldIntlComponentUpdate.apply(undefined, [this].concat(next));
    }
  }, {
    key: 'componentWillUpdate',
    value: function componentWillUpdate(nextProps, nextState) {
      this.scheduleNextUpdate(nextProps, nextState);
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      clearTimeout(this._timer);
    }
  }, {
    key: 'render',
    value: function render() {
      var _context$intl = this.context.intl,
          formatRelative = _context$intl.formatRelative,
          Text = _context$intl.textComponent;
      var _props = this.props,
          value = _props.value,
          children = _props.children;


      var formattedRelative = formatRelative(value, _extends({}, this.props, this.state));

      if (typeof children === 'function') {
        return children(formattedRelative);
      }

      return __WEBPACK_IMPORTED_MODULE_4_react___default.a.createElement(
        Text,
        null,
        formattedRelative
      );
    }
  }]);
  return FormattedRelative;
}(__WEBPACK_IMPORTED_MODULE_4_react__["Component"]);

FormattedRelative.displayName = 'FormattedRelative';
FormattedRelative.contextTypes = {
  intl: intlShape
};
FormattedRelative.defaultProps = {
  updateInterval: 1000 * 10
};
 true ? FormattedRelative.propTypes = _extends({}, relativeFormatPropTypes, {
  value: __WEBPACK_IMPORTED_MODULE_3_prop_types___default.a.any.isRequired,
  format: __WEBPACK_IMPORTED_MODULE_3_prop_types___default.a.string,
  updateInterval: __WEBPACK_IMPORTED_MODULE_3_prop_types___default.a.number,
  initialNow: __WEBPACK_IMPORTED_MODULE_3_prop_types___default.a.any,
  children: __WEBPACK_IMPORTED_MODULE_3_prop_types___default.a.func
}) : void 0;

/*
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */

var FormattedNumber = function (_Component) {
  inherits(FormattedNumber, _Component);

  function FormattedNumber(props, context) {
    classCallCheck(this, FormattedNumber);

    var _this = possibleConstructorReturn(this, (FormattedNumber.__proto__ || Object.getPrototypeOf(FormattedNumber)).call(this, props, context));

    invariantIntlContext(context);
    return _this;
  }

  createClass(FormattedNumber, [{
    key: 'shouldComponentUpdate',
    value: function shouldComponentUpdate() {
      for (var _len = arguments.length, next = Array(_len), _key = 0; _key < _len; _key++) {
        next[_key] = arguments[_key];
      }

      return shouldIntlComponentUpdate.apply(undefined, [this].concat(next));
    }
  }, {
    key: 'render',
    value: function render() {
      var _context$intl = this.context.intl,
          formatNumber = _context$intl.formatNumber,
          Text = _context$intl.textComponent;
      var _props = this.props,
          value = _props.value,
          children = _props.children;


      var formattedNumber = formatNumber(value, this.props);

      if (typeof children === 'function') {
        return children(formattedNumber);
      }

      return __WEBPACK_IMPORTED_MODULE_4_react___default.a.createElement(
        Text,
        null,
        formattedNumber
      );
    }
  }]);
  return FormattedNumber;
}(__WEBPACK_IMPORTED_MODULE_4_react__["Component"]);

FormattedNumber.displayName = 'FormattedNumber';
FormattedNumber.contextTypes = {
  intl: intlShape
};
 true ? FormattedNumber.propTypes = _extends({}, numberFormatPropTypes, {
  value: __WEBPACK_IMPORTED_MODULE_3_prop_types___default.a.any.isRequired,
  format: __WEBPACK_IMPORTED_MODULE_3_prop_types___default.a.string,
  children: __WEBPACK_IMPORTED_MODULE_3_prop_types___default.a.func
}) : void 0;

/*
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */

var FormattedPlural = function (_Component) {
  inherits(FormattedPlural, _Component);

  function FormattedPlural(props, context) {
    classCallCheck(this, FormattedPlural);

    var _this = possibleConstructorReturn(this, (FormattedPlural.__proto__ || Object.getPrototypeOf(FormattedPlural)).call(this, props, context));

    invariantIntlContext(context);
    return _this;
  }

  createClass(FormattedPlural, [{
    key: 'shouldComponentUpdate',
    value: function shouldComponentUpdate() {
      for (var _len = arguments.length, next = Array(_len), _key = 0; _key < _len; _key++) {
        next[_key] = arguments[_key];
      }

      return shouldIntlComponentUpdate.apply(undefined, [this].concat(next));
    }
  }, {
    key: 'render',
    value: function render() {
      var _context$intl = this.context.intl,
          formatPlural = _context$intl.formatPlural,
          Text = _context$intl.textComponent;
      var _props = this.props,
          value = _props.value,
          other = _props.other,
          children = _props.children;


      var pluralCategory = formatPlural(value, this.props);
      var formattedPlural = this.props[pluralCategory] || other;

      if (typeof children === 'function') {
        return children(formattedPlural);
      }

      return __WEBPACK_IMPORTED_MODULE_4_react___default.a.createElement(
        Text,
        null,
        formattedPlural
      );
    }
  }]);
  return FormattedPlural;
}(__WEBPACK_IMPORTED_MODULE_4_react__["Component"]);

FormattedPlural.displayName = 'FormattedPlural';
FormattedPlural.contextTypes = {
  intl: intlShape
};
FormattedPlural.defaultProps = {
  style: 'cardinal'
};
 true ? FormattedPlural.propTypes = _extends({}, pluralFormatPropTypes, {
  value: __WEBPACK_IMPORTED_MODULE_3_prop_types___default.a.any.isRequired,

  other: __WEBPACK_IMPORTED_MODULE_3_prop_types___default.a.node.isRequired,
  zero: __WEBPACK_IMPORTED_MODULE_3_prop_types___default.a.node,
  one: __WEBPACK_IMPORTED_MODULE_3_prop_types___default.a.node,
  two: __WEBPACK_IMPORTED_MODULE_3_prop_types___default.a.node,
  few: __WEBPACK_IMPORTED_MODULE_3_prop_types___default.a.node,
  many: __WEBPACK_IMPORTED_MODULE_3_prop_types___default.a.node,

  children: __WEBPACK_IMPORTED_MODULE_3_prop_types___default.a.func
}) : void 0;

/*
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */

var FormattedMessage = function (_Component) {
  inherits(FormattedMessage, _Component);

  function FormattedMessage(props, context) {
    classCallCheck(this, FormattedMessage);

    var _this = possibleConstructorReturn(this, (FormattedMessage.__proto__ || Object.getPrototypeOf(FormattedMessage)).call(this, props, context));

    invariantIntlContext(context);
    return _this;
  }

  createClass(FormattedMessage, [{
    key: 'shouldComponentUpdate',
    value: function shouldComponentUpdate(nextProps) {
      var values = this.props.values;
      var nextValues = nextProps.values;


      if (!shallowEquals(nextValues, values)) {
        return true;
      }

      // Since `values` has already been checked, we know they're not
      // different, so the current `values` are carried over so the shallow
      // equals comparison on the other props isn't affected by the `values`.
      var nextPropsToCheck = _extends({}, nextProps, {
        values: values
      });

      for (var _len = arguments.length, next = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        next[_key - 1] = arguments[_key];
      }

      return shouldIntlComponentUpdate.apply(undefined, [this, nextPropsToCheck].concat(next));
    }
  }, {
    key: 'render',
    value: function render() {
      var _context$intl = this.context.intl,
          formatMessage = _context$intl.formatMessage,
          Text = _context$intl.textComponent;
      var _props = this.props,
          id = _props.id,
          description = _props.description,
          defaultMessage = _props.defaultMessage,
          values = _props.values,
          _props$tagName = _props.tagName,
          Component$$1 = _props$tagName === undefined ? Text : _props$tagName,
          children = _props.children;


      var tokenDelimiter = void 0;
      var tokenizedValues = void 0;
      var elements = void 0;

      var hasValues = values && Object.keys(values).length > 0;
      if (hasValues) {
        // Creates a token with a random UID that should not be guessable or
        // conflict with other parts of the `message` string.
        var uid = Math.floor(Math.random() * 0x10000000000).toString(16);

        var generateToken = function () {
          var counter = 0;
          return function () {
            return 'ELEMENT-' + uid + '-' + (counter += 1);
          };
        }();

        // Splitting with a delimiter to support IE8. When using a regex
        // with a capture group IE8 does not include the capture group in
        // the resulting array.
        tokenDelimiter = '@__' + uid + '__@';
        tokenizedValues = {};
        elements = {};

        // Iterates over the `props` to keep track of any React Element
        // values so they can be represented by the `token` as a placeholder
        // when the `message` is formatted. This allows the formatted
        // message to then be broken-up into parts with references to the
        // React Elements inserted back in.
        Object.keys(values).forEach(function (name) {
          var value = values[name];

          if (Object(__WEBPACK_IMPORTED_MODULE_4_react__["isValidElement"])(value)) {
            var token = generateToken();
            tokenizedValues[name] = tokenDelimiter + token + tokenDelimiter;
            elements[token] = value;
          } else {
            tokenizedValues[name] = value;
          }
        });
      }

      var descriptor = { id: id, description: description, defaultMessage: defaultMessage };
      var formattedMessage = formatMessage(descriptor, tokenizedValues || values);

      var nodes = void 0;

      var hasElements = elements && Object.keys(elements).length > 0;
      if (hasElements) {
        // Split the message into parts so the React Element values captured
        // above can be inserted back into the rendered message. This
        // approach allows messages to render with React Elements while
        // keeping React's virtual diffing working properly.
        nodes = formattedMessage.split(tokenDelimiter).filter(function (part) {
          return !!part;
        }).map(function (part) {
          return elements[part] || part;
        });
      } else {
        nodes = [formattedMessage];
      }

      if (typeof children === 'function') {
        return children.apply(undefined, toConsumableArray(nodes));
      }

      // Needs to use `createElement()` instead of JSX, otherwise React will
      // warn about a missing `key` prop with rich-text message formatting.
      return __WEBPACK_IMPORTED_MODULE_4_react__["createElement"].apply(undefined, [Component$$1, null].concat(toConsumableArray(nodes)));
    }
  }]);
  return FormattedMessage;
}(__WEBPACK_IMPORTED_MODULE_4_react__["Component"]);

FormattedMessage.displayName = 'FormattedMessage';
FormattedMessage.contextTypes = {
  intl: intlShape
};
FormattedMessage.defaultProps = {
  values: {}
};
 true ? FormattedMessage.propTypes = _extends({}, messageDescriptorPropTypes, {
  values: __WEBPACK_IMPORTED_MODULE_3_prop_types___default.a.object,
  tagName: __WEBPACK_IMPORTED_MODULE_3_prop_types___default.a.string,
  children: __WEBPACK_IMPORTED_MODULE_3_prop_types___default.a.func
}) : void 0;

/*
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */

var FormattedHTMLMessage = function (_Component) {
  inherits(FormattedHTMLMessage, _Component);

  function FormattedHTMLMessage(props, context) {
    classCallCheck(this, FormattedHTMLMessage);

    var _this = possibleConstructorReturn(this, (FormattedHTMLMessage.__proto__ || Object.getPrototypeOf(FormattedHTMLMessage)).call(this, props, context));

    invariantIntlContext(context);
    return _this;
  }

  createClass(FormattedHTMLMessage, [{
    key: 'shouldComponentUpdate',
    value: function shouldComponentUpdate(nextProps) {
      var values = this.props.values;
      var nextValues = nextProps.values;


      if (!shallowEquals(nextValues, values)) {
        return true;
      }

      // Since `values` has already been checked, we know they're not
      // different, so the current `values` are carried over so the shallow
      // equals comparison on the other props isn't affected by the `values`.
      var nextPropsToCheck = _extends({}, nextProps, {
        values: values
      });

      for (var _len = arguments.length, next = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        next[_key - 1] = arguments[_key];
      }

      return shouldIntlComponentUpdate.apply(undefined, [this, nextPropsToCheck].concat(next));
    }
  }, {
    key: 'render',
    value: function render() {
      var _context$intl = this.context.intl,
          formatHTMLMessage = _context$intl.formatHTMLMessage,
          Text = _context$intl.textComponent;
      var _props = this.props,
          id = _props.id,
          description = _props.description,
          defaultMessage = _props.defaultMessage,
          rawValues = _props.values,
          _props$tagName = _props.tagName,
          Component$$1 = _props$tagName === undefined ? Text : _props$tagName,
          children = _props.children;


      var descriptor = { id: id, description: description, defaultMessage: defaultMessage };
      var formattedHTMLMessage = formatHTMLMessage(descriptor, rawValues);

      if (typeof children === 'function') {
        return children(formattedHTMLMessage);
      }

      // Since the message presumably has HTML in it, we need to set
      // `innerHTML` in order for it to be rendered and not escaped by React.
      // To be safe, all string prop values were escaped when formatting the
      // message. It is assumed that the message is not UGC, and came from the
      // developer making it more like a template.
      //
      // Note: There's a perf impact of using this component since there's no
      // way for React to do its virtual DOM diffing.
      var html = { __html: formattedHTMLMessage };
      return __WEBPACK_IMPORTED_MODULE_4_react___default.a.createElement(Component$$1, { dangerouslySetInnerHTML: html });
    }
  }]);
  return FormattedHTMLMessage;
}(__WEBPACK_IMPORTED_MODULE_4_react__["Component"]);

FormattedHTMLMessage.displayName = 'FormattedHTMLMessage';
FormattedHTMLMessage.contextTypes = {
  intl: intlShape
};
FormattedHTMLMessage.defaultProps = {
  values: {}
};
 true ? FormattedHTMLMessage.propTypes = _extends({}, messageDescriptorPropTypes, {
  values: __WEBPACK_IMPORTED_MODULE_3_prop_types___default.a.object,
  tagName: __WEBPACK_IMPORTED_MODULE_3_prop_types___default.a.string,
  children: __WEBPACK_IMPORTED_MODULE_3_prop_types___default.a.func
}) : void 0;

/*
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */

addLocaleData(defaultLocaleData);

/*
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */

addLocaleData(__WEBPACK_IMPORTED_MODULE_0__locale_data_index_js___default.a);




/***/ }),

/***/ 196:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
var _jsxFileName = '/Users/timteoh/TimCode/pulangmengundi/resources/assets/js/components/DateSelection.js';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _reactDom = __webpack_require__(10);

var _reactDom2 = _interopRequireDefault(_reactDom);

var _api = __webpack_require__(24);

var _api2 = _interopRequireDefault(_api);

var _reactBootstrap = __webpack_require__(13);

var _reactDatepicker = __webpack_require__(534);

var _reactDatepicker2 = _interopRequireDefault(_reactDatepicker);

var _moment = __webpack_require__(1);

var _moment2 = _interopRequireDefault(_moment);

__webpack_require__(543);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var DateSelection = function (_Component) {
  _inherits(DateSelection, _Component);

  function DateSelection(props) {
    _classCallCheck(this, DateSelection);

    var _this = _possibleConstructorReturn(this, (DateSelection.__proto__ || Object.getPrototypeOf(DateSelection)).call(this, props));

    _this.state = {
      startDate: props.date
    };
    _this.handleChange = _this.handleChange.bind(_this);
    return _this;
  }

  _createClass(DateSelection, [{
    key: 'handleChange',
    value: function handleChange(date) {
      // console.log("Date is %O", date)
      this.props.onChange(date);
      this.setState({
        startDate: date
      });
    }
  }, {
    key: 'render',
    value: function render() {
      return _react2.default.createElement(_reactDatepicker2.default, _defineProperty({
        timeFormat: 'HH:mm',
        dateFormat: 'LLL',
        timeIntervals: 60,
        selected: this.state.startDate,
        minDate: (0, _moment2.default)('20180501', 'YYYYMMDD'),
        maxDate: (0, _moment2.default)('20180521', 'YYYYMMDD'),
        highlightDates: [(0, _moment2.default)('20180509', 'YYYYMMDD')],
        onChange: this.handleChange,
        showTimeSelect: true, __source: {
          fileName: _jsxFileName,
          lineNumber: 30
        },
        __self: this
      }, '__self', this));
    }
  }]);

  return DateSelection;
}(_react.Component);

exports.default = DateSelection;

/***/ }),

/***/ 24:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var axios = __webpack_require__(82);
var QueryString = __webpack_require__(396);
var endpoint = '/api';

module.exports = {
  getStates: function getStates() {
    var encodedURI = window.encodeURI(endpoint + '/states');
    return axios.get(encodedURI).then(function (response) {
      return response.data;
    });
  },

  getLocations: function getLocations(state) {
    var encodedURI = window.encodeURI(endpoint + '/locations?state=' + state);
    return axios.get(encodedURI).then(function (response) {
      return response.data;
    });
  },

  submitCarpoolOffer: function submitCarpoolOffer(params) {
    var encodedURI = window.encodeURI(endpoint + '/offer');
    return axios.post(encodedURI, params, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  },

  submitCarpoolNeed: function submitCarpoolNeed(params) {
    var encodedURI = window.encodeURI(endpoint + '/need');
    return axios.post(encodedURI, params, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  },

  updateCarpoolNeed: function updateCarpoolNeed(id, params) {
    var encodedURI = window.encodeURI(endpoint + '/need/' + id);
    return axios.put(encodedURI, params, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  },

  getMyOffers: function getMyOffers() {
    var encodedURI = window.encodeURI(endpoint + '/my-offers');
    return axios.get(encodedURI).then(function (response) {
      return response.data;
    });
  },

  cancelNeed: function cancelNeed(id) {
    var encodedURI = window.encodeURI(endpoint + '/need/' + id + '/cancel');
    return axios.post(encodedURI, {}, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  },
  needSuccess: function needSuccess(id) {
    var encodedURI = window.encodeURI(endpoint + '/need/' + id + '/success');
    return axios.post(encodedURI, {}, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  },

  offerSuccess: function offerSuccess(id) {
    var encodedURI = window.encodeURI(endpoint + '/offer/' + id + '/success');
    return axios.post(encodedURI, {}, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  },

  unhideOffer: function unhideOffer(id) {
    var encodedURI = window.encodeURI(endpoint + '/offer/' + id + '/unhide');
    return axios.post(encodedURI, {}, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  },

  cancelOffer: function cancelOffer(id) {
    var encodedURI = window.encodeURI(endpoint + '/offer/' + id + '/cancel');
    return axios.post(encodedURI, {}, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  },

  getNeed: function getNeed() {
    var encodedURI = window.encodeURI(endpoint + '/my-need');
    return axios.get(encodedURI).then(function (response) {
      return response.data;
    });
  },

  getAllOffers: function getAllOffers(params) {
    var queryString = QueryString.stringify(params);
    var encodedURI = endpoint + '/offers?' + queryString;
    return axios.get(encodedURI);
  },

  getAllNeeds: function getAllNeeds(params) {
    var queryString = QueryString.stringify(params);
    var encodedURI = endpoint + '/needs?' + queryString;
    return axios.get(encodedURI);
  },

  getUser: function getUser(uuid) {
    var encodedURI = endpoint + '/user/' + uuid;
    return axios.get(encodedURI).then(function (response) {
      return response.data;
    });
  },

  getLocationMatches: function getLocationMatches() {
    var encodedURI = window.encodeURI(endpoint + '/matches');
    return axios.get(encodedURI).then(function (response) {
      return response.data;
    });
  },

  getOfferMatches: function getOfferMatches() {
    var encodedURI = window.encodeURI(endpoint + '/match-my-offers');
    return axios.get(encodedURI).then(function (response) {
      return response.data;
    });
  }

};

/***/ }),

/***/ 322:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
var _jsxFileName = '/Users/timteoh/TimCode/pulangmengundi/resources/assets/js/components/LocationSelection.js';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _reactDom = __webpack_require__(10);

var _reactDom2 = _interopRequireDefault(_reactDom);

var _api = __webpack_require__(24);

var _api2 = _interopRequireDefault(_api);

var _reactBootstrap = __webpack_require__(13);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var LocationSelection = function (_Component) {
  _inherits(LocationSelection, _Component);

  function LocationSelection(props) {
    _classCallCheck(this, LocationSelection);

    var _this = _possibleConstructorReturn(this, (LocationSelection.__proto__ || Object.getPrototypeOf(LocationSelection)).call(this, props));

    _this.state = {
      states: null,
      stateLocations: null,
      selectedLocation: null,
      selectedState: null
    };
    _this.handleStateSelect = _this.handleStateSelect.bind(_this);
    _this.handleLocationSelect = _this.handleLocationSelect.bind(_this);

    return _this;
  }

  _createClass(LocationSelection, [{
    key: 'componentWillUpdate',
    value: function componentWillUpdate(props) {
      var _this2 = this;

      if (props.initialLocation && !this.state.selectedLocation) {
        this.handleStateSelect(props.initialLocation.location_state, function () {
          _this2.handleLocationSelect(props.initialLocation);
        });
      }
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this3 = this;

      _api2.default.getStates().then(function (_ref) {
        var states = _ref.states;

        _this3.setState({
          states: states
        });
      });
    }
  }, {
    key: 'handleLocationSelect',
    value: function handleLocationSelect(selectedLocation) {
      var _this4 = this;

      this.setState({
        selectedLocation: selectedLocation
      }, function () {
        _this4.props.onChange(selectedLocation);
      });
    }
  }, {
    key: 'handleStateSelect',
    value: function handleStateSelect(selectedState, callback) {
      var _this5 = this;

      this.setState({
        selectedState: selectedState,
        selectedLocation: null
      }, function () {
        _this5.props.onChange(null);
        _api2.default.getLocations(selectedState.name).then(function (_ref2) {
          var stateLocations = _ref2.locations;

          _this5.setState({
            stateLocations: stateLocations
          });
        }).then(callback);
      });
    }
  }, {
    key: 'render',
    value: function render() {
      var _this6 = this;

      return _react2.default.createElement(
        'div',
        _defineProperty({
          __source: {
            fileName: _jsxFileName,
            lineNumber: 62
          },
          __self: this
        }, '__self', this),
        _react2.default.createElement(
          _reactBootstrap.DropdownButton,
          _defineProperty({ title: this.state.selectedState ? this.state.selectedState.name : 'State:', id: 'location-select', __source: {
              fileName: _jsxFileName,
              lineNumber: 63
            },
            __self: this
          }, '__self', this),
          this.state.states && this.state.states.map(function (state, i) {
            return _react2.default.createElement(
              _reactBootstrap.MenuItem,
              _defineProperty({
                key: i,
                onClick: function onClick(e) {
                  return _this6.handleStateSelect(state);
                },
                __source: {
                  fileName: _jsxFileName,
                  lineNumber: 69
                },
                __self: _this6
              }, '__self', _this6),
              state.name
            );
          })
        ),
        this.state.stateLocations && _react2.default.createElement(
          _reactBootstrap.DropdownButton,
          _defineProperty({ title: this.state.selectedLocation ? this.state.selectedLocation.name : 'District:', id: 'location-select', __source: {
              fileName: _jsxFileName,
              lineNumber: 77
            },
            __self: this
          }, '__self', this),
          this.state.stateLocations.map(function (location, i) {
            return _react2.default.createElement(
              _reactBootstrap.MenuItem,
              _defineProperty({
                key: i,
                onClick: function onClick(e) {
                  return _this6.handleLocationSelect(location);
                },
                __source: {
                  fileName: _jsxFileName,
                  lineNumber: 83
                },
                __self: _this6
              }, '__self', _this6),
              location.name
            );
          })
        )
      );
    }
  }]);

  return LocationSelection;
}(_react.Component);

exports.default = LocationSelection;

/***/ }),

/***/ 323:
/***/ (function(module, exports, __webpack_require__) {

var hide = __webpack_require__(29);
module.exports = function (target, src, safe) {
  for (var key in src) {
    if (safe && target[key]) target[key] = src[key];
    else hide(target, key, src[key]);
  } return target;
};


/***/ }),

/***/ 324:
/***/ (function(module, exports) {

module.exports = function (it, Constructor, name, forbiddenField) {
  if (!(it instanceof Constructor) || (forbiddenField !== undefined && forbiddenField in it)) {
    throw TypeError(name + ': incorrect invocation!');
  } return it;
};


/***/ }),

/***/ 325:
/***/ (function(module, exports, __webpack_require__) {

var isObject = __webpack_require__(27);
module.exports = function (it, TYPE) {
  if (!isObject(it) || it._t !== TYPE) throw TypeError('Incompatible receiver, ' + TYPE + ' required!');
  return it;
};


/***/ }),

/***/ 328:
/***/ (function(module, exports) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
module.exports = function(useSourceMap) {
	var list = [];

	// return the list of modules as css string
	list.toString = function toString() {
		return this.map(function (item) {
			var content = cssWithMappingToString(item, useSourceMap);
			if(item[2]) {
				return "@media " + item[2] + "{" + content + "}";
			} else {
				return content;
			}
		}).join("");
	};

	// import a list of modules into the list
	list.i = function(modules, mediaQuery) {
		if(typeof modules === "string")
			modules = [[null, modules, ""]];
		var alreadyImportedModules = {};
		for(var i = 0; i < this.length; i++) {
			var id = this[i][0];
			if(typeof id === "number")
				alreadyImportedModules[id] = true;
		}
		for(i = 0; i < modules.length; i++) {
			var item = modules[i];
			// skip already imported module
			// this implementation is not 100% perfect for weird media query combinations
			//  when a module is imported multiple times with different media queries.
			//  I hope this will never occur (Hey this way we have smaller bundles)
			if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
				if(mediaQuery && !item[2]) {
					item[2] = mediaQuery;
				} else if(mediaQuery) {
					item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
				}
				list.push(item);
			}
		}
	};
	return list;
};

function cssWithMappingToString(item, useSourceMap) {
	var content = item[1] || '';
	var cssMapping = item[3];
	if (!cssMapping) {
		return content;
	}

	if (useSourceMap && typeof btoa === 'function') {
		var sourceMapping = toComment(cssMapping);
		var sourceURLs = cssMapping.sources.map(function (source) {
			return '/*# sourceURL=' + cssMapping.sourceRoot + source + ' */'
		});

		return [content].concat(sourceURLs).concat([sourceMapping]).join('\n');
	}

	return [content].join('\n');
}

// Adapted from convert-source-map (MIT)
function toComment(sourceMap) {
	// eslint-disable-next-line no-undef
	var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap))));
	var data = 'sourceMappingURL=data:application/json;charset=utf-8;base64,' + base64;

	return '/*# ' + data + ' */';
}


/***/ }),

/***/ 329:
/***/ (function(module, exports, __webpack_require__) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

var stylesInDom = {};

var	memoize = function (fn) {
	var memo;

	return function () {
		if (typeof memo === "undefined") memo = fn.apply(this, arguments);
		return memo;
	};
};

var isOldIE = memoize(function () {
	// Test for IE <= 9 as proposed by Browserhacks
	// @see http://browserhacks.com/#hack-e71d8692f65334173fee715c222cb805
	// Tests for existence of standard globals is to allow style-loader
	// to operate correctly into non-standard environments
	// @see https://github.com/webpack-contrib/style-loader/issues/177
	return window && document && document.all && !window.atob;
});

var getElement = (function (fn) {
	var memo = {};

	return function(selector) {
		if (typeof memo[selector] === "undefined") {
			memo[selector] = fn.call(this, selector);
		}

		return memo[selector]
	};
})(function (target) {
	return document.querySelector(target)
});

var singleton = null;
var	singletonCounter = 0;
var	stylesInsertedAtTop = [];

var	fixUrls = __webpack_require__(330);

module.exports = function(list, options) {
	if (typeof DEBUG !== "undefined" && DEBUG) {
		if (typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
	}

	options = options || {};

	options.attrs = typeof options.attrs === "object" ? options.attrs : {};

	// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
	// tags it will allow on a page
	if (!options.singleton) options.singleton = isOldIE();

	// By default, add <style> tags to the <head> element
	if (!options.insertInto) options.insertInto = "head";

	// By default, add <style> tags to the bottom of the target
	if (!options.insertAt) options.insertAt = "bottom";

	var styles = listToStyles(list, options);

	addStylesToDom(styles, options);

	return function update (newList) {
		var mayRemove = [];

		for (var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];

			domStyle.refs--;
			mayRemove.push(domStyle);
		}

		if(newList) {
			var newStyles = listToStyles(newList, options);
			addStylesToDom(newStyles, options);
		}

		for (var i = 0; i < mayRemove.length; i++) {
			var domStyle = mayRemove[i];

			if(domStyle.refs === 0) {
				for (var j = 0; j < domStyle.parts.length; j++) domStyle.parts[j]();

				delete stylesInDom[domStyle.id];
			}
		}
	};
};

function addStylesToDom (styles, options) {
	for (var i = 0; i < styles.length; i++) {
		var item = styles[i];
		var domStyle = stylesInDom[item.id];

		if(domStyle) {
			domStyle.refs++;

			for(var j = 0; j < domStyle.parts.length; j++) {
				domStyle.parts[j](item.parts[j]);
			}

			for(; j < item.parts.length; j++) {
				domStyle.parts.push(addStyle(item.parts[j], options));
			}
		} else {
			var parts = [];

			for(var j = 0; j < item.parts.length; j++) {
				parts.push(addStyle(item.parts[j], options));
			}

			stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
		}
	}
}

function listToStyles (list, options) {
	var styles = [];
	var newStyles = {};

	for (var i = 0; i < list.length; i++) {
		var item = list[i];
		var id = options.base ? item[0] + options.base : item[0];
		var css = item[1];
		var media = item[2];
		var sourceMap = item[3];
		var part = {css: css, media: media, sourceMap: sourceMap};

		if(!newStyles[id]) styles.push(newStyles[id] = {id: id, parts: [part]});
		else newStyles[id].parts.push(part);
	}

	return styles;
}

function insertStyleElement (options, style) {
	var target = getElement(options.insertInto)

	if (!target) {
		throw new Error("Couldn't find a style target. This probably means that the value for the 'insertInto' parameter is invalid.");
	}

	var lastStyleElementInsertedAtTop = stylesInsertedAtTop[stylesInsertedAtTop.length - 1];

	if (options.insertAt === "top") {
		if (!lastStyleElementInsertedAtTop) {
			target.insertBefore(style, target.firstChild);
		} else if (lastStyleElementInsertedAtTop.nextSibling) {
			target.insertBefore(style, lastStyleElementInsertedAtTop.nextSibling);
		} else {
			target.appendChild(style);
		}
		stylesInsertedAtTop.push(style);
	} else if (options.insertAt === "bottom") {
		target.appendChild(style);
	} else {
		throw new Error("Invalid value for parameter 'insertAt'. Must be 'top' or 'bottom'.");
	}
}

function removeStyleElement (style) {
	if (style.parentNode === null) return false;
	style.parentNode.removeChild(style);

	var idx = stylesInsertedAtTop.indexOf(style);
	if(idx >= 0) {
		stylesInsertedAtTop.splice(idx, 1);
	}
}

function createStyleElement (options) {
	var style = document.createElement("style");

	options.attrs.type = "text/css";

	addAttrs(style, options.attrs);
	insertStyleElement(options, style);

	return style;
}

function createLinkElement (options) {
	var link = document.createElement("link");

	options.attrs.type = "text/css";
	options.attrs.rel = "stylesheet";

	addAttrs(link, options.attrs);
	insertStyleElement(options, link);

	return link;
}

function addAttrs (el, attrs) {
	Object.keys(attrs).forEach(function (key) {
		el.setAttribute(key, attrs[key]);
	});
}

function addStyle (obj, options) {
	var style, update, remove, result;

	// If a transform function was defined, run it on the css
	if (options.transform && obj.css) {
	    result = options.transform(obj.css);

	    if (result) {
	    	// If transform returns a value, use that instead of the original css.
	    	// This allows running runtime transformations on the css.
	    	obj.css = result;
	    } else {
	    	// If the transform function returns a falsy value, don't add this css.
	    	// This allows conditional loading of css
	    	return function() {
	    		// noop
	    	};
	    }
	}

	if (options.singleton) {
		var styleIndex = singletonCounter++;

		style = singleton || (singleton = createStyleElement(options));

		update = applyToSingletonTag.bind(null, style, styleIndex, false);
		remove = applyToSingletonTag.bind(null, style, styleIndex, true);

	} else if (
		obj.sourceMap &&
		typeof URL === "function" &&
		typeof URL.createObjectURL === "function" &&
		typeof URL.revokeObjectURL === "function" &&
		typeof Blob === "function" &&
		typeof btoa === "function"
	) {
		style = createLinkElement(options);
		update = updateLink.bind(null, style, options);
		remove = function () {
			removeStyleElement(style);

			if(style.href) URL.revokeObjectURL(style.href);
		};
	} else {
		style = createStyleElement(options);
		update = applyToTag.bind(null, style);
		remove = function () {
			removeStyleElement(style);
		};
	}

	update(obj);

	return function updateStyle (newObj) {
		if (newObj) {
			if (
				newObj.css === obj.css &&
				newObj.media === obj.media &&
				newObj.sourceMap === obj.sourceMap
			) {
				return;
			}

			update(obj = newObj);
		} else {
			remove();
		}
	};
}

var replaceText = (function () {
	var textStore = [];

	return function (index, replacement) {
		textStore[index] = replacement;

		return textStore.filter(Boolean).join('\n');
	};
})();

function applyToSingletonTag (style, index, remove, obj) {
	var css = remove ? "" : obj.css;

	if (style.styleSheet) {
		style.styleSheet.cssText = replaceText(index, css);
	} else {
		var cssNode = document.createTextNode(css);
		var childNodes = style.childNodes;

		if (childNodes[index]) style.removeChild(childNodes[index]);

		if (childNodes.length) {
			style.insertBefore(cssNode, childNodes[index]);
		} else {
			style.appendChild(cssNode);
		}
	}
}

function applyToTag (style, obj) {
	var css = obj.css;
	var media = obj.media;

	if(media) {
		style.setAttribute("media", media)
	}

	if(style.styleSheet) {
		style.styleSheet.cssText = css;
	} else {
		while(style.firstChild) {
			style.removeChild(style.firstChild);
		}

		style.appendChild(document.createTextNode(css));
	}
}

function updateLink (link, options, obj) {
	var css = obj.css;
	var sourceMap = obj.sourceMap;

	/*
		If convertToAbsoluteUrls isn't defined, but sourcemaps are enabled
		and there is no publicPath defined then lets turn convertToAbsoluteUrls
		on by default.  Otherwise default to the convertToAbsoluteUrls option
		directly
	*/
	var autoFixUrls = options.convertToAbsoluteUrls === undefined && sourceMap;

	if (options.convertToAbsoluteUrls || autoFixUrls) {
		css = fixUrls(css);
	}

	if (sourceMap) {
		// http://stackoverflow.com/a/26603875
		css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
	}

	var blob = new Blob([css], { type: "text/css" });

	var oldSrc = link.href;

	link.href = URL.createObjectURL(blob);

	if(oldSrc) URL.revokeObjectURL(oldSrc);
}


/***/ }),

/***/ 330:
/***/ (function(module, exports) {


/**
 * When source maps are enabled, `style-loader` uses a link element with a data-uri to
 * embed the css on the page. This breaks all relative urls because now they are relative to a
 * bundle instead of the current page.
 *
 * One solution is to only use full urls, but that may be impossible.
 *
 * Instead, this function "fixes" the relative urls to be absolute according to the current page location.
 *
 * A rudimentary test suite is located at `test/fixUrls.js` and can be run via the `npm test` command.
 *
 */

module.exports = function (css) {
  // get current location
  var location = typeof window !== "undefined" && window.location;

  if (!location) {
    throw new Error("fixUrls requires window.location");
  }

	// blank or null?
	if (!css || typeof css !== "string") {
	  return css;
  }

  var baseUrl = location.protocol + "//" + location.host;
  var currentDir = baseUrl + location.pathname.replace(/\/[^\/]*$/, "/");

	// convert each url(...)
	/*
	This regular expression is just a way to recursively match brackets within
	a string.

	 /url\s*\(  = Match on the word "url" with any whitespace after it and then a parens
	   (  = Start a capturing group
	     (?:  = Start a non-capturing group
	         [^)(]  = Match anything that isn't a parentheses
	         |  = OR
	         \(  = Match a start parentheses
	             (?:  = Start another non-capturing groups
	                 [^)(]+  = Match anything that isn't a parentheses
	                 |  = OR
	                 \(  = Match a start parentheses
	                     [^)(]*  = Match anything that isn't a parentheses
	                 \)  = Match a end parentheses
	             )  = End Group
              *\) = Match anything and then a close parens
          )  = Close non-capturing group
          *  = Match anything
       )  = Close capturing group
	 \)  = Match a close parens

	 /gi  = Get all matches, not the first.  Be case insensitive.
	 */
	var fixedCss = css.replace(/url\s*\(((?:[^)(]|\((?:[^)(]+|\([^)(]*\))*\))*)\)/gi, function(fullMatch, origUrl) {
		// strip quotes (if they exist)
		var unquotedOrigUrl = origUrl
			.trim()
			.replace(/^"(.*)"$/, function(o, $1){ return $1; })
			.replace(/^'(.*)'$/, function(o, $1){ return $1; });

		// already a full url? no change
		if (/^(#|data:|http:\/\/|https:\/\/|file:\/\/\/)/i.test(unquotedOrigUrl)) {
		  return fullMatch;
		}

		// convert the url to a full url
		var newUrl;

		if (unquotedOrigUrl.indexOf("//") === 0) {
		  	//TODO: should we add protocol?
			newUrl = unquotedOrigUrl;
		} else if (unquotedOrigUrl.indexOf("/") === 0) {
			// path should be relative to the base url
			newUrl = baseUrl + unquotedOrigUrl; // already starts with '/'
		} else {
			// path should be relative to current directory
			newUrl = currentDir + unquotedOrigUrl.replace(/^\.\//, ""); // Strip leading './'
		}

		// send back the fixed url(...)
		return "url(" + JSON.stringify(newUrl) + ")";
	});

	// send back the fixed css
	return fixedCss;
};


/***/ }),

/***/ 374:
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(375);


/***/ }),

/***/ 375:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _jsxFileName = '/Users/timteoh/TimCode/pulangmengundi/resources/assets/js/carpool.js';

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _reactDom = __webpack_require__(10);

var _reactDom2 = _interopRequireDefault(_reactDom);

var _OfferCarpool = __webpack_require__(376);

var _OfferCarpool2 = _interopRequireDefault(_OfferCarpool);

var _NeedCarpool = __webpack_require__(546);

var _NeedCarpool2 = _interopRequireDefault(_NeedCarpool);

var _MyOffers = __webpack_require__(548);

var _MyOffers2 = _interopRequireDefault(_MyOffers);

var _Carpool = __webpack_require__(574);

var _Carpool2 = _interopRequireDefault(_Carpool);

var _MyCarpoolNeed = __webpack_require__(577);

var _MyCarpoolNeed2 = _interopRequireDefault(_MyCarpoolNeed);

var _reactRouterDom = __webpack_require__(75);

var _reactBootstrap = __webpack_require__(13);

var _reactIntl = __webpack_require__(17);

var _ms = __webpack_require__(578);

var _ms2 = _interopRequireDefault(_ms);

var _bm = __webpack_require__(579);

var _bm2 = _interopRequireDefault(_bm);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

/**
 * Next, we will create a fresh React component instance and attach it to
 * the page. Then, you may begin adding components to this application
 * or customize the JavaScript scaffolding to fit your unique needs.
 */

window.__BASE_API_URL = '/api';


(0, _reactIntl.addLocaleData)([].concat(_toConsumableArray(_ms2.default)));

var messages = {
  'ms': _bm2.default
};
var language = window.locale || navigator.language.split(/[-_]/)[0]; // language without region code
_reactDom2.default.render(_react2.default.createElement(
  _reactRouterDom.BrowserRouter,
  _defineProperty({
    __source: {
      fileName: _jsxFileName,
      lineNumber: 28
    },
    __self: undefined
  }, '__self', undefined),
  _react2.default.createElement(
    _reactIntl.IntlProvider,
    _defineProperty({ locale: language, messages: messages[language], __source: {
        fileName: _jsxFileName,
        lineNumber: 29
      },
      __self: undefined
    }, '__self', undefined),
    _react2.default.createElement(
      'div',
      _defineProperty({
        __source: {
          fileName: _jsxFileName,
          lineNumber: 30
        },
        __self: undefined
      }, '__self', undefined),
      _react2.default.createElement(
        _reactBootstrap.Navbar,
        _defineProperty({ fluid: true, __source: {
            fileName: _jsxFileName,
            lineNumber: 31
          },
          __self: undefined
        }, '__self', undefined),
        _react2.default.createElement(
          _reactBootstrap.Navbar.Header,
          _defineProperty({
            __source: {
              fileName: _jsxFileName,
              lineNumber: 32
            },
            __self: undefined
          }, '__self', undefined),
          _react2.default.createElement(
            _reactBootstrap.Navbar.Brand,
            _defineProperty({
              __source: {
                fileName: _jsxFileName,
                lineNumber: 33
              },
              __self: undefined
            }, '__self', undefined),
            _react2.default.createElement(_reactBootstrap.Navbar.Toggle, _defineProperty({
              __source: {
                fileName: _jsxFileName,
                lineNumber: 34
              },
              __self: undefined
            }, '__self', undefined)),
            _react2.default.createElement(
              _reactBootstrap.Col,
              _defineProperty({ xsHidden: true, __source: {
                  fileName: _jsxFileName,
                  lineNumber: 35
                },
                __self: undefined
              }, '__self', undefined),
              window.user && _react2.default.createElement(_reactBootstrap.Image, _defineProperty({ style: { maxWidth: '40px' }, responsive: true, src: window.user.avatar_url, __source: {
                  fileName: _jsxFileName,
                  lineNumber: 36
                },
                __self: undefined
              }, '__self', undefined))
            ),
            _react2.default.createElement(
              'a',
              _defineProperty({ href: 'https://www.pulangmengundi.com', __source: {
                  fileName: _jsxFileName,
                  lineNumber: 38
                },
                __self: undefined
              }, '__self', undefined),
              _react2.default.createElement(
                'strong',
                _defineProperty({
                  __source: {
                    fileName: _jsxFileName,
                    lineNumber: 40
                  },
                  __self: undefined
                }, '__self', undefined),
                '#PULANGMENGUNDI'
              )
            )
          )
        ),
        _react2.default.createElement(
          _reactBootstrap.Navbar.Collapse,
          _defineProperty({
            __source: {
              fileName: _jsxFileName,
              lineNumber: 44
            },
            __self: undefined
          }, '__self', undefined),
          _react2.default.createElement(
            _reactBootstrap.Nav,
            _defineProperty({
              __source: {
                fileName: _jsxFileName,
                lineNumber: 45
              },
              __self: undefined
            }, '__self', undefined),
            _react2.default.createElement(
              _reactBootstrap.NavItem,
              _defineProperty({ eventKey: 1, href: '/ms', active: language == 'ms', __source: {
                  fileName: _jsxFileName,
                  lineNumber: 46
                },
                __self: undefined
              }, '__self', undefined),
              'BM'
            ),
            _react2.default.createElement(
              _reactBootstrap.NavItem,
              _defineProperty({ eventKey: 2, href: '/en', active: language == 'en', __source: {
                  fileName: _jsxFileName,
                  lineNumber: 49
                },
                __self: undefined
              }, '__self', undefined),
              'ENG'
            ),
            _react2.default.createElement(
              _reactBootstrap.NavItem,
              _defineProperty({ eventKey: 3, href: '/', __source: {
                  fileName: _jsxFileName,
                  lineNumber: 52
                },
                __self: undefined
              }, '__self', undefined),
              _react2.default.createElement(_reactIntl.FormattedMessage, _defineProperty({
                id: 'nav-carpool',
                defaultMessage: 'Carpooling',
                __source: {
                  fileName: _jsxFileName,
                  lineNumber: 53
                },
                __self: undefined
              }, '__self', undefined))
            ),
            _react2.default.createElement(
              _reactBootstrap.NavItem,
              _defineProperty({ eventKey: 4, href: 'https://subsidy.pulangmengundi.com', __source: {
                  fileName: _jsxFileName,
                  lineNumber: 58
                },
                __self: undefined
              }, '__self', undefined),
              _react2.default.createElement(_reactIntl.FormattedMessage, _defineProperty({
                id: 'nav-subsidy',
                defaultMessage: 'Subsidies',
                __source: {
                  fileName: _jsxFileName,
                  lineNumber: 59
                },
                __self: undefined
              }, '__self', undefined))
            )
          ),
          window.user && _react2.default.createElement(
            _reactBootstrap.Nav,
            _defineProperty({ pullRight: true, __source: {
                fileName: _jsxFileName,
                lineNumber: 66
              },
              __self: undefined
            }, '__self', undefined),
            _react2.default.createElement(
              _reactBootstrap.NavItem,
              _defineProperty({ eventKey: 5, href: '/logout', __source: {
                  fileName: _jsxFileName,
                  lineNumber: 67
                },
                __self: undefined
              }, '__self', undefined),
              _react2.default.createElement(_reactIntl.FormattedMessage, _defineProperty({
                id: 'nav-logout',
                defaultMessage: 'Logout',
                __source: {
                  fileName: _jsxFileName,
                  lineNumber: 68
                },
                __self: undefined
              }, '__self', undefined))
            ),
            _react2.default.createElement(_reactBootstrap.NavItem, _defineProperty({
              __source: {
                fileName: _jsxFileName,
                lineNumber: 73
              },
              __self: undefined
            }, '__self', undefined))
          ),
          _react2.default.createElement(
            _reactBootstrap.Nav,
            _defineProperty({ pullRight: true, __source: {
                fileName: _jsxFileName,
                lineNumber: 76
              },
              __self: undefined
            }, '__self', undefined),
            _react2.default.createElement(
              _reactBootstrap.NavItem,
              _defineProperty({ eventKey: 3, target: '_blank', href: 'https://www.pulangmengundi.com/guidelines.html', __source: {
                  fileName: _jsxFileName,
                  lineNumber: 77
                },
                __self: undefined
              }, '__self', undefined),
              _react2.default.createElement(_reactIntl.FormattedMessage, _defineProperty({
                id: 'nav-faq',
                defaultMessage: 'Guidelines and FAQ',
                __source: {
                  fileName: _jsxFileName,
                  lineNumber: 78
                },
                __self: undefined
              }, '__self', undefined))
            ),
            _react2.default.createElement(
              _reactBootstrap.NavItem,
              _defineProperty({ eventKey: 4, target: '_blank', href: 'https://www.pulangmengundi.com/about.html', __source: {
                  fileName: _jsxFileName,
                  lineNumber: 83
                },
                __self: undefined
              }, '__self', undefined),
              _react2.default.createElement(_reactIntl.FormattedMessage, _defineProperty({
                id: 'nav-about',
                defaultMessage: 'About',
                __source: {
                  fileName: _jsxFileName,
                  lineNumber: 84
                },
                __self: undefined
              }, '__self', undefined))
            )
          )
        )
      ),
      _react2.default.createElement(
        _reactRouterDom.Switch,
        _defineProperty({
          __source: {
            fileName: _jsxFileName,
            lineNumber: 92
          },
          __self: undefined
        }, '__self', undefined),
        _react2.default.createElement(_reactRouterDom.Route, _defineProperty({ exact: true, path: '/:locale', component: _Carpool2.default, __source: {
            fileName: _jsxFileName,
            lineNumber: 93
          },
          __self: undefined
        }, '__self', undefined)),
        _react2.default.createElement(_reactRouterDom.Route, _defineProperty({ exact: true, path: '/:locale/offer', component: _OfferCarpool2.default, __source: {
            fileName: _jsxFileName,
            lineNumber: 94
          },
          __self: undefined
        }, '__self', undefined)),
        _react2.default.createElement(_reactRouterDom.Route, _defineProperty({ exact: true, path: '/:locale/my-offers', component: _MyOffers2.default, __source: {
            fileName: _jsxFileName,
            lineNumber: 95
          },
          __self: undefined
        }, '__self', undefined)),
        _react2.default.createElement(_reactRouterDom.Route, _defineProperty({ exact: true, path: '/:locale/need', component: _NeedCarpool2.default, __source: {
            fileName: _jsxFileName,
            lineNumber: 96
          },
          __self: undefined
        }, '__self', undefined)),
        _react2.default.createElement(_reactRouterDom.Route, _defineProperty({ exact: true, path: '/:locale/my-need', component: _MyCarpoolNeed2.default, __source: {
            fileName: _jsxFileName,
            lineNumber: 97
          },
          __self: undefined
        }, '__self', undefined))
      )
    )
  )
), document.getElementById('carpool'));

/***/ }),

/***/ 376:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
var _jsxFileName = '/Users/timteoh/TimCode/pulangmengundi/resources/assets/js/components/OfferCarpool.js';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _reactDom = __webpack_require__(10);

var _reactDom2 = _interopRequireDefault(_reactDom);

var _api = __webpack_require__(24);

var _api2 = _interopRequireDefault(_api);

var _reactBootstrap = __webpack_require__(13);

var _DateSelection = __webpack_require__(196);

var _DateSelection2 = _interopRequireDefault(_DateSelection);

var _LocationSelection = __webpack_require__(322);

var _LocationSelection2 = _interopRequireDefault(_LocationSelection);

var _OfferCarpoolModal = __webpack_require__(545);

var _OfferCarpoolModal2 = _interopRequireDefault(_OfferCarpoolModal);

var _reactIntl = __webpack_require__(17);

var _moment = __webpack_require__(1);

var _moment2 = _interopRequireDefault(_moment);

var _axios = __webpack_require__(82);

var _axios2 = _interopRequireDefault(_axios);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var OfferCarpool = function (_Component) {
  _inherits(OfferCarpool, _Component);

  function OfferCarpool(props) {
    _classCallCheck(this, OfferCarpool);

    var _this = _possibleConstructorReturn(this, (OfferCarpool.__proto__ || Object.getPrototypeOf(OfferCarpool)).call(this, props));

    _this.state = {
      startLocation: null,
      pollLocation: null,
      preferredGender: null,
      information: '',
      willCarpoolFromPolls: true,
      willCarpoolToPolls: true,
      carpoolFromPollsDateTime: null,
      carpoolToPollsDateTime: null,
      contactNumber: '',
      allowEmail: true,
      allowFb: true,
      showModal: false
    };
    _this.startLocationChanged = _this.startLocationChanged.bind(_this);
    _this.pollLocationChanged = _this.pollLocationChanged.bind(_this);
    _this.handleGenderChange = _this.handleGenderChange.bind(_this);
    _this.handleInformationChange = _this.handleInformationChange.bind(_this);
    _this.handleCarpoolFromPollsDateChange = _this.handleCarpoolFromPollsDateChange.bind(_this);
    _this.handleCarpoolToPollsDateChange = _this.handleCarpoolToPollsDateChange.bind(_this);
    _this.handleContactNumberChange = _this.handleContactNumberChange.bind(_this);

    _this.handleWillCarpoolFromPollsChange = _this.handleWillCarpoolFromPollsChange.bind(_this);
    _this.handleWillCarpoolToPollsChange = _this.handleWillCarpoolToPollsChange.bind(_this);
    _this.toggleAllowFb = _this.toggleAllowFb.bind(_this);
    _this.toggleAllowEmail = _this.toggleAllowEmail.bind(_this);

    _this.setShowModal = _this.setShowModal.bind(_this);
    _this.handleSubmit = _this.handleSubmit.bind(_this);
    return _this;
  }

  _createClass(OfferCarpool, [{
    key: 'startLocationChanged',
    value: function startLocationChanged(startLocation) {
      this.setState({
        startLocation: startLocation
      });
    }
  }, {
    key: 'pollLocationChanged',
    value: function pollLocationChanged(pollLocation) {
      this.setState({
        pollLocation: pollLocation
      });
    }
  }, {
    key: 'handleGenderChange',
    value: function handleGenderChange(preferredGender) {
      this.setState({
        preferredGender: preferredGender
      });
    }
  }, {
    key: 'handleWillCarpoolFromPollsChange',
    value: function handleWillCarpoolFromPollsChange() {
      this.setState({
        willCarpoolFromPolls: !this.state.willCarpoolFromPolls
      });
    }
  }, {
    key: 'handleWillCarpoolToPollsChange',
    value: function handleWillCarpoolToPollsChange() {
      this.setState({
        willCarpoolToPolls: !this.state.willCarpoolToPolls
      });
    }
  }, {
    key: 'handleCarpoolFromPollsDateChange',
    value: function handleCarpoolFromPollsDateChange(date) {
      this.setState({
        carpoolFromPollsDateTime: date
      });
    }
  }, {
    key: 'handleCarpoolToPollsDateChange',
    value: function handleCarpoolToPollsDateChange(date) {
      this.setState({
        carpoolToPollsDateTime: date
      });
    }
  }, {
    key: 'handleInformationChange',
    value: function handleInformationChange(e) {
      this.setState({
        information: e.target.value
      });
    }
  }, {
    key: 'handleContactNumberChange',
    value: function handleContactNumberChange(e) {
      this.setState({
        contactNumber: e.target.value
      });
    }
  }, {
    key: 'toggleAllowFb',
    value: function toggleAllowFb() {
      this.setState({
        allowFb: !this.state.allowFb
      });
    }
  }, {
    key: 'toggleAllowEmail',
    value: function toggleAllowEmail() {
      this.setState({
        allowEmail: !this.state.allowEmail
      });
    }
  }, {
    key: 'setShowModal',
    value: function setShowModal(showModal) {
      var offers = [];
      if (this.state.willCarpoolToPolls && this.state.carpoolToPollsDateTime) {
        offers.push({
          contactNumber: this.state.contactNumber,
          startLocation: this.state.startLocation,
          endLocation: this.state.pollLocation,
          datetime: this.state.carpoolToPollsDateTime,
          allowEmail: this.state.allowEmail,
          allowFb: this.state.allowFb
        });
      }

      if (this.state.willCarpoolFromPolls && this.state.carpoolFromPollsDateTime) {
        offers.push({
          contactNumber: this.state.contactNumber,
          startLocation: this.state.pollLocation,
          endLocation: this.state.startLocation,
          datetime: this.state.carpoolFromPollsDateTime,
          allowEmail: this.state.allowEmail,
          allowFb: this.state.allowFb
        });
      }
      this.setState({
        showModal: showModal,
        offers: offers
      });
    }
  }, {
    key: 'getValidationState',
    value: function getValidationState() {
      // console.log("State is %O", this.state)
      var valid = this.state.pollLocation && this.state.startLocation && (this.state.willCarpoolFromPolls ? this.state.carpoolFromPollsDateTime !== null : true) && (this.state.willCarpoolToPolls ? this.state.carpoolToPollsDateTime !== null : true) && (this.state.willCarpoolFromPolls || this.state.willCarpoolToPolls) && (this.state.allowEmail || this.state.allowFb);
      return valid ? 'success' : 'warning';
    }
  }, {
    key: 'handleSubmit',
    value: function handleSubmit() {
      if (this.getValidationState() !== 'success') return;

      var apis = [];
      if (this.state.willCarpoolToPolls) {
        var params = {
          contactNumber: this.state.contactNumber,
          preferredGender: this.state.preferredGender,
          fromLocationId: this.state.startLocation.id,
          toLocationId: this.state.pollLocation.id,
          datetime: this.state.carpoolToPollsDateTime,
          allowEmail: this.state.allowEmail,
          allowFb: this.state.allowFb
        };
        apis.push(_api2.default.submitCarpoolOffer(params));
      }

      if (this.state.willCarpoolFromPolls) {
        var _params = {
          contactNumber: this.state.contactNumber,
          preferredGender: this.state.preferredGender,
          toLocationId: this.state.startLocation.id,
          fromLocationId: this.state.pollLocation.id,
          datetime: this.state.carpoolFromPollsDateTime,
          information: this.state.information,
          allowEmail: this.state.allowEmail ? 1 : 0,
          allowFb: this.state.allowFb ? 1 : 0
        };
        apis.push(_api2.default.submitCarpoolOffer(_params));
      }

      _axios2.default.all(apis).then(_axios2.default.spread(function () {
        // console.log(results)
        window.location = '/my-offers';
      }));
    }
  }, {
    key: 'render',
    value: function render() {
      var _this2 = this;

      return _react2.default.createElement(
        'div',
        _defineProperty({
          __source: {
            fileName: _jsxFileName,
            lineNumber: 194
          },
          __self: this
        }, '__self', this),
        _react2.default.createElement(
          _reactBootstrap.Panel,
          _defineProperty({ bsStyle: 'primary', __source: {
              fileName: _jsxFileName,
              lineNumber: 195
            },
            __self: this
          }, '__self', this),
          _react2.default.createElement(
            _reactBootstrap.Panel.Heading,
            _defineProperty({
              __source: {
                fileName: _jsxFileName,
                lineNumber: 196
              },
              __self: this
            }, '__self', this),
            _react2.default.createElement(
              'h3',
              _defineProperty({
                __source: {
                  fileName: _jsxFileName,
                  lineNumber: 197
                },
                __self: this
              }, '__self', this),
              _react2.default.createElement(_reactIntl.FormattedMessage, _defineProperty({
                id: 'offer.header-create',
                defaultMessage: 'Offer to create a carpool',
                __source: {
                  fileName: _jsxFileName,
                  lineNumber: 198
                },
                __self: this
              }, '__self', this))
            )
          ),
          _react2.default.createElement(
            _reactBootstrap.Panel.Body,
            _defineProperty({
              __source: {
                fileName: _jsxFileName,
                lineNumber: 204
              },
              __self: this
            }, '__self', this),
            _react2.default.createElement(
              _reactBootstrap.Alert,
              _defineProperty({ bsStyle: 'info', __source: {
                  fileName: _jsxFileName,
                  lineNumber: 205
                },
                __self: this
              }, '__self', this),
              _react2.default.createElement(_reactIntl.FormattedHTMLMessage, _defineProperty({
                id: 'offer.create-info',
                defaultMessage: 'Pick where you are leaving from and where you are going to, then check and fill in the timings for at least <strong>one</strong> direction you want to carpool for.',
                __source: {
                  fileName: _jsxFileName,
                  lineNumber: 206
                },
                __self: this
              }, '__self', this))
            ),
            _react2.default.createElement(
              _reactBootstrap.Row,
              _defineProperty({
                __source: {
                  fileName: _jsxFileName,
                  lineNumber: 211
                },
                __self: this
              }, '__self', this),
              _react2.default.createElement(
                _reactBootstrap.Col,
                _defineProperty({ md: 4, __source: {
                    fileName: _jsxFileName,
                    lineNumber: 212
                  },
                  __self: this
                }, '__self', this),
                _react2.default.createElement(
                  _reactBootstrap.Panel,
                  _defineProperty({
                    __source: {
                      fileName: _jsxFileName,
                      lineNumber: 213
                    },
                    __self: this
                  }, '__self', this),
                  _react2.default.createElement(
                    _reactBootstrap.Panel.Heading,
                    _defineProperty({
                      __source: {
                        fileName: _jsxFileName,
                        lineNumber: 214
                      },
                      __self: this
                    }, '__self', this),
                    _react2.default.createElement(_reactIntl.FormattedMessage, _defineProperty({
                      id: 'request.header-i-from',
                      defaultMessage: 'I am currently in',
                      __source: {
                        fileName: _jsxFileName,
                        lineNumber: 215
                      },
                      __self: this
                    }, '__self', this)),
                    ':'
                  ),
                  _react2.default.createElement(
                    _reactBootstrap.Panel.Body,
                    _defineProperty({
                      __source: {
                        fileName: _jsxFileName,
                        lineNumber: 220
                      },
                      __self: this
                    }, '__self', this),
                    _react2.default.createElement(_LocationSelection2.default, _defineProperty({ onChange: this.startLocationChanged, __source: {
                        fileName: _jsxFileName,
                        lineNumber: 221
                      },
                      __self: this
                    }, '__self', this))
                  )
                )
              ),
              _react2.default.createElement(
                _reactBootstrap.Col,
                _defineProperty({ md: 4, __source: {
                    fileName: _jsxFileName,
                    lineNumber: 225
                  },
                  __self: this
                }, '__self', this),
                _react2.default.createElement(
                  _reactBootstrap.Panel,
                  _defineProperty({
                    __source: {
                      fileName: _jsxFileName,
                      lineNumber: 226
                    },
                    __self: this
                  }, '__self', this),
                  _react2.default.createElement(
                    _reactBootstrap.Panel.Heading,
                    _defineProperty({
                      __source: {
                        fileName: _jsxFileName,
                        lineNumber: 227
                      },
                      __self: this
                    }, '__self', this),
                    _react2.default.createElement(_reactIntl.FormattedMessage, _defineProperty({
                      id: 'request.header-i-going',
                      defaultMessage: 'I am voting in',
                      __source: {
                        fileName: _jsxFileName,
                        lineNumber: 228
                      },
                      __self: this
                    }, '__self', this)),
                    ':'
                  ),
                  _react2.default.createElement(
                    _reactBootstrap.Panel.Body,
                    _defineProperty({
                      __source: {
                        fileName: _jsxFileName,
                        lineNumber: 233
                      },
                      __self: this
                    }, '__self', this),
                    _react2.default.createElement(_LocationSelection2.default, _defineProperty({ onChange: this.pollLocationChanged, __source: {
                        fileName: _jsxFileName,
                        lineNumber: 234
                      },
                      __self: this
                    }, '__self', this))
                  )
                )
              ),
              _react2.default.createElement(
                _reactBootstrap.Col,
                _defineProperty({ md: 4, __source: {
                    fileName: _jsxFileName,
                    lineNumber: 238
                  },
                  __self: this
                }, '__self', this),
                _react2.default.createElement(
                  _reactBootstrap.Panel,
                  _defineProperty({
                    __source: {
                      fileName: _jsxFileName,
                      lineNumber: 239
                    },
                    __self: this
                  }, '__self', this),
                  _react2.default.createElement(
                    _reactBootstrap.Panel.Heading,
                    _defineProperty({
                      __source: {
                        fileName: _jsxFileName,
                        lineNumber: 240
                      },
                      __self: this
                    }, '__self', this),
                    _react2.default.createElement(_reactIntl.FormattedMessage, _defineProperty({
                      id: 'offer.header-gender-prev',
                      defaultMessage: 'I prefer to carpool with',
                      __source: {
                        fileName: _jsxFileName,
                        lineNumber: 241
                      },
                      __self: this
                    }, '__self', this)),
                    ':'
                  ),
                  _react2.default.createElement(
                    _reactBootstrap.Panel.Body,
                    _defineProperty({
                      __source: {
                        fileName: _jsxFileName,
                        lineNumber: 246
                      },
                      __self: this
                    }, '__self', this),
                    _react2.default.createElement(
                      _reactBootstrap.Row,
                      _defineProperty({
                        __source: {
                          fileName: _jsxFileName,
                          lineNumber: 247
                        },
                        __self: this
                      }, '__self', this),
                      _react2.default.createElement(
                        _reactBootstrap.Col,
                        _defineProperty({ md: 8, xs: 4, __source: {
                            fileName: _jsxFileName,
                            lineNumber: 248
                          },
                          __self: this
                        }, '__self', this),
                        _react2.default.createElement(
                          'div',
                          _defineProperty({
                            __source: {
                              fileName: _jsxFileName,
                              lineNumber: 249
                            },
                            __self: this
                          }, '__self', this),
                          _react2.default.createElement('input', _defineProperty({
                            type: 'radio',
                            name: 'gender',
                            value: '',
                            onChange: function onChange(e) {
                              return _this2.handleGenderChange(null);
                            },
                            checked: this.state.preferredGender == null,
                            __source: {
                              fileName: _jsxFileName,
                              lineNumber: 250
                            },
                            __self: this
                          }, '__self', this)),
                          _react2.default.createElement(_reactIntl.FormattedMessage, _defineProperty({
                            id: 'offer.gender-pref-any',
                            defaultMessage: 'Any gender',
                            __source: {
                              fileName: _jsxFileName,
                              lineNumber: 257
                            },
                            __self: this
                          }, '__self', this)),
                          _react2.default.createElement('br', _defineProperty({
                            __source: {
                              fileName: _jsxFileName,
                              lineNumber: 261
                            },
                            __self: this
                          }, '__self', this)),
                          _react2.default.createElement('input', _defineProperty({
                            type: 'radio',
                            name: 'gender',
                            value: 'male',
                            onChange: function onChange(e) {
                              return _this2.handleGenderChange('male');
                            },
                            checked: this.state.preferredGender == 'male',
                            __source: {
                              fileName: _jsxFileName,
                              lineNumber: 262
                            },
                            __self: this
                          }, '__self', this)),
                          _react2.default.createElement(_reactIntl.FormattedMessage, _defineProperty({
                            id: 'offer.gender-pref-male',
                            defaultMessage: 'Male',
                            __source: {
                              fileName: _jsxFileName,
                              lineNumber: 269
                            },
                            __self: this
                          }, '__self', this)),
                          _react2.default.createElement('br', _defineProperty({
                            __source: {
                              fileName: _jsxFileName,
                              lineNumber: 273
                            },
                            __self: this
                          }, '__self', this)),
                          _react2.default.createElement('input', _defineProperty({
                            type: 'radio',
                            name: 'gender',
                            value: 'female',
                            onChange: function onChange(e) {
                              return _this2.handleGenderChange('female');
                            },
                            checked: this.state.preferredGender == 'female',
                            __source: {
                              fileName: _jsxFileName,
                              lineNumber: 274
                            },
                            __self: this
                          }, '__self', this)),
                          _react2.default.createElement(_reactIntl.FormattedMessage, _defineProperty({
                            id: 'offer.gender-pref-female',
                            defaultMessage: 'Female',
                            __source: {
                              fileName: _jsxFileName,
                              lineNumber: 281
                            },
                            __self: this
                          }, '__self', this)),
                          _react2.default.createElement('br', _defineProperty({
                            __source: {
                              fileName: _jsxFileName,
                              lineNumber: 285
                            },
                            __self: this
                          }, '__self', this))
                        )
                      )
                    )
                  )
                )
              )
            ),
            this.state.startLocation && this.state.pollLocation && _react2.default.createElement(
              'div',
              _defineProperty({
                __source: {
                  fileName: _jsxFileName,
                  lineNumber: 294
                },
                __self: this
              }, '__self', this),
              _react2.default.createElement(
                _reactBootstrap.Row,
                _defineProperty({
                  __source: {
                    fileName: _jsxFileName,
                    lineNumber: 296
                  },
                  __self: this
                }, '__self', this),
                _react2.default.createElement(
                  _reactBootstrap.Col,
                  _defineProperty({ md: 6, __source: {
                      fileName: _jsxFileName,
                      lineNumber: 297
                    },
                    __self: this
                  }, '__self', this),
                  _react2.default.createElement(
                    _reactBootstrap.Panel,
                    _defineProperty({
                      __source: {
                        fileName: _jsxFileName,
                        lineNumber: 298
                      },
                      __self: this
                    }, '__self', this),
                    _react2.default.createElement(
                      _reactBootstrap.Panel.Heading,
                      _defineProperty({
                        __source: {
                          fileName: _jsxFileName,
                          lineNumber: 299
                        },
                        __self: this
                      }, '__self', this),
                      _react2.default.createElement('input', _defineProperty({
                        type: 'checkbox',
                        onChange: this.handleWillCarpoolToPollsChange,
                        checked: this.state.willCarpoolToPolls,
                        __source: {
                          fileName: _jsxFileName,
                          lineNumber: 300
                        },
                        __self: this
                      }, '__self', this)),
                      '\xA0',
                      _react2.default.createElement(_reactIntl.FormattedMessage, _defineProperty({
                        id: 'offer.checkbox-carpool-to',
                        defaultMessage: 'I am offering a carpool TO the polls',
                        __source: {
                          fileName: _jsxFileName,
                          lineNumber: 305
                        },
                        __self: this
                      }, '__self', this))
                    ),
                    _react2.default.createElement(
                      _reactBootstrap.Panel.Body,
                      _defineProperty({
                        __source: {
                          fileName: _jsxFileName,
                          lineNumber: 310
                        },
                        __self: this
                      }, '__self', this),
                      _react2.default.createElement(
                        'div',
                        _defineProperty({
                          __source: {
                            fileName: _jsxFileName,
                            lineNumber: 311
                          },
                          __self: this
                        }, '__self', this),
                        _react2.default.createElement(_reactIntl.FormattedMessage, _defineProperty({
                          id: 'offer.info-from-time',
                          defaultMessage: 'I\'ll leave {from} for {to} at:',
                          values: {
                            from: _react2.default.createElement(
                              'strong',
                              _defineProperty({
                                __source: {
                                  fileName: _jsxFileName,
                                  lineNumber: 316
                                },
                                __self: this
                              }, '__self', this),
                              this.state.startLocation.name
                            ),
                            to: _react2.default.createElement(
                              'strong',
                              _defineProperty({
                                __source: {
                                  fileName: _jsxFileName,
                                  lineNumber: 317
                                },
                                __self: this
                              }, '__self', this),
                              this.state.pollLocation.name
                            )
                          },
                          __source: {
                            fileName: _jsxFileName,
                            lineNumber: 312
                          },
                          __self: this
                        }, '__self', this)),
                        _react2.default.createElement(_DateSelection2.default, _defineProperty({ date: this.carpoolToPollsDateTime, onChange: this.handleCarpoolToPollsDateChange, __source: {
                            fileName: _jsxFileName,
                            lineNumber: 320
                          },
                          __self: this
                        }, '__self', this))
                      )
                    )
                  )
                ),
                _react2.default.createElement(
                  _reactBootstrap.Col,
                  _defineProperty({ md: 6, __source: {
                      fileName: _jsxFileName,
                      lineNumber: 325
                    },
                    __self: this
                  }, '__self', this),
                  _react2.default.createElement(
                    _reactBootstrap.Panel,
                    _defineProperty({
                      __source: {
                        fileName: _jsxFileName,
                        lineNumber: 326
                      },
                      __self: this
                    }, '__self', this),
                    _react2.default.createElement(
                      _reactBootstrap.Panel.Heading,
                      _defineProperty({
                        __source: {
                          fileName: _jsxFileName,
                          lineNumber: 327
                        },
                        __self: this
                      }, '__self', this),
                      _react2.default.createElement('input', _defineProperty({
                        type: 'checkbox',
                        onChange: this.handleWillCarpoolFromPollsChange,
                        checked: this.state.willCarpoolFromPolls,
                        __source: {
                          fileName: _jsxFileName,
                          lineNumber: 328
                        },
                        __self: this
                      }, '__self', this)),
                      '\xA0',
                      _react2.default.createElement(_reactIntl.FormattedMessage, _defineProperty({
                        id: 'offer.checkbox-carpool-back',
                        defaultMessage: 'I am offering a carpool BACK after the polls',
                        __source: {
                          fileName: _jsxFileName,
                          lineNumber: 333
                        },
                        __self: this
                      }, '__self', this))
                    ),
                    _react2.default.createElement(
                      _reactBootstrap.Panel.Body,
                      _defineProperty({
                        __source: {
                          fileName: _jsxFileName,
                          lineNumber: 338
                        },
                        __self: this
                      }, '__self', this),
                      _react2.default.createElement(
                        'div',
                        _defineProperty({
                          __source: {
                            fileName: _jsxFileName,
                            lineNumber: 339
                          },
                          __self: this
                        }, '__self', this),
                        _react2.default.createElement(_reactIntl.FormattedMessage, _defineProperty({
                          id: 'offer.info-come-back-time',
                          defaultMessage: 'I\'ll leave {from} for {to} at:',
                          values: {
                            from: _react2.default.createElement(
                              'strong',
                              _defineProperty({
                                __source: {
                                  fileName: _jsxFileName,
                                  lineNumber: 344
                                },
                                __self: this
                              }, '__self', this),
                              this.state.pollLocation.name
                            ),
                            to: _react2.default.createElement(
                              'strong',
                              _defineProperty({
                                __source: {
                                  fileName: _jsxFileName,
                                  lineNumber: 345
                                },
                                __self: this
                              }, '__self', this),
                              this.state.startLocation.name
                            )
                          },
                          __source: {
                            fileName: _jsxFileName,
                            lineNumber: 340
                          },
                          __self: this
                        }, '__self', this)),
                        _react2.default.createElement(_DateSelection2.default, _defineProperty({ date: this.carpoolFromPollsDateTime, onChange: this.handleCarpoolFromPollsDateChange, __source: {
                            fileName: _jsxFileName,
                            lineNumber: 348
                          },
                          __self: this
                        }, '__self', this))
                      )
                    )
                  )
                )
              ),
              _react2.default.createElement(
                _reactBootstrap.Row,
                _defineProperty({
                  __source: {
                    fileName: _jsxFileName,
                    lineNumber: 354
                  },
                  __self: this
                }, '__self', this),
                _react2.default.createElement(
                  _reactBootstrap.Col,
                  _defineProperty({ md: 6, __source: {
                      fileName: _jsxFileName,
                      lineNumber: 355
                    },
                    __self: this
                  }, '__self', this),
                  _react2.default.createElement(
                    _reactBootstrap.Panel,
                    _defineProperty({
                      __source: {
                        fileName: _jsxFileName,
                        lineNumber: 356
                      },
                      __self: this
                    }, '__self', this),
                    _react2.default.createElement(
                      _reactBootstrap.Panel.Heading,
                      _defineProperty({
                        __source: {
                          fileName: _jsxFileName,
                          lineNumber: 357
                        },
                        __self: this
                      }, '__self', this),
                      _react2.default.createElement(_reactIntl.FormattedMessage, _defineProperty({
                        id: 'request.create-header-more-info',
                        defaultMessage: 'More information',
                        __source: {
                          fileName: _jsxFileName,
                          lineNumber: 358
                        },
                        __self: this
                      }, '__self', this))
                    ),
                    _react2.default.createElement(
                      _reactBootstrap.Panel.Body,
                      _defineProperty({
                        __source: {
                          fileName: _jsxFileName,
                          lineNumber: 363
                        },
                        __self: this
                      }, '__self', this),
                      _react2.default.createElement(_reactBootstrap.FormControl, _defineProperty({
                        componentClass: 'textarea',
                        rows: 8,
                        placeholder: 'Leave more details here',
                        value: this.state.information,
                        onChange: this.handleInformationChange, __source: {
                          fileName: _jsxFileName,
                          lineNumber: 364
                        },
                        __self: this
                      }, '__self', this))
                    )
                  )
                ),
                _react2.default.createElement(
                  _reactBootstrap.Col,
                  _defineProperty({ md: 4, __source: {
                      fileName: _jsxFileName,
                      lineNumber: 373
                    },
                    __self: this
                  }, '__self', this),
                  _react2.default.createElement(
                    _reactBootstrap.Panel,
                    _defineProperty({
                      __source: {
                        fileName: _jsxFileName,
                        lineNumber: 374
                      },
                      __self: this
                    }, '__self', this),
                    _react2.default.createElement(
                      _reactBootstrap.Panel.Heading,
                      _defineProperty({
                        __source: {
                          fileName: _jsxFileName,
                          lineNumber: 375
                        },
                        __self: this
                      }, '__self', this),
                      _react2.default.createElement(_reactIntl.FormattedMessage, _defineProperty({
                        id: 'request.create-header-what-to-show',
                        defaultMessage: 'What info to show potential matches',
                        __source: {
                          fileName: _jsxFileName,
                          lineNumber: 376
                        },
                        __self: this
                      }, '__self', this))
                    ),
                    _react2.default.createElement(
                      _reactBootstrap.Panel.Body,
                      _defineProperty({
                        __source: {
                          fileName: _jsxFileName,
                          lineNumber: 381
                        },
                        __self: this
                      }, '__self', this),
                      _react2.default.createElement(
                        _reactBootstrap.Alert,
                        _defineProperty({ bsStyle: 'info', __source: {
                            fileName: _jsxFileName,
                            lineNumber: 382
                          },
                          __self: this
                        }, '__self', this),
                        _react2.default.createElement(
                          'p',
                          _defineProperty({
                            __source: {
                              fileName: _jsxFileName,
                              lineNumber: 383
                            },
                            __self: this
                          }, '__self', this),
                          _react2.default.createElement(_reactIntl.FormattedMessage, _defineProperty({
                            id: 'request.info-choose-what-to-show',
                            defaultMessage: 'Choose at least one option below, and optionally your contact number. Your information will be shown to others after they pass a captcha check.',
                            __source: {
                              fileName: _jsxFileName,
                              lineNumber: 384
                            },
                            __self: this
                          }, '__self', this))
                        ),
                        _react2.default.createElement(
                          'p',
                          _defineProperty({
                            __source: {
                              fileName: _jsxFileName,
                              lineNumber: 389
                            },
                            __self: this
                          }, '__self', this),
                          _react2.default.createElement(_reactIntl.FormattedMessage, _defineProperty({
                            id: 'request.info-choose-what-to-show-fb',
                            defaultMessage: 'If you choose to show your Facebook account, do be responsive to new FB message requests!',
                            __source: {
                              fileName: _jsxFileName,
                              lineNumber: 390
                            },
                            __self: this
                          }, '__self', this))
                        )
                      ),
                      _react2.default.createElement('input', _defineProperty({ type: 'checkbox', onChange: this.toggleAllowEmail, checked: this.state.allowEmail, __source: {
                          fileName: _jsxFileName,
                          lineNumber: 396
                        },
                        __self: this
                      }, '__self', this)),
                      _react2.default.createElement(_reactIntl.FormattedMessage, _defineProperty({
                        id: 'request.checkbox-show-email',
                        defaultMessage: 'Show my email address.',
                        __source: {
                          fileName: _jsxFileName,
                          lineNumber: 397
                        },
                        __self: this
                      }, '__self', this)),
                      _react2.default.createElement('br', _defineProperty({
                        __source: {
                          fileName: _jsxFileName,
                          lineNumber: 400
                        },
                        __self: this
                      }, '__self', this)),
                      _react2.default.createElement('input', _defineProperty({ type: 'checkbox', onChange: this.toggleAllowFb, checked: this.state.allowFb, __source: {
                          fileName: _jsxFileName,
                          lineNumber: 401
                        },
                        __self: this
                      }, '__self', this)),
                      _react2.default.createElement(_reactIntl.FormattedMessage, _defineProperty({
                        id: 'request.checkbox-show-fb',
                        defaultMessage: 'Show the link to my Facebook account.',
                        __source: {
                          fileName: _jsxFileName,
                          lineNumber: 402
                        },
                        __self: this
                      }, '__self', this)),
                      _react2.default.createElement('br', _defineProperty({
                        __source: {
                          fileName: _jsxFileName,
                          lineNumber: 406
                        },
                        __self: this
                      }, '__self', this)),
                      _react2.default.createElement(_reactIntl.FormattedMessage, _defineProperty({
                        id: 'request.checkbox-show-contact',
                        defaultMessage: 'Show my contact number:',
                        __source: {
                          fileName: _jsxFileName,
                          lineNumber: 407
                        },
                        __self: this
                      }, '__self', this)),
                      _react2.default.createElement('input', _defineProperty({ type: 'text', size: '20', maxLength: '20', value: this.state.contactNumber, onChange: this.handleContactNumberChange, __source: {
                          fileName: _jsxFileName,
                          lineNumber: 411
                        },
                        __self: this
                      }, '__self', this))
                    )
                  )
                )
              ),
              this.getValidationState() == 'success' && _react2.default.createElement(
                _reactBootstrap.Row,
                _defineProperty({
                  __source: {
                    fileName: _jsxFileName,
                    lineNumber: 417
                  },
                  __self: this
                }, '__self', this),
                _react2.default.createElement(
                  _reactBootstrap.Col,
                  _defineProperty({ md: 3, mdOffset: 5, xs: 6, xsOffset: 3, __source: {
                      fileName: _jsxFileName,
                      lineNumber: 418
                    },
                    __self: this
                  }, '__self', this),
                  _react2.default.createElement(
                    _reactBootstrap.FormGroup,
                    _defineProperty({ controlId: 'OfferForm', validationState: this.getValidationState(), __source: {
                        fileName: _jsxFileName,
                        lineNumber: 419
                      },
                      __self: this
                    }, '__self', this),
                    _react2.default.createElement(
                      _reactBootstrap.Button,
                      _defineProperty({
                        bsStyle: 'success',
                        onClick: function onClick(e) {
                          return _this2.setShowModal(true);
                        },
                        type: 'submit', __source: {
                          fileName: _jsxFileName,
                          lineNumber: 420
                        },
                        __self: this
                      }, '__self', this),
                      _react2.default.createElement(_reactIntl.FormattedMessage, _defineProperty({
                        id: 'offer.btn-submit',
                        defaultMessage: 'Submit carpool offer',
                        __source: {
                          fileName: _jsxFileName,
                          lineNumber: 424
                        },
                        __self: this
                      }, '__self', this))
                    )
                  )
                )
              )
            )
          )
        ),
        _react2.default.createElement(_OfferCarpoolModal2.default, _defineProperty({
          offers: this.state.offers,
          show: this.state.showModal,
          onOK: this.handleSubmit,
          onCancel: function onCancel(e) {
            return _this2.setShowModal(false);
          }, __source: {
            fileName: _jsxFileName,
            lineNumber: 437
          },
          __self: this
        }, '__self', this))
      );
    }
  }]);

  return OfferCarpool;
}(_react.Component);

exports.default = OfferCarpool;

/***/ }),

/***/ 396:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var strictUriEncode = __webpack_require__(397);
var objectAssign = __webpack_require__(53);

function encoderForArrayFormat(opts) {
	switch (opts.arrayFormat) {
		case 'index':
			return function (key, value, index) {
				return value === null ? [
					encode(key, opts),
					'[',
					index,
					']'
				].join('') : [
					encode(key, opts),
					'[',
					encode(index, opts),
					']=',
					encode(value, opts)
				].join('');
			};

		case 'bracket':
			return function (key, value) {
				return value === null ? encode(key, opts) : [
					encode(key, opts),
					'[]=',
					encode(value, opts)
				].join('');
			};

		default:
			return function (key, value) {
				return value === null ? encode(key, opts) : [
					encode(key, opts),
					'=',
					encode(value, opts)
				].join('');
			};
	}
}

function parserForArrayFormat(opts) {
	var result;

	switch (opts.arrayFormat) {
		case 'index':
			return function (key, value, accumulator) {
				result = /\[(\d*)\]$/.exec(key);

				key = key.replace(/\[\d*\]$/, '');

				if (!result) {
					accumulator[key] = value;
					return;
				}

				if (accumulator[key] === undefined) {
					accumulator[key] = {};
				}

				accumulator[key][result[1]] = value;
			};

		case 'bracket':
			return function (key, value, accumulator) {
				result = /(\[\])$/.exec(key);
				key = key.replace(/\[\]$/, '');

				if (!result) {
					accumulator[key] = value;
					return;
				} else if (accumulator[key] === undefined) {
					accumulator[key] = [value];
					return;
				}

				accumulator[key] = [].concat(accumulator[key], value);
			};

		default:
			return function (key, value, accumulator) {
				if (accumulator[key] === undefined) {
					accumulator[key] = value;
					return;
				}

				accumulator[key] = [].concat(accumulator[key], value);
			};
	}
}

function encode(value, opts) {
	if (opts.encode) {
		return opts.strict ? strictUriEncode(value) : encodeURIComponent(value);
	}

	return value;
}

function keysSorter(input) {
	if (Array.isArray(input)) {
		return input.sort();
	} else if (typeof input === 'object') {
		return keysSorter(Object.keys(input)).sort(function (a, b) {
			return Number(a) - Number(b);
		}).map(function (key) {
			return input[key];
		});
	}

	return input;
}

exports.extract = function (str) {
	return str.split('?')[1] || '';
};

exports.parse = function (str, opts) {
	opts = objectAssign({arrayFormat: 'none'}, opts);

	var formatter = parserForArrayFormat(opts);

	// Create an object with no prototype
	// https://github.com/sindresorhus/query-string/issues/47
	var ret = Object.create(null);

	if (typeof str !== 'string') {
		return ret;
	}

	str = str.trim().replace(/^(\?|#|&)/, '');

	if (!str) {
		return ret;
	}

	str.split('&').forEach(function (param) {
		var parts = param.replace(/\+/g, ' ').split('=');
		// Firefox (pre 40) decodes `%3D` to `=`
		// https://github.com/sindresorhus/query-string/pull/37
		var key = parts.shift();
		var val = parts.length > 0 ? parts.join('=') : undefined;

		// missing `=` should be `null`:
		// http://w3.org/TR/2012/WD-url-20120524/#collect-url-parameters
		val = val === undefined ? null : decodeURIComponent(val);

		formatter(decodeURIComponent(key), val, ret);
	});

	return Object.keys(ret).sort().reduce(function (result, key) {
		var val = ret[key];
		if (Boolean(val) && typeof val === 'object' && !Array.isArray(val)) {
			// Sort object keys, not values
			result[key] = keysSorter(val);
		} else {
			result[key] = val;
		}

		return result;
	}, Object.create(null));
};

exports.stringify = function (obj, opts) {
	var defaults = {
		encode: true,
		strict: true,
		arrayFormat: 'none'
	};

	opts = objectAssign(defaults, opts);

	var formatter = encoderForArrayFormat(opts);

	return obj ? Object.keys(obj).sort().map(function (key) {
		var val = obj[key];

		if (val === undefined) {
			return '';
		}

		if (val === null) {
			return encode(key, opts);
		}

		if (Array.isArray(val)) {
			var result = [];

			val.slice().forEach(function (val2) {
				if (val2 === undefined) {
					return;
				}

				result.push(formatter(key, val2, result.length));
			});

			return result.join('&');
		}

		return encode(key, opts) + '=' + encode(val, opts);
	}).filter(function (x) {
		return x.length > 0;
	}).join('&') : '';
};


/***/ }),

/***/ 397:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

module.exports = function (str) {
	return encodeURIComponent(str).replace(/[!'()*]/g, function (c) {
		return '%' + c.charCodeAt(0).toString(16).toUpperCase();
	});
};


/***/ }),

/***/ 51:
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* jshint node:true */



var IntlMessageFormat = __webpack_require__(113)['default'];

// Add all locale data to `IntlMessageFormat`. This module will be ignored when
// bundling for the browser with Browserify/Webpack.
__webpack_require__(120);

// Re-export `IntlMessageFormat` as the CommonJS default exports with all the
// locale data registered, and with English set as the default locale. Define
// the `default` prop for use with other compiled ES6 Modules.
exports = module.exports = IntlMessageFormat;
exports['default'] = exports;


/***/ }),

/***/ 52:
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*
Copyright (c) 2014, Yahoo! Inc. All rights reserved.
Copyrights licensed under the New BSD License.
See the accompanying LICENSE file for terms.
*/

/* jslint esnext: true */


exports.extend = extend;
var hop = Object.prototype.hasOwnProperty;

function extend(obj) {
    var sources = Array.prototype.slice.call(arguments, 1),
        i, len, source, key;

    for (i = 0, len = sources.length; i < len; i += 1) {
        source = sources[i];
        if (!source) { continue; }

        for (key in source) {
            if (hop.call(source, key)) {
                obj[key] = source[key];
            }
        }
    }

    return obj;
}
exports.hop = hop;

//# sourceMappingURL=utils.js.map

/***/ }),

/***/ 534:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_react__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_prop_types__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_prop_types___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_prop_types__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_classnames__ = __webpack_require__(8);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_classnames___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2_classnames__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_react_onclickoutside__ = __webpack_require__(535);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_moment__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_moment___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_4_moment__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5_react_popper__ = __webpack_require__(537);







var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};









var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();









var inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};











var possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

function generateYears(year, noOfYear, minDate, maxDate) {
  var list = [];
  for (var i = 0; i < 2 * noOfYear + 1; i++) {
    var newYear = year + noOfYear - i;
    var isInRange = true;

    if (minDate) {
      isInRange = minDate.year() <= newYear;
    }

    if (maxDate && isInRange) {
      isInRange = maxDate.year() >= newYear;
    }

    if (isInRange) {
      list.push(newYear);
    }
  }

  return list;
}

var YearDropdownOptions = function (_React$Component) {
  inherits(YearDropdownOptions, _React$Component);

  function YearDropdownOptions(props) {
    classCallCheck(this, YearDropdownOptions);

    var _this = possibleConstructorReturn(this, _React$Component.call(this, props));

    _this.renderOptions = function () {
      var selectedYear = _this.props.year;
      var options = _this.state.yearsList.map(function (year) {
        return __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
          "div",
          {
            className: selectedYear === year ? "react-datepicker__year-option --selected_year" : "react-datepicker__year-option",
            key: year,
            ref: year,
            onClick: _this.onChange.bind(_this, year)
          },
          selectedYear === year ? __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
            "span",
            { className: "react-datepicker__year-option--selected" },
            "\u2713"
          ) : "",
          year
        );
      });

      var minYear = _this.props.minDate ? _this.props.minDate.year() : null;
      var maxYear = _this.props.maxDate ? _this.props.maxDate.year() : null;

      if (!maxYear || !_this.state.yearsList.find(function (year) {
        return year === maxYear;
      })) {
        options.unshift(__WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
          "div",
          {
            className: "react-datepicker__year-option",
            ref: "upcoming",
            key: "upcoming",
            onClick: _this.incrementYears
          },
          __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement("a", { className: "react-datepicker__navigation react-datepicker__navigation--years react-datepicker__navigation--years-upcoming" })
        ));
      }

      if (!minYear || !_this.state.yearsList.find(function (year) {
        return year === minYear;
      })) {
        options.push(__WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
          "div",
          {
            className: "react-datepicker__year-option",
            ref: "previous",
            key: "previous",
            onClick: _this.decrementYears
          },
          __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement("a", { className: "react-datepicker__navigation react-datepicker__navigation--years react-datepicker__navigation--years-previous" })
        ));
      }

      return options;
    };

    _this.onChange = function (year) {
      _this.props.onChange(year);
    };

    _this.handleClickOutside = function () {
      _this.props.onCancel();
    };

    _this.shiftYears = function (amount) {
      var years = _this.state.yearsList.map(function (year) {
        return year + amount;
      });

      _this.setState({
        yearsList: years
      });
    };

    _this.incrementYears = function () {
      return _this.shiftYears(1);
    };

    _this.decrementYears = function () {
      return _this.shiftYears(-1);
    };

    var yearDropdownItemNumber = props.yearDropdownItemNumber,
        scrollableYearDropdown = props.scrollableYearDropdown;

    var noOfYear = yearDropdownItemNumber || (scrollableYearDropdown ? 10 : 5);

    _this.state = {
      yearsList: generateYears(_this.props.year, noOfYear, _this.props.minDate, _this.props.maxDate)
    };
    return _this;
  }

  YearDropdownOptions.prototype.render = function render() {
    var dropdownClass = __WEBPACK_IMPORTED_MODULE_2_classnames___default()({
      "react-datepicker__year-dropdown": true,
      "react-datepicker__year-dropdown--scrollable": this.props.scrollableYearDropdown
    });

    return __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
      "div",
      { className: dropdownClass },
      this.renderOptions()
    );
  };

  return YearDropdownOptions;
}(__WEBPACK_IMPORTED_MODULE_0_react___default.a.Component);

YearDropdownOptions.propTypes = {
  minDate: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.object,
  maxDate: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.object,
  onCancel: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.func.isRequired,
  onChange: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.func.isRequired,
  scrollableYearDropdown: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.bool,
  year: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.number.isRequired,
  yearDropdownItemNumber: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.number
};

var dayOfWeekCodes = {
  1: "mon",
  2: "tue",
  3: "wed",
  4: "thu",
  5: "fri",
  6: "sat",
  7: "sun"
};

// These functions are not exported so
// that we avoid magic strings like 'days'
function set$1(date, unit, to) {
  return date.set(unit, to);
}

function add(date, amount, unit) {
  return date.add(amount, unit);
}

function subtract(date, amount, unit) {
  return date.subtract(amount, unit);
}

function get$1(date, unit) {
  return date.get(unit);
}

function getStartOf(date, unit) {
  return date.startOf(unit);
}

// ** Date Constructors **

function newDate(point) {
  return __WEBPACK_IMPORTED_MODULE_4_moment___default()(point);
}

function newDateWithOffset(utcOffset) {
  return __WEBPACK_IMPORTED_MODULE_4_moment___default()().utc().utcOffset(utcOffset);
}

function now(maybeFixedUtcOffset) {
  if (maybeFixedUtcOffset == null) {
    return newDate();
  }
  return newDateWithOffset(maybeFixedUtcOffset);
}

function cloneDate(date) {
  return date.clone();
}

function parseDate(value, _ref) {
  var dateFormat = _ref.dateFormat,
      locale = _ref.locale;

  var m = __WEBPACK_IMPORTED_MODULE_4_moment___default()(value, dateFormat, locale || __WEBPACK_IMPORTED_MODULE_4_moment___default.a.locale(), true);
  return m.isValid() ? m : null;
}

// ** Date "Reflection" **

function isMoment(date) {
  return __WEBPACK_IMPORTED_MODULE_4_moment___default.a.isMoment(date);
}

function isDate(date) {
  return __WEBPACK_IMPORTED_MODULE_4_moment___default.a.isDate(date);
}

// ** Date Formatting **

function formatDate(date, format) {
  return date.format(format);
}

function safeDateFormat(date, _ref2) {
  var dateFormat = _ref2.dateFormat,
      locale = _ref2.locale;

  return date && date.clone().locale(locale || __WEBPACK_IMPORTED_MODULE_4_moment___default.a.locale()).format(Array.isArray(dateFormat) ? dateFormat[0] : dateFormat) || "";
}

// ** Date Setters **

function setTime(date, _ref3) {
  var hour = _ref3.hour,
      minute = _ref3.minute,
      second = _ref3.second;

  date.set({ hour: hour, minute: minute, second: second });
  return date;
}

function setMonth(date, month) {
  return set$1(date, "month", month);
}

function setYear(date, year) {
  return set$1(date, "year", year);
}



// ** Date Getters **

function getSecond(date) {
  return get$1(date, "second");
}

function getMinute(date) {
  return get$1(date, "minute");
}

function getHour(date) {
  return get$1(date, "hour");
}

// Returns day of week
function getDay(date) {
  return get$1(date, "day");
}

function getWeek(date) {
  return get$1(date, "week");
}

function getMonth(date) {
  return get$1(date, "month");
}

function getYear(date) {
  return get$1(date, "year");
}

// Returns day of month
function getDate(date) {
  return get$1(date, "date");
}



function getDayOfWeekCode(day) {
  return dayOfWeekCodes[day.isoWeekday()];
}

// *** Start of ***

function getStartOfDay(date) {
  return getStartOf(date, "day");
}

function getStartOfWeek(date) {
  return getStartOf(date, "week");
}
function getStartOfMonth(date) {
  return getStartOf(date, "month");
}

function getStartOfDate(date) {
  return getStartOf(date, "date");
}

// *** End of ***





// ** Date Math **

// *** Addition ***

function addMinutes(date, amount) {
  return add(date, amount, "minutes");
}

function addHours(date, amount) {
  return add(date, amount, "hours");
}

function addDays(date, amount) {
  return add(date, amount, "days");
}

function addWeeks(date, amount) {
  return add(date, amount, "weeks");
}

function addMonths(date, amount) {
  return add(date, amount, "months");
}

function addYears(date, amount) {
  return add(date, amount, "years");
}

// *** Subtraction ***
function subtractDays(date, amount) {
  return subtract(date, amount, "days");
}

function subtractWeeks(date, amount) {
  return subtract(date, amount, "weeks");
}

function subtractMonths(date, amount) {
  return subtract(date, amount, "months");
}

function subtractYears(date, amount) {
  return subtract(date, amount, "years");
}

// ** Date Comparison **

function isBefore(date1, date2) {
  return date1.isBefore(date2);
}

function isAfter(date1, date2) {
  return date1.isAfter(date2);
}



function isSameYear(date1, date2) {
  if (date1 && date2) {
    return date1.isSame(date2, "year");
  } else {
    return !date1 && !date2;
  }
}

function isSameMonth(date1, date2) {
  if (date1 && date2) {
    return date1.isSame(date2, "month");
  } else {
    return !date1 && !date2;
  }
}

function isSameDay(moment1, moment2) {
  if (moment1 && moment2) {
    return moment1.isSame(moment2, "day");
  } else {
    return !moment1 && !moment2;
  }
}



function isDayInRange(day, startDate, endDate) {
  var before = startDate.clone().startOf("day").subtract(1, "seconds");
  var after = endDate.clone().startOf("day").add(1, "seconds");
  return day.clone().startOf("day").isBetween(before, after);
}

// *** Diffing ***



// ** Date Localization **

function localizeDate(date, locale) {
  return date.clone().locale(locale || __WEBPACK_IMPORTED_MODULE_4_moment___default.a.locale());
}







function getLocaleData(date) {
  return date.localeData();
}

function getLocaleDataForLocale(locale) {
  return __WEBPACK_IMPORTED_MODULE_4_moment___default.a.localeData(locale);
}

function getWeekdayMinInLocale(locale, date) {
  return locale.weekdaysMin(date);
}

function getWeekdayShortInLocale(locale, date) {
  return locale.weekdaysShort(date);
}

// TODO what is this format exactly?
function getMonthInLocale(locale, date, format) {
  return locale.months(date, format);
}

function getMonthShortInLocale(locale, date) {
  return locale.monthsShort(date);
}

// ** Utils for some components **

function isDayDisabled(day) {
  var _ref4 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      minDate = _ref4.minDate,
      maxDate = _ref4.maxDate,
      excludeDates = _ref4.excludeDates,
      includeDates = _ref4.includeDates,
      filterDate = _ref4.filterDate;

  return minDate && day.isBefore(minDate, "day") || maxDate && day.isAfter(maxDate, "day") || excludeDates && excludeDates.some(function (excludeDate) {
    return isSameDay(day, excludeDate);
  }) || includeDates && !includeDates.some(function (includeDate) {
    return isSameDay(day, includeDate);
  }) || filterDate && !filterDate(day.clone()) || false;
}

function isTimeDisabled(time, disabledTimes) {
  var l = disabledTimes.length;
  for (var i = 0; i < l; i++) {
    if (disabledTimes[i].get("hours") === time.get("hours") && disabledTimes[i].get("minutes") === time.get("minutes")) {
      return true;
    }
  }

  return false;
}

function isTimeInDisabledRange(time, _ref5) {
  var minTime = _ref5.minTime,
      maxTime = _ref5.maxTime;

  if (!minTime || !maxTime) {
    throw new Error("Both minTime and maxTime props required");
  }

  var base = __WEBPACK_IMPORTED_MODULE_4_moment___default()().hours(0).minutes(0).seconds(0);
  var baseTime = base.clone().hours(time.get("hours")).minutes(time.get("minutes"));
  var min = base.clone().hours(minTime.get("hours")).minutes(minTime.get("minutes"));
  var max = base.clone().hours(maxTime.get("hours")).minutes(maxTime.get("minutes"));

  return !(baseTime.isSameOrAfter(min) && baseTime.isSameOrBefore(max));
}

function allDaysDisabledBefore(day, unit) {
  var _ref6 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
      minDate = _ref6.minDate,
      includeDates = _ref6.includeDates;

  var dateBefore = day.clone().subtract(1, unit);
  return minDate && dateBefore.isBefore(minDate, unit) || includeDates && includeDates.every(function (includeDate) {
    return dateBefore.isBefore(includeDate, unit);
  }) || false;
}

function allDaysDisabledAfter(day, unit) {
  var _ref7 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
      maxDate = _ref7.maxDate,
      includeDates = _ref7.includeDates;

  var dateAfter = day.clone().add(1, unit);
  return maxDate && dateAfter.isAfter(maxDate, unit) || includeDates && includeDates.every(function (includeDate) {
    return dateAfter.isAfter(includeDate, unit);
  }) || false;
}

function getEffectiveMinDate(_ref8) {
  var minDate = _ref8.minDate,
      includeDates = _ref8.includeDates;

  if (includeDates && minDate) {
    return __WEBPACK_IMPORTED_MODULE_4_moment___default.a.min(includeDates.filter(function (includeDate) {
      return minDate.isSameOrBefore(includeDate, "day");
    }));
  } else if (includeDates) {
    return __WEBPACK_IMPORTED_MODULE_4_moment___default.a.min(includeDates);
  } else {
    return minDate;
  }
}

function getEffectiveMaxDate(_ref9) {
  var maxDate = _ref9.maxDate,
      includeDates = _ref9.includeDates;

  if (includeDates && maxDate) {
    return __WEBPACK_IMPORTED_MODULE_4_moment___default.a.max(includeDates.filter(function (includeDate) {
      return maxDate.isSameOrAfter(includeDate, "day");
    }));
  } else if (includeDates) {
    return __WEBPACK_IMPORTED_MODULE_4_moment___default.a.max(includeDates);
  } else {
    return maxDate;
  }
}

function getHightLightDaysMap() {
  var highlightDates = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  var defaultClassName = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "react-datepicker__day--highlighted";

  var dateClasses = new Map();
  for (var i = 0, len = highlightDates.length; i < len; i++) {
    var obj = highlightDates[i];
    if (isMoment(obj)) {
      var key = obj.format("MM.DD.YYYY");
      var classNamesArr = dateClasses.get(key) || [];
      if (!classNamesArr.includes(defaultClassName)) {
        classNamesArr.push(defaultClassName);
        dateClasses.set(key, classNamesArr);
      }
    } else if ((typeof obj === "undefined" ? "undefined" : _typeof(obj)) === "object") {
      var keys = Object.keys(obj);
      var className = keys[0];
      var arrOfMoments = obj[keys[0]];
      if (typeof className === "string" && arrOfMoments.constructor === Array) {
        for (var k = 0, _len = arrOfMoments.length; k < _len; k++) {
          var _key = arrOfMoments[k].format("MM.DD.YYYY");
          var _classNamesArr = dateClasses.get(_key) || [];
          if (!_classNamesArr.includes(className)) {
            _classNamesArr.push(className);
            dateClasses.set(_key, _classNamesArr);
          }
        }
      }
    }
  }

  return dateClasses;
}

function timesToInjectAfter(startOfDay, currentTime, currentMultiplier, intervals, injectedTimes) {
  var l = injectedTimes.length;
  var times = [];
  for (var i = 0; i < l; i++) {
    var injectedTime = addMinutes(addHours(cloneDate(startOfDay), getHour(injectedTimes[i])), getMinute(injectedTimes[i]));
    var nextTime = addMinutes(cloneDate(startOfDay), (currentMultiplier + 1) * intervals);

    if (injectedTime.isBetween(currentTime, nextTime)) {
      times.push(injectedTimes[i]);
    }
  }

  return times;
}

var WrappedYearDropdownOptions = Object(__WEBPACK_IMPORTED_MODULE_3_react_onclickoutside__["a" /* default */])(YearDropdownOptions);

var YearDropdown = function (_React$Component) {
  inherits(YearDropdown, _React$Component);

  function YearDropdown() {
    var _temp, _this, _ret;

    classCallCheck(this, YearDropdown);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = possibleConstructorReturn(this, _React$Component.call.apply(_React$Component, [this].concat(args))), _this), _this.state = {
      dropdownVisible: false
    }, _this.renderSelectOptions = function () {
      var minYear = _this.props.minDate ? getYear(_this.props.minDate) : 1900;
      var maxYear = _this.props.maxDate ? getYear(_this.props.maxDate) : 2100;

      var options = [];
      for (var i = minYear; i <= maxYear; i++) {
        options.push(__WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
          "option",
          { key: i, value: i },
          i
        ));
      }
      return options;
    }, _this.onSelectChange = function (e) {
      _this.onChange(e.target.value);
    }, _this.renderSelectMode = function () {
      return __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
        "select",
        {
          value: _this.props.year,
          className: "react-datepicker__year-select",
          onChange: _this.onSelectChange
        },
        _this.renderSelectOptions()
      );
    }, _this.renderReadView = function (visible) {
      return __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
        "div",
        {
          key: "read",
          style: { visibility: visible ? "visible" : "hidden" },
          className: "react-datepicker__year-read-view",
          onClick: function onClick(event) {
            return _this.toggleDropdown(event);
          }
        },
        __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement("span", { className: "react-datepicker__year-read-view--down-arrow" }),
        __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
          "span",
          { className: "react-datepicker__year-read-view--selected-year" },
          _this.props.year
        )
      );
    }, _this.renderDropdown = function () {
      return __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(WrappedYearDropdownOptions, {
        key: "dropdown",
        ref: "options",
        year: _this.props.year,
        onChange: _this.onChange,
        onCancel: _this.toggleDropdown,
        minDate: _this.props.minDate,
        maxDate: _this.props.maxDate,
        scrollableYearDropdown: _this.props.scrollableYearDropdown,
        yearDropdownItemNumber: _this.props.yearDropdownItemNumber
      });
    }, _this.renderScrollMode = function () {
      var dropdownVisible = _this.state.dropdownVisible;

      var result = [_this.renderReadView(!dropdownVisible)];
      if (dropdownVisible) {
        result.unshift(_this.renderDropdown());
      }
      return result;
    }, _this.onChange = function (year) {
      _this.toggleDropdown();
      if (year === _this.props.year) return;
      _this.props.onChange(year);
    }, _this.toggleDropdown = function (event) {
      _this.setState({
        dropdownVisible: !_this.state.dropdownVisible
      }, function () {
        if (_this.props.adjustDateOnChange) {
          _this.handleYearChange(_this.props.date, event);
        }
      });
    }, _this.handleYearChange = function (date, event) {
      _this.onSelect(date, event);
      _this.setOpen();
    }, _this.onSelect = function (date, event) {
      if (_this.props.onSelect) {
        _this.props.onSelect(date, event);
      }
    }, _this.setOpen = function () {
      if (_this.props.setOpen) {
        _this.props.setOpen(true);
      }
    }, _temp), possibleConstructorReturn(_this, _ret);
  }

  YearDropdown.prototype.render = function render() {
    var renderedDropdown = void 0;
    switch (this.props.dropdownMode) {
      case "scroll":
        renderedDropdown = this.renderScrollMode();
        break;
      case "select":
        renderedDropdown = this.renderSelectMode();
        break;
    }

    return __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
      "div",
      {
        className: "react-datepicker__year-dropdown-container react-datepicker__year-dropdown-container--" + this.props.dropdownMode
      },
      renderedDropdown
    );
  };

  return YearDropdown;
}(__WEBPACK_IMPORTED_MODULE_0_react___default.a.Component);

YearDropdown.propTypes = {
  adjustDateOnChange: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.bool,
  dropdownMode: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.oneOf(["scroll", "select"]).isRequired,
  maxDate: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.object,
  minDate: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.object,
  onChange: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.func.isRequired,
  scrollableYearDropdown: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.bool,
  year: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.number.isRequired,
  yearDropdownItemNumber: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.number,
  date: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.object,
  onSelect: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.func,
  setOpen: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.func
};

var MonthDropdownOptions = function (_React$Component) {
  inherits(MonthDropdownOptions, _React$Component);

  function MonthDropdownOptions() {
    var _temp, _this, _ret;

    classCallCheck(this, MonthDropdownOptions);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = possibleConstructorReturn(this, _React$Component.call.apply(_React$Component, [this].concat(args))), _this), _this.renderOptions = function () {
      return _this.props.monthNames.map(function (month, i) {
        return __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
          "div",
          {
            className: _this.props.month === i ? "react-datepicker__month-option --selected_month" : "react-datepicker__month-option",
            key: month,
            ref: month,
            onClick: _this.onChange.bind(_this, i)
          },
          _this.props.month === i ? __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
            "span",
            { className: "react-datepicker__month-option--selected" },
            "\u2713"
          ) : "",
          month
        );
      });
    }, _this.onChange = function (month) {
      return _this.props.onChange(month);
    }, _this.handleClickOutside = function () {
      return _this.props.onCancel();
    }, _temp), possibleConstructorReturn(_this, _ret);
  }

  MonthDropdownOptions.prototype.render = function render() {
    return __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
      "div",
      { className: "react-datepicker__month-dropdown" },
      this.renderOptions()
    );
  };

  return MonthDropdownOptions;
}(__WEBPACK_IMPORTED_MODULE_0_react___default.a.Component);

MonthDropdownOptions.propTypes = {
  onCancel: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.func.isRequired,
  onChange: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.func.isRequired,
  month: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.number.isRequired,
  monthNames: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.arrayOf(__WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.string.isRequired).isRequired
};

var WrappedMonthDropdownOptions = Object(__WEBPACK_IMPORTED_MODULE_3_react_onclickoutside__["a" /* default */])(MonthDropdownOptions);

var MonthDropdown = function (_React$Component) {
  inherits(MonthDropdown, _React$Component);

  function MonthDropdown() {
    var _temp, _this, _ret;

    classCallCheck(this, MonthDropdown);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = possibleConstructorReturn(this, _React$Component.call.apply(_React$Component, [this].concat(args))), _this), _this.state = {
      dropdownVisible: false
    }, _this.renderSelectOptions = function (monthNames) {
      return monthNames.map(function (M, i) {
        return __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
          "option",
          { key: i, value: i },
          M
        );
      });
    }, _this.renderSelectMode = function (monthNames) {
      return __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
        "select",
        {
          value: _this.props.month,
          className: "react-datepicker__month-select",
          onChange: function onChange(e) {
            return _this.onChange(e.target.value);
          }
        },
        _this.renderSelectOptions(monthNames)
      );
    }, _this.renderReadView = function (visible, monthNames) {
      return __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
        "div",
        {
          key: "read",
          style: { visibility: visible ? "visible" : "hidden" },
          className: "react-datepicker__month-read-view",
          onClick: _this.toggleDropdown
        },
        __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement("span", { className: "react-datepicker__month-read-view--down-arrow" }),
        __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
          "span",
          { className: "react-datepicker__month-read-view--selected-month" },
          monthNames[_this.props.month]
        )
      );
    }, _this.renderDropdown = function (monthNames) {
      return __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(WrappedMonthDropdownOptions, {
        key: "dropdown",
        ref: "options",
        month: _this.props.month,
        monthNames: monthNames,
        onChange: _this.onChange,
        onCancel: _this.toggleDropdown
      });
    }, _this.renderScrollMode = function (monthNames) {
      var dropdownVisible = _this.state.dropdownVisible;

      var result = [_this.renderReadView(!dropdownVisible, monthNames)];
      if (dropdownVisible) {
        result.unshift(_this.renderDropdown(monthNames));
      }
      return result;
    }, _this.onChange = function (month) {
      _this.toggleDropdown();
      if (month !== _this.props.month) {
        _this.props.onChange(month);
      }
    }, _this.toggleDropdown = function () {
      return _this.setState({
        dropdownVisible: !_this.state.dropdownVisible
      });
    }, _temp), possibleConstructorReturn(_this, _ret);
  }

  MonthDropdown.prototype.render = function render() {
    var _this2 = this;

    var localeData = getLocaleDataForLocale(this.props.locale);
    var monthNames = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(this.props.useShortMonthInDropdown ? function (M) {
      return getMonthShortInLocale(localeData, newDate({ M: M }));
    } : function (M) {
      return getMonthInLocale(localeData, newDate({ M: M }), _this2.props.dateFormat);
    });

    var renderedDropdown = void 0;
    switch (this.props.dropdownMode) {
      case "scroll":
        renderedDropdown = this.renderScrollMode(monthNames);
        break;
      case "select":
        renderedDropdown = this.renderSelectMode(monthNames);
        break;
    }

    return __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
      "div",
      {
        className: "react-datepicker__month-dropdown-container react-datepicker__month-dropdown-container--" + this.props.dropdownMode
      },
      renderedDropdown
    );
  };

  return MonthDropdown;
}(__WEBPACK_IMPORTED_MODULE_0_react___default.a.Component);

MonthDropdown.propTypes = {
  dropdownMode: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.oneOf(["scroll", "select"]).isRequired,
  locale: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.string,
  dateFormat: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.string.isRequired,
  month: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.number.isRequired,
  onChange: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.func.isRequired,
  useShortMonthInDropdown: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.bool
};

function generateMonthYears(minDate, maxDate) {
  var list = [];

  var currDate = getStartOfMonth(cloneDate(minDate));
  var lastDate = getStartOfMonth(cloneDate(maxDate));

  while (!isAfter(currDate, lastDate)) {
    list.push(cloneDate(currDate));

    addMonths(currDate, 1);
  }

  return list;
}

var MonthYearDropdownOptions = function (_React$Component) {
  inherits(MonthYearDropdownOptions, _React$Component);

  function MonthYearDropdownOptions(props) {
    classCallCheck(this, MonthYearDropdownOptions);

    var _this = possibleConstructorReturn(this, _React$Component.call(this, props));

    _this.renderOptions = function () {
      return _this.state.monthYearsList.map(function (monthYear) {
        var monthYearPoint = monthYear.valueOf();

        var isSameMonthYear = isSameYear(_this.props.date, monthYear) && isSameMonth(_this.props.date, monthYear);

        return __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
          "div",
          {
            className: isSameMonthYear ? "react-datepicker__month-year-option --selected_month-year" : "react-datepicker__month-year-option",
            key: monthYearPoint,
            ref: monthYearPoint,
            onClick: _this.onChange.bind(_this, monthYearPoint)
          },
          isSameMonthYear ? __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
            "span",
            { className: "react-datepicker__month-year-option--selected" },
            "\u2713"
          ) : "",
          formatDate(monthYear, _this.props.dateFormat)
        );
      });
    };

    _this.onChange = function (monthYear) {
      return _this.props.onChange(monthYear);
    };

    _this.handleClickOutside = function () {
      _this.props.onCancel();
    };

    _this.state = {
      monthYearsList: generateMonthYears(_this.props.minDate, _this.props.maxDate)
    };
    return _this;
  }

  MonthYearDropdownOptions.prototype.render = function render() {
    var dropdownClass = __WEBPACK_IMPORTED_MODULE_2_classnames___default()({
      "react-datepicker__month-year-dropdown": true,
      "react-datepicker__month-year-dropdown--scrollable": this.props.scrollableMonthYearDropdown
    });

    return __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
      "div",
      { className: dropdownClass },
      this.renderOptions()
    );
  };

  return MonthYearDropdownOptions;
}(__WEBPACK_IMPORTED_MODULE_0_react___default.a.Component);

MonthYearDropdownOptions.propTypes = {
  minDate: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.object.isRequired,
  maxDate: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.object.isRequired,
  onCancel: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.func.isRequired,
  onChange: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.func.isRequired,
  scrollableMonthYearDropdown: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.bool,
  date: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.object.isRequired,
  dateFormat: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.string.isRequired
};

var WrappedMonthYearDropdownOptions = Object(__WEBPACK_IMPORTED_MODULE_3_react_onclickoutside__["a" /* default */])(MonthYearDropdownOptions);

var MonthYearDropdown = function (_React$Component) {
  inherits(MonthYearDropdown, _React$Component);

  function MonthYearDropdown() {
    var _temp, _this, _ret;

    classCallCheck(this, MonthYearDropdown);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = possibleConstructorReturn(this, _React$Component.call.apply(_React$Component, [this].concat(args))), _this), _this.state = {
      dropdownVisible: false
    }, _this.renderSelectOptions = function () {
      var currDate = getStartOfMonth(localizeDate(_this.props.minDate, _this.props.locale));
      var lastDate = getStartOfMonth(localizeDate(_this.props.maxDate, _this.props.locale));

      var options = [];

      while (!isAfter(currDate, lastDate)) {
        var timepoint = currDate.valueOf();
        options.push(__WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
          "option",
          { key: timepoint, value: timepoint },
          formatDate(currDate, _this.props.dateFormat)
        ));

        addMonths(currDate, 1);
      }

      return options;
    }, _this.onSelectChange = function (e) {
      _this.onChange(e.target.value);
    }, _this.renderSelectMode = function () {
      return __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
        "select",
        {
          value: getStartOfMonth(_this.props.date).valueOf(),
          className: "react-datepicker__month-year-select",
          onChange: _this.onSelectChange
        },
        _this.renderSelectOptions()
      );
    }, _this.renderReadView = function (visible) {
      var yearMonth = formatDate(localizeDate(newDate(_this.props.date), _this.props.locale), _this.props.dateFormat);

      return __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
        "div",
        {
          key: "read",
          style: { visibility: visible ? "visible" : "hidden" },
          className: "react-datepicker__month-year-read-view",
          onClick: function onClick(event) {
            return _this.toggleDropdown(event);
          }
        },
        __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement("span", { className: "react-datepicker__month-year-read-view--down-arrow" }),
        __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
          "span",
          { className: "react-datepicker__month-year-read-view--selected-month-year" },
          yearMonth
        )
      );
    }, _this.renderDropdown = function () {
      return __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(WrappedMonthYearDropdownOptions, {
        key: "dropdown",
        ref: "options",
        date: _this.props.date,
        dateFormat: _this.props.dateFormat,
        onChange: _this.onChange,
        onCancel: _this.toggleDropdown,
        minDate: localizeDate(_this.props.minDate, _this.props.locale),
        maxDate: localizeDate(_this.props.maxDate, _this.props.locale),
        scrollableMonthYearDropdown: _this.props.scrollableMonthYearDropdown
      });
    }, _this.renderScrollMode = function () {
      var dropdownVisible = _this.state.dropdownVisible;

      var result = [_this.renderReadView(!dropdownVisible)];
      if (dropdownVisible) {
        result.unshift(_this.renderDropdown());
      }
      return result;
    }, _this.onChange = function (monthYearPoint) {
      _this.toggleDropdown();

      var changedDate = newDate(parseInt(monthYearPoint));

      if (isSameYear(_this.props.date, changedDate) && isSameMonth(_this.props.date, changedDate)) {
        return;
      }

      _this.props.onChange(changedDate);
    }, _this.toggleDropdown = function () {
      return _this.setState({
        dropdownVisible: !_this.state.dropdownVisible
      });
    }, _temp), possibleConstructorReturn(_this, _ret);
  }

  MonthYearDropdown.prototype.render = function render() {
    var renderedDropdown = void 0;
    switch (this.props.dropdownMode) {
      case "scroll":
        renderedDropdown = this.renderScrollMode();
        break;
      case "select":
        renderedDropdown = this.renderSelectMode();
        break;
    }

    return __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
      "div",
      {
        className: "react-datepicker__month-year-dropdown-container react-datepicker__month-year-dropdown-container--" + this.props.dropdownMode
      },
      renderedDropdown
    );
  };

  return MonthYearDropdown;
}(__WEBPACK_IMPORTED_MODULE_0_react___default.a.Component);

MonthYearDropdown.propTypes = {
  dropdownMode: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.oneOf(["scroll", "select"]).isRequired,
  dateFormat: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.string.isRequired,
  locale: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.string,
  maxDate: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.object.isRequired,
  minDate: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.object.isRequired,
  date: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.object.isRequired,
  onChange: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.func.isRequired,
  scrollableMonthYearDropdown: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.bool
};

var Day = function (_React$Component) {
  inherits(Day, _React$Component);

  function Day() {
    var _temp, _this, _ret;

    classCallCheck(this, Day);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = possibleConstructorReturn(this, _React$Component.call.apply(_React$Component, [this].concat(args))), _this), _this.handleClick = function (event) {
      if (!_this.isDisabled() && _this.props.onClick) {
        _this.props.onClick(event);
      }
    }, _this.handleMouseEnter = function (event) {
      if (!_this.isDisabled() && _this.props.onMouseEnter) {
        _this.props.onMouseEnter(event);
      }
    }, _this.isSameDay = function (other) {
      return isSameDay(_this.props.day, other);
    }, _this.isKeyboardSelected = function () {
      return !_this.props.inline && !_this.isSameDay(_this.props.selected) && _this.isSameDay(_this.props.preSelection);
    }, _this.isDisabled = function () {
      return isDayDisabled(_this.props.day, _this.props);
    }, _this.getHighLightedClass = function (defaultClassName) {
      var _this$props = _this.props,
          day = _this$props.day,
          highlightDates = _this$props.highlightDates;


      if (!highlightDates) {
        return false;
      }

      // Looking for className in the Map of {'day string, 'className'}
      var dayStr = day.format("MM.DD.YYYY");
      return highlightDates.get(dayStr);
    }, _this.isInRange = function () {
      var _this$props2 = _this.props,
          day = _this$props2.day,
          startDate = _this$props2.startDate,
          endDate = _this$props2.endDate;

      if (!startDate || !endDate) {
        return false;
      }
      return isDayInRange(day, startDate, endDate);
    }, _this.isInSelectingRange = function () {
      var _this$props3 = _this.props,
          day = _this$props3.day,
          selectsStart = _this$props3.selectsStart,
          selectsEnd = _this$props3.selectsEnd,
          selectingDate = _this$props3.selectingDate,
          startDate = _this$props3.startDate,
          endDate = _this$props3.endDate;


      if (!(selectsStart || selectsEnd) || !selectingDate || _this.isDisabled()) {
        return false;
      }

      if (selectsStart && endDate && selectingDate.isSameOrBefore(endDate)) {
        return isDayInRange(day, selectingDate, endDate);
      }

      if (selectsEnd && startDate && selectingDate.isSameOrAfter(startDate)) {
        return isDayInRange(day, startDate, selectingDate);
      }

      return false;
    }, _this.isSelectingRangeStart = function () {
      if (!_this.isInSelectingRange()) {
        return false;
      }

      var _this$props4 = _this.props,
          day = _this$props4.day,
          selectingDate = _this$props4.selectingDate,
          startDate = _this$props4.startDate,
          selectsStart = _this$props4.selectsStart;


      if (selectsStart) {
        return isSameDay(day, selectingDate);
      } else {
        return isSameDay(day, startDate);
      }
    }, _this.isSelectingRangeEnd = function () {
      if (!_this.isInSelectingRange()) {
        return false;
      }

      var _this$props5 = _this.props,
          day = _this$props5.day,
          selectingDate = _this$props5.selectingDate,
          endDate = _this$props5.endDate,
          selectsEnd = _this$props5.selectsEnd;


      if (selectsEnd) {
        return isSameDay(day, selectingDate);
      } else {
        return isSameDay(day, endDate);
      }
    }, _this.isRangeStart = function () {
      var _this$props6 = _this.props,
          day = _this$props6.day,
          startDate = _this$props6.startDate,
          endDate = _this$props6.endDate;

      if (!startDate || !endDate) {
        return false;
      }
      return isSameDay(startDate, day);
    }, _this.isRangeEnd = function () {
      var _this$props7 = _this.props,
          day = _this$props7.day,
          startDate = _this$props7.startDate,
          endDate = _this$props7.endDate;

      if (!startDate || !endDate) {
        return false;
      }
      return isSameDay(endDate, day);
    }, _this.isWeekend = function () {
      var weekday = getDay(_this.props.day);
      return weekday === 0 || weekday === 6;
    }, _this.isOutsideMonth = function () {
      return _this.props.month !== undefined && _this.props.month !== getMonth(_this.props.day);
    }, _this.getClassNames = function (date) {
      var dayClassName = _this.props.dayClassName ? _this.props.dayClassName(date) : undefined;
      return __WEBPACK_IMPORTED_MODULE_2_classnames___default()("react-datepicker__day", dayClassName, "react-datepicker__day--" + getDayOfWeekCode(_this.props.day), {
        "react-datepicker__day--disabled": _this.isDisabled(),
        "react-datepicker__day--selected": _this.isSameDay(_this.props.selected),
        "react-datepicker__day--keyboard-selected": _this.isKeyboardSelected(),
        "react-datepicker__day--range-start": _this.isRangeStart(),
        "react-datepicker__day--range-end": _this.isRangeEnd(),
        "react-datepicker__day--in-range": _this.isInRange(),
        "react-datepicker__day--in-selecting-range": _this.isInSelectingRange(),
        "react-datepicker__day--selecting-range-start": _this.isSelectingRangeStart(),
        "react-datepicker__day--selecting-range-end": _this.isSelectingRangeEnd(),
        "react-datepicker__day--today": _this.isSameDay(now(_this.props.utcOffset)),
        "react-datepicker__day--weekend": _this.isWeekend(),
        "react-datepicker__day--outside-month": _this.isOutsideMonth()
      }, _this.getHighLightedClass("react-datepicker__day--highlighted"));
    }, _temp), possibleConstructorReturn(_this, _ret);
  }

  Day.prototype.render = function render() {
    return __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
      "div",
      {
        className: this.getClassNames(this.props.day),
        onClick: this.handleClick,
        onMouseEnter: this.handleMouseEnter,
        "aria-label": "day-" + getDate(this.props.day),
        role: "option"
      },
      getDate(this.props.day)
    );
  };

  return Day;
}(__WEBPACK_IMPORTED_MODULE_0_react___default.a.Component);

Day.propTypes = {
  day: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.object.isRequired,
  dayClassName: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.func,
  endDate: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.object,
  highlightDates: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.instanceOf(Map),
  inline: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.bool,
  month: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.number,
  onClick: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.func,
  onMouseEnter: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.func,
  preSelection: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.object,
  selected: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.object,
  selectingDate: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.object,
  selectsEnd: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.bool,
  selectsStart: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.bool,
  startDate: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.object,
  utcOffset: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.number
};

var WeekNumber = function (_React$Component) {
  inherits(WeekNumber, _React$Component);

  function WeekNumber() {
    var _temp, _this, _ret;

    classCallCheck(this, WeekNumber);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = possibleConstructorReturn(this, _React$Component.call.apply(_React$Component, [this].concat(args))), _this), _this.handleClick = function (event) {
      if (_this.props.onClick) {
        _this.props.onClick(event);
      }
    }, _temp), possibleConstructorReturn(_this, _ret);
  }

  WeekNumber.prototype.render = function render() {
    var weekNumberClasses = {
      "react-datepicker__week-number": true,
      "react-datepicker__week-number--clickable": !!this.props.onClick
    };
    return __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
      "div",
      {
        className: __WEBPACK_IMPORTED_MODULE_2_classnames___default()(weekNumberClasses),
        "aria-label": "week-" + this.props.weekNumber,
        onClick: this.handleClick
      },
      this.props.weekNumber
    );
  };

  return WeekNumber;
}(__WEBPACK_IMPORTED_MODULE_0_react___default.a.Component);

WeekNumber.propTypes = {
  weekNumber: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.number.isRequired,
  onClick: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.func
};

var Week = function (_React$Component) {
  inherits(Week, _React$Component);

  function Week() {
    var _temp, _this, _ret;

    classCallCheck(this, Week);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = possibleConstructorReturn(this, _React$Component.call.apply(_React$Component, [this].concat(args))), _this), _this.handleDayClick = function (day, event) {
      if (_this.props.onDayClick) {
        _this.props.onDayClick(day, event);
      }
    }, _this.handleDayMouseEnter = function (day) {
      if (_this.props.onDayMouseEnter) {
        _this.props.onDayMouseEnter(day);
      }
    }, _this.handleWeekClick = function (day, weekNumber, event) {
      if (typeof _this.props.onWeekSelect === "function") {
        _this.props.onWeekSelect(day, weekNumber, event);
      }
    }, _this.formatWeekNumber = function (startOfWeek) {
      if (_this.props.formatWeekNumber) {
        return _this.props.formatWeekNumber(startOfWeek);
      }
      return getWeek(startOfWeek);
    }, _this.renderDays = function () {
      var startOfWeek = getStartOfWeek(cloneDate(_this.props.day));
      var days = [];
      var weekNumber = _this.formatWeekNumber(startOfWeek);
      if (_this.props.showWeekNumber) {
        var onClickAction = _this.props.onWeekSelect ? _this.handleWeekClick.bind(_this, startOfWeek, weekNumber) : undefined;
        days.push(__WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(WeekNumber, { key: "W", weekNumber: weekNumber, onClick: onClickAction }));
      }
      return days.concat([0, 1, 2, 3, 4, 5, 6].map(function (offset) {
        var day = addDays(cloneDate(startOfWeek), offset);
        return __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(Day, {
          key: offset,
          day: day,
          month: _this.props.month,
          onClick: _this.handleDayClick.bind(_this, day),
          onMouseEnter: _this.handleDayMouseEnter.bind(_this, day),
          minDate: _this.props.minDate,
          maxDate: _this.props.maxDate,
          excludeDates: _this.props.excludeDates,
          includeDates: _this.props.includeDates,
          inline: _this.props.inline,
          highlightDates: _this.props.highlightDates,
          selectingDate: _this.props.selectingDate,
          filterDate: _this.props.filterDate,
          preSelection: _this.props.preSelection,
          selected: _this.props.selected,
          selectsStart: _this.props.selectsStart,
          selectsEnd: _this.props.selectsEnd,
          startDate: _this.props.startDate,
          endDate: _this.props.endDate,
          dayClassName: _this.props.dayClassName,
          utcOffset: _this.props.utcOffset
        });
      }));
    }, _temp), possibleConstructorReturn(_this, _ret);
  }

  Week.prototype.render = function render() {
    return __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
      "div",
      { className: "react-datepicker__week" },
      this.renderDays()
    );
  };

  return Week;
}(__WEBPACK_IMPORTED_MODULE_0_react___default.a.Component);

Week.propTypes = {
  day: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.object.isRequired,
  dayClassName: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.func,
  endDate: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.object,
  excludeDates: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.array,
  filterDate: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.func,
  formatWeekNumber: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.func,
  highlightDates: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.instanceOf(Map),
  includeDates: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.array,
  inline: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.bool,
  maxDate: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.object,
  minDate: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.object,
  month: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.number,
  onDayClick: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.func,
  onDayMouseEnter: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.func,
  onWeekSelect: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.func,
  preSelection: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.object,
  selected: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.object,
  selectingDate: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.object,
  selectsEnd: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.bool,
  selectsStart: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.bool,
  showWeekNumber: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.bool,
  startDate: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.object,
  utcOffset: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.number
};

var FIXED_HEIGHT_STANDARD_WEEK_COUNT = 6;

var Month = function (_React$Component) {
  inherits(Month, _React$Component);

  function Month() {
    var _temp, _this, _ret;

    classCallCheck(this, Month);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = possibleConstructorReturn(this, _React$Component.call.apply(_React$Component, [this].concat(args))), _this), _this.handleDayClick = function (day, event) {
      if (_this.props.onDayClick) {
        _this.props.onDayClick(day, event);
      }
    }, _this.handleDayMouseEnter = function (day) {
      if (_this.props.onDayMouseEnter) {
        _this.props.onDayMouseEnter(day);
      }
    }, _this.handleMouseLeave = function () {
      if (_this.props.onMouseLeave) {
        _this.props.onMouseLeave();
      }
    }, _this.isWeekInMonth = function (startOfWeek) {
      var day = _this.props.day;
      var endOfWeek = addDays(cloneDate(startOfWeek), 6);
      return isSameMonth(startOfWeek, day) || isSameMonth(endOfWeek, day);
    }, _this.renderWeeks = function () {
      var weeks = [];
      var isFixedHeight = _this.props.fixedHeight;
      var currentWeekStart = getStartOfWeek(getStartOfMonth(cloneDate(_this.props.day)));
      var i = 0;
      var breakAfterNextPush = false;

      while (true) {
        weeks.push(__WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(Week, {
          key: i,
          day: currentWeekStart,
          month: getMonth(_this.props.day),
          onDayClick: _this.handleDayClick,
          onDayMouseEnter: _this.handleDayMouseEnter,
          onWeekSelect: _this.props.onWeekSelect,
          formatWeekNumber: _this.props.formatWeekNumber,
          minDate: _this.props.minDate,
          maxDate: _this.props.maxDate,
          excludeDates: _this.props.excludeDates,
          includeDates: _this.props.includeDates,
          inline: _this.props.inline,
          highlightDates: _this.props.highlightDates,
          selectingDate: _this.props.selectingDate,
          filterDate: _this.props.filterDate,
          preSelection: _this.props.preSelection,
          selected: _this.props.selected,
          selectsStart: _this.props.selectsStart,
          selectsEnd: _this.props.selectsEnd,
          showWeekNumber: _this.props.showWeekNumbers,
          startDate: _this.props.startDate,
          endDate: _this.props.endDate,
          dayClassName: _this.props.dayClassName,
          utcOffset: _this.props.utcOffset
        }));

        if (breakAfterNextPush) break;

        i++;
        currentWeekStart = addWeeks(cloneDate(currentWeekStart), 1);

        // If one of these conditions is true, we will either break on this week
        // or break on the next week
        var isFixedAndFinalWeek = isFixedHeight && i >= FIXED_HEIGHT_STANDARD_WEEK_COUNT;
        var isNonFixedAndOutOfMonth = !isFixedHeight && !_this.isWeekInMonth(currentWeekStart);

        if (isFixedAndFinalWeek || isNonFixedAndOutOfMonth) {
          if (_this.props.peekNextMonth) {
            breakAfterNextPush = true;
          } else {
            break;
          }
        }
      }

      return weeks;
    }, _this.getClassNames = function () {
      var _this$props = _this.props,
          selectingDate = _this$props.selectingDate,
          selectsStart = _this$props.selectsStart,
          selectsEnd = _this$props.selectsEnd;

      return __WEBPACK_IMPORTED_MODULE_2_classnames___default()("react-datepicker__month", {
        "react-datepicker__month--selecting-range": selectingDate && (selectsStart || selectsEnd)
      });
    }, _temp), possibleConstructorReturn(_this, _ret);
  }

  Month.prototype.render = function render() {
    return __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
      "div",
      {
        className: this.getClassNames(),
        onMouseLeave: this.handleMouseLeave,
        role: "listbox"
      },
      this.renderWeeks()
    );
  };

  return Month;
}(__WEBPACK_IMPORTED_MODULE_0_react___default.a.Component);

Month.propTypes = {
  day: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.object.isRequired,
  dayClassName: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.func,
  endDate: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.object,
  excludeDates: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.array,
  filterDate: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.func,
  fixedHeight: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.bool,
  formatWeekNumber: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.func,
  highlightDates: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.instanceOf(Map),
  includeDates: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.array,
  inline: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.bool,
  maxDate: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.object,
  minDate: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.object,
  onDayClick: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.func,
  onDayMouseEnter: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.func,
  onMouseLeave: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.func,
  onWeekSelect: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.func,
  peekNextMonth: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.bool,
  preSelection: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.object,
  selected: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.object,
  selectingDate: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.object,
  selectsEnd: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.bool,
  selectsStart: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.bool,
  showWeekNumbers: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.bool,
  startDate: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.object,
  utcOffset: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.number
};

var Time = function (_React$Component) {
  inherits(Time, _React$Component);

  function Time() {
    var _temp, _this, _ret;

    classCallCheck(this, Time);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = possibleConstructorReturn(this, _React$Component.call.apply(_React$Component, [this].concat(args))), _this), _this.handleClick = function (time) {
      if ((_this.props.minTime || _this.props.maxTime) && isTimeInDisabledRange(time, _this.props) || _this.props.excludeTimes && isTimeDisabled(time, _this.props.excludeTimes) || _this.props.includeTimes && !isTimeDisabled(time, _this.props.includeTimes)) {
        return;
      }

      _this.props.onChange(time);
    }, _this.liClasses = function (time, currH, currM) {
      var classes = ["react-datepicker__time-list-item"];

      if (currH === getHour(time) && currM === getMinute(time)) {
        classes.push("react-datepicker__time-list-item--selected");
      }
      if ((_this.props.minTime || _this.props.maxTime) && isTimeInDisabledRange(time, _this.props) || _this.props.excludeTimes && isTimeDisabled(time, _this.props.excludeTimes) || _this.props.includeTimes && !isTimeDisabled(time, _this.props.includeTimes)) {
        classes.push("react-datepicker__time-list-item--disabled");
      }
      if (_this.props.injectTimes && (getHour(time) * 60 + getMinute(time)) % _this.props.intervals !== 0) {
        classes.push("react-datepicker__time-list-item--injected");
      }

      return classes.join(" ");
    }, _this.renderTimes = function () {
      var times = [];
      var format = _this.props.format ? _this.props.format : "hh:mm A";
      var intervals = _this.props.intervals;
      var activeTime = _this.props.selected ? _this.props.selected : newDate();
      var currH = getHour(activeTime);
      var currM = getMinute(activeTime);
      var base = getStartOfDay(newDate());
      var multiplier = 1440 / intervals;
      var sortedInjectTimes = _this.props.injectTimes && _this.props.injectTimes.sort(function (a, b) {
        return a - b;
      });
      for (var i = 0; i < multiplier; i++) {
        var currentTime = addMinutes(cloneDate(base), i * intervals);
        times.push(currentTime);

        if (sortedInjectTimes) {
          var timesToInject = timesToInjectAfter(base, currentTime, i, intervals, sortedInjectTimes);
          times = times.concat(timesToInject);
        }
      }

      return times.map(function (time, i) {
        return __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
          "li",
          {
            key: i,
            onClick: _this.handleClick.bind(_this, time),
            className: _this.liClasses(time, currH, currM)
          },
          formatDate(time, format)
        );
      });
    }, _temp), possibleConstructorReturn(_this, _ret);
  }

  Time.prototype.componentDidMount = function componentDidMount() {
    // code to ensure selected time will always be in focus within time window when it first appears
    var multiplier = 60 / this.props.intervals;
    var currH = this.props.selected ? getHour(this.props.selected) : getHour(newDate());
    this.list.scrollTop = 30 * (multiplier * currH);
  };

  Time.prototype.render = function render() {
    var _this2 = this;

    var height = null;
    if (this.props.monthRef) {
      height = this.props.monthRef.clientHeight - 39;
    }

    return __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
      "div",
      {
        className: "react-datepicker__time-container " + (this.props.todayButton ? "react-datepicker__time-container--with-today-button" : "")
      },
      __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
        "div",
        { className: "react-datepicker__header react-datepicker__header--time" },
        __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
          "div",
          { className: "react-datepicker-time__header" },
          this.props.timeCaption
        )
      ),
      __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
        "div",
        { className: "react-datepicker__time" },
        __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
          "div",
          { className: "react-datepicker__time-box" },
          __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
            "ul",
            {
              className: "react-datepicker__time-list",
              ref: function ref(list) {
                _this2.list = list;
              },
              style: height ? { height: height } : {}
            },
            this.renderTimes.bind(this)()
          )
        )
      )
    );
  };

  createClass(Time, null, [{
    key: "defaultProps",
    get: function get$$1() {
      return {
        intervals: 30,
        onTimeChange: function onTimeChange() {},
        todayButton: null,
        timeCaption: "Time"
      };
    }
  }]);
  return Time;
}(__WEBPACK_IMPORTED_MODULE_0_react___default.a.Component);

Time.propTypes = {
  format: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.string,
  includeTimes: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.array,
  intervals: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.number,
  selected: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.object,
  onChange: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.func,
  todayButton: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.string,
  minTime: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.object,
  maxTime: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.object,
  excludeTimes: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.array,
  monthRef: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.object,
  timeCaption: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.string,
  injectTimes: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.array
};

var DROPDOWN_FOCUS_CLASSNAMES = ["react-datepicker__year-select", "react-datepicker__month-select", "react-datepicker__month-year-select"];

var isDropdownSelect = function isDropdownSelect() {
  var element = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  var classNames = (element.className || "").split(/\s+/);
  return DROPDOWN_FOCUS_CLASSNAMES.some(function (testClassname) {
    return classNames.indexOf(testClassname) >= 0;
  });
};

var Calendar = function (_React$Component) {
  inherits(Calendar, _React$Component);
  createClass(Calendar, null, [{
    key: "defaultProps",
    get: function get$$1() {
      return {
        onDropdownFocus: function onDropdownFocus() {},
        monthsShown: 1,
        forceShowMonthNavigation: false,
        timeCaption: "Time"
      };
    }
  }]);

  function Calendar(props) {
    classCallCheck(this, Calendar);

    var _this = possibleConstructorReturn(this, _React$Component.call(this, props));

    _this.handleClickOutside = function (event) {
      _this.props.onClickOutside(event);
    };

    _this.handleDropdownFocus = function (event) {
      if (isDropdownSelect(event.target)) {
        _this.props.onDropdownFocus();
      }
    };

    _this.getDateInView = function () {
      var _this$props = _this.props,
          preSelection = _this$props.preSelection,
          selected = _this$props.selected,
          openToDate = _this$props.openToDate,
          utcOffset = _this$props.utcOffset;

      var minDate = getEffectiveMinDate(_this.props);
      var maxDate = getEffectiveMaxDate(_this.props);
      var current = now(utcOffset);
      var initialDate = openToDate || selected || preSelection;
      if (initialDate) {
        return initialDate;
      } else {
        if (minDate && isBefore(current, minDate)) {
          return minDate;
        } else if (maxDate && isAfter(current, maxDate)) {
          return maxDate;
        }
      }
      return current;
    };

    _this.localizeDate = function (date) {
      return localizeDate(date, _this.props.locale);
    };

    _this.increaseMonth = function () {
      _this.setState({
        date: addMonths(cloneDate(_this.state.date), 1)
      }, function () {
        return _this.handleMonthChange(_this.state.date);
      });
    };

    _this.decreaseMonth = function () {
      _this.setState({
        date: subtractMonths(cloneDate(_this.state.date), 1)
      }, function () {
        return _this.handleMonthChange(_this.state.date);
      });
    };

    _this.handleDayClick = function (day, event) {
      return _this.props.onSelect(day, event);
    };

    _this.handleDayMouseEnter = function (day) {
      return _this.setState({ selectingDate: day });
    };

    _this.handleMonthMouseLeave = function () {
      return _this.setState({ selectingDate: null });
    };

    _this.handleYearChange = function (date) {
      if (_this.props.onYearChange) {
        _this.props.onYearChange(date);
      }
    };

    _this.handleMonthChange = function (date) {
      if (_this.props.onMonthChange) {
        _this.props.onMonthChange(date);
      }
      if (_this.props.adjustDateOnChange) {
        if (_this.props.onSelect) {
          _this.props.onSelect(date);
        }
        if (_this.props.setOpen) {
          _this.props.setOpen(true);
        }
      }
    };

    _this.handleMonthYearChange = function (date) {
      _this.handleYearChange(date);
      _this.handleMonthChange(date);
    };

    _this.changeYear = function (year) {
      _this.setState({
        date: setYear(cloneDate(_this.state.date), year)
      }, function () {
        return _this.handleYearChange(_this.state.date);
      });
    };

    _this.changeMonth = function (month) {
      _this.setState({
        date: setMonth(cloneDate(_this.state.date), month)
      }, function () {
        return _this.handleMonthChange(_this.state.date);
      });
    };

    _this.changeMonthYear = function (monthYear) {
      _this.setState({
        date: setYear(setMonth(cloneDate(_this.state.date), getMonth(monthYear)), getYear(monthYear))
      }, function () {
        return _this.handleMonthYearChange(_this.state.date);
      });
    };

    _this.header = function () {
      var date = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _this.state.date;

      var startOfWeek = getStartOfWeek(cloneDate(date));
      var dayNames = [];
      if (_this.props.showWeekNumbers) {
        dayNames.push(__WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
          "div",
          { key: "W", className: "react-datepicker__day-name" },
          _this.props.weekLabel || "#"
        ));
      }
      return dayNames.concat([0, 1, 2, 3, 4, 5, 6].map(function (offset) {
        var day = addDays(cloneDate(startOfWeek), offset);
        var localeData = getLocaleData(day);
        var weekDayName = _this.props.useWeekdaysShort ? getWeekdayShortInLocale(localeData, day) : getWeekdayMinInLocale(localeData, day);
        return __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
          "div",
          { key: offset, className: "react-datepicker__day-name" },
          weekDayName
        );
      }));
    };

    _this.renderPreviousMonthButton = function () {
      var allPrevDaysDisabled = allDaysDisabledBefore(_this.state.date, "month", _this.props);

      if (!_this.props.forceShowMonthNavigation && !_this.props.showDisabledMonthNavigation && allPrevDaysDisabled || _this.props.showTimeSelectOnly) {
        return;
      }

      var classes = ["react-datepicker__navigation", "react-datepicker__navigation--previous"];

      var clickHandler = _this.decreaseMonth;

      if (allPrevDaysDisabled && _this.props.showDisabledMonthNavigation) {
        classes.push("react-datepicker__navigation--previous--disabled");
        clickHandler = null;
      }

      return __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement("button", {
        type: "button",
        className: classes.join(" "),
        onClick: clickHandler
      });
    };

    _this.renderNextMonthButton = function () {
      var allNextDaysDisabled = allDaysDisabledAfter(_this.state.date, "month", _this.props);

      if (!_this.props.forceShowMonthNavigation && !_this.props.showDisabledMonthNavigation && allNextDaysDisabled || _this.props.showTimeSelectOnly) {
        return;
      }

      var classes = ["react-datepicker__navigation", "react-datepicker__navigation--next"];
      if (_this.props.showTimeSelect) {
        classes.push("react-datepicker__navigation--next--with-time");
      }
      if (_this.props.todayButton) {
        classes.push("react-datepicker__navigation--next--with-today-button");
      }

      var clickHandler = _this.increaseMonth;

      if (allNextDaysDisabled && _this.props.showDisabledMonthNavigation) {
        classes.push("react-datepicker__navigation--next--disabled");
        clickHandler = null;
      }

      return __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement("button", {
        type: "button",
        className: classes.join(" "),
        onClick: clickHandler
      });
    };

    _this.renderCurrentMonth = function () {
      var date = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _this.state.date;

      var classes = ["react-datepicker__current-month"];

      if (_this.props.showYearDropdown) {
        classes.push("react-datepicker__current-month--hasYearDropdown");
      }
      if (_this.props.showMonthDropdown) {
        classes.push("react-datepicker__current-month--hasMonthDropdown");
      }
      if (_this.props.showMonthYearDropdown) {
        classes.push("react-datepicker__current-month--hasMonthYearDropdown");
      }
      return __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
        "div",
        { className: classes.join(" ") },
        formatDate(date, _this.props.dateFormat)
      );
    };

    _this.renderYearDropdown = function () {
      var overrideHide = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

      if (!_this.props.showYearDropdown || overrideHide) {
        return;
      }
      return __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(YearDropdown, {
        adjustDateOnChange: _this.props.adjustDateOnChange,
        date: _this.state.date,
        onSelect: _this.props.onSelect,
        setOpen: _this.props.setOpen,
        dropdownMode: _this.props.dropdownMode,
        onChange: _this.changeYear,
        minDate: _this.props.minDate,
        maxDate: _this.props.maxDate,
        year: getYear(_this.state.date),
        scrollableYearDropdown: _this.props.scrollableYearDropdown,
        yearDropdownItemNumber: _this.props.yearDropdownItemNumber
      });
    };

    _this.renderMonthDropdown = function () {
      var overrideHide = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

      if (!_this.props.showMonthDropdown || overrideHide) {
        return;
      }
      return __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(MonthDropdown, {
        dropdownMode: _this.props.dropdownMode,
        locale: _this.props.locale,
        dateFormat: _this.props.dateFormat,
        onChange: _this.changeMonth,
        month: getMonth(_this.state.date),
        useShortMonthInDropdown: _this.props.useShortMonthInDropdown
      });
    };

    _this.renderMonthYearDropdown = function () {
      var overrideHide = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

      if (!_this.props.showMonthYearDropdown || overrideHide) {
        return;
      }
      return __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(MonthYearDropdown, {
        dropdownMode: _this.props.dropdownMode,
        locale: _this.props.locale,
        dateFormat: _this.props.dateFormat,
        onChange: _this.changeMonthYear,
        minDate: _this.props.minDate,
        maxDate: _this.props.maxDate,
        date: _this.state.date,
        scrollableMonthYearDropdown: _this.props.scrollableMonthYearDropdown
      });
    };

    _this.renderTodayButton = function () {
      if (!_this.props.todayButton || _this.props.showTimeSelectOnly) {
        return;
      }
      return __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
        "div",
        {
          className: "react-datepicker__today-button",
          onClick: function onClick(e) {
            return _this.props.onSelect(getStartOfDate(now(_this.props.utcOffset)), e);
          }
        },
        _this.props.todayButton
      );
    };

    _this.renderMonths = function () {
      if (_this.props.showTimeSelectOnly) {
        return;
      }

      var monthList = [];
      for (var i = 0; i < _this.props.monthsShown; ++i) {
        var monthDate = addMonths(cloneDate(_this.state.date), i);
        var monthKey = "month-" + i;
        monthList.push(__WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
          "div",
          {
            key: monthKey,
            ref: function ref(div) {
              _this.monthContainer = div;
            },
            className: "react-datepicker__month-container"
          },
          __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
            "div",
            { className: "react-datepicker__header" },
            _this.renderCurrentMonth(monthDate),
            __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
              "div",
              {
                className: "react-datepicker__header__dropdown react-datepicker__header__dropdown--" + _this.props.dropdownMode,
                onFocus: _this.handleDropdownFocus
              },
              _this.renderMonthDropdown(i !== 0),
              _this.renderMonthYearDropdown(i !== 0),
              _this.renderYearDropdown(i !== 0)
            ),
            __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
              "div",
              { className: "react-datepicker__day-names" },
              _this.header(monthDate)
            )
          ),
          __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(Month, {
            day: monthDate,
            dayClassName: _this.props.dayClassName,
            onDayClick: _this.handleDayClick,
            onDayMouseEnter: _this.handleDayMouseEnter,
            onMouseLeave: _this.handleMonthMouseLeave,
            onWeekSelect: _this.props.onWeekSelect,
            formatWeekNumber: _this.props.formatWeekNumber,
            minDate: _this.props.minDate,
            maxDate: _this.props.maxDate,
            excludeDates: _this.props.excludeDates,
            highlightDates: _this.props.highlightDates,
            selectingDate: _this.state.selectingDate,
            includeDates: _this.props.includeDates,
            inline: _this.props.inline,
            fixedHeight: _this.props.fixedHeight,
            filterDate: _this.props.filterDate,
            preSelection: _this.props.preSelection,
            selected: _this.props.selected,
            selectsStart: _this.props.selectsStart,
            selectsEnd: _this.props.selectsEnd,
            showWeekNumbers: _this.props.showWeekNumbers,
            startDate: _this.props.startDate,
            endDate: _this.props.endDate,
            peekNextMonth: _this.props.peekNextMonth,
            utcOffset: _this.props.utcOffset
          })
        ));
      }
      return monthList;
    };

    _this.renderTimeSection = function () {
      if (_this.props.showTimeSelect) {
        return __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(Time, {
          selected: _this.props.selected,
          onChange: _this.props.onTimeChange,
          format: _this.props.timeFormat,
          includeTimes: _this.props.includeTimes,
          intervals: _this.props.timeIntervals,
          minTime: _this.props.minTime,
          maxTime: _this.props.maxTime,
          excludeTimes: _this.props.excludeTimes,
          timeCaption: _this.props.timeCaption,
          todayButton: _this.props.todayButton,
          showMonthDropdown: _this.props.showMonthDropdown,
          showMonthYearDropdown: _this.props.showMonthYearDropdown,
          showYearDropdown: _this.props.showYearDropdown,
          withPortal: _this.props.withPortal,
          monthRef: _this.state.monthContainer,
          injectTimes: _this.props.injectTimes
        });
      }
    };

    _this.state = {
      date: _this.localizeDate(_this.getDateInView()),
      selectingDate: null,
      monthContainer: _this.monthContainer
    };
    return _this;
  }

  Calendar.prototype.componentDidMount = function componentDidMount() {
    var _this2 = this;

    // monthContainer height is needed in time component
    // to determine the height for the ul in the time component
    // setState here so height is given after final component
    // layout is rendered
    if (this.props.showTimeSelect) {
      this.assignMonthContainer = function () {
        _this2.setState({ monthContainer: _this2.monthContainer });
      }();
    }
  };

  Calendar.prototype.componentWillReceiveProps = function componentWillReceiveProps(nextProps) {
    if (nextProps.preSelection && !isSameDay(nextProps.preSelection, this.props.preSelection)) {
      this.setState({
        date: this.localizeDate(nextProps.preSelection)
      });
    } else if (nextProps.openToDate && !isSameDay(nextProps.openToDate, this.props.openToDate)) {
      this.setState({
        date: this.localizeDate(nextProps.openToDate)
      });
    }
  };

  Calendar.prototype.render = function render() {
    return __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
      "div",
      {
        className: __WEBPACK_IMPORTED_MODULE_2_classnames___default()("react-datepicker", this.props.className, {
          "react-datepicker--time-only": this.props.showTimeSelectOnly
        })
      },
      __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement("div", { className: "react-datepicker__triangle" }),
      this.renderPreviousMonthButton(),
      this.renderNextMonthButton(),
      this.renderMonths(),
      this.renderTodayButton(),
      this.renderTimeSection(),
      this.props.children
    );
  };

  return Calendar;
}(__WEBPACK_IMPORTED_MODULE_0_react___default.a.Component);

Calendar.propTypes = {
  adjustDateOnChange: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.bool,
  className: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.string,
  children: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.node,
  dateFormat: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.oneOfType([__WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.string, __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.array]).isRequired,
  dayClassName: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.func,
  dropdownMode: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.oneOf(["scroll", "select"]),
  endDate: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.object,
  excludeDates: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.array,
  filterDate: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.func,
  fixedHeight: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.bool,
  formatWeekNumber: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.func,
  highlightDates: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.instanceOf(Map),
  includeDates: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.array,
  includeTimes: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.array,
  injectTimes: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.array,
  inline: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.bool,
  locale: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.string,
  maxDate: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.object,
  minDate: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.object,
  monthsShown: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.number,
  onClickOutside: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.func.isRequired,
  onMonthChange: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.func,
  onYearChange: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.func,
  forceShowMonthNavigation: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.bool,
  onDropdownFocus: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.func,
  onSelect: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.func.isRequired,
  onWeekSelect: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.func,
  showTimeSelect: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.bool,
  showTimeSelectOnly: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.bool,
  timeFormat: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.string,
  timeIntervals: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.number,
  onTimeChange: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.func,
  minTime: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.object,
  maxTime: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.object,
  excludeTimes: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.array,
  timeCaption: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.string,
  openToDate: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.object,
  peekNextMonth: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.bool,
  scrollableYearDropdown: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.bool,
  scrollableMonthYearDropdown: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.bool,
  preSelection: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.object,
  selected: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.object,
  selectsEnd: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.bool,
  selectsStart: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.bool,
  showMonthDropdown: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.bool,
  showMonthYearDropdown: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.bool,
  showWeekNumbers: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.bool,
  showYearDropdown: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.bool,
  startDate: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.object,
  todayButton: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.string,
  useWeekdaysShort: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.bool,
  withPortal: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.bool,
  utcOffset: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.number,
  weekLabel: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.string,
  yearDropdownItemNumber: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.number,
  setOpen: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.func,
  useShortMonthInDropdown: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.bool,
  showDisabledMonthNavigation: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.bool
};

var popperPlacementPositions = ["auto", "auto-left", "auto-right", "bottom", "bottom-end", "bottom-start", "left", "left-end", "left-start", "right", "right-end", "right-start", "top", "top-end", "top-start"];

var PopperComponent = function (_React$Component) {
  inherits(PopperComponent, _React$Component);

  function PopperComponent() {
    classCallCheck(this, PopperComponent);
    return possibleConstructorReturn(this, _React$Component.apply(this, arguments));
  }

  PopperComponent.prototype.render = function render() {
    var _props = this.props,
        className = _props.className,
        hidePopper = _props.hidePopper,
        popperComponent = _props.popperComponent,
        popperModifiers = _props.popperModifiers,
        popperPlacement = _props.popperPlacement,
        targetComponent = _props.targetComponent;


    var popper = void 0;

    if (!hidePopper) {
      var classes = __WEBPACK_IMPORTED_MODULE_2_classnames___default()("react-datepicker-popper", className);
      popper = __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
        __WEBPACK_IMPORTED_MODULE_5_react_popper__["b" /* Popper */],
        {
          className: classes,
          modifiers: popperModifiers,
          placement: popperPlacement
        },
        popperComponent
      );
    }

    if (this.props.popperContainer) {
      popper = __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(this.props.popperContainer, {}, popper);
    }

    return __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
      __WEBPACK_IMPORTED_MODULE_5_react_popper__["a" /* Manager */],
      null,
      __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
        __WEBPACK_IMPORTED_MODULE_5_react_popper__["c" /* Target */],
        { className: "react-datepicker-wrapper" },
        targetComponent
      ),
      popper
    );
  };

  createClass(PopperComponent, null, [{
    key: "defaultProps",
    get: function get$$1() {
      return {
        hidePopper: true,
        popperModifiers: {
          preventOverflow: {
            enabled: true,
            escapeWithReference: true,
            boundariesElement: "viewport"
          }
        },
        popperPlacement: "bottom-start"
      };
    }
  }]);
  return PopperComponent;
}(__WEBPACK_IMPORTED_MODULE_0_react___default.a.Component);

PopperComponent.propTypes = {
  className: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.string,
  hidePopper: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.bool,
  popperComponent: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.element,
  popperModifiers: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.object, // <datepicker/> props
  popperPlacement: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.oneOf(popperPlacementPositions), // <datepicker/> props
  popperContainer: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.func,
  targetComponent: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.element
};

var outsideClickIgnoreClass = "react-datepicker-ignore-onclickoutside";
var WrappedCalendar = Object(__WEBPACK_IMPORTED_MODULE_3_react_onclickoutside__["a" /* default */])(Calendar);

// Compares dates year+month combinations
function hasPreSelectionChanged(date1, date2) {
  if (date1 && date2) {
    return getMonth(date1) !== getMonth(date2) || getYear(date1) !== getYear(date2);
  }

  return date1 !== date2;
}

/**
 * General datepicker component.
 */

var DatePicker = function (_React$Component) {
  inherits(DatePicker, _React$Component);
  createClass(DatePicker, null, [{
    key: "defaultProps",
    get: function get$$1() {
      return {
        allowSameDay: false,
        dateFormat: "L",
        dateFormatCalendar: "MMMM YYYY",
        onChange: function onChange() {},

        disabled: false,
        disabledKeyboardNavigation: false,
        dropdownMode: "scroll",
        onFocus: function onFocus() {},
        onBlur: function onBlur() {},
        onKeyDown: function onKeyDown() {},
        onSelect: function onSelect() {},
        onClickOutside: function onClickOutside$$1() {},
        onMonthChange: function onMonthChange() {},

        preventOpenOnFocus: false,
        onYearChange: function onYearChange() {},

        monthsShown: 1,
        withPortal: false,
        shouldCloseOnSelect: true,
        showTimeSelect: false,
        timeIntervals: 30,
        timeCaption: "Time"
      };
    }
  }]);

  function DatePicker(props) {
    classCallCheck(this, DatePicker);

    var _this = possibleConstructorReturn(this, _React$Component.call(this, props));

    _this.getPreSelection = function () {
      return _this.props.openToDate ? newDate(_this.props.openToDate) : _this.props.selectsEnd && _this.props.startDate ? newDate(_this.props.startDate) : _this.props.selectsStart && _this.props.endDate ? newDate(_this.props.endDate) : now(_this.props.utcOffset);
    };

    _this.calcInitialState = function () {
      var defaultPreSelection = _this.getPreSelection();
      var minDate = getEffectiveMinDate(_this.props);
      var maxDate = getEffectiveMaxDate(_this.props);
      var boundedPreSelection = minDate && isBefore(defaultPreSelection, minDate) ? minDate : maxDate && isAfter(defaultPreSelection, maxDate) ? maxDate : defaultPreSelection;
      return {
        open: _this.props.startOpen || false,
        preventFocus: false,
        preSelection: _this.props.selected ? newDate(_this.props.selected) : boundedPreSelection,
        // transforming highlighted days (perhaps nested array)
        // to flat Map for faster access in day.jsx
        highlightDates: getHightLightDaysMap(_this.props.highlightDates),
        focused: false
      };
    };

    _this.clearPreventFocusTimeout = function () {
      if (_this.preventFocusTimeout) {
        clearTimeout(_this.preventFocusTimeout);
      }
    };

    _this.setFocus = function () {
      if (_this.input && _this.input.focus) {
        _this.input.focus();
      }
    };

    _this.setOpen = function (open) {
      _this.setState({
        open: open,
        preSelection: open && _this.state.open ? _this.state.preSelection : _this.calcInitialState().preSelection
      });
    };

    _this.handleFocus = function (event) {
      if (!_this.state.preventFocus) {
        _this.props.onFocus(event);
        if (!_this.props.preventOpenOnFocus) {
          _this.setOpen(true);
        }
      }
      _this.setState({ focused: true });
    };

    _this.cancelFocusInput = function () {
      clearTimeout(_this.inputFocusTimeout);
      _this.inputFocusTimeout = null;
    };

    _this.deferFocusInput = function () {
      _this.cancelFocusInput();
      _this.inputFocusTimeout = setTimeout(function () {
        return _this.setFocus();
      }, 1);
    };

    _this.handleDropdownFocus = function () {
      _this.cancelFocusInput();
    };

    _this.handleBlur = function (event) {
      if (_this.state.open) {
        _this.deferFocusInput();
      } else {
        _this.props.onBlur(event);
      }
      _this.setState({ focused: false });
    };

    _this.handleCalendarClickOutside = function (event) {
      if (!_this.props.inline) {
        _this.setOpen(false);
      }
      _this.props.onClickOutside(event);
      if (_this.props.withPortal) {
        event.preventDefault();
      }
    };

    _this.handleChange = function () {
      for (var _len = arguments.length, allArgs = Array(_len), _key = 0; _key < _len; _key++) {
        allArgs[_key] = arguments[_key];
      }

      var event = allArgs[0];
      if (_this.props.onChangeRaw) {
        _this.props.onChangeRaw.apply(_this, allArgs);
        if (typeof event.isDefaultPrevented !== "function" || event.isDefaultPrevented()) {
          return;
        }
      }
      _this.setState({ inputValue: event.target.value });
      var date = parseDate(event.target.value, _this.props);
      if (date || !event.target.value) {
        _this.setSelected(date, event, true);
      }
    };

    _this.handleSelect = function (date, event) {
      // Preventing onFocus event to fix issue
      // https://github.com/Hacker0x01/react-datepicker/issues/628
      _this.setState({ preventFocus: true }, function () {
        _this.preventFocusTimeout = setTimeout(function () {
          return _this.setState({ preventFocus: false });
        }, 50);
        return _this.preventFocusTimeout;
      });
      _this.setSelected(date, event);
      if (!_this.props.shouldCloseOnSelect || _this.props.showTimeSelect) {
        _this.setPreSelection(date);
      } else if (!_this.props.inline) {
        _this.setOpen(false);
      }
    };

    _this.setSelected = function (date, event, keepInput) {
      var changedDate = date;

      if (changedDate !== null && isDayDisabled(changedDate, _this.props)) {
        return;
      }

      if (!isSameDay(_this.props.selected, changedDate) || _this.props.allowSameDay) {
        if (changedDate !== null) {
          if (_this.props.selected) {
            var selected = _this.props.selected;
            if (keepInput) selected = newDate(changedDate);
            changedDate = setTime(newDate(changedDate), {
              hour: getHour(selected),
              minute: getMinute(selected),
              second: getSecond(selected)
            });
          }
          _this.setState({
            preSelection: changedDate
          });
        }
        _this.props.onChange(changedDate, event);
      }

      _this.props.onSelect(changedDate, event);

      if (!keepInput) {
        _this.setState({ inputValue: null });
      }
    };

    _this.setPreSelection = function (date) {
      var isDateRangePresent = typeof _this.props.minDate !== "undefined" && typeof _this.props.maxDate !== "undefined";
      var isValidDateSelection = isDateRangePresent && date ? isDayInRange(date, _this.props.minDate, _this.props.maxDate) : true;
      if (isValidDateSelection) {
        _this.setState({
          preSelection: date
        });
      }
    };

    _this.handleTimeChange = function (time) {
      var selected = _this.props.selected ? _this.props.selected : _this.getPreSelection();
      var changedDate = setTime(cloneDate(selected), {
        hour: getHour(time),
        minute: getMinute(time)
      });

      _this.setState({
        preSelection: changedDate
      });

      _this.props.onChange(changedDate);
      _this.setOpen(false);
      _this.setState({ inputValue: null });
    };

    _this.onInputClick = function () {
      if (!_this.props.disabled) {
        _this.setOpen(true);
      }
    };

    _this.onInputKeyDown = function (event) {
      _this.props.onKeyDown(event);
      var eventKey = event.key;
      if (!_this.state.open && !_this.props.inline && !_this.props.preventOpenOnFocus) {
        if (eventKey !== "Enter" && eventKey !== "Escape" && eventKey !== "Tab") {
          _this.onInputClick();
        }
        return;
      }
      var copy = newDate(_this.state.preSelection);
      if (eventKey === "Enter") {
        event.preventDefault();
        if (isMoment(_this.state.preSelection) || isDate(_this.state.preSelection)) {
          _this.handleSelect(copy, event);
          !_this.props.shouldCloseOnSelect && _this.setPreSelection(copy);
        } else {
          _this.setOpen(false);
        }
      } else if (eventKey === "Escape") {
        event.preventDefault();
        _this.setOpen(false);
      } else if (eventKey === "Tab") {
        _this.setOpen(false);
      } else if (!_this.props.disabledKeyboardNavigation) {
        var newSelection = void 0;
        switch (eventKey) {
          case "ArrowLeft":
            event.preventDefault();
            newSelection = subtractDays(copy, 1);
            break;
          case "ArrowRight":
            event.preventDefault();
            newSelection = addDays(copy, 1);
            break;
          case "ArrowUp":
            event.preventDefault();
            newSelection = subtractWeeks(copy, 1);
            break;
          case "ArrowDown":
            event.preventDefault();
            newSelection = addWeeks(copy, 1);
            break;
          case "PageUp":
            event.preventDefault();
            newSelection = subtractMonths(copy, 1);
            break;
          case "PageDown":
            event.preventDefault();
            newSelection = addMonths(copy, 1);
            break;
          case "Home":
            event.preventDefault();
            newSelection = subtractYears(copy, 1);
            break;
          case "End":
            event.preventDefault();
            newSelection = addYears(copy, 1);
            break;
        }
        if (_this.props.adjustDateOnChange) {
          _this.setSelected(newSelection);
        }
        _this.setPreSelection(newSelection);
      }
    };

    _this.onClearClick = function (event) {
      if (event) {
        if (event.preventDefault) {
          event.preventDefault();
        }
      }
      _this.props.onChange(null, event);
      _this.setState({ inputValue: null });
    };

    _this.clear = function () {
      _this.onClearClick();
    };

    _this.renderCalendar = function () {
      if (!_this.props.inline && (!_this.state.open || _this.props.disabled)) {
        return null;
      }
      return __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
        WrappedCalendar,
        {
          ref: function ref(elem) {
            _this.calendar = elem;
          },
          locale: _this.props.locale,
          adjustDateOnChange: _this.props.adjustDateOnChange,
          setOpen: _this.setOpen,
          dateFormat: _this.props.dateFormatCalendar,
          useWeekdaysShort: _this.props.useWeekdaysShort,
          dropdownMode: _this.props.dropdownMode,
          selected: _this.props.selected,
          preSelection: _this.state.preSelection,
          onSelect: _this.handleSelect,
          onWeekSelect: _this.props.onWeekSelect,
          openToDate: _this.props.openToDate,
          minDate: _this.props.minDate,
          maxDate: _this.props.maxDate,
          selectsStart: _this.props.selectsStart,
          selectsEnd: _this.props.selectsEnd,
          startDate: _this.props.startDate,
          endDate: _this.props.endDate,
          excludeDates: _this.props.excludeDates,
          filterDate: _this.props.filterDate,
          onClickOutside: _this.handleCalendarClickOutside,
          formatWeekNumber: _this.props.formatWeekNumber,
          highlightDates: _this.state.highlightDates,
          includeDates: _this.props.includeDates,
          includeTimes: _this.props.includeTimes,
          injectTimes: _this.props.injectTimes,
          inline: _this.props.inline,
          peekNextMonth: _this.props.peekNextMonth,
          showMonthDropdown: _this.props.showMonthDropdown,
          useShortMonthInDropdown: _this.props.useShortMonthInDropdown,
          showMonthYearDropdown: _this.props.showMonthYearDropdown,
          showWeekNumbers: _this.props.showWeekNumbers,
          showYearDropdown: _this.props.showYearDropdown,
          withPortal: _this.props.withPortal,
          forceShowMonthNavigation: _this.props.forceShowMonthNavigation,
          showDisabledMonthNavigation: _this.props.showDisabledMonthNavigation,
          scrollableYearDropdown: _this.props.scrollableYearDropdown,
          scrollableMonthYearDropdown: _this.props.scrollableMonthYearDropdown,
          todayButton: _this.props.todayButton,
          weekLabel: _this.props.weekLabel,
          utcOffset: _this.props.utcOffset,
          outsideClickIgnoreClass: outsideClickIgnoreClass,
          fixedHeight: _this.props.fixedHeight,
          monthsShown: _this.props.monthsShown,
          onDropdownFocus: _this.handleDropdownFocus,
          onMonthChange: _this.props.onMonthChange,
          onYearChange: _this.props.onYearChange,
          dayClassName: _this.props.dayClassName,
          showTimeSelect: _this.props.showTimeSelect,
          showTimeSelectOnly: _this.props.showTimeSelectOnly,
          onTimeChange: _this.handleTimeChange,
          timeFormat: _this.props.timeFormat,
          timeIntervals: _this.props.timeIntervals,
          minTime: _this.props.minTime,
          maxTime: _this.props.maxTime,
          excludeTimes: _this.props.excludeTimes,
          timeCaption: _this.props.timeCaption,
          className: _this.props.calendarClassName,
          yearDropdownItemNumber: _this.props.yearDropdownItemNumber
        },
        _this.props.children
      );
    };

    _this.renderDateInput = function () {
      var _classnames, _React$cloneElement;

      var className = __WEBPACK_IMPORTED_MODULE_2_classnames___default()(_this.props.className, (_classnames = {}, _classnames[outsideClickIgnoreClass] = _this.state.open, _classnames));

      var customInput = _this.props.customInput || __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement("input", { type: "text" });
      var customInputRef = _this.props.customInputRef || "ref";
      var inputValue = typeof _this.props.value === "string" ? _this.props.value : typeof _this.state.inputValue === "string" ? _this.state.inputValue : safeDateFormat(_this.props.selected, _this.props);

      return __WEBPACK_IMPORTED_MODULE_0_react___default.a.cloneElement(customInput, (_React$cloneElement = {}, _React$cloneElement[customInputRef] = function (input) {
        _this.input = input;
      }, _React$cloneElement.value = inputValue, _React$cloneElement.onBlur = _this.handleBlur, _React$cloneElement.onChange = _this.handleChange, _React$cloneElement.onClick = _this.onInputClick, _React$cloneElement.onFocus = _this.handleFocus, _React$cloneElement.onKeyDown = _this.onInputKeyDown, _React$cloneElement.id = _this.props.id, _React$cloneElement.name = _this.props.name, _React$cloneElement.autoFocus = _this.props.autoFocus, _React$cloneElement.placeholder = _this.props.placeholderText, _React$cloneElement.disabled = _this.props.disabled, _React$cloneElement.autoComplete = _this.props.autoComplete, _React$cloneElement.className = className, _React$cloneElement.title = _this.props.title, _React$cloneElement.readOnly = _this.props.readOnly, _React$cloneElement.required = _this.props.required, _React$cloneElement.tabIndex = _this.props.tabIndex, _React$cloneElement));
    };

    _this.renderClearButton = function () {
      if (_this.props.isClearable && _this.props.selected != null) {
        return __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement("button", {
          className: "react-datepicker__close-icon",
          onClick: _this.onClearClick,
          title: _this.props.clearButtonTitle,
          tabIndex: -1
        });
      } else {
        return null;
      }
    };

    _this.state = _this.calcInitialState();
    return _this;
  }

  DatePicker.prototype.componentWillReceiveProps = function componentWillReceiveProps(nextProps) {
    if (this.props.inline && hasPreSelectionChanged(this.props.selected, nextProps.selected)) {
      this.setPreSelection(nextProps.selected);
    }
    if (this.props.highlightDates !== nextProps.highlightDates) {
      this.setState({
        highlightDates: getHightLightDaysMap(nextProps.highlightDates)
      });
    }
    if (!this.state.focused) this.setState({ inputValue: null });
  };

  DatePicker.prototype.componentWillUnmount = function componentWillUnmount() {
    this.clearPreventFocusTimeout();
  };

  DatePicker.prototype.render = function render() {
    var calendar = this.renderCalendar();

    if (this.props.inline && !this.props.withPortal) {
      return calendar;
    }

    if (this.props.withPortal) {
      return __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
        "div",
        null,
        !this.props.inline ? __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
          "div",
          { className: "react-datepicker__input-container" },
          this.renderDateInput(),
          this.renderClearButton()
        ) : null,
        this.state.open || this.props.inline ? __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
          "div",
          { className: "react-datepicker__portal" },
          calendar
        ) : null
      );
    }

    return __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(PopperComponent, {
      className: this.props.popperClassName,
      hidePopper: !this.state.open || this.props.disabled,
      popperModifiers: this.props.popperModifiers,
      targetComponent: __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
        "div",
        { className: "react-datepicker__input-container" },
        this.renderDateInput(),
        this.renderClearButton()
      ),
      popperContainer: this.props.popperContainer,
      popperComponent: calendar,
      popperPlacement: this.props.popperPlacement
    });
  };

  return DatePicker;
}(__WEBPACK_IMPORTED_MODULE_0_react___default.a.Component);

DatePicker.propTypes = {
  adjustDateOnChange: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.bool,
  allowSameDay: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.bool,
  autoComplete: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.string,
  autoFocus: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.bool,
  calendarClassName: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.string,
  children: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.node,
  className: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.string,
  customInput: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.element,
  customInputRef: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.string,
  // eslint-disable-next-line react/no-unused-prop-types
  dateFormat: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.oneOfType([__WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.string, __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.array]),
  dateFormatCalendar: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.string,
  dayClassName: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.func,
  disabled: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.bool,
  disabledKeyboardNavigation: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.bool,
  dropdownMode: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.oneOf(["scroll", "select"]).isRequired,
  endDate: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.object,
  excludeDates: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.array,
  filterDate: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.func,
  fixedHeight: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.bool,
  formatWeekNumber: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.func,
  highlightDates: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.array,
  id: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.string,
  includeDates: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.array,
  includeTimes: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.array,
  injectTimes: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.array,
  inline: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.bool,
  isClearable: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.bool,
  locale: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.string,
  maxDate: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.object,
  minDate: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.object,
  monthsShown: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.number,
  name: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.string,
  onBlur: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.func,
  onChange: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.func.isRequired,
  onSelect: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.func,
  onWeekSelect: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.func,
  onClickOutside: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.func,
  onChangeRaw: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.func,
  onFocus: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.func,
  onKeyDown: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.func,
  onMonthChange: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.func,
  onYearChange: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.func,
  openToDate: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.object,
  peekNextMonth: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.bool,
  placeholderText: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.string,
  popperContainer: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.func,
  popperClassName: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.string, // <PopperComponent/> props
  popperModifiers: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.object, // <PopperComponent/> props
  popperPlacement: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.oneOf(popperPlacementPositions), // <PopperComponent/> props
  preventOpenOnFocus: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.bool,
  readOnly: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.bool,
  required: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.bool,
  scrollableYearDropdown: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.bool,
  scrollableMonthYearDropdown: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.bool,
  selected: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.object,
  selectsEnd: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.bool,
  selectsStart: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.bool,
  showMonthDropdown: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.bool,
  showMonthYearDropdown: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.bool,
  showWeekNumbers: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.bool,
  showYearDropdown: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.bool,
  forceShowMonthNavigation: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.bool,
  showDisabledMonthNavigation: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.bool,
  startDate: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.object,
  startOpen: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.bool,
  tabIndex: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.number,
  timeCaption: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.string,
  title: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.string,
  todayButton: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.string,
  useWeekdaysShort: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.bool,
  utcOffset: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.number,
  value: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.string,
  weekLabel: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.string,
  withPortal: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.bool,
  yearDropdownItemNumber: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.number,
  shouldCloseOnSelect: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.bool,
  showTimeSelect: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.bool,
  showTimeSelectOnly: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.bool,
  timeFormat: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.string,
  timeIntervals: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.number,
  minTime: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.object,
  maxTime: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.object,
  excludeTimes: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.array,
  useShortMonthInDropdown: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.bool,
  clearButtonTitle: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.string
};

/* harmony default export */ __webpack_exports__["default"] = (DatePicker);


/***/ }),

/***/ 535:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export IGNORE_CLASS_NAME */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_react__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_react_dom__ = __webpack_require__(10);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_react_dom___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_react_dom__);



function _inheritsLoose(subClass, superClass) {
  subClass.prototype = Object.create(superClass.prototype);
  subClass.prototype.constructor = subClass;
  subClass.__proto__ = superClass;
}

function _objectWithoutProperties(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;

  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }

  if (Object.getOwnPropertySymbols) {
    var sourceSymbolKeys = Object.getOwnPropertySymbols(source);

    for (i = 0; i < sourceSymbolKeys.length; i++) {
      key = sourceSymbolKeys[i];
      if (excluded.indexOf(key) >= 0) continue;
      if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
      target[key] = source[key];
    }
  }

  return target;
}

/**
 * Check whether some DOM node is our Component's node.
 */
function isNodeFound(current, componentNode, ignoreClass) {
  if (current === componentNode) {
    return true;
  } // SVG <use/> elements do not technically reside in the rendered DOM, so
  // they do not have classList directly, but they offer a link to their
  // corresponding element, which can have classList. This extra check is for
  // that case.
  // See: http://www.w3.org/TR/SVG11/struct.html#InterfaceSVGUseElement
  // Discussion: https://github.com/Pomax/react-onclickoutside/pull/17


  if (current.correspondingElement) {
    return current.correspondingElement.classList.contains(ignoreClass);
  }

  return current.classList.contains(ignoreClass);
}
/**
 * Try to find our node in a hierarchy of nodes, returning the document
 * node as highest node if our node is not found in the path up.
 */

function findHighest(current, componentNode, ignoreClass) {
  if (current === componentNode) {
    return true;
  } // If source=local then this event came from 'somewhere'
  // inside and should be ignored. We could handle this with
  // a layered approach, too, but that requires going back to
  // thinking in terms of Dom node nesting, running counter
  // to React's 'you shouldn't care about the DOM' philosophy.


  while (current.parentNode) {
    if (isNodeFound(current, componentNode, ignoreClass)) {
      return true;
    }

    current = current.parentNode;
  }

  return current;
}
/**
 * Check if the browser scrollbar was clicked
 */

function clickedScrollbar(evt) {
  return document.documentElement.clientWidth <= evt.clientX || document.documentElement.clientHeight <= evt.clientY;
}

// ideally will get replaced with external dep
// when rafrex/detect-passive-events#4 and rafrex/detect-passive-events#5 get merged in
var testPassiveEventSupport = function testPassiveEventSupport() {
  if (typeof window === 'undefined' || typeof window.addEventListener !== 'function') {
    return;
  }

  var passive = false;
  var options = Object.defineProperty({}, 'passive', {
    get: function get() {
      passive = true;
    }
  });

  var noop = function noop() {};

  window.addEventListener('testPassiveEventSupport', noop, options);
  window.removeEventListener('testPassiveEventSupport', noop, options);
  return passive;
};

function autoInc(seed) {
  if (seed === void 0) {
    seed = 0;
  }

  return function () {
    return ++seed;
  };
}

var uid = autoInc();

var passiveEventSupport;
var handlersMap = {};
var enabledInstances = {};
var touchEvents = ['touchstart', 'touchmove'];
var IGNORE_CLASS_NAME = 'ignore-react-onclickoutside';
/**
 * Options for addEventHandler and removeEventHandler
 */

function getEventHandlerOptions(instance, eventName) {
  var handlerOptions = null;
  var isTouchEvent = touchEvents.indexOf(eventName) !== -1;

  if (isTouchEvent && passiveEventSupport) {
    handlerOptions = {
      passive: !instance.props.preventDefault
    };
  }

  return handlerOptions;
}
/**
 * This function generates the HOC function that you'll use
 * in order to impart onOutsideClick listening to an
 * arbitrary component. It gets called at the end of the
 * bootstrapping code to yield an instance of the
 * onClickOutsideHOC function defined inside setupHOC().
 */


function onClickOutsideHOC(WrappedComponent, config) {
  var _class, _temp;

  return _temp = _class =
  /*#__PURE__*/
  function (_Component) {
    _inheritsLoose(onClickOutside, _Component);

    function onClickOutside(props) {
      var _this;

      _this = _Component.call(this, props) || this;

      _this.__outsideClickHandler = function (event) {
        if (typeof _this.__clickOutsideHandlerProp === 'function') {
          _this.__clickOutsideHandlerProp(event);

          return;
        }

        var instance = _this.getInstance();

        if (typeof instance.props.handleClickOutside === 'function') {
          instance.props.handleClickOutside(event);
          return;
        }

        if (typeof instance.handleClickOutside === 'function') {
          instance.handleClickOutside(event);
          return;
        }

        throw new Error('WrappedComponent lacks a handleClickOutside(event) function for processing outside click events.');
      };

      _this.enableOnClickOutside = function () {
        if (typeof document === 'undefined' || enabledInstances[_this._uid]) {
          return;
        }

        if (typeof passiveEventSupport === 'undefined') {
          passiveEventSupport = testPassiveEventSupport();
        }

        enabledInstances[_this._uid] = true;
        var events = _this.props.eventTypes;

        if (!events.forEach) {
          events = [events];
        }

        handlersMap[_this._uid] = function (event) {
          if (_this.props.disableOnClickOutside) return;
          if (_this.componentNode === null) return;

          if (_this.props.preventDefault) {
            event.preventDefault();
          }

          if (_this.props.stopPropagation) {
            event.stopPropagation();
          }

          if (_this.props.excludeScrollbar && clickedScrollbar(event)) return;
          var current = event.target;

          if (findHighest(current, _this.componentNode, _this.props.outsideClickIgnoreClass) !== document) {
            return;
          }

          _this.__outsideClickHandler(event);
        };

        events.forEach(function (eventName) {
          document.addEventListener(eventName, handlersMap[_this._uid], getEventHandlerOptions(_this, eventName));
        });
      };

      _this.disableOnClickOutside = function () {
        delete enabledInstances[_this._uid];
        var fn = handlersMap[_this._uid];

        if (fn && typeof document !== 'undefined') {
          var events = _this.props.eventTypes;

          if (!events.forEach) {
            events = [events];
          }

          events.forEach(function (eventName) {
            return document.removeEventListener(eventName, fn, getEventHandlerOptions(_this, eventName));
          });
          delete handlersMap[_this._uid];
        }
      };

      _this.getRef = function (ref) {
        return _this.instanceRef = ref;
      };

      _this._uid = uid();
      return _this;
    }
    /**
     * Access the WrappedComponent's instance.
     */


    var _proto = onClickOutside.prototype;

    _proto.getInstance = function getInstance() {
      if (!WrappedComponent.prototype.isReactComponent) {
        return this;
      }

      var ref = this.instanceRef;
      return ref.getInstance ? ref.getInstance() : ref;
    };

    /**
     * Add click listeners to the current document,
     * linked to this component's state.
     */
    _proto.componentDidMount = function componentDidMount() {
      // If we are in an environment without a DOM such
      // as shallow rendering or snapshots then we exit
      // early to prevent any unhandled errors being thrown.
      if (typeof document === 'undefined' || !document.createElement) {
        return;
      }

      var instance = this.getInstance();

      if (config && typeof config.handleClickOutside === 'function') {
        this.__clickOutsideHandlerProp = config.handleClickOutside(instance);

        if (typeof this.__clickOutsideHandlerProp !== 'function') {
          throw new Error('WrappedComponent lacks a function for processing outside click events specified by the handleClickOutside config option.');
        }
      }

      this.componentNode = Object(__WEBPACK_IMPORTED_MODULE_1_react_dom__["findDOMNode"])(this.getInstance());
      this.enableOnClickOutside();
    };

    _proto.componentDidUpdate = function componentDidUpdate() {
      this.componentNode = Object(__WEBPACK_IMPORTED_MODULE_1_react_dom__["findDOMNode"])(this.getInstance());
    };
    /**
     * Remove all document's event listeners for this component
     */


    _proto.componentWillUnmount = function componentWillUnmount() {
      this.disableOnClickOutside();
    };
    /**
     * Can be called to explicitly enable event listening
     * for clicks and touches outside of this element.
     */


    /**
     * Pass-through render
     */
    _proto.render = function render() {
      // eslint-disable-next-line no-unused-vars
      var _props = this.props,
          excludeScrollbar = _props.excludeScrollbar,
          props = _objectWithoutProperties(_props, ["excludeScrollbar"]);

      if (WrappedComponent.prototype.isReactComponent) {
        props.ref = this.getRef;
      } else {
        props.wrappedRef = this.getRef;
      }

      props.disableOnClickOutside = this.disableOnClickOutside;
      props.enableOnClickOutside = this.enableOnClickOutside;
      return Object(__WEBPACK_IMPORTED_MODULE_0_react__["createElement"])(WrappedComponent, props);
    };

    return onClickOutside;
  }(__WEBPACK_IMPORTED_MODULE_0_react__["Component"]), _class.displayName = "OnClickOutside(" + (WrappedComponent.displayName || WrappedComponent.name || 'Component') + ")", _class.defaultProps = {
    eventTypes: ['mousedown', 'touchstart'],
    excludeScrollbar: config && config.excludeScrollbar || false,
    outsideClickIgnoreClass: IGNORE_CLASS_NAME,
    preventDefault: false,
    stopPropagation: false
  }, _class.getClass = function () {
    return WrappedComponent.getClass ? WrappedComponent.getClass() : WrappedComponent;
  }, _temp;
}


/* harmony default export */ __webpack_exports__["a"] = (onClickOutsideHOC);


/***/ }),

/***/ 537:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__Manager__ = __webpack_require__(538);
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return __WEBPACK_IMPORTED_MODULE_0__Manager__["a"]; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__Target__ = __webpack_require__(539);
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "c", function() { return __WEBPACK_IMPORTED_MODULE_1__Target__["a"]; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__Popper__ = __webpack_require__(540);
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return __WEBPACK_IMPORTED_MODULE_2__Popper__["a"]; });
/* unused harmony reexport placements */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__Arrow__ = __webpack_require__(542);
/* unused harmony reexport Arrow */





/***/ }),

/***/ 538:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_react__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_prop_types__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_prop_types___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_prop_types__);
var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }




var Manager = function (_Component) {
  _inherits(Manager, _Component);

  function Manager() {
    var _ref;

    var _temp, _this, _ret;

    _classCallCheck(this, Manager);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = Manager.__proto__ || Object.getPrototypeOf(Manager)).call.apply(_ref, [this].concat(args))), _this), _this._setTargetNode = function (node) {
      _this._targetNode = node;
    }, _this._getTargetNode = function () {
      return _this._targetNode;
    }, _temp), _possibleConstructorReturn(_this, _ret);
  }

  _createClass(Manager, [{
    key: 'getChildContext',
    value: function getChildContext() {
      return {
        popperManager: {
          setTargetNode: this._setTargetNode,
          getTargetNode: this._getTargetNode
        }
      };
    }
  }, {
    key: 'render',
    value: function render() {
      var _props = this.props,
          tag = _props.tag,
          children = _props.children,
          restProps = _objectWithoutProperties(_props, ['tag', 'children']);

      if (tag !== false) {
        return Object(__WEBPACK_IMPORTED_MODULE_0_react__["createElement"])(tag, restProps, children);
      } else {
        return children;
      }
    }
  }]);

  return Manager;
}(__WEBPACK_IMPORTED_MODULE_0_react__["Component"]);

Manager.childContextTypes = {
  popperManager: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.object.isRequired
};
Manager.propTypes = {
  tag: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.oneOfType([__WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.string, __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.bool]),
  children: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.oneOfType([__WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.node, __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.func])
};
Manager.defaultProps = {
  tag: 'div'
};


/* harmony default export */ __webpack_exports__["a"] = (Manager);

/***/ }),

/***/ 539:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_react__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_prop_types__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_prop_types___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_prop_types__);
var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }




var Target = function Target(props, context) {
  var _props$component = props.component,
      component = _props$component === undefined ? 'div' : _props$component,
      innerRef = props.innerRef,
      children = props.children,
      restProps = _objectWithoutProperties(props, ['component', 'innerRef', 'children']);

  var popperManager = context.popperManager;

  var targetRef = function targetRef(node) {
    popperManager.setTargetNode(node);
    if (typeof innerRef === 'function') {
      innerRef(node);
    }
  };

  if (typeof children === 'function') {
    var targetProps = { ref: targetRef };
    return children({ targetProps: targetProps, restProps: restProps });
  }

  var componentProps = _extends({}, restProps);

  if (typeof component === 'string') {
    componentProps.ref = targetRef;
  } else {
    componentProps.innerRef = targetRef;
  }

  return Object(__WEBPACK_IMPORTED_MODULE_0_react__["createElement"])(component, componentProps, children);
};

Target.contextTypes = {
  popperManager: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.object.isRequired
};

Target.propTypes = {
  component: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.oneOfType([__WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.node, __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.func]),
  innerRef: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.func,
  children: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.oneOfType([__WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.node, __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.func])
};

/* harmony default export */ __webpack_exports__["a"] = (Target);

/***/ }),

/***/ 540:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export placements */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_react__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_prop_types__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_prop_types___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_prop_types__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_popper_js__ = __webpack_require__(541);
var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }





var placements = __WEBPACK_IMPORTED_MODULE_2_popper_js__["a" /* default */].placements;

var Popper = function (_Component) {
  _inherits(Popper, _Component);

  function Popper() {
    var _ref;

    var _temp, _this, _ret;

    _classCallCheck(this, Popper);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = Popper.__proto__ || Object.getPrototypeOf(Popper)).call.apply(_ref, [this].concat(args))), _this), _this.state = {}, _this._setArrowNode = function (node) {
      _this._arrowNode = node;
    }, _this._getTargetNode = function () {
      if (_this.props.target) {
        return _this.props.target;
      } else if (!_this.context.popperManager || !_this.context.popperManager.getTargetNode()) {
        throw new Error('Target missing. Popper must be given a target from the Popper Manager, or as a prop.');
      }
      return _this.context.popperManager.getTargetNode();
    }, _this._getOffsets = function (data) {
      return Object.keys(data.offsets).map(function (key) {
        return data.offsets[key];
      });
    }, _this._isDataDirty = function (data) {
      if (_this.state.data) {
        return JSON.stringify(_this._getOffsets(_this.state.data)) !== JSON.stringify(_this._getOffsets(data));
      } else {
        return true;
      }
    }, _this._updateStateModifier = {
      enabled: true,
      order: 900,
      fn: function fn(data) {
        if (_this._isDataDirty(data)) {
          _this.setState({ data: data });
        }
        return data;
      }
    }, _this._getPopperStyle = function () {
      var data = _this.state.data;


      if (!_this._popper || !data) {
        return {
          position: 'absolute',
          pointerEvents: 'none',
          opacity: 0
        };
      }

      return _extends({
        position: data.offsets.popper.position
      }, data.styles);
    }, _this._getPopperPlacement = function () {
      return _this.state.data ? _this.state.data.placement : undefined;
    }, _this._getPopperHide = function () {
      return !!_this.state.data && _this.state.data.hide ? '' : undefined;
    }, _this._getArrowStyle = function () {
      if (!_this.state.data || !_this.state.data.offsets.arrow) {
        return {};
      } else {
        var _this$state$data$offs = _this.state.data.offsets.arrow,
            top = _this$state$data$offs.top,
            left = _this$state$data$offs.left;

        return { top: top, left: left };
      }
    }, _this._handlePopperRef = function (node) {
      _this._popperNode = node;
      if (node) {
        _this._createPopper();
      } else {
        _this._destroyPopper();
      }
      if (_this.props.innerRef) {
        _this.props.innerRef(node);
      }
    }, _this._scheduleUpdate = function () {
      _this._popper && _this._popper.scheduleUpdate();
    }, _temp), _possibleConstructorReturn(_this, _ret);
  }

  _createClass(Popper, [{
    key: 'getChildContext',
    value: function getChildContext() {
      return {
        popper: {
          setArrowNode: this._setArrowNode,
          getArrowStyle: this._getArrowStyle
        }
      };
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate(lastProps) {
      if (lastProps.placement !== this.props.placement || lastProps.eventsEnabled !== this.props.eventsEnabled || lastProps.target !== this.props.target) {
        this._destroyPopper();
        this._createPopper();
      }
      if (lastProps.children !== this.props.children) {
        this._scheduleUpdate();
      }
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      this._destroyPopper();
    }
  }, {
    key: '_createPopper',
    value: function _createPopper() {
      var _this2 = this;

      var _props = this.props,
          placement = _props.placement,
          eventsEnabled = _props.eventsEnabled;

      var modifiers = _extends({}, this.props.modifiers, {
        applyStyle: { enabled: false },
        updateState: this._updateStateModifier
      });
      if (this._arrowNode) {
        modifiers.arrow = _extends({}, this.props.modifiers.arrow || {}, {
          element: this._arrowNode
        });
      }
      this._popper = new __WEBPACK_IMPORTED_MODULE_2_popper_js__["a" /* default */](this._getTargetNode(), this._popperNode, {
        placement: placement,
        eventsEnabled: eventsEnabled,
        modifiers: modifiers
      });

      // TODO: look into setTimeout scheduleUpdate call, without it, the popper will not position properly on creation
      setTimeout(function () {
        return _this2._scheduleUpdate();
      });
    }
  }, {
    key: '_destroyPopper',
    value: function _destroyPopper() {
      if (this._popper) {
        this._popper.destroy();
      }
    }
  }, {
    key: 'render',
    value: function render() {
      var _props2 = this.props,
          component = _props2.component,
          innerRef = _props2.innerRef,
          placement = _props2.placement,
          eventsEnabled = _props2.eventsEnabled,
          modifiers = _props2.modifiers,
          children = _props2.children,
          restProps = _objectWithoutProperties(_props2, ['component', 'innerRef', 'placement', 'eventsEnabled', 'modifiers', 'children']);

      var popperStyle = this._getPopperStyle();
      var popperPlacement = this._getPopperPlacement();
      var popperHide = this._getPopperHide();

      if (typeof children === 'function') {
        var popperProps = {
          ref: this._handlePopperRef,
          style: popperStyle,
          'data-placement': popperPlacement,
          'data-x-out-of-boundaries': popperHide
        };
        return children({
          popperProps: popperProps,
          restProps: restProps,
          scheduleUpdate: this._scheduleUpdate
        });
      }

      var componentProps = _extends({}, restProps, {
        style: _extends({}, restProps.style, popperStyle),
        'data-placement': popperPlacement,
        'data-x-out-of-boundaries': popperHide
      });

      if (typeof component === 'string') {
        componentProps.ref = this._handlePopperRef;
      } else {
        componentProps.innerRef = this._handlePopperRef;
      }

      return Object(__WEBPACK_IMPORTED_MODULE_0_react__["createElement"])(component, componentProps, children);
    }
  }]);

  return Popper;
}(__WEBPACK_IMPORTED_MODULE_0_react__["Component"]);

Popper.contextTypes = {
  popperManager: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.object
};
Popper.childContextTypes = {
  popper: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.object.isRequired
};
Popper.propTypes = {
  component: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.oneOfType([__WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.node, __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.func]),
  innerRef: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.func,
  placement: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.oneOf(placements),
  eventsEnabled: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.bool,
  modifiers: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.object,
  children: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.oneOfType([__WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.node, __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.func]),
  target: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.oneOfType([
  // the following check is needed for SSR
  __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.instanceOf(typeof Element !== 'undefined' ? Element : Object), __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.shape({
    getBoundingClientRect: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.func.isRequired,
    clientWidth: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.number.isRequired,
    clientHeight: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.number.isRequired
  })])
};
Popper.defaultProps = {
  component: 'div',
  placement: 'bottom',
  eventsEnabled: true,
  modifiers: {}
};


/* harmony default export */ __webpack_exports__["a"] = (Popper);

/***/ }),

/***/ 541:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(global) {/**!
 * @fileOverview Kickass library to create and place poppers near their reference elements.
 * @version 1.14.1
 * @license
 * Copyright (c) 2016 Federico Zivolo and contributors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
var isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';
var longerTimeoutBrowsers = ['Edge', 'Trident', 'Firefox'];
var timeoutDuration = 0;
for (var i = 0; i < longerTimeoutBrowsers.length; i += 1) {
  if (isBrowser && navigator.userAgent.indexOf(longerTimeoutBrowsers[i]) >= 0) {
    timeoutDuration = 1;
    break;
  }
}

function microtaskDebounce(fn) {
  var called = false;
  return function () {
    if (called) {
      return;
    }
    called = true;
    window.Promise.resolve().then(function () {
      called = false;
      fn();
    });
  };
}

function taskDebounce(fn) {
  var scheduled = false;
  return function () {
    if (!scheduled) {
      scheduled = true;
      setTimeout(function () {
        scheduled = false;
        fn();
      }, timeoutDuration);
    }
  };
}

var supportsMicroTasks = isBrowser && window.Promise;

/**
* Create a debounced version of a method, that's asynchronously deferred
* but called in the minimum time possible.
*
* @method
* @memberof Popper.Utils
* @argument {Function} fn
* @returns {Function}
*/
var debounce = supportsMicroTasks ? microtaskDebounce : taskDebounce;

/**
 * Check if the given variable is a function
 * @method
 * @memberof Popper.Utils
 * @argument {Any} functionToCheck - variable to check
 * @returns {Boolean} answer to: is a function?
 */
function isFunction(functionToCheck) {
  var getType = {};
  return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
}

/**
 * Get CSS computed property of the given element
 * @method
 * @memberof Popper.Utils
 * @argument {Eement} element
 * @argument {String} property
 */
function getStyleComputedProperty(element, property) {
  if (element.nodeType !== 1) {
    return [];
  }
  // NOTE: 1 DOM access here
  var css = getComputedStyle(element, null);
  return property ? css[property] : css;
}

/**
 * Returns the parentNode or the host of the element
 * @method
 * @memberof Popper.Utils
 * @argument {Element} element
 * @returns {Element} parent
 */
function getParentNode(element) {
  if (element.nodeName === 'HTML') {
    return element;
  }
  return element.parentNode || element.host;
}

/**
 * Returns the scrolling parent of the given element
 * @method
 * @memberof Popper.Utils
 * @argument {Element} element
 * @returns {Element} scroll parent
 */
function getScrollParent(element) {
  // Return body, `getScroll` will take care to get the correct `scrollTop` from it
  if (!element) {
    return document.body;
  }

  switch (element.nodeName) {
    case 'HTML':
    case 'BODY':
      return element.ownerDocument.body;
    case '#document':
      return element.body;
  }

  // Firefox want us to check `-x` and `-y` variations as well

  var _getStyleComputedProp = getStyleComputedProperty(element),
      overflow = _getStyleComputedProp.overflow,
      overflowX = _getStyleComputedProp.overflowX,
      overflowY = _getStyleComputedProp.overflowY;

  if (/(auto|scroll|overlay)/.test(overflow + overflowY + overflowX)) {
    return element;
  }

  return getScrollParent(getParentNode(element));
}

/**
 * Tells if you are running Internet Explorer
 * @method
 * @memberof Popper.Utils
 * @argument {number} version to check
 * @returns {Boolean} isIE
 */
var cache = {};

var isIE = function () {
  var version = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'all';

  version = version.toString();
  if (cache.hasOwnProperty(version)) {
    return cache[version];
  }
  switch (version) {
    case '11':
      cache[version] = navigator.userAgent.indexOf('Trident') !== -1;
      break;
    case '10':
      cache[version] = navigator.appVersion.indexOf('MSIE 10') !== -1;
      break;
    case 'all':
      cache[version] = navigator.userAgent.indexOf('Trident') !== -1 || navigator.userAgent.indexOf('MSIE') !== -1;
      break;
  }

  //Set IE
  cache.all = cache.all || Object.keys(cache).some(function (key) {
    return cache[key];
  });
  return cache[version];
};

/**
 * Returns the offset parent of the given element
 * @method
 * @memberof Popper.Utils
 * @argument {Element} element
 * @returns {Element} offset parent
 */
function getOffsetParent(element) {
  if (!element) {
    return document.documentElement;
  }

  var noOffsetParent = isIE(10) ? document.body : null;

  // NOTE: 1 DOM access here
  var offsetParent = element.offsetParent;
  // Skip hidden elements which don't have an offsetParent
  while (offsetParent === noOffsetParent && element.nextElementSibling) {
    offsetParent = (element = element.nextElementSibling).offsetParent;
  }

  var nodeName = offsetParent && offsetParent.nodeName;

  if (!nodeName || nodeName === 'BODY' || nodeName === 'HTML') {
    return element ? element.ownerDocument.documentElement : document.documentElement;
  }

  // .offsetParent will return the closest TD or TABLE in case
  // no offsetParent is present, I hate this job...
  if (['TD', 'TABLE'].indexOf(offsetParent.nodeName) !== -1 && getStyleComputedProperty(offsetParent, 'position') === 'static') {
    return getOffsetParent(offsetParent);
  }

  return offsetParent;
}

function isOffsetContainer(element) {
  var nodeName = element.nodeName;

  if (nodeName === 'BODY') {
    return false;
  }
  return nodeName === 'HTML' || getOffsetParent(element.firstElementChild) === element;
}

/**
 * Finds the root node (document, shadowDOM root) of the given element
 * @method
 * @memberof Popper.Utils
 * @argument {Element} node
 * @returns {Element} root node
 */
function getRoot(node) {
  if (node.parentNode !== null) {
    return getRoot(node.parentNode);
  }

  return node;
}

/**
 * Finds the offset parent common to the two provided nodes
 * @method
 * @memberof Popper.Utils
 * @argument {Element} element1
 * @argument {Element} element2
 * @returns {Element} common offset parent
 */
function findCommonOffsetParent(element1, element2) {
  // This check is needed to avoid errors in case one of the elements isn't defined for any reason
  if (!element1 || !element1.nodeType || !element2 || !element2.nodeType) {
    return document.documentElement;
  }

  // Here we make sure to give as "start" the element that comes first in the DOM
  var order = element1.compareDocumentPosition(element2) & Node.DOCUMENT_POSITION_FOLLOWING;
  var start = order ? element1 : element2;
  var end = order ? element2 : element1;

  // Get common ancestor container
  var range = document.createRange();
  range.setStart(start, 0);
  range.setEnd(end, 0);
  var commonAncestorContainer = range.commonAncestorContainer;

  // Both nodes are inside #document

  if (element1 !== commonAncestorContainer && element2 !== commonAncestorContainer || start.contains(end)) {
    if (isOffsetContainer(commonAncestorContainer)) {
      return commonAncestorContainer;
    }

    return getOffsetParent(commonAncestorContainer);
  }

  // one of the nodes is inside shadowDOM, find which one
  var element1root = getRoot(element1);
  if (element1root.host) {
    return findCommonOffsetParent(element1root.host, element2);
  } else {
    return findCommonOffsetParent(element1, getRoot(element2).host);
  }
}

/**
 * Gets the scroll value of the given element in the given side (top and left)
 * @method
 * @memberof Popper.Utils
 * @argument {Element} element
 * @argument {String} side `top` or `left`
 * @returns {number} amount of scrolled pixels
 */
function getScroll(element) {
  var side = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'top';

  var upperSide = side === 'top' ? 'scrollTop' : 'scrollLeft';
  var nodeName = element.nodeName;

  if (nodeName === 'BODY' || nodeName === 'HTML') {
    var html = element.ownerDocument.documentElement;
    var scrollingElement = element.ownerDocument.scrollingElement || html;
    return scrollingElement[upperSide];
  }

  return element[upperSide];
}

/*
 * Sum or subtract the element scroll values (left and top) from a given rect object
 * @method
 * @memberof Popper.Utils
 * @param {Object} rect - Rect object you want to change
 * @param {HTMLElement} element - The element from the function reads the scroll values
 * @param {Boolean} subtract - set to true if you want to subtract the scroll values
 * @return {Object} rect - The modifier rect object
 */
function includeScroll(rect, element) {
  var subtract = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

  var scrollTop = getScroll(element, 'top');
  var scrollLeft = getScroll(element, 'left');
  var modifier = subtract ? -1 : 1;
  rect.top += scrollTop * modifier;
  rect.bottom += scrollTop * modifier;
  rect.left += scrollLeft * modifier;
  rect.right += scrollLeft * modifier;
  return rect;
}

/*
 * Helper to detect borders of a given element
 * @method
 * @memberof Popper.Utils
 * @param {CSSStyleDeclaration} styles
 * Result of `getStyleComputedProperty` on the given element
 * @param {String} axis - `x` or `y`
 * @return {number} borders - The borders size of the given axis
 */

function getBordersSize(styles, axis) {
  var sideA = axis === 'x' ? 'Left' : 'Top';
  var sideB = sideA === 'Left' ? 'Right' : 'Bottom';

  return parseFloat(styles['border' + sideA + 'Width'], 10) + parseFloat(styles['border' + sideB + 'Width'], 10);
}

function getSize(axis, body, html, computedStyle) {
  return Math.max(body['offset' + axis], body['scroll' + axis], html['client' + axis], html['offset' + axis], html['scroll' + axis], isIE(10) ? html['offset' + axis] + computedStyle['margin' + (axis === 'Height' ? 'Top' : 'Left')] + computedStyle['margin' + (axis === 'Height' ? 'Bottom' : 'Right')] : 0);
}

function getWindowSizes() {
  var body = document.body;
  var html = document.documentElement;
  var computedStyle = isIE(10) && getComputedStyle(html);

  return {
    height: getSize('Height', body, html, computedStyle),
    width: getSize('Width', body, html, computedStyle)
  };
}

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();





var defineProperty = function (obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
};

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];

    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }

  return target;
};

/**
 * Given element offsets, generate an output similar to getBoundingClientRect
 * @method
 * @memberof Popper.Utils
 * @argument {Object} offsets
 * @returns {Object} ClientRect like output
 */
function getClientRect(offsets) {
  return _extends({}, offsets, {
    right: offsets.left + offsets.width,
    bottom: offsets.top + offsets.height
  });
}

/**
 * Get bounding client rect of given element
 * @method
 * @memberof Popper.Utils
 * @param {HTMLElement} element
 * @return {Object} client rect
 */
function getBoundingClientRect(element) {
  var rect = {};

  // IE10 10 FIX: Please, don't ask, the element isn't
  // considered in DOM in some circumstances...
  // This isn't reproducible in IE10 compatibility mode of IE11
  try {
    if (isIE(10)) {
      rect = element.getBoundingClientRect();
      var scrollTop = getScroll(element, 'top');
      var scrollLeft = getScroll(element, 'left');
      rect.top += scrollTop;
      rect.left += scrollLeft;
      rect.bottom += scrollTop;
      rect.right += scrollLeft;
    } else {
      rect = element.getBoundingClientRect();
    }
  } catch (e) {}

  var result = {
    left: rect.left,
    top: rect.top,
    width: rect.right - rect.left,
    height: rect.bottom - rect.top
  };

  // subtract scrollbar size from sizes
  var sizes = element.nodeName === 'HTML' ? getWindowSizes() : {};
  var width = sizes.width || element.clientWidth || result.right - result.left;
  var height = sizes.height || element.clientHeight || result.bottom - result.top;

  var horizScrollbar = element.offsetWidth - width;
  var vertScrollbar = element.offsetHeight - height;

  // if an hypothetical scrollbar is detected, we must be sure it's not a `border`
  // we make this check conditional for performance reasons
  if (horizScrollbar || vertScrollbar) {
    var styles = getStyleComputedProperty(element);
    horizScrollbar -= getBordersSize(styles, 'x');
    vertScrollbar -= getBordersSize(styles, 'y');

    result.width -= horizScrollbar;
    result.height -= vertScrollbar;
  }

  return getClientRect(result);
}

function getOffsetRectRelativeToArbitraryNode(children, parent) {
  var fixedPosition = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

  var isIE10 = isIE(10);
  var isHTML = parent.nodeName === 'HTML';
  var childrenRect = getBoundingClientRect(children);
  var parentRect = getBoundingClientRect(parent);
  var scrollParent = getScrollParent(children);

  var styles = getStyleComputedProperty(parent);
  var borderTopWidth = parseFloat(styles.borderTopWidth, 10);
  var borderLeftWidth = parseFloat(styles.borderLeftWidth, 10);

  // In cases where the parent is fixed, we must ignore negative scroll in offset calc
  if (fixedPosition && parent.nodeName === 'HTML') {
    parentRect.top = Math.max(parentRect.top, 0);
    parentRect.left = Math.max(parentRect.left, 0);
  }
  var offsets = getClientRect({
    top: childrenRect.top - parentRect.top - borderTopWidth,
    left: childrenRect.left - parentRect.left - borderLeftWidth,
    width: childrenRect.width,
    height: childrenRect.height
  });
  offsets.marginTop = 0;
  offsets.marginLeft = 0;

  // Subtract margins of documentElement in case it's being used as parent
  // we do this only on HTML because it's the only element that behaves
  // differently when margins are applied to it. The margins are included in
  // the box of the documentElement, in the other cases not.
  if (!isIE10 && isHTML) {
    var marginTop = parseFloat(styles.marginTop, 10);
    var marginLeft = parseFloat(styles.marginLeft, 10);

    offsets.top -= borderTopWidth - marginTop;
    offsets.bottom -= borderTopWidth - marginTop;
    offsets.left -= borderLeftWidth - marginLeft;
    offsets.right -= borderLeftWidth - marginLeft;

    // Attach marginTop and marginLeft because in some circumstances we may need them
    offsets.marginTop = marginTop;
    offsets.marginLeft = marginLeft;
  }

  if (isIE10 && !fixedPosition ? parent.contains(scrollParent) : parent === scrollParent && scrollParent.nodeName !== 'BODY') {
    offsets = includeScroll(offsets, parent);
  }

  return offsets;
}

function getViewportOffsetRectRelativeToArtbitraryNode(element) {
  var excludeScroll = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

  var html = element.ownerDocument.documentElement;
  var relativeOffset = getOffsetRectRelativeToArbitraryNode(element, html);
  var width = Math.max(html.clientWidth, window.innerWidth || 0);
  var height = Math.max(html.clientHeight, window.innerHeight || 0);

  var scrollTop = !excludeScroll ? getScroll(html) : 0;
  var scrollLeft = !excludeScroll ? getScroll(html, 'left') : 0;

  var offset = {
    top: scrollTop - relativeOffset.top + relativeOffset.marginTop,
    left: scrollLeft - relativeOffset.left + relativeOffset.marginLeft,
    width: width,
    height: height
  };

  return getClientRect(offset);
}

/**
 * Check if the given element is fixed or is inside a fixed parent
 * @method
 * @memberof Popper.Utils
 * @argument {Element} element
 * @argument {Element} customContainer
 * @returns {Boolean} answer to "isFixed?"
 */
function isFixed(element) {
  var nodeName = element.nodeName;
  if (nodeName === 'BODY' || nodeName === 'HTML') {
    return false;
  }
  if (getStyleComputedProperty(element, 'position') === 'fixed') {
    return true;
  }
  return isFixed(getParentNode(element));
}

/**
 * Finds the first parent of an element that has a transformed property defined
 * @method
 * @memberof Popper.Utils
 * @argument {Element} element
 * @returns {Element} first transformed parent or documentElement
 */

function getFixedPositionOffsetParent(element) {
  // This check is needed to avoid errors in case one of the elements isn't defined for any reason
  if (!element || !element.parentElement || isIE()) {
    return document.documentElement;
  }
  var el = element.parentElement;
  while (el && getStyleComputedProperty(el, 'transform') === 'none') {
    el = el.parentElement;
  }
  return el || document.documentElement;
}

/**
 * Computed the boundaries limits and return them
 * @method
 * @memberof Popper.Utils
 * @param {HTMLElement} popper
 * @param {HTMLElement} reference
 * @param {number} padding
 * @param {HTMLElement} boundariesElement - Element used to define the boundaries
 * @param {Boolean} fixedPosition - Is in fixed position mode
 * @returns {Object} Coordinates of the boundaries
 */
function getBoundaries(popper, reference, padding, boundariesElement) {
  var fixedPosition = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;

  // NOTE: 1 DOM access here

  var boundaries = { top: 0, left: 0 };
  var offsetParent = fixedPosition ? getFixedPositionOffsetParent(popper) : findCommonOffsetParent(popper, reference);

  // Handle viewport case
  if (boundariesElement === 'viewport') {
    boundaries = getViewportOffsetRectRelativeToArtbitraryNode(offsetParent, fixedPosition);
  } else {
    // Handle other cases based on DOM element used as boundaries
    var boundariesNode = void 0;
    if (boundariesElement === 'scrollParent') {
      boundariesNode = getScrollParent(getParentNode(reference));
      if (boundariesNode.nodeName === 'BODY') {
        boundariesNode = popper.ownerDocument.documentElement;
      }
    } else if (boundariesElement === 'window') {
      boundariesNode = popper.ownerDocument.documentElement;
    } else {
      boundariesNode = boundariesElement;
    }

    var offsets = getOffsetRectRelativeToArbitraryNode(boundariesNode, offsetParent, fixedPosition);

    // In case of HTML, we need a different computation
    if (boundariesNode.nodeName === 'HTML' && !isFixed(offsetParent)) {
      var _getWindowSizes = getWindowSizes(),
          height = _getWindowSizes.height,
          width = _getWindowSizes.width;

      boundaries.top += offsets.top - offsets.marginTop;
      boundaries.bottom = height + offsets.top;
      boundaries.left += offsets.left - offsets.marginLeft;
      boundaries.right = width + offsets.left;
    } else {
      // for all the other DOM elements, this one is good
      boundaries = offsets;
    }
  }

  // Add paddings
  boundaries.left += padding;
  boundaries.top += padding;
  boundaries.right -= padding;
  boundaries.bottom -= padding;

  return boundaries;
}

function getArea(_ref) {
  var width = _ref.width,
      height = _ref.height;

  return width * height;
}

/**
 * Utility used to transform the `auto` placement to the placement with more
 * available space.
 * @method
 * @memberof Popper.Utils
 * @argument {Object} data - The data object generated by update method
 * @argument {Object} options - Modifiers configuration and options
 * @returns {Object} The data object, properly modified
 */
function computeAutoPlacement(placement, refRect, popper, reference, boundariesElement) {
  var padding = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 0;

  if (placement.indexOf('auto') === -1) {
    return placement;
  }

  var boundaries = getBoundaries(popper, reference, padding, boundariesElement);

  var rects = {
    top: {
      width: boundaries.width,
      height: refRect.top - boundaries.top
    },
    right: {
      width: boundaries.right - refRect.right,
      height: boundaries.height
    },
    bottom: {
      width: boundaries.width,
      height: boundaries.bottom - refRect.bottom
    },
    left: {
      width: refRect.left - boundaries.left,
      height: boundaries.height
    }
  };

  var sortedAreas = Object.keys(rects).map(function (key) {
    return _extends({
      key: key
    }, rects[key], {
      area: getArea(rects[key])
    });
  }).sort(function (a, b) {
    return b.area - a.area;
  });

  var filteredAreas = sortedAreas.filter(function (_ref2) {
    var width = _ref2.width,
        height = _ref2.height;
    return width >= popper.clientWidth && height >= popper.clientHeight;
  });

  var computedPlacement = filteredAreas.length > 0 ? filteredAreas[0].key : sortedAreas[0].key;

  var variation = placement.split('-')[1];

  return computedPlacement + (variation ? '-' + variation : '');
}

/**
 * Get offsets to the reference element
 * @method
 * @memberof Popper.Utils
 * @param {Object} state
 * @param {Element} popper - the popper element
 * @param {Element} reference - the reference element (the popper will be relative to this)
 * @param {Element} fixedPosition - is in fixed position mode
 * @returns {Object} An object containing the offsets which will be applied to the popper
 */
function getReferenceOffsets(state, popper, reference) {
  var fixedPosition = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;

  var commonOffsetParent = fixedPosition ? getFixedPositionOffsetParent(popper) : findCommonOffsetParent(popper, reference);
  return getOffsetRectRelativeToArbitraryNode(reference, commonOffsetParent, fixedPosition);
}

/**
 * Get the outer sizes of the given element (offset size + margins)
 * @method
 * @memberof Popper.Utils
 * @argument {Element} element
 * @returns {Object} object containing width and height properties
 */
function getOuterSizes(element) {
  var styles = getComputedStyle(element);
  var x = parseFloat(styles.marginTop) + parseFloat(styles.marginBottom);
  var y = parseFloat(styles.marginLeft) + parseFloat(styles.marginRight);
  var result = {
    width: element.offsetWidth + y,
    height: element.offsetHeight + x
  };
  return result;
}

/**
 * Get the opposite placement of the given one
 * @method
 * @memberof Popper.Utils
 * @argument {String} placement
 * @returns {String} flipped placement
 */
function getOppositePlacement(placement) {
  var hash = { left: 'right', right: 'left', bottom: 'top', top: 'bottom' };
  return placement.replace(/left|right|bottom|top/g, function (matched) {
    return hash[matched];
  });
}

/**
 * Get offsets to the popper
 * @method
 * @memberof Popper.Utils
 * @param {Object} position - CSS position the Popper will get applied
 * @param {HTMLElement} popper - the popper element
 * @param {Object} referenceOffsets - the reference offsets (the popper will be relative to this)
 * @param {String} placement - one of the valid placement options
 * @returns {Object} popperOffsets - An object containing the offsets which will be applied to the popper
 */
function getPopperOffsets(popper, referenceOffsets, placement) {
  placement = placement.split('-')[0];

  // Get popper node sizes
  var popperRect = getOuterSizes(popper);

  // Add position, width and height to our offsets object
  var popperOffsets = {
    width: popperRect.width,
    height: popperRect.height
  };

  // depending by the popper placement we have to compute its offsets slightly differently
  var isHoriz = ['right', 'left'].indexOf(placement) !== -1;
  var mainSide = isHoriz ? 'top' : 'left';
  var secondarySide = isHoriz ? 'left' : 'top';
  var measurement = isHoriz ? 'height' : 'width';
  var secondaryMeasurement = !isHoriz ? 'height' : 'width';

  popperOffsets[mainSide] = referenceOffsets[mainSide] + referenceOffsets[measurement] / 2 - popperRect[measurement] / 2;
  if (placement === secondarySide) {
    popperOffsets[secondarySide] = referenceOffsets[secondarySide] - popperRect[secondaryMeasurement];
  } else {
    popperOffsets[secondarySide] = referenceOffsets[getOppositePlacement(secondarySide)];
  }

  return popperOffsets;
}

/**
 * Mimics the `find` method of Array
 * @method
 * @memberof Popper.Utils
 * @argument {Array} arr
 * @argument prop
 * @argument value
 * @returns index or -1
 */
function find(arr, check) {
  // use native find if supported
  if (Array.prototype.find) {
    return arr.find(check);
  }

  // use `filter` to obtain the same behavior of `find`
  return arr.filter(check)[0];
}

/**
 * Return the index of the matching object
 * @method
 * @memberof Popper.Utils
 * @argument {Array} arr
 * @argument prop
 * @argument value
 * @returns index or -1
 */
function findIndex(arr, prop, value) {
  // use native findIndex if supported
  if (Array.prototype.findIndex) {
    return arr.findIndex(function (cur) {
      return cur[prop] === value;
    });
  }

  // use `find` + `indexOf` if `findIndex` isn't supported
  var match = find(arr, function (obj) {
    return obj[prop] === value;
  });
  return arr.indexOf(match);
}

/**
 * Loop trough the list of modifiers and run them in order,
 * each of them will then edit the data object.
 * @method
 * @memberof Popper.Utils
 * @param {dataObject} data
 * @param {Array} modifiers
 * @param {String} ends - Optional modifier name used as stopper
 * @returns {dataObject}
 */
function runModifiers(modifiers, data, ends) {
  var modifiersToRun = ends === undefined ? modifiers : modifiers.slice(0, findIndex(modifiers, 'name', ends));

  modifiersToRun.forEach(function (modifier) {
    if (modifier['function']) {
      // eslint-disable-line dot-notation
      console.warn('`modifier.function` is deprecated, use `modifier.fn`!');
    }
    var fn = modifier['function'] || modifier.fn; // eslint-disable-line dot-notation
    if (modifier.enabled && isFunction(fn)) {
      // Add properties to offsets to make them a complete clientRect object
      // we do this before each modifier to make sure the previous one doesn't
      // mess with these values
      data.offsets.popper = getClientRect(data.offsets.popper);
      data.offsets.reference = getClientRect(data.offsets.reference);

      data = fn(data, modifier);
    }
  });

  return data;
}

/**
 * Updates the position of the popper, computing the new offsets and applying
 * the new style.<br />
 * Prefer `scheduleUpdate` over `update` because of performance reasons.
 * @method
 * @memberof Popper
 */
function update() {
  // if popper is destroyed, don't perform any further update
  if (this.state.isDestroyed) {
    return;
  }

  var data = {
    instance: this,
    styles: {},
    arrowStyles: {},
    attributes: {},
    flipped: false,
    offsets: {}
  };

  // compute reference element offsets
  data.offsets.reference = getReferenceOffsets(this.state, this.popper, this.reference, this.options.positionFixed);

  // compute auto placement, store placement inside the data object,
  // modifiers will be able to edit `placement` if needed
  // and refer to originalPlacement to know the original value
  data.placement = computeAutoPlacement(this.options.placement, data.offsets.reference, this.popper, this.reference, this.options.modifiers.flip.boundariesElement, this.options.modifiers.flip.padding);

  // store the computed placement inside `originalPlacement`
  data.originalPlacement = data.placement;

  data.positionFixed = this.options.positionFixed;

  // compute the popper offsets
  data.offsets.popper = getPopperOffsets(this.popper, data.offsets.reference, data.placement);
  data.offsets.popper.position = this.options.positionFixed ? 'fixed' : 'absolute';

  // run the modifiers
  data = runModifiers(this.modifiers, data);

  // the first `update` will call `onCreate` callback
  // the other ones will call `onUpdate` callback
  if (!this.state.isCreated) {
    this.state.isCreated = true;
    this.options.onCreate(data);
  } else {
    this.options.onUpdate(data);
  }
}

/**
 * Helper used to know if the given modifier is enabled.
 * @method
 * @memberof Popper.Utils
 * @returns {Boolean}
 */
function isModifierEnabled(modifiers, modifierName) {
  return modifiers.some(function (_ref) {
    var name = _ref.name,
        enabled = _ref.enabled;
    return enabled && name === modifierName;
  });
}

/**
 * Get the prefixed supported property name
 * @method
 * @memberof Popper.Utils
 * @argument {String} property (camelCase)
 * @returns {String} prefixed property (camelCase or PascalCase, depending on the vendor prefix)
 */
function getSupportedPropertyName(property) {
  var prefixes = [false, 'ms', 'Webkit', 'Moz', 'O'];
  var upperProp = property.charAt(0).toUpperCase() + property.slice(1);

  for (var i = 0; i < prefixes.length; i++) {
    var prefix = prefixes[i];
    var toCheck = prefix ? '' + prefix + upperProp : property;
    if (typeof document.body.style[toCheck] !== 'undefined') {
      return toCheck;
    }
  }
  return null;
}

/**
 * Destroy the popper
 * @method
 * @memberof Popper
 */
function destroy() {
  this.state.isDestroyed = true;

  // touch DOM only if `applyStyle` modifier is enabled
  if (isModifierEnabled(this.modifiers, 'applyStyle')) {
    this.popper.removeAttribute('x-placement');
    this.popper.style.position = '';
    this.popper.style.top = '';
    this.popper.style.left = '';
    this.popper.style.right = '';
    this.popper.style.bottom = '';
    this.popper.style.willChange = '';
    this.popper.style[getSupportedPropertyName('transform')] = '';
  }

  this.disableEventListeners();

  // remove the popper if user explicity asked for the deletion on destroy
  // do not use `remove` because IE11 doesn't support it
  if (this.options.removeOnDestroy) {
    this.popper.parentNode.removeChild(this.popper);
  }
  return this;
}

/**
 * Get the window associated with the element
 * @argument {Element} element
 * @returns {Window}
 */
function getWindow(element) {
  var ownerDocument = element.ownerDocument;
  return ownerDocument ? ownerDocument.defaultView : window;
}

function attachToScrollParents(scrollParent, event, callback, scrollParents) {
  var isBody = scrollParent.nodeName === 'BODY';
  var target = isBody ? scrollParent.ownerDocument.defaultView : scrollParent;
  target.addEventListener(event, callback, { passive: true });

  if (!isBody) {
    attachToScrollParents(getScrollParent(target.parentNode), event, callback, scrollParents);
  }
  scrollParents.push(target);
}

/**
 * Setup needed event listeners used to update the popper position
 * @method
 * @memberof Popper.Utils
 * @private
 */
function setupEventListeners(reference, options, state, updateBound) {
  // Resize event listener on window
  state.updateBound = updateBound;
  getWindow(reference).addEventListener('resize', state.updateBound, { passive: true });

  // Scroll event listener on scroll parents
  var scrollElement = getScrollParent(reference);
  attachToScrollParents(scrollElement, 'scroll', state.updateBound, state.scrollParents);
  state.scrollElement = scrollElement;
  state.eventsEnabled = true;

  return state;
}

/**
 * It will add resize/scroll events and start recalculating
 * position of the popper element when they are triggered.
 * @method
 * @memberof Popper
 */
function enableEventListeners() {
  if (!this.state.eventsEnabled) {
    this.state = setupEventListeners(this.reference, this.options, this.state, this.scheduleUpdate);
  }
}

/**
 * Remove event listeners used to update the popper position
 * @method
 * @memberof Popper.Utils
 * @private
 */
function removeEventListeners(reference, state) {
  // Remove resize event listener on window
  getWindow(reference).removeEventListener('resize', state.updateBound);

  // Remove scroll event listener on scroll parents
  state.scrollParents.forEach(function (target) {
    target.removeEventListener('scroll', state.updateBound);
  });

  // Reset state
  state.updateBound = null;
  state.scrollParents = [];
  state.scrollElement = null;
  state.eventsEnabled = false;
  return state;
}

/**
 * It will remove resize/scroll events and won't recalculate popper position
 * when they are triggered. It also won't trigger onUpdate callback anymore,
 * unless you call `update` method manually.
 * @method
 * @memberof Popper
 */
function disableEventListeners() {
  if (this.state.eventsEnabled) {
    cancelAnimationFrame(this.scheduleUpdate);
    this.state = removeEventListeners(this.reference, this.state);
  }
}

/**
 * Tells if a given input is a number
 * @method
 * @memberof Popper.Utils
 * @param {*} input to check
 * @return {Boolean}
 */
function isNumeric(n) {
  return n !== '' && !isNaN(parseFloat(n)) && isFinite(n);
}

/**
 * Set the style to the given popper
 * @method
 * @memberof Popper.Utils
 * @argument {Element} element - Element to apply the style to
 * @argument {Object} styles
 * Object with a list of properties and values which will be applied to the element
 */
function setStyles(element, styles) {
  Object.keys(styles).forEach(function (prop) {
    var unit = '';
    // add unit if the value is numeric and is one of the following
    if (['width', 'height', 'top', 'right', 'bottom', 'left'].indexOf(prop) !== -1 && isNumeric(styles[prop])) {
      unit = 'px';
    }
    element.style[prop] = styles[prop] + unit;
  });
}

/**
 * Set the attributes to the given popper
 * @method
 * @memberof Popper.Utils
 * @argument {Element} element - Element to apply the attributes to
 * @argument {Object} styles
 * Object with a list of properties and values which will be applied to the element
 */
function setAttributes(element, attributes) {
  Object.keys(attributes).forEach(function (prop) {
    var value = attributes[prop];
    if (value !== false) {
      element.setAttribute(prop, attributes[prop]);
    } else {
      element.removeAttribute(prop);
    }
  });
}

/**
 * @function
 * @memberof Modifiers
 * @argument {Object} data - The data object generated by `update` method
 * @argument {Object} data.styles - List of style properties - values to apply to popper element
 * @argument {Object} data.attributes - List of attribute properties - values to apply to popper element
 * @argument {Object} options - Modifiers configuration and options
 * @returns {Object} The same data object
 */
function applyStyle(data) {
  // any property present in `data.styles` will be applied to the popper,
  // in this way we can make the 3rd party modifiers add custom styles to it
  // Be aware, modifiers could override the properties defined in the previous
  // lines of this modifier!
  setStyles(data.instance.popper, data.styles);

  // any property present in `data.attributes` will be applied to the popper,
  // they will be set as HTML attributes of the element
  setAttributes(data.instance.popper, data.attributes);

  // if arrowElement is defined and arrowStyles has some properties
  if (data.arrowElement && Object.keys(data.arrowStyles).length) {
    setStyles(data.arrowElement, data.arrowStyles);
  }

  return data;
}

/**
 * Set the x-placement attribute before everything else because it could be used
 * to add margins to the popper margins needs to be calculated to get the
 * correct popper offsets.
 * @method
 * @memberof Popper.modifiers
 * @param {HTMLElement} reference - The reference element used to position the popper
 * @param {HTMLElement} popper - The HTML element used as popper
 * @param {Object} options - Popper.js options
 */
function applyStyleOnLoad(reference, popper, options, modifierOptions, state) {
  // compute reference element offsets
  var referenceOffsets = getReferenceOffsets(state, popper, reference, options.positionFixed);

  // compute auto placement, store placement inside the data object,
  // modifiers will be able to edit `placement` if needed
  // and refer to originalPlacement to know the original value
  var placement = computeAutoPlacement(options.placement, referenceOffsets, popper, reference, options.modifiers.flip.boundariesElement, options.modifiers.flip.padding);

  popper.setAttribute('x-placement', placement);

  // Apply `position` to popper before anything else because
  // without the position applied we can't guarantee correct computations
  setStyles(popper, { position: options.positionFixed ? 'fixed' : 'absolute' });

  return options;
}

/**
 * @function
 * @memberof Modifiers
 * @argument {Object} data - The data object generated by `update` method
 * @argument {Object} options - Modifiers configuration and options
 * @returns {Object} The data object, properly modified
 */
function computeStyle(data, options) {
  var x = options.x,
      y = options.y;
  var popper = data.offsets.popper;

  // Remove this legacy support in Popper.js v2

  var legacyGpuAccelerationOption = find(data.instance.modifiers, function (modifier) {
    return modifier.name === 'applyStyle';
  }).gpuAcceleration;
  if (legacyGpuAccelerationOption !== undefined) {
    console.warn('WARNING: `gpuAcceleration` option moved to `computeStyle` modifier and will not be supported in future versions of Popper.js!');
  }
  var gpuAcceleration = legacyGpuAccelerationOption !== undefined ? legacyGpuAccelerationOption : options.gpuAcceleration;

  var offsetParent = getOffsetParent(data.instance.popper);
  var offsetParentRect = getBoundingClientRect(offsetParent);

  // Styles
  var styles = {
    position: popper.position
  };

  // floor sides to avoid blurry text
  var offsets = {
    left: Math.floor(popper.left),
    top: Math.floor(popper.top),
    bottom: Math.floor(popper.bottom),
    right: Math.floor(popper.right)
  };

  var sideA = x === 'bottom' ? 'top' : 'bottom';
  var sideB = y === 'right' ? 'left' : 'right';

  // if gpuAcceleration is set to `true` and transform is supported,
  //  we use `translate3d` to apply the position to the popper we
  // automatically use the supported prefixed version if needed
  var prefixedProperty = getSupportedPropertyName('transform');

  // now, let's make a step back and look at this code closely (wtf?)
  // If the content of the popper grows once it's been positioned, it
  // may happen that the popper gets misplaced because of the new content
  // overflowing its reference element
  // To avoid this problem, we provide two options (x and y), which allow
  // the consumer to define the offset origin.
  // If we position a popper on top of a reference element, we can set
  // `x` to `top` to make the popper grow towards its top instead of
  // its bottom.
  var left = void 0,
      top = void 0;
  if (sideA === 'bottom') {
    top = -offsetParentRect.height + offsets.bottom;
  } else {
    top = offsets.top;
  }
  if (sideB === 'right') {
    left = -offsetParentRect.width + offsets.right;
  } else {
    left = offsets.left;
  }
  if (gpuAcceleration && prefixedProperty) {
    styles[prefixedProperty] = 'translate3d(' + left + 'px, ' + top + 'px, 0)';
    styles[sideA] = 0;
    styles[sideB] = 0;
    styles.willChange = 'transform';
  } else {
    // othwerise, we use the standard `top`, `left`, `bottom` and `right` properties
    var invertTop = sideA === 'bottom' ? -1 : 1;
    var invertLeft = sideB === 'right' ? -1 : 1;
    styles[sideA] = top * invertTop;
    styles[sideB] = left * invertLeft;
    styles.willChange = sideA + ', ' + sideB;
  }

  // Attributes
  var attributes = {
    'x-placement': data.placement
  };

  // Update `data` attributes, styles and arrowStyles
  data.attributes = _extends({}, attributes, data.attributes);
  data.styles = _extends({}, styles, data.styles);
  data.arrowStyles = _extends({}, data.offsets.arrow, data.arrowStyles);

  return data;
}

/**
 * Helper used to know if the given modifier depends from another one.<br />
 * It checks if the needed modifier is listed and enabled.
 * @method
 * @memberof Popper.Utils
 * @param {Array} modifiers - list of modifiers
 * @param {String} requestingName - name of requesting modifier
 * @param {String} requestedName - name of requested modifier
 * @returns {Boolean}
 */
function isModifierRequired(modifiers, requestingName, requestedName) {
  var requesting = find(modifiers, function (_ref) {
    var name = _ref.name;
    return name === requestingName;
  });

  var isRequired = !!requesting && modifiers.some(function (modifier) {
    return modifier.name === requestedName && modifier.enabled && modifier.order < requesting.order;
  });

  if (!isRequired) {
    var _requesting = '`' + requestingName + '`';
    var requested = '`' + requestedName + '`';
    console.warn(requested + ' modifier is required by ' + _requesting + ' modifier in order to work, be sure to include it before ' + _requesting + '!');
  }
  return isRequired;
}

/**
 * @function
 * @memberof Modifiers
 * @argument {Object} data - The data object generated by update method
 * @argument {Object} options - Modifiers configuration and options
 * @returns {Object} The data object, properly modified
 */
function arrow(data, options) {
  var _data$offsets$arrow;

  // arrow depends on keepTogether in order to work
  if (!isModifierRequired(data.instance.modifiers, 'arrow', 'keepTogether')) {
    return data;
  }

  var arrowElement = options.element;

  // if arrowElement is a string, suppose it's a CSS selector
  if (typeof arrowElement === 'string') {
    arrowElement = data.instance.popper.querySelector(arrowElement);

    // if arrowElement is not found, don't run the modifier
    if (!arrowElement) {
      return data;
    }
  } else {
    // if the arrowElement isn't a query selector we must check that the
    // provided DOM node is child of its popper node
    if (!data.instance.popper.contains(arrowElement)) {
      console.warn('WARNING: `arrow.element` must be child of its popper element!');
      return data;
    }
  }

  var placement = data.placement.split('-')[0];
  var _data$offsets = data.offsets,
      popper = _data$offsets.popper,
      reference = _data$offsets.reference;

  var isVertical = ['left', 'right'].indexOf(placement) !== -1;

  var len = isVertical ? 'height' : 'width';
  var sideCapitalized = isVertical ? 'Top' : 'Left';
  var side = sideCapitalized.toLowerCase();
  var altSide = isVertical ? 'left' : 'top';
  var opSide = isVertical ? 'bottom' : 'right';
  var arrowElementSize = getOuterSizes(arrowElement)[len];

  //
  // extends keepTogether behavior making sure the popper and its
  // reference have enough pixels in conjuction
  //

  // top/left side
  if (reference[opSide] - arrowElementSize < popper[side]) {
    data.offsets.popper[side] -= popper[side] - (reference[opSide] - arrowElementSize);
  }
  // bottom/right side
  if (reference[side] + arrowElementSize > popper[opSide]) {
    data.offsets.popper[side] += reference[side] + arrowElementSize - popper[opSide];
  }
  data.offsets.popper = getClientRect(data.offsets.popper);

  // compute center of the popper
  var center = reference[side] + reference[len] / 2 - arrowElementSize / 2;

  // Compute the sideValue using the updated popper offsets
  // take popper margin in account because we don't have this info available
  var css = getStyleComputedProperty(data.instance.popper);
  var popperMarginSide = parseFloat(css['margin' + sideCapitalized], 10);
  var popperBorderSide = parseFloat(css['border' + sideCapitalized + 'Width'], 10);
  var sideValue = center - data.offsets.popper[side] - popperMarginSide - popperBorderSide;

  // prevent arrowElement from being placed not contiguously to its popper
  sideValue = Math.max(Math.min(popper[len] - arrowElementSize, sideValue), 0);

  data.arrowElement = arrowElement;
  data.offsets.arrow = (_data$offsets$arrow = {}, defineProperty(_data$offsets$arrow, side, Math.round(sideValue)), defineProperty(_data$offsets$arrow, altSide, ''), _data$offsets$arrow);

  return data;
}

/**
 * Get the opposite placement variation of the given one
 * @method
 * @memberof Popper.Utils
 * @argument {String} placement variation
 * @returns {String} flipped placement variation
 */
function getOppositeVariation(variation) {
  if (variation === 'end') {
    return 'start';
  } else if (variation === 'start') {
    return 'end';
  }
  return variation;
}

/**
 * List of accepted placements to use as values of the `placement` option.<br />
 * Valid placements are:
 * - `auto`
 * - `top`
 * - `right`
 * - `bottom`
 * - `left`
 *
 * Each placement can have a variation from this list:
 * - `-start`
 * - `-end`
 *
 * Variations are interpreted easily if you think of them as the left to right
 * written languages. Horizontally (`top` and `bottom`), `start` is left and `end`
 * is right.<br />
 * Vertically (`left` and `right`), `start` is top and `end` is bottom.
 *
 * Some valid examples are:
 * - `top-end` (on top of reference, right aligned)
 * - `right-start` (on right of reference, top aligned)
 * - `bottom` (on bottom, centered)
 * - `auto-right` (on the side with more space available, alignment depends by placement)
 *
 * @static
 * @type {Array}
 * @enum {String}
 * @readonly
 * @method placements
 * @memberof Popper
 */
var placements = ['auto-start', 'auto', 'auto-end', 'top-start', 'top', 'top-end', 'right-start', 'right', 'right-end', 'bottom-end', 'bottom', 'bottom-start', 'left-end', 'left', 'left-start'];

// Get rid of `auto` `auto-start` and `auto-end`
var validPlacements = placements.slice(3);

/**
 * Given an initial placement, returns all the subsequent placements
 * clockwise (or counter-clockwise).
 *
 * @method
 * @memberof Popper.Utils
 * @argument {String} placement - A valid placement (it accepts variations)
 * @argument {Boolean} counter - Set to true to walk the placements counterclockwise
 * @returns {Array} placements including their variations
 */
function clockwise(placement) {
  var counter = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

  var index = validPlacements.indexOf(placement);
  var arr = validPlacements.slice(index + 1).concat(validPlacements.slice(0, index));
  return counter ? arr.reverse() : arr;
}

var BEHAVIORS = {
  FLIP: 'flip',
  CLOCKWISE: 'clockwise',
  COUNTERCLOCKWISE: 'counterclockwise'
};

/**
 * @function
 * @memberof Modifiers
 * @argument {Object} data - The data object generated by update method
 * @argument {Object} options - Modifiers configuration and options
 * @returns {Object} The data object, properly modified
 */
function flip(data, options) {
  // if `inner` modifier is enabled, we can't use the `flip` modifier
  if (isModifierEnabled(data.instance.modifiers, 'inner')) {
    return data;
  }

  if (data.flipped && data.placement === data.originalPlacement) {
    // seems like flip is trying to loop, probably there's not enough space on any of the flippable sides
    return data;
  }

  var boundaries = getBoundaries(data.instance.popper, data.instance.reference, options.padding, options.boundariesElement, data.positionFixed);

  var placement = data.placement.split('-')[0];
  var placementOpposite = getOppositePlacement(placement);
  var variation = data.placement.split('-')[1] || '';

  var flipOrder = [];

  switch (options.behavior) {
    case BEHAVIORS.FLIP:
      flipOrder = [placement, placementOpposite];
      break;
    case BEHAVIORS.CLOCKWISE:
      flipOrder = clockwise(placement);
      break;
    case BEHAVIORS.COUNTERCLOCKWISE:
      flipOrder = clockwise(placement, true);
      break;
    default:
      flipOrder = options.behavior;
  }

  flipOrder.forEach(function (step, index) {
    if (placement !== step || flipOrder.length === index + 1) {
      return data;
    }

    placement = data.placement.split('-')[0];
    placementOpposite = getOppositePlacement(placement);

    var popperOffsets = data.offsets.popper;
    var refOffsets = data.offsets.reference;

    // using floor because the reference offsets may contain decimals we are not going to consider here
    var floor = Math.floor;
    var overlapsRef = placement === 'left' && floor(popperOffsets.right) > floor(refOffsets.left) || placement === 'right' && floor(popperOffsets.left) < floor(refOffsets.right) || placement === 'top' && floor(popperOffsets.bottom) > floor(refOffsets.top) || placement === 'bottom' && floor(popperOffsets.top) < floor(refOffsets.bottom);

    var overflowsLeft = floor(popperOffsets.left) < floor(boundaries.left);
    var overflowsRight = floor(popperOffsets.right) > floor(boundaries.right);
    var overflowsTop = floor(popperOffsets.top) < floor(boundaries.top);
    var overflowsBottom = floor(popperOffsets.bottom) > floor(boundaries.bottom);

    var overflowsBoundaries = placement === 'left' && overflowsLeft || placement === 'right' && overflowsRight || placement === 'top' && overflowsTop || placement === 'bottom' && overflowsBottom;

    // flip the variation if required
    var isVertical = ['top', 'bottom'].indexOf(placement) !== -1;
    var flippedVariation = !!options.flipVariations && (isVertical && variation === 'start' && overflowsLeft || isVertical && variation === 'end' && overflowsRight || !isVertical && variation === 'start' && overflowsTop || !isVertical && variation === 'end' && overflowsBottom);

    if (overlapsRef || overflowsBoundaries || flippedVariation) {
      // this boolean to detect any flip loop
      data.flipped = true;

      if (overlapsRef || overflowsBoundaries) {
        placement = flipOrder[index + 1];
      }

      if (flippedVariation) {
        variation = getOppositeVariation(variation);
      }

      data.placement = placement + (variation ? '-' + variation : '');

      // this object contains `position`, we want to preserve it along with
      // any additional property we may add in the future
      data.offsets.popper = _extends({}, data.offsets.popper, getPopperOffsets(data.instance.popper, data.offsets.reference, data.placement));

      data = runModifiers(data.instance.modifiers, data, 'flip');
    }
  });
  return data;
}

/**
 * @function
 * @memberof Modifiers
 * @argument {Object} data - The data object generated by update method
 * @argument {Object} options - Modifiers configuration and options
 * @returns {Object} The data object, properly modified
 */
function keepTogether(data) {
  var _data$offsets = data.offsets,
      popper = _data$offsets.popper,
      reference = _data$offsets.reference;

  var placement = data.placement.split('-')[0];
  var floor = Math.floor;
  var isVertical = ['top', 'bottom'].indexOf(placement) !== -1;
  var side = isVertical ? 'right' : 'bottom';
  var opSide = isVertical ? 'left' : 'top';
  var measurement = isVertical ? 'width' : 'height';

  if (popper[side] < floor(reference[opSide])) {
    data.offsets.popper[opSide] = floor(reference[opSide]) - popper[measurement];
  }
  if (popper[opSide] > floor(reference[side])) {
    data.offsets.popper[opSide] = floor(reference[side]);
  }

  return data;
}

/**
 * Converts a string containing value + unit into a px value number
 * @function
 * @memberof {modifiers~offset}
 * @private
 * @argument {String} str - Value + unit string
 * @argument {String} measurement - `height` or `width`
 * @argument {Object} popperOffsets
 * @argument {Object} referenceOffsets
 * @returns {Number|String}
 * Value in pixels, or original string if no values were extracted
 */
function toValue(str, measurement, popperOffsets, referenceOffsets) {
  // separate value from unit
  var split = str.match(/((?:\-|\+)?\d*\.?\d*)(.*)/);
  var value = +split[1];
  var unit = split[2];

  // If it's not a number it's an operator, I guess
  if (!value) {
    return str;
  }

  if (unit.indexOf('%') === 0) {
    var element = void 0;
    switch (unit) {
      case '%p':
        element = popperOffsets;
        break;
      case '%':
      case '%r':
      default:
        element = referenceOffsets;
    }

    var rect = getClientRect(element);
    return rect[measurement] / 100 * value;
  } else if (unit === 'vh' || unit === 'vw') {
    // if is a vh or vw, we calculate the size based on the viewport
    var size = void 0;
    if (unit === 'vh') {
      size = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    } else {
      size = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    }
    return size / 100 * value;
  } else {
    // if is an explicit pixel unit, we get rid of the unit and keep the value
    // if is an implicit unit, it's px, and we return just the value
    return value;
  }
}

/**
 * Parse an `offset` string to extrapolate `x` and `y` numeric offsets.
 * @function
 * @memberof {modifiers~offset}
 * @private
 * @argument {String} offset
 * @argument {Object} popperOffsets
 * @argument {Object} referenceOffsets
 * @argument {String} basePlacement
 * @returns {Array} a two cells array with x and y offsets in numbers
 */
function parseOffset(offset, popperOffsets, referenceOffsets, basePlacement) {
  var offsets = [0, 0];

  // Use height if placement is left or right and index is 0 otherwise use width
  // in this way the first offset will use an axis and the second one
  // will use the other one
  var useHeight = ['right', 'left'].indexOf(basePlacement) !== -1;

  // Split the offset string to obtain a list of values and operands
  // The regex addresses values with the plus or minus sign in front (+10, -20, etc)
  var fragments = offset.split(/(\+|\-)/).map(function (frag) {
    return frag.trim();
  });

  // Detect if the offset string contains a pair of values or a single one
  // they could be separated by comma or space
  var divider = fragments.indexOf(find(fragments, function (frag) {
    return frag.search(/,|\s/) !== -1;
  }));

  if (fragments[divider] && fragments[divider].indexOf(',') === -1) {
    console.warn('Offsets separated by white space(s) are deprecated, use a comma (,) instead.');
  }

  // If divider is found, we divide the list of values and operands to divide
  // them by ofset X and Y.
  var splitRegex = /\s*,\s*|\s+/;
  var ops = divider !== -1 ? [fragments.slice(0, divider).concat([fragments[divider].split(splitRegex)[0]]), [fragments[divider].split(splitRegex)[1]].concat(fragments.slice(divider + 1))] : [fragments];

  // Convert the values with units to absolute pixels to allow our computations
  ops = ops.map(function (op, index) {
    // Most of the units rely on the orientation of the popper
    var measurement = (index === 1 ? !useHeight : useHeight) ? 'height' : 'width';
    var mergeWithPrevious = false;
    return op
    // This aggregates any `+` or `-` sign that aren't considered operators
    // e.g.: 10 + +5 => [10, +, +5]
    .reduce(function (a, b) {
      if (a[a.length - 1] === '' && ['+', '-'].indexOf(b) !== -1) {
        a[a.length - 1] = b;
        mergeWithPrevious = true;
        return a;
      } else if (mergeWithPrevious) {
        a[a.length - 1] += b;
        mergeWithPrevious = false;
        return a;
      } else {
        return a.concat(b);
      }
    }, [])
    // Here we convert the string values into number values (in px)
    .map(function (str) {
      return toValue(str, measurement, popperOffsets, referenceOffsets);
    });
  });

  // Loop trough the offsets arrays and execute the operations
  ops.forEach(function (op, index) {
    op.forEach(function (frag, index2) {
      if (isNumeric(frag)) {
        offsets[index] += frag * (op[index2 - 1] === '-' ? -1 : 1);
      }
    });
  });
  return offsets;
}

/**
 * @function
 * @memberof Modifiers
 * @argument {Object} data - The data object generated by update method
 * @argument {Object} options - Modifiers configuration and options
 * @argument {Number|String} options.offset=0
 * The offset value as described in the modifier description
 * @returns {Object} The data object, properly modified
 */
function offset(data, _ref) {
  var offset = _ref.offset;
  var placement = data.placement,
      _data$offsets = data.offsets,
      popper = _data$offsets.popper,
      reference = _data$offsets.reference;

  var basePlacement = placement.split('-')[0];

  var offsets = void 0;
  if (isNumeric(+offset)) {
    offsets = [+offset, 0];
  } else {
    offsets = parseOffset(offset, popper, reference, basePlacement);
  }

  if (basePlacement === 'left') {
    popper.top += offsets[0];
    popper.left -= offsets[1];
  } else if (basePlacement === 'right') {
    popper.top += offsets[0];
    popper.left += offsets[1];
  } else if (basePlacement === 'top') {
    popper.left += offsets[0];
    popper.top -= offsets[1];
  } else if (basePlacement === 'bottom') {
    popper.left += offsets[0];
    popper.top += offsets[1];
  }

  data.popper = popper;
  return data;
}

/**
 * @function
 * @memberof Modifiers
 * @argument {Object} data - The data object generated by `update` method
 * @argument {Object} options - Modifiers configuration and options
 * @returns {Object} The data object, properly modified
 */
function preventOverflow(data, options) {
  var boundariesElement = options.boundariesElement || getOffsetParent(data.instance.popper);

  // If offsetParent is the reference element, we really want to
  // go one step up and use the next offsetParent as reference to
  // avoid to make this modifier completely useless and look like broken
  if (data.instance.reference === boundariesElement) {
    boundariesElement = getOffsetParent(boundariesElement);
  }

  var boundaries = getBoundaries(data.instance.popper, data.instance.reference, options.padding, boundariesElement, data.positionFixed);
  options.boundaries = boundaries;

  var order = options.priority;
  var popper = data.offsets.popper;

  var check = {
    primary: function primary(placement) {
      var value = popper[placement];
      if (popper[placement] < boundaries[placement] && !options.escapeWithReference) {
        value = Math.max(popper[placement], boundaries[placement]);
      }
      return defineProperty({}, placement, value);
    },
    secondary: function secondary(placement) {
      var mainSide = placement === 'right' ? 'left' : 'top';
      var value = popper[mainSide];
      if (popper[placement] > boundaries[placement] && !options.escapeWithReference) {
        value = Math.min(popper[mainSide], boundaries[placement] - (placement === 'right' ? popper.width : popper.height));
      }
      return defineProperty({}, mainSide, value);
    }
  };

  order.forEach(function (placement) {
    var side = ['left', 'top'].indexOf(placement) !== -1 ? 'primary' : 'secondary';
    popper = _extends({}, popper, check[side](placement));
  });

  data.offsets.popper = popper;

  return data;
}

/**
 * @function
 * @memberof Modifiers
 * @argument {Object} data - The data object generated by `update` method
 * @argument {Object} options - Modifiers configuration and options
 * @returns {Object} The data object, properly modified
 */
function shift(data) {
  var placement = data.placement;
  var basePlacement = placement.split('-')[0];
  var shiftvariation = placement.split('-')[1];

  // if shift shiftvariation is specified, run the modifier
  if (shiftvariation) {
    var _data$offsets = data.offsets,
        reference = _data$offsets.reference,
        popper = _data$offsets.popper;

    var isVertical = ['bottom', 'top'].indexOf(basePlacement) !== -1;
    var side = isVertical ? 'left' : 'top';
    var measurement = isVertical ? 'width' : 'height';

    var shiftOffsets = {
      start: defineProperty({}, side, reference[side]),
      end: defineProperty({}, side, reference[side] + reference[measurement] - popper[measurement])
    };

    data.offsets.popper = _extends({}, popper, shiftOffsets[shiftvariation]);
  }

  return data;
}

/**
 * @function
 * @memberof Modifiers
 * @argument {Object} data - The data object generated by update method
 * @argument {Object} options - Modifiers configuration and options
 * @returns {Object} The data object, properly modified
 */
function hide(data) {
  if (!isModifierRequired(data.instance.modifiers, 'hide', 'preventOverflow')) {
    return data;
  }

  var refRect = data.offsets.reference;
  var bound = find(data.instance.modifiers, function (modifier) {
    return modifier.name === 'preventOverflow';
  }).boundaries;

  if (refRect.bottom < bound.top || refRect.left > bound.right || refRect.top > bound.bottom || refRect.right < bound.left) {
    // Avoid unnecessary DOM access if visibility hasn't changed
    if (data.hide === true) {
      return data;
    }

    data.hide = true;
    data.attributes['x-out-of-boundaries'] = '';
  } else {
    // Avoid unnecessary DOM access if visibility hasn't changed
    if (data.hide === false) {
      return data;
    }

    data.hide = false;
    data.attributes['x-out-of-boundaries'] = false;
  }

  return data;
}

/**
 * @function
 * @memberof Modifiers
 * @argument {Object} data - The data object generated by `update` method
 * @argument {Object} options - Modifiers configuration and options
 * @returns {Object} The data object, properly modified
 */
function inner(data) {
  var placement = data.placement;
  var basePlacement = placement.split('-')[0];
  var _data$offsets = data.offsets,
      popper = _data$offsets.popper,
      reference = _data$offsets.reference;

  var isHoriz = ['left', 'right'].indexOf(basePlacement) !== -1;

  var subtractLength = ['top', 'left'].indexOf(basePlacement) === -1;

  popper[isHoriz ? 'left' : 'top'] = reference[basePlacement] - (subtractLength ? popper[isHoriz ? 'width' : 'height'] : 0);

  data.placement = getOppositePlacement(placement);
  data.offsets.popper = getClientRect(popper);

  return data;
}

/**
 * Modifier function, each modifier can have a function of this type assigned
 * to its `fn` property.<br />
 * These functions will be called on each update, this means that you must
 * make sure they are performant enough to avoid performance bottlenecks.
 *
 * @function ModifierFn
 * @argument {dataObject} data - The data object generated by `update` method
 * @argument {Object} options - Modifiers configuration and options
 * @returns {dataObject} The data object, properly modified
 */

/**
 * Modifiers are plugins used to alter the behavior of your poppers.<br />
 * Popper.js uses a set of 9 modifiers to provide all the basic functionalities
 * needed by the library.
 *
 * Usually you don't want to override the `order`, `fn` and `onLoad` props.
 * All the other properties are configurations that could be tweaked.
 * @namespace modifiers
 */
var modifiers = {
  /**
   * Modifier used to shift the popper on the start or end of its reference
   * element.<br />
   * It will read the variation of the `placement` property.<br />
   * It can be one either `-end` or `-start`.
   * @memberof modifiers
   * @inner
   */
  shift: {
    /** @prop {number} order=100 - Index used to define the order of execution */
    order: 100,
    /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
    enabled: true,
    /** @prop {ModifierFn} */
    fn: shift
  },

  /**
   * The `offset` modifier can shift your popper on both its axis.
   *
   * It accepts the following units:
   * - `px` or unitless, interpreted as pixels
   * - `%` or `%r`, percentage relative to the length of the reference element
   * - `%p`, percentage relative to the length of the popper element
   * - `vw`, CSS viewport width unit
   * - `vh`, CSS viewport height unit
   *
   * For length is intended the main axis relative to the placement of the popper.<br />
   * This means that if the placement is `top` or `bottom`, the length will be the
   * `width`. In case of `left` or `right`, it will be the height.
   *
   * You can provide a single value (as `Number` or `String`), or a pair of values
   * as `String` divided by a comma or one (or more) white spaces.<br />
   * The latter is a deprecated method because it leads to confusion and will be
   * removed in v2.<br />
   * Additionally, it accepts additions and subtractions between different units.
   * Note that multiplications and divisions aren't supported.
   *
   * Valid examples are:
   * ```
   * 10
   * '10%'
   * '10, 10'
   * '10%, 10'
   * '10 + 10%'
   * '10 - 5vh + 3%'
   * '-10px + 5vh, 5px - 6%'
   * ```
   * > **NB**: If you desire to apply offsets to your poppers in a way that may make them overlap
   * > with their reference element, unfortunately, you will have to disable the `flip` modifier.
   * > More on this [reading this issue](https://github.com/FezVrasta/popper.js/issues/373)
   *
   * @memberof modifiers
   * @inner
   */
  offset: {
    /** @prop {number} order=200 - Index used to define the order of execution */
    order: 200,
    /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
    enabled: true,
    /** @prop {ModifierFn} */
    fn: offset,
    /** @prop {Number|String} offset=0
     * The offset value as described in the modifier description
     */
    offset: 0
  },

  /**
   * Modifier used to prevent the popper from being positioned outside the boundary.
   *
   * An scenario exists where the reference itself is not within the boundaries.<br />
   * We can say it has "escaped the boundaries" — or just "escaped".<br />
   * In this case we need to decide whether the popper should either:
   *
   * - detach from the reference and remain "trapped" in the boundaries, or
   * - if it should ignore the boundary and "escape with its reference"
   *
   * When `escapeWithReference` is set to`true` and reference is completely
   * outside its boundaries, the popper will overflow (or completely leave)
   * the boundaries in order to remain attached to the edge of the reference.
   *
   * @memberof modifiers
   * @inner
   */
  preventOverflow: {
    /** @prop {number} order=300 - Index used to define the order of execution */
    order: 300,
    /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
    enabled: true,
    /** @prop {ModifierFn} */
    fn: preventOverflow,
    /**
     * @prop {Array} [priority=['left','right','top','bottom']]
     * Popper will try to prevent overflow following these priorities by default,
     * then, it could overflow on the left and on top of the `boundariesElement`
     */
    priority: ['left', 'right', 'top', 'bottom'],
    /**
     * @prop {number} padding=5
     * Amount of pixel used to define a minimum distance between the boundaries
     * and the popper this makes sure the popper has always a little padding
     * between the edges of its container
     */
    padding: 5,
    /**
     * @prop {String|HTMLElement} boundariesElement='scrollParent'
     * Boundaries used by the modifier, can be `scrollParent`, `window`,
     * `viewport` or any DOM element.
     */
    boundariesElement: 'scrollParent'
  },

  /**
   * Modifier used to make sure the reference and its popper stay near eachothers
   * without leaving any gap between the two. Expecially useful when the arrow is
   * enabled and you want to assure it to point to its reference element.
   * It cares only about the first axis, you can still have poppers with margin
   * between the popper and its reference element.
   * @memberof modifiers
   * @inner
   */
  keepTogether: {
    /** @prop {number} order=400 - Index used to define the order of execution */
    order: 400,
    /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
    enabled: true,
    /** @prop {ModifierFn} */
    fn: keepTogether
  },

  /**
   * This modifier is used to move the `arrowElement` of the popper to make
   * sure it is positioned between the reference element and its popper element.
   * It will read the outer size of the `arrowElement` node to detect how many
   * pixels of conjuction are needed.
   *
   * It has no effect if no `arrowElement` is provided.
   * @memberof modifiers
   * @inner
   */
  arrow: {
    /** @prop {number} order=500 - Index used to define the order of execution */
    order: 500,
    /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
    enabled: true,
    /** @prop {ModifierFn} */
    fn: arrow,
    /** @prop {String|HTMLElement} element='[x-arrow]' - Selector or node used as arrow */
    element: '[x-arrow]'
  },

  /**
   * Modifier used to flip the popper's placement when it starts to overlap its
   * reference element.
   *
   * Requires the `preventOverflow` modifier before it in order to work.
   *
   * **NOTE:** this modifier will interrupt the current update cycle and will
   * restart it if it detects the need to flip the placement.
   * @memberof modifiers
   * @inner
   */
  flip: {
    /** @prop {number} order=600 - Index used to define the order of execution */
    order: 600,
    /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
    enabled: true,
    /** @prop {ModifierFn} */
    fn: flip,
    /**
     * @prop {String|Array} behavior='flip'
     * The behavior used to change the popper's placement. It can be one of
     * `flip`, `clockwise`, `counterclockwise` or an array with a list of valid
     * placements (with optional variations).
     */
    behavior: 'flip',
    /**
     * @prop {number} padding=5
     * The popper will flip if it hits the edges of the `boundariesElement`
     */
    padding: 5,
    /**
     * @prop {String|HTMLElement} boundariesElement='viewport'
     * The element which will define the boundaries of the popper position,
     * the popper will never be placed outside of the defined boundaries
     * (except if keepTogether is enabled)
     */
    boundariesElement: 'viewport'
  },

  /**
   * Modifier used to make the popper flow toward the inner of the reference element.
   * By default, when this modifier is disabled, the popper will be placed outside
   * the reference element.
   * @memberof modifiers
   * @inner
   */
  inner: {
    /** @prop {number} order=700 - Index used to define the order of execution */
    order: 700,
    /** @prop {Boolean} enabled=false - Whether the modifier is enabled or not */
    enabled: false,
    /** @prop {ModifierFn} */
    fn: inner
  },

  /**
   * Modifier used to hide the popper when its reference element is outside of the
   * popper boundaries. It will set a `x-out-of-boundaries` attribute which can
   * be used to hide with a CSS selector the popper when its reference is
   * out of boundaries.
   *
   * Requires the `preventOverflow` modifier before it in order to work.
   * @memberof modifiers
   * @inner
   */
  hide: {
    /** @prop {number} order=800 - Index used to define the order of execution */
    order: 800,
    /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
    enabled: true,
    /** @prop {ModifierFn} */
    fn: hide
  },

  /**
   * Computes the style that will be applied to the popper element to gets
   * properly positioned.
   *
   * Note that this modifier will not touch the DOM, it just prepares the styles
   * so that `applyStyle` modifier can apply it. This separation is useful
   * in case you need to replace `applyStyle` with a custom implementation.
   *
   * This modifier has `850` as `order` value to maintain backward compatibility
   * with previous versions of Popper.js. Expect the modifiers ordering method
   * to change in future major versions of the library.
   *
   * @memberof modifiers
   * @inner
   */
  computeStyle: {
    /** @prop {number} order=850 - Index used to define the order of execution */
    order: 850,
    /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
    enabled: true,
    /** @prop {ModifierFn} */
    fn: computeStyle,
    /**
     * @prop {Boolean} gpuAcceleration=true
     * If true, it uses the CSS 3d transformation to position the popper.
     * Otherwise, it will use the `top` and `left` properties.
     */
    gpuAcceleration: true,
    /**
     * @prop {string} [x='bottom']
     * Where to anchor the X axis (`bottom` or `top`). AKA X offset origin.
     * Change this if your popper should grow in a direction different from `bottom`
     */
    x: 'bottom',
    /**
     * @prop {string} [x='left']
     * Where to anchor the Y axis (`left` or `right`). AKA Y offset origin.
     * Change this if your popper should grow in a direction different from `right`
     */
    y: 'right'
  },

  /**
   * Applies the computed styles to the popper element.
   *
   * All the DOM manipulations are limited to this modifier. This is useful in case
   * you want to integrate Popper.js inside a framework or view library and you
   * want to delegate all the DOM manipulations to it.
   *
   * Note that if you disable this modifier, you must make sure the popper element
   * has its position set to `absolute` before Popper.js can do its work!
   *
   * Just disable this modifier and define you own to achieve the desired effect.
   *
   * @memberof modifiers
   * @inner
   */
  applyStyle: {
    /** @prop {number} order=900 - Index used to define the order of execution */
    order: 900,
    /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
    enabled: true,
    /** @prop {ModifierFn} */
    fn: applyStyle,
    /** @prop {Function} */
    onLoad: applyStyleOnLoad,
    /**
     * @deprecated since version 1.10.0, the property moved to `computeStyle` modifier
     * @prop {Boolean} gpuAcceleration=true
     * If true, it uses the CSS 3d transformation to position the popper.
     * Otherwise, it will use the `top` and `left` properties.
     */
    gpuAcceleration: undefined
  }
};

/**
 * The `dataObject` is an object containing all the informations used by Popper.js
 * this object get passed to modifiers and to the `onCreate` and `onUpdate` callbacks.
 * @name dataObject
 * @property {Object} data.instance The Popper.js instance
 * @property {String} data.placement Placement applied to popper
 * @property {String} data.originalPlacement Placement originally defined on init
 * @property {Boolean} data.flipped True if popper has been flipped by flip modifier
 * @property {Boolean} data.hide True if the reference element is out of boundaries, useful to know when to hide the popper.
 * @property {HTMLElement} data.arrowElement Node used as arrow by arrow modifier
 * @property {Object} data.styles Any CSS property defined here will be applied to the popper, it expects the JavaScript nomenclature (eg. `marginBottom`)
 * @property {Object} data.arrowStyles Any CSS property defined here will be applied to the popper arrow, it expects the JavaScript nomenclature (eg. `marginBottom`)
 * @property {Object} data.boundaries Offsets of the popper boundaries
 * @property {Object} data.offsets The measurements of popper, reference and arrow elements.
 * @property {Object} data.offsets.popper `top`, `left`, `width`, `height` values
 * @property {Object} data.offsets.reference `top`, `left`, `width`, `height` values
 * @property {Object} data.offsets.arrow] `top` and `left` offsets, only one of them will be different from 0
 */

/**
 * Default options provided to Popper.js constructor.<br />
 * These can be overriden using the `options` argument of Popper.js.<br />
 * To override an option, simply pass as 3rd argument an object with the same
 * structure of this object, example:
 * ```
 * new Popper(ref, pop, {
 *   modifiers: {
 *     preventOverflow: { enabled: false }
 *   }
 * })
 * ```
 * @type {Object}
 * @static
 * @memberof Popper
 */
var Defaults = {
  /**
   * Popper's placement
   * @prop {Popper.placements} placement='bottom'
   */
  placement: 'bottom',

  /**
   * Set this to true if you want popper to position it self in 'fixed' mode
   * @prop {Boolean} positionFixed=false
   */
  positionFixed: false,

  /**
   * Whether events (resize, scroll) are initially enabled
   * @prop {Boolean} eventsEnabled=true
   */
  eventsEnabled: true,

  /**
   * Set to true if you want to automatically remove the popper when
   * you call the `destroy` method.
   * @prop {Boolean} removeOnDestroy=false
   */
  removeOnDestroy: false,

  /**
   * Callback called when the popper is created.<br />
   * By default, is set to no-op.<br />
   * Access Popper.js instance with `data.instance`.
   * @prop {onCreate}
   */
  onCreate: function onCreate() {},

  /**
   * Callback called when the popper is updated, this callback is not called
   * on the initialization/creation of the popper, but only on subsequent
   * updates.<br />
   * By default, is set to no-op.<br />
   * Access Popper.js instance with `data.instance`.
   * @prop {onUpdate}
   */
  onUpdate: function onUpdate() {},

  /**
   * List of modifiers used to modify the offsets before they are applied to the popper.
   * They provide most of the functionalities of Popper.js
   * @prop {modifiers}
   */
  modifiers: modifiers
};

/**
 * @callback onCreate
 * @param {dataObject} data
 */

/**
 * @callback onUpdate
 * @param {dataObject} data
 */

// Utils
// Methods
var Popper = function () {
  /**
   * Create a new Popper.js instance
   * @class Popper
   * @param {HTMLElement|referenceObject} reference - The reference element used to position the popper
   * @param {HTMLElement} popper - The HTML element used as popper.
   * @param {Object} options - Your custom options to override the ones defined in [Defaults](#defaults)
   * @return {Object} instance - The generated Popper.js instance
   */
  function Popper(reference, popper) {
    var _this = this;

    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    classCallCheck(this, Popper);

    this.scheduleUpdate = function () {
      return requestAnimationFrame(_this.update);
    };

    // make update() debounced, so that it only runs at most once-per-tick
    this.update = debounce(this.update.bind(this));

    // with {} we create a new object with the options inside it
    this.options = _extends({}, Popper.Defaults, options);

    // init state
    this.state = {
      isDestroyed: false,
      isCreated: false,
      scrollParents: []
    };

    // get reference and popper elements (allow jQuery wrappers)
    this.reference = reference && reference.jquery ? reference[0] : reference;
    this.popper = popper && popper.jquery ? popper[0] : popper;

    // Deep merge modifiers options
    this.options.modifiers = {};
    Object.keys(_extends({}, Popper.Defaults.modifiers, options.modifiers)).forEach(function (name) {
      _this.options.modifiers[name] = _extends({}, Popper.Defaults.modifiers[name] || {}, options.modifiers ? options.modifiers[name] : {});
    });

    // Refactoring modifiers' list (Object => Array)
    this.modifiers = Object.keys(this.options.modifiers).map(function (name) {
      return _extends({
        name: name
      }, _this.options.modifiers[name]);
    })
    // sort the modifiers by order
    .sort(function (a, b) {
      return a.order - b.order;
    });

    // modifiers have the ability to execute arbitrary code when Popper.js get inited
    // such code is executed in the same order of its modifier
    // they could add new properties to their options configuration
    // BE AWARE: don't add options to `options.modifiers.name` but to `modifierOptions`!
    this.modifiers.forEach(function (modifierOptions) {
      if (modifierOptions.enabled && isFunction(modifierOptions.onLoad)) {
        modifierOptions.onLoad(_this.reference, _this.popper, _this.options, modifierOptions, _this.state);
      }
    });

    // fire the first update to position the popper in the right place
    this.update();

    var eventsEnabled = this.options.eventsEnabled;
    if (eventsEnabled) {
      // setup event listeners, they will take care of update the position in specific situations
      this.enableEventListeners();
    }

    this.state.eventsEnabled = eventsEnabled;
  }

  // We can't use class properties because they don't get listed in the
  // class prototype and break stuff like Sinon stubs


  createClass(Popper, [{
    key: 'update',
    value: function update$$1() {
      return update.call(this);
    }
  }, {
    key: 'destroy',
    value: function destroy$$1() {
      return destroy.call(this);
    }
  }, {
    key: 'enableEventListeners',
    value: function enableEventListeners$$1() {
      return enableEventListeners.call(this);
    }
  }, {
    key: 'disableEventListeners',
    value: function disableEventListeners$$1() {
      return disableEventListeners.call(this);
    }

    /**
     * Schedule an update, it will run on the next UI update available
     * @method scheduleUpdate
     * @memberof Popper
     */


    /**
     * Collection of utilities useful when writing custom modifiers.
     * Starting from version 1.7, this method is available only if you
     * include `popper-utils.js` before `popper.js`.
     *
     * **DEPRECATION**: This way to access PopperUtils is deprecated
     * and will be removed in v2! Use the PopperUtils module directly instead.
     * Due to the high instability of the methods contained in Utils, we can't
     * guarantee them to follow semver. Use them at your own risk!
     * @static
     * @private
     * @type {Object}
     * @deprecated since version 1.8
     * @member Utils
     * @memberof Popper
     */

  }]);
  return Popper;
}();

/**
 * The `referenceObject` is an object that provides an interface compatible with Popper.js
 * and lets you use it as replacement of a real DOM node.<br />
 * You can use this method to position a popper relatively to a set of coordinates
 * in case you don't have a DOM node to use as reference.
 *
 * ```
 * new Popper(referenceObject, popperNode);
 * ```
 *
 * NB: This feature isn't supported in Internet Explorer 10
 * @name referenceObject
 * @property {Function} data.getBoundingClientRect
 * A function that returns a set of coordinates compatible with the native `getBoundingClientRect` method.
 * @property {number} data.clientWidth
 * An ES6 getter that will return the width of the virtual reference element.
 * @property {number} data.clientHeight
 * An ES6 getter that will return the height of the virtual reference element.
 */


Popper.Utils = (typeof window !== 'undefined' ? window : global).PopperUtils;
Popper.placements = placements;
Popper.Defaults = Defaults;

/* harmony default export */ __webpack_exports__["a"] = (Popper);
//# sourceMappingURL=popper.js.map

/* WEBPACK VAR INJECTION */}.call(__webpack_exports__, __webpack_require__(321)))

/***/ }),

/***/ 542:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_react__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_prop_types__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_prop_types___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_prop_types__);
var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }




var Arrow = function Arrow(props, context) {
  var _props$component = props.component,
      component = _props$component === undefined ? 'span' : _props$component,
      innerRef = props.innerRef,
      children = props.children,
      restProps = _objectWithoutProperties(props, ['component', 'innerRef', 'children']);

  var popper = context.popper;

  var arrowRef = function arrowRef(node) {
    popper.setArrowNode(node);
    if (typeof innerRef === 'function') {
      innerRef(node);
    }
  };
  var arrowStyle = popper.getArrowStyle();

  if (typeof children === 'function') {
    var arrowProps = {
      ref: arrowRef,
      style: arrowStyle
    };
    return children({ arrowProps: arrowProps, restProps: restProps });
  }

  var componentProps = _extends({}, restProps, {
    style: _extends({}, arrowStyle, restProps.style)
  });

  if (typeof component === 'string') {
    componentProps.ref = arrowRef;
  } else {
    componentProps.innerRef = arrowRef;
  }

  return Object(__WEBPACK_IMPORTED_MODULE_0_react__["createElement"])(component, componentProps, children);
};

Arrow.contextTypes = {
  popper: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.object.isRequired
};

Arrow.propTypes = {
  component: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.oneOfType([__WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.node, __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.func]),
  innerRef: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.func,
  children: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.oneOfType([__WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.node, __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.func])
};

/* unused harmony default export */ var _unused_webpack_default_export = (Arrow);

/***/ }),

/***/ 543:
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(544);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(329)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../css-loader/index.js!./react-datepicker.css", function() {
			var newContent = require("!!../../css-loader/index.js!./react-datepicker.css");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),

/***/ 544:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(328)(false);
// imports


// module
exports.push([module.i, ".react-datepicker-popper[data-placement^=\"bottom\"] .react-datepicker__triangle, .react-datepicker-popper[data-placement^=\"top\"] .react-datepicker__triangle, .react-datepicker__year-read-view--down-arrow,\n.react-datepicker__month-read-view--down-arrow,\n.react-datepicker__month-year-read-view--down-arrow {\n  margin-left: -8px;\n  position: absolute;\n}\n\n.react-datepicker-popper[data-placement^=\"bottom\"] .react-datepicker__triangle, .react-datepicker-popper[data-placement^=\"top\"] .react-datepicker__triangle, .react-datepicker__year-read-view--down-arrow,\n.react-datepicker__month-read-view--down-arrow,\n.react-datepicker__month-year-read-view--down-arrow, .react-datepicker-popper[data-placement^=\"bottom\"] .react-datepicker__triangle::before, .react-datepicker-popper[data-placement^=\"top\"] .react-datepicker__triangle::before, .react-datepicker__year-read-view--down-arrow::before,\n.react-datepicker__month-read-view--down-arrow::before,\n.react-datepicker__month-year-read-view--down-arrow::before {\n  box-sizing: content-box;\n  position: absolute;\n  border: 8px solid transparent;\n  height: 0;\n  width: 1px;\n}\n\n.react-datepicker-popper[data-placement^=\"bottom\"] .react-datepicker__triangle::before, .react-datepicker-popper[data-placement^=\"top\"] .react-datepicker__triangle::before, .react-datepicker__year-read-view--down-arrow::before,\n.react-datepicker__month-read-view--down-arrow::before,\n.react-datepicker__month-year-read-view--down-arrow::before {\n  content: \"\";\n  z-index: -1;\n  border-width: 8px;\n  left: -8px;\n  border-bottom-color: #aeaeae;\n}\n\n.react-datepicker-popper[data-placement^=\"bottom\"] .react-datepicker__triangle {\n  top: 0;\n  margin-top: -8px;\n}\n\n.react-datepicker-popper[data-placement^=\"bottom\"] .react-datepicker__triangle, .react-datepicker-popper[data-placement^=\"bottom\"] .react-datepicker__triangle::before {\n  border-top: none;\n  border-bottom-color: #f0f0f0;\n}\n\n.react-datepicker-popper[data-placement^=\"bottom\"] .react-datepicker__triangle::before {\n  top: -1px;\n  border-bottom-color: #aeaeae;\n}\n\n.react-datepicker-popper[data-placement^=\"top\"] .react-datepicker__triangle, .react-datepicker__year-read-view--down-arrow,\n.react-datepicker__month-read-view--down-arrow,\n.react-datepicker__month-year-read-view--down-arrow {\n  bottom: 0;\n  margin-bottom: -8px;\n}\n\n.react-datepicker-popper[data-placement^=\"top\"] .react-datepicker__triangle, .react-datepicker__year-read-view--down-arrow,\n.react-datepicker__month-read-view--down-arrow,\n.react-datepicker__month-year-read-view--down-arrow, .react-datepicker-popper[data-placement^=\"top\"] .react-datepicker__triangle::before, .react-datepicker__year-read-view--down-arrow::before,\n.react-datepicker__month-read-view--down-arrow::before,\n.react-datepicker__month-year-read-view--down-arrow::before {\n  border-bottom: none;\n  border-top-color: #fff;\n}\n\n.react-datepicker-popper[data-placement^=\"top\"] .react-datepicker__triangle::before, .react-datepicker__year-read-view--down-arrow::before,\n.react-datepicker__month-read-view--down-arrow::before,\n.react-datepicker__month-year-read-view--down-arrow::before {\n  bottom: -1px;\n  border-top-color: #aeaeae;\n}\n\n.react-datepicker-wrapper {\n  display: inline-block;\n}\n\n.react-datepicker {\n  font-family: \"Helvetica Neue\", Helvetica, Arial, sans-serif;\n  font-size: 0.8rem;\n  background-color: #fff;\n  color: #000;\n  border: 1px solid #aeaeae;\n  border-radius: 0.3rem;\n  display: inline-block;\n  position: relative;\n}\n\n.react-datepicker--time-only .react-datepicker__triangle {\n  left: 35px;\n}\n\n.react-datepicker--time-only .react-datepicker__time-container {\n  border-left: 0;\n}\n\n.react-datepicker--time-only .react-datepicker__time {\n  border-radius: 0.3rem;\n}\n\n.react-datepicker--time-only .react-datepicker__time-box {\n  border-radius: 0.3rem;\n}\n\n.react-datepicker__triangle {\n  position: absolute;\n  left: 50px;\n}\n\n.react-datepicker-popper {\n  z-index: 1;\n}\n\n.react-datepicker-popper[data-placement^=\"bottom\"] {\n  margin-top: 10px;\n}\n\n.react-datepicker-popper[data-placement^=\"top\"] {\n  margin-bottom: 10px;\n}\n\n.react-datepicker-popper[data-placement^=\"right\"] {\n  margin-left: 8px;\n}\n\n.react-datepicker-popper[data-placement^=\"right\"] .react-datepicker__triangle {\n  left: auto;\n  right: 42px;\n}\n\n.react-datepicker-popper[data-placement^=\"left\"] {\n  margin-right: 8px;\n}\n\n.react-datepicker-popper[data-placement^=\"left\"] .react-datepicker__triangle {\n  left: 42px;\n  right: auto;\n}\n\n.react-datepicker__header {\n  text-align: center;\n  background-color: #f0f0f0;\n  border-bottom: 1px solid #aeaeae;\n  border-top-left-radius: 0.3rem;\n  border-top-right-radius: 0.3rem;\n  padding-top: 8px;\n  position: relative;\n}\n\n.react-datepicker__header--time {\n  padding-bottom: 8px;\n  padding-left: 5px;\n  padding-right: 5px;\n}\n\n.react-datepicker__year-dropdown-container--select,\n.react-datepicker__month-dropdown-container--select,\n.react-datepicker__month-year-dropdown-container--select,\n.react-datepicker__year-dropdown-container--scroll,\n.react-datepicker__month-dropdown-container--scroll,\n.react-datepicker__month-year-dropdown-container--scroll {\n  display: inline-block;\n  margin: 0 2px;\n}\n\n.react-datepicker__current-month,\n.react-datepicker-time__header {\n  margin-top: 0;\n  color: #000;\n  font-weight: bold;\n  font-size: 0.944rem;\n}\n\n.react-datepicker-time__header {\n  text-overflow: ellipsis;\n  white-space: nowrap;\n  overflow: hidden;\n}\n\n.react-datepicker__navigation {\n  background: none;\n  line-height: 1.7rem;\n  text-align: center;\n  cursor: pointer;\n  position: absolute;\n  top: 10px;\n  width: 0;\n  padding: 0;\n  border: 0.45rem solid transparent;\n  z-index: 1;\n}\n\n.react-datepicker__navigation--previous {\n  left: 10px;\n  border-right-color: #ccc;\n}\n\n.react-datepicker__navigation--previous:hover {\n  border-right-color: #b3b3b3;\n}\n\n.react-datepicker__navigation--previous--disabled, .react-datepicker__navigation--previous--disabled:hover {\n  border-right-color: #e6e6e6;\n  cursor: default;\n}\n\n.react-datepicker__navigation--next {\n  right: 10px;\n  border-left-color: #ccc;\n}\n\n.react-datepicker__navigation--next--with-time:not(.react-datepicker__navigation--next--with-today-button) {\n  right: 80px;\n}\n\n.react-datepicker__navigation--next:hover {\n  border-left-color: #b3b3b3;\n}\n\n.react-datepicker__navigation--next--disabled, .react-datepicker__navigation--next--disabled:hover {\n  border-left-color: #e6e6e6;\n  cursor: default;\n}\n\n.react-datepicker__navigation--years {\n  position: relative;\n  top: 0;\n  display: block;\n  margin-left: auto;\n  margin-right: auto;\n}\n\n.react-datepicker__navigation--years-previous {\n  top: 4px;\n  border-top-color: #ccc;\n}\n\n.react-datepicker__navigation--years-previous:hover {\n  border-top-color: #b3b3b3;\n}\n\n.react-datepicker__navigation--years-upcoming {\n  top: -4px;\n  border-bottom-color: #ccc;\n}\n\n.react-datepicker__navigation--years-upcoming:hover {\n  border-bottom-color: #b3b3b3;\n}\n\n.react-datepicker__month-container {\n  float: left;\n}\n\n.react-datepicker__month {\n  margin: 0.4rem;\n  text-align: center;\n}\n\n.react-datepicker__time-container {\n  float: right;\n  border-left: 1px solid #aeaeae;\n  width: 70px;\n}\n\n.react-datepicker__time-container--with-today-button {\n  display: inline;\n  border: 1px solid #aeaeae;\n  border-radius: 0.3rem;\n  position: absolute;\n  right: -72px;\n  top: 0;\n}\n\n.react-datepicker__time-container .react-datepicker__time {\n  position: relative;\n  background: white;\n}\n\n.react-datepicker__time-container .react-datepicker__time .react-datepicker__time-box {\n  width: 70px;\n  overflow-x: hidden;\n  margin: 0 auto;\n  text-align: center;\n}\n\n.react-datepicker__time-container .react-datepicker__time .react-datepicker__time-box ul.react-datepicker__time-list {\n  list-style: none;\n  margin: 0;\n  height: calc(195px + (1.7rem / 2));\n  overflow-y: scroll;\n  padding-right: 30px;\n  width: 100%;\n  box-sizing: content-box;\n}\n\n.react-datepicker__time-container .react-datepicker__time .react-datepicker__time-box ul.react-datepicker__time-list li.react-datepicker__time-list-item {\n  padding: 5px 10px;\n}\n\n.react-datepicker__time-container .react-datepicker__time .react-datepicker__time-box ul.react-datepicker__time-list li.react-datepicker__time-list-item:hover {\n  cursor: pointer;\n  background-color: #f0f0f0;\n}\n\n.react-datepicker__time-container .react-datepicker__time .react-datepicker__time-box ul.react-datepicker__time-list li.react-datepicker__time-list-item--selected {\n  background-color: #216ba5;\n  color: white;\n  font-weight: bold;\n}\n\n.react-datepicker__time-container .react-datepicker__time .react-datepicker__time-box ul.react-datepicker__time-list li.react-datepicker__time-list-item--selected:hover {\n  background-color: #216ba5;\n}\n\n.react-datepicker__time-container .react-datepicker__time .react-datepicker__time-box ul.react-datepicker__time-list li.react-datepicker__time-list-item--disabled {\n  color: #ccc;\n}\n\n.react-datepicker__time-container .react-datepicker__time .react-datepicker__time-box ul.react-datepicker__time-list li.react-datepicker__time-list-item--disabled:hover {\n  cursor: default;\n  background-color: transparent;\n}\n\n.react-datepicker__week-number {\n  color: #ccc;\n  display: inline-block;\n  width: 1.7rem;\n  line-height: 1.7rem;\n  text-align: center;\n  margin: 0.166rem;\n}\n\n.react-datepicker__week-number.react-datepicker__week-number--clickable {\n  cursor: pointer;\n}\n\n.react-datepicker__week-number.react-datepicker__week-number--clickable:hover {\n  border-radius: 0.3rem;\n  background-color: #f0f0f0;\n}\n\n.react-datepicker__day-names,\n.react-datepicker__week {\n  white-space: nowrap;\n}\n\n.react-datepicker__day-name,\n.react-datepicker__day,\n.react-datepicker__time-name {\n  color: #000;\n  display: inline-block;\n  width: 1.7rem;\n  line-height: 1.7rem;\n  text-align: center;\n  margin: 0.166rem;\n}\n\n.react-datepicker__day {\n  cursor: pointer;\n}\n\n.react-datepicker__day:hover {\n  border-radius: 0.3rem;\n  background-color: #f0f0f0;\n}\n\n.react-datepicker__day--today {\n  font-weight: bold;\n}\n\n.react-datepicker__day--highlighted {\n  border-radius: 0.3rem;\n  background-color: #3dcc4a;\n  color: #fff;\n}\n\n.react-datepicker__day--highlighted:hover {\n  background-color: #32be3f;\n}\n\n.react-datepicker__day--highlighted-custom-1 {\n  color: magenta;\n}\n\n.react-datepicker__day--highlighted-custom-2 {\n  color: green;\n}\n\n.react-datepicker__day--selected, .react-datepicker__day--in-selecting-range, .react-datepicker__day--in-range {\n  border-radius: 0.3rem;\n  background-color: #216ba5;\n  color: #fff;\n}\n\n.react-datepicker__day--selected:hover, .react-datepicker__day--in-selecting-range:hover, .react-datepicker__day--in-range:hover {\n  background-color: #1d5d90;\n}\n\n.react-datepicker__day--keyboard-selected {\n  border-radius: 0.3rem;\n  background-color: #2a87d0;\n  color: #fff;\n}\n\n.react-datepicker__day--keyboard-selected:hover {\n  background-color: #1d5d90;\n}\n\n.react-datepicker__day--in-selecting-range:not(.react-datepicker__day--in-range) {\n  background-color: rgba(33, 107, 165, 0.5);\n}\n\n.react-datepicker__month--selecting-range .react-datepicker__day--in-range:not(.react-datepicker__day--in-selecting-range) {\n  background-color: #f0f0f0;\n  color: #000;\n}\n\n.react-datepicker__day--disabled {\n  cursor: default;\n  color: #ccc;\n}\n\n.react-datepicker__day--disabled:hover {\n  background-color: transparent;\n}\n\n.react-datepicker__input-container {\n  position: relative;\n  display: inline-block;\n}\n\n.react-datepicker__year-read-view,\n.react-datepicker__month-read-view,\n.react-datepicker__month-year-read-view {\n  border: 1px solid transparent;\n  border-radius: 0.3rem;\n}\n\n.react-datepicker__year-read-view:hover,\n.react-datepicker__month-read-view:hover,\n.react-datepicker__month-year-read-view:hover {\n  cursor: pointer;\n}\n\n.react-datepicker__year-read-view:hover .react-datepicker__year-read-view--down-arrow,\n.react-datepicker__year-read-view:hover .react-datepicker__month-read-view--down-arrow,\n.react-datepicker__month-read-view:hover .react-datepicker__year-read-view--down-arrow,\n.react-datepicker__month-read-view:hover .react-datepicker__month-read-view--down-arrow,\n.react-datepicker__month-year-read-view:hover .react-datepicker__year-read-view--down-arrow,\n.react-datepicker__month-year-read-view:hover .react-datepicker__month-read-view--down-arrow {\n  border-top-color: #b3b3b3;\n}\n\n.react-datepicker__year-read-view--down-arrow,\n.react-datepicker__month-read-view--down-arrow,\n.react-datepicker__month-year-read-view--down-arrow {\n  border-top-color: #ccc;\n  float: right;\n  margin-left: 20px;\n  top: 8px;\n  position: relative;\n  border-width: 0.45rem;\n}\n\n.react-datepicker__year-dropdown,\n.react-datepicker__month-dropdown,\n.react-datepicker__month-year-dropdown {\n  background-color: #f0f0f0;\n  position: absolute;\n  width: 50%;\n  left: 25%;\n  top: 30px;\n  z-index: 1;\n  text-align: center;\n  border-radius: 0.3rem;\n  border: 1px solid #aeaeae;\n}\n\n.react-datepicker__year-dropdown:hover,\n.react-datepicker__month-dropdown:hover,\n.react-datepicker__month-year-dropdown:hover {\n  cursor: pointer;\n}\n\n.react-datepicker__year-dropdown--scrollable,\n.react-datepicker__month-dropdown--scrollable,\n.react-datepicker__month-year-dropdown--scrollable {\n  height: 150px;\n  overflow-y: scroll;\n}\n\n.react-datepicker__year-option,\n.react-datepicker__month-option,\n.react-datepicker__month-year-option {\n  line-height: 20px;\n  width: 100%;\n  display: block;\n  margin-left: auto;\n  margin-right: auto;\n}\n\n.react-datepicker__year-option:first-of-type,\n.react-datepicker__month-option:first-of-type,\n.react-datepicker__month-year-option:first-of-type {\n  border-top-left-radius: 0.3rem;\n  border-top-right-radius: 0.3rem;\n}\n\n.react-datepicker__year-option:last-of-type,\n.react-datepicker__month-option:last-of-type,\n.react-datepicker__month-year-option:last-of-type {\n  -webkit-user-select: none;\n  -moz-user-select: none;\n  -ms-user-select: none;\n  user-select: none;\n  border-bottom-left-radius: 0.3rem;\n  border-bottom-right-radius: 0.3rem;\n}\n\n.react-datepicker__year-option:hover,\n.react-datepicker__month-option:hover,\n.react-datepicker__month-year-option:hover {\n  background-color: #ccc;\n}\n\n.react-datepicker__year-option:hover .react-datepicker__navigation--years-upcoming,\n.react-datepicker__month-option:hover .react-datepicker__navigation--years-upcoming,\n.react-datepicker__month-year-option:hover .react-datepicker__navigation--years-upcoming {\n  border-bottom-color: #b3b3b3;\n}\n\n.react-datepicker__year-option:hover .react-datepicker__navigation--years-previous,\n.react-datepicker__month-option:hover .react-datepicker__navigation--years-previous,\n.react-datepicker__month-year-option:hover .react-datepicker__navigation--years-previous {\n  border-top-color: #b3b3b3;\n}\n\n.react-datepicker__year-option--selected,\n.react-datepicker__month-option--selected,\n.react-datepicker__month-year-option--selected {\n  position: absolute;\n  left: 15px;\n}\n\n.react-datepicker__close-icon {\n  background-color: transparent;\n  border: 0;\n  cursor: pointer;\n  display: inline-block;\n  height: 0;\n  outline: 0;\n  padding: 0;\n  vertical-align: middle;\n}\n\n.react-datepicker__close-icon::after {\n  background-color: #216ba5;\n  border-radius: 50%;\n  bottom: 0;\n  box-sizing: border-box;\n  color: #fff;\n  content: \"\\D7\";\n  cursor: pointer;\n  font-size: 12px;\n  height: 16px;\n  width: 16px;\n  line-height: 1;\n  margin: -8px auto 0;\n  padding: 2px;\n  position: absolute;\n  right: 7px;\n  text-align: center;\n  top: 50%;\n}\n\n.react-datepicker__today-button {\n  background: #f0f0f0;\n  border-top: 1px solid #aeaeae;\n  cursor: pointer;\n  text-align: center;\n  font-weight: bold;\n  padding: 5px 0;\n  clear: left;\n}\n\n.react-datepicker__portal {\n  position: fixed;\n  width: 100vw;\n  height: 100vh;\n  background-color: rgba(0, 0, 0, 0.8);\n  left: 0;\n  top: 0;\n  justify-content: center;\n  align-items: center;\n  display: flex;\n  z-index: 2147483647;\n}\n\n.react-datepicker__portal .react-datepicker__day-name,\n.react-datepicker__portal .react-datepicker__day,\n.react-datepicker__portal .react-datepicker__time-name {\n  width: 3rem;\n  line-height: 3rem;\n}\n\n@media (max-width: 400px), (max-height: 550px) {\n  .react-datepicker__portal .react-datepicker__day-name,\n  .react-datepicker__portal .react-datepicker__day,\n  .react-datepicker__portal .react-datepicker__time-name {\n    width: 2rem;\n    line-height: 2rem;\n  }\n}\n\n.react-datepicker__portal .react-datepicker__current-month,\n.react-datepicker__portal .react-datepicker-time__header {\n  font-size: 1.44rem;\n}\n\n.react-datepicker__portal .react-datepicker__navigation {\n  border: 0.81rem solid transparent;\n}\n\n.react-datepicker__portal .react-datepicker__navigation--previous {\n  border-right-color: #ccc;\n}\n\n.react-datepicker__portal .react-datepicker__navigation--previous:hover {\n  border-right-color: #b3b3b3;\n}\n\n.react-datepicker__portal .react-datepicker__navigation--previous--disabled, .react-datepicker__portal .react-datepicker__navigation--previous--disabled:hover {\n  border-right-color: #e6e6e6;\n  cursor: default;\n}\n\n.react-datepicker__portal .react-datepicker__navigation--next {\n  border-left-color: #ccc;\n}\n\n.react-datepicker__portal .react-datepicker__navigation--next:hover {\n  border-left-color: #b3b3b3;\n}\n\n.react-datepicker__portal .react-datepicker__navigation--next--disabled, .react-datepicker__portal .react-datepicker__navigation--next--disabled:hover {\n  border-left-color: #e6e6e6;\n  cursor: default;\n}\n", ""]);

// exports


/***/ }),

/***/ 545:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
var _jsxFileName = '/Users/timteoh/TimCode/pulangmengundi/resources/assets/js/components/OfferCarpoolModal.js';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _reactDom = __webpack_require__(10);

var _reactDom2 = _interopRequireDefault(_reactDom);

var _reactBootstrap = __webpack_require__(13);

var _reactIntl = __webpack_require__(17);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var OfferCarpoolModal = function (_Component) {
  _inherits(OfferCarpoolModal, _Component);

  function OfferCarpoolModal(props) {
    _classCallCheck(this, OfferCarpoolModal);

    return _possibleConstructorReturn(this, (OfferCarpoolModal.__proto__ || Object.getPrototypeOf(OfferCarpoolModal)).call(this, props));
  }

  _createClass(OfferCarpoolModal, [{
    key: 'render',
    value: function render() {
      var _this2 = this;

      return _react2.default.createElement(
        _reactBootstrap.Modal,
        _defineProperty({ show: this.props.show, onHide: this.props.onCancel, __source: {
            fileName: _jsxFileName,
            lineNumber: 14
          },
          __self: this
        }, '__self', this),
        _react2.default.createElement(
          _reactBootstrap.Modal.Header,
          _defineProperty({ closeButton: true, __source: {
              fileName: _jsxFileName,
              lineNumber: 15
            },
            __self: this
          }, '__self', this),
          _react2.default.createElement(
            _reactBootstrap.Modal.Title,
            _defineProperty({
              __source: {
                fileName: _jsxFileName,
                lineNumber: 16
              },
              __self: this
            }, '__self', this),
            _react2.default.createElement(_reactIntl.FormattedMessage, _defineProperty({
              id: 'offer.dialog-header-confirm',
              defaultMessage: 'Confirm carpool offer',
              __source: {
                fileName: _jsxFileName,
                lineNumber: 17
              },
              __self: this
            }, '__self', this))
          )
        ),
        _react2.default.createElement(
          _reactBootstrap.Modal.Body,
          _defineProperty({
            __source: {
              fileName: _jsxFileName,
              lineNumber: 23
            },
            __self: this
          }, '__self', this),
          _react2.default.createElement(
            'h4',
            _defineProperty({
              __source: {
                fileName: _jsxFileName,
                lineNumber: 24
              },
              __self: this
            }, '__self', this),
            _react2.default.createElement(_reactIntl.FormattedMessage, _defineProperty({
              id: 'offer.dialog-header-submit-question',
              defaultMessage: 'Submit carpool offer?',
              __source: {
                fileName: _jsxFileName,
                lineNumber: 25
              },
              __self: this
            }, '__self', this))
          ),
          _react2.default.createElement(
            'p',
            _defineProperty({
              __source: {
                fileName: _jsxFileName,
                lineNumber: 30
              },
              __self: this
            }, '__self', this),
            _react2.default.createElement(_reactIntl.FormattedMessage, _defineProperty({
              id: 'offer.info-warning',
              defaultMessage: 'Your name, location and times will be shown to users who match your district or state.',
              __source: {
                fileName: _jsxFileName,
                lineNumber: 31
              },
              __self: this
            }, '__self', this))
          ),
          _react2.default.createElement(
            _reactBootstrap.Row,
            _defineProperty({
              __source: {
                fileName: _jsxFileName,
                lineNumber: 36
              },
              __self: this
            }, '__self', this),
            Array.isArray(this.props.offers) && this.props.offers.map(function (offer, i) {
              return _react2.default.createElement(
                _reactBootstrap.Col,
                _defineProperty({ md: 6, xs: 6, key: i, __source: {
                    fileName: _jsxFileName,
                    lineNumber: 38
                  },
                  __self: _this2
                }, '__self', _this2),
                _react2.default.createElement(
                  'strong',
                  _defineProperty({
                    __source: {
                      fileName: _jsxFileName,
                      lineNumber: 39
                    },
                    __self: _this2
                  }, '__self', _this2),
                  _react2.default.createElement(_reactIntl.FormattedMessage, _defineProperty({
                    id: 'request.header-i-from',
                    defaultMessage: 'I am currently in',
                    __source: {
                      fileName: _jsxFileName,
                      lineNumber: 40
                    },
                    __self: _this2
                  }, '__self', _this2)),
                  ':'
                ),
                _react2.default.createElement(
                  'p',
                  _defineProperty({
                    __source: {
                      fileName: _jsxFileName,
                      lineNumber: 45
                    },
                    __self: _this2
                  }, '__self', _this2),
                  offer.startLocation.name,
                  ' (',
                  offer.startLocation.state,
                  ')'
                ),
                _react2.default.createElement(
                  'strong',
                  _defineProperty({
                    __source: {
                      fileName: _jsxFileName,
                      lineNumber: 48
                    },
                    __self: _this2
                  }, '__self', _this2),
                  _react2.default.createElement(_reactIntl.FormattedMessage, _defineProperty({
                    id: 'request.header-i-going',
                    defaultMessage: 'I am voting in',
                    __source: {
                      fileName: _jsxFileName,
                      lineNumber: 49
                    },
                    __self: _this2
                  }, '__self', _this2)),
                  ':'
                ),
                _react2.default.createElement(
                  'p',
                  _defineProperty({
                    __source: {
                      fileName: _jsxFileName,
                      lineNumber: 54
                    },
                    __self: _this2
                  }, '__self', _this2),
                  offer.endLocation.name,
                  ' (',
                  offer.endLocation.state,
                  ')'
                ),
                _react2.default.createElement(
                  'strong',
                  _defineProperty({
                    __source: {
                      fileName: _jsxFileName,
                      lineNumber: 57
                    },
                    __self: _this2
                  }, '__self', _this2),
                  _react2.default.createElement(_reactIntl.FormattedMessage, _defineProperty({
                    id: 'offer.dialog-leave-generic',
                    defaultMessage: 'I\'ll leave at',
                    __source: {
                      fileName: _jsxFileName,
                      lineNumber: 58
                    },
                    __self: _this2
                  }, '__self', _this2)),
                  ':'
                ),
                _react2.default.createElement(
                  'p',
                  _defineProperty({
                    __source: {
                      fileName: _jsxFileName,
                      lineNumber: 63
                    },
                    __self: _this2
                  }, '__self', _this2),
                  offer.datetime.format('MMMM Do YYYY, h:mma')
                )
              );
            })
          )
        ),
        _react2.default.createElement(
          _reactBootstrap.Modal.Footer,
          _defineProperty({
            __source: {
              fileName: _jsxFileName,
              lineNumber: 68
            },
            __self: this
          }, '__self', this),
          _react2.default.createElement(
            _reactBootstrap.Button,
            _defineProperty({ onClick: this.props.onOK, bsStyle: 'success', __source: {
                fileName: _jsxFileName,
                lineNumber: 69
              },
              __self: this
            }, '__self', this),
            _react2.default.createElement(_reactIntl.FormattedMessage, _defineProperty({
              id: 'btn-ok',
              defaultMessage: 'OK',
              __source: {
                fileName: _jsxFileName,
                lineNumber: 70
              },
              __self: this
            }, '__self', this))
          ),
          _react2.default.createElement(
            _reactBootstrap.Button,
            _defineProperty({ onClick: this.props.onCancel, __source: {
                fileName: _jsxFileName,
                lineNumber: 75
              },
              __self: this
            }, '__self', this),
            _react2.default.createElement(_reactIntl.FormattedMessage, _defineProperty({
              id: 'btn-cancel',
              defaultMessage: 'Cancel',
              __source: {
                fileName: _jsxFileName,
                lineNumber: 76
              },
              __self: this
            }, '__self', this))
          )
        )
      );
    }
  }]);

  return OfferCarpoolModal;
}(_react.Component);

exports.default = OfferCarpoolModal;

/***/ }),

/***/ 546:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
var _jsxFileName = '/Users/timteoh/TimCode/pulangmengundi/resources/assets/js/components/NeedCarpool.js';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _reactDom = __webpack_require__(10);

var _reactDom2 = _interopRequireDefault(_reactDom);

var _api = __webpack_require__(24);

var _api2 = _interopRequireDefault(_api);

var _reactBootstrap = __webpack_require__(13);

var _DateSelection = __webpack_require__(196);

var _DateSelection2 = _interopRequireDefault(_DateSelection);

var _LocationSelection = __webpack_require__(322);

var _LocationSelection2 = _interopRequireDefault(_LocationSelection);

var _NeedCarpoolConfirmModal = __webpack_require__(547);

var _NeedCarpoolConfirmModal2 = _interopRequireDefault(_NeedCarpoolConfirmModal);

var _reactIntl = __webpack_require__(17);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var NeedCarpool = function (_Component) {
  _inherits(NeedCarpool, _Component);

  function NeedCarpool(props) {
    _classCallCheck(this, NeedCarpool);

    var _this = _possibleConstructorReturn(this, (NeedCarpool.__proto__ || Object.getPrototypeOf(NeedCarpool)).call(this, props));

    _this.state = {
      fromLocation: null,
      pollLocation: null,
      gender: null,
      showConfirmModal: false,
      information: '',
      existingId: null,

      allowEmail: true,
      allowFb: true,
      contactNumber: ''
    };
    _this.fromLocationChanged = _this.fromLocationChanged.bind(_this);
    _this.pollLocationChanged = _this.pollLocationChanged.bind(_this);
    _this.handleGenderChange = _this.handleGenderChange.bind(_this);
    _this.handleInformationChange = _this.handleInformationChange.bind(_this);
    _this.toggleModalShow = _this.toggleModalShow.bind(_this);
    _this.handleSubmit = _this.handleSubmit.bind(_this);
    _this.handleContactNumberChange = _this.handleContactNumberChange.bind(_this);

    _this.toggleAllowEmail = _this.toggleAllowEmail.bind(_this);
    _this.toggleAllowFb = _this.toggleAllowFb.bind(_this);
    return _this;
  }

  _createClass(NeedCarpool, [{
    key: 'componentWillMount',
    value: function componentWillMount() {
      var _this2 = this;

      _api2.default.getNeed().then(function (need) {
        if (need) {
          _this2.setState({
            pollLocation: need.pollLocation,
            fromLocation: need.fromLocation,
            gender: need.gender,
            information: need.information || '',
            existingId: need.id,
            contactNumber: need.user.contact_number,
            allowEmail: need.user.allow_email,
            allowFb: need.user.allow_fb
          });
        }
      });
    }
  }, {
    key: 'fromLocationChanged',
    value: function fromLocationChanged(fromLocation) {
      this.setState({
        fromLocation: fromLocation
      });
    }
  }, {
    key: 'pollLocationChanged',
    value: function pollLocationChanged(pollLocation) {
      this.setState({
        pollLocation: pollLocation
      });
    }
  }, {
    key: 'handleGenderChange',
    value: function handleGenderChange(gender) {
      this.setState({
        gender: gender
      });
    }
  }, {
    key: 'handleInformationChange',
    value: function handleInformationChange(e) {
      this.setState({
        information: e.target.value
      });
    }
  }, {
    key: 'handleWillCarpoolFromPollsChange',
    value: function handleWillCarpoolFromPollsChange() {
      this.setState({
        willCarpoolFromPolls: !this.state.willCarpoolFromPolls
      });
    }
  }, {
    key: 'handleWillCarpoolToPollsChange',
    value: function handleWillCarpoolToPollsChange() {
      this.setState({
        willCarpoolToPolls: !this.state.willCarpoolToPolls
      });
    }
  }, {
    key: 'handleContactNumberChange',
    value: function handleContactNumberChange(e) {
      this.setState({
        contactNumber: e.target.value
      });
    }
  }, {
    key: 'handleSubmit',
    value: function handleSubmit() {
      var params = {
        fromLocationId: this.state.fromLocation.id,
        pollLocationId: this.state.pollLocation.id,
        gender: this.state.gender,
        information: this.state.information,
        allowEmail: this.state.allowEmail,
        allowFb: this.state.allowFb,
        contactNumber: this.state.contactNumber
      };
      if (!this.state.existingId) {
        _api2.default.submitCarpoolNeed(params).then(function () {
          location.href = '/my-need';
        });
      } else {
        _api2.default.updateCarpoolNeed(this.state.existingId, params).then(function () {
          location.href = '/my-need';
        });
      }
    }
  }, {
    key: 'toggleAllowEmail',
    value: function toggleAllowEmail() {
      this.setState({
        allowEmail: !this.state.allowEmail
      });
    }
  }, {
    key: 'toggleAllowFb',
    value: function toggleAllowFb() {
      this.setState({
        allowFb: !this.state.allowFb
      });
    }
  }, {
    key: 'toggleModalShow',
    value: function toggleModalShow(bool) {
      this.setState({
        showConfirmModal: bool
      });
    }
  }, {
    key: 'render',
    value: function render() {
      var _this3 = this;

      return _react2.default.createElement(
        'div',
        _defineProperty({
          __source: {
            fileName: _jsxFileName,
            lineNumber: 141
          },
          __self: this
        }, '__self', this),
        _react2.default.createElement(
          'div',
          _defineProperty({ className: 'container', __source: {
              fileName: _jsxFileName,
              lineNumber: 142
            },
            __self: this
          }, '__self', this),
          this.state.existingId ? _react2.default.createElement(
            'h1',
            _defineProperty({
              __source: {
                fileName: _jsxFileName,
                lineNumber: 144
              },
              __self: this
            }, '__self', this),
            _react2.default.createElement(_reactIntl.FormattedMessage, _defineProperty({
              id: 'request.header-update',
              defaultMessage: 'Update your carpool request',
              __source: {
                fileName: _jsxFileName,
                lineNumber: 145
              },
              __self: this
            }, '__self', this))
          ) : _react2.default.createElement(
            'h1',
            _defineProperty({
              __source: {
                fileName: _jsxFileName,
                lineNumber: 150
              },
              __self: this
            }, '__self', this),
            _react2.default.createElement(_reactIntl.FormattedMessage, _defineProperty({
              id: 'request.header-create',
              defaultMessage: 'Look for a carpool',
              __source: {
                fileName: _jsxFileName,
                lineNumber: 151
              },
              __self: this
            }, '__self', this))
          ),
          _react2.default.createElement(
            _reactBootstrap.Alert,
            _defineProperty({ bsStyle: 'info', __source: {
                fileName: _jsxFileName,
                lineNumber: 157
              },
              __self: this
            }, '__self', this),
            _react2.default.createElement(
              'p',
              _defineProperty({
                __source: {
                  fileName: _jsxFileName,
                  lineNumber: 158
                },
                __self: this
              }, '__self', this),
              _react2.default.createElement(_reactIntl.FormattedMessage, _defineProperty({
                id: 'request.create-info-1',
                defaultMessage: 'Fill in where you are from, where you are going to vote in, and gender, then submit your offer to the database.',
                __source: {
                  fileName: _jsxFileName,
                  lineNumber: 159
                },
                __self: this
              }, '__self', this))
            ),
            _react2.default.createElement(
              'p',
              _defineProperty({
                __source: {
                  fileName: _jsxFileName,
                  lineNumber: 164
                },
                __self: this
              }, '__self', this),
              _react2.default.createElement(_reactIntl.FormattedMessage, _defineProperty({
                id: 'request.create-info-2',
                defaultMessage: 'You will then be able to search for drivers going the same way as you.',
                __source: {
                  fileName: _jsxFileName,
                  lineNumber: 165
                },
                __self: this
              }, '__self', this))
            )
          ),
          _react2.default.createElement(
            _reactBootstrap.Row,
            _defineProperty({
              __source: {
                fileName: _jsxFileName,
                lineNumber: 171
              },
              __self: this
            }, '__self', this),
            _react2.default.createElement(
              _reactBootstrap.Col,
              _defineProperty({ md: 12, xs: 12, __source: {
                  fileName: _jsxFileName,
                  lineNumber: 172
                },
                __self: this
              }, '__self', this),
              _react2.default.createElement(
                _reactBootstrap.Panel,
                _defineProperty({
                  __source: {
                    fileName: _jsxFileName,
                    lineNumber: 173
                  },
                  __self: this
                }, '__self', this),
                _react2.default.createElement(
                  _reactBootstrap.Panel.Body,
                  _defineProperty({
                    __source: {
                      fileName: _jsxFileName,
                      lineNumber: 174
                    },
                    __self: this
                  }, '__self', this),
                  _react2.default.createElement(
                    _reactBootstrap.Row,
                    _defineProperty({
                      __source: {
                        fileName: _jsxFileName,
                        lineNumber: 175
                      },
                      __self: this
                    }, '__self', this),
                    _react2.default.createElement(
                      _reactBootstrap.Col,
                      _defineProperty({ md: 4, __source: {
                          fileName: _jsxFileName,
                          lineNumber: 176
                        },
                        __self: this
                      }, '__self', this),
                      _react2.default.createElement(
                        _reactBootstrap.Panel,
                        _defineProperty({
                          __source: {
                            fileName: _jsxFileName,
                            lineNumber: 177
                          },
                          __self: this
                        }, '__self', this),
                        _react2.default.createElement(
                          _reactBootstrap.Panel.Heading,
                          _defineProperty({
                            __source: {
                              fileName: _jsxFileName,
                              lineNumber: 178
                            },
                            __self: this
                          }, '__self', this),
                          _react2.default.createElement(_reactIntl.FormattedMessage, _defineProperty({
                            id: 'request.header-i-from',
                            defaultMessage: 'I am currently in',
                            __source: {
                              fileName: _jsxFileName,
                              lineNumber: 179
                            },
                            __self: this
                          }, '__self', this)),
                          ':'
                        ),
                        _react2.default.createElement(
                          _reactBootstrap.Panel.Body,
                          _defineProperty({
                            __source: {
                              fileName: _jsxFileName,
                              lineNumber: 184
                            },
                            __self: this
                          }, '__self', this),
                          _react2.default.createElement(_LocationSelection2.default, _defineProperty({ onChange: this.fromLocationChanged, initialLocation: this.state.fromLocation, __source: {
                              fileName: _jsxFileName,
                              lineNumber: 185
                            },
                            __self: this
                          }, '__self', this))
                        )
                      )
                    ),
                    _react2.default.createElement(
                      _reactBootstrap.Col,
                      _defineProperty({ md: 4, __source: {
                          fileName: _jsxFileName,
                          lineNumber: 189
                        },
                        __self: this
                      }, '__self', this),
                      _react2.default.createElement(
                        _reactBootstrap.Panel,
                        _defineProperty({
                          __source: {
                            fileName: _jsxFileName,
                            lineNumber: 190
                          },
                          __self: this
                        }, '__self', this),
                        _react2.default.createElement(
                          _reactBootstrap.Panel.Heading,
                          _defineProperty({
                            __source: {
                              fileName: _jsxFileName,
                              lineNumber: 191
                            },
                            __self: this
                          }, '__self', this),
                          _react2.default.createElement(_reactIntl.FormattedMessage, _defineProperty({
                            id: 'request.header-i-going',
                            defaultMessage: 'I am voting in',
                            __source: {
                              fileName: _jsxFileName,
                              lineNumber: 192
                            },
                            __self: this
                          }, '__self', this)),
                          ':'
                        ),
                        _react2.default.createElement(
                          _reactBootstrap.Panel.Body,
                          _defineProperty({
                            __source: {
                              fileName: _jsxFileName,
                              lineNumber: 197
                            },
                            __self: this
                          }, '__self', this),
                          _react2.default.createElement(_LocationSelection2.default, _defineProperty({ onChange: this.pollLocationChanged, initialLocation: this.state.pollLocation, __source: {
                              fileName: _jsxFileName,
                              lineNumber: 198
                            },
                            __self: this
                          }, '__self', this))
                        )
                      )
                    ),
                    _react2.default.createElement(
                      _reactBootstrap.Col,
                      _defineProperty({ md: 4, __source: {
                          fileName: _jsxFileName,
                          lineNumber: 202
                        },
                        __self: this
                      }, '__self', this),
                      _react2.default.createElement(
                        _reactBootstrap.Panel,
                        _defineProperty({
                          __source: {
                            fileName: _jsxFileName,
                            lineNumber: 203
                          },
                          __self: this
                        }, '__self', this),
                        _react2.default.createElement(
                          _reactBootstrap.Panel.Heading,
                          _defineProperty({
                            __source: {
                              fileName: _jsxFileName,
                              lineNumber: 204
                            },
                            __self: this
                          }, '__self', this),
                          _react2.default.createElement(_reactIntl.FormattedMessage, _defineProperty({
                            id: 'request.header-my-gender',
                            defaultMessage: 'My gender is',
                            __source: {
                              fileName: _jsxFileName,
                              lineNumber: 205
                            },
                            __self: this
                          }, '__self', this))
                        ),
                        _react2.default.createElement(
                          _reactBootstrap.Panel.Body,
                          _defineProperty({
                            __source: {
                              fileName: _jsxFileName,
                              lineNumber: 210
                            },
                            __self: this
                          }, '__self', this),
                          _react2.default.createElement(
                            'div',
                            _defineProperty({
                              __source: {
                                fileName: _jsxFileName,
                                lineNumber: 211
                              },
                              __self: this
                            }, '__self', this),
                            _react2.default.createElement('input', _defineProperty({
                              type: 'radio',
                              name: 'gender',
                              value: 'male',
                              onChange: function onChange(e) {
                                return _this3.handleGenderChange('male');
                              },
                              checked: this.state.gender == 'male',
                              __source: {
                                fileName: _jsxFileName,
                                lineNumber: 212
                              },
                              __self: this
                            }, '__self', this)),
                            _react2.default.createElement(_reactIntl.FormattedMessage, _defineProperty({
                              id: 'request.gender-value-male',
                              defaultMessage: 'Male',
                              __source: {
                                fileName: _jsxFileName,
                                lineNumber: 219
                              },
                              __self: this
                            }, '__self', this)),
                            _react2.default.createElement('br', _defineProperty({
                              __source: {
                                fileName: _jsxFileName,
                                lineNumber: 223
                              },
                              __self: this
                            }, '__self', this)),
                            _react2.default.createElement('input', _defineProperty({
                              type: 'radio',
                              name: 'gender',
                              value: 'female',
                              onChange: function onChange(e) {
                                return _this3.handleGenderChange('female');
                              },
                              checked: this.state.gender == 'female',
                              __source: {
                                fileName: _jsxFileName,
                                lineNumber: 224
                              },
                              __self: this
                            }, '__self', this)),
                            _react2.default.createElement(_reactIntl.FormattedMessage, _defineProperty({
                              id: 'request.gender-value-female',
                              defaultMessage: 'Female',
                              __source: {
                                fileName: _jsxFileName,
                                lineNumber: 231
                              },
                              __self: this
                            }, '__self', this)),
                            _react2.default.createElement('br', _defineProperty({
                              __source: {
                                fileName: _jsxFileName,
                                lineNumber: 235
                              },
                              __self: this
                            }, '__self', this))
                          )
                        )
                      )
                    )
                  ),
                  _react2.default.createElement(
                    _reactBootstrap.Row,
                    _defineProperty({
                      __source: {
                        fileName: _jsxFileName,
                        lineNumber: 241
                      },
                      __self: this
                    }, '__self', this),
                    _react2.default.createElement(
                      _reactBootstrap.Col,
                      _defineProperty({ md: 4, __source: {
                          fileName: _jsxFileName,
                          lineNumber: 242
                        },
                        __self: this
                      }, '__self', this),
                      _react2.default.createElement(
                        _reactBootstrap.Panel,
                        _defineProperty({
                          __source: {
                            fileName: _jsxFileName,
                            lineNumber: 243
                          },
                          __self: this
                        }, '__self', this),
                        _react2.default.createElement(
                          _reactBootstrap.Panel.Heading,
                          _defineProperty({
                            __source: {
                              fileName: _jsxFileName,
                              lineNumber: 244
                            },
                            __self: this
                          }, '__self', this),
                          _react2.default.createElement(_reactIntl.FormattedMessage, _defineProperty({
                            id: 'request.create-header-more-info',
                            defaultMessage: 'More information',
                            __source: {
                              fileName: _jsxFileName,
                              lineNumber: 245
                            },
                            __self: this
                          }, '__self', this))
                        ),
                        _react2.default.createElement(
                          _reactBootstrap.Panel.Body,
                          _defineProperty({
                            __source: {
                              fileName: _jsxFileName,
                              lineNumber: 250
                            },
                            __self: this
                          }, '__self', this),
                          _react2.default.createElement(_reactBootstrap.FormControl, _defineProperty({
                            rows: 8,
                            componentClass: 'textarea',
                            placeholder: 'Leave more details here',
                            value: this.state.information,
                            onChange: this.handleInformationChange, __source: {
                              fileName: _jsxFileName,
                              lineNumber: 251
                            },
                            __self: this
                          }, '__self', this))
                        )
                      )
                    ),
                    _react2.default.createElement(
                      _reactBootstrap.Col,
                      _defineProperty({ md: 4, __source: {
                          fileName: _jsxFileName,
                          lineNumber: 260
                        },
                        __self: this
                      }, '__self', this),
                      _react2.default.createElement(
                        _reactBootstrap.Panel,
                        _defineProperty({
                          __source: {
                            fileName: _jsxFileName,
                            lineNumber: 261
                          },
                          __self: this
                        }, '__self', this),
                        _react2.default.createElement(
                          _reactBootstrap.Panel.Heading,
                          _defineProperty({
                            __source: {
                              fileName: _jsxFileName,
                              lineNumber: 262
                            },
                            __self: this
                          }, '__self', this),
                          _react2.default.createElement(_reactIntl.FormattedMessage, _defineProperty({
                            id: 'request.create-header-what-to-show',
                            defaultMessage: 'What info to show potential matches',
                            __source: {
                              fileName: _jsxFileName,
                              lineNumber: 263
                            },
                            __self: this
                          }, '__self', this))
                        ),
                        _react2.default.createElement(
                          _reactBootstrap.Panel.Body,
                          _defineProperty({
                            __source: {
                              fileName: _jsxFileName,
                              lineNumber: 268
                            },
                            __self: this
                          }, '__self', this),
                          _react2.default.createElement(
                            _reactBootstrap.Alert,
                            _defineProperty({ bsStyle: 'info', __source: {
                                fileName: _jsxFileName,
                                lineNumber: 269
                              },
                              __self: this
                            }, '__self', this),
                            _react2.default.createElement(
                              'p',
                              _defineProperty({
                                __source: {
                                  fileName: _jsxFileName,
                                  lineNumber: 270
                                },
                                __self: this
                              }, '__self', this),
                              _react2.default.createElement(_reactIntl.FormattedMessage, _defineProperty({
                                id: 'request.info-choose-what-to-show',
                                defaultMessage: 'Choose at least one option below, and optionally your contact number. Your information will be shown to others after they pass a captcha check.',
                                __source: {
                                  fileName: _jsxFileName,
                                  lineNumber: 271
                                },
                                __self: this
                              }, '__self', this))
                            ),
                            _react2.default.createElement(
                              'p',
                              _defineProperty({
                                __source: {
                                  fileName: _jsxFileName,
                                  lineNumber: 276
                                },
                                __self: this
                              }, '__self', this),
                              _react2.default.createElement(_reactIntl.FormattedMessage, _defineProperty({
                                id: 'request.info-choose-what-to-show-fb',
                                defaultMessage: 'If you choose to show your Facebook account, do be responsive to new FB message requests!',
                                __source: {
                                  fileName: _jsxFileName,
                                  lineNumber: 277
                                },
                                __self: this
                              }, '__self', this))
                            )
                          ),
                          _react2.default.createElement('input', _defineProperty({ type: 'checkbox', onChange: this.toggleAllowEmail, checked: this.state.allowEmail, __source: {
                              fileName: _jsxFileName,
                              lineNumber: 283
                            },
                            __self: this
                          }, '__self', this)),
                          _react2.default.createElement(_reactIntl.FormattedMessage, _defineProperty({
                            id: 'request.checkbox-show-email',
                            defaultMessage: 'Show my email address.',
                            __source: {
                              fileName: _jsxFileName,
                              lineNumber: 284
                            },
                            __self: this
                          }, '__self', this)),
                          _react2.default.createElement('br', _defineProperty({
                            __source: {
                              fileName: _jsxFileName,
                              lineNumber: 287
                            },
                            __self: this
                          }, '__self', this)),
                          _react2.default.createElement('input', _defineProperty({ type: 'checkbox', onChange: this.toggleAllowFb, checked: this.state.allowFb, __source: {
                              fileName: _jsxFileName,
                              lineNumber: 288
                            },
                            __self: this
                          }, '__self', this)),
                          _react2.default.createElement(_reactIntl.FormattedMessage, _defineProperty({
                            id: 'request.checkbox-show-fb',
                            defaultMessage: 'Show the link to my Facebook account.',
                            __source: {
                              fileName: _jsxFileName,
                              lineNumber: 289
                            },
                            __self: this
                          }, '__self', this)),
                          _react2.default.createElement('br', _defineProperty({
                            __source: {
                              fileName: _jsxFileName,
                              lineNumber: 293
                            },
                            __self: this
                          }, '__self', this)),
                          _react2.default.createElement(_reactIntl.FormattedMessage, _defineProperty({
                            id: 'request.checkbox-show-contact',
                            defaultMessage: 'Show my contact number:',
                            __source: {
                              fileName: _jsxFileName,
                              lineNumber: 294
                            },
                            __self: this
                          }, '__self', this)),
                          _react2.default.createElement('input', _defineProperty({ type: 'text', size: '20', maxLength: '20', value: this.state.contactNumber, onChange: this.handleContactNumberChange, __source: {
                              fileName: _jsxFileName,
                              lineNumber: 298
                            },
                            __self: this
                          }, '__self', this))
                        )
                      )
                    )
                  )
                ),
                this.state.pollLocation && this.state.fromLocation && this.state.gender && (this.state.allowEmail || this.state.allowFb) && _react2.default.createElement(
                  _reactBootstrap.Panel.Footer,
                  _defineProperty({
                    __source: {
                      fileName: _jsxFileName,
                      lineNumber: 305
                    },
                    __self: this
                  }, '__self', this),
                  _react2.default.createElement(
                    _reactBootstrap.Row,
                    _defineProperty({
                      __source: {
                        fileName: _jsxFileName,
                        lineNumber: 306
                      },
                      __self: this
                    }, '__self', this),
                    _react2.default.createElement(
                      _reactBootstrap.Col,
                      _defineProperty({ mdOffset: 9, md: 3, xsOffset: 1, xs: 4, __source: {
                          fileName: _jsxFileName,
                          lineNumber: 307
                        },
                        __self: this
                      }, '__self', this),
                      _react2.default.createElement(
                        _reactBootstrap.Button,
                        _defineProperty({ bsStyle: 'success', onClick: function onClick(e) {
                            return _this3.toggleModalShow(true);
                          }, __source: {
                            fileName: _jsxFileName,
                            lineNumber: 308
                          },
                          __self: this
                        }, '__self', this),
                        this.state.existingId ? _react2.default.createElement(_reactIntl.FormattedMessage, _defineProperty({
                          id: 'request.btn-update',
                          defaultMessage: 'Update carpool request',
                          __source: {
                            fileName: _jsxFileName,
                            lineNumber: 310
                          },
                          __self: this
                        }, '__self', this)) : _react2.default.createElement(_reactIntl.FormattedMessage, _defineProperty({
                          id: 'request.btn-save',
                          defaultMessage: 'Save carpool request',
                          __source: {
                            fileName: _jsxFileName,
                            lineNumber: 314
                          },
                          __self: this
                        }, '__self', this))
                      )
                    )
                  )
                )
              )
            )
          )
        ),
        _react2.default.createElement(_NeedCarpoolConfirmModal2.default, _defineProperty({
          show: this.state.showConfirmModal,
          fromLocation: this.state.fromLocation,
          pollLocation: this.state.pollLocation,
          gender: this.state.gender,
          onOK: this.handleSubmit,
          onCancel: function onCancel(e) {
            return _this3.toggleModalShow(false);
          },
          __source: {
            fileName: _jsxFileName,
            lineNumber: 328
          },
          __self: this
        }, '__self', this))
      );
    }
  }]);

  return NeedCarpool;
}(_react.Component);

exports.default = NeedCarpool;

/***/ }),

/***/ 547:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
var _jsxFileName = '/Users/timteoh/TimCode/pulangmengundi/resources/assets/js/components/NeedCarpoolConfirmModal.js';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _reactDom = __webpack_require__(10);

var _reactDom2 = _interopRequireDefault(_reactDom);

var _reactBootstrap = __webpack_require__(13);

var _reactIntl = __webpack_require__(17);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var NeedCarpoolConfirmModal = function (_Component) {
  _inherits(NeedCarpoolConfirmModal, _Component);

  function NeedCarpoolConfirmModal() {
    _classCallCheck(this, NeedCarpoolConfirmModal);

    return _possibleConstructorReturn(this, (NeedCarpoolConfirmModal.__proto__ || Object.getPrototypeOf(NeedCarpoolConfirmModal)).apply(this, arguments));
  }

  _createClass(NeedCarpoolConfirmModal, [{
    key: 'render',
    value: function render() {
      return _react2.default.createElement(
        _reactBootstrap.Modal,
        _defineProperty({ show: this.props.show, onHide: this.props.onCancel, __source: {
            fileName: _jsxFileName,
            lineNumber: 11
          },
          __self: this
        }, '__self', this),
        _react2.default.createElement(
          _reactBootstrap.Modal.Header,
          _defineProperty({ closeButton: true, __source: {
              fileName: _jsxFileName,
              lineNumber: 12
            },
            __self: this
          }, '__self', this),
          _react2.default.createElement(
            _reactBootstrap.Modal.Title,
            _defineProperty({
              __source: {
                fileName: _jsxFileName,
                lineNumber: 13
              },
              __self: this
            }, '__self', this),
            _react2.default.createElement(_reactIntl.FormattedMessage, _defineProperty({
              id: 'request.dialog-header-confirm',
              defaultMessage: 'Confirm request',
              __source: {
                fileName: _jsxFileName,
                lineNumber: 14
              },
              __self: this
            }, '__self', this))
          )
        ),
        this.props.show && _react2.default.createElement(
          _reactBootstrap.Modal.Body,
          _defineProperty({
            __source: {
              fileName: _jsxFileName,
              lineNumber: 21
            },
            __self: this
          }, '__self', this),
          _react2.default.createElement(
            'h4',
            _defineProperty({
              __source: {
                fileName: _jsxFileName,
                lineNumber: 22
              },
              __self: this
            }, '__self', this),
            _react2.default.createElement(_reactIntl.FormattedMessage, _defineProperty({
              id: 'request.dialog-header-submit-question',
              defaultMessage: 'Submit carpool request?',
              __source: {
                fileName: _jsxFileName,
                lineNumber: 23
              },
              __self: this
            }, '__self', this))
          ),
          _react2.default.createElement(
            'p',
            _defineProperty({
              __source: {
                fileName: _jsxFileName,
                lineNumber: 28
              },
              __self: this
            }, '__self', this),
            _react2.default.createElement(_reactIntl.FormattedMessage, _defineProperty({
              id: 'request.dialog-info-1',
              defaultMessage: 'You will be shown other voters who are travelling the same way as you.',
              __source: {
                fileName: _jsxFileName,
                lineNumber: 29
              },
              __self: this
            }, '__self', this))
          ),
          _react2.default.createElement(
            'strong',
            _defineProperty({
              __source: {
                fileName: _jsxFileName,
                lineNumber: 34
              },
              __self: this
            }, '__self', this),
            _react2.default.createElement(_reactIntl.FormattedMessage, _defineProperty({
              id: 'request.header-i-from',
              defaultMessage: 'I am currently in',
              __source: {
                fileName: _jsxFileName,
                lineNumber: 35
              },
              __self: this
            }, '__self', this)),
            ':'
          ),
          _react2.default.createElement(
            'p',
            _defineProperty({
              __source: {
                fileName: _jsxFileName,
                lineNumber: 40
              },
              __self: this
            }, '__self', this),
            this.props.fromLocation.name,
            ' (',
            this.props.fromLocation.state,
            ')'
          ),
          _react2.default.createElement(
            'strong',
            _defineProperty({
              __source: {
                fileName: _jsxFileName,
                lineNumber: 43
              },
              __self: this
            }, '__self', this),
            _react2.default.createElement(_reactIntl.FormattedMessage, _defineProperty({
              id: 'request.header-i-going',
              defaultMessage: 'I am voting in',
              __source: {
                fileName: _jsxFileName,
                lineNumber: 44
              },
              __self: this
            }, '__self', this)),
            ':'
          ),
          _react2.default.createElement(
            'p',
            _defineProperty({
              __source: {
                fileName: _jsxFileName,
                lineNumber: 49
              },
              __self: this
            }, '__self', this),
            this.props.pollLocation.name,
            ' (',
            this.props.pollLocation.state,
            ') ',
            _react2.default.createElement('br', _defineProperty({
              __source: {
                fileName: _jsxFileName,
                lineNumber: 50
              },
              __self: this
            }, '__self', this))
          ),
          _react2.default.createElement(
            'strong',
            _defineProperty({
              __source: {
                fileName: _jsxFileName,
                lineNumber: 52
              },
              __self: this
            }, '__self', this),
            _react2.default.createElement(_reactIntl.FormattedMessage, _defineProperty({
              id: 'request.header-my-gender',
              defaultMessage: 'My gender is',
              __source: {
                fileName: _jsxFileName,
                lineNumber: 53
              },
              __self: this
            }, '__self', this))
          ),
          _react2.default.createElement(
            'p',
            _defineProperty({
              __source: {
                fileName: _jsxFileName,
                lineNumber: 58
              },
              __self: this
            }, '__self', this),
            this.props.gender
          )
        ),
        _react2.default.createElement(
          _reactBootstrap.Modal.Footer,
          _defineProperty({
            __source: {
              fileName: _jsxFileName,
              lineNumber: 63
            },
            __self: this
          }, '__self', this),
          _react2.default.createElement(
            _reactBootstrap.Button,
            _defineProperty({ onClick: this.props.onOK, bsStyle: 'success', __source: {
                fileName: _jsxFileName,
                lineNumber: 64
              },
              __self: this
            }, '__self', this),
            _react2.default.createElement(_reactIntl.FormattedMessage, _defineProperty({
              id: 'btn-ok',
              defaultMessage: 'OK',
              __source: {
                fileName: _jsxFileName,
                lineNumber: 65
              },
              __self: this
            }, '__self', this))
          ),
          _react2.default.createElement(
            _reactBootstrap.Button,
            _defineProperty({ onClick: this.props.onCancel, __source: {
                fileName: _jsxFileName,
                lineNumber: 70
              },
              __self: this
            }, '__self', this),
            _react2.default.createElement(_reactIntl.FormattedMessage, _defineProperty({
              id: 'btn-cancel',
              defaultMessage: 'Cancel',
              __source: {
                fileName: _jsxFileName,
                lineNumber: 71
              },
              __self: this
            }, '__self', this))
          )
        )
      );
    }
  }]);

  return NeedCarpoolConfirmModal;
}(_react.Component);

exports.default = NeedCarpoolConfirmModal;

/***/ }),

/***/ 548:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
var _jsxFileName = '/Users/timteoh/TimCode/pulangmengundi/resources/assets/js/components/MyOffers.js';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _reactDom = __webpack_require__(10);

var _reactDom2 = _interopRequireDefault(_reactDom);

var _api = __webpack_require__(24);

var _api2 = _interopRequireDefault(_api);

var _reactBootstrap = __webpack_require__(13);

var _CarpoolOffer = __webpack_require__(131);

var _CarpoolOffer2 = _interopRequireDefault(_CarpoolOffer);

var _CarpoolNeed = __webpack_require__(132);

var _CarpoolNeed2 = _interopRequireDefault(_CarpoolNeed);

var _ContactModal = __webpack_require__(133);

var _ContactModal2 = _interopRequireDefault(_ContactModal);

var _reactIntl = __webpack_require__(17);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var MyOffers = function (_Component) {
  _inherits(MyOffers, _Component);

  function MyOffers(props) {
    _classCallCheck(this, MyOffers);

    var _this = _possibleConstructorReturn(this, (MyOffers.__proto__ || Object.getPrototypeOf(MyOffers)).call(this, props));

    _this.state = {
      offers: [],
      showContactModal: false,
      needs: []
    };

    _this.load = _this.load.bind(_this);
    _this.handleContactUser = _this.handleContactUser.bind(_this);
    return _this;
  }

  _createClass(MyOffers, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      this.load();
    }
  }, {
    key: 'load',
    value: function load() {
      var _this2 = this;

      _api2.default.getMyOffers().then(function (_ref) {
        var offers = _ref.offers;

        // console.log(offers)
        _this2.setState({
          offers: offers
        }, function () {
          _api2.default.getOfferMatches().then(function (_ref2) {
            var needs = _ref2.needs;

            _this2.setState({
              needs: needs
            });
          });
        });
      });
    }
  }, {
    key: 'handleContactUser',
    value: function handleContactUser(user) {
      this.setState({
        selectedUser: user,
        showContactModal: true
      });
    }
  }, {
    key: 'render',
    value: function render() {
      var _this3 = this;

      return _react2.default.createElement(
        'div',
        _defineProperty({
          __source: {
            fileName: _jsxFileName,
            lineNumber: 54
          },
          __self: this
        }, '__self', this),
        _react2.default.createElement(
          'h1',
          _defineProperty({
            __source: {
              fileName: _jsxFileName,
              lineNumber: 55
            },
            __self: this
          }, '__self', this),
          _react2.default.createElement(_reactIntl.FormattedMessage, _defineProperty({
            id: 'offer.header-your-offers',
            defaultMessage: 'Your carpool offers',
            __source: {
              fileName: _jsxFileName,
              lineNumber: 56
            },
            __self: this
          }, '__self', this))
        ),
        _react2.default.createElement(
          _reactBootstrap.Alert,
          _defineProperty({ bsStyle: 'info', __source: {
              fileName: _jsxFileName,
              lineNumber: 61
            },
            __self: this
          }, '__self', this),
          _react2.default.createElement(
            'h4',
            _defineProperty({
              __source: {
                fileName: _jsxFileName,
                lineNumber: 62
              },
              __self: this
            }, '__self', this),
            _react2.default.createElement(_reactIntl.FormattedMessage, _defineProperty({
              id: 'offer.header-do-what',
              defaultMessage: 'What should I do now?',
              __source: {
                fileName: _jsxFileName,
                lineNumber: 63
              },
              __self: this
            }, '__self', this))
          ),
          _react2.default.createElement(
            'p',
            _defineProperty({
              __source: {
                fileName: _jsxFileName,
                lineNumber: 68
              },
              __self: this
            }, '__self', this),
            _react2.default.createElement(_reactIntl.FormattedHTMLMessage, _defineProperty({
              id: 'offer.do-what-1',
              defaultMessage: 'You may be contacted by riders going the same way. If you enabled Facebook as a method of contact, do <strong>actively</strong> check your Friend requests and messages',
              __source: {
                fileName: _jsxFileName,
                lineNumber: 69
              },
              __self: this
            }, '__self', this))
          ),
          _react2.default.createElement(
            'p',
            _defineProperty({
              __source: {
                fileName: _jsxFileName,
                lineNumber: 74
              },
              __self: this
            }, '__self', this),
            _react2.default.createElement(_reactIntl.FormattedMessage, _defineProperty({
              id: 'offer.do-what-2',
              defaultMessage: 'If you have an open offer, we may send you emails periodically to tell you of new matches.',
              __source: {
                fileName: _jsxFileName,
                lineNumber: 75
              },
              __self: this
            }, '__self', this))
          )
        ),
        _react2.default.createElement(
          _reactBootstrap.Row,
          _defineProperty({
            __source: {
              fileName: _jsxFileName,
              lineNumber: 81
            },
            __self: this
          }, '__self', this),
          this.state.offers.map(function (offer, i) {
            return _react2.default.createElement(
              _reactBootstrap.Col,
              _defineProperty({ md: 6, key: i, __source: {
                  fileName: _jsxFileName,
                  lineNumber: 83
                },
                __self: _this3
              }, '__self', _this3),
              _react2.default.createElement(_CarpoolOffer2.default, _defineProperty({ onChange: function onChange() {
                  window.location.reload();
                }, offer: offer, isOwner: true, __source: {
                  fileName: _jsxFileName,
                  lineNumber: 84
                },
                __self: _this3
              }, '__self', _this3))
            );
          })
        ),
        _react2.default.createElement(
          _reactBootstrap.Panel,
          _defineProperty({
            __source: {
              fileName: _jsxFileName,
              lineNumber: 88
            },
            __self: this
          }, '__self', this),
          _react2.default.createElement(
            _reactBootstrap.Panel.Heading,
            _defineProperty({
              __source: {
                fileName: _jsxFileName,
                lineNumber: 89
              },
              __self: this
            }, '__self', this),
            _react2.default.createElement(
              'h3',
              _defineProperty({
                __source: {
                  fileName: _jsxFileName,
                  lineNumber: 90
                },
                __self: this
              }, '__self', this),
              _react2.default.createElement(_reactIntl.FormattedMessage, _defineProperty({
                id: 'offer.header-matches',
                defaultMessage: 'Your matches',
                __source: {
                  fileName: _jsxFileName,
                  lineNumber: 91
                },
                __self: this
              }, '__self', this))
            )
          ),
          _react2.default.createElement(
            _reactBootstrap.Panel.Body,
            _defineProperty({
              __source: {
                fileName: _jsxFileName,
                lineNumber: 97
              },
              __self: this
            }, '__self', this),
            _react2.default.createElement(
              _reactBootstrap.Alert,
              _defineProperty({ bsStyle: 'info', __source: {
                  fileName: _jsxFileName,
                  lineNumber: 98
                },
                __self: this
              }, '__self', this),
              _react2.default.createElement(
                'p',
                _defineProperty({
                  __source: {
                    fileName: _jsxFileName,
                    lineNumber: 99
                  },
                  __self: this
                }, '__self', this),
                _react2.default.createElement(_reactIntl.FormattedHTMLMessage, _defineProperty({
                  id: 'offer.your-matches-info',
                  defaultMessage: 'Carpool requests from riders that match you are shown here. You can also check the <strong><a href=\'/\'>main page</a></strong> to search for riders.',
                  __source: {
                    fileName: _jsxFileName,
                    lineNumber: 100
                  },
                  __self: this
                }, '__self', this))
              )
            ),
            this.state.needs && this.state.needs.length == 0 && _react2.default.createElement(
              _reactBootstrap.Alert,
              _defineProperty({ bsStyle: 'info', __source: {
                  fileName: _jsxFileName,
                  lineNumber: 107
                },
                __self: this
              }, '__self', this),
              _react2.default.createElement(
                'p',
                _defineProperty({
                  __source: {
                    fileName: _jsxFileName,
                    lineNumber: 108
                  },
                  __self: this
                }, '__self', this),
                _react2.default.createElement(_reactIntl.FormattedMessage, _defineProperty({
                  id: 'offer.no-match-1',
                  defaultMessage: 'There is no one matching your travel locations. Check back later!',
                  __source: {
                    fileName: _jsxFileName,
                    lineNumber: 109
                  },
                  __self: this
                }, '__self', this))
              ),
              _react2.default.createElement(
                'p',
                _defineProperty({
                  __source: {
                    fileName: _jsxFileName,
                    lineNumber: 114
                  },
                  __self: this
                }, '__self', this),
                _react2.default.createElement(_reactIntl.FormattedMessage, _defineProperty({
                  id: 'offer.no-match-2',
                  defaultMessage: 'We will try to match you with anyone travelling from the same states.',
                  __source: {
                    fileName: _jsxFileName,
                    lineNumber: 115
                  },
                  __self: this
                }, '__self', this))
              )
            ),
            _react2.default.createElement(
              _reactBootstrap.Grid,
              _defineProperty({ fluid: true, __source: {
                  fileName: _jsxFileName,
                  lineNumber: 122
                },
                __self: this
              }, '__self', this),
              this.state.needs && this.state.needs.length > 0 && this.state.needs.map(function (need, i) {
                return _react2.default.createElement(
                  _reactBootstrap.Col,
                  _defineProperty({ key: i, md: 6, __source: {
                      fileName: _jsxFileName,
                      lineNumber: 124
                    },
                    __self: _this3
                  }, '__self', _this3),
                  _react2.default.createElement(_CarpoolNeed2.default, _defineProperty({ onContact: _this3.handleContactUser, need: need, __source: {
                      fileName: _jsxFileName,
                      lineNumber: 125
                    },
                    __self: _this3
                  }, '__self', _this3))
                );
              })
            )
          )
        ),
        this.state.showContactModal && _react2.default.createElement(_ContactModal2.default, _defineProperty({ show: this.state.showContactModal, user: this.state.selectedUser, onCancel: function onCancel(e) {
            return _this3.setState({ showContactModal: false });
          }, __source: {
            fileName: _jsxFileName,
            lineNumber: 132
          },
          __self: this
        }, '__self', this))
      );
    }
  }]);

  return MyOffers;
}(_react.Component);

exports.default = MyOffers;

/***/ }),

/***/ 549:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
var _jsxFileName = '/Users/timteoh/TimCode/pulangmengundi/resources/assets/js/components/HideOfferModal.js';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _reactDom = __webpack_require__(10);

var _reactDom2 = _interopRequireDefault(_reactDom);

var _reactBootstrap = __webpack_require__(13);

var _reactIntl = __webpack_require__(17);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var HideOfferModal = function (_Component) {
  _inherits(HideOfferModal, _Component);

  function HideOfferModal(props) {
    _classCallCheck(this, HideOfferModal);

    return _possibleConstructorReturn(this, (HideOfferModal.__proto__ || Object.getPrototypeOf(HideOfferModal)).call(this, props));
  }

  _createClass(HideOfferModal, [{
    key: 'render',
    value: function render() {
      return _react2.default.createElement(
        _reactBootstrap.Modal,
        _defineProperty({ show: this.props.show, onHide: this.props.onCancel, __source: {
            fileName: _jsxFileName,
            lineNumber: 14
          },
          __self: this
        }, '__self', this),
        _react2.default.createElement(
          _reactBootstrap.Modal.Header,
          _defineProperty({ closeButton: true, __source: {
              fileName: _jsxFileName,
              lineNumber: 15
            },
            __self: this
          }, '__self', this),
          _react2.default.createElement(
            _reactBootstrap.Modal.Title,
            _defineProperty({
              __source: {
                fileName: _jsxFileName,
                lineNumber: 16
              },
              __self: this
            }, '__self', this),
            _react2.default.createElement(_reactIntl.FormattedMessage, _defineProperty({
              id: 'offer.header-close-why',
              defaultMessage: 'Please tell us why you are closing your carpool offer',
              __source: {
                fileName: _jsxFileName,
                lineNumber: 17
              },
              __self: this
            }, '__self', this))
          )
        ),
        _react2.default.createElement(
          _reactBootstrap.Modal.Body,
          _defineProperty({
            __source: {
              fileName: _jsxFileName,
              lineNumber: 23
            },
            __self: this
          }, '__self', this),
          _react2.default.createElement(
            _reactBootstrap.Grid,
            _defineProperty({ fluid: true, __source: {
                fileName: _jsxFileName,
                lineNumber: 24
              },
              __self: this
            }, '__self', this),
            _react2.default.createElement(
              _reactBootstrap.Row,
              _defineProperty({
                __source: {
                  fileName: _jsxFileName,
                  lineNumber: 25
                },
                __self: this
              }, '__self', this),
              _react2.default.createElement(
                _reactBootstrap.Col,
                _defineProperty({ md: 6, __source: {
                    fileName: _jsxFileName,
                    lineNumber: 26
                  },
                  __self: this
                }, '__self', this),
                _react2.default.createElement(
                  _reactBootstrap.Button,
                  _defineProperty({ bsStyle: 'success', onClick: this.props.onOfferSuccess, __source: {
                      fileName: _jsxFileName,
                      lineNumber: 27
                    },
                    __self: this
                  }, '__self', this),
                  _react2.default.createElement(_reactIntl.FormattedHTMLMessage, _defineProperty({
                    id: 'offer.btn-close-success',
                    defaultMessage: 'I have matched <br />with other carpoolers!',
                    __source: {
                      fileName: _jsxFileName,
                      lineNumber: 28
                    },
                    __self: this
                  }, '__self', this))
                )
              ),
              _react2.default.createElement(
                _reactBootstrap.Col,
                _defineProperty({ md: 6, __source: {
                    fileName: _jsxFileName,
                    lineNumber: 34
                  },
                  __self: this
                }, '__self', this),
                _react2.default.createElement(
                  _reactBootstrap.Button,
                  _defineProperty({ bsStyle: 'warning', onClick: this.props.onOfferCancel, __source: {
                      fileName: _jsxFileName,
                      lineNumber: 35
                    },
                    __self: this
                  }, '__self', this),
                  _react2.default.createElement(_reactIntl.FormattedHTMLMessage, _defineProperty({
                    id: 'offer.btn-cancel-delete',
                    defaultMessage: 'I have changed my mind/<br/>will re-create listing',
                    __source: {
                      fileName: _jsxFileName,
                      lineNumber: 36
                    },
                    __self: this
                  }, '__self', this))
                )
              )
            )
          )
        ),
        _react2.default.createElement(
          _reactBootstrap.Modal.Footer,
          _defineProperty({
            __source: {
              fileName: _jsxFileName,
              lineNumber: 45
            },
            __self: this
          }, '__self', this),
          _react2.default.createElement(
            _reactBootstrap.Button,
            _defineProperty({ onClick: this.props.onCancel, __source: {
                fileName: _jsxFileName,
                lineNumber: 46
              },
              __self: this
            }, '__self', this),
            _react2.default.createElement(_reactIntl.FormattedHTMLMessage, _defineProperty({
              id: 'btn-cancel',
              defaultMessage: 'Cancel',
              __source: {
                fileName: _jsxFileName,
                lineNumber: 47
              },
              __self: this
            }, '__self', this))
          )
        )
      );
    }
  }]);

  return HideOfferModal;
}(_react.Component);

exports.default = HideOfferModal;

/***/ }),

/***/ 550:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
var _jsxFileName = '/Users/timteoh/TimCode/pulangmengundi/resources/assets/js/components/UnhideOfferModal.js';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _reactDom = __webpack_require__(10);

var _reactDom2 = _interopRequireDefault(_reactDom);

var _reactBootstrap = __webpack_require__(13);

var _reactIntl = __webpack_require__(17);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var UnhideOfferModal = function (_Component) {
  _inherits(UnhideOfferModal, _Component);

  function UnhideOfferModal(props) {
    _classCallCheck(this, UnhideOfferModal);

    return _possibleConstructorReturn(this, (UnhideOfferModal.__proto__ || Object.getPrototypeOf(UnhideOfferModal)).call(this, props));
  }

  _createClass(UnhideOfferModal, [{
    key: 'render',
    value: function render() {
      return _react2.default.createElement(
        _reactBootstrap.Modal,
        _defineProperty({ show: this.props.show, onHide: this.props.onCancel, __source: {
            fileName: _jsxFileName,
            lineNumber: 14
          },
          __self: this
        }, '__self', this),
        _react2.default.createElement(
          _reactBootstrap.Modal.Header,
          _defineProperty({ closeButton: true, __source: {
              fileName: _jsxFileName,
              lineNumber: 15
            },
            __self: this
          }, '__self', this),
          _react2.default.createElement(
            _reactBootstrap.Modal.Title,
            _defineProperty({
              __source: {
                fileName: _jsxFileName,
                lineNumber: 16
              },
              __self: this
            }, '__self', this),
            _react2.default.createElement(_reactIntl.FormattedMessage, _defineProperty({
              id: 'offer.dialog-hide-question',
              defaultMessage: 'Hide your carpool offer?',
              __source: {
                fileName: _jsxFileName,
                lineNumber: 17
              },
              __self: this
            }, '__self', this))
          )
        ),
        _react2.default.createElement(
          _reactBootstrap.Modal.Body,
          _defineProperty({
            __source: {
              fileName: _jsxFileName,
              lineNumber: 23
            },
            __self: this
          }, '__self', this),
          _react2.default.createElement(
            'h4',
            _defineProperty({
              __source: {
                fileName: _jsxFileName,
                lineNumber: 24
              },
              __self: this
            }, '__self', this),
            _react2.default.createElement(_reactIntl.FormattedMessage, _defineProperty({
              id: 'offer.dialog-hide-question',
              defaultMessage: 'Hide your carpool offer?',
              __source: {
                fileName: _jsxFileName,
                lineNumber: 25
              },
              __self: this
            }, '__self', this))
          ),
          _react2.default.createElement(
            'p',
            _defineProperty({
              __source: {
                fileName: _jsxFileName,
                lineNumber: 30
              },
              __self: this
            }, '__self', this),
            _react2.default.createElement(_reactIntl.FormattedMessage, _defineProperty({
              id: 'offer.warning-undo-hidden-public',
              defaultMessage: 'This will make your carpool offer public again.',
              __source: {
                fileName: _jsxFileName,
                lineNumber: 31
              },
              __self: this
            }, '__self', this))
          )
        ),
        _react2.default.createElement(
          _reactBootstrap.Modal.Footer,
          _defineProperty({
            __source: {
              fileName: _jsxFileName,
              lineNumber: 37
            },
            __self: this
          }, '__self', this),
          _react2.default.createElement(
            _reactBootstrap.Button,
            _defineProperty({ onClick: this.props.onOK, bsStyle: 'success', __source: {
                fileName: _jsxFileName,
                lineNumber: 38
              },
              __self: this
            }, '__self', this),
            _react2.default.createElement(_reactIntl.FormattedMessage, _defineProperty({
              id: 'btn-ok',
              defaultMessage: 'OK',
              __source: {
                fileName: _jsxFileName,
                lineNumber: 39
              },
              __self: this
            }, '__self', this))
          ),
          _react2.default.createElement(
            _reactBootstrap.Button,
            _defineProperty({ onClick: this.props.onCancel, __source: {
                fileName: _jsxFileName,
                lineNumber: 44
              },
              __self: this
            }, '__self', this),
            _react2.default.createElement(_reactIntl.FormattedMessage, _defineProperty({
              id: 'btn-cancel',
              defaultMessage: 'Cancel',
              __source: {
                fileName: _jsxFileName,
                lineNumber: 45
              },
              __self: this
            }, '__self', this))
          )
        )
      );
    }
  }]);

  return UnhideOfferModal;
}(_react.Component);

exports.default = UnhideOfferModal;

/***/ }),

/***/ 551:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
var _jsxFileName = '/Users/timteoh/TimCode/pulangmengundi/resources/assets/js/components/CloseNeedModal.js';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _reactDom = __webpack_require__(10);

var _reactDom2 = _interopRequireDefault(_reactDom);

var _reactBootstrap = __webpack_require__(13);

var _reactIntl = __webpack_require__(17);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var CloseNeedModal = function (_Component) {
  _inherits(CloseNeedModal, _Component);

  function CloseNeedModal(props) {
    _classCallCheck(this, CloseNeedModal);

    return _possibleConstructorReturn(this, (CloseNeedModal.__proto__ || Object.getPrototypeOf(CloseNeedModal)).call(this, props));
  }

  _createClass(CloseNeedModal, [{
    key: 'render',
    value: function render() {
      return _react2.default.createElement(
        _reactBootstrap.Modal,
        _defineProperty({ show: this.props.show, onHide: this.props.onCancel, __source: {
            fileName: _jsxFileName,
            lineNumber: 14
          },
          __self: this
        }, '__self', this),
        _react2.default.createElement(
          _reactBootstrap.Modal.Header,
          _defineProperty({ closeButton: true, __source: {
              fileName: _jsxFileName,
              lineNumber: 15
            },
            __self: this
          }, '__self', this),
          _react2.default.createElement(
            _reactBootstrap.Modal.Title,
            _defineProperty({
              __source: {
                fileName: _jsxFileName,
                lineNumber: 16
              },
              __self: this
            }, '__self', this),
            _react2.default.createElement(_reactIntl.FormattedMessage, _defineProperty({
              id: 'request.close-title',
              defaultMessage: 'Please tell us why you are closing your carpool request',
              __source: {
                fileName: _jsxFileName,
                lineNumber: 17
              },
              __self: this
            }, '__self', this))
          )
        ),
        _react2.default.createElement(
          _reactBootstrap.Modal.Body,
          _defineProperty({
            __source: {
              fileName: _jsxFileName,
              lineNumber: 23
            },
            __self: this
          }, '__self', this),
          _react2.default.createElement(
            _reactBootstrap.Grid,
            _defineProperty({ fluid: true, __source: {
                fileName: _jsxFileName,
                lineNumber: 24
              },
              __self: this
            }, '__self', this),
            _react2.default.createElement(
              _reactBootstrap.Row,
              _defineProperty({
                __source: {
                  fileName: _jsxFileName,
                  lineNumber: 25
                },
                __self: this
              }, '__self', this),
              _react2.default.createElement(
                _reactBootstrap.Col,
                _defineProperty({ md: 6, sm: 6, __source: {
                    fileName: _jsxFileName,
                    lineNumber: 26
                  },
                  __self: this
                }, '__self', this),
                _react2.default.createElement(
                  _reactBootstrap.Button,
                  _defineProperty({ bsStyle: 'success', onClick: this.props.onNeedSuccess, __source: {
                      fileName: _jsxFileName,
                      lineNumber: 27
                    },
                    __self: this
                  }, '__self', this),
                  _react2.default.createElement(_reactIntl.FormattedHTMLMessage, _defineProperty({
                    id: 'request.btn-i-have-matched',
                    defaultMessage: 'I have matched <br />with other carpoolers!',
                    __source: {
                      fileName: _jsxFileName,
                      lineNumber: 28
                    },
                    __self: this
                  }, '__self', this))
                )
              ),
              _react2.default.createElement(
                _reactBootstrap.Col,
                _defineProperty({ md: 6, sm: 6, __source: {
                    fileName: _jsxFileName,
                    lineNumber: 34
                  },
                  __self: this
                }, '__self', this),
                _react2.default.createElement(
                  _reactBootstrap.Button,
                  _defineProperty({ bsStyle: 'warning', onClick: this.props.onNeedCancel, __source: {
                      fileName: _jsxFileName,
                      lineNumber: 35
                    },
                    __self: this
                  }, '__self', this),
                  _react2.default.createElement(_reactIntl.FormattedHTMLMessage, _defineProperty({
                    id: 'request.btn-i-dowan',
                    defaultMessage: 'I have changed my mind/<br/>will re-create listing',
                    __source: {
                      fileName: _jsxFileName,
                      lineNumber: 36
                    },
                    __self: this
                  }, '__self', this))
                )
              )
            )
          )
        ),
        _react2.default.createElement(
          _reactBootstrap.Modal.Footer,
          _defineProperty({
            __source: {
              fileName: _jsxFileName,
              lineNumber: 45
            },
            __self: this
          }, '__self', this),
          _react2.default.createElement(
            _reactBootstrap.Button,
            _defineProperty({ onClick: this.props.onCancel, __source: {
                fileName: _jsxFileName,
                lineNumber: 46
              },
              __self: this
            }, '__self', this),
            _react2.default.createElement(_reactIntl.FormattedMessage, _defineProperty({
              id: 'btn-cancel',
              defaultMessage: 'Cancel',
              __source: {
                fileName: _jsxFileName,
                lineNumber: 47
              },
              __self: this
            }, '__self', this))
          )
        )
      );
    }
  }]);

  return CloseNeedModal;
}(_react.Component);

exports.default = CloseNeedModal;

/***/ }),

/***/ 552:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__recaptcha__ = __webpack_require__(553);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_react_async_script__ = __webpack_require__(554);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_react_async_script___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_react_async_script__);



var callbackName = "onloadcallback";
var lang = typeof window !== "undefined" && window.recaptchaOptions && window.recaptchaOptions.lang ? "&hl=" + window.recaptchaOptions.lang : "";
var URL = "https://www.google.com/recaptcha/api.js?onload=" + callbackName + "&render=explicit" + lang;
var globalName = "grecaptcha";

/* harmony default export */ __webpack_exports__["default"] = (__WEBPACK_IMPORTED_MODULE_1_react_async_script___default()(__WEBPACK_IMPORTED_MODULE_0__recaptcha__["a" /* default */], URL, {
  callbackName: callbackName,
  globalName: globalName,
  exposeFuncs: ["getValue", "getWidgetId", "reset", "execute"]
}));

/***/ }),

/***/ 553:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_extends__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_extends___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_extends__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_babel_runtime_helpers_objectWithoutProperties__ = __webpack_require__(7);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_babel_runtime_helpers_objectWithoutProperties___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_babel_runtime_helpers_objectWithoutProperties__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_babel_runtime_helpers_classCallCheck__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_babel_runtime_helpers_classCallCheck___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2_babel_runtime_helpers_classCallCheck__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_babel_runtime_helpers_possibleConstructorReturn__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_babel_runtime_helpers_possibleConstructorReturn___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3_babel_runtime_helpers_possibleConstructorReturn__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_babel_runtime_helpers_inherits__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_babel_runtime_helpers_inherits___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_4_babel_runtime_helpers_inherits__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5_react__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5_react___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_5_react__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6_prop_types__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6_prop_types___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_6_prop_types__);








var ReCAPTCHA = function (_React$Component) {
  __WEBPACK_IMPORTED_MODULE_4_babel_runtime_helpers_inherits___default()(ReCAPTCHA, _React$Component);

  function ReCAPTCHA() {
    __WEBPACK_IMPORTED_MODULE_2_babel_runtime_helpers_classCallCheck___default()(this, ReCAPTCHA);

    var _this = __WEBPACK_IMPORTED_MODULE_3_babel_runtime_helpers_possibleConstructorReturn___default()(this, _React$Component.call(this));

    _this.state = {};
    _this.handleExpired = _this.handleExpired.bind(_this);
    _this.handleRecaptchaRef = _this.handleRecaptchaRef.bind(_this);
    return _this;
  }

  ReCAPTCHA.prototype.getValue = function getValue() {
    if (this.props.grecaptcha && this.state.widgetId !== undefined) {
      return this.props.grecaptcha.getResponse(this.state.widgetId);
    }
    return null;
  };

  ReCAPTCHA.prototype.getWidgetId = function getWidgetId() {
    if (this.props.grecaptcha && this.state.widgetId !== undefined) {
      return this.state.widgetId;
    }
    return null;
  };

  ReCAPTCHA.prototype.execute = function execute() {
    var grecaptcha = this.props.grecaptcha;
    var widgetId = this.state.widgetId;


    if (grecaptcha && widgetId !== undefined) {
      return grecaptcha.execute(widgetId);
    } else {
      this._executeRequested = true;
    }
  };

  ReCAPTCHA.prototype.reset = function reset() {
    if (this.props.grecaptcha && this.state.widgetId !== undefined) {
      this.props.grecaptcha.reset(this.state.widgetId);
    }
  };

  ReCAPTCHA.prototype.handleExpired = function handleExpired() {
    if (this.props.onExpired) {
      this.props.onExpired();
    } else if (this.props.onChange) {
      this.props.onChange(null);
    }
  };

  ReCAPTCHA.prototype.explicitRender = function explicitRender(cb) {
    if (this.props.grecaptcha && this.state.widgetId === undefined) {
      var wrapper = document.createElement("div");
      var id = this.props.grecaptcha.render(wrapper, {
        sitekey: this.props.sitekey,
        callback: this.props.onChange,
        theme: this.props.theme,
        type: this.props.type,
        tabindex: this.props.tabindex,
        "expired-callback": this.handleExpired,
        size: this.props.size,
        stoken: this.props.stoken,
        badge: this.props.badge
      });
      this.captcha.appendChild(wrapper);

      this.setState({
        widgetId: id
      }, cb);
    }
    if (this._executeRequested && this.props.grecaptcha && this.state.widgetId !== undefined) {
      this._executeRequested = false;
      this.execute();
    }
  };

  ReCAPTCHA.prototype.componentDidMount = function componentDidMount() {
    this.explicitRender();
  };

  ReCAPTCHA.prototype.componentDidUpdate = function componentDidUpdate() {
    this.explicitRender();
  };

  ReCAPTCHA.prototype.componentWillUnmount = function componentWillUnmount() {
    if (this.state.widgetId !== undefined) {
      while (this.captcha.firstChild) {
        this.captcha.removeChild(this.captcha.firstChild);
      }
      this.reset();
    }
  };

  ReCAPTCHA.prototype.handleRecaptchaRef = function handleRecaptchaRef(elem) {
    this.captcha = elem;
  };

  ReCAPTCHA.prototype.render = function render() {
    // consume properties owned by the reCATPCHA, pass the rest to the div so the user can style it.
    /* eslint-disable no-unused-vars */
    var _props = this.props,
        sitekey = _props.sitekey,
        onChange = _props.onChange,
        theme = _props.theme,
        type = _props.type,
        tabindex = _props.tabindex,
        onExpired = _props.onExpired,
        size = _props.size,
        stoken = _props.stoken,
        grecaptcha = _props.grecaptcha,
        badge = _props.badge,
        childProps = __WEBPACK_IMPORTED_MODULE_1_babel_runtime_helpers_objectWithoutProperties___default()(_props, ["sitekey", "onChange", "theme", "type", "tabindex", "onExpired", "size", "stoken", "grecaptcha", "badge"]);
    /* eslint-enable no-unused-vars */


    return __WEBPACK_IMPORTED_MODULE_5_react___default.a.createElement("div", __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_extends___default()({}, childProps, { ref: this.handleRecaptchaRef }));
  };

  return ReCAPTCHA;
}(__WEBPACK_IMPORTED_MODULE_5_react___default.a.Component);

/* harmony default export */ __webpack_exports__["a"] = (ReCAPTCHA);


ReCAPTCHA.displayName = "ReCAPTCHA";
ReCAPTCHA.propTypes = {
  sitekey: __WEBPACK_IMPORTED_MODULE_6_prop_types___default.a.string.isRequired,
  onChange: __WEBPACK_IMPORTED_MODULE_6_prop_types___default.a.func.isRequired,
  grecaptcha: __WEBPACK_IMPORTED_MODULE_6_prop_types___default.a.object,
  theme: __WEBPACK_IMPORTED_MODULE_6_prop_types___default.a.oneOf(["dark", "light"]),
  type: __WEBPACK_IMPORTED_MODULE_6_prop_types___default.a.oneOf(["image", "audio"]),
  tabindex: __WEBPACK_IMPORTED_MODULE_6_prop_types___default.a.number,
  onExpired: __WEBPACK_IMPORTED_MODULE_6_prop_types___default.a.func,
  size: __WEBPACK_IMPORTED_MODULE_6_prop_types___default.a.oneOf(["compact", "normal", "invisible"]),
  stoken: __WEBPACK_IMPORTED_MODULE_6_prop_types___default.a.string,
  badge: __WEBPACK_IMPORTED_MODULE_6_prop_types___default.a.oneOf(["bottomright", "bottomleft", "inline"])
};
ReCAPTCHA.defaultProps = {
  theme: "light",
  type: "image",
  tabindex: 0,
  size: "normal",
  badge: "bottomright"
};

/***/ }),

/***/ 554:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.__esModule = true;

var _extends2 = __webpack_require__(6);

var _extends3 = _interopRequireDefault(_extends2);

var _objectWithoutProperties2 = __webpack_require__(7);

var _objectWithoutProperties3 = _interopRequireDefault(_objectWithoutProperties2);

var _getIterator2 = __webpack_require__(555);

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _classCallCheck2 = __webpack_require__(3);

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = __webpack_require__(4);

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = __webpack_require__(5);

var _inherits3 = _interopRequireDefault(_inherits2);

var _map = __webpack_require__(558);

var _map2 = _interopRequireDefault(_map);

exports.default = makeAsyncScript;

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _propTypes = __webpack_require__(2);

var _propTypes2 = _interopRequireDefault(_propTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var SCRIPT_MAP = new _map2.default();

// A counter used to generate a unique id for each component that uses the function
var idCount = 0;

function makeAsyncScript(Component, scriptURL, options) {
  options = options || {};
  var wrappedComponentName = Component.displayName || Component.name || "Component";

  var AsyncScriptLoader = function (_React$Component) {
    (0, _inherits3.default)(AsyncScriptLoader, _React$Component);

    function AsyncScriptLoader() {
      (0, _classCallCheck3.default)(this, AsyncScriptLoader);

      var _this = (0, _possibleConstructorReturn3.default)(this, _React$Component.call(this));

      _this.state = {};
      return _this;
    }

    AsyncScriptLoader.prototype.asyncScriptLoaderGetScriptLoaderID = function asyncScriptLoaderGetScriptLoaderID() {
      if (!this.__scriptLoaderID) {
        this.__scriptLoaderID = "async-script-loader-" + idCount++;
      }
      return this.__scriptLoaderID;
    };

    AsyncScriptLoader.prototype.getComponent = function getComponent() {
      return this.childComponent;
    };

    AsyncScriptLoader.prototype.componentDidMount = function componentDidMount() {
      var _this2 = this;

      var key = this.asyncScriptLoaderGetScriptLoaderID();
      var _options = options,
          globalName = _options.globalName,
          callbackName = _options.callbackName;

      if (globalName && typeof window[globalName] !== "undefined") {
        SCRIPT_MAP.set(scriptURL, { loaded: true, observers: new _map2.default() });
      }

      if (SCRIPT_MAP.has(scriptURL)) {
        var entry = SCRIPT_MAP.get(scriptURL);
        if (entry && (entry.loaded || entry.errored)) {
          this.asyncScriptLoaderHandleLoad(entry);
          return;
        }
        entry.observers.set(key, function (entry) {
          return _this2.asyncScriptLoaderHandleLoad(entry);
        });
        return;
      }

      var observers = new _map2.default();
      observers.set(key, function (entry) {
        return _this2.asyncScriptLoaderHandleLoad(entry);
      });
      SCRIPT_MAP.set(scriptURL, {
        loaded: false,
        observers: observers
      });

      var script = document.createElement("script");

      script.src = scriptURL;
      script.async = 1;

      var callObserverFuncAndRemoveObserver = function callObserverFuncAndRemoveObserver(func) {
        if (SCRIPT_MAP.has(scriptURL)) {
          var mapEntry = SCRIPT_MAP.get(scriptURL);
          var observersMap = mapEntry.observers;

          for (var _iterator = observersMap, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : (0, _getIterator3.default)(_iterator);;) {
            var _ref;

            if (_isArray) {
              if (_i >= _iterator.length) break;
              _ref = _iterator[_i++];
            } else {
              _i = _iterator.next();
              if (_i.done) break;
              _ref = _i.value;
            }

            var _ref2 = _ref,
                obsKey = _ref2[0],
                observer = _ref2[1];

            if (func(observer)) {
              observersMap.delete(obsKey);
            }
          }
        }
      };

      if (callbackName && typeof window !== "undefined") {
        window[callbackName] = AsyncScriptLoader.asyncScriptLoaderTriggerOnScriptLoaded;
      }

      script.onload = function () {
        var mapEntry = SCRIPT_MAP.get(scriptURL);
        if (mapEntry) {
          mapEntry.loaded = true;
          callObserverFuncAndRemoveObserver(function (observer) {
            if (callbackName) {
              return false;
            }
            observer(mapEntry);
            return true;
          });
        }
      };
      script.onerror = function (event) {
        var mapEntry = SCRIPT_MAP.get(scriptURL);
        if (mapEntry) {
          mapEntry.errored = true;
          callObserverFuncAndRemoveObserver(function (observer) {
            observer(mapEntry);
            return true;
          });
        }
      };

      // (old) MSIE browsers may call "onreadystatechange" instead of "onload"
      script.onreadystatechange = function () {
        if (_this2.readyState === "loaded") {
          // wait for other events, then call onload if default onload hadn't been called
          window.setTimeout(function () {
            var mapEntry = SCRIPT_MAP.get(scriptURL);
            if (mapEntry && mapEntry.loaded !== true) {
              script.onload();
            }
          }, 0);
        }
      };

      document.body.appendChild(script);
    };

    AsyncScriptLoader.prototype.asyncScriptLoaderHandleLoad = function asyncScriptLoaderHandleLoad(state) {
      this.setState(state, this.props.asyncScriptOnLoad);
    };

    AsyncScriptLoader.prototype.componentWillUnmount = function componentWillUnmount() {
      // Remove tag script
      if (options.removeOnUnmount === true) {
        var allScripts = document.getElementsByTagName("script");
        for (var i = 0; i < allScripts.length; i += 1) {
          if (allScripts[i].src.indexOf(scriptURL) > -1) {
            if (allScripts[i].parentNode) {
              allScripts[i].parentNode.removeChild(allScripts[i]);
            }
          }
        }
      }
      // Clean the observer entry
      var mapEntry = SCRIPT_MAP.get(scriptURL);
      if (mapEntry) {
        mapEntry.observers.delete(this.asyncScriptLoaderGetScriptLoaderID());
        if (options.removeOnUnmount === true) {
          SCRIPT_MAP.delete(scriptURL);
        }
      }
    };

    AsyncScriptLoader.prototype.render = function render() {
      var _this3 = this;

      var globalName = options.globalName;
      var _props = this.props,
          asyncScriptOnLoad = _props.asyncScriptOnLoad,
          childProps = (0, _objectWithoutProperties3.default)(_props, ["asyncScriptOnLoad"]);

      if (globalName && typeof window !== "undefined") {
        childProps[globalName] = typeof window[globalName] !== "undefined" ? window[globalName] : undefined;
      }
      return _react2.default.createElement(Component, (0, _extends3.default)({ ref: function ref(comp) {
          _this3.childComponent = comp;
        } }, childProps));
    };

    return AsyncScriptLoader;
  }(_react2.default.Component);

  AsyncScriptLoader.displayName = "AsyncScriptLoader(" + wrappedComponentName + ")";
  AsyncScriptLoader.propTypes = {
    asyncScriptOnLoad: _propTypes2.default.func
  };
  AsyncScriptLoader.asyncScriptLoaderTriggerOnScriptLoaded = function () {
    var mapEntry = SCRIPT_MAP.get(scriptURL);
    if (!mapEntry || !mapEntry.loaded) {
      throw new Error("Script is not loaded.");
    }
    for (var _iterator2 = mapEntry.observers.values(), _isArray2 = Array.isArray(_iterator2), _i2 = 0, _iterator2 = _isArray2 ? _iterator2 : (0, _getIterator3.default)(_iterator2);;) {
      var _ref3;

      if (_isArray2) {
        if (_i2 >= _iterator2.length) break;
        _ref3 = _iterator2[_i2++];
      } else {
        _i2 = _iterator2.next();
        if (_i2.done) break;
        _ref3 = _i2.value;
      }

      var observer = _ref3;

      observer(mapEntry);
    }
    delete window[options.callbackName];
  };

  if (options.exposeFuncs) {
    var _loop = function _loop() {
      if (_isArray3) {
        if (_i3 >= _iterator3.length) return "break";
        _ref4 = _iterator3[_i3++];
      } else {
        _i3 = _iterator3.next();
        if (_i3.done) return "break";
        _ref4 = _i3.value;
      }

      var funcToExpose = _ref4;

      /* eslint-disable no-loop-func */
      AsyncScriptLoader.prototype[funcToExpose] = function () {
        var _getComponent;

        return (_getComponent = this.getComponent())[funcToExpose].apply(_getComponent, arguments);
      };
      /* eslint-enable no-loop-func */
    };

    for (var _iterator3 = options.exposeFuncs, _isArray3 = Array.isArray(_iterator3), _i3 = 0, _iterator3 = _isArray3 ? _iterator3 : (0, _getIterator3.default)(_iterator3);;) {
      var _ref4;

      var _ret = _loop();

      if (_ret === "break") break;
    }
  }
  return AsyncScriptLoader;
}

/***/ }),

/***/ 555:
/***/ (function(module, exports, __webpack_require__) {

module.exports = { "default": __webpack_require__(556), __esModule: true };

/***/ }),

/***/ 556:
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(96);
__webpack_require__(60);
module.exports = __webpack_require__(557);


/***/ }),

/***/ 557:
/***/ (function(module, exports, __webpack_require__) {

var anObject = __webpack_require__(30);
var get = __webpack_require__(106);
module.exports = __webpack_require__(19).getIterator = function (it) {
  var iterFn = get(it);
  if (typeof iterFn != 'function') throw TypeError(it + ' is not iterable!');
  return anObject(iterFn.call(it));
};


/***/ }),

/***/ 558:
/***/ (function(module, exports, __webpack_require__) {

module.exports = { "default": __webpack_require__(559), __esModule: true };

/***/ }),

/***/ 559:
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(158);
__webpack_require__(60);
__webpack_require__(96);
__webpack_require__(560);
__webpack_require__(567);
__webpack_require__(570);
__webpack_require__(572);
module.exports = __webpack_require__(19).Map;


/***/ }),

/***/ 560:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var strong = __webpack_require__(561);
var validate = __webpack_require__(325);
var MAP = 'Map';

// 23.1 Map Objects
module.exports = __webpack_require__(563)(MAP, function (get) {
  return function Map() { return get(this, arguments.length > 0 ? arguments[0] : undefined); };
}, {
  // 23.1.3.6 Map.prototype.get(key)
  get: function get(key) {
    var entry = strong.getEntry(validate(this, MAP), key);
    return entry && entry.v;
  },
  // 23.1.3.9 Map.prototype.set(key, value)
  set: function set(key, value) {
    return strong.def(validate(this, MAP), key === 0 ? 0 : key, value);
  }
}, strong, true);


/***/ }),

/***/ 561:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var dP = __webpack_require__(26).f;
var create = __webpack_require__(61);
var redefineAll = __webpack_require__(323);
var ctx = __webpack_require__(33);
var anInstance = __webpack_require__(324);
var forOf = __webpack_require__(73);
var $iterDefine = __webpack_require__(94);
var step = __webpack_require__(154);
var setSpecies = __webpack_require__(562);
var DESCRIPTORS = __webpack_require__(28);
var fastKey = __webpack_require__(98).fastKey;
var validate = __webpack_require__(325);
var SIZE = DESCRIPTORS ? '_s' : 'size';

var getEntry = function (that, key) {
  // fast case
  var index = fastKey(key);
  var entry;
  if (index !== 'F') return that._i[index];
  // frozen object case
  for (entry = that._f; entry; entry = entry.n) {
    if (entry.k == key) return entry;
  }
};

module.exports = {
  getConstructor: function (wrapper, NAME, IS_MAP, ADDER) {
    var C = wrapper(function (that, iterable) {
      anInstance(that, C, NAME, '_i');
      that._t = NAME;         // collection type
      that._i = create(null); // index
      that._f = undefined;    // first entry
      that._l = undefined;    // last entry
      that[SIZE] = 0;         // size
      if (iterable != undefined) forOf(iterable, IS_MAP, that[ADDER], that);
    });
    redefineAll(C.prototype, {
      // 23.1.3.1 Map.prototype.clear()
      // 23.2.3.2 Set.prototype.clear()
      clear: function clear() {
        for (var that = validate(this, NAME), data = that._i, entry = that._f; entry; entry = entry.n) {
          entry.r = true;
          if (entry.p) entry.p = entry.p.n = undefined;
          delete data[entry.i];
        }
        that._f = that._l = undefined;
        that[SIZE] = 0;
      },
      // 23.1.3.3 Map.prototype.delete(key)
      // 23.2.3.4 Set.prototype.delete(value)
      'delete': function (key) {
        var that = validate(this, NAME);
        var entry = getEntry(that, key);
        if (entry) {
          var next = entry.n;
          var prev = entry.p;
          delete that._i[entry.i];
          entry.r = true;
          if (prev) prev.n = next;
          if (next) next.p = prev;
          if (that._f == entry) that._f = next;
          if (that._l == entry) that._l = prev;
          that[SIZE]--;
        } return !!entry;
      },
      // 23.2.3.6 Set.prototype.forEach(callbackfn, thisArg = undefined)
      // 23.1.3.5 Map.prototype.forEach(callbackfn, thisArg = undefined)
      forEach: function forEach(callbackfn /* , that = undefined */) {
        validate(this, NAME);
        var f = ctx(callbackfn, arguments.length > 1 ? arguments[1] : undefined, 3);
        var entry;
        while (entry = entry ? entry.n : this._f) {
          f(entry.v, entry.k, this);
          // revert to the last existing entry
          while (entry && entry.r) entry = entry.p;
        }
      },
      // 23.1.3.7 Map.prototype.has(key)
      // 23.2.3.7 Set.prototype.has(value)
      has: function has(key) {
        return !!getEntry(validate(this, NAME), key);
      }
    });
    if (DESCRIPTORS) dP(C.prototype, 'size', {
      get: function () {
        return validate(this, NAME)[SIZE];
      }
    });
    return C;
  },
  def: function (that, key, value) {
    var entry = getEntry(that, key);
    var prev, index;
    // change existing entry
    if (entry) {
      entry.v = value;
    // create new entry
    } else {
      that._l = entry = {
        i: index = fastKey(key, true), // <- index
        k: key,                        // <- key
        v: value,                      // <- value
        p: prev = that._l,             // <- previous entry
        n: undefined,                  // <- next entry
        r: false                       // <- removed
      };
      if (!that._f) that._f = entry;
      if (prev) prev.n = entry;
      that[SIZE]++;
      // add to index
      if (index !== 'F') that._i[index] = entry;
    } return that;
  },
  getEntry: getEntry,
  setStrong: function (C, NAME, IS_MAP) {
    // add .keys, .values, .entries, [@@iterator]
    // 23.1.3.4, 23.1.3.8, 23.1.3.11, 23.1.3.12, 23.2.3.5, 23.2.3.8, 23.2.3.10, 23.2.3.11
    $iterDefine(C, NAME, function (iterated, kind) {
      this._t = validate(iterated, NAME); // target
      this._k = kind;                     // kind
      this._l = undefined;                // previous
    }, function () {
      var that = this;
      var kind = that._k;
      var entry = that._l;
      // revert to the last existing entry
      while (entry && entry.r) entry = entry.p;
      // get next entry
      if (!that._t || !(that._l = entry = entry ? entry.n : that._t._f)) {
        // or finish the iteration
        that._t = undefined;
        return step(1);
      }
      // return step by kind
      if (kind == 'keys') return step(0, entry.k);
      if (kind == 'values') return step(0, entry.v);
      return step(0, [entry.k, entry.v]);
    }, IS_MAP ? 'entries' : 'values', !IS_MAP, true);

    // add [@@species], 23.1.2.2, 23.2.2.2
    setSpecies(NAME);
  }
};


/***/ }),

/***/ 562:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var global = __webpack_require__(25);
var core = __webpack_require__(19);
var dP = __webpack_require__(26);
var DESCRIPTORS = __webpack_require__(28);
var SPECIES = __webpack_require__(22)('species');

module.exports = function (KEY) {
  var C = typeof core[KEY] == 'function' ? core[KEY] : global[KEY];
  if (DESCRIPTORS && C && !C[SPECIES]) dP.f(C, SPECIES, {
    configurable: true,
    get: function () { return this; }
  });
};


/***/ }),

/***/ 563:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var global = __webpack_require__(25);
var $export = __webpack_require__(21);
var meta = __webpack_require__(98);
var fails = __webpack_require__(37);
var hide = __webpack_require__(29);
var redefineAll = __webpack_require__(323);
var forOf = __webpack_require__(73);
var anInstance = __webpack_require__(324);
var isObject = __webpack_require__(27);
var setToStringTag = __webpack_require__(62);
var dP = __webpack_require__(26).f;
var each = __webpack_require__(564)(0);
var DESCRIPTORS = __webpack_require__(28);

module.exports = function (NAME, wrapper, methods, common, IS_MAP, IS_WEAK) {
  var Base = global[NAME];
  var C = Base;
  var ADDER = IS_MAP ? 'set' : 'add';
  var proto = C && C.prototype;
  var O = {};
  if (!DESCRIPTORS || typeof C != 'function' || !(IS_WEAK || proto.forEach && !fails(function () {
    new C().entries().next();
  }))) {
    // create collection constructor
    C = common.getConstructor(wrapper, NAME, IS_MAP, ADDER);
    redefineAll(C.prototype, methods);
    meta.NEED = true;
  } else {
    C = wrapper(function (target, iterable) {
      anInstance(target, C, NAME, '_c');
      target._c = new Base();
      if (iterable != undefined) forOf(iterable, IS_MAP, target[ADDER], target);
    });
    each('add,clear,delete,forEach,get,has,set,keys,values,entries,toJSON'.split(','), function (KEY) {
      var IS_ADDER = KEY == 'add' || KEY == 'set';
      if (KEY in proto && !(IS_WEAK && KEY == 'clear')) hide(C.prototype, KEY, function (a, b) {
        anInstance(this, C, KEY);
        if (!IS_ADDER && IS_WEAK && !isObject(a)) return KEY == 'get' ? undefined : false;
        var result = this._c[KEY](a === 0 ? 0 : a, b);
        return IS_ADDER ? this : result;
      });
    });
    IS_WEAK || dP(C.prototype, 'size', {
      get: function () {
        return this._c.size;
      }
    });
  }

  setToStringTag(C, NAME);

  O[NAME] = C;
  $export($export.G + $export.W + $export.F, O);

  if (!IS_WEAK) common.setStrong(C, NAME, IS_MAP);

  return C;
};


/***/ }),

/***/ 564:
/***/ (function(module, exports, __webpack_require__) {

// 0 -> Array#forEach
// 1 -> Array#map
// 2 -> Array#filter
// 3 -> Array#some
// 4 -> Array#every
// 5 -> Array#find
// 6 -> Array#findIndex
var ctx = __webpack_require__(33);
var IObject = __webpack_require__(85);
var toObject = __webpack_require__(59);
var toLength = __webpack_require__(57);
var asc = __webpack_require__(565);
module.exports = function (TYPE, $create) {
  var IS_MAP = TYPE == 1;
  var IS_FILTER = TYPE == 2;
  var IS_SOME = TYPE == 3;
  var IS_EVERY = TYPE == 4;
  var IS_FIND_INDEX = TYPE == 6;
  var NO_HOLES = TYPE == 5 || IS_FIND_INDEX;
  var create = $create || asc;
  return function ($this, callbackfn, that) {
    var O = toObject($this);
    var self = IObject(O);
    var f = ctx(callbackfn, that, 3);
    var length = toLength(self.length);
    var index = 0;
    var result = IS_MAP ? create($this, length) : IS_FILTER ? create($this, 0) : undefined;
    var val, res;
    for (;length > index; index++) if (NO_HOLES || index in self) {
      val = self[index];
      res = f(val, index, O);
      if (TYPE) {
        if (IS_MAP) result[index] = res;   // map
        else if (res) switch (TYPE) {
          case 3: return true;             // some
          case 5: return val;              // find
          case 6: return index;            // findIndex
          case 2: result.push(val);        // filter
        } else if (IS_EVERY) return false; // every
      }
    }
    return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : result;
  };
};


/***/ }),

/***/ 565:
/***/ (function(module, exports, __webpack_require__) {

// 9.4.2.3 ArraySpeciesCreate(originalArray, length)
var speciesConstructor = __webpack_require__(566);

module.exports = function (original, length) {
  return new (speciesConstructor(original))(length);
};


/***/ }),

/***/ 566:
/***/ (function(module, exports, __webpack_require__) {

var isObject = __webpack_require__(27);
var isArray = __webpack_require__(155);
var SPECIES = __webpack_require__(22)('species');

module.exports = function (original) {
  var C;
  if (isArray(original)) {
    C = original.constructor;
    // cross-realm fallback
    if (typeof C == 'function' && (C === Array || isArray(C.prototype))) C = undefined;
    if (isObject(C)) {
      C = C[SPECIES];
      if (C === null) C = undefined;
    }
  } return C === undefined ? Array : C;
};


/***/ }),

/***/ 567:
/***/ (function(module, exports, __webpack_require__) {

// https://github.com/DavidBruant/Map-Set.prototype.toJSON
var $export = __webpack_require__(21);

$export($export.P + $export.R, 'Map', { toJSON: __webpack_require__(568)('Map') });


/***/ }),

/***/ 568:
/***/ (function(module, exports, __webpack_require__) {

// https://github.com/DavidBruant/Map-Set.prototype.toJSON
var classof = __webpack_require__(171);
var from = __webpack_require__(569);
module.exports = function (NAME) {
  return function toJSON() {
    if (classof(this) != NAME) throw TypeError(NAME + "#toJSON isn't generic");
    return from(this);
  };
};


/***/ }),

/***/ 569:
/***/ (function(module, exports, __webpack_require__) {

var forOf = __webpack_require__(73);

module.exports = function (iter, ITERATOR) {
  var result = [];
  forOf(iter, false, result.push, result, ITERATOR);
  return result;
};


/***/ }),

/***/ 570:
/***/ (function(module, exports, __webpack_require__) {

// https://tc39.github.io/proposal-setmap-offrom/#sec-map.of
__webpack_require__(571)('Map');


/***/ }),

/***/ 571:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

// https://tc39.github.io/proposal-setmap-offrom/
var $export = __webpack_require__(21);

module.exports = function (COLLECTION) {
  $export($export.S, COLLECTION, { of: function of() {
    var length = arguments.length;
    var A = new Array(length);
    while (length--) A[length] = arguments[length];
    return new this(A);
  } });
};


/***/ }),

/***/ 572:
/***/ (function(module, exports, __webpack_require__) {

// https://tc39.github.io/proposal-setmap-offrom/#sec-map.from
__webpack_require__(573)('Map');


/***/ }),

/***/ 573:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

// https://tc39.github.io/proposal-setmap-offrom/
var $export = __webpack_require__(21);
var aFunction = __webpack_require__(149);
var ctx = __webpack_require__(33);
var forOf = __webpack_require__(73);

module.exports = function (COLLECTION) {
  $export($export.S, COLLECTION, { from: function from(source /* , mapFn, thisArg */) {
    var mapFn = arguments[1];
    var mapping, A, n, cb;
    aFunction(this);
    mapping = mapFn !== undefined;
    if (mapping) aFunction(mapFn);
    if (source == undefined) return new this();
    A = [];
    if (mapping) {
      n = 0;
      cb = ctx(mapFn, arguments[2], 2);
      forOf(source, false, function (nextItem) {
        A.push(cb(nextItem, n++));
      });
    } else {
      forOf(source, false, A.push, A);
    }
    return new this(A);
  } });
};


/***/ }),

/***/ 574:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
var _jsxFileName = '/Users/timteoh/TimCode/pulangmengundi/resources/assets/js/components/Carpool.js';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _reactDom = __webpack_require__(10);

var _reactDom2 = _interopRequireDefault(_reactDom);

var _api = __webpack_require__(24);

var _api2 = _interopRequireDefault(_api);

var _reactBootstrap = __webpack_require__(13);

var _CarpoolOffer = __webpack_require__(131);

var _CarpoolOffer2 = _interopRequireDefault(_CarpoolOffer);

var _CarpoolNeed = __webpack_require__(132);

var _CarpoolNeed2 = _interopRequireDefault(_CarpoolNeed);

var _ContactModal = __webpack_require__(133);

var _ContactModal2 = _interopRequireDefault(_ContactModal);

var _StateSelection = __webpack_require__(575);

var _StateSelection2 = _interopRequireDefault(_StateSelection);

var _Progress = __webpack_require__(576);

var _Progress2 = _interopRequireDefault(_Progress);

var _reactIntl = __webpack_require__(17);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Carpool = function (_Component) {
  _inherits(Carpool, _Component);

  function Carpool(props) {
    _classCallCheck(this, Carpool);

    var _this = _possibleConstructorReturn(this, (Carpool.__proto__ || Object.getPrototypeOf(Carpool)).call(this, props));

    _this.state = {
      offers: [],
      needs: [],
      selectedStateFrom: null,
      selectedStateTo: null,
      showContactModal: false,
      selectedUser: {},
      needCount: null,
      offerCount: null,
      isLoading: false
    };
    _this.handleStateFromChange = _this.handleStateFromChange.bind(_this);
    _this.handleStateToChange = _this.handleStateToChange.bind(_this);
    _this.handleContactUser = _this.handleContactUser.bind(_this);
    _this.resetSelectedStateFrom = _this.resetSelectedStateFrom.bind(_this);
    _this.resetSelectedStateTo = _this.resetSelectedStateTo.bind(_this);
    _this.doSearch = _this.doSearch.bind(_this);
    return _this;
  }

  _createClass(Carpool, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      this.doSearch();
    }
  }, {
    key: 'doSearch',
    value: function doSearch() {
      var _this2 = this;

      this.setState({
        isLoading: true
      }, function () {
        _this2.getOffers().then(function (_ref) {
          var offers = _ref.offers,
              meta = _ref.meta;

          var offerCount = meta.count;
          _this2.getNeeds().then(function (_ref2) {
            var needs = _ref2.needs,
                meta = _ref2.meta;

            _this2.setState({
              offers: offers,
              offerCount: offerCount,
              needs: needs,
              needCount: meta.count,
              isLoading: false
            });
          });
        });
      });
    }
  }, {
    key: 'getOffers',
    value: function getOffers() {
      var params = {
        state_from: this.state.selectedStateFrom,
        state_to: this.state.selectedStateTo
      };
      return _api2.default.getAllOffers(params).then(function (response) {
        return response.data;
      });
    }
  }, {
    key: 'getNeeds',
    value: function getNeeds() {
      var params = {
        state_from: this.state.selectedStateFrom,
        state_to: this.state.selectedStateTo
      };
      return _api2.default.getAllNeeds(params).then(function (response) {
        return response.data;
      });
    }
  }, {
    key: 'handleStateFromChange',
    value: function handleStateFromChange(state) {
      var _this3 = this;

      this.setState({
        selectedStateFrom: state ? state.name : null
      }, function () {
        if (_this3.state.selectedStateFrom || _this3.state.selectedStateTo) {
          _this3.doSearch();
        }
      });
    }
  }, {
    key: 'handleStateToChange',
    value: function handleStateToChange(state) {
      var _this4 = this;

      this.setState({
        selectedStateTo: state ? state.name : null
      }, function () {
        if (_this4.state.selectedStateFrom || _this4.state.selectedStateTo) {
          _this4.doSearch();
        }
      });
    }
  }, {
    key: 'handleContactUser',
    value: function handleContactUser(user) {
      if (!window.user) {
        location.href = '/login';
      }

      this.setState({
        selectedUser: user,
        showContactModal: true
      });
    }
  }, {
    key: 'resetSelectedStateFrom',
    value: function resetSelectedStateFrom() {
      var _this5 = this;

      this.setState({
        selectedStateFrom: null
      }, function () {
        _this5.doSearch();
      });
    }
  }, {
    key: 'resetSelectedStateTo',
    value: function resetSelectedStateTo() {
      var _this6 = this;

      this.setState({
        selectedStateTo: null
      }, function () {
        _this6.doSearch();
      });
    }
  }, {
    key: 'render',
    value: function render() {
      var _this7 = this;

      return _react2.default.createElement(
        'div',
        _defineProperty({
          __source: {
            fileName: _jsxFileName,
            lineNumber: 127
          },
          __self: this
        }, '__self', this),
        _react2.default.createElement(
          _reactBootstrap.Jumbotron,
          _defineProperty({
            __source: {
              fileName: _jsxFileName,
              lineNumber: 128
            },
            __self: this
          }, '__self', this),
          _react2.default.createElement(
            _reactBootstrap.Row,
            _defineProperty({
              __source: {
                fileName: _jsxFileName,
                lineNumber: 129
              },
              __self: this
            }, '__self', this),
            _react2.default.createElement(
              _reactBootstrap.Col,
              _defineProperty({ md: 2, mdOffset: 0, smOffset: 4, sm: 4, xs: 12, xsOffset: 2, __source: {
                  fileName: _jsxFileName,
                  lineNumber: 130
                },
                __self: this
              }, '__self', this),
              _react2.default.createElement(
                'div',
                _defineProperty({
                  __source: {
                    fileName: _jsxFileName,
                    lineNumber: 131
                  },
                  __self: this
                }, '__self', this),
                _react2.default.createElement(_reactBootstrap.Image, _defineProperty({ style: { marginTop: '20px' }, src: '/img/car.png', responsive: true, __source: {
                    fileName: _jsxFileName,
                    lineNumber: 132
                  },
                  __self: this
                }, '__self', this))
              )
            ),
            _react2.default.createElement(
              _reactBootstrap.Col,
              _defineProperty({ md: 9, xs: 12, __source: {
                  fileName: _jsxFileName,
                  lineNumber: 135
                },
                __self: this
              }, '__self', this),
              _react2.default.createElement(
                'h3',
                _defineProperty({
                  __source: {
                    fileName: _jsxFileName,
                    lineNumber: 136
                  },
                  __self: this
                }, '__self', this),
                '#PulangMengundi #CarpoolGE14'
              ),
              _react2.default.createElement(
                'p',
                _defineProperty({
                  __source: {
                    fileName: _jsxFileName,
                    lineNumber: 137
                  },
                  __self: this
                }, '__self', this),
                _react2.default.createElement(_reactIntl.FormattedMessage, _defineProperty({
                  id: 'home.jumbotron',
                  defaultMessage: 'Going back to vote? Split the cost, make new friends. Use our tool to match with voters going in the same direction to #pulangmengundi!',
                  __source: {
                    fileName: _jsxFileName,
                    lineNumber: 138
                  },
                  __self: this
                }, '__self', this))
              ),
              _react2.default.createElement(
                _reactBootstrap.Grid,
                _defineProperty({ fluid: true, __source: {
                    fileName: _jsxFileName,
                    lineNumber: 143
                  },
                  __self: this
                }, '__self', this),
                _react2.default.createElement(
                  _reactBootstrap.Row,
                  _defineProperty({
                    __source: {
                      fileName: _jsxFileName,
                      lineNumber: 144
                    },
                    __self: this
                  }, '__self', this),
                  _react2.default.createElement(
                    _reactBootstrap.Col,
                    _defineProperty({ md: 5, xsHidden: true, __source: {
                        fileName: _jsxFileName,
                        lineNumber: 145
                      },
                      __self: this
                    }, '__self', this),
                    _react2.default.createElement(
                      _reactBootstrap.Button,
                      _defineProperty({ bsSize: 'large', bsStyle: 'default', href: '/offer', __source: {
                          fileName: _jsxFileName,
                          lineNumber: 146
                        },
                        __self: this
                      }, '__self', this),
                      _react2.default.createElement(_reactIntl.FormattedMessage, _defineProperty({
                        id: 'home.driver-btn',
                        defaultMessage: '(Driver) I want to offer a carpool',
                        __source: {
                          fileName: _jsxFileName,
                          lineNumber: 147
                        },
                        __self: this
                      }, '__self', this))
                    )
                  ),
                  _react2.default.createElement(
                    _reactBootstrap.Col,
                    _defineProperty({ md: 5, mdOffset: 1, xsHidden: true, __source: {
                        fileName: _jsxFileName,
                        lineNumber: 153
                      },
                      __self: this
                    }, '__self', this),
                    _react2.default.createElement(
                      _reactBootstrap.Button,
                      _defineProperty({ bsSize: 'large', bsStyle: 'default', href: '/need', __source: {
                          fileName: _jsxFileName,
                          lineNumber: 154
                        },
                        __self: this
                      }, '__self', this),
                      _react2.default.createElement(_reactIntl.FormattedMessage, _defineProperty({
                        id: 'home.rider-btn',
                        defaultMessage: '(Rider) I am looking for a carpool',
                        __source: {
                          fileName: _jsxFileName,
                          lineNumber: 155
                        },
                        __self: this
                      }, '__self', this))
                    )
                  ),
                  _react2.default.createElement(
                    _reactBootstrap.Col,
                    _defineProperty({ lgHidden: true, mdHidden: true, smHidden: true, xsOffset: 1, xs: 8, __source: {
                        fileName: _jsxFileName,
                        lineNumber: 161
                      },
                      __self: this
                    }, '__self', this),
                    _react2.default.createElement(
                      _reactBootstrap.Button,
                      _defineProperty({ bsStyle: 'default', href: '/offer', __source: {
                          fileName: _jsxFileName,
                          lineNumber: 162
                        },
                        __self: this
                      }, '__self', this),
                      _react2.default.createElement(_reactIntl.FormattedHTMLMessage, _defineProperty({
                        id: 'home.driver-btn-small',
                        defaultMessage: '(Driver)<br /> I want to offer a carpool',
                        __source: {
                          fileName: _jsxFileName,
                          lineNumber: 163
                        },
                        __self: this
                      }, '__self', this))
                    ),
                    _react2.default.createElement('br', _defineProperty({
                      __source: {
                        fileName: _jsxFileName,
                        lineNumber: 168
                      },
                      __self: this
                    }, '__self', this)),
                    _react2.default.createElement('br', _defineProperty({
                      __source: {
                        fileName: _jsxFileName,
                        lineNumber: 169
                      },
                      __self: this
                    }, '__self', this)),
                    _react2.default.createElement(
                      _reactBootstrap.Button,
                      _defineProperty({ bsStyle: 'default', href: '/need', __source: {
                          fileName: _jsxFileName,
                          lineNumber: 170
                        },
                        __self: this
                      }, '__self', this),
                      _react2.default.createElement(_reactIntl.FormattedHTMLMessage, _defineProperty({
                        id: 'home.rider-btn-small',
                        defaultMessage: '(Rider)<br /> I am looking for a carpool',
                        __source: {
                          fileName: _jsxFileName,
                          lineNumber: 171
                        },
                        __self: this
                      }, '__self', this))
                    )
                  )
                ),
                _react2.default.createElement(
                  _reactBootstrap.Row,
                  _defineProperty({
                    __source: {
                      fileName: _jsxFileName,
                      lineNumber: 178
                    },
                    __self: this
                  }, '__self', this),
                  _react2.default.createElement(
                    _reactBootstrap.Col,
                    _defineProperty({
                      __source: {
                        fileName: _jsxFileName,
                        lineNumber: 179
                      },
                      __self: this
                    }, '__self', this),
                    _react2.default.createElement('br', _defineProperty({
                      __source: {
                        fileName: _jsxFileName,
                        lineNumber: 180
                      },
                      __self: this
                    }, '__self', this)),
                    _react2.default.createElement(
                      _reactBootstrap.Alert,
                      _defineProperty({ bsStyle: 'info', __source: {
                          fileName: _jsxFileName,
                          lineNumber: 181
                        },
                        __self: this
                      }, '__self', this),
                      _react2.default.createElement(
                        'h4',
                        _defineProperty({
                          __source: {
                            fileName: _jsxFileName,
                            lineNumber: 182
                          },
                          __self: this
                        }, '__self', this),
                        'Updates'
                      ),
                      _react2.default.createElement(
                        'ul',
                        _defineProperty({
                          __source: {
                            fileName: _jsxFileName,
                            lineNumber: 183
                          },
                          __self: this
                        }, '__self', this),
                        _react2.default.createElement(
                          'li',
                          _defineProperty({
                            __source: {
                              fileName: _jsxFileName,
                              lineNumber: 184
                            },
                            __self: this
                          }, '__self', this),
                          'Sun 10am: We are starting to send emails to notify riders/drivers of potential matches.'
                        ),
                        _react2.default.createElement(
                          'li',
                          _defineProperty({
                            __source: {
                              fileName: _jsxFileName,
                              lineNumber: 185
                            },
                            __self: this
                          }, '__self', this),
                          'Sat 5pm: You can now mark your listing as fulfilled, or cancel it. Please do so as it helps improve our system.'
                        ),
                        _react2.default.createElement(
                          'li',
                          _defineProperty({
                            __source: {
                              fileName: _jsxFileName,
                              lineNumber: 186
                            },
                            __self: this
                          }, '__self', this),
                          'Sat 12am: You can now choose to fill in your ',
                          _react2.default.createElement(
                            'strong',
                            _defineProperty({
                              __source: {
                                fileName: _jsxFileName,
                                lineNumber: 186
                              },
                              __self: this
                            }, '__self', this),
                            'contact number'
                          ),
                          ' to be shown to others. (Drivers may need to cancel and re-post for this to be reflected)'
                        )
                      )
                    )
                  )
                )
              )
            )
          )
        ),
        _react2.default.createElement(
          _reactBootstrap.Grid,
          _defineProperty({ fluid: true, __source: {
              fileName: _jsxFileName,
              lineNumber: 195
            },
            __self: this
          }, '__self', this),
          _react2.default.createElement(
            _reactBootstrap.Row,
            _defineProperty({
              __source: {
                fileName: _jsxFileName,
                lineNumber: 196
              },
              __self: this
            }, '__self', this),
            _react2.default.createElement(
              _reactBootstrap.Col,
              _defineProperty({ md: 4, mdOffset: 1, __source: {
                  fileName: _jsxFileName,
                  lineNumber: 197
                },
                __self: this
              }, '__self', this),
              _react2.default.createElement(
                _reactBootstrap.Panel,
                _defineProperty({
                  __source: {
                    fileName: _jsxFileName,
                    lineNumber: 198
                  },
                  __self: this
                }, '__self', this),
                _react2.default.createElement(
                  _reactBootstrap.Panel.Heading,
                  _defineProperty({
                    __source: {
                      fileName: _jsxFileName,
                      lineNumber: 199
                    },
                    __self: this
                  }, '__self', this),
                  _react2.default.createElement(_reactIntl.FormattedMessage, _defineProperty({
                    id: 'home.btn-search-from',
                    defaultMessage: 'Choose where you are starting from',
                    __source: {
                      fileName: _jsxFileName,
                      lineNumber: 200
                    },
                    __self: this
                  }, '__self', this))
                ),
                _react2.default.createElement(
                  _reactBootstrap.Panel.Body,
                  _defineProperty({
                    __source: {
                      fileName: _jsxFileName,
                      lineNumber: 205
                    },
                    __self: this
                  }, '__self', this),
                  _react2.default.createElement(_StateSelection2.default, _defineProperty({
                    title: 'State:',
                    selectedState: this.state.selectedStateFrom,
                    onChange: this.handleStateFromChange,
                    __source: {
                      fileName: _jsxFileName,
                      lineNumber: 206
                    },
                    __self: this
                  }, '__self', this)),
                  this.state.selectedStateFrom && _react2.default.createElement(
                    _reactBootstrap.Button,
                    _defineProperty({ bsStyle: 'link', onClick: this.resetSelectedStateFrom, __source: {
                        fileName: _jsxFileName,
                        lineNumber: 212
                      },
                      __self: this
                    }, '__self', this),
                    _react2.default.createElement(_reactIntl.FormattedMessage, _defineProperty({
                      id: 'home.btn-search-clear',
                      defaultMessage: 'Clear',
                      __source: {
                        fileName: _jsxFileName,
                        lineNumber: 213
                      },
                      __self: this
                    }, '__self', this))
                  )
                )
              )
            ),
            _react2.default.createElement(
              _reactBootstrap.Col,
              _defineProperty({ md: 4, __source: {
                  fileName: _jsxFileName,
                  lineNumber: 222
                },
                __self: this
              }, '__self', this),
              _react2.default.createElement(
                _reactBootstrap.Panel,
                _defineProperty({
                  __source: {
                    fileName: _jsxFileName,
                    lineNumber: 223
                  },
                  __self: this
                }, '__self', this),
                _react2.default.createElement(
                  _reactBootstrap.Panel.Heading,
                  _defineProperty({
                    __source: {
                      fileName: _jsxFileName,
                      lineNumber: 224
                    },
                    __self: this
                  }, '__self', this),
                  _react2.default.createElement(_reactIntl.FormattedMessage, _defineProperty({
                    id: 'home.btn-search-to',
                    defaultMessage: 'Choose where you are going to',
                    __source: {
                      fileName: _jsxFileName,
                      lineNumber: 225
                    },
                    __self: this
                  }, '__self', this))
                ),
                _react2.default.createElement(
                  _reactBootstrap.Panel.Body,
                  _defineProperty({
                    __source: {
                      fileName: _jsxFileName,
                      lineNumber: 230
                    },
                    __self: this
                  }, '__self', this),
                  _react2.default.createElement(_StateSelection2.default, _defineProperty({
                    title: 'State:',
                    selectedState: this.state.selectedStateTo,
                    onChange: this.handleStateToChange,
                    __source: {
                      fileName: _jsxFileName,
                      lineNumber: 231
                    },
                    __self: this
                  }, '__self', this)),
                  this.state.selectedStateTo && _react2.default.createElement(
                    _reactBootstrap.Button,
                    _defineProperty({ bsStyle: 'link', onClick: this.resetSelectedStateTo, __source: {
                        fileName: _jsxFileName,
                        lineNumber: 237
                      },
                      __self: this
                    }, '__self', this),
                    _react2.default.createElement(_reactIntl.FormattedMessage, _defineProperty({
                      id: 'home.btn-search-clear',
                      defaultMessage: 'Clear',
                      __source: {
                        fileName: _jsxFileName,
                        lineNumber: 238
                      },
                      __self: this
                    }, '__self', this))
                  )
                )
              )
            )
          )
        ),
        _react2.default.createElement(
          _reactBootstrap.Grid,
          _defineProperty({ fluid: true, __source: {
              fileName: _jsxFileName,
              lineNumber: 249
            },
            __self: this
          }, '__self', this),
          _react2.default.createElement(
            _reactBootstrap.Row,
            _defineProperty({
              __source: {
                fileName: _jsxFileName,
                lineNumber: 250
              },
              __self: this
            }, '__self', this),
            _react2.default.createElement(
              _reactBootstrap.Col,
              _defineProperty({ md: 6, __source: {
                  fileName: _jsxFileName,
                  lineNumber: 251
                },
                __self: this
              }, '__self', this),
              _react2.default.createElement(
                _reactBootstrap.Panel,
                _defineProperty({ bsStyle: 'primary', __source: {
                    fileName: _jsxFileName,
                    lineNumber: 252
                  },
                  __self: this
                }, '__self', this),
                _react2.default.createElement(
                  _reactBootstrap.Panel.Heading,
                  _defineProperty({
                    __source: {
                      fileName: _jsxFileName,
                      lineNumber: 253
                    },
                    __self: this
                  }, '__self', this),
                  _react2.default.createElement(
                    'h3',
                    _defineProperty({
                      __source: {
                        fileName: _jsxFileName,
                        lineNumber: 254
                      },
                      __self: this
                    }, '__self', this),
                    this.state.offerCount,
                    '\xA0',
                    _react2.default.createElement(_reactIntl.FormattedMessage, _defineProperty({
                      id: 'home.driver-counter',
                      defaultMessage: 'Drivers offering carpools',
                      __source: {
                        fileName: _jsxFileName,
                        lineNumber: 255
                      },
                      __self: this
                    }, '__self', this))
                  )
                ),
                _react2.default.createElement(
                  _reactBootstrap.Panel.Body,
                  _defineProperty({
                    __source: {
                      fileName: _jsxFileName,
                      lineNumber: 261
                    },
                    __self: this
                  }, '__self', this),
                  this.state.isLoading && _react2.default.createElement(_Progress2.default, _defineProperty({
                    __source: {
                      fileName: _jsxFileName,
                      lineNumber: 262
                    },
                    __self: this
                  }, '__self', this)),
                  !this.state.isLoading && this.state.offers && this.state.offers.length > 0 && this.state.offers.map(function (offer) {
                    return _react2.default.createElement(_CarpoolOffer2.default, _defineProperty({ offer: offer, key: offer.id, onContact: _this7.handleContactUser, __source: {
                        fileName: _jsxFileName,
                        lineNumber: 267
                      },
                      __self: _this7
                    }, '__self', _this7));
                  }),
                  !this.state.isLoading && this.state.offers && this.state.offers.length == 0 && _react2.default.createElement(
                    _reactBootstrap.Alert,
                    _defineProperty({ bsStyle: 'info', __source: {
                        fileName: _jsxFileName,
                        lineNumber: 273
                      },
                      __self: this
                    }, '__self', this),
                    _react2.default.createElement(_reactIntl.FormattedMessage, _defineProperty({
                      id: 'match.no-results',
                      defaultMessage: 'No results found',
                      __source: {
                        fileName: _jsxFileName,
                        lineNumber: 274
                      },
                      __self: this
                    }, '__self', this))
                  )
                )
              )
            ),
            _react2.default.createElement(
              _reactBootstrap.Col,
              _defineProperty({ md: 6, __source: {
                  fileName: _jsxFileName,
                  lineNumber: 283
                },
                __self: this
              }, '__self', this),
              _react2.default.createElement(
                _reactBootstrap.Panel,
                _defineProperty({ bsStyle: 'primary', __source: {
                    fileName: _jsxFileName,
                    lineNumber: 284
                  },
                  __self: this
                }, '__self', this),
                _react2.default.createElement(
                  _reactBootstrap.Panel.Heading,
                  _defineProperty({ bsStyle: 'primary', __source: {
                      fileName: _jsxFileName,
                      lineNumber: 285
                    },
                    __self: this
                  }, '__self', this),
                  _react2.default.createElement(
                    'h3',
                    _defineProperty({
                      __source: {
                        fileName: _jsxFileName,
                        lineNumber: 286
                      },
                      __self: this
                    }, '__self', this),
                    this.state.needCount,
                    '\xA0',
                    _react2.default.createElement(_reactIntl.FormattedMessage, _defineProperty({
                      id: 'home.rider-counter',
                      defaultMessage: 'Riders looking for carpools',
                      __source: {
                        fileName: _jsxFileName,
                        lineNumber: 287
                      },
                      __self: this
                    }, '__self', this))
                  )
                ),
                _react2.default.createElement(
                  _reactBootstrap.Panel.Body,
                  _defineProperty({
                    __source: {
                      fileName: _jsxFileName,
                      lineNumber: 293
                    },
                    __self: this
                  }, '__self', this),
                  this.state.isLoading && _react2.default.createElement(_Progress2.default, _defineProperty({
                    __source: {
                      fileName: _jsxFileName,
                      lineNumber: 294
                    },
                    __self: this
                  }, '__self', this)),
                  !this.state.isLoading && this.state.needs && this.state.needs.length > 0 && this.state.needs.map(function (need) {
                    return _react2.default.createElement(_CarpoolNeed2.default, _defineProperty({ need: need, key: need.id, onContact: _this7.handleContactUser, __source: {
                        fileName: _jsxFileName,
                        lineNumber: 299
                      },
                      __self: _this7
                    }, '__self', _this7));
                  }),
                  !this.state.isLoading && this.state.needs && this.state.needs.length == 0 && _react2.default.createElement(
                    _reactBootstrap.Alert,
                    _defineProperty({ bsStyle: 'info', __source: {
                        fileName: _jsxFileName,
                        lineNumber: 305
                      },
                      __self: this
                    }, '__self', this),
                    _react2.default.createElement(_reactIntl.FormattedMessage, _defineProperty({
                      id: 'match.no-results',
                      defaultMessage: 'No results found',
                      __source: {
                        fileName: _jsxFileName,
                        lineNumber: 306
                      },
                      __self: this
                    }, '__self', this))
                  )
                )
              )
            )
          )
        ),
        this.state.showContactModal && _react2.default.createElement(_ContactModal2.default, _defineProperty({ show: this.state.showContactModal, user: this.state.selectedUser, onCancel: function onCancel(e) {
            return _this7.setState({ showContactModal: false, selectedUser: {} });
          }, __source: {
            fileName: _jsxFileName,
            lineNumber: 318
          },
          __self: this
        }, '__self', this)),
        _react2.default.createElement('script', _defineProperty({ src: 'https://cdnjs.cloudflare.com/ajax/libs/animejs/2.0.2/anime.min.js', __source: {
            fileName: _jsxFileName,
            lineNumber: 320
          },
          __self: this
        }, '__self', this))
      );
    }
  }]);

  return Carpool;
}(_react.Component);

exports.default = Carpool;

/***/ }),

/***/ 575:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
var _jsxFileName = '/Users/timteoh/TimCode/pulangmengundi/resources/assets/js/components/StateSelection.js';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _reactDom = __webpack_require__(10);

var _reactDom2 = _interopRequireDefault(_reactDom);

var _api = __webpack_require__(24);

var _api2 = _interopRequireDefault(_api);

var _reactBootstrap = __webpack_require__(13);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var StateSelection = function (_Component) {
  _inherits(StateSelection, _Component);

  function StateSelection(props) {
    _classCallCheck(this, StateSelection);

    var _this = _possibleConstructorReturn(this, (StateSelection.__proto__ || Object.getPrototypeOf(StateSelection)).call(this, props));

    _this.state = {
      states: null,
      selectedState: null
    };
    _this.handleStateSelect = _this.handleStateSelect.bind(_this);
    return _this;
  }

  _createClass(StateSelection, [{
    key: 'componentWillUpdate',
    value: function componentWillUpdate(nextProps) {
      // console.log(nextProps)
      if (nextProps.selectedState != this.state.selectedState && nextProps.selectedState == null && this.state.selectedState !== null) {
        this.setState({
          selectedState: nextProps.selectedState
        });
      }
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this2 = this;

      _api2.default.getStates().then(function (_ref) {
        var states = _ref.states;

        _this2.setState({
          states: states
        });
      });
    }
  }, {
    key: 'handleStateSelect',
    value: function handleStateSelect(selectedState, callback) {
      var _this3 = this;

      this.setState({
        selectedState: selectedState
      }, function () {
        _this3.props.onChange(selectedState);
      });
    }
  }, {
    key: 'render',
    value: function render() {
      var _this4 = this;

      var defaultTitle = this.props.title || 'State:';
      return _react2.default.createElement(
        'span',
        _defineProperty({
          __source: {
            fileName: _jsxFileName,
            lineNumber: 45
          },
          __self: this
        }, '__self', this),
        _react2.default.createElement(
          _reactBootstrap.DropdownButton,
          _defineProperty({ title: this.state.selectedState ? this.state.selectedState.name : defaultTitle, id: 'location-select', __source: {
              fileName: _jsxFileName,
              lineNumber: 46
            },
            __self: this
          }, '__self', this),
          this.state.states && this.state.states.map(function (state, i) {
            return _react2.default.createElement(
              _reactBootstrap.MenuItem,
              _defineProperty({
                key: i,
                onClick: function onClick(e) {
                  return _this4.handleStateSelect(state);
                },
                __source: {
                  fileName: _jsxFileName,
                  lineNumber: 52
                },
                __self: _this4
              }, '__self', _this4),
              state.name
            );
          })
        )
      );
    }
  }]);

  return StateSelection;
}(_react.Component);

exports.default = StateSelection;

/***/ }),

/***/ 576:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
var _jsxFileName = '/Users/timteoh/TimCode/pulangmengundi/resources/assets/js/components/Progress.js';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _reactDom = __webpack_require__(10);

var _reactDom2 = _interopRequireDefault(_reactDom);

var _reactBootstrap = __webpack_require__(13);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Progress = function (_Component) {
  _inherits(Progress, _Component);

  function Progress() {
    _classCallCheck(this, Progress);

    return _possibleConstructorReturn(this, (Progress.__proto__ || Object.getPrototypeOf(Progress)).apply(this, arguments));
  }

  _createClass(Progress, [{
    key: 'render',
    value: function render() {
      return _react2.default.createElement(
        _reactBootstrap.Row,
        _defineProperty({
          __source: {
            fileName: _jsxFileName,
            lineNumber: 9
          },
          __self: this
        }, '__self', this),
        _react2.default.createElement(
          _reactBootstrap.Col,
          _defineProperty({
            __source: {
              fileName: _jsxFileName,
              lineNumber: 10
            },
            __self: this
          }, '__self', this),
          _react2.default.createElement(
            'div',
            _defineProperty({ className: 'sk-cube-grid', __source: {
                fileName: _jsxFileName,
                lineNumber: 11
              },
              __self: this
            }, '__self', this),
            _react2.default.createElement('div', _defineProperty({ className: 'sk-cube sk-cube1', __source: {
                fileName: _jsxFileName,
                lineNumber: 12
              },
              __self: this
            }, '__self', this)),
            _react2.default.createElement('div', _defineProperty({ className: 'sk-cube sk-cube2', __source: {
                fileName: _jsxFileName,
                lineNumber: 13
              },
              __self: this
            }, '__self', this)),
            _react2.default.createElement('div', _defineProperty({ className: 'sk-cube sk-cube3', __source: {
                fileName: _jsxFileName,
                lineNumber: 14
              },
              __self: this
            }, '__self', this)),
            _react2.default.createElement('div', _defineProperty({ className: 'sk-cube sk-cube4', __source: {
                fileName: _jsxFileName,
                lineNumber: 15
              },
              __self: this
            }, '__self', this)),
            _react2.default.createElement('div', _defineProperty({ className: 'sk-cube sk-cube5', __source: {
                fileName: _jsxFileName,
                lineNumber: 16
              },
              __self: this
            }, '__self', this)),
            _react2.default.createElement('div', _defineProperty({ className: 'sk-cube sk-cube6', __source: {
                fileName: _jsxFileName,
                lineNumber: 17
              },
              __self: this
            }, '__self', this)),
            _react2.default.createElement('div', _defineProperty({ className: 'sk-cube sk-cube7', __source: {
                fileName: _jsxFileName,
                lineNumber: 18
              },
              __self: this
            }, '__self', this)),
            _react2.default.createElement('div', _defineProperty({ className: 'sk-cube sk-cube8', __source: {
                fileName: _jsxFileName,
                lineNumber: 19
              },
              __self: this
            }, '__self', this)),
            _react2.default.createElement('div', _defineProperty({ className: 'sk-cube sk-cube9', __source: {
                fileName: _jsxFileName,
                lineNumber: 20
              },
              __self: this
            }, '__self', this))
          )
        )
      );
    }
  }]);

  return Progress;
}(_react.Component);

exports.default = Progress;

/***/ }),

/***/ 577:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
var _jsxFileName = '/Users/timteoh/TimCode/pulangmengundi/resources/assets/js/components/MyCarpoolNeed.js';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _reactDom = __webpack_require__(10);

var _reactDom2 = _interopRequireDefault(_reactDom);

var _api = __webpack_require__(24);

var _api2 = _interopRequireDefault(_api);

var _reactBootstrap = __webpack_require__(13);

var _CarpoolOffer = __webpack_require__(131);

var _CarpoolOffer2 = _interopRequireDefault(_CarpoolOffer);

var _CarpoolNeed = __webpack_require__(132);

var _CarpoolNeed2 = _interopRequireDefault(_CarpoolNeed);

var _ContactModal = __webpack_require__(133);

var _ContactModal2 = _interopRequireDefault(_ContactModal);

var _reactIntl = __webpack_require__(17);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var MyCarpoolNeedMyCarpoolNeed = function (_Component) {
  _inherits(MyCarpoolNeedMyCarpoolNeed, _Component);

  function MyCarpoolNeedMyCarpoolNeed(props) {
    _classCallCheck(this, MyCarpoolNeedMyCarpoolNeed);

    var _this = _possibleConstructorReturn(this, (MyCarpoolNeedMyCarpoolNeed.__proto__ || Object.getPrototypeOf(MyCarpoolNeedMyCarpoolNeed)).call(this, props));

    _this.state = {
      offers: null,
      need: null,
      showContactModal: false,
      selectedUser: {}
    };
    _this.handleContactUser = _this.handleContactUser.bind(_this);
    _this.handleNeedSuccess = _this.handleNeedSuccess.bind(_this);
    _this.handleCancelNeed = _this.handleCancelNeed.bind(_this);
    return _this;
  }

  _createClass(MyCarpoolNeedMyCarpoolNeed, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this2 = this;

      _api2.default.getNeed().then(function (need) {
        _this2.setState({
          need: need
        }, function () {
          _api2.default.getLocationMatches().then(function (_ref) {
            var offers = _ref.offers;

            _this2.setState({
              offers: offers
            });
          });
        });
      });
    }
  }, {
    key: 'handleContactUser',
    value: function handleContactUser(user) {
      this.setState({
        selectedUser: user,
        showContactModal: true
      });
    }
  }, {
    key: 'handleNeedSuccess',
    value: function handleNeedSuccess() {
      _api2.default.needSuccess(this.state.need.id).then(function () {
        window.location.reload();
      });
    }
  }, {
    key: 'handleCancelNeed',
    value: function handleCancelNeed() {
      _api2.default.cancelNeed(this.state.need.id).then(function () {
        window.location.reload();
      });
    }
  }, {
    key: 'render',
    value: function render() {
      var _this3 = this;

      return _react2.default.createElement(
        'div',
        _defineProperty({
          __source: {
            fileName: _jsxFileName,
            lineNumber: 60
          },
          __self: this
        }, '__self', this),
        _react2.default.createElement(
          'div',
          _defineProperty({ className: 'container', __source: {
              fileName: _jsxFileName,
              lineNumber: 61
            },
            __self: this
          }, '__self', this),
          _react2.default.createElement(
            _reactBootstrap.Row,
            _defineProperty({
              __source: {
                fileName: _jsxFileName,
                lineNumber: 62
              },
              __self: this
            }, '__self', this),
            _react2.default.createElement(
              _reactBootstrap.Col,
              _defineProperty({ md: 4, __source: {
                  fileName: _jsxFileName,
                  lineNumber: 63
                },
                __self: this
              }, '__self', this),
              _react2.default.createElement(
                'h3',
                _defineProperty({
                  __source: {
                    fileName: _jsxFileName,
                    lineNumber: 64
                  },
                  __self: this
                }, '__self', this),
                _react2.default.createElement(_reactIntl.FormattedMessage, _defineProperty({
                  id: 'request.header-your-request',
                  defaultMessage: 'Your request',
                  __source: {
                    fileName: _jsxFileName,
                    lineNumber: 65
                  },
                  __self: this
                }, '__self', this))
              ),
              _react2.default.createElement(
                _reactBootstrap.Alert,
                _defineProperty({ bsStyle: 'info', __source: {
                    fileName: _jsxFileName,
                    lineNumber: 70
                  },
                  __self: this
                }, '__self', this),
                _react2.default.createElement(
                  'h4',
                  _defineProperty({
                    __source: {
                      fileName: _jsxFileName,
                      lineNumber: 71
                    },
                    __self: this
                  }, '__self', this),
                  _react2.default.createElement(_reactIntl.FormattedMessage, _defineProperty({
                    id: 'request.header-do-what',
                    defaultMessage: 'What should I do now?',
                    __source: {
                      fileName: _jsxFileName,
                      lineNumber: 72
                    },
                    __self: this
                  }, '__self', this))
                ),
                _react2.default.createElement(
                  'p',
                  _defineProperty({
                    __source: {
                      fileName: _jsxFileName,
                      lineNumber: 77
                    },
                    __self: this
                  }, '__self', this),
                  _react2.default.createElement(_reactIntl.FormattedHTMLMessage, _defineProperty({
                    id: 'request.do-what-1',
                    defaultMessage: 'You may be contacted by drivers going the same way. If you enabled Facebook as a method of contact, do <strong>actively</strong> check your Friend requests and messages',
                    __source: {
                      fileName: _jsxFileName,
                      lineNumber: 78
                    },
                    __self: this
                  }, '__self', this))
                ),
                _react2.default.createElement(
                  'p',
                  _defineProperty({
                    __source: {
                      fileName: _jsxFileName,
                      lineNumber: 83
                    },
                    __self: this
                  }, '__self', this),
                  _react2.default.createElement(_reactIntl.FormattedMessage, _defineProperty({
                    id: 'request.do-what-2',
                    defaultMessage: 'We may send you emails periodically to tell you of new matches.',
                    __source: {
                      fileName: _jsxFileName,
                      lineNumber: 84
                    },
                    __self: this
                  }, '__self', this))
                ),
                _react2.default.createElement(
                  'p',
                  _defineProperty({
                    __source: {
                      fileName: _jsxFileName,
                      lineNumber: 89
                    },
                    __self: this
                  }, '__self', this),
                  _react2.default.createElement(_reactIntl.FormattedHTMLMessage, _defineProperty({
                    id: 'request.do-what-3',
                    defaultMessage: 'Check out the <strong><a href=\'/\'>main page</a></strong> as well to search for drivers.',
                    __source: {
                      fileName: _jsxFileName,
                      lineNumber: 90
                    },
                    __self: this
                  }, '__self', this))
                )
              ),
              _react2.default.createElement(_CarpoolNeed2.default, _defineProperty({ onNeedSuccess: this.handleNeedSuccess, onNeedCancel: this.handleCancelNeed, need: this.state.need, isOwner: true, __source: {
                  fileName: _jsxFileName,
                  lineNumber: 96
                },
                __self: this
              }, '__self', this))
            ),
            _react2.default.createElement(
              _reactBootstrap.Col,
              _defineProperty({ md: 8, __source: {
                  fileName: _jsxFileName,
                  lineNumber: 98
                },
                __self: this
              }, '__self', this),
              _react2.default.createElement(
                'h3',
                _defineProperty({
                  __source: {
                    fileName: _jsxFileName,
                    lineNumber: 99
                  },
                  __self: this
                }, '__self', this),
                _react2.default.createElement(_reactIntl.FormattedMessage, _defineProperty({
                  id: 'request.header-matches',
                  defaultMessage: 'Your matches',
                  __source: {
                    fileName: _jsxFileName,
                    lineNumber: 100
                  },
                  __self: this
                }, '__self', this))
              ),
              _react2.default.createElement(
                _reactBootstrap.Panel,
                _defineProperty({
                  __source: {
                    fileName: _jsxFileName,
                    lineNumber: 105
                  },
                  __self: this
                }, '__self', this),
                _react2.default.createElement(
                  _reactBootstrap.Panel.Body,
                  _defineProperty({
                    __source: {
                      fileName: _jsxFileName,
                      lineNumber: 106
                    },
                    __self: this
                  }, '__self', this),
                  this.state.offers && this.state.offers.length == 0 && _react2.default.createElement(
                    _reactBootstrap.Alert,
                    _defineProperty({ bsStyle: 'info', __source: {
                        fileName: _jsxFileName,
                        lineNumber: 108
                      },
                      __self: this
                    }, '__self', this),
                    _react2.default.createElement(
                      'p',
                      _defineProperty({
                        __source: {
                          fileName: _jsxFileName,
                          lineNumber: 109
                        },
                        __self: this
                      }, '__self', this),
                      _react2.default.createElement(_reactIntl.FormattedMessage, _defineProperty({
                        id: 'request.no-match',
                        defaultMessage: 'There is no one matching your travel locations. Check back later!',
                        __source: {
                          fileName: _jsxFileName,
                          lineNumber: 110
                        },
                        __self: this
                      }, '__self', this))
                    ),
                    _react2.default.createElement(
                      'p',
                      _defineProperty({
                        __source: {
                          fileName: _jsxFileName,
                          lineNumber: 115
                        },
                        __self: this
                      }, '__self', this),
                      _react2.default.createElement(_reactIntl.FormattedMessage, _defineProperty({
                        id: 'request.we-try',
                        defaultMessage: 'We will try to match you with anyone travelling from the same states.',
                        __source: {
                          fileName: _jsxFileName,
                          lineNumber: 116
                        },
                        __self: this
                      }, '__self', this))
                    )
                  ),
                  _react2.default.createElement(
                    _reactBootstrap.Grid,
                    _defineProperty({ fluid: true, __source: {
                        fileName: _jsxFileName,
                        lineNumber: 123
                      },
                      __self: this
                    }, '__self', this),
                    this.state.offers && this.state.offers.length > 0 && this.state.offers.map(function (offer, i) {
                      return _react2.default.createElement(
                        _reactBootstrap.Col,
                        _defineProperty({ key: i, md: 6, __source: {
                            fileName: _jsxFileName,
                            lineNumber: 125
                          },
                          __self: _this3
                        }, '__self', _this3),
                        _react2.default.createElement(_CarpoolOffer2.default, _defineProperty({ onContact: _this3.handleContactUser, offer: offer, __source: {
                            fileName: _jsxFileName,
                            lineNumber: 126
                          },
                          __self: _this3
                        }, '__self', _this3))
                      );
                    })
                  )
                )
              ),
              this.state.showContactModal && _react2.default.createElement(_ContactModal2.default, _defineProperty({ show: this.state.showContactModal, user: this.state.selectedUser, onCancel: function onCancel(e) {
                  return _this3.setState({ showContactModal: false });
                }, __source: {
                  fileName: _jsxFileName,
                  lineNumber: 133
                },
                __self: this
              }, '__self', this))
            )
          )
        )
      );
    }
  }]);

  return MyCarpoolNeedMyCarpoolNeed;
}(_react.Component);

exports.default = MyCarpoolNeedMyCarpoolNeed;

/***/ }),

/***/ 578:
/***/ (function(module, exports, __webpack_require__) {

!function(e,a){ true?module.exports=a():"function"==typeof define&&define.amd?define(a):(e.ReactIntlLocaleData=e.ReactIntlLocaleData||{},e.ReactIntlLocaleData.ms=a())}(this,function(){"use strict";return[{locale:"ms",pluralRuleFunction:function(e,a){return a&&1==e?"one":"other"},fields:{year:{displayName:"Tahun",relative:{0:"tahun ini",1:"tahun depan","-1":"tahun lalu"},relativeTime:{future:{other:"dalam {0} saat"},past:{other:"{0} tahun lalu"}}},month:{displayName:"Bulan",relative:{0:"bulan ini",1:"bulan depan","-1":"bulan lalu"},relativeTime:{future:{other:"dalam {0} bulan"},past:{other:"{0} bulan lalu"}}},day:{displayName:"Hari",relative:{0:"hari ini",1:"esok",2:"lusa","-2":"kelmarin","-1":"semalam"},relativeTime:{future:{other:"dalam {0} hari"},past:{other:"{0} hari lalu"}}},hour:{displayName:"Jam",relative:{0:"jam ini"},relativeTime:{future:{other:"dalam {0} jam"},past:{other:"{0} jam lalu"}}},minute:{displayName:"Minit",relative:{0:"pada minit ini"},relativeTime:{future:{other:"dalam {0} minit"},past:{other:"{0} minit lalu"}}},second:{displayName:"Saat",relative:{0:"sekarang"},relativeTime:{future:{other:"dalam {0} saat"},past:{other:"{0} saat lalu"}}}}},{locale:"ms-Arab",pluralRuleFunction:function(e,a){return"other"},fields:{year:{displayName:"Year",relative:{0:"this year",1:"next year","-1":"last year"},relativeTime:{future:{other:"+{0} y"},past:{other:"-{0} y"}}},month:{displayName:"Month",relative:{0:"this month",1:"next month","-1":"last month"},relativeTime:{future:{other:"+{0} m"},past:{other:"-{0} m"}}},day:{displayName:"Day",relative:{0:"today",1:"tomorrow","-1":"yesterday"},relativeTime:{future:{other:"+{0} d"},past:{other:"-{0} d"}}},hour:{displayName:"Hour",relative:{0:"this hour"},relativeTime:{future:{other:"+{0} h"},past:{other:"-{0} h"}}},minute:{displayName:"Minute",relative:{0:"this minute"},relativeTime:{future:{other:"+{0} min"},past:{other:"-{0} min"}}},second:{displayName:"Second",relative:{0:"now"},relativeTime:{future:{other:"+{0} s"},past:{other:"-{0} s"}}}}},{locale:"ms-BN",parentLocale:"ms"},{locale:"ms-SG",parentLocale:"ms"}]});


/***/ }),

/***/ 579:
/***/ (function(module, exports) {

module.exports = {"nav-carpool":"Kongsi Kereta (Carpool)","nav-subsidy":"Tajaan","nav-logout":"Log keluar","nav-faq":"Garis panduan/FAQ","nav-about":"Tentang kami","login.login-to-site":"Log masuk","login.login-1":"Kami memerlukan butiran media sosial anda bagi memastikan semua pengguna boleh dipercayai.","login.login-2":"Ini membantu kami membenteras penipuan dan menjaga keselamatan anda.","login.login-3":"Kami akan menghantar e-mel jika anda berjaya dipadankan dengan pekongsi lain.","login.login-4":"Anda boleh memilih untuk berkongsi butiran akaun media sosial anda dengan bakal pekongsi/penderma bagi <strong>membolehkan mereka</strong> memastikan anda seorang pengguna yang boleh dipercayai (dan kami harap, semua pekongsi akan menjadi rakan-rakan perjalanan yang baik!)","home.jumbotron":"Bersedia untuk #PulangMengundi? Kongsi kos perjalanan. Temui kawan baru. Gunakan perkhidmatan kami untuk dipadankan dengan pengundi-pengundi lain untuk #PulangMengundi!","home.driver-btn":"(Pemandu) Tawarkan kenderaan","home.rider-btn":"(Penumpang) Saya ingin menumpang","home.driver-btn-small":"(Pemandu)<br />Tawarkan kenderaan","home.rider-btn-small":"(Penumpang)<br />Saya ingin menumpang","home.btn-search-from":"Dari manakah perjalanan anda akan bermula?","home.btn-search-clear":"Kosongkan","home.btn-search-to":"Ke manakah akan anda pergi?","home.driver-counter":"Pemandu mahu berkongsi kenderaan","home.rider-counter":"Penumpang ingin berkongsi","match.no-results":"Tiada keputusan","request.travel-from-header":"Berlepas dari","request.voting-at-header":"Mengundi di","request.gender-header":"Jantina","request.btn-close-cancel":"Tutup/batal","request.fulfilled":"Permintaan dipenuhi =)","request.travel-to-header":"Berlepas dari","request.travelling-time":"Masa","request.gender-pref":"Jantina yang diutamakan","request.additional-info":"Maklumat tambahan","request.request-fulfilled":"Permintaan dipenuhi!","request.show-again":"Tunjuk tawaran sekali lagi","request.close-title":"Beritahu kami kenapa anda mengosongkan permintaan anda","request.btn-i-have-matched":"Saya telah dipadankan <br />dengan pekongsi lain!","request.btn-i-dowan":"Saya sudah menukar fikiran/<br/>akan membuat senarai yang baru","request.header-your-request":"Permintaan anda","request.header-do-what":"Apa perlu saya lakukan sekarang?","request.do-what-1":"Anda mungkin akan dihubungi oleh pemandu-pemandu yang akan pergi ke tempat yang sama. Jika anda gunakan Facebook sebagai medium perhubungan, sila periksa permintaan berkawan (friend request) serta mesej baru.","request.do-what-2":"Kami akan e-mel anda untuk memberitahu akan padanan baru.","request.do-what-3":"Periksa <strong><a href='/'>laman utama</a></strong> dan cari pemandu.","request.header-matches":"Padanan anda","request.no-match":"Tiada orang berjaya dipadankan. Periksa kembali nanti!","request.we-try":"Kami akan berusaha untuk memadankan anda dengan sesiapa yang berasal daripada negeri yang sama.","request.header-update":"Kemas kini permintaan berkongsi anda","request.header-create":"Ingin berkongsi kenderaan","request.create-info-1":"Isikan lokasi, destinasi dan jantina anda. Kemudian hantar tawaran anda ke database kami.","request.create-info-2":"Anda akan dapat mencari pemandu yang akan pergi ke tempat yang sama.","request.header-i-from":"Saya berada di","request.header-i-going":"Saya mengundi di","request.header-my-gender":"Jantina saya ialah","request.gender-value-male":"Lelaki","request.gender-value-female":"Perempuan","request.create-header-more-info":"Maklumat tambahan","request.create-header-what-to-show":"Maklumat yang akan dipaparkan kepada padanan","request.info-choose-what-to-show":"Pilih sekurang-kurangnya saya opsyen di bawah. Anda boleh berkongsi nombor telefon jika mahu. Butiran anda akan dikongsi dengan pengguna yang berjaya berlepasi ujian captcha.","request.info-choose-what-to-show-fb":"Jika anda pilih untuk berkongsi akaun Facebook, sila jawab meseg FB dengan segera!","request.checkbox-show-email":"Tunjukkan alamat e-mel.","request.checkbox-show-fb":"Tunjukkan alamat akaun Facebook","request.checkbox-show-contact":"Tunjukkan nombor saya:","request.btn-update":"Kemas kini permintaan","request.btn-save":"Simpan permintaan","request.dialog-header-confirm":"Sahkan permintaan","request.dialog-header-submit-question":"Hantar permintaan?","request.dialog-info-1":"Anda akan dapat melihat pekongsi-pekongsi lain yang akan ke tempat yang sama.","btn-edit":"Tukar","btn-contact":"Hubungi","btn-close-offer":"Padam tawaran","btn-cancel":"Batal","contact.after-open-dialog-header":"Apa yang perlu dilakukan?","contact.click-to-show-text":"Klik di sini untuk mendapatkan butiran {name}","contact.prevent-abuse":"Untuk menghalang sebarang salahguna, anda akan disekat jika mendapatkan terlampau banyak profil pengguna-pengguna lain.","contact.after-show-1":"Hubungi pekongsi dan uruskan perjalanan anda! Tip-tip keselamatan:","contact.after-show-2":"Kongsi butiran kenalan (contohnya nombor telefon)","contact.after-show-3":"Pastikan pekongsi lain boleh dipercayai (buat panggilan video)","contact.after-show-4":"Kongsi maklumat perjalanan anda dengan rakan-rakan, ahli keluarga serta pekongsi-pekongsi yang lain","contact.header-email-address":"Alamat e-mel {name}","contact.header-contact":"Nombor telefon {name}","contact.header-fb-profile":"Profil Facebook {name}","contact.btn-open-fb-profile":"Profil (browser baru akan dibuka)","contact.header-how-to-contact":"Bagaimanakah saya menghubungi seseorang di Facebook?","contact.fb-blocks-msgs":"Kerana Facebook menyekat mesej-mesej baru, cuba hubungi pengguna yang dipadankan dengan cara berikut:","contact.fb-step-1":"1. Hantar permintaan berkawan (friend request).","contact.fb-step-2":"2. Hantar mesej Facebook dan kenalkan diri anda","contact.fb-step-3":"Mereka akan terima notifikasi dalam Facebook Messenger bersama dengan pengenalan anda.","contact.btn-close":"Tutup","offer.header-close-why":"Sila nyatakan kenapa anda memadamkan tawaran anda","offer.btn-close-success":"Saya berjaya dipadankan <br/>dengan pekongsi lain!","offer.btn-cancel-delete":"Saya menukar fikiran/<br/>Saya akan membuat penyenaraian baru","offer.header-your-offers":"Perkongsian anda menawar","offer.header-do-what":"Apa perlu saya lakukan sekarang?","offer.do-what-1":"Anda mungkin dihubungi oleh bakal penumpang. Jika anda pilih untuk memaparkan akaun Facebook anda, sila jawab segala mesej dengan pantas!","offer.do-what-2":"Jika anda ada tawaran yang belum dijawab, kami akan menghantar e-mel untuk memberitahu anda tentang padanan baru.","offer.header-matches":"Padanan anda","offer.your-matches-info":"Semua penumpang yang dipadankan dengan anda dipaparkan di sini. Anda juga boleh periksa <strong><a href='/'>laman utama</a></strong> untuk mencari penumpang.\n\n","offer.no-match-1":"Tiada orang dapat dipadankan dengan lokasi/destinasi anda. Sila tunggu dan periksa nanti!","offer.no-match-2":"Kami akan cuba padankan anda dengan pengguna-pengguna yang akan ke negeri yang sama.","offer.header-create":"Tawar untuk berkongsi kenderaan","offer.create-info":"Nyatakan dari mana akan anda berlepas serta destinasi anda. Kemudian isikan masa berlepas untuk sekurang-kurangnya <strong>satu</strong> hala.","offer.header-gender-prev":"I lebih gemar berkongsi kenderaan dengan","offer.gender-pref-any":"Semua orang","offer.gender-pref-male":"Lelaki sahaja","offer.gender-pref-female":"Perempuan sahaja","offer.checkbox-carpool-to":"Saya ingin berkongsi kenderaan untuk PERGI mengundi","offer.info-from-time":"Saya akan berlepas {from} ke {to} pada:","offer.checkbox-carpool-back":"Saya ingin berkongsi kenderaan kembali SELEPAS mengundi","offer.info-come-back-time":"Saya akan berlepas {from} ke {to} pada:","offer.btn-submit":"Hantar tawaran","offer.dialog-header-confirm":"Muktamadkan tawaran perkongsian kenderaan","offer.dialog-header-submit-question":"Hantarkan tawaran perkongsian kenderaan?","offer.info-warning":"Nama, lokasi dan masa anda akan dipaparkan kepada pengguna-pengguna yang akan mengundi di daerah/negeri anda.","offer.dialog-leave-generic":"Saya berlepas pada","offer.dialog-hide-question":"Sembunyikan tawaran?","offer.warning-undo-hidden-public":"Ini akan membuatkan tawaran anda dapat dilihat oleh semua pengguna.","btn-ok":"OK"}

/***/ }),

/***/ 73:
/***/ (function(module, exports, __webpack_require__) {

var ctx = __webpack_require__(33);
var call = __webpack_require__(169);
var isArrayIter = __webpack_require__(170);
var anObject = __webpack_require__(30);
var toLength = __webpack_require__(57);
var getIterFn = __webpack_require__(106);
var BREAK = {};
var RETURN = {};
var exports = module.exports = function (iterable, entries, fn, that, ITERATOR) {
  var iterFn = ITERATOR ? function () { return iterable; } : getIterFn(iterable);
  var f = ctx(fn, that, entries ? 2 : 1);
  var index = 0;
  var length, step, iterator, result;
  if (typeof iterFn != 'function') throw TypeError(iterable + ' is not iterable!');
  // fast case for arrays with default iterator
  if (isArrayIter(iterFn)) for (length = toLength(iterable.length); length > index; index++) {
    result = entries ? f(anObject(step = iterable[index])[0], step[1]) : f(iterable[index]);
    if (result === BREAK || result === RETURN) return result;
  } else for (iterator = iterFn.call(iterable); !(step = iterator.next()).done;) {
    result = call(iterator, f, step.value, entries);
    if (result === BREAK || result === RETURN) return result;
  }
};
exports.BREAK = BREAK;
exports.RETURN = RETURN;


/***/ })

},[374]);