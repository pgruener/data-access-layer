"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var FilterRuleIn_1 = require("./FilterRuleIn");
var FilterRuleMarker_1 = require("./FilterRuleMarker");
var DataCollection_1 = require("../DataCollection");
/**
 * FilterMarkings are used to detect, which relevant properties are already used in the url or payload as data,
 * so all other filters *may* be appended to the url.
 *
 * @class FilterMarking
 * @see DataProviderConfig
 */
var FilterMarking = /** @class */ (function () {
    function FilterMarking(collection) {
        var _this = this;
        this.filterRuleMarkers = [];
        var filterCollection = (collection instanceof DataCollection_1.DataCollection) ? collection.filterCollection : collection;
        if (filterCollection) {
            filterCollection.filterRules.forEach(function (filterRule) {
                _this.filterRuleMarkers.push(new FilterRuleMarker_1.FilterRuleMarker(filterRule));
            });
        }
    }
    /**
     * Returns all {@link FilterRule|FilterRules} in a {@link FilterMarker} for a given property.
     *
     * @method filterMarkersForProperty
     * @param {string} propertyName
     * @param {(filterRule:FilterRule<Object>) => boolean} filterCallback
     * @return {FilterRuleMarker<FilterRule<Object>>[]}
     */
    FilterMarking.prototype.filterMarkersForProperty = function (propertyName, filterCallback) {
        return this.filterRuleMarkers.filter(function (filterRuleMarker) {
            if (filterRuleMarker.filterRule.propertyName != propertyName) {
                return false;
            }
            return (filterCallback) ? filterCallback(filterRuleMarker.filterRule) : true;
        });
    };
    /**
     * Returns a {@link FilterRuleMarker} with all {@link FileRuleIn|FileRuleIns} for a given property name.
     *
     * @method findInFilter
     * @param {string} propertyName
     * @returns {FilterRuleMarker<FilterRuleIn<Object>>[]}
     */
    FilterMarking.prototype.findInFilter = function (propertyName) {
        return this.filterMarkersForProperty(propertyName, this.isFilterRuleIn);
    };
    /**
     * Detects, if given FilterRule is instance of FilterRuleIn
     *
     * @method isFilterRuleIn
     * @param {FilterRule} filterRule
     */
    FilterMarking.prototype.isFilterRuleIn = function (filterRule) {
        return filterRule instanceof FilterRuleIn_1.FilterRuleIn;
    };
    /**
     * Returns all {@link FilterRule|FilterRules} that are not marked as used.
     *
     * @method getUnusedFilters
     * @returns {FilterRule<Object>[]}
     */
    FilterMarking.prototype.getUnusedFilters = function () {
        return this.filterRuleMarkers.filter(function (filterRuleMarker) {
            return !filterRuleMarker.used;
        }).map(function (filterRuleMarker) { return filterRuleMarker.filterRule; });
    };
    return FilterMarking;
}());
exports.FilterMarking = FilterMarking;
