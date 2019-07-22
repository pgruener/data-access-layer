"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * An instance of TooManyFiltersError is created and thrown, if a {@link DataProviderConfig} tries to compute
 * an url, but too many information could be derived through filters and decision is ambiguous.
 *
 * @class TooManyFiltersError
 * @see DataProviderConfig
 */
var TooManyFiltersError = /** @class */ (function () {
    function TooManyFiltersError(errorMessage) {
        this.error = new Error(errorMessage);
    }
    TooManyFiltersError.prototype.toString = function () {
        this.error.message;
    };
    return TooManyFiltersError;
}());
exports.TooManyFiltersError = TooManyFiltersError;
