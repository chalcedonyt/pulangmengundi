webpackJsonp([2],{

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

/***/ 32:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _SocialLoginButton = __webpack_require__(585);

var _SocialLoginButton2 = _interopRequireDefault(_SocialLoginButton);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var SocialLoginButtonProvider = function SocialLoginButtonProvider(_ref) {
    var defaults = _ref.defaults,
        props = _ref.props;

    var finalProps = _extends({}, defaults, props, {
        style: _extends({}, defaults.style, props.style),
        activeStyle: _extends({}, defaults.activeStyle, props.activeStyle)
    });
    // console.log('provider:', {defaults, props}, {finalProps});
    return _react2.default.createElement(_SocialLoginButton2.default, finalProps);
};

exports.default = SocialLoginButtonProvider;

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

/***/ 578:
/***/ (function(module, exports, __webpack_require__) {

!function(e,a){ true?module.exports=a():"function"==typeof define&&define.amd?define(a):(e.ReactIntlLocaleData=e.ReactIntlLocaleData||{},e.ReactIntlLocaleData.ms=a())}(this,function(){"use strict";return[{locale:"ms",pluralRuleFunction:function(e,a){return a&&1==e?"one":"other"},fields:{year:{displayName:"Tahun",relative:{0:"tahun ini",1:"tahun depan","-1":"tahun lalu"},relativeTime:{future:{other:"dalam {0} saat"},past:{other:"{0} tahun lalu"}}},month:{displayName:"Bulan",relative:{0:"bulan ini",1:"bulan depan","-1":"bulan lalu"},relativeTime:{future:{other:"dalam {0} bulan"},past:{other:"{0} bulan lalu"}}},day:{displayName:"Hari",relative:{0:"hari ini",1:"esok",2:"lusa","-2":"kelmarin","-1":"semalam"},relativeTime:{future:{other:"dalam {0} hari"},past:{other:"{0} hari lalu"}}},hour:{displayName:"Jam",relative:{0:"jam ini"},relativeTime:{future:{other:"dalam {0} jam"},past:{other:"{0} jam lalu"}}},minute:{displayName:"Minit",relative:{0:"pada minit ini"},relativeTime:{future:{other:"dalam {0} minit"},past:{other:"{0} minit lalu"}}},second:{displayName:"Saat",relative:{0:"sekarang"},relativeTime:{future:{other:"dalam {0} saat"},past:{other:"{0} saat lalu"}}}}},{locale:"ms-Arab",pluralRuleFunction:function(e,a){return"other"},fields:{year:{displayName:"Year",relative:{0:"this year",1:"next year","-1":"last year"},relativeTime:{future:{other:"+{0} y"},past:{other:"-{0} y"}}},month:{displayName:"Month",relative:{0:"this month",1:"next month","-1":"last month"},relativeTime:{future:{other:"+{0} m"},past:{other:"-{0} m"}}},day:{displayName:"Day",relative:{0:"today",1:"tomorrow","-1":"yesterday"},relativeTime:{future:{other:"+{0} d"},past:{other:"-{0} d"}}},hour:{displayName:"Hour",relative:{0:"this hour"},relativeTime:{future:{other:"+{0} h"},past:{other:"-{0} h"}}},minute:{displayName:"Minute",relative:{0:"this minute"},relativeTime:{future:{other:"+{0} min"},past:{other:"-{0} min"}}},second:{displayName:"Second",relative:{0:"now"},relativeTime:{future:{other:"+{0} s"},past:{other:"-{0} s"}}}}},{locale:"ms-BN",parentLocale:"ms"},{locale:"ms-SG",parentLocale:"ms"}]});


/***/ }),

/***/ 579:
/***/ (function(module, exports) {

module.exports = {"nav-carpool":"Kongsi Kereta (Carpool)","nav-subsidy":"Tajaan","nav-logout":"Log keluar","nav-faq":"Garis panduan/FAQ","nav-about":"Tentang kami","login.login-to-site":"Log masuk","login.login-1":"Kami memerlukan butiran media sosial anda bagi memastikan semua pengguna boleh dipercayai.","login.login-2":"Ini membantu kami membenteras penipuan dan menjaga keselamatan anda.","login.login-3":"Kami akan menghantar e-mel jika anda berjaya dipadankan dengan pekongsi lain.","login.login-4":"Anda boleh memilih untuk berkongsi butiran akaun media sosial anda dengan bakal pekongsi/penderma bagi <strong>membolehkan mereka</strong> memastikan anda seorang pengguna yang boleh dipercayai (dan kami harap, semua pekongsi akan menjadi rakan-rakan perjalanan yang baik!)","home.jumbotron":"Bersedia untuk #PulangMengundi? Kongsi kos perjalanan. Temui kawan baru. Gunakan perkhidmatan kami untuk dipadankan dengan pengundi-pengundi lain untuk #PulangMengundi!","home.driver-btn":"(Pemandu) Tawarkan kenderaan","home.rider-btn":"(Penumpang) Saya ingin menumpang","home.driver-btn-small":"(Pemandu)<br />Tawarkan kenderaan","home.rider-btn-small":"(Penumpang)<br />Saya ingin menumpang","home.btn-search-from":"Dari manakah perjalanan anda akan bermula?","home.btn-search-clear":"Kosongkan","home.btn-search-to":"Ke manakah akan anda pergi?","home.driver-counter":"Pemandu mahu berkongsi kenderaan","home.rider-counter":"Penumpang ingin berkongsi","match.no-results":"Tiada keputusan","request.travel-from-header":"Berlepas dari","request.voting-at-header":"Mengundi di","request.gender-header":"Jantina","request.btn-close-cancel":"Tutup/batal","request.fulfilled":"Permintaan dipenuhi =)","request.travel-to-header":"Berlepas dari","request.travelling-time":"Masa","request.gender-pref":"Jantina yang diutamakan","request.additional-info":"Maklumat tambahan","request.request-fulfilled":"Permintaan dipenuhi!","request.show-again":"Tunjuk tawaran sekali lagi","request.close-title":"Beritahu kami kenapa anda mengosongkan permintaan anda","request.btn-i-have-matched":"Saya telah dipadankan <br />dengan pekongsi lain!","request.btn-i-dowan":"Saya sudah menukar fikiran/<br/>akan membuat senarai yang baru","request.header-your-request":"Permintaan anda","request.header-do-what":"Apa perlu saya lakukan sekarang?","request.do-what-1":"Anda mungkin akan dihubungi oleh pemandu-pemandu yang akan pergi ke tempat yang sama. Jika anda gunakan Facebook sebagai medium perhubungan, sila periksa permintaan berkawan (friend request) serta mesej baru.","request.do-what-2":"Kami akan e-mel anda untuk memberitahu akan padanan baru.","request.do-what-3":"Periksa <strong><a href='/'>laman utama</a></strong> dan cari pemandu.","request.header-matches":"Padanan anda","request.no-match":"Tiada orang berjaya dipadankan. Periksa kembali nanti!","request.we-try":"Kami akan berusaha untuk memadankan anda dengan sesiapa yang berasal daripada negeri yang sama.","request.header-update":"Kemas kini permintaan berkongsi anda","request.header-create":"Ingin berkongsi kenderaan","request.create-info-1":"Isikan lokasi, destinasi dan jantina anda. Kemudian hantar tawaran anda ke database kami.","request.create-info-2":"Anda akan dapat mencari pemandu yang akan pergi ke tempat yang sama.","request.header-i-from":"Saya berada di","request.header-i-going":"Saya mengundi di","request.header-my-gender":"Jantina saya ialah","request.gender-value-male":"Lelaki","request.gender-value-female":"Perempuan","request.create-header-more-info":"Maklumat tambahan","request.create-header-what-to-show":"Maklumat yang akan dipaparkan kepada padanan","request.info-choose-what-to-show":"Pilih sekurang-kurangnya saya opsyen di bawah. Anda boleh berkongsi nombor telefon jika mahu. Butiran anda akan dikongsi dengan pengguna yang berjaya berlepasi ujian captcha.","request.info-choose-what-to-show-fb":"Jika anda pilih untuk berkongsi akaun Facebook, sila jawab meseg FB dengan segera!","request.checkbox-show-email":"Tunjukkan alamat e-mel.","request.checkbox-show-fb":"Tunjukkan alamat akaun Facebook","request.checkbox-show-contact":"Tunjukkan nombor saya:","request.btn-update":"Kemas kini permintaan","request.btn-save":"Simpan permintaan","request.dialog-header-confirm":"Sahkan permintaan","request.dialog-header-submit-question":"Hantar permintaan?","request.dialog-info-1":"Anda akan dapat melihat pekongsi-pekongsi lain yang akan ke tempat yang sama.","btn-edit":"Tukar","btn-contact":"Hubungi","btn-close-offer":"Padam tawaran","btn-cancel":"Batal","contact.after-open-dialog-header":"Apa yang perlu dilakukan?","contact.click-to-show-text":"Klik di sini untuk mendapatkan butiran {name}","contact.prevent-abuse":"Untuk menghalang sebarang salahguna, anda akan disekat jika mendapatkan terlampau banyak profil pengguna-pengguna lain.","contact.after-show-1":"Hubungi pekongsi dan uruskan perjalanan anda! Tip-tip keselamatan:","contact.after-show-2":"Kongsi butiran kenalan (contohnya nombor telefon)","contact.after-show-3":"Pastikan pekongsi lain boleh dipercayai (buat panggilan video)","contact.after-show-4":"Kongsi maklumat perjalanan anda dengan rakan-rakan, ahli keluarga serta pekongsi-pekongsi yang lain","contact.header-email-address":"Alamat e-mel {name}","contact.header-contact":"Nombor telefon {name}","contact.header-fb-profile":"Profil Facebook {name}","contact.btn-open-fb-profile":"Profil (browser baru akan dibuka)","contact.header-how-to-contact":"Bagaimanakah saya menghubungi seseorang di Facebook?","contact.fb-blocks-msgs":"Kerana Facebook menyekat mesej-mesej baru, cuba hubungi pengguna yang dipadankan dengan cara berikut:","contact.fb-step-1":"1. Hantar permintaan berkawan (friend request).","contact.fb-step-2":"2. Hantar mesej Facebook dan kenalkan diri anda","contact.fb-step-3":"Mereka akan terima notifikasi dalam Facebook Messenger bersama dengan pengenalan anda.","contact.btn-close":"Tutup","offer.header-close-why":"Sila nyatakan kenapa anda memadamkan tawaran anda","offer.btn-close-success":"Saya berjaya dipadankan <br/>dengan pekongsi lain!","offer.btn-cancel-delete":"Saya menukar fikiran/<br/>Saya akan membuat penyenaraian baru","offer.header-your-offers":"Perkongsian anda menawar","offer.header-do-what":"Apa perlu saya lakukan sekarang?","offer.do-what-1":"Anda mungkin dihubungi oleh bakal penumpang. Jika anda pilih untuk memaparkan akaun Facebook anda, sila jawab segala mesej dengan pantas!","offer.do-what-2":"Jika anda ada tawaran yang belum dijawab, kami akan menghantar e-mel untuk memberitahu anda tentang padanan baru.","offer.header-matches":"Padanan anda","offer.your-matches-info":"Semua penumpang yang dipadankan dengan anda dipaparkan di sini. Anda juga boleh periksa <strong><a href='/'>laman utama</a></strong> untuk mencari penumpang.\n\n","offer.no-match-1":"Tiada orang dapat dipadankan dengan lokasi/destinasi anda. Sila tunggu dan periksa nanti!","offer.no-match-2":"Kami akan cuba padankan anda dengan pengguna-pengguna yang akan ke negeri yang sama.","offer.header-create":"Tawar untuk berkongsi kenderaan","offer.create-info":"Nyatakan dari mana akan anda berlepas serta destinasi anda. Kemudian isikan masa berlepas untuk sekurang-kurangnya <strong>satu</strong> hala.","offer.header-gender-prev":"I lebih gemar berkongsi kenderaan dengan","offer.gender-pref-any":"Semua orang","offer.gender-pref-male":"Lelaki sahaja","offer.gender-pref-female":"Perempuan sahaja","offer.checkbox-carpool-to":"Saya ingin berkongsi kenderaan untuk PERGI mengundi","offer.info-from-time":"Saya akan berlepas {from} ke {to} pada:","offer.checkbox-carpool-back":"Saya ingin berkongsi kenderaan kembali SELEPAS mengundi","offer.info-come-back-time":"Saya akan berlepas {from} ke {to} pada:","offer.btn-submit":"Hantar tawaran","offer.dialog-header-confirm":"Muktamadkan tawaran perkongsian kenderaan","offer.dialog-header-submit-question":"Hantarkan tawaran perkongsian kenderaan?","offer.info-warning":"Nama, lokasi dan masa anda akan dipaparkan kepada pengguna-pengguna yang akan mengundi di daerah/negeri anda.","offer.dialog-leave-generic":"Saya berlepas pada","offer.dialog-hide-question":"Sembunyikan tawaran?","offer.warning-undo-hidden-public":"Ini akan membuatkan tawaran anda dapat dilihat oleh semua pengguna.","btn-ok":"OK"}

/***/ }),

/***/ 580:
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(581);


/***/ }),

