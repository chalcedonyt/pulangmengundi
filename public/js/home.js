webpackJsonp([4],{

/***/ 306:
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(307);


/***/ }),

/***/ 307:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _reactDom = __webpack_require__(10);

var _reactDom2 = _interopRequireDefault(_reactDom);

var _reactRouterDom = __webpack_require__(72);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Next, we will create a fresh React component instance and attach it to
 * the page. Then, you may begin adding components to this application
 * or customize the JavaScript scaffolding to fit your unique needs.
 */

window.__BASE_API_URL = '/api';


_reactDom2.default.render(_react2.default.createElement(
  _reactRouterDom.BrowserRouter,
  null,
  _react2.default.createElement(
    'div',
    null,
    _react2.default.createElement(_reactRouterDom.Switch, null)
  )
), document.getElementById('home'));

/***/ })

},[306]);