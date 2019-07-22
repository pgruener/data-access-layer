"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 *
 * @class FilterRuleMarker
 * @see FilterMarking
 */
var FilterRuleMarker = /** @class */ (function () {
    function FilterRuleMarker(filterRule) {
        this._used = false;
        this._filterRule = filterRule;
    }
    Object.defineProperty(FilterRuleMarker.prototype, "filterRule", {
        /**
         * Attribute accessor for filterRule
         */
        get: function () {
            return this._filterRule;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FilterRuleMarker.prototype, "used", {
        /**
         * Attribute accesor for used
         */
        get: function () {
            return this._used;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * @method use
     * @return {T} filterRule
     */
    FilterRuleMarker.prototype.use = function () {
        this._used = true;
        return this.filterRule;
    };
    return FilterRuleMarker;
}());
exports.FilterRuleMarker = FilterRuleMarker;