/***/ 581:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _jsxFileName = '/Users/timteoh/TimCode/pulangmengundi/resources/assets/js/login.js';

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _reactDom = __webpack_require__(10);

var _reactDom2 = _interopRequireDefault(_reactDom);

var _reactSocialLoginButtons = __webpack_require__(582);

var _reactBootstrap = __webpack_require__(13);

var _reactIntl = __webpack_require__(17);

var _ms = __webpack_require__(578);

var _ms2 = _interopRequireDefault(_ms);

var _bm = __webpack_require__(579);

var _bm2 = _interopRequireDefault(_bm);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } } /**
                                                                                                                                                                                                     * Next, we will create a fresh React component instance and attach it to
                                                                                                                                                                                                     * the page. Then, you may begin adding components to this application
                                                                                                                                                                                                     * or customize the JavaScript scaffolding to fit your unique needs.
                                                                                                                                                                                                     */

(0, _reactIntl.addLocaleData)([].concat(_toConsumableArray(_ms2.default)));

var messages = {
  'ms': _bm2.default
};
var language = window.locale || navigator.language.split(/[-_]/)[0]; // language without region code

_reactDom2.default.render(_react2.default.createElement(
  _reactIntl.IntlProvider,
  _defineProperty({ locale: language, messages: messages[language], __source: {
      fileName: _jsxFileName,
      lineNumber: 24
    },
    __self: undefined
  }, '__self', undefined),
  _react2.default.createElement(
    _reactBootstrap.Grid,
    _defineProperty({ fluid: true, __source: {
        fileName: _jsxFileName,
        lineNumber: 25
      },
      __self: undefined
    }, '__self', undefined),
    _react2.default.createElement(
      _reactBootstrap.Row,
      _defineProperty({
        __source: {
          fileName: _jsxFileName,
          lineNumber: 26
        },
        __self: undefined
      }, '__self', undefined),
      _react2.default.createElement(
        _reactBootstrap.Col,
        _defineProperty({ md: 6, mdOffset: 3, xs: 12, __source: {
            fileName: _jsxFileName,
            lineNumber: 27
          },
          __self: undefined
        }, '__self', undefined),
        _react2.default.createElement(
          _reactBootstrap.Panel,
          _defineProperty({
            __source: {
              fileName: _jsxFileName,
              lineNumber: 28
            },
            __self: undefined
          }, '__self', undefined),
          _react2.default.createElement(
            _reactBootstrap.Panel.Heading,
            _defineProperty({
              __source: {
                fileName: _jsxFileName,
                lineNumber: 29
              },
              __self: undefined
            }, '__self', undefined),
            _react2.default.createElement(_reactIntl.FormattedMessage, _defineProperty({
              id: 'login.login-to-site',
              defaultMessage: 'Login to',
              __source: {
                fileName: _jsxFileName,
                lineNumber: 30
              },
              __self: undefined
            }, '__self', undefined)),
            ' ',
            _react2.default.createElement(
              'strong',
              _defineProperty({
                __source: {
                  fileName: _jsxFileName,
                  lineNumber: 33
                },
                __self: undefined
              }, '__self', undefined),
              'carpool.pulangmengundi.com'
            )
          ),
          _react2.default.createElement(
            _reactBootstrap.Panel.Body,
            _defineProperty({
              __source: {
                fileName: _jsxFileName,
                lineNumber: 35
              },
              __self: undefined
            }, '__self', undefined),
            _react2.default.createElement(
              _reactBootstrap.Alert,
              _defineProperty({ bsStyle: 'info', __source: {
                  fileName: _jsxFileName,
                  lineNumber: 36
                },
                __self: undefined
              }, '__self', undefined),
              _react2.default.createElement(
                'p',
                _defineProperty({ className: 'lead', __source: {
                    fileName: _jsxFileName,
                    lineNumber: 37
                  },
                  __self: undefined
                }, '__self', undefined),
                _react2.default.createElement(_reactIntl.FormattedMessage, _defineProperty({
                  id: 'login.login-1',
                  defaultMessage: 'We need your social media login to determine that you are a real person.',
                  __source: {
                    fileName: _jsxFileName,
                    lineNumber: 38
                  },
                  __self: undefined
                }, '__self', undefined)),
                _react2.default.createElement(
                  'strong',
                  _defineProperty({
                    __source: {
                      fileName: _jsxFileName,
                      lineNumber: 42
                    },
                    __self: undefined
                  }, '__self', undefined),
                  _react2.default.createElement(_reactIntl.FormattedMessage, _defineProperty({
                    id: 'login.login-2',
                    defaultMessage: 'This helps prevent fraud and helps keep our users safe.',
                    __source: {
                      fileName: _jsxFileName,
                      lineNumber: 43
                    },
                    __self: undefined
                  }, '__self', undefined))
                )
              ),
              _react2.default.createElement('br', _defineProperty({
                __source: {
                  fileName: _jsxFileName,
                  lineNumber: 49
                },
                __self: undefined
              }, '__self', undefined)),
              _react2.default.createElement('br', _defineProperty({
                __source: {
                  fileName: _jsxFileName,
                  lineNumber: 49
                },
                __self: undefined
              }, '__self', undefined)),
              _react2.default.createElement(
                'p',
                _defineProperty({ className: 'lead', __source: {
                    fileName: _jsxFileName,
                    lineNumber: 50
                  },
                  __self: undefined
                }, '__self', undefined),
                _react2.default.createElement(_reactIntl.FormattedMessage, _defineProperty({
                  id: 'login.login-3',
                  defaultMessage: 'We will also send you email updates should a suitable driver/rider be found for you.',
                  __source: {
                    fileName: _jsxFileName,
                    lineNumber: 51
                  },
                  __self: undefined
                }, '__self', undefined))
              ),
              _react2.default.createElement('br', _defineProperty({
                __source: {
                  fileName: _jsxFileName,
                  lineNumber: 56
                },
                __self: undefined
              }, '__self', undefined)),
              _react2.default.createElement('br', _defineProperty({
                __source: {
                  fileName: _jsxFileName,
                  lineNumber: 56
                },
                __self: undefined
              }, '__self', undefined)),
              _react2.default.createElement(
                'p',
                _defineProperty({ className: 'lead', __source: {
                    fileName: _jsxFileName,
                    lineNumber: 57
                  },
                  __self: undefined
                }, '__self', undefined),
                _react2.default.createElement(_reactIntl.FormattedHTMLMessage, _defineProperty({
                  id: 'login.login-4',
                  defaultMessage: 'You may choose to share the link to your social media account with potential carpoolers / donors so that <strong>they are empowered</strong> to verify who you are (and hopefully determine that you will be a good roadtrip companion/voter!)',
                  __source: {
                    fileName: _jsxFileName,
                    lineNumber: 58
                  },
                  __self: undefined
                }, '__self', undefined))
              )
            ),
            _react2.default.createElement(_reactSocialLoginButtons.FacebookLoginButton, _defineProperty({ onClick: function onClick(e) {
                window.location = '/facebook/login';
              }, __source: {
                fileName: _jsxFileName,
                lineNumber: 64
              },
              __self: undefined
            }, '__self', undefined)),
            location.href.indexOf('localhost') !== -1 && _react2.default.createElement(_reactSocialLoginButtons.GoogleLoginButton, _defineProperty({ onClick: function onClick(e) {
                window.location = '/google/login';
              }, __source: {
                fileName: _jsxFileName,
                lineNumber: 66
              },
              __self: undefined
            }, '__self', undefined))
          )
        )
      )
    )
  )
), document.getElementById('login'));

