"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * A FilterRule specifies one conrete rule, how to filter data from a {@link DataCollection}.
 * The FilterRules base class offers trivial filtering with value comparison. There are more
 * complicated FilterRules, that inherit from FilterRule. You also can create your own subclass
 * of FilterRule, if neccessary.
 *
 * @class FilterRule
 * @see FilterRuleIn
 * @see FilterRuleMatch
 * @example
 *   new FilterRule('amount', '<', 10)
 */
var FilterRule = /** @class */ (function () {
    function FilterRule(propertyName, comparator, value) {
        var _this = this;
        this.compareFunctions = {
            '<': function (value1, value2) { return value1 < value2; },
            '<=': function (value1, value2) { return value1 <= value2; },
            '>': function (value1, value2) { return value1 > value2; },
            '>=': function (value1, value2) { return value1 >= value2; },
            '==': function (value1, value2) { return value1 == value2; },
            '!=': function (value1, value2) { return value1 != value2; },
        };
        /**
         * Maybe can be optimized by doing this:
         *
         * dataModels.filter((dataModel:DataModel) => {
         *   return this.isInside(dataModel)
         * })
         */
        this.filter = function (dataModels) {
            var filteredModels = [];
            dataModels.forEach(function (dataModel) {
                if (_this.isInside(dataModel)) {
                    filteredModels.push(dataModel);
                }
            });
            return filteredModels;
        };
        this._comparator = comparator;
        this._propertyName = propertyName;
        this._value = value;
        if (typeof comparator == 'string') {
            this.compareFunction = this.compareFunctions[comparator];
        }
        else {
            this.compareFunction = comparator;
        }
    }
    Object.defineProperty(FilterRule.prototype, "comparator", {
        /**
         * Attribute accessor for comparator
         */
        get: function () {
            return this._comparator;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FilterRule.prototype, "value", {
        /**
         * Attribute accessor for value
         */
        get: function () {
            return this._value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FilterRule.prototype, "propertyName", {
        /**
         * Attribute accessor for propertyName
         */
        get: function () {
            return this._propertyName;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Informs, if the dataModel is accepted by the filterRule.
     *
     * @method isInside
     * @param {DataModel} dataModel
     * @returns {boolean}
     */
    FilterRule.prototype.isInside = function (dataModel) {
        var value = dataModel.getPropertyForFilter(this.propertyName);
        return this.compareFunction(value, this.value);
    };
    /**
     * Returns the filterRule as url string to be transmitted to a backend.
     *
     * @method asUrlString
     * @returns {string}
     */
    FilterRule.prototype.asUrlString = function () {
        return "" + this.propertyName + encodeURIComponent(this.comparator.toString()) + encodeURIComponent(this.value.toString());
    };
    return FilterRule;
}());
exports.FilterRule = FilterRule;
