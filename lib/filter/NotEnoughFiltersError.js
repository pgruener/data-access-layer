"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotEnoughFiltersError = void 0;
/**
 * An instance of NotEnoughFiltersError is created and thrown, if a {@link DataProviderConfig} tries to compute
 * an url, but not all neccessary information could be derived through filters.
 *
 * @class NotEnoughFiltersError
 * @see DataProviderConfig
 */
var NotEnoughFiltersError = /** @class */ (function () {
    function NotEnoughFiltersError(errorMessage) {
        this.error = new Error(errorMessage);
    }
    NotEnoughFiltersError.prototype.toString = function () {
        this.error.message;
    };
    return NotEnoughFiltersError;
}());
exports.NotEnoughFiltersError = NotEnoughFiltersError;
