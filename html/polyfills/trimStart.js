/**
 * Method which removes whitespace from the beginning of a string.
 * Source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/trimStart
 */

// eslint-disable-next-line no-extra-semi
;(function (w) {
  var String = w.String,
    Proto = String.prototype
  ;(function (o, p) {
    if (p in o ? (o[p] ? false : true) : true) {
      var r = /^\s+/
      o[p] =
        o.trimLeft ||
        function () {
          return this.replace(r, "")
        }
    }
  })(Proto, "trimStart")
})(window)
