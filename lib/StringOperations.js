"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * StringOperations is a library class that providers static helpers to work with strings
 */
var StringOperations = /** @class */ (function () {
    function StringOperations() {
    }
    /**
     * Returns a copy of the string without alphanumeric characters.
     *
     * @method removeNonAlphaNumericChars
     * @param {string} str
     * @return {string}
     * @example
     *   StringOperations.removeNonAlphaNumericChars('#Foo!') // Foo
     */
    StringOperations.removeNonAlphaNumericChars = function (str) {
        return str.replace(/\W/g, '');
    };
    /**
     * Returns a copy of the string with capitalized first character.
     *
     * @method capitalize
     * @param {string} str
     * @return {string}
     * @example
     *   StringOperations.capitalize('hey') // Hey
     */
    StringOperations.capitalize = function (str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    };
    return StringOperations;
}());
exports.StringOperations = StringOperations;