/***/ }),

/***/ 582:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = __webpack_require__(583);

/***/ }),

/***/ 583:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _FacebookLoginButton = __webpack_require__(584);

Object.defineProperty(exports, 'FacebookLoginButton', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_FacebookLoginButton).default;
  }
});

var _GoogleLoginButton = __webpack_require__(587);

Object.defineProperty(exports, 'GoogleLoginButton', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_GoogleLoginButton).default;
  }
});

var _GithubLoginButton = __webpack_require__(588);

Object.defineProperty(exports, 'GithubLoginButton', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_GithubLoginButton).default;
  }
});

var _TwitterLoginButton = __webpack_require__(589);

Object.defineProperty(exports, 'TwitterLoginButton', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_TwitterLoginButton).default;
  }
});

var _AmazonLoginButton = __webpack_require__(590);

Object.defineProperty(exports, 'AmazonLoginButton', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_AmazonLoginButton).default;
  }
});

var _InstagramLoginButton = __webpack_require__(591);

Object.defineProperty(exports, 'InstagramLoginButton', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_InstagramLoginButton).default;
  }
});

var _LinkedInLoginButton = __webpack_require__(592);

Object.defineProperty(exports, 'LinkedInLoginButton', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_LinkedInLoginButton).default;
  }
});

var _MicrosoftLoginButton = __webpack_require__(593);

Object.defineProperty(exports, 'MicrosoftLoginButton', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_MicrosoftLoginButton).default;
  }
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/***/ }),

/***/ 584:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _SocialLoginButtonProvider = __webpack_require__(32);

var _SocialLoginButtonProvider2 = _interopRequireDefault(_SocialLoginButtonProvider);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var defaults = {
    text: 'Login with Facebook',
    icon: 'facebook-official',
    style: { background: "#3b5998" },
    activeStyle: { background: "#293e69" }
};
/**
 * Facebook login button.
 * For props check {@link SocialLoginButton}
 * @extends {SocialLoginButton}
 */
var FacebookLoginButton = function FacebookLoginButton(props) {
    return _react2.default.createElement(_SocialLoginButtonProvider2.default, { defaults: defaults, props: props });
};

exports.default = FacebookLoginButton;

/***/ }),

/***/ 585:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _class, _temp;

var _propTypes = __webpack_require__(2);

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

__webpack_require__(586);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Icon = function Icon(_ref) {
    var name = _ref.name,
        _ref$size = _ref.size,
        size = _ref$size === undefined ? 26 : _ref$size,
        _ref$format = _ref.format,
        format = _ref$format === undefined ? function (name) {
        return 'demo-icon icon-' + name;
    } : _ref$format;
    return _react2.default.createElement('i', { className: format(name),
        style: { fontSize: size } });
};

