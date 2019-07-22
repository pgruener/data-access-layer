"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var FilterRule_1 = require("./FilterRule");
/**
 * FilterRuleIn is a subclass of {@link FilterRule}. It allows to filter a property with a {@link ValueRange}.
 * Using FilterRuleIn is favored over combining two FilterRules with > and < filter for the same property,
 * because FilterRuleIn's properties can be used in action urls.
 *
 * @class FilterRuleIn
 * @see FilterRule
 * @example
 *   new FilterRuleIn('amount', '<', { startValue: 10, endValue: 20 })
 */
var FilterRuleIn = /** @class */ (function (_super) {
    __extends(FilterRuleIn, _super);
    function FilterRuleIn(propertyName, valueRange) {
        var _this = _super.call(this, propertyName, null, null) || this;
        _this.filter = function (dataModels) {
            return dataModels.filter(function (dataModel) {
                var property = dataModel.getPropertyForFilter(_this.propertyName);
                return property >= _this._valueRange.startValue && property <= _this._valueRange.endValue;
            });
        };
        if (valueRange.startValue > valueRange.endValue) {
            throw new Error("Invalid ValueRange. startValue (" + valueRange.startValue + ") may not be larger than endValue (" + valueRange.endValue + ").");
        }
        _this._valueRange = valueRange;
        return _this;
    }
    Object.defineProperty(FilterRuleIn.prototype, "valueRange", {
        /**
         * Attribute accessor for valueRange
         */
        get: function () {
            return this._valueRange;
        },
        enumerable: true,
        configurable: true
    });
    FilterRuleIn.prototype.asUrlString = function () {
        return encodeURIComponent("in(" + this._propertyName + ", " + this._valueRange.startValue + ", " + this._valueRange.endValue + ")");
    };
    return FilterRuleIn;
}(FilterRule_1.FilterRule));
exports.FilterRuleIn = FilterRuleIn;