var SocialLoginButton = (_temp = _class = function (_Component) {
    _inherits(SocialLoginButton, _Component);

    function SocialLoginButton() {
        var _ref2;

        _classCallCheck(this, SocialLoginButton);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        var _this = _possibleConstructorReturn(this, (_ref2 = SocialLoginButton.__proto__ || Object.getPrototypeOf(SocialLoginButton)).call.apply(_ref2, [this].concat(args)));

        _this.state = { hovered: false };

        _this.handleMouseEnter = _this.handleMouseEnter.bind(_this);
        _this.handleMouseLeave = _this.handleMouseLeave.bind(_this);
        _this.handleClick = _this.handleClick.bind(_this);
        return _this;
    }

    _createClass(SocialLoginButton, [{
        key: 'handleMouseEnter',
        value: function handleMouseEnter() {
            this.setState({ hovered: true });
        }
    }, {
        key: 'handleMouseLeave',
        value: function handleMouseLeave() {
            this.setState({ hovered: false });
        }
    }, {
        key: 'handleClick',
        value: function handleClick() {
            if (typeof this.props.onClick === 'function') {
                this.props.onClick();
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var _props = this.props,
                customStyle = _props.style,
                activeStyle = _props.activeStyle,
                children = _props.children,
                _props$text = _props.text,
                text = _props$text === undefined ? children : _props$text,
                icon = _props.icon,
                iconFormat = _props.iconFormat,
                _props$iconSize = _props.iconSize,
                iconSize = _props$iconSize === undefined ? '26px' : _props$iconSize,
                _props$size = _props.size,
                size = _props$size === undefined ? '50px' : _props$size,
                _props$textAlign = _props.textAlign,
                textAlign = _props$textAlign === undefined ? 'left' : _props$textAlign;
            var hovered = this.state.hovered;


            var buttonStyles = _extends({}, styles.button, {
                lineHeight: typeof text === 'string' ? size : 'auto',
                height: size,
                textAlign: textAlign
            }, customStyle, hovered && activeStyle);

            var childrenCount = _react2.default.Children.count(children);

            // classic usage of this button
            if (childrenCount === 0) {
                return _react2.default.createElement(
                    'div',
                    { style: buttonStyles, onClick: this.handleClick, onMouseEnter: this.handleMouseEnter,
                        onMouseLeave: this.handleMouseLeave },
                    icon && _react2.default.createElement(
                        'span',
                        { style: _extends({}, styles.icon, { height: size, lineHeight: size }) },
                        _react2.default.createElement(Icon, { name: icon, size: iconSize, format: iconFormat })
                    ),
                    _react2.default.createElement(
                        'span',
                        null,
                        text
                    )
                );
            }

            // children provided, rendering children as text
            return _react2.default.createElement(
                'div',
                { style: buttonStyles, onClick: this.handleClick, onMouseEnter: this.handleMouseEnter,
                    onMouseLeave: this.handleMouseLeave },
                _react2.default.createElement('span', { style: styles.spanFix }),
                text
            );
        }
    }]);

    return SocialLoginButton;
}(_react.Component), _class.propTypes = {

    /** Will be triggered when clicked on the button. */
    onClick: _propTypes2.default.func,

    /** Custom button styles */
    style: _propTypes2.default.object,

    /** activeStyle styles will be applied instead of style when mouse hovers above the element */
    activeStyle: _propTypes2.default.object,

    /** This text will be displayed */
    text: _propTypes2.default.string,

    /** This icon will be displayed */
    icon: _propTypes2.default.string,

    /** Box will have this size */
    size: _propTypes2.default.string,

    /** Icon will have this size. Eg. 26px */
    iconSize: _propTypes2.default.string,

    /** Format icon className. Eg. (name) => `fa-icon fa-icon-${name}` */
    iconFormat: _propTypes2.default.func,

    /** Text alignment of the button. Default 'left' */
    textAlign: _propTypes2.default.oneOf(['left', 'right', 'center'])
}, _temp);
exports.default = SocialLoginButton;


var styles = {
    spanFix: {
        height: '100%', display: 'inline-block', verticalAlign: 'middle'
    },
    button: {
        fontSize: '120%',
        color: '#ffffff',
        margin: 5,
        cursor: 'pointer',
        boxShadow: '#b5b5b5 0 1px 2px',
        borderRadius: 3,
        userSelect: 'none',
        overflow: 'hidden',
        padding: '0 10px'
    },
    icon: {
        paddingRight: '10px',
        float: 'left'
    }
};

/***/ }),

/***/ 586:
/***/ (function(module, exports) {

/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = "data:application/vnd.ms-fontobject;base64,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sAgjQiAgIEYjR7ABKyNhOC2wOSywABawAyWwAiVHI0cjYbAAVFguIDwjIRuwAiWwAiVHI0cjYSCwBSWwBCVHI0cjYbAGJbAFJUmwAiVhuQgACABjYyMgWGIbIVljuAQAYiCwAFBYsEBgWWawAWNgIy4jICA8ijgjIVktsDossAAWILAIQyAuRyNHI2EgYLAgYGawAmIgsABQWLBAYFlmsAFjIyAgPIo4LbA7LCMgLkawAiVGUlggPFkusSsBFCstsDwsIyAuRrACJUZQWCA8WS6xKwEUKy2wPSwjIC5GsAIlRlJYIDxZIyAuRrACJUZQWCA8WS6xKwEUKy2wPiywNSsjIC5GsAIlRlJYIDxZLrErARQrLbA/LLA2K4ogIDywBCNCijgjIC5GsAIlRlJYIDxZLrErARQrsARDLrArKy2wQCywABawBCWwBCYgLkcjRyNhsAlDKyMgPCAuIzixKwEUKy2wQSyxCAQlQrAAFrAEJbAEJSAuRyNHI2EgsAQjQrAJQysgsGBQWCCwQFFYswIgAyAbswImAxpZQkIjIEewBEOwAmIgsABQWLBAYFlmsAFjYCCwASsgiophILACQ2BkI7ADQ2FkUFiwAkNhG7ADQ2BZsAMlsAJiILAAUFiwQGBZZrABY2GwAiVGYTgjIDwjOBshICBGI0ewASsjYTghWbErARQrLbBCLLA1Ky6xKwEUKy2wQyywNishIyAgPLAEI0IjOLErARQrsARDLrArKy2wRCywABUgR7AAI0KyAAEBFRQTLrAxKi2wRSywABUgR7AAI0KyAAEBFRQTLrAxKi2wRiyxAAEUE7AyKi2wRyywNCotsEgssAAWRSMgLiBGiiNhOLErARQrLbBJLLAII0KwSCstsEossgAAQSstsEsssgABQSstsEwssgEAQSstsE0ssgEBQSstsE4ssgAAQistsE8ssgABQistsFAssgEAQistsFEssgEBQistsFIssgAAPistsFMssgABPistsFQssgEAPistsFUssgEBPistsFYssgAAQCstsFcssgABQCstsFgssgEAQCstsFkssgEBQCstsFossgAAQystsFsssgABQystsFwssgEAQystsF0ssgEBQystsF4ssgAAPystsF8ssgABPystsGAssgEAPystsGEssgEBPystsGIssDcrLrErARQrLbBjLLA3K7A7Ky2wZCywNyuwPCstsGUssAAWsDcrsD0rLbBmLLA4Ky6xKwEUKy2wZyywOCuwOystsGgssDgrsDwrLbBpLLA4K7A9Ky2waiywOSsusSsBFCstsGsssDkrsDsrLbBsLLA5K7A8Ky2wbSywOSuwPSstsG4ssDorLrErARQrLbBvLLA6K7A7Ky2wcCywOiuwPCstsHEssDorsD0rLbByLLMJBAIDRVghGyMhWUIrsAhlsAMkUHiwARUwLQBLuADIUlixAQGOWbABuQgACABjcLEABUKyAAEAKrEABUKzCgIBCCqxAAVCsw4AAQgqsQAGQroCwAABAAkqsQAHQroAQAABAAkqsQMARLEkAYhRWLBAiFixA2REsSYBiFFYugiAAAEEQIhjVFixAwBEWVlZWbMMAgEMKrgB/4WwBI2xAgBEAAA="

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(2);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(8)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../../node_modules/css-loader/index.js!./social-login-font.css", function() {
			var newContent = require("!!../../../node_modules/css-loader/index.js!./social-login-font.css");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(3)(undefined);
// imports


// module
exports.push([module.i, "@font-face {\r\n  font-family: 'social-login-font';\r\n  src: url(" + __webpack_require__(0) + ");\r\n  src: url(" + __webpack_require__(0) + "#iefix) format('embedded-opentype'),\r\n       url(" + __webpack_require__(4) + ") format('woff2'),\r\n       url(" + __webpack_require__(5) + ") format('woff'),\r\n       url(" + __webpack_require__(6) + ") format('truetype'),\r\n       url(" + __webpack_require__(7) + "#social-login-font) format('svg');\r\n  font-weight: normal;\r\n  font-style: normal;\r\n}\r\n/* Chrome hack: SVG is rendered more smooth in Windozze. 100% magic, uncomment if you need it. */\r\n/* Note, that will break hinting! In other OS-es font will be not as sharp as it could be */\r\n/*\r\n@media screen and (-webkit-min-device-pixel-ratio:0) {\r\n  @font-face {\r\n    font-family: 'social-login-font';\r\n    src: url('../font/social-login-font.svg?96078194#social-login-font') format('svg');\r\n  }\r\n}\r\n*/\r\n \r\n [class^=\"icon-\"]:before, [class*=\" icon-\"]:before {\r\n  font-family: \"social-login-font\";\r\n  font-style: normal;\r\n  font-weight: normal;\r\n  speak: none;\r\n \r\n  display: inline-block;\r\n  text-decoration: inherit;\r\n  width: 1em;\r\n  margin-right: .2em;\r\n  text-align: center;\r\n  /* opacity: .8; */\r\n \r\n  /* For safety - reset parent styles, that can break glyph codes*/\r\n  font-variant: normal;\r\n  text-transform: none;\r\n \r\n  /* fix buttons height, for twitter bootstrap */\r\n  line-height: 1em;\r\n \r\n  /* Animation center compensation - margins should be symmetric */\r\n  /* remove if not needed */\r\n  margin-left: .2em;\r\n \r\n  /* you can be more comfortable with increased icons size */\r\n  /* font-size: 120%; */\r\n \r\n  /* Font smoothing. That was taken from TWBS */\r\n  -webkit-font-smoothing: antialiased;\r\n  -moz-osx-font-smoothing: grayscale;\r\n \r\n  /* Uncomment for 3D effect */\r\n  /* text-shadow: 1px 1px 1px rgba(127, 127, 127, 0.3); */\r\n}\r\n \r\n.icon-twitter:before { content: '\\F099'; } /* '' */\r\n.icon-github-circled:before { content: '\\F09B'; } /* '' */\r\n.icon-gplus:before { content: '\\F0D5'; } /* '' */\r\n.icon-linkedin:before { content: '\\F0E1'; } /* '' */\r\n.icon-instagram:before { content: '\\F16D'; } /* '' */\r\n.icon-windows:before { content: '\\F17A'; } /* '' */\r\n.icon-vkontakte:before { content: '\\F189'; } /* '' */\r\n.icon-facebook-official:before { content: '\\F230'; } /* '' */\r\n.icon-amazon:before { content: '\\F270'; } /* '' */", ""]);

// exports


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
module.exports = function (useSourceMap) {
	var list = [];

	// return the list of modules as css string
	list.toString = function toString() {
		return this.map(function (item) {
			var content = cssWithMappingToString(item, useSourceMap);
			if (item[2]) {
				return "@media " + item[2] + "{" + content + "}";
			} else {
				return content;
			}
		}).join("");
	};

	// import a list of modules into the list
	list.i = function (modules, mediaQuery) {
		if (typeof modules === "string") modules = [[null, modules, ""]];
		var alreadyImportedModules = {};
		for (var i = 0; i < this.length; i++) {
			var id = this[i][0];
			if (typeof id === "number") alreadyImportedModules[id] = true;
		}
		for (i = 0; i < modules.length; i++) {
			var item = modules[i];
			// skip already imported module
			// this implementation is not 100% perfect for weird media query combinations
			//  when a module is imported multiple times with different media queries.
			//  I hope this will never occur (Hey this way we have smaller bundles)
			if (typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
				if (mediaQuery && !item[2]) {
					item[2] = mediaQuery;
				} else if (mediaQuery) {
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
			return '/*# sourceURL=' + cssMapping.sourceRoot + source + ' */';
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
/* 4 */
/***/ (function(module, exports) {

module.exports = "data:application/font-woff2;base64,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"

/***/ }),
/* 5 */
/***/ (function(module, exports) {

module.exports = "data:application/font-woff;base64,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"

/***/ }),
/* 6 */
/***/ (function(module, exports) {

module.exports = "data:application/x-font-ttf;base64,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WCA8WS6xKwEUKy2wPSwjIC5GsAIlRlJYIDxZIyAuRrACJUZQWCA8WS6xKwEUKy2wPiywNSsjIC5GsAIlRlJYIDxZLrErARQrLbA/LLA2K4ogIDywBCNCijgjIC5GsAIlRlJYIDxZLrErARQrsARDLrArKy2wQCywABawBCWwBCYgLkcjRyNhsAlDKyMgPCAuIzixKwEUKy2wQSyxCAQlQrAAFrAEJbAEJSAuRyNHI2EgsAQjQrAJQysgsGBQWCCwQFFYswIgAyAbswImAxpZQkIjIEewBEOwAmIgsABQWLBAYFlmsAFjYCCwASsgiophILACQ2BkI7ADQ2FkUFiwAkNhG7ADQ2BZsAMlsAJiILAAUFiwQGBZZrABY2GwAiVGYTgjIDwjOBshICBGI0ewASsjYTghWbErARQrLbBCLLA1Ky6xKwEUKy2wQyywNishIyAgPLAEI0IjOLErARQrsARDLrArKy2wRCywABUgR7AAI0KyAAEBFRQTLrAxKi2wRSywABUgR7AAI0KyAAEBFRQTLrAxKi2wRiyxAAEUE7AyKi2wRyywNCotsEgssAAWRSMgLiBGiiNhOLErARQrLbBJLLAII0KwSCstsEossgAAQSstsEsssgABQSstsEwssgEAQSstsE0ssgEBQSstsE4ssgAAQistsE8ssgABQistsFAssgEAQistsFEssgEBQistsFIssgAAPistsFMssgABPistsFQssgEAPistsFUssgEBPistsFYssgAAQCstsFcssgABQCstsFgssgEAQCstsFkssgEBQCstsFossgAAQystsFsssgABQystsFwssgEAQystsF0ssgEBQystsF4ssgAAPystsF8ssgABPystsGAssgEAPystsGEssgEBPystsGIssDcrLrErARQrLbBjLLA3K7A7Ky2wZCywNyuwPCstsGUssAAWsDcrsD0rLbBmLLA4Ky6xKwEUKy2wZyywOCuwOystsGgssDgrsDwrLbBpLLA4K7A9Ky2waiywOSsusSsBFCstsGsssDkrsDsrLbBsLLA5K7A8Ky2wbSywOSuwPSstsG4ssDorLrErARQrLbBvLLA6K7A7Ky2wcCywOiuwPCstsHEssDorsD0rLbByLLMJBAIDRVghGyMhWUIrsAhlsAMkUHiwARUwLQBLuADIUlixAQGOWbABuQgACABjcLEABUKyAAEAKrEABUKzCgIBCCqxAAVCsw4AAQgqsQAGQroCwAABAAkqsQAHQroAQAABAAkqsQMARLEkAYhRWLBAiFixA2REsSYBiFFYugiAAAEEQIhjVFixAwBEWVlZWbMMAgEMKrgB/4WwBI2xAgBEAAA="

/***/ }),
/* 7 */
/***/ (function(module, exports) {

module.exports = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/Pg0KPCFET0NUWVBFIHN2ZyBQVUJMSUMgIi0vL1czQy8vRFREIFNWRyAxLjEvL0VOIiAiaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkIj4NCjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4NCjxtZXRhZGF0YT5Db3B5cmlnaHQgKEMpIDIwMTcgYnkgb3JpZ2luYWwgYXV0aG9ycyBAIGZvbnRlbGxvLmNvbTwvbWV0YWRhdGE+DQo8ZGVmcz4NCjxmb250IGlkPSJzb2NpYWwtbG9naW4tZm9udCIgaG9yaXotYWR2LXg9IjEwMDAiID4NCjxmb250LWZhY2UgZm9udC1mYW1pbHk9InNvY2lhbC1sb2dpbi1mb250IiBmb250LXdlaWdodD0iNDAwIiBmb250LXN0cmV0Y2g9Im5vcm1hbCIgdW5pdHMtcGVyLWVtPSIxMDAwIiBhc2NlbnQ9Ijg1MCIgZGVzY2VudD0iLTE1MCIgLz4NCjxtaXNzaW5nLWdseXBoIGhvcml6LWFkdi14PSIxMDAwIiAvPg0KPGdseXBoIGdseXBoLW5hbWU9InR3aXR0ZXIiIHVuaWNvZGU9IiYjeGYwOTk7IiBkPSJNOTA0IDYyMnEtMzctNTQtOTAtOTMgMC04IDAtMjMgMC03My0yMS0xNDV0LTY0LTEzOS0xMDMtMTE3LTE0NC04Mi0xODEtMzBxLTE1MSAwLTI3NiA4MSAxOS0yIDQzLTIgMTI2IDAgMjI0IDc3LTU5IDEtMTA1IDM2dC02NCA4OXExOS0zIDM0LTMgMjQgMCA0OCA2LTYzIDEzLTEwNCA2MnQtNDEgMTE1djJxMzgtMjEgODItMjMtMzcgMjUtNTkgNjR0LTIyIDg2cTAgNDkgMjUgOTEgNjgtODMgMTY0LTEzM3QyMDgtNTVxLTUgMjEtNSA0MSAwIDc1IDUzIDEyN3QxMjcgNTNxNzkgMCAxMzItNTcgNjEgMTIgMTE1IDQ0LTIxLTY0LTgwLTEwMCA1MiA2IDEwNCAyOHoiIGhvcml6LWFkdi14PSI5MjguNiIgLz4NCg0KPGdseXBoIGdseXBoLW5hbWU9ImdpdGh1Yi1jaXJjbGVkIiB1bmljb2RlPSImI3hmMDliOyIgZD0iTTQyOSA3NzlxMTE2IDAgMjE1LTU4dDE1Ni0xNTYgNTctMjE1cTAtMTQwLTgyLTI1MnQtMjExLTE1NXEtMTUtMy0yMiA0dC03IDE3cTAgMSAwIDQzdDAgNzVxMCA1NC0yOSA3OSAzMiAzIDU3IDEwdDUzIDIyIDQ1IDM3IDMwIDU4IDExIDg0cTAgNjctNDQgMTE1IDIxIDUxLTQgMTE0LTE2IDUtNDYtNnQtNTEtMjVsLTIxLTEzcS01MiAxNS0xMDcgMTV0LTEwOC0xNXEtOCA2LTIzIDE1dC00NyAyMi00NyA3cS0yNS02My01LTExNC00NC00OC00NC0xMTUgMC00NyAxMi04M3QyOS01OSA0NS0zNyA1Mi0yMiA1Ny0xMHEtMjEtMjAtMjctNTgtMTItNS0yNS04dC0zMi0zLTM2IDEyLTMxIDM1cS0xMSAxOC0yNyAyOXQtMjggMTRsLTExIDFxLTEyIDAtMTYtMnQtMy03IDUtOCA3LTZsNC0zcTEyLTYgMjQtMjF0MTgtMjlsNi0xM3E3LTIxIDI0LTM0dDM3LTE3IDM5LTMgMzEgMWwxMyAzcTAtMjIgMC01MHQxLTMwcTAtMTAtOC0xN3QtMjItNHEtMTI5IDQzLTIxMSAxNTV0LTgyIDI1MnEwIDExNyA1OCAyMTV0MTU1IDE1NiAyMTYgNTh6IG0tMjY3LTYxNnEyIDQtMyA3LTYgMS04LTEtMS00IDQtNyA1LTMgNyAxeiBtMTgtMTlxNCAzLTEgOS02IDUtOSAyLTQtMyAxLTkgNS02IDktMnogbTE2LTI1cTYgNCAwIDExLTQgNy05IDMtNS0zIDAtMTB0OS00eiBtMjQtMjNxNCA0LTIgMTAtNyA3LTExIDItNS01IDItMTEgNi02IDExLTF6IG0zMi0xNHExIDYtOCA5LTggMi0xMC00dDctOXE4LTMgMTEgNHogbTM1LTNxMCA3LTEwIDYtOSAwLTktNiAwLTcgMTAtNiA5IDAgOSA2eiBtMzIgNXEtMSA3LTEwIDUtOS0xLTgtOHQxMC00IDggN3oiIGhvcml6LWFkdi14PSI4NTcuMSIgLz4NCg0KPGdseXBoIGdseXBoLW5hbWU9ImdwbHVzIiB1bmljb2RlPSImI3hmMGQ1OyIgZD0iTTgwMiAzNDFxMC0xMTctNDktMjA3dC0xMzgtMTQyLTIwNi01MXEtODMgMC0xNTkgMzJ0LTEzMSA4Ny04NyAxMzEtMzIgMTU5IDMyIDE1OSA4NyAxMzEgMTMxIDg3IDE1OSAzMnExNjAgMCAyNzQtMTA3bC0xMTEtMTA3cS02NSA2My0xNjMgNjMtNjkgMC0xMjctMzR0LTkyLTk0LTM0LTEzMCAzNC0xMzAgOTItOTQgMTI3LTM0cTQ2IDAgODUgMTN0NjQgMzIgNDQgNDMgMjcgNDcgMTIgNDFoLTIzMnYxNDFoMzg2cTctMzYgNy02OHogbTQ4NCA2OHYtMTE4aC0xMTd2LTExNmgtMTE3djExNmgtMTE3djExOGgxMTd2MTE2aDExN3YtMTE2aDExN3oiIGhvcml6LWFkdi14PSIxMjg1LjciIC8+DQoNCjxnbHlwaCBnbHlwaC1uYW1lPSJsaW5rZWRpbiIgdW5pY29kZT0iJiN4ZjBlMTsiIGQ9Ik0xOTUgNTAxdi01NTNoLTE4NHY1NTNoMTg0eiBtMTIgMTcxcTAtNDEtMjktNjh0LTc1LTI3aC0xcS00NiAwLTc0IDI3dC0yOCA2OHEwIDQxIDI5IDY4dDc1IDI3IDc0LTI3IDI5LTY4eiBtNjUwLTQwN3YtMzE3aC0xODN2Mjk2cTAgNTktMjMgOTJ0LTcxIDMzcS0zNSAwLTU4LTE5dC0zNi00OHEtNi0xNy02LTQ1di0zMDloLTE4NHExIDIyMyAxIDM2MXQwIDE2NWwtMSAyN2gxODR2LTgwaC0xcTExIDE4IDIzIDMxdDMxIDI5IDQ5IDI0IDY0IDlxOTUgMCAxNTMtNjN0NTgtMTg2eiIgaG9yaXotYWR2LXg9Ijg1Ny4xIiAvPg0KDQo8Z2x5cGggZ2x5cGgtbmFtZT0iaW5zdGFncmFtIiB1bmljb2RlPSImI3hmMTZkOyIgZD0iTTU3MSAzNTBxMCA1OS00MSAxMDF0LTEwMSA0Mi0xMDEtNDItNDItMTAxIDQyLTEwMSAxMDEtNDIgMTAxIDQyIDQxIDEwMXogbTc3IDBxMC05MS02NC0xNTZ0LTE1NS02NC0xNTYgNjQtNjQgMTU2IDY0IDE1NiAxNTYgNjQgMTU1LTY0IDY0LTE1NnogbTYxIDIyOXEwLTIxLTE1LTM2dC0zNy0xNS0zNiAxNS0xNSAzNiAxNSAzNiAzNiAxNSAzNy0xNSAxNS0zNnogbS0yODAgMTIzcS00IDAtNDMgMHQtNTkgMC01NC0yLTU3LTUtNDAtMTFxLTI4LTExLTQ5LTMydC0zMy00OXEtNi0xNi0xMC00MHQtNi01OC0xLTUzIDAtNTkgMC00MyAwLTQzIDAtNTkgMS01MyA2LTU4IDEwLTQwcTEyLTI4IDMzLTQ5dDQ5LTMycTE2LTYgNDAtMTF0NTctNSA1NC0yIDU5IDAgNDMgMCA0MiAwIDU5IDAgNTQgMiA1OCA1IDM5IDExcTI4IDExIDUwIDMydDMyIDQ5cTYgMTYgMTAgNDB0NiA1OCAxIDUzIDAgNTkgMCA0MyAwIDQzIDAgNTktMSA1My02IDU4LTEwIDQwcS0xMSAyOC0zMiA0OXQtNTAgMzJxLTE2IDYtMzkgMTF0LTU4IDUtNTQgMi01OSAwLTQyIDB6IG00MjgtMzUycTAtMTI4LTMtMTc3LTUtMTE2LTY5LTE4MHQtMTc5LTY5cS01MC0zLTE3Ny0zdC0xNzcgM3EtMTE2IDYtMTgwIDY5dC02OSAxODBxLTMgNDktMyAxNzd0MyAxNzdxNSAxMTYgNjkgMTgwdDE4MCA2OXE0OSAzIDE3NyAzdDE3Ny0zcTExNi02IDE3OS02OXQ2OS0xODBxMy00OSAzLTE3N3oiIGhvcml6LWFkdi14PSI4NTcuMSIgLz4NCg0KPGdseXBoIGdseXBoLW5hbWU9IndpbmRvd3MiIHVuaWNvZGU9IiYjeGYxN2E7IiBkPSJNMzgxIDI4OXYtMzY0bC0zODEgNTN2MzExaDM4MXogbTAgNDE0di0zNjdoLTM4MXYzMTV6IG01NDgtNDE0di00MzlsLTUwNyA3MHYzNjloNTA3eiBtMCA0OTB2LTQ0M2gtNTA3djM3M3oiIGhvcml6LWFkdi14PSI5MjguNiIgLz4NCg0KPGdseXBoIGdseXBoLW5hbWU9InZrb250YWt0ZSIgdW5pY29kZT0iJiN4ZjE4OTsiIGQ9Ik0xMDcwIDU2MHExMy0zNi04NC0xNjQtMTMtMTgtMzYtNDgtMjItMjgtMzEtNDB0LTE3LTI3LTctMjQgOC0xOSAxOC0yNCAzMi0zMHEyLTEgMi0yIDc5LTczIDEwNy0xMjMgMi0zIDQtN3Q0LTE1LTEtMTktMTQtMTUtMzMtN2wtMTQyLTNxLTE0LTItMzIgM3QtMjkgMTNsLTExIDZxLTE3IDEyLTM5IDM2dC0zOCA0My0zNCAzMy0zMiA4cS0xIDAtNC0ydC0xMC04LTEyLTE2LTktMjktNC00NHEwLTgtMi0xNXQtNC0xMGwtMi0zcS0xMC0xMS0zMC0xMmgtNjRxLTQwLTMtODEgOXQtNzQgMjktNTcgMzctNDAgMzJsLTE0IDE0cS01IDUtMTUgMTd0LTQwIDUwLTU5IDg1LTY4IDExNy03MyAxNTJxLTQgOS00IDE1dDIgOWwyIDNxOSAxMSAzMiAxMWwxNTMgMXE3LTEgMTMtM3Q5LTVsMy0ycTktNiAxMy0xOCAxMS0yOCAyNi01N3QyMy00Nmw5LTE2cTE2LTM0IDMxLTU4dDI3LTM4IDIzLTIyIDE5LTggMTUgM3ExIDEgMyAzdDcgMTIgNyAyNiA1IDQ2IDAgNjlxLTEgMjMtNSA0MXQtNyAyNmwtNCA2cS0xNCAxOS00NyAyNC04IDIgMyAxNCA4IDEwIDIxIDE3IDI5IDE0IDEzMyAxMyA0Ni0xIDc1LTcgMTItMyAxOS04dDEyLTEzIDUtMTggMi0yNSAwLTMxLTItNDAgMC00NnEwLTYtMS0yM3QwLTI3IDItMjIgNi0yMiAxMy0xNHE0LTEgOS0ydDE1IDYgMjEgMTkgMjkgMzggMzggNjBxMzMgNTggNjAgMTI1IDIgNiA1IDEwdDYgNmwzIDIgMiAxdDggMiAxMSAwbDE2MCAxcTIyIDMgMzYtMXQxNy0xMHoiIGhvcml6LWFkdi14PSIxMDcxLjQiIC8+DQoNCjxnbHlwaCBnbHlwaC1uYW1lPSJmYWNlYm9vay1vZmZpY2lhbCIgdW5pY29kZT0iJiN4ZjIzMDsiIGQ9Ik04MTAgNzc5cTE5IDAgMzMtMTR0MTQtMzR2LTc2MnEwLTIwLTE0LTM0dC0zMy0xNGgtMjE4djMzM2gxMTFsMTYgMTI5aC0xMjd2ODNxMCAzMSAxMyA0NnQ1MSAxNmw2OCAxdjExNXEtMzUgNS0xMDAgNS03NSAwLTEyMS00NHQtNDUtMTI3di05NWgtMTEydi0xMjloMTEydi0zMzNoLTQxMXEtMTkgMC0zMyAxNHQtMTQgMzR2NzYycTAgMjAgMTQgMzR0MzMgMTRoNzYzeiIgaG9yaXotYWR2LXg9Ijg1Ny4xIiAvPg0KDQo8Z2x5cGggZ2x5cGgtbmFtZT0iYW1hem9uIiB1bmljb2RlPSImI3hmMjcwOyIgZD0iTTg2NiAyNnE4IDQgMTQgMnQ2LTEwLTgtMThxLTctOS0yNS0yNXQtNTMtMzgtNzktNDEtMTA1LTMyLTEyOC0xNHEtNjYgMC0xMzIgMTd0LTExNyA0My05NiA1OC03NCA1OS00NyA0OHEtNSA2LTYgMTB0MSA2IDQgNCA3IDEgNi0ycTEwNy02NSAxNjgtOTMgMjE3LTk4IDQ0NS01MCAxMDYgMjIgMjE5IDc1eiBtMTE1IDY1cTYtOSAxLTM5dC0xNS01OHEtMTktNDYtNDgtNjktOS04LTE0LTV0MCAxNHExMSAyNSAyNCA2OHQ0IDU1cS0zIDMtOSA2dC0xNSAzLTE2IDItMjAgMC0xNy0xLTE4LTItMTItMXEtMy0xLTctMXQtNi0xLTUgMC00IDBoLTZ0LTEgMC0xIDFsLTEgMXEtNCA5IDI2IDIzdDU3IDE2cTI2IDQgNjEgMXQ0Mi0xM3ogbS0yMjAgMjQ3cTAtMTggOC0zNnQxOC0zMiAyMS0yNiAxOC0xOGw3LTYtMTI2LTEyNXEtMjMgMjEtNDUgNDJ0LTMyIDMzbC0xMSAxMXEtNiA2LTEzIDE4LTIyLTMzLTU1LTU3dC03MS0zNS03OC0xMy03NyAxMi02NSAzNi00NyA2My0xNyA5MXEwIDQ3IDE2IDg2dDQwIDY1IDU5IDQ2IDY5IDMyIDcyIDE5IDY3IDExIDU1IDN2NzFxMCAzNi0xMSA1NC0xOSAzMC02OCAzMC0zIDAtOS0xdC0yMy02LTMxLTE3LTMxLTMzLTI3LTU0bC0xNjQgMTVxMCAzNCAxMiA2N3QzOCA2MyA2MCA1MyA4NCAzNiAxMDcgMTRxNTUgMCAxMDEtMTR0NzItMzQgNDUtNDcgMjUtNDggNy00MXYtMzI4eiBtLTM3NS0xMnEwLTQ4IDM5LTc0IDM3LTI1IDc4LTEyIDQ3IDE0IDYzIDY4IDggMjUgOCA1N3Y5MHEtMzMtMS02Mi03dC01OS0xOC00OS00MC0xOC02NHoiIGhvcml6LWFkdi14PSIxMDAwIiAvPg0KPC9mb250Pg0KPC9kZWZzPg0KPC9zdmc+"

/***/ }),
/* 8 */
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

var	fixUrls = __webpack_require__(9);

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
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


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
	var fixedCss = css.replace(/url\s*\(((?:[^)(]|\((?:[^)(]+|\([^)(]*\))*\))*)\)/gi, function (fullMatch, origUrl) {
		// strip quotes (if they exist)
		var unquotedOrigUrl = origUrl.trim().replace(/^"(.*)"$/, function (o, $1) {
			return $1;
		}).replace(/^'(.*)'$/, function (o, $1) {
			return $1;
		});

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

/***/ })
/******/ ]);

/***/ }),

/***/ 587:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _SocialLoginButtonProvider = __webpack_require__(32);

var _SocialLoginButtonProvider2 = _interopRequireDefault(_SocialLoginButtonProvider);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var defaults = {
    text: 'Login with Google',
    icon: 'gplus',
    style: { background: '#cb3f22' },
    activeStyle: { background: '#a5331c' }
};

/**
 * Google login button.
 * For props check {@link SocialLoginButton}
 */
var GoogleLoginButton = function GoogleLoginButton(props) {
    return _react2.default.createElement(_SocialLoginButtonProvider2.default, { defaults: defaults, props: props });
};

exports.default = GoogleLoginButton;

/***/ }),

/***/ 588:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _SocialLoginButtonProvider = __webpack_require__(32);

var _SocialLoginButtonProvider2 = _interopRequireDefault(_SocialLoginButtonProvider);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var defaults = {
    text: 'Login with GitHub',
    icon: 'github-circled',
    style: { background: "#333333" },
    activeStyle: { background: '#555555' }
};
/**
 * Github login button.
 * For props check {@link SocialLoginButton}
 */
var GithubLoginButton = function GithubLoginButton(props) {
    return _react2.default.createElement(_SocialLoginButtonProvider2.default, { defaults: defaults, props: props });
};

exports.default = GithubLoginButton;

/***/ }),

/***/ 589:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _SocialLoginButtonProvider = __webpack_require__(32);

var _SocialLoginButtonProvider2 = _interopRequireDefault(_SocialLoginButtonProvider);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var defaults = {
    text: 'Login with Twitter',
    icon: 'twitter',
    style: { background: "#5aa4eb" },
    activeStyle: { background: "#3b82da" }
};

/**
 * Twitter login button.
 * For props check {@link SocialLoginButton}
 */
var TwitterLoginButton = function TwitterLoginButton(props) {
    return _react2.default.createElement(_SocialLoginButtonProvider2.default, { defaults: defaults, props: props });
};

exports.default = TwitterLoginButton;

/***/ }),

/***/ 590:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _SocialLoginButtonProvider = __webpack_require__(32);

var _SocialLoginButtonProvider2 = _interopRequireDefault(_SocialLoginButtonProvider);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var defaults = {
    text: 'Login with Amazon',
    icon: 'amazon',
    style: { background: "#f9ae32" },
    activeStyle: { background: "#ff9f23" }
};

/**
 * Amazon login button.
 * For props check {@link SocialLoginButton}
 */
var AmazonLoginButton = function AmazonLoginButton(props) {
    return _react2.default.createElement(_SocialLoginButtonProvider2.default, { defaults: defaults, props: props });
};

exports.default = AmazonLoginButton;

/***/ }),

/***/ 591:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _SocialLoginButtonProvider = __webpack_require__(32);

var _SocialLoginButtonProvider2 = _interopRequireDefault(_SocialLoginButtonProvider);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var defaults = {
    text: 'Login with Instagram',
    icon: 'instagram',
    style: {
        background: "linear-gradient(to right, rgb(236, 146, 35) 0%, rgb(177, 42, 160) 50%, rgb(105, 14, 224) 100%)"
    },
    activeStyle: {
        background: "linear-gradient(to right, rgb(214, 146, 60) 0%, rgb(160, 11, 143) 50%, rgb(56, 10, 115) 100%)"
    }
};
/**
 * Instagram login button.
 * For props check {@link SocialLoginButton}
 * @extends {SocialLoginButton}
 */
var InstagramLoginButton = function InstagramLoginButton(props) {
    return _react2.default.createElement(_SocialLoginButtonProvider2.default, { defaults: defaults, props: props });
};

exports.default = InstagramLoginButton;

/***/ }),

/***/ 592:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _SocialLoginButtonProvider = __webpack_require__(32);

var _SocialLoginButtonProvider2 = _interopRequireDefault(_SocialLoginButtonProvider);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var defaults = {
    text: 'Login with LinkedIn',
    icon: 'linkedin',
    style: { background: "rgb(26, 129, 185)" },
    activeStyle: { background: "rgb(7, 112, 169)" }
};
/**
 * LinkedIn login button.
 * For props check {@link SocialLoginButton}
 * @extends {SocialLoginButton}
 */
var LinkedInLoginButton = function LinkedInLoginButton(props) {
    return _react2.default.createElement(_SocialLoginButtonProvider2.default, { defaults: defaults, props: props });
};

exports.default = LinkedInLoginButton;

/***/ }),

/***/ 593:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _SocialLoginButtonProvider = __webpack_require__(32);

var _SocialLoginButtonProvider2 = _interopRequireDefault(_SocialLoginButtonProvider);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var defaults = {
    text: 'Login with Microsoft',
    icon: 'windows',
    style: { background: "rgb(50, 159, 253)" },
    activeStyle: { background: "rgb(0, 137, 255)" }
};
/**
 * Microsoft login button.
 * For props check {@link SocialLoginButton}
 * @extends {SocialLoginButton}
 */
var MicrosoftLoginButton = function MicrosoftLoginButton(props) {
    return _react2.default.createElement(_SocialLoginButtonProvider2.default, { defaults: defaults, props: props });
};

exports.default = MicrosoftLoginButton;

/***/ })

},[580]);